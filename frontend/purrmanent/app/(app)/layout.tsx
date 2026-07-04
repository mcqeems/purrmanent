import type { ReactNode } from 'react';
import { AuthGuard } from '@/features/auth/auth-guard';
import { UnverifiedBanner } from '@/features/auth/unverified-banner';
import { CopilotProvider } from '@/features/coach/copilot-provider';
import { AppShell } from '@/components/layout/app-shell';

export default function AppLayout({ children }: { children: ReactNode }) {
	return (
		<AuthGuard>
			<CopilotProvider>
				<AppShell>
					<UnverifiedBanner />
					{children}
				</AppShell>
			</CopilotProvider>
		</AuthGuard>
	);
}
