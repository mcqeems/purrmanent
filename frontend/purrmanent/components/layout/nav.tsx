import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import logo from "@/app/assets/logo/logo-1000x1000.png";

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
        <Link href="/dashboard" className="hidden text-ink-deep hover:underline sm:inline">
          Dashboard
        </Link>
        <Link href="/coach" className="hidden text-ink-deep hover:underline sm:inline">
          Coach
        </Link>
        <Link href="/progress" className="hidden text-ink-deep hover:underline sm:inline">
          Progress
        </Link>
        <Link href="/crisis" className="hidden text-accent-pink hover:underline sm:inline">
          Crisis
        </Link>
        {right}
      </div>
    </nav>
  );
}
