import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CrisisEvent, CrisisScenario } from '../../entities';
import { CatsService } from '../cats/cats.service';
import { CrisisAiService } from './crisis-ai.service';
import { loadProtocolSlides, matchProtocol } from './protocols';
import { Slide, slidesSchema } from './parsers/markdown-slide.parser';
import {
  CRISIS_STEP_COMPLETED,
  CrisisStepCompletedEvent,
} from '../../common/events/events';
import { IdentifyCrisisDto, CrisisStepDto, ResolveCrisisDto } from './crisis.schema';

const POINTS_PER_STEP = 5;

export interface IdentifyResult {
  eventId: number;
  source: 'rule' | 'ai';
  scenarioKey: string | null;
  slides: Slide[];
}

@Injectable()
export class CrisisService {
  constructor(
    @InjectRepository(CrisisEvent)
    private readonly events: Repository<CrisisEvent>,
    @InjectRepository(CrisisScenario)
    private readonly scenarios: Repository<CrisisScenario>,
    private readonly cats: CatsService,
    private readonly ai: CrisisAiService,
    private readonly emitter: EventEmitter2,
  ) {}

  /** Rule match first; AI fallback only on no match (spec §2.3). */
  async identify(userId: number, dto: IdentifyCrisisDto): Promise<IdentifyResult> {
    await this.cats.findOneForUser(userId, dto.catId); // ownership

    const match = matchProtocol(dto.prompt);
    let scenario: CrisisScenario | null = null;
    let slides: Slide[];
    let source: 'rule' | 'ai';
    let scenarioKey: string | null = null;

    if (match) {
      source = 'rule';
      scenarioKey = match.scenarioKey;
      scenario = await this.scenarios.findOne({
        where: { scenarioKey: match.scenarioKey },
      });
      // prefer seeded protocol_data, else parse the .md file directly
      const seeded = scenario?.protocolData as { slides?: Slide[] } | undefined;
      slides =
        seeded?.slides && seeded.slides.length > 0
          ? seeded.slides
          : loadProtocolSlides(match.file);
    } else {
      source = 'ai';
      slides = await this.ai.compose(dto.prompt);
    }

    const event = await this.events.save(
      this.events.create({
        catId: dto.catId,
        userId,
        scenarioId: scenario?.id ?? null,
        stepsCompleted: [],
      }),
    );

    return { eventId: event.id, source, scenarioKey, slides };
  }

  /** Fetch a specific scenario's slide dataset (GET /crisis/protocol/:id). */
  async getProtocol(id: number): Promise<{ scenarioKey: string; slides: Slide[] }> {
    const scenario = await this.scenarios.findOne({ where: { id } });
    if (!scenario) throw new NotFoundException('Scenario not found');
    const data = scenario.protocolData as { slides?: Slide[] } | undefined;
    const slides = data?.slides ?? [];
    return { scenarioKey: scenario.scenarioKey, slides: slidesSchema.parse(slides) };
  }

  private async ownedEvent(userId: number, eventId: number): Promise<CrisisEvent> {
    const event = await this.events.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Crisis event not found');
    if (event.userId !== userId) throw new ForbiddenException();
    return event;
  }

  /**
   * Record a completed step. Idempotent per step index (plan §3.7-style guard):
   * emits the points event only when the index is newly added.
   */
  async step(userId: number, dto: CrisisStepDto): Promise<{ stepsCompleted: number[] }> {
    const event = await this.ownedEvent(userId, dto.eventId);
    const completed = new Set<number>(
      Array.isArray(event.stepsCompleted) ? (event.stepsCompleted as number[]) : [],
    );
    const isNew = !completed.has(dto.stepIndex);
    completed.add(dto.stepIndex);
    const arr = [...completed].sort((a, b) => a - b);
    event.stepsCompleted = arr;
    await this.events.save(event);

    if (isNew) {
      const payload: CrisisStepCompletedEvent = {
        userId,
        catId: event.catId,
        eventId: event.id,
        stepIndex: dto.stepIndex,
        points: POINTS_PER_STEP,
      };
      this.emitter.emit(CRISIS_STEP_COMPLETED, payload);
    }
    return { stepsCompleted: arr };
  }

  /** Persist resolution outcome (spec §2.3). */
  async resolve(userId: number, dto: ResolveCrisisDto): Promise<CrisisEvent> {
    const event = await this.ownedEvent(userId, dto.eventId);
    event.isDone = dto.isDone;
    event.reasonNotDone = dto.isDone ? null : (dto.reasonNotDone ?? null);
    event.outcome = dto.isDone ? 'resolved' : 'partial';
    event.resolvedAt = new Date();
    event.durationSeconds = Math.max(
      0,
      Math.round((event.resolvedAt.getTime() - new Date(event.startedAt).getTime()) / 1000),
    );
    return this.events.save(event);
  }
}
