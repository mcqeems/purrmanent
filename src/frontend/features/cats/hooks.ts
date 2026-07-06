'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/client';
import type { CreateCatInput, UpdateCatInput } from '@/lib/validation/schemas';
import { catsApi } from './api';

export function useCats() {
  return useQuery({ queryKey: queryKeys.cats, queryFn: catsApi.list });
}

export function useCat(id: number) {
  return useQuery({
    queryKey: queryKeys.cat(id),
    queryFn: () => catsApi.get(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useCreateCat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCatInput) => catsApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cats }),
  });
}

export function useUpdateCat(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateCatInput) => catsApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cats });
      qc.invalidateQueries({ queryKey: queryKeys.cat(id) });
    },
  });
}

export function useDeleteCat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => catsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cats });
      qc.invalidateQueries({ queryKey: queryKeys.boardGlobal });
    },
  });
}
