import type { Metadata } from 'next';
import { CatDetailHeader } from '@/features/cats/cat-detail-header';
import { CatBoard } from '@/features/checklist/cat-board';

export const metadata: Metadata = {
	title: 'Cat Board | Purrmanent',
	description: 'Daily checklist and task board for your cat.',
};

export default async function CatBoardPage({
  params,
}: {
  params: Promise<{ catId: string }>;
}) {
  const { catId } = await params;
  const id = Number(catId);
  return (
    <>
      <CatDetailHeader catId={id} />
      <CatBoard catId={id} />
    </>
  );
}
