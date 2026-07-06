import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/app-shell';
import { BackButton } from '@/components/layout/back-button';
import { HealthView } from '@/features/health/health-view';

export const metadata: Metadata = {
	title: 'Health Log | Purrmanent',
	description: 'Vaccinations, vet visits, weight, and reminders.',
};

export default async function CatHealthPage({
  params,
}: {
  params: Promise<{ catId: string }>;
}) {
  const { catId } = await params;
  return (
    <>
      <BackButton href={`/cats/${catId}`} label="Back to board" />
      <PageHeader
        title="Health log"
        subtitle="Vaccinations, vet visits, weight, and reminders."
      />
      <HealthView catId={Number(catId)} />
    </>
  );
}
