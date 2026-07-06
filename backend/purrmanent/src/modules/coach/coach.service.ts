import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import {
  AiCoachConversation,
  AiCoachMessage,
  ChecklistItem,
  User,
} from '../../entities';
import { CatsService } from '../cats/cats.service';
import {
  LlmService,
  LlmMessage,
  LlmTool,
  ParsedToolCall,
} from '../../common/llm/llm.service';
import { CoachToolsService, RetrievedChunk } from './coach-tools.service';
import { CoachActionsService, ActionResult } from './coach-actions.service';
import { ChatMessageDto, ConfirmActionDto } from './coach.schema';
import { buildCoachPrompt } from './coach.prompt';

export interface CoachEvent {
  type: 'sources' | 'delta' | 'confirm' | 'done' | 'error' | 'conversation';
  data?: unknown;
}

/** A write action the agent proposed; the client confirms before it runs. */
export interface PendingAction {
  actionName: string;
  args: unknown;
  toolCallId: string;
}

const FALLBACK_MESSAGE =
  "I'm having trouble reaching my knowledge right now. For anything urgent or " +
  'health-related, please contact your veterinarian. Try asking me again in a moment.';

/** Bounds the read-tool -> answer loop so a misbehaving model can't spin. */
const MAX_AGENT_STEPS = 4;

const TOOL_GUIDANCE =
  'You can look things up and take actions using the provided tools. ' +
  'For any question about cat care, health, behavior, nutrition, or adaptation, ' +
  'FIRST call search_knowledge to fetch reference passages, then answer and ' +
  'cite them like [1], [2]. Only call an action tool when the user clearly asks ' +
  'for that action; before calling it, make sure you have every required ' +
  'argument — if something is missing, ask the user for it instead of guessing. ' +
  'Never fabricate values. ' +
  'When the user asks you to add, move, update, or remove MULTIPLE items at once, ' +
  'prefer the bulk version of the action (e.g. add_checklist_items instead of ' +
  'add_checklist_item, get_multiple_cat_details instead of get_cat_details). ' +
  'Use the single action only when operating on exactly one item. ' +
  'IMPORTANT: whenever an action requires a catId, ALWAYS call list_cats or ' +
  'get_cat_details FIRST to discover the correct numeric cat id. Never guess ' +
  'or invent a catId — use the exact id returned by the tool.';

/**
 * RAG is exposed as a tool (not pre-fetched every turn) so action-only prompts
 * like "add a cat" don't pull unrelated passages. The model decides when it
 * needs knowledge.
 * ponytail ceiling: relies on the model choosing to call it for factual
 * questions; the guidance above nudges it. If a weaker model under-calls it,
 * the upgrade path is to force tool_choice on detected question turns.
 */
const SEARCH_KNOWLEDGE_TOOL = {
  type: 'function',
  function: {
    name: 'search_knowledge',
    description:
      'Search the curated cat-care knowledge base and return reference ' +
      'passages. Use this for any factual cat-care question before answering.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'the search query' },
      },
      required: ['query'],
    },
  },
} satisfies LlmTool;

