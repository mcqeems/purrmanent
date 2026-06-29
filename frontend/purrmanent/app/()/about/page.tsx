'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button, Card, Stagger, FadeInItem } from '@/components/ui';
import { ShieldAlert, Award, FileText } from 'lucide-react';
import ShinyText from '@/components/ShinyText';
import cozyCatImg from '@/public/images/cozy_cat.png';

const PHASES = [
  {
    k: '3 Days',
    title: 'Decompression',
    v: 'To decompress and feel safe in a quiet, isolated space. In this phase, cats often hide, scare easily, and may refuse to eat. The goal is safety and silence.',
  },
  {
    k: '3 Weeks',
    title: 'Routine Building',
    v: 'To learn your daily routine and start settling in. Your cat starts exploring their territory, gets comfortable with feeding times, and begins showing personality.',
  },
  {
    k: '3 Months',
    title: 'Home Integration',
    v: 'To feel fully at home, secure, and bonded with you. The cat realizes they are in a safe, permanent environment, building a lifelong attachment.',
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-canvas-dark text-on-primary pt-28 pb-16">
      <main className="mx-auto max-w-5xl px-6">
        
        {/* Title Section */}
        <Stagger viewport={false} delay={0.1} className="text-center md:text-left mb-12">
          <FadeInItem yOffset={8}>
            <ShinyText
              text="OUR MISSION"
              className="text-xs font-bold uppercase tracking-[2px] text-accent-lime"
              color="#c2ef4e"
              shineColor="#ffffff"
              speed={2.5}
            />
          </FadeInItem>
          <FadeInItem yOffset={12}>
            <h1 className="font-display text-4xl font-bold mt-2 sm:text-5xl">
              About Purrmanent
            </h1>
          </FadeInItem>
          <FadeInItem yOffset={16}>
            <p className="mt-4 text-lg text-on-dark-muted max-w-2xl leading-relaxed">
              Every cat deserves a permanent, loving home. We digitize proven animal welfare methodologies to support new adopters through the critical transition window.
            </p>
          </FadeInItem>
        </Stagger>

        {/* Narrative & Image Section */}
        <section className="grid gap-12 md:grid-cols-12 items-center mb-16">
          <Stagger viewport={true} delay={0.12} className="md:col-span-7 space-y-6 text-sm text-on-dark-muted leading-relaxed">
            <FadeInItem yOffset={16}>
              <h2 className="font-display text-2xl font-bold text-on-primary">
                The Post-Adoption Support Gap
              </h2>
            </FadeInItem>
            <FadeInItem yOffset={16}>
              <p>
                According to the <strong className="text-on-primary">ASPCA (2025)</strong>, over <strong className="text-on-primary">4.2 million animals</strong> are adopted from shelters in the United States every year. However, post-adoption statistics reveal a sobering truth: up to <strong className="text-on-primary">20% of adopted pets are returned</strong> to shelters within their first 6 months.
              </p>
            </FadeInItem>
            <FadeInItem yOffset={16}>
              <p>
                This isn&apos;t due to a lack of love, but a lack of preparation. New owners often panic when a cat hides under the couch for days, refuses to eat, or displays initial territorial anxiety. Without support, panic leads to surrender.
              </p>
            </FadeInItem>
            <FadeInItem yOffset={16}>
              <div className="bg-surface-night p-5 rounded-xl border border-hairline-violet/30 flex items-start gap-4">
                <div className="size-10 rounded-lg bg-accent-lime/10 flex items-center justify-center text-accent-lime shrink-0">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-accent-lime mb-1">
                    Maddie&apos;s Fund Behavior Study
                  </h4>
                  <p className="text-xs leading-normal">
                    Research shows that providing structured post-adoption behavioral support reduces return rates from <strong className="text-on-primary">25% down to 9.4%</strong> — a massive <strong className="text-on-primary">62% relative reduction</strong> in returns.
                  </p>
                </div>
              </div>
            </FadeInItem>
            <FadeInItem yOffset={16}>
              <p>
                Purrmanent fills this gap. We translate paper booklets and oral shelter instructions into a live, interactive 90-day survival companion that keeps cats safe and owners confident.
              </p>
            </FadeInItem>
          </Stagger>

          <FadeInItem viewport={true} yOffset={24} className="md:col-span-5 flex justify-center">
            <div className="relative rounded-2xl overflow-hidden border border-hairline-violet/60 shadow-2xl max-w-sm md:max-w-full">
              <Image
                src={cozyCatImg}
                alt="Happy settled cat in a cozy home environment"
                className="w-full h-auto object-cover"
                priority
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-surface-night via-surface-night/70 to-transparent p-4 text-center">
                <p className="text-xs text-on-dark-muted italic">
                  A settled cat is a permanent cat. 🐾
                </p>
              </div>
            </div>
          </FadeInItem>
        </section>

        {/* Detailed 3-3-3 Rule Section */}
        <section className="bg-surface-night p-8 rounded-2xl border border-hairline-violet/40 mb-12">
          <FadeInItem viewport={true} yOffset={16} className="mb-8">
            <h2 className="font-display text-2.5xl font-bold text-on-primary">
              The 3-3-3 Rule Framework
            </h2>
            <p className="text-sm text-on-dark-muted mt-2">
              Our 90-day plan is structured deterministically around the industry-recognized stages of feline acclimatization.
            </p>
          </FadeInItem>

          <Stagger viewport={true} delay={0.1} className="grid gap-6 md:grid-cols-3">
            {PHASES.map((p, idx) => (
              <FadeInItem key={p.k} yOffset={20} className="h-full">
                <Card variant="feature-dark" className="p-6 bg-surface-canvas-dark border border-hairline-violet/30 h-full">
                  <span className="font-display text-3xl font-extrabold text-accent-lime block mb-1">
                    {p.k}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[1px] text-accent-violet block mb-3">
                    Phase 0{idx + 1}: {p.title}
                  </span>
                  <p className="text-xs text-on-dark-muted leading-relaxed">
                    {p.v}
                  </p>
                </Card>
              </FadeInItem>
            ))}
          </Stagger>
        </section>

        {/* Feature Highlights on About Page */}
        <Stagger viewport={true} delay={0.1} className="grid gap-6 md:grid-cols-2 mb-12">
          <FadeInItem yOffset={20}>
            <Card className="p-6 bg-surface-canvas-dark border border-hairline-violet/30 flex items-start gap-4 h-full">
              <div className="size-10 rounded-lg bg-accent-violet/20 flex items-center justify-center text-accent-violet shrink-0">
                <Award size={20} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-on-primary mb-1">
                  Gamification & Reinforcement
                </h3>
                <p className="text-xs text-on-dark-muted leading-relaxed">
                  By rewarding daily progress with points, we encourage adopters to check on their cats regularly. Completing the full program builds a lifetime habit of routine veterinary care.
                </p>
              </div>
            </Card>
          </FadeInItem>

          <FadeInItem yOffset={20}>
            <Card className="p-6 bg-surface-canvas-dark border border-hairline-violet/30 flex items-start gap-4 h-full">
              <div className="size-10 rounded-lg bg-accent-violet/20 flex items-center justify-center text-accent-violet shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-on-primary mb-1">
                  B2B2C Shelter Integration
                </h3>
                <p className="text-xs text-on-dark-muted leading-relaxed">
                  We license Purrmanent to shelters. Shelters receive aggregated, anonymous metrics regarding post-adoption cohort wellness and common struggles, enabling them to improve pre-adoption counseling.
                </p>
              </div>
            </Card>
          </FadeInItem>
        </Stagger>

        {/* Call to Action */}
        <FadeInItem viewport={true} yOffset={20} className="flex justify-center gap-4 mt-8">
          <Button asChild variant="inverted" size="lg">
            <Link href="/register">Get started now</Link>
          </Button>
          <Button asChild variant="ghost-on-dark" size="lg">
            <Link href="/">Back to home</Link>
          </Button>
        </FadeInItem>
      </main>
    </div>
  );
}
