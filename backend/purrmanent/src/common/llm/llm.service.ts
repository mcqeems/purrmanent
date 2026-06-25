import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { Env } from '../../config/env';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Thin wrapper around the OpenAI SDK pointed at the Bynara router
 * (OpenAI-compatible). Shared by Crisis AI-fallback and the Copilot.
 *
 * ponytail: the openai SDK is CJS-safe, so a static import works. The same two
 * tools (retrieveCorpus/webSearch) can drive this directly — no Flue harness
 * needed (plan §3.5 / R3).
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
}
