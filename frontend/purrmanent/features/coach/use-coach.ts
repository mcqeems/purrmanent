'use client';

import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { CoachSource, PendingAction } from '@/lib/types/api';
import { streamCoachChat } from './stream';
import { confirmAction, parseMention, coachHistoryApi } from './api';

export interface CoachMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: CoachSource[];
  pending?: PendingAction | null;
}

export function useCoach() {
  const qc = useQueryClient();
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const idRef = useRef(0);
  const newId = () => String((idRef.current += 1));

  const patch = (id: string, p: Partial<CoachMessage>) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...p } : m)));
  const appendDelta = (id: string, text: string) =>
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content: m.content + text } : m)),
    );

  /** Start a fresh chat thread. */
  const newChat = useCallback(() => {
    setConversationId(null);
    setMessages([]);
  }, []);

  /** Load a past conversation's messages and continue it. */
  const loadConversation = useCallback(async (id: number) => {
    setConversationId(id);
    const stored = await coachHistoryApi.messages(id);
    setMessages(
      stored
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          id: `h${m.id}`,
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
    );
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;
      const aId = newId();
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: 'user', content: trimmed },
        { id: aId, role: 'assistant', content: '' },
      ]);
      setStreaming(true);
      await streamCoachChat(
        {
          message: trimmed,
          contextMention: parseMention(trimmed) ?? null,
          conversationId: conversationId ?? undefined,
        },
        {
          onDelta: (t) => appendDelta(aId, t),
          onSources: (s) => patch(aId, { sources: s }),
          onConfirm: (p) => patch(aId, { pending: p }),
          onError: () =>
            appendDelta(aId, 'Sorry, I had trouble reaching my knowledge.'),
        },
      );
      setStreaming(false);
      void qc.invalidateQueries({ queryKey: ['coach', 'conversations'] });
    },
    [conversationId, streaming, qc],
  );

  const confirm = useCallback(
    async (msgId: string, pending: PendingAction, ok: boolean) => {
      patch(msgId, { pending: null });
      const res = await confirmAction({
        actionName: pending.actionName,
        args: pending.args,
        confirm: ok,
      });
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: 'assistant', content: res.message },
      ]);
      if (ok && res.ok) void qc.invalidateQueries();
    },
    [qc],
  );

  return {
    messages,
    streaming,
    conversationId,
    send,
    confirm,
    loadConversation,
    newChat,
  };
}
