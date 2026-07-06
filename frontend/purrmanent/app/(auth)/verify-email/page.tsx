import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'Verify Email | Purrmanent',
	description: 'Check your inbox to verify your email address.',
};

export default function VerifyEmailPage() {
  return (
    <div className="space-y-4 text-center">
      <h1 className="text-2xl font-semibold">Check your inbox</h1>
      <p className="text-sm text-on-dark-muted">
        We sent you a verification link (valid for 24 hours). You can keep using
        Purrmanent while you verify.
      </p>
      <Link
        href="/dashboard"
        className="inline-block rounded-md bg-on-primary px-4 py-3 text-sm font-bold uppercase tracking-[0.2px] text-ink-deep"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
