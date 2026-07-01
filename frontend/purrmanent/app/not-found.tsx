import Link from 'next/link';

export default function NotFound() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-canvas-dark px-6 text-center text-on-primary">
			<h1 className="font-display text-5xl font-bold">404</h1>
			<p className="text-on-dark-muted">This page wandered off like a cat.</p>
			<Link
				href="/dashboard"
				className="rounded-md bg-on-primary px-4 py-3 text-sm font-bold uppercase tracking-[0.2px] text-ink-deep"
			>
				Back to dashboard
			</Link>
		</main>
	);
}
