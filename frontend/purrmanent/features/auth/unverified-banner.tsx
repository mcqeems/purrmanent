'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { authClient, useSession } from '@/lib/auth/client';
import { useToast } from '@/components/ui';

// Dismissal is per-tab-session only: sessionStorage clears the closed state on
// refresh/new session but keeps it closed for the rest of the current browser session.
const DISMISS_KEY = 'purrmanent.unverifiedBannerDismissed';

/**
 * Soft banner for unverified accounts. [BACKEND-TRUTH] verification is optional
 * (BACKEND_IMPLEMENTATION.md §6.7), so we nudge rather than block.
 */
export function UnverifiedBanner() {
	const { data } = useSession();
	const { toast } = useToast();
	const [sent, setSent] = useState(false);
	const [dismissed, setDismissed] = useState(
		() => typeof window !== 'undefined' && sessionStorage.getItem(DISMISS_KEY) === '1',
	);
	const user = data?.user;

	if (!user || user.emailVerified || dismissed) return null;

	function dismiss() {
		sessionStorage.setItem(DISMISS_KEY, '1');
		setDismissed(true);
	}

	async function resend() {
		if (!user) return;
		await authClient.sendVerificationEmail({
			email: user.email,
			callbackURL: `${window.location.origin}/dashboard`,
		});
		setSent(true);
		toast({ tone: 'success', description: 'Verification email sent.' });
	}

	return (
		<div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-accent-pink/40 bg-accent-pink/10 px-4 py-3 text-sm text-ink-deep">
			<span>Please verify your email to secure your account.</span>
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={resend}
					disabled={sent}
					className="font-semibold text-accent-violet hover:underline disabled:opacity-60 cursor-pointer"
				>
					{sent ? 'Sent' : 'Resend email'}
				</button>
				<button
					type="button"
					onClick={dismiss}
					aria-label="Dismiss"
					className="text-ink-deep/60 hover:text-ink-deep cursor-pointer"
				>
					<X className="size-4" />
				</button>
			</div>
		</div>
	);
}
