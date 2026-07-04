'use client';

import { Button, Card } from '@/components/ui';
import type { QuestionnaireInput } from '@/lib/validation/schemas';
import { useOnboardingFlow } from './use-onboarding-flow';
import {
  OnboardingStepFields,
  ONBOARDING_STEP_FIELDS,
  ONBOARDING_STEP_LABELS,
} from './onboarding-steps';

export function QuestionnaireWizard({
  prefill,
}: {
  prefill?: Partial<QuestionnaireInput>;
}) {
  const { form, step, next, back, onSubmit, serverError, isLastStep, isPending } =
    useOnboardingFlow(prefill);
  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <Card className="mx-auto max-w-xl">
      <p className="mb-1 text-sm font-medium uppercase tracking-[0.2px] text-accent-violet">
        Step {step + 1} of {ONBOARDING_STEP_FIELDS.length} — {ONBOARDING_STEP_LABELS[step]}
      </p>
      <h1 className="mb-6 text-2xl font-semibold">Tell us about your cat</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <OnboardingStepFields
          step={step}
          register={register}
          control={control}
          errors={errors}
        />

        {serverError && (
          <p className="text-sm text-accent-pink">{serverError}</p>
        )}

        <div className="flex justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={back}
            disabled={step === 0}
          >
            Back
          </Button>
          {!isLastStep ? (
            <Button type="button" onClick={next}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Building your plan…' : 'Build my plan'}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
