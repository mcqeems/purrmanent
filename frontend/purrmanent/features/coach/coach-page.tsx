'use client';

import { useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { Plus, Sparkles, MessageSquare } from 'lucide-react';
import { Button, Card, Pill, Markdown, TypingDots } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { useCopilot } from './copilot-provider';
import { useConversations } from './history-hooks';
import { MentionInput } from './mention-input';

const ACTIONS = [
  'Add a cat named Mochi',
  'What should I do today?',
  'Show my @todo tasks',
  'Log a vaccination for my cat',
  'How often should I feed an adult cat?',
];

function ts(d: string) {
  const date = parseISO(d);
  return isValid(date) ? format(date, 'MMM d, HH:mm') : '';
}

function ChatPane() {
  const { messages, streaming, send, confirm } = useCopilot();
  const [input, setInput] = useState('');

  function submit() {
    if (!input.trim()) return;
    void send(input);
    setInput('');
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-3 text-sm text-muted">
            <p>Start a conversation, or try one of these:</p>
            <div className="flex flex-wrap gap-2">
              {ACTIONS.map((a) => (
                <button
                  key={a}
                  onClick={() => void send(a)}
                  className="rounded-full border border-hairline-cool px-3 py-1 text-xs text-ink-deep hover:border-accent-violet"
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => {
          // Don't render an empty assistant placeholder — the standalone
          // loader below covers the "thinking" state outside the bubble.
          if (
            m.role === 'assistant' &&
            !m.content &&
            !m.pending &&
            !(m.sources && m.sources.length)
          ) {
            return null;
          }
          return (
            <div
              key={m.id}
              className={cn(
                'max-w-[85%] rounded-md px-3 py-2 text-sm',
                m.role === 'user'
                  ? 'ml-auto bg-accent-violet-deep text-on-primary'
                  : 'bg-surface-press-light text-ink-deep',
              )}
            >
              {m.role === 'assistant' ? (
                <Markdown content={m.content} />
              ) : (
                <span className="whitespace-pre-wrap break-words">
                  {m.content}
                </span>
              )}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {m.sources.map((s, idx) => (
                    <Pill key={idx} tone="lime">
                      {s.source ?? 'source'}
                    </Pill>
                  ))}
                </div>
              )}
              {m.pending && (
                <div className="mt-2 rounded-md border border-accent-violet/40 p-2">
                  <p className="mb-2 text-xs text-muted">
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
                      variant="outline"
                      onClick={() => confirm(m.id, m.pending!, false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {streaming && (
          <div className="flex items-center gap-2 px-1">
            <TypingDots className="text-accent-violet" />
            <span className="text-xs text-muted">Coach is thinking…</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 border-t border-hairline-cloud bg-surface-night p-3">
        <MentionInput
          value={input}
          onChange={setInput}
          onSubmit={submit}
          disabled={streaming}
          placeholder="Ask anything, or @mention a column or cat…"
        />
        <Button size="sm" onClick={submit} disabled={streaming}>
          Send
        </Button>
      </div>
    </div>
  );
}

export function CoachPage() {
  const { data: conversations } = useConversations();
  const { conversationId, loadConversation, newChat } = useCopilot();

  return (
    <div className="grid h-[calc(100vh-12rem)] grid-cols-1 gap-4 md:grid-cols-[16rem_1fr]">
      <aside className="hidden flex-col gap-2 md:flex">
        <Button size="sm" onClick={newChat} className="w-full">
          <Plus size={16} /> New chat
        </Button>
        <div className="flex-1 space-y-1 overflow-y-auto">
          {conversations?.map((c) => (
            <button
              key={c.id}
              onClick={() => void loadConversation(c.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm',
                conversationId === c.id
                  ? 'bg-surface-press-light text-ink-deep'
                  : 'text-muted hover:bg-surface-press-light',
              )}
            >
              <MessageSquare size={14} />
              <span className="truncate">
                {c.lastMessageAt ? ts(c.lastMessageAt) : ts(c.startedAt)}
              </span>
            </button>
          ))}
        </div>
        <Card className="p-3">
          <p className="flex items-center gap-1 text-xs font-semibold">
            <Sparkles size={12} className="text-accent-violet" /> What I can do
          </p>
          <ul className="mt-2 space-y-1 text-xs text-muted">
            <li>Manage cats, checklists &amp; health records</li>
            <li>Answer cat-care questions with sources</li>
            <li>@mention a column or cat for context</li>
            <li>Writes ask for your confirmation</li>
            <li>Resume past conversations from the list</li>
          </ul>
        </Card>
      </aside>

      <Card className="flex flex-col overflow-hidden p-0">
        <ChatPane />
      </Card>
    </div>
  );
}
