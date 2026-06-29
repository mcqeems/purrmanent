import { apiFetch } from '@/lib/api/client';
import type {
  CoachConversation,
  CoachStoredMessage,
  ConfirmActionResult,
  MentionColumn,
} from '@/lib/types/api';
import { KANBAN_STATUSES } from '@/lib/validation/schemas';

export function confirmAction(body: {
  actionName: string;
  args: Record<string, unknown>;
  confirm: boolean;
  catId?: number;
}) {
  return apiFetch<ConfirmActionResult>('/coach/confirm-action', {
    method: 'POST',
    body,
  });
}

export const coachHistoryApi = {
  list: () => apiFetch<CoachConversation[]>('/coach/conversations'),
  messages: (id: number) =>
    apiFetch<CoachStoredMessage[]>(`/coach/conversations/${id}/messages`),
};

/** Resolve a free-text @mention into the backend's contextMention enum. */
export function parseMention(message: string): MentionColumn | undefined {
  const m = message.toLowerCase().match(/@(todo|progress|done)\b/);
  const found = m?.[1] as MentionColumn | undefined;
  return found && KANBAN_STATUSES.includes(found) ? found : undefined;
}
