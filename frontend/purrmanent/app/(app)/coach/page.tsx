import { PageHeader } from "@/components/layout/app-shell";
import { CoachPage } from "@/features/coach/coach-page";

export default function AICoachPage() {
  return (
    <>
      <PageHeader
        title="AI Coach"
        subtitle="Chat, take actions, and revisit past conversations."
      />
      <CoachPage />
    </>
  );
}
