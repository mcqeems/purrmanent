"use client";

import { useQuery } from "@tanstack/react-query";
import { coachHistoryApi } from "./api";

export function useConversations() {
  return useQuery({
    queryKey: ["coach", "conversations"],
    queryFn: coachHistoryApi.list,
  });
}

export function useConversationMessages(id: number | null) {
  return useQuery({
    queryKey: ["coach", "conversations", id, "messages"],
    queryFn: () => coachHistoryApi.messages(id as number),
    enabled: id != null,
  });
}
