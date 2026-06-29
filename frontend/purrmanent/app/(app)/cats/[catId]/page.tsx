import { CatDetailHeader } from '@/features/cats/cat-detail-header';
import { CatBoard } from '@/features/checklist/cat-board';

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
