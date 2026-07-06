'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/client';
import type { ChecklistBoard, ChecklistItem } from '@/lib/types/api';
import type { CustomTodoInput, MoveItemInput } from '@/lib/validation/schemas';
import { checklistApi } from './api';

export function useGlobalBoard() {
  return useQuery({
    queryKey: queryKeys.boardGlobal,
    queryFn: checklistApi.global,
  });
}

export function useGraduation() {
  return useQuery({
    queryKey: ['checklist', 'graduation'],
    queryFn: checklistApi.graduation,
  });
}

export function useTodayBoard(catId: number) {
  return useQuery({
    queryKey: queryKeys.boardToday(catId),
    queryFn: () => checklistApi.today(catId),
    enabled: catId > 0,
  });
}

export function usePhaseBoard(catId: number) {
  return useQuery({
    queryKey: queryKeys.boardPhase(catId),
    queryFn: () => checklistApi.phase(catId),
    enabled: catId > 0,
  });
}

export function useAddCustomTodo(catId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CustomTodoInput) => checklistApi.addCustom(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.boardToday(catId) });
      qc.invalidateQueries({ queryKey: queryKeys.boardPhase(catId) });
    },
  });
}

/** Optimistic Kanban move — patches the relevant board cache immediately. */
export function useMoveItem(catId: number, board: ChecklistBoard) {
  const qc = useQueryClient();
  const key =
    board === 'daily'
      ? queryKeys.boardToday(catId)
      : queryKeys.boardPhase(catId);

  return useMutation({
    mutationFn: (vars: MoveItemInput) => checklistApi.move(vars),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<ChecklistItem[]>(key);
      qc.setQueryData<ChecklistItem[]>(key, (old) =>
        old?.map((i) =>
          i.id === vars.itemId ? { ...i, kanbanStatus: vars.newStatus } : i,
        ),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: queryKeys.gamification });
      qc.invalidateQueries({ queryKey: queryKeys.boardGlobal });
    },
  });
}
