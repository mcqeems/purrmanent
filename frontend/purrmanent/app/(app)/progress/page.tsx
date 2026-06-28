import { PageHeader } from "@/components/layout/app-shell";
import { ProgressView } from "@/features/gamification/progress-view";

export default function ProgressPage() {
  return (
    <>
      <PageHeader title="Progress" subtitle="Points, badges, and milestones." />
      <ProgressView />
    </>
  );
}
