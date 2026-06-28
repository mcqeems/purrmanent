import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Top navigation for the authenticated app (light canvas, DESIGN.md nav-bar-light).
 * `right` slot hosts the points pill / active-cat switcher / logout in later phases.
 */
export function Nav({ right }: { right?: ReactNode }) {
  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-hairline-cloud bg-surface-canvas-light px-6 py-4">
      <Link href="/dashboard" className="font-display text-xl font-bold text-ink-deep">
        Purrmanent
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <Link href="/dashboard" className="text-ink-deep hover:underline">
          Dashboard
        </Link>
        <Link href="/progress" className="text-ink-deep hover:underline">
          Progress
        </Link>
        <Link href="/crisis" className="text-accent-pink hover:underline">
          Crisis
        </Link>
        {right}
      </div>
    </nav>
  );
}
