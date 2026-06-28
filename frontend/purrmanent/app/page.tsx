import Link from "next/link";
import {
  ListChecks,
  Siren,
  Sparkles,
  HeartPulse,
  Trophy,
  ClipboardList,
} from "lucide-react";
import { Button, Chip, Card } from "@/components/ui";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";

const FEATURES = [
  { icon: ClipboardList, title: "Personalized plan", body: "A short questionnaire builds a 90-day plan tailored to your cat." },
  { icon: ListChecks, title: "Kanban checklists", body: "Daily tasks and phase milestones across To-Do, In Progress, and Done." },
  { icon: Siren, title: "Crisis mode", body: "Step-by-step guided protocols the moment something goes wrong." },
  { icon: Sparkles, title: "AI coach", body: "Ask anything about cat care — and let it take actions for you." },
  { icon: HeartPulse, title: "Health log", body: "Track vaccinations, vet visits, and weight with reminders." },
  { icon: Trophy, title: "Progress & rewards", body: "Earn points and badges, and graduate at the finish line." },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-canvas-dark text-on-primary">
      <PublicHeader />

      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center sm:py-28">
        <p className="text-sm font-medium uppercase tracking-[0.2px] text-accent-lime">
          90-day cat-parent guide
        </p>
        <h1 className="font-display text-5xl font-bold leading-tight sm:text-6xl">
          The first 90 days, <Chip>made calm</Chip>
        </h1>
        <p className="max-w-xl text-lg text-on-dark-muted">
          Purrmanent turns the stressful early months of cat adoption into a
          clear, day-by-day plan — with checklists, health tracking, an AI coach,
          and a crisis mode for when you need it most.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild variant="inverted">
            <Link href="/register">Get started free</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </section>

      <section className="bg-surface-canvas-light py-16 text-ink-deep sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-2 text-center text-3xl font-semibold">
            Everything a new cat parent needs
          </h2>
          <p className="mb-10 text-center text-muted">
            Built around the 3-3-3 adjustment rule.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="flex flex-col gap-2">
                <Icon className="text-accent-violet" />
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted">{body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-night px-6 py-16 text-center">
        <h2 className="font-display text-3xl font-bold">
          Ready to help your cat settle in?
        </h2>
        <div className="mt-6">
          <Button asChild variant="inverted">
            <Link href="/register">Start your 90 days</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