/** Tool `arguments` arrive as a JSON string; parse defensively. */
function parseArgs(raw: string): unknown {
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

const MARKDOWN_GUIDANCE =
  'Format every reply in standard, well-structured Markdown (headings, bold, ' +
  'bullet/numbered lists, tables, and fenced code where useful). Keep it clean ' +
  'and readable.';

/** How many recent stored messages to replay verbatim alongside the summary. */
const RECENT_CONTEXT = 6;

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
    private readonly actions: CoachActionsService,
  ) {}

  /** List the user's coach conversations, most-recent first. */
  async listConversations(userId: number): Promise<AiCoachConversation[]> {
    return this.conversations.find({
      where: { userId },
      order: { lastMessageAt: 'DESC', startedAt: 'DESC' },
    });
  }

  /** Messages for one conversation (ownership-checked), oldest first. */
  async getMessages(
    userId: number,
    conversationId: number,
  ): Promise<AiCoachMessage[]> {
    const conv = await this.conversations.findOne({
      where: { id: conversationId },
    });
    if (!conv || conv.userId !== userId) {
      throw new NotFoundException('Conversation not found');
    }
    return this.messages.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  private async getOrCreateConversation(
    userId: number,
    catId?: number,
  ): Promise<AiCoachConversation> {
    const existing = await this.conversations.findOne({
      where: { userId, catId: catId ?? IsNull() },
      order: { startedAt: 'DESC' },
    });
    if (existing) return existing;
    return this.conversations.save(
      this.conversations.create({ userId, catId: catId ?? null }),
    );
  }

  /**
   * Resolve the conversation for a turn: a specific one to continue (ownership-
   * checked) or the latest/new one for the cat.
   */
  private async resolveConversation(
    userId: number,
    dto: ChatMessageDto,
  ): Promise<AiCoachConversation> {
    if (dto.conversationId) {
      const conv = await this.conversations.findOne({
        where: { id: dto.conversationId },
      });
      if (!conv || conv.userId !== userId) {
        throw new NotFoundException('Conversation not found');
      }
      return conv;
    }
    // Omitted conversationId: Always create a new conversation thread
    return this.conversations.save(
      this.conversations.create({ userId, catId: dto.catId ?? null }),
    );
  }

  /**
   * Prior-context messages for continuing a conversation: a stored summary
   * (one system line) + the last few verbatim turns. This keeps the token
   * footprint bounded instead of replaying the whole history every turn.
   */
  private async historyContext(
    conv: AiCoachConversation,
  ): Promise<LlmMessage[]> {
    const out: LlmMessage[] = [];
    if (conv.summary) {
      out.push({
        role: 'system',
        content: `Summary of the conversation so far: ${conv.summary}`,
      });
    }
    const recent = await this.messages.find({
      where: { conversationId: conv.id },
      order: { createdAt: 'DESC' },
      take: RECENT_CONTEXT,
    });
    for (const m of recent.reverse()) {
      if (m.role === 'user') out.push({ role: 'user', content: m.content });
      else if (m.role === 'assistant')
        out.push({ role: 'assistant', content: m.content });
    }
    return out;
  }

  /**
   * Refresh the conversation's running summary after a turn (bounded ~120 words)
   * so future turns send the summary instead of the full transcript.
   */
  private async updateSummary(
    conv: AiCoachConversation,
    userMessage: string,
    assistantReply: string,
  ): Promise<void> {
    if (!this.llm.enabled) return;
    try {
      const summary = await this.llm.chat([
        {
          role: 'system',
          content:
            'Maintain a concise running summary (<=120 words) of a cat-care ' +
            "conversation: the user's cats, key facts, decisions made, and any " +
            'open threads. Return ONLY the updated summary text.',
        },
        {
          role: 'user',
          content: `Previous summary: ${conv.summary ?? '(none)'}\n\nNew user message: ${userMessage}\n\nNew assistant reply: ${assistantReply}`,
        },
      ]);
      if (summary.trim()) {
        await this.conversations.update(conv.id, { summary: summary.trim() });
      }
    } catch (err) {
      this.logger.warn(`summary update failed: ${String(err)}`);
    }
  }

  /**
   * Orchestrates a single Copilot turn: inject @mention Kanban
   * context, retrieve corpus chunks, stream the answer, persist on completion.
   * Yields SSE-shaped events. Never throws to the client — failures yield a
   * friendly fallback.
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

      // Resolve which conversation this turn belongs to (continue or new).
      const conv = await this.resolveConversation(userId, dto);
      yield { type: 'conversation', data: { id: conv.id } };

      // RAG is a tool now (search_knowledge): we retrieve only when the model
      // asks, so action-only turns don't fetch unrelated passages. Track the
      // last search result for persistence.
      let lastSources: unknown[] = [];
      let lastRetrieved: RetrievedChunk[] = [];

      if (!this.llm.enabled) {
        yield { type: 'delta', data: FALLBACK_MESSAGE };
        await this.persist(
          conv,
          dto,
          FALLBACK_MESSAGE,
          lastSources,
          lastRetrieved,
        );
        yield { type: 'done' };
        return;
      }

      const base = buildCoachPrompt({
        message: dto.message,
        contextMention: dto.contextMention,
        mentionedTasks,
        retrieved: [],
        language,
      });

      // System persona + tool + markdown guidance, then prior-conversation
      // context (summary + recent turns), then the current user message.
      const history = await this.historyContext(conv);
      const messages: LlmMessage[] = [
        {
          role: 'system',
          content: `${base[0].content}\n\n${TOOL_GUIDANCE}\n\n${MARKDOWN_GUIDANCE}`,
        },
        ...history,
        { role: 'user', content: dto.message },
      ];
      const toolDefs: LlmTool[] = [
        SEARCH_KNOWLEDGE_TOOL,
        ...this.actions.tools(),
      ];

      let full = '';
      try {
        for (let step = 0; step < MAX_AGENT_STEPS; step++) {
          const gen = this.llm.chatStreamTools(messages, toolDefs);
          let stepText = '';
          let toolCalls: ParsedToolCall[] = [];
          // Manual iteration: deltas are yielded, tool calls are the return value.
          for (;;) {
            const next = await gen.next();
            if (next.done) {
              toolCalls = next.value;
              break;
            }
            stepText += next.value;
            full += next.value;
            yield { type: 'delta', data: next.value };
          }

          if (toolCalls.length === 0) break; // model produced a final answer

          // Record the assistant's tool-call message before resolving them.
          messages.push({
            role: 'assistant',
            content: stepText || null,
            tool_calls: toolCalls.map((tc) => ({
              id: tc.id,
              type: 'function',
              function: { name: tc.name, arguments: tc.arguments },
            })),
          });

          for (const tc of toolCalls) {
            // Knowledge retrieval (RAG) — only now do we hit the corpus, and
            // only now emit a `sources` event (so action turns stay quiet).
            if (tc.name === 'search_knowledge') {
              const a = parseArgs(tc.arguments) as { query?: string };
              const chunks = await this.tools.retrieveCorpus(
                a.query || dto.message,
              );
              lastRetrieved = chunks;
              lastSources = chunks
                .filter((c) => c.source || c.sourceUrl)
                .map((c) => ({ source: c.source, url: c.sourceUrl }));
              yield { type: 'sources', data: lastSources };
              messages.push({
                role: 'tool',
                tool_call_id: tc.id,
                content: JSON.stringify(
                  chunks.map((c, i) => ({
                    ref: i + 1,
                    text: c.text,
                    source: c.source,
                  })),
                ),
              });
              continue;
            }

            if (this.actions.isMutating(tc.name)) {
              // WRITE: never execute here. Propose it and let the user confirm.
              const pending: PendingAction = {
                actionName: tc.name,
                args: parseArgs(tc.arguments),
                toolCallId: tc.id,
              };
              yield { type: 'confirm', data: pending };
              await this.persist(
                conv,
                dto,
                `Proposed action "${tc.name}" — awaiting your confirmation.`,
                lastSources,
                lastRetrieved,
              );
              yield { type: 'done' };
              return;
            }

            // Data READ action: safe to run inline; feed the result back.
            const res = await this.actions.execute(
              tc.name,
              userId,
              parseArgs(tc.arguments),
            );
            messages.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: JSON.stringify(res),
            });
          }
          // loop again so the model can answer using the tool results
        }
      } catch (err) {
        this.logger.error(`LLM stream failed: ${String(err)}`);
        if (full.length === 0) {
          full = FALLBACK_MESSAGE;
          yield { type: 'delta', data: FALLBACK_MESSAGE };
        }
      }

      if (full.length === 0) {
        full = FALLBACK_MESSAGE;
        yield { type: 'delta', data: FALLBACK_MESSAGE };
      }
      await this.persist(conv, dto, full, lastSources, lastRetrieved);
      // ponytail: summary is for future context only — no need to block [DONE]
      void this.updateSummary(conv, dto.message, full);
      yield { type: 'done' };
    } catch (err) {
      this.logger.error(`coach.run failed: ${String(err)}`);
      yield { type: 'delta', data: FALLBACK_MESSAGE };
      yield { type: 'error' };
    }
  }

  /**
   * Execute a write action the user confirmed (the `confirm` SSE event ->
   * POST /coach/confirm-action). userId comes from the session; args are
   * re-validated by the action schema in CoachActionsService (anti-IDOR +
   * untrusted-input handling). Returns the structured result plus a friendly
   * natural-language `message` the UI can show ("I've added Bobby…").
   */
  async confirmAction(
    userId: number,
    dto: ConfirmActionDto,
  ): Promise<ActionResult & { message: string }> {
    if (!dto.confirm) {
      return {
        ok: false,
        action: dto.actionName,
        error: 'cancelled',
        message: "Okay, I won't make that change.",
      };
    }
    const res = await this.actions.execute(dto.actionName, userId, dto.args);
    const message = await this.summarizeAction(userId, res);
    await this.appendAssistant(userId, dto.catId, message, res);
    return { ...res, message };
  }

  /** One-sentence, localized confirmation of an executed action. */
  private async summarizeAction(
    userId: number,
    res: ActionResult,
  ): Promise<string> {
    if (!res.ok) {
      return "Sorry, I couldn't complete that. Please make sure the cat or item still exists and try again.";
    }
    const done = `Done — I've completed "${res.action}".`;
    if (!this.llm.enabled) return done;
    const user = await this.users.findOne({ where: { id: userId } });
    const language = user?.preferredLanguage ?? 'en';
    try {
      const msg = await this.llm.chat([
        {
          role: 'system',
          content:
            "You are Purrmanent's warm cat-care assistant. In ONE short " +
            'sentence, confirm to the user that the action just succeeded. ' +
            `Reply in language code "${language}".`,
        },
        {
          role: 'user',
          content: `The "${res.action}" action succeeded. Result: ${JSON.stringify(res.result)}`,
        },
      ]);
      return msg || done;
    } catch {
      return done;
    }
  }

  /** Persist a standalone assistant message (used for action follow-ups). */
  private async appendAssistant(
    userId: number,
    catId: number | undefined,
    content: string,
    res: ActionResult,
  ): Promise<void> {
    const conv = await this.getOrCreateConversation(userId, catId);
    await this.messages.save(
      this.messages.create({
        conversationId: conv.id,
        role: 'assistant',
        content,
        sources: { action: res.action, ok: res.ok },
      }),
    );
    await this.conversations.update(conv.id, { lastMessageAt: new Date() });
  }

  private async persist(
    conv: AiCoachConversation,
    dto: ChatMessageDto,
    assistantText: string,
    sources: unknown,
    retrieved: RetrievedChunk[],
  ): Promise<void> {
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
