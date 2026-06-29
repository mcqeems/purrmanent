'use client';

import { useState } from 'react';
import { authClient, useSession } from '@/lib/auth/client';
import { useToast } from '@/components/ui';

/**
 * Soft banner for unverified accounts. [BACKEND-TRUTH] verification is optional
 * (BACKEND_IMPLEMENTATION.md §6.7), so we nudge rather than block.
 */
export function UnverifiedBanner() {
  const { data } = useSession();
  const { toast } = useToast();
  const [sent, setSent] = useState(false);
  const user = data?.user;

  if (!user || user.emailVerified) return null;

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
      <button
        type="button"
        onClick={resend}
        disabled={sent}
        className="font-semibold text-accent-violet underline disabled:opacity-60"
      >
        {sent ? 'Sent' : 'Resend email'}
      </button>
    </div>
  );
}
