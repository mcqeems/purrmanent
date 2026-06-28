import { apiFetch } from "@/lib/api/client";
import type { CatBoardSummary, ChecklistItem, MoveResult } from "@/lib/types/api";
import type { CustomTodoInput, MoveItemInput } from "@/lib/validation/schemas";

export const checklistApi = {
  global: () => apiFetch<CatBoardSummary[]>("/checklist/global"),
  today: (catId: number) =>
    apiFetch<ChecklistItem[]>("/checklist/today", { query: { cat_id: catId } }),
  phase: (catId: number) =>
    apiFetch<ChecklistItem[]>("/checklist/phase", { query: { cat_id: catId } }),
  addCustom: (body: CustomTodoInput) =>
    apiFetch<ChecklistItem>("/checklist/custom", { method: "POST", body }),
  move: (body: MoveItemInput) =>
    apiFetch<MoveResult>("/checklist/move", { method: "PUT", body }),
};
