import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface-canvas-dark px-6 text-center text-on-primary">
      <p className="text-sm font-medium uppercase tracking-[0.2px] text-accent-lime">
        90-day cat-parent guide
      </p>
      <h1 className="font-display text-5xl font-bold sm:text-6xl">Purrmanent</h1>
      <p className="max-w-md text-on-dark-muted">
        Turn the first months of cat adoption into a clear, day-by-day plan.
      </p>
      <Link
        href="/login"
        className="rounded-md bg-on-primary px-4 py-3 text-sm font-bold uppercase tracking-[0.2px] text-ink-deep"
      >
        Get started
      </Link>
    </main>
  );
}
