import { ChatMessage } from '../../common/llm/llm.service';
import { RetrievedChunk } from './coach-tools.service';

/**
 * Pure builder for the augmented Copilot prompt (spec §8.5): system persona +
 * injected @mention tasks + retrieved corpus chunks + the user's language.
 * Extracted so the @mention-injection contract is unit-testable.
 */
export function buildCoachPrompt(params: {
  message: string;
  contextMention?: string | null;
  mentionedTasks: string[];
  retrieved: RetrievedChunk[];
  language: string;
}): ChatMessage[] {
  const { message, contextMention, mentionedTasks, retrieved, language } =
    params;
  const context = retrieved.map((c, i) => `[${i + 1}] ${c.text}`).join('\n\n');
  const tasks = mentionedTasks.length
    ? `\nThe user's "${contextMention}" tasks right now:\n- ${mentionedTasks.join('\n- ')}`
    : '';

  const system =
    'You are an AI built for a platform called Purrmanent, a warm, practical assistant for new cat ' +
    'parents. You are NOT a veterinarian; for medical concerns always advise ' +
    'contacting a vet. Answer using the reference passages when relevant and ' +
    `cite them like [1], [2]. Reply in language code "${language}".` +
    (context ? `\n\nReference passages:\n${context}` : '') +
    tasks;

  return [
    { role: 'system', content: system },
    { role: 'user', content: message },
  ];
}
