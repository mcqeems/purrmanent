'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/app-shell';
import { Button, Spinner } from '@/components/ui';
import { useCats } from '@/features/cats/hooks';
import { GlobalOverview } from '@/features/checklist/global-overview';
import { PushPrompt } from '@/features/notifications/push-prompt';
import { DashboardAsk } from '@/features/coach/dashboard-ask';
import { DashboardStats } from '@/features/dashboard/dashboard-stats';
import { SiteTour } from '@/features/onboarding/site-tour';
import { OnboardingModal } from '@/features/onboarding/onboarding-modal';

export default function DashboardPage() {
  const { data: cats, isLoading } = useCats();

  return (
    <>
      <OnboardingModal />
      <DashboardAsk />
      <PageHeader
        title="Overview"
        subtitle="Your cats and today's progress at a glance."
        action={
          <div className="flex items-center gap-3">
            <Link
              href="/cats"
              className="text-sm font-semibold text-accent-violet underline"
            >
              All cats
            </Link>
            <PushPrompt />
          </div>
        }
      />
      {isLoading ? (
        <Spinner className="size-6 text-accent-violet" />
      ) : cats && cats.length === 0 ? (
        <div className="rounded-xl border border-hairline-cloud p-8 text-center">
          <p className="mb-4 text-muted">
            Let&apos;s set up your first cat&apos;s plan.
          </p>
          <Button asChild variant="emboss">
            <Link href="/cats">Add a cat</Link>
          </Button>
        </div>
      ) : (
        <div data-tour="cats" className="space-y-8">
          <DashboardStats />
          <GlobalOverview />
        </div>
      )}
      <SiteTour />
    </>
  );
}
