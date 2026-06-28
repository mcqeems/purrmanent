import { PageHeader } from "@/components/layout/app-shell";
import { AllCats } from "@/features/cats/all-cats";

export default function CatsPage() {
  return (
    <>
      <PageHeader title="Your cats" subtitle="Search, open, or add a cat." />
      <AllCats />
    </>
  );
}
