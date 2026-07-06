import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/app-shell';
import { BackButton } from '@/components/layout/back-button';
import { EditCat } from '@/features/cats/edit-cat';

export const metadata: Metadata = {
	title: 'Cat Settings | Purrmanent',
	description: 'Update your cat\'s details.',
};

export default async function CatSettingsPage({
  params,
}: {
  params: Promise<{ catId: string }>;
}) {
  const { catId } = await params;
  return (
    <>
      <BackButton href={`/cats/${catId}`} label="Back to board" />
      <PageHeader title="Cat settings" subtitle="Update your cat's details." />
      <EditCat catId={Number(catId)} />
    </>
  );
}
