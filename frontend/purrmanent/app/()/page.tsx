'use client';

import Link from 'next/link';
import {
  ListChecks,
  Siren,
  Sparkles,
  HeartPulse,
  Trophy,
  ClipboardList,
  ShieldCheck,
  Building,
  Heart,
  Calendar,
} from 'lucide-react';
import { Button, Chip, Card, Stagger, FadeInItem } from '@/components/ui';
import CircularText from '@/components/CircularText';
import BlurText from '@/components/BlurText';
import ShinyText from '@/components/ShinyText';
import Image from 'next/image';
import Logo from '@/app/assets/logo/logo-1000x1000.png';

const FEATURES = [
  {
    icon: ClipboardList,
    title: 'Context-Aware Onboarding',
    body: 'A comprehensive questionnaire capturing cat personality (shy, active, balanced) and owner experience to deterministically adapt the 90-day plan.',
  },
  {
    icon: ListChecks,
    title: 'Daily & Phase Kanban Checklists',
    body: 'Organize tasks into To-Do, In Progress, and Done. Features a daily task view that resets at midnight (00:00 WIB) and 90-day milestone phases.',
  },
  {
    icon: Siren,
    title: 'Vet-Reviewed Crisis Mode',
    body: 'Instant access to step-by-step swipeable emergency protocols for critical scenarios like fasting, aggression, hiding, and lethargy.',
  },
  {
    icon: Sparkles,
    title: 'AI Behaviorist Copilot (RAG)',
    body: 'A floating AI chat assistant backed by vet-reviewed behavior documents. Support @mention commands to reference specific Kanban tasks.',
  },
  {
    icon: HeartPulse,
    title: 'Interactive Health Log',
    body: 'Track weight changes, log vaccinations, record deworming doses, and set automated reminders to keep your new cat healthy.',
  },
  {
    icon: Trophy,
    title: 'Gamification & Graduation',
    body: 'Earn points and badges in real-time as you complete daily checklist goals. Graduate on Day 90 with a printable digital certificate.',
  },
];

