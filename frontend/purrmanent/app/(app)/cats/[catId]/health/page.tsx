import { PageHeader } from "@/components/layout/app-shell";
import { HealthView } from "@/features/health/health-view";

export default async function CatHealthPage({
  params,
}: {
  params: Promise<{ catId: string }>;
}) {
  const { catId } = await params;
  return (
    <>
      <PageHeader
        title="Health log"
        subtitle="Vaccinations, vet visits, weight, and reminders."
      />
      <HealthView catId={Number(catId)} />
    </>
  );
}
