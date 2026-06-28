"use client";

import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useActiveCat } from "@/features/cats/active-cat-provider";
import type { CoachSource, PendingAction } from "@/lib/types/api";
import { streamCoachChat } from "./stream";
import { confirmAction, parseMention } from "./api";

export interface CoachMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: CoachSource[];
  pending?: PendingAction | null;
}

export function useCoach() {
  const { activeCatId } = useActiveCat();
  const qc = useQueryClient();
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const idRef = useRef(0);
  const newId = () => String((idRef.current += 1));

  const patch = (id: string, p: Partial<CoachMessage>) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...p } : m)));
  const appendDelta = (id: string, text: string) =>
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content: m.content + text } : m)),
    );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;
      const aId = newId();
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: "user", content: trimmed },
        { id: aId, role: "assistant", content: "" },
      ]);
      setStreaming(true);
      await streamCoachChat(
        {
          message: trimmed,
          contextMention: parseMention(trimmed) ?? null,
          catId: activeCatId ?? undefined,
        },
        {
          onDelta: (t) => appendDelta(aId, t),
          onSources: (s) => patch(aId, { sources: s }),
          onConfirm: (p) => patch(aId, { pending: p }),
          onError: () =>
            appendDelta(aId, "Sorry, I had trouble reaching my knowledge."),
        },
      );
      setStreaming(false);
    },
    [activeCatId, streaming],
  );

  const confirm = useCallback(
    async (msgId: string, pending: PendingAction, ok: boolean) => {
      patch(msgId, { pending: null });
      const res = await confirmAction({
        actionName: pending.actionName,
        args: pending.args,
        confirm: ok,
        catId: activeCatId ?? undefined,
      });
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: "assistant", content: res.message },
      ]);
      if (ok && res.ok) void qc.invalidateQueries();
    },
    [activeCatId, qc],
  );

  return { messages, streaming, send, confirm };
}
