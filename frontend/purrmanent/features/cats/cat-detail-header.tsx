'use client';

import Link from 'next/link';
import { differenceInCalendarDays, format, parseISO, isValid } from 'date-fns';
import { HeartPulse, AlertTriangle, Settings } from 'lucide-react';
import { Pill, Spinner } from '@/components/ui';
import { useCat } from './hooks';

function fmtDate(d: string) {
  const date = parseISO(d);
  return isValid(date) ? format(date, 'MMM d, yyyy') : d;
}

export function CatDetailHeader({ catId }: { catId: number }) {
  const { data: cat, isLoading, isError } = useCat(catId);

  if (isLoading) return <Spinner className="size-6 text-accent-violet" />;
  if (isError || !cat)
    return <p className="text-sm text-accent-pink">Could not load this cat.</p>;

  const day = Math.min(
    Math.max(
      differenceInCalendarDays(new Date(), parseISO(cat.adoptionDate)) + 1,
      1,
    ),
    90,
  );
  const initials = cat.name.slice(0, 2).toUpperCase();

  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {cat.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cat.photoUrl}
            alt={cat.name}
            className="size-16 rounded-xl object-cover"
          />
        ) : (
          <div className="flex size-16 items-center justify-center rounded-xl bg-accent-violet-deep text-xl font-bold text-on-primary">
            {initials}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-ink-deep">{cat.name}</h1>
            <Pill tone="lime">{cat.personality}</Pill>
          </div>
          <p className="text-sm text-muted">
            {[
              cat.breed ?? 'Cat',
              cat.gender,
              cat.ageMonths != null ? `${cat.ageMonths} mo` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <p className="text-xs text-muted">
            Adopted {fmtDate(cat.adoptionDate)} · Day {day} of 90
          </p>
        </div>
      </div>
      <div className="flex gap-2 text-sm">
        <Link
          href={`/cats/${cat.id}/health`}
          className="inline-flex items-center gap-1 rounded-md border border-hairline-cool px-3 py-2 text-ink-deep hover:bg-surface-press-light"
        >
          <HeartPulse size={16} /> Health
        </Link>
        <Link
          href="/crisis"
          className="inline-flex items-center gap-1 rounded-md border border-hairline-cool px-3 py-2 text-accent-pink hover:bg-surface-press-light"
        >
          <AlertTriangle size={16} /> Crisis
        </Link>
        <Link
          href={`/cats/${cat.id}/settings`}
          className="inline-flex items-center gap-1 rounded-md border border-hairline-cool px-3 py-2 text-muted hover:bg-surface-press-light"
        >
          <Settings size={16} /> Settings
        </Link>
      </div>
    </header>
  );
}
