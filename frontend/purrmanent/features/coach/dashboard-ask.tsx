'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowUp } from 'lucide-react';

const SUGGESTIONS = [
  'How often should I feed my cat?',
  'Add a new cat',
  'What should I do today?',
];

export function DashboardAsk() {
  const router = useRouter();
  const [value, setValue] = useState('');

  function submit(text: string) {
    const t = text.trim();
    if (!t) return;
    setValue('');
    router.push('/coach');
  }

  return (
    <div
      data-tour="ask"
      className="mb-8 rounded-xl bg-surface-night p-4 text-on-primary sm:p-6"
    >
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={18} className="text-accent-lime" />
        <span className="font-semibold">Ask your AI coach</span>
      </div>
      <div className="flex items-center gap-2 rounded-md bg-ink-deep px-3 py-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit(value)}
          placeholder="Ask anything about cat care, or “add a cat”…"
          className="flex-1 bg-transparent text-sm text-on-primary placeholder:text-on-dark-muted/60 focus:outline-none"
        />
        <button
          onClick={() => submit(value)}
          aria-label="Ask"
          className="flex size-8 items-center justify-center rounded-full bg-accent-lime text-ink-deep disabled:opacity-50"
          disabled={!value.trim()}
        >
          <ArrowUp size={16} />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => submit(s)}
            className="rounded-full border border-hairline-violet px-3 py-1 text-xs text-on-dark-muted hover:border-accent-lime hover:text-on-primary"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
