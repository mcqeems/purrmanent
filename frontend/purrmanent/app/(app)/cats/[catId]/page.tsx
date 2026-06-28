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
          <div className="flex gap-3 text-sm">
            <Link
              href={`/cats/${catId}/health`}
              className="text-accent-violet underline"
            >
              Health log
            </Link>
            <Link
              href={`/cats/${catId}/settings`}
              className="text-muted underline"
            >
              Cat settings
            </Link>
          </div>
        }
      />
      <CatBoard catId={Number(catId)} />
    </>
  );
}
