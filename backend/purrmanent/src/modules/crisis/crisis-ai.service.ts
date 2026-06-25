import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../../common/llm/llm.service';
import { Slide, slidesSchema } from './parsers/markdown-slide.parser';

/**
 * AI fallback for unmatched crisis prompts (spec §2.3 / plan §6). Composes a
 * slide array in the SAME schema as the rule-based protocols, validated with
 * Zod before return (external/LLM output is untrusted, plan §18).
 *
 * ponytail: Phase 6 uses a direct LLM composition. Upgrade path (Phase 7): feed
 * retrieved corpus chunks + webSearch results into the prompt for grounding.
 * The interface (compose(prompt, context?)) already accepts that context.
 */
@Injectable()
export class CrisisAiService {
  private readonly logger = new Logger(CrisisAiService.name);

  constructor(private readonly llm: LlmService) {}

  private readonly SAFE_FALLBACK: Slide[] = [
    {
      title: 'We Could Not Match a Protocol',
      markdown:
        'We could not confidently match this to a known protocol. When a cat shows worrying symptoms, the safest action is to contact a veterinarian.',
      todos: [
        'Note the specific symptoms and when they started',
        'Check for emergency signs: trouble breathing, pale gums, collapse',
        'Call your veterinarian or an emergency clinic',
      ],
    },
  ];

  async compose(prompt: string, context?: string[]): Promise<Slide[]> {
    if (!this.llm.enabled) return this.SAFE_FALLBACK;

    const grounding = context?.length
      ? `\n\nUse these vetted references when relevant:\n${context.join('\n---\n')}`
      : '';

    const system =
      "You are Purrmanent's feline first-aid assistant. Produce a short, calm, " +
      'step-by-step crisis protocol for a cat owner. You are NOT a vet; always ' +
      'advise contacting a vet for serious or worsening symptoms. Respond ONLY ' +
      'with JSON: an array of slides, each { "title": string, "markdown": ' +
      'string, "todos": string[] }. 2-4 slides, 2-4 todos each.' +
      grounding;

    try {
      const raw = await this.llm.chat(
        [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
        { pro: true },
      );
      const json = raw
        .trim()
        .replace(/^```(?:json)?/i, '')
        .replace(/```$/i, '')
        .trim();
      const parsed = slidesSchema.safeParse(JSON.parse(json));
      if (parsed.success && parsed.data.length > 0) return parsed.data;
      this.logger.warn(
        'AI fallback returned invalid slide JSON; using safe fallback',
      );
      return this.SAFE_FALLBACK;
    } catch (err) {
      this.logger.error(`AI fallback failed: ${String(err)}`);
      return this.SAFE_FALLBACK;
    }
  }
}
