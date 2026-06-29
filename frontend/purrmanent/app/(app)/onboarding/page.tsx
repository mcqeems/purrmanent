import { QuestionnaireWizard } from '@/features/onboarding/questionnaire-wizard';
import { fetchDemoPrefill } from '@/features/onboarding/demo';

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const prefill = code ? await fetchDemoPrefill(code) : undefined;
  return <QuestionnaireWizard prefill={prefill} />;
}
