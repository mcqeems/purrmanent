'use client';

import Link from 'next/link';
import { differenceInCalendarDays, format, parseISO, isValid } from 'date-fns';
import { HeartPulse, AlertTriangle, Settings } from 'lucide-react';
import { Button, Pill, Skeleton } from '@/components/ui';
import { useCat } from './hooks';
import { capitalizeFirstChar } from '@/lib/utils';

function fmtDate(d: string) {
	const date = parseISO(d);
	return isValid(date) ? format(date, 'MMM d, yyyy') : d;
}

export function CatDetailHeader({ catId }: { catId: number }) {
	const { data: cat, isLoading, isError } = useCat(catId);

	if (isLoading)
		return (
			<header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<Skeleton className="size-16 rounded-xl" />
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Skeleton className="h-6 w-32" />
							<Skeleton className="h-5 w-16 rounded-full" />
						</div>
						<Skeleton className="h-3 w-40" />
						<Skeleton className="h-3 w-28" />
					</div>
				</div>
				<div className="flex gap-2">
					<Skeleton className="h-9 w-20 rounded-md" />
					<Skeleton className="h-9 w-20 rounded-md" />
					<Skeleton className="h-9 w-20 rounded-md" />
				</div>
			</header>
		);
	if (isError || !cat)
		return <p className="text-sm text-accent-pink">Could not load this cat.</p>;

	const day = Math.min(
		Math.max(
			differenceInCalendarDays(new Date(), parseISO(cat.adoptionDate)) + 1,
			1,
		),
		90,
	);

	return (
		<header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-4">
				{cat.photoUrl ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={cat.photoUrl}
						alt={cat.name}
						className="size-16 rounded-xl object-cover"
					/>
				) : (
					<div className="flex size-16 items-center justify-center rounded-xl bg-accent-violet-deep text-xl font-bold text-on-primary">
						{capitalizeFirstChar(cat.name)}
					</div>
				)}
				<div>
					<div className="flex items-center gap-2">
						<h1 className="text-2xl font-semibold text-ink-deep">{cat.name}</h1>
						<Pill tone="lime">{capitalizeFirstChar(cat.personality)}</Pill>
					</div>
					<p className="text-sm text-muted">
						{[
							cat.breed ?? 'Cat',
							capitalizeFirstChar(cat.gender ?? 'Unknown'),
							cat.ageMonths != null ? `${cat.ageMonths} months` : null,
						]
							.filter(Boolean)
							.join(' · ')}
					</p>
					<p className="text-xs text-muted">
						Adopted {fmtDate(cat.adoptionDate)} · Day {day} of 90
					</p>
				</div>
			</div>
			<div className="flex gap-2 text-sm">
				<Link href="/crisis">
					<Button variant="destructive">
						<AlertTriangle size={16} /> Crisis
					</Button>
				</Link>
				<Link href={`/cats/${cat.id}/health`}>
					<Button variant="outline">
						<HeartPulse size={16} /> Health
					</Button>
				</Link>
				<Link href={`/cats/${cat.id}/settings`}>
					<Button variant="outline">
						<Settings size={16} /> Settings
					</Button>
				</Link>
			</div>
		</header>
	);
}
