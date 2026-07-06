'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { queryKeys } from '@/lib/query/client';
import type { CrisisIdentifyResult } from '@/lib/types/api';
import type {
  IdentifyCrisisInput,
  CrisisStepInput,
  ResolveCrisisInput,
} from '@/lib/validation/schemas';

export const crisisApi = {
  identify: (body: IdentifyCrisisInput) =>
    apiFetch<CrisisIdentifyResult>('/crisis/identify', {
      method: 'POST',
      body,
    }),
  step: (body: CrisisStepInput) =>
    apiFetch<{ stepsCompleted: number[] }>('/crisis/step', {
      method: 'POST',
      body,
    }),
  resolve: (body: ResolveCrisisInput) =>
    apiFetch<unknown>('/crisis/resolve', { method: 'POST', body }),
};

export function useIdentifyCrisis() {
  return useMutation({ mutationFn: crisisApi.identify });
}

export function useCompleteStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CrisisStepInput) => crisisApi.step(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.gamification }),
  });
}

export function useResolveCrisis() {
  return useMutation({ mutationFn: crisisApi.resolve });
}
