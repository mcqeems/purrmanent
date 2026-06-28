import type { ReactNode } from "react";
import { Nav } from "./nav";
import { BottomNav } from "./bottom-nav";

export function AppShell({
  children,
  navRight,
}: {
  children: ReactNode;
  navRight?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-canvas-light">
      <Nav right={navRight} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-8 sm:pb-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink-deep">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
