import Link from 'next/link';
import { Button, Card } from '@/components/ui';

const PHASES = [
  { k: '3 days', v: 'to decompress and feel safe in a quiet space.' },
  { k: '3 weeks', v: 'to learn your routine and start to settle.' },
  { k: '3 months', v: 'to feel fully at home and bonded with you.' },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-canvas-dark text-on-primary">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-4xl font-bold">About Purrmanent</h1>
        <p className="mt-4 text-lg text-on-dark-muted">
          Bringing home a new cat is joyful — and overwhelming. Purrmanent gives
          first-time and seasoned cat parents a calm, structured path through
          the critical first 90 days, so you always know what to do next.
        </p>

        <h2 className="mt-12 text-2xl font-semibold">The 3-3-3 rule</h2>
        <p className="mt-2 text-on-dark-muted">
          A newly adopted cat&apos;s adjustment tends to follow a rhythm. Our
          plan is built around it:
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {PHASES.map((p) => (
            <Card key={p.k} variant="feature-dark">
              <p className="font-display text-2xl font-bold text-accent-lime">
                {p.k}
              </p>
              <p className="mt-2 text-sm text-on-dark-muted">{p.v}</p>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <Button asChild variant="inverted">
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
