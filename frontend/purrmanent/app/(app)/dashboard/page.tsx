"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/app-shell";
import { Button, Spinner } from "@/components/ui";
import { useCats } from "@/features/cats/hooks";
import { CatsList } from "@/features/cats/cats-list";
import { GlobalOverview } from "@/features/checklist/global-overview";
import { PushPrompt } from "@/features/notifications/push-prompt";

export default function DashboardPage() {
  const { data: cats, isLoading } = useCats();

  return (
    <>
      <PageHeader
        title="Your cats"
        subtitle="Pick a cat to open its 90-day board."
        action={<PushPrompt />}
      />
      {isLoading ? (
        <Spinner className="size-6 text-accent-violet" />
      ) : cats && cats.length === 0 ? (
        <div className="rounded-xl border border-hairline-cloud p-8 text-center">
          <p className="mb-4 text-muted">
            Let&apos;s set up your first cat&apos;s plan.
          </p>
          <Button asChild>
            <Link href="/onboarding">Start onboarding</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          <GlobalOverview />
          <CatsList />
        </div>
      )}
    </>
  );
}
