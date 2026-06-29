'use client';

import { useMemo, useRef, useState } from 'react';
import { useActiveCat } from '@/features/cats/active-cat-provider';
import { cn } from '@/lib/utils/cn';

interface MentionOption {
  token: string;
  label: string;
  hint: string;
}

/**
 * Single-line input with @mention autocomplete. Columns (@todo/@progress/@done)
 * are resolved to contextMention server-side; cat mentions are plain context.
 */
export function MentionInput({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const { cats } = useActiveCat();
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeQuery, setActiveQuery] = useState<string | null>(null);

  const options = useMemo<MentionOption[]>(
    () => [
      { token: 'todo', label: '@todo', hint: 'your To-Do column' },
      {
        token: 'progress',
        label: '@progress',
        hint: 'your In-Progress column',
      },
      { token: 'done', label: '@done', hint: 'your Done column' },
      ...cats.map((c) => ({
        token: c.name.replace(/\s+/g, ''),
        label: `@${c.name}`,
        hint: 'cat',
      })),
    ],
    [cats],
  );

  const matches =
    activeQuery == null
      ? []
      : options.filter((o) =>
          o.token.toLowerCase().startsWith(activeQuery.toLowerCase()),
        );

  function handleChange(next: string) {
    onChange(next);
    const m = /@(\w*)$/.exec(
      next.slice(0, inputRef.current?.selectionStart ?? next.length),
    );
    setActiveQuery(m ? m[1] : null);
  }

  function pick(opt: MentionOption) {
    const replaced = value.replace(/@(\w*)$/, `@${opt.token} `);
    onChange(replaced);
    setActiveQuery(null);
    inputRef.current?.focus();
  }

  return (
    <div className="relative flex-1">
      {matches.length > 0 && (
        <ul className="absolute bottom-full mb-1 w-full overflow-hidden rounded-md border border-hairline-violet bg-surface-night text-on-primary shadow-lg">
          {matches.map((o) => (
            <li key={o.label}>
              <button
                type="button"
                onClick={() => pick(o)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-ink-deep"
              >
                <span className="font-medium">{o.label}</span>
                <span className="text-xs text-on-dark-muted">{o.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        ref={inputRef}
        value={value}
        disabled={disabled}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !activeQuery) onSubmit();
          if (e.key === 'Escape') setActiveQuery(null);
        }}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-md bg-ink-deep px-3 py-2 text-sm text-on-primary placeholder:text-on-dark-muted/60 focus:outline-none',
        )}
      />
    </div>
  );
}
