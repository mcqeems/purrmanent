import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

/** Centralized query keys — one place to invalidate by entity. */
export const queryKeys = {
  session: ["session"] as const,
  cats: ["cats"] as const,
  cat: (catId: number) => ["cats", catId] as const,
  boardGlobal: ["checklist", "global"] as const,
  boardToday: (catId: number) => ["checklist", "today", catId] as const,
  boardPhase: (catId: number) => ["checklist", "phase", catId] as const,
  gamification: ["gamification"] as const,
  healthTimeline: (catId: number) => ["health", "timeline", catId] as const,
};
