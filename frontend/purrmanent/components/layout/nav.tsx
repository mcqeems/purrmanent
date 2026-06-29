import Image from 'next/image';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';
import logo from '@/app/assets/logo/logo-1000x1000.png';

/**
 * Top navigation (light canvas, DESIGN.md nav-bar-light). The center links
 * collapse on mobile (the BottomNav takes over); the logo + `right` slot stay.
 */
export function Nav({ right }: { right?: ReactNode }) {
  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-hairline-cloud bg-surface-canvas-light px-4 py-3 sm:px-6">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Image
          src={logo}
          alt="Purrmanent logo"
          width={32}
          height={32}
          className="rounded-md"
          priority
        />
        <span className="font-display text-xl font-bold text-ink-deep">
          Purrmanent
        </span>
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <Link
          href="/dashboard"
          className="hidden text-ink-deep hover:underline sm:inline"
        >
          Dashboard
        </Link>
        <Link
          href="/cats"
          className="hidden text-ink-deep hover:underline sm:inline"
        >
          Cats
        </Link>
        <Link
          href="/coach"
          className="hidden text-ink-deep hover:underline sm:inline"
        >
          Coach
        </Link>
        <Link
          href="/progress"
          className="hidden text-ink-deep hover:underline sm:inline"
        >
          Progress
        </Link>
        <Link
          href="/crisis"
          data-tour="crisis"
          className="hidden items-center gap-1 rounded-full bg-danger px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2px] text-on-primary hover:opacity-90 sm:inline-flex"
        >
          <AlertTriangle size={14} /> Crisis
        </Link>
        {right}
      </div>
    </nav>
  );
}
