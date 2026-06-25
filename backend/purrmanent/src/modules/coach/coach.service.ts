import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AiCoachConversation,
  AiCoachMessage,
  ChecklistItem,
  User,
} from '../../entities';
import { CatsService } from '../cats/cats.service';
import { LlmService } from '../../common/llm/llm.service';
import { CoachToolsService, RetrievedChunk } from './coach-tools.service';
import { ChatMessageDto } from './coach.schema';
import { buildCoachPrompt } from './coach.prompt';

export interface CoachEvent {
  type: 'sources' | 'delta' | 'done' | 'error';
  data?: unknown;
}

const FALLBACK_MESSAGE =
  "I'm having trouble reaching my knowledge right now. For anything urgent or " +
  'health-related, please contact your veterinarian. Try asking me again in a moment.';

@Injectable()
export class CoachService {
  private readonly logger = new Logger(CoachService.name);

  constructor(
    @InjectRepository(AiCoachConversation)
    private readonly conversations: Repository<AiCoachConversation>,
    @InjectRepository(AiCoachMessage)
    private readonly messages: Repository<AiCoachMessage>,
    @InjectRepository(ChecklistItem)
    private readonly items: Repository<ChecklistItem>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly cats: CatsService,
    private readonly llm: LlmService,
    private readonly tools: CoachToolsService,
  ) {}

  private async getOrCreateConversation(
    userId: number,
    catId?: number,
  ): Promise<AiCoachConversation> {
    const existing = await this.conversations.findOne({
      where: { userId, catId: catId ?? undefined },
      order: { startedAt: 'DESC' },
    });
    if (existing) return existing;
    return this.conversations.save(
      this.conversations.create({ userId, catId: catId ?? null }),
    );
  }

  /**
   * Orchestrates a single Copilot turn (spec §2.4/§8.5): inject @mention Kanban
   * context, retrieve corpus chunks, stream the answer, persist on completion.
   * Yields SSE-shaped events. Never throws to the client — failures yield a
   * friendly fallback (spec §2.4 acceptance).
   */
  async *run(userId: number, dto: ChatMessageDto): AsyncGenerator<CoachEvent> {
    try {
      if (dto.catId) await this.cats.findOneForUser(userId, dto.catId); // ownership

      const user = await this.users.findOne({ where: { id: userId } });
      const language = user?.preferredLanguage ?? 'en';

      // @mention context: inject the matching column's card texts.
      let mentionedTasks: string[] = [];
      if (dto.contextMention && dto.catId) {
        const rows = await this.items.find({
          where: { catId: dto.catId, kanbanStatus: dto.contextMention },
          select: { itemText: true },
        });
        mentionedTasks = rows.map((r) => r.itemText);
      }

      const retrieved = await this.tools.retrieveCorpus(dto.message);
      const sources = retrieved
        .filter((c) => c.source || c.sourceUrl)
        .map((c) => ({ source: c.source, url: c.sourceUrl }));

      yield { type: 'sources', data: sources };

      if (!this.llm.enabled) {
        yield { type: 'delta', data: FALLBACK_MESSAGE };
        await this.persist(userId, dto, FALLBACK_MESSAGE, sources, retrieved);
        yield { type: 'done' };
        return;
      }

      const messages = buildCoachPrompt({
        message: dto.message,
        contextMention: dto.contextMention,
        mentionedTasks,
        retrieved,
        language,
      });

      let full = '';
      try {
        for await (const delta of this.llm.chatStream(messages)) {
          full += delta;
          yield { type: 'delta', data: delta };
        }
      } catch (err) {
        this.logger.error(`LLM stream failed: ${String(err)}`);
        if (full.length === 0) {
          full = FALLBACK_MESSAGE;
          yield { type: 'delta', data: FALLBACK_MESSAGE };
        }
      }

      await this.persist(userId, dto, full, sources, retrieved);
      yield { type: 'done' };
    } catch (err) {
      this.logger.error(`coach.run failed: ${String(err)}`);
      yield { type: 'delta', data: FALLBACK_MESSAGE };
      yield { type: 'error' };
    }
  }

  private async persist(
    userId: number,
    dto: ChatMessageDto,
    assistantText: string,
    sources: unknown,
    retrieved: RetrievedChunk[],
  ): Promise<void> {
    const conv = await this.getOrCreateConversation(userId, dto.catId);
    await this.messages.save([
      this.messages.create({
        conversationId: conv.id,
        role: 'user',
        content: dto.message,
      }),
      this.messages.create({
        conversationId: conv.id,
        role: 'assistant',
        content: assistantText,
        retrievedChunks: retrieved,
        sources,
      }),
    ]);
    await this.conversations.update(conv.id, { lastMessageAt: new Date() });
  }
}
