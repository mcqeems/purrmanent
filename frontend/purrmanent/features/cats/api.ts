import { apiFetch } from "@/lib/api/client";
import type { Cat } from "@/lib/types/api";
import type { CreateCatInput, UpdateCatInput } from "@/lib/validation/schemas";

export const catsApi = {
  list: () => apiFetch<Cat[]>("/cats"),
  get: (id: number) => apiFetch<Cat>(`/cats/${id}`),
  create: (body: CreateCatInput) =>
    apiFetch<Cat>("/cats", { method: "POST", body }),
  update: (id: number, body: UpdateCatInput) =>
    apiFetch<Cat>(`/cats/${id}`, { method: "PUT", body }),
  remove: (id: number) =>
    apiFetch<{ success: true }>(`/cats/${id}`, { method: "DELETE" }),
};
