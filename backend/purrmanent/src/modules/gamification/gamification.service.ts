import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities';
import {
  CHECKLIST_ITEM_COMPLETED,
  CRISIS_STEP_COMPLETED,
} from '../../common/events/events';
import type {
  ChecklistItemCompletedEvent,
  CrisisStepCompletedEvent,
} from '../../common/events/events';

/**
 * Thin, event-driven points balance (spec §2.6 / §8.7). The emitters guarantee
 * once-only emission per genuine completion (plan §3.7), so this listener stays
 * dumb — no dedup logic. The increment is atomic at the DB (race-safe).
 */
@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  private award(userId: number, points: number): Promise<unknown> {
    return this.users.increment({ id: userId }, 'points', points);
  }

  @OnEvent(CHECKLIST_ITEM_COMPLETED)
  async onChecklistCompleted(e: ChecklistItemCompletedEvent): Promise<void> {
    await this.award(e.userId, e.points);
  }

  @OnEvent(CRISIS_STEP_COMPLETED)
  async onCrisisStepCompleted(e: CrisisStepCompletedEvent): Promise<void> {
    await this.award(e.userId, e.points);
  }

  async getStatus(userId: number): Promise<{ points: number }> {
    const user = await this.users.findOne({
      where: { id: userId },
      select: { id: true, points: true },
    });
    return { points: user?.points ?? 0 };
  }
}
