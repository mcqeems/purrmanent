import { buildUrl } from '@/lib/api/client';
import type { CoachSource, PendingAction } from '@/lib/types/api';
import type { ChatMessageInput } from '@/lib/validation/schemas';

export interface CoachStreamHandlers {
  onSources?: (sources: CoachSource[]) => void;
  onDelta?: (text: string) => void;
  onConfirm?: (pending: PendingAction) => void;
  onConversation?: (conv: { id: number }) => void;
  onError?: () => void;
  onDone?: () => void;
}

function parseBlock(raw: string, handlers: CoachStreamHandlers): boolean {
  let event = 'message';
  let data = '';
  for (const line of raw.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) data += line.slice(5).trim();
  }
  if (!data) return false;
  if (data === '[DONE]') return true;
  try {
    const parsed = JSON.parse(data) as unknown;
    if (event === 'sources') handlers.onSources?.(parsed as CoachSource[]);
    else if (event === 'delta')
      handlers.onDelta?.(typeof parsed === 'string' ? parsed : String(parsed));
    else if (event === 'confirm') handlers.onConfirm?.(parsed as PendingAction);
    else if (event === 'conversation') handlers.onConversation?.(parsed as { id: number });
    else if (event === 'error') handlers.onError?.();
  } catch {
    // ignore malformed block
  }
  return false;
}

/**
 * POST /api/coach/chat returns text/event-stream (not JSON, not EventSource —
 * EventSource is GET-only). Read the body stream and dispatch SSE-shaped events
 * (sources / delta / confirm / [DONE]).
 */
export async function streamCoachChat(
  body: ChatMessageInput,
  handlers: CoachStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(buildUrl('/coach/chat'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    handlers.onError?.();
    handlers.onDone?.();
    return;
  }

  if (!res.ok || !res.body) {
    handlers.onError?.();
    handlers.onDone?.();
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finished = false;

  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf('\n\n')) !== -1) {
        const block = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        if (parseBlock(block, handlers)) finished = true;
      }
    }
  } catch {
    handlers.onError?.();
  }

  void finished;
  handlers.onDone?.();
}
