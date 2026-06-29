import type { ReactNode } from 'react';
import { AuthGuard } from '@/features/auth/auth-guard';
import { UserMenu } from '@/features/auth/user-menu';
import { UnverifiedBanner } from '@/features/auth/unverified-banner';
import { ActiveCatProvider } from '@/features/cats/active-cat-provider';
import { PointsPill } from '@/features/gamification/points-pill';
import { CopilotProvider } from '@/features/coach/copilot-provider';
import { AppShell } from '@/components/layout/app-shell';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <ActiveCatProvider>
        <CopilotProvider>
          <AppShell
            navRight={
              <>
                <PointsPill />
                <UserMenu />
              </>
            }
          >
            <UnverifiedBanner />
            {children}
          </AppShell>
        </CopilotProvider>
      </ActiveCatProvider>
    </AuthGuard>
  );
}
