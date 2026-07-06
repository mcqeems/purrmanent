import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { Env } from '../../config/env';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type LlmMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;
export type LlmTool = OpenAI.Chat.Completions.ChatCompletionTool;

/** A tool call the model decided to make, with its raw JSON-string arguments. */
export interface ParsedToolCall {
  id: string;
  name: string;
  arguments: string;
}

/**
 * Thin wrapper around the OpenAI SDK pointed at the Bynara router
 * (OpenAI-compatible). Shared by Crisis AI-fallback and the Copilot.
 *
 * ponytail: the openai SDK is CJS-safe, so a static import works. The same two
 * tools (retrieveCorpus/webSearch) can drive this directly — no Flue harness
 * needed.
 */
@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly client: OpenAI;
  readonly model: string;
  readonly modelPro: string;
  readonly enabled: boolean;

  constructor(private readonly config: ConfigService<Env, true>) {
    const apiKey = this.config.get('LLM_API_KEY', { infer: true });
    this.enabled = !!apiKey;
    this.model = this.config.get('LLM_MODEL', { infer: true });
    this.modelPro = this.config.get('LLM_MODEL_PRO', { infer: true });
    this.client = new OpenAI({
      apiKey: apiKey ?? 'unset',
      baseURL: this.config.get('LLM_BASE_URL', { infer: true }),
    });
  }

  /** Non-streaming completion. Returns the assistant text. */
  async chat(
    messages: ChatMessage[],
    opts?: { pro?: boolean },
  ): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: opts?.pro ? this.modelPro : this.model,
      messages,
    });
    return res.choices[0]?.message?.content ?? '';
  }

  /** Streaming completion — yields text deltas (used by the SSE Copilot). */
  async *chatStream(
    messages: ChatMessage[],
    opts?: { pro?: boolean },
  ): AsyncGenerator<string> {
    const stream = await this.client.chat.completions.create({
      model: opts?.pro ? this.modelPro : this.model,
      messages,
      stream: true,
    });
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) yield delta;
    }
  }

  /**
   * Streaming completion WITH tool-calling. Yields natural-language content
   * deltas as they arrive, and RETURNS the accumulated tool calls (if the model
   * chose to call tools instead of / before answering). The agent loop in
   * CoachService drives this; `reasoning_content` chunks are intentionally not
   * yielded (they are the model's private scratchpad, not user-facing text).
   */
  async *chatStreamTools(
    messages: LlmMessage[],
    tools: LlmTool[],
    opts?: { pro?: boolean },
  ): AsyncGenerator<string, ParsedToolCall[]> {
    const stream = await this.client.chat.completions.create({
      model: opts?.pro ? this.modelPro : this.model,
      messages,
      tools,
      tool_choice: 'auto',
      stream: true,
    });

    // Tool-call fragments arrive split across chunks, keyed by index.
    const acc = new Map<number, { id: string; name: string; args: string }>();
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) yield delta.content;
      for (const tc of delta?.tool_calls ?? []) {
        const slot = acc.get(tc.index) ?? { id: '', name: '', args: '' };
        if (tc.id) slot.id = tc.id;
        if (tc.function?.name) slot.name = tc.function.name;
        if (tc.function?.arguments) slot.args += tc.function.arguments;
        acc.set(tc.index, slot);
      }
    }

    return [...acc.values()]
      .filter((c) => c.name)
      .map((c) => ({ id: c.id, name: c.name, arguments: c.args }));
  }
}
