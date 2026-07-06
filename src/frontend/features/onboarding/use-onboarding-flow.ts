'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { questionnaireSchema, type QuestionnaireInput } from '@/lib/validation/schemas';
import { useSubmitOnboarding } from './hooks';
import { ONBOARDING_STEP_FIELDS } from './onboarding-steps';

/**
 * Shared onboarding form state/navigation — used by both OnboardingModal and
 * the standalone /onboarding page so step logic and submit behavior stay in
 * sync in one place.
 */
export function useOnboardingFlow(prefill?: Partial<QuestionnaireInput>) {
  const router = useRouter();
  const submit = useSubmitOnboarding();
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<QuestionnaireInput>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: { concerns: [], ...prefill },
  });
  const { trigger, handleSubmit } = form;

  async function next() {
    const valid = await trigger(ONBOARDING_STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(s + 1, ONBOARDING_STEP_FIELDS.length - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const result = await submit.mutateAsync({
        ...values,
        timezone:
          Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Asia/Jakarta',
        preferredLanguage: 'en',
      });
      router.push(`/cats/${result.catId}`);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Could not save. Try again.',
      );
    }
  });

  return {
    form,
    step,
    setStep,
    next,
    back,
    onSubmit,
    serverError,
    isLastStep: step === ONBOARDING_STEP_FIELDS.length - 1,
    isPending: submit.isPending,
  };
}
