"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/client";
import type { Cat } from "@/lib/types/api";
import type { QuestionnaireInput } from "@/lib/validation/schemas";

export const onboardingApi = {
  submit: (body: QuestionnaireInput) =>
    apiFetch<Cat>("/onboarding/submit", { method: "POST", body }),
};

export function useSubmitOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: QuestionnaireInput) => onboardingApi.submit(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cats }),
  });
}