const TIMELINE_PHASES = [
  {
    day: 'Days 1 - 3',
    title: 'Decompression',
    description:
      'Focus on setting up a quiet "safe zone". Your cat may hide, sleep, and eat sparingly. Keep food and water separated from the litter box.',
    focus: 'Safety & quiet space setup',
  },
  {
    day: 'Weeks 1 - 3',
    title: 'Building Routine',
    description:
      'Your cat begins to explore the environment and understand feeding schedules. Introduce interactive play and establish clear daily rhythms.',
    focus: 'Feeding schedules & interactive play',
  },
  {
    day: 'Months 1 - 3',
    title: 'Home Integration',
    description:
      'Building deep bonds of trust and mutual comfort. The cat feels secure, starts displaying their true personality, and integrates fully.',
    focus: 'Bonding, confidence & graduation',
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-canvas-dark text-on-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center justify-center pt-28 pb-20 px-6 text-center bg-surface-canvas-dark">
        <Stagger
          viewport={false}
          delay={0.12}
          className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6"
        >
          <FadeInItem yOffset={8}>
            <ShinyText
              text="90-DAY CAT-PARENT GUIDE"
              className="text-xs font-semibold uppercase tracking-[2px]"
              color="#bdb8c0"
              shineColor="#c2ef4e"
              speed={3}
            />
          </FadeInItem>

          <FadeInItem yOffset={12}>
            <h1 className="font-display text-5xl font-bold leading-tight sm:text-7xl relative">
              The first 90 days
              <CircularText
                text="PURRMANENT • PURRMANENT • "
                spinDuration={10}
                radius={50}
                className="text-xl scale-75 text-accent-lime tracking-[1.5px] font-mono opacity-80 hover:opacity-100 transition-opacity absolute -right-25 -top-20"
              />
              <span className="block mt-2">
                <Chip className="bg-accent-lime text-ink-deep font-bold px-4 py-1 inline-block">
                  made calm
                </Chip>
              </span>
            </h1>
          </FadeInItem>

          <FadeInItem yOffset={16}>
            <div className="max-w-xl text-lg text-on-dark-muted leading-relaxed mt-2">
              <BlurText
                text="Purrmanent turns the stressful early months of cat adoption into a clear, interactive roadmap. Get checklists, health logs, an AI coach, and vet-approved crisis support."
                delay={25}
                animateBy="words"
              />
            </div>
          </FadeInItem>

          <FadeInItem yOffset={20}>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Button asChild variant="inverted" size="lg" className="px-8">
                <Link href="/register">Get started free</Link>
              </Button>
              <Button
                asChild
                variant="ghost-on-dark"
                size="lg"
                className="px-8"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </FadeInItem>
        </Stagger>
      </section>

      {/* 3-3-3 Rule Roadmap Section */}
      <section className="bg-surface-night py-20 px-6 border-t border-hairline-violet/30">
        <div className="mx-auto max-w-5xl">
          <FadeInItem
            viewport={true}
            yOffset={20}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3.5xl font-bold text-on-primary">
              The 3-3-3 Rule of Cat Adoption
            </h2>
            <p className="text-on-dark-muted mt-3 max-w-xl mx-auto">
              A scientific guide to how shelter cats decompress, build
              confidence, and integrate into their new home.
            </p>
          </FadeInItem>

          <Stagger
            viewport={true}
            delay={0.1}
            className="grid gap-6 md:grid-cols-3 relative"
          >
            {TIMELINE_PHASES.map((p, idx) => (
              <FadeInItem key={p.title} yOffset={24} className="h-full">
                <div className="relative bg-surface-canvas-dark p-6 rounded-xl border border-hairline-violet/40 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-[1px] text-accent-lime bg-accent-lime/10 px-2.5 py-1 rounded-full">
                        {p.day}
                      </span>
                      <span className="font-display text-lg font-bold text-on-dark-faint">
                        0{idx + 1}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-on-primary mb-2">
                      {p.title}
                    </h3>
                    <p className="text-sm text-on-dark-muted leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-hairline-violet/20 flex items-center gap-2">
                    <Calendar size={14} className="text-accent-violet" />
                    <span className="text-xs text-accent-violet font-semibold">
                      Focus: {p.focus}
                    </span>
                  </div>
                </div>
              </FadeInItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="bg-surface-canvas-light py-20 text-ink-deep sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <FadeInItem
            viewport={true}
            yOffset={20}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold text-ink-deep">
              Everything a new cat parent needs
            </h2>
            <p className="text-muted mt-2">
              Actionable tools to guide you from shelter transition to stable
              integration.
            </p>
          </FadeInItem>

          <Stagger
            viewport={true}
            delay={0.08}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <FadeInItem key={title} yOffset={20} className="h-full">
                <Card className="flex flex-col gap-3 p-6 bg-surface-canvas-light text-ink-deep border border-hairline-cloud rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all h-full">
                  <div className="size-10 rounded-lg bg-accent-violet/10 flex items-center justify-center text-accent-violet">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-ink-deep">{title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{body}</p>
                </Card>
              </FadeInItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* B2B2C Shelter Sponsorship Section */}
      <section className="bg-surface-night py-20 px-6 border-t border-hairline-violet/30 text-center md:text-left">
        <FadeInItem viewport={true} yOffset={30}>
          <div className="mx-auto max-w-4xl bg-surface-canvas-dark p-8 md:p-12 rounded-2xl border border-hairline-violet/50 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-accent-lime uppercase tracking-[1px] bg-accent-lime/10 px-3 py-1.5 rounded-full">
                <ShieldCheck size={14} /> B2B2C Partnership Model
              </div>
              <h2 className="font-display text-3xl font-bold text-on-primary">
                Sponsored by Shelters.
                <br />
                Free for Adopters.
              </h2>
              <p className="text-on-dark-muted max-w-lg leading-relaxed text-sm">
                We partner with progressive shelters to reduce pet abandonment.
                Shelters license Purrmanent to automatically guide adopters
                through the critical first 90 days.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <div className="size-8 rounded-full bg-accent-violet/20 flex items-center justify-center text-accent-violet">
                    <Building size={16} />
                  </div>
                  <span className="text-xs text-on-dark-muted font-medium">
                    Lower shelter returns
                  </span>
                </div>
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <div className="size-8 rounded-full bg-accent-violet/20 flex items-center justify-center text-accent-violet">
                    <Heart size={16} />
                  </div>
                  <span className="text-xs text-on-dark-muted font-medium">
                    Happier, settled cats
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Button
                asChild
                variant="inverted"
                size="lg"
                className="px-8 shadow-lg"
              >
                <Link href="/register">Adopt with Purrmanent</Link>
              </Button>
            </div>
          </div>
        </FadeInItem>
      </section>

      {/* CTA Section */}
      <section className="bg-surface-canvas-dark px-6 py-20 text-center border-t border-hairline-violet/20">
        <FadeInItem viewport={true} yOffset={24}>
          <h2 className="font-display text-4xl font-bold text-on-primary">
            Ready to help your cat settle in?
          </h2>
          <p className="text-on-dark-muted mt-3 mb-8 max-w-sm mx-auto">
            Start your 90-day interactive guide today and build a permanent
            bond.
          </p>
          <div>
            <Button
              asChild
              variant="inverted"
              size="lg"
              className="px-8 shadow-xl"
            >
              <Link href="/register">Start your 90 days</Link>
            </Button>
          </div>
        </FadeInItem>
      </section>
    </div>
  );
}
