'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { queryKeys } from '@/lib/query/client';
import type { GamificationStatus } from '@/lib/types/api';
import seedling from '@/app/assets/badges/seed.png';
import cat from '@/app/assets/badges/cat.png';
import star from '@/app/assets/badges/star.png';
import crown from '@/app/assets/badges/crown.png';

export function useGamificationStatus() {
	return useQuery({
		queryKey: queryKeys.gamification,
		queryFn: () => apiFetch<GamificationStatus>('/gamification/status'),
	});
}

/** Client-derived milestone badges (no badges endpoint exists). */
export const BADGES = [
	{ points: 50, label: 'Getting started', icon: '🌱', image: seedling },
	{ points: 150, label: 'Committed', icon: '⭐', image: star },
	{ points: 400, label: 'Cat whisperer', icon: '🐱', image: cat },
	{ points: 800, label: 'Legend', icon: '👑', image: crown },
] as const;
