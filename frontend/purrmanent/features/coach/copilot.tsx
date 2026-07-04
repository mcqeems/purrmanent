'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { MessageCircle, Send, X } from 'lucide-react';
import { Button, Pill, Markdown } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { useCopilot } from './copilot-provider';

function CoachChatPanel() {
  const [input, setInput] = useState('');
  const { messages, streaming, send, confirm, setOpen } = useCopilot();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  function submit() {
    if (!input.trim()) return;
    void send(input);
    setInput('');
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-surface-night text-on-primary">
      <header className="flex items-center justify-between border-b border-hairline-violet px-4 py-3 bg-surface-night text-on-primary">
        <span className="font-semibold text-sm">AI Coach</span>
        <button 
          onClick={() => setOpen(false)} 
          aria-label="Close" 
          className="text-on-dark-muted hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto p-4 text-sm bg-surface-night text-on-primary"
      >
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
              'max-w-[85%] rounded-md px-3 py-2 text-sm',
              m.role === 'user'
                ? 'ml-auto bg-accent-violet-deep text-on-primary'
                : 'bg-ink-deep text-on-primary',
            )}
          >
            <div className="break-words">
              <Markdown content={m.content || '…'} dark />
            </div>

            {m.sources && m.sources.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {m.sources.map((s, i) => (
                  <Pill key={i} tone="lime">
                    {s.source ?? 'source'}
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

      <div className="flex items-center gap-2 border-t border-hairline-violet p-3 bg-surface-night">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder="Ask the coach…"
          className="flex-1 rounded-md bg-ink-deep px-3 py-2 text-sm text-on-primary placeholder:text-on-dark-muted/60 focus:outline-none"
        />
        <Button
          size="sm"
          onClick={submit}
          disabled={streaming}
          aria-label="Send"
          className="bg-accent-violet hover:bg-accent-violet-deep text-white"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}

export function Copilot() {
  const pathname = usePathname();
  const { open, setOpen } = useCopilot();
  const managerRef = useRef<any>(null);

  const [iconContainer] = useState(() => {
    if (typeof window === 'undefined') return null;
    const el = document.createElement('div');
    el.className = 'flex h-full w-full items-center justify-center text-white';
    return el;
  });

  const [panelContainer] = useState(() => {
    if (typeof window === 'undefined') return null;
    const el = document.createElement('div');
    el.className = 'h-full';
    return el;
  });

  useEffect(() => {
    if (pathname === '/coach') {
      managerRef.current?.destroy();
      managerRef.current = null;
      return;
    }

    if (!iconContainer || !panelContainer) return;

    import('@hyperplexed/bubbles').then(({ createBubbles }) => {
      // Avoid duplicate instantiation
      if (managerRef.current) return;

      const manager = createBubbles({
        theme: 'dark',
        colors: {
          bubbleSurface: '#6a5fc1', // Accent Violet
          focusRing: '#c2ef4e',      // Electric Lime
          panelSurface: '#150f23',   // Midnight Violet
          panelText: '#ffffff',
          dismissSurface: '#e5484d',
          dismissIcon: '#ffffff',
        },
        panelWidth: 400,
        panelMaxHeight: '80%',
      });

      managerRef.current = manager;

      manager.add({
        id: 'coach',
        label: 'AI Coach',
        icon: iconContainer,
        content: panelContainer,
        onDismiss: () => {
          setOpen(false);
        },
      });

      // Sync initial state
      const state = manager.state();
      if (open && state === 'docked') {
        manager.activate('coach');
      }
    });

    return () => {
      managerRef.current?.destroy();
      managerRef.current = null;
    };
  }, [pathname, iconContainer, panelContainer, setOpen, open]);

  // Sync open state from context to bubble
  useEffect(() => {
    if (pathname === '/coach') return;
    const manager = managerRef.current;
    if (!manager) return;
    const state = manager.state();
    if (open && state === 'docked') {
      manager.activate('coach');
    } else if (!open && state === 'open') {
      manager.toggle();
    }
  }, [open, pathname]);

  // Sync state changes from bubble to context
  useEffect(() => {
    if (pathname === '/coach') return;
    const manager = managerRef.current;
    if (!manager) return;
    const off = manager.on('statechange', ({ state }: { state: string }) => {
      setOpen(state === 'open');
    });
    return off;
  }, [setOpen, pathname]);

  if (pathname === '/coach' || !iconContainer || !panelContainer) return null;

  return (
    <>
      {createPortal(
        <MessageCircle size={24} className="stroke-[2.5]" />,
        iconContainer
      )}
      {createPortal(
        <CoachChatPanel />,
        panelContainer
      )}
    </>
  );
}
