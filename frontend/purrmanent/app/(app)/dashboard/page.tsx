import { PageHeader } from "@/components/layout/app-shell";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Your cats and today's progress."
      />
      <p className="text-sm text-on-dark-muted">
        The global Kanban overview arrives in Phase 4.
      </p>
    </>
  );
}
