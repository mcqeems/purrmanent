"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { MessageCircle, Send, X } from "lucide-react";
import { Button, Pill } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { useCoach } from "./use-coach";

export function Copilot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, streaming, send, confirm } = useCoach();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  function submit() {
    if (!input.trim()) return;
    void send(input);
    setInput("");
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open AI coach"
        className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex h-[32rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-xl bg-surface-night text-on-primary shadow-2xl">
      <header className="flex items-center justify-between border-b border-hairline-violet px-4 py-3">
        <span className="font-semibold">AI Coach</span>
        <button onClick={() => setOpen(false)} aria-label="Close">
          <X size={18} />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
        {messages.length === 0 && (
          <p className="text-on-dark-muted">
            Ask me about cat care, or try &ldquo;add a cat named Mochi&rdquo;.
            Mention <code>@todo</code> to give me your board context.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[85%] rounded-md px-3 py-2",
              m.role === "user"
                ? "ml-auto bg-accent-violet-deep"
                : "bg-ink-deep",
            )}
          >
            <div className="prose-sm break-words [&_a]:text-accent-lime [&_a]:underline [&_code]:text-accent-lime">
              <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
            </div>

            {m.sources && m.sources.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {m.sources.map((s, i) => (
                  <Pill key={i} tone="lime">
                    {s.source ?? "source"}
                  </Pill>
                ))}
              </div>
            )}

            {m.pending && (
              <div className="mt-2 rounded-md border border-accent-lime/40 bg-surface-night p-2">
                <p className="mb-2 text-xs text-on-dark-muted">
                  Confirm action: <strong>{m.pending.actionName}</strong>
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => confirm(m.id, m.pending!, true)}
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => confirm(m.id, m.pending!, false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-hairline-violet p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Ask the coach…"
          className="flex-1 rounded-md bg-ink-deep px-3 py-2 text-sm text-on-primary placeholder:text-on-dark-muted/60"
        />
        <Button size="sm" onClick={submit} disabled={streaming} aria-label="Send">
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
