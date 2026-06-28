import type { ReactNode } from "react";
import { AuthGuard } from "@/features/auth/auth-guard";
import { UserMenu } from "@/features/auth/user-menu";
import { UnverifiedBanner } from "@/features/auth/unverified-banner";
import { ActiveCatProvider } from "@/features/cats/active-cat-provider";
import { CatSwitcher } from "@/features/cats/cat-switcher";
import { AppShell } from "@/components/layout/app-shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <ActiveCatProvider>
        <AppShell
          navRight={
            <>
              <CatSwitcher />
              <UserMenu />
            </>
          }
        >
          <UnverifiedBanner />
          {children}
        </AppShell>
      </ActiveCatProvider>
    </AuthGuard>
  );
}
