import { PageHeader } from "@/components/layout/app-shell";
import { CrisisFlow } from "@/features/crisis/crisis-flow";

export default function CrisisPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Crisis Mode"
        subtitle="Describe what's wrong and get an immediate, guided protocol."
      />
      <CrisisFlow />
    </div>
  );
}
