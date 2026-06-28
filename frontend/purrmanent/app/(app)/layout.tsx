import type { ReactNode } from "react";
import { AuthGuard } from "@/features/auth/auth-guard";
import { UserMenu } from "@/features/auth/user-menu";
import { UnverifiedBanner } from "@/features/auth/unverified-banner";
import { AppShell } from "@/components/layout/app-shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AppShell navRight={<UserMenu />}>
        <UnverifiedBanner />
        {children}
      </AppShell>
    </AuthGuard>
  );
}
