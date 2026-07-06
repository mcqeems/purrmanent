import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/app-shell';
import { ProgressView } from '@/features/gamification/progress-view';

export const metadata: Metadata = {
	title: 'Progress | Purrmanent',
	description: 'Points, badges, and graduation milestones.',
};

export default function ProgressPage() {
  return (
    <>
      <PageHeader title="Progress" subtitle="Points, badges, and milestones." />
      <ProgressView />
    </>
  );
}
