import type { ReactNode } from 'react';
import { AppSidebar } from './app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui';
import { PageTransition } from '@/components/ui/motion';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-surface-canvas-light">
        <header className="sticky top-0 z-40 flex items-center gap-2 border-b border-hairline-cloud bg-surface-canvas-light px-4 py-3 sm:px-6">
          <SidebarTrigger />
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </SidebarInset>
    </SidebarProvider>
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
