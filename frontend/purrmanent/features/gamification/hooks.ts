"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/client";
import type { GamificationStatus } from "@/lib/types/api";

export function useGamificationStatus() {
  return useQuery({
    queryKey: queryKeys.gamification,
    queryFn: () => apiFetch<GamificationStatus>("/gamification/status"),
  });
}

/** Client-derived milestone badges (no badges endpoint exists — see FRONTEND_BUILD_PLAN §12). */
export const BADGES = [
  { points: 50, label: "Getting started", icon: "🌱" },
  { points: 150, label: "Committed", icon: "⭐" },
  { points: 400, label: "Cat whisperer", icon: "🐱" },
  { points: 800, label: "Legend", icon: "👑" },
] as const;
