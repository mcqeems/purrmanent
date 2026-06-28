import { PageHeader } from "@/components/layout/app-shell";

export default async function CatBoardPage({
  params,
}: {
  params: Promise<{ catId: string }>;
}) {
  const { catId } = await params;
  return (
    <>
      <PageHeader title="90-day board" subtitle={`Cat #${catId}`} />
      <p className="text-sm text-on-dark-muted">
        The daily / phase Kanban board arrives in Phase 4.
      </p>
    </>
  );
}
