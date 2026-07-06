import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/app-shell';
import { AllCats } from '@/features/cats/all-cats';

export const metadata: Metadata = {
	title: 'Your Cats | Purrmanent',
	description: 'Search, open, or add a cat.',
};

export default function CatsPage() {
  return (
    <>
      <PageHeader title="Your cats" subtitle="Search, open, or add a cat." />
      <AllCats />
    </>
  );
}
