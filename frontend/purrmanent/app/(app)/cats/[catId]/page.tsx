import Link from "next/link";
import { PageHeader } from "@/components/layout/app-shell";
import { CatBoard } from "@/features/checklist/cat-board";

export default async function CatBoardPage({
  params,
}: {
  params: Promise<{ catId: string }>;
}) {
  const { catId } = await params;
  return (
    <>
      <PageHeader
        title="90-day board"
        subtitle="Drag tasks across To-Do, In Progress, and Done."
        action={
          <Link
            href={`/cats/${catId}/settings`}
            className="text-sm text-on-dark-muted underline"
          >
            Cat settings
          </Link>
        }
      />
      <CatBoard catId={Number(catId)} />
    </>
  );
}
