'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { queryKeys } from '@/lib/query/client';
import type { HealthRecord } from '@/lib/types/api';
import type { CreateHealthRecordInput } from '@/lib/validation/schemas';

export const healthApi = {
  timeline: (catId: number) =>
    apiFetch<HealthRecord[]>('/health/timeline', { query: { cat_id: catId } }),
  create: (body: CreateHealthRecordInput) =>
    apiFetch<HealthRecord>('/health/record', { method: 'POST', body }),
  remove: (id: number) =>
    apiFetch<{ success: true }>(`/health/record/${id}`, { method: 'DELETE' }),
};

export function useHealthTimeline(catId: number) {
  return useQuery({
    queryKey: queryKeys.healthTimeline(catId),
    queryFn: () => healthApi.timeline(catId),
    enabled: catId > 0,
  });
}

export function useCreateRecord(catId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateHealthRecordInput) => healthApi.create(body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.healthTimeline(catId) }),
  });
}

export function useDeleteRecord(catId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => healthApi.remove(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.healthTimeline(catId) }),
  });
}
