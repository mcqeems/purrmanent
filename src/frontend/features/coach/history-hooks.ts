'use client';

import { useQuery } from '@tanstack/react-query';
import { coachHistoryApi } from './api';

export function useConversations() {
  return useQuery({
    queryKey: ['coach', 'conversations'],
    queryFn: coachHistoryApi.list,
  });
}
