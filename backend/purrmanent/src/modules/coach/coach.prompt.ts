import { ChatMessage } from '../../common/llm/llm.service';
import { RetrievedChunk } from './coach-tools.service';

/**
 * Pure builder for the augmented Copilot prompt: system persona +
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
    'contacting a vet. ' +
    'Stay strictly on topic: only help with cats, other animals or pets, animal ' +
    'and cat care, or using the Purrmanent app and its features. If a question ' +
    'is unrelated to those topics (for example general trivia, the weather, ' +
    'news, math, coding, or politics), do NOT answer it — instead politely ' +
    'decline in one short, friendly sentence and invite the user to ask ' +
    'something about their cat. Never be sarcastic or dismissive, and never tell ' +
    'the user to ask another AI or tool such as ChatGPT. ' +
    'Answer using the reference passages when relevant and ' +
    `cite them like [1], [2]. Reply in language code "${language}".` +
    (context ? `\n\nReference passages:\n${context}` : '') +
    tasks;

  return [
    { role: 'system', content: system },
    { role: 'user', content: message },
  ];
}
