'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { queryKeys } from '@/lib/query/client';
import type { QuestionnaireInput } from '@/lib/validation/schemas';

/** Mirrors the backend's OnboardingResult (onboarding.service.ts) — submit
 * returns the created cat's id + a redirect target, not a full Cat entity. */
export interface OnboardingResult {
  catId: number;
  redirectTo: string;
}

export const onboardingApi = {
  submit: (body: QuestionnaireInput) =>
    apiFetch<OnboardingResult>('/onboarding/submit', {
      method: 'POST',
      body,
    }),
};

export function useSubmitOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: QuestionnaireInput) => onboardingApi.submit(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cats }),
  });
}
