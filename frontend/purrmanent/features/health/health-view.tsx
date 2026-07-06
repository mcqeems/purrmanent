'use client';

import { format, parseISO, isValid } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Card, Pill, Skeleton } from '@/components/ui';
import type { HealthRecord } from '@/lib/types/api';
import { useDeleteRecord, useHealthTimeline } from './hooks';
import { RecordForm } from './record-form';
import { capitalizeFirstChar } from '@/lib/utils';

function fmt(date: string) {
	const d = parseISO(date);
	return isValid(d) ? format(d, 'MMM d, yyyy') : date;
}

function detailOf(r: HealthRecord): string {
	const v = Object.values(r.recordData ?? {})[0];
	return v == null ? '' : String(v);
}

export function HealthView({ catId }: { catId: number }) {
	const { data: records, isLoading, isError } = useHealthTimeline(catId);
	const del = useDeleteRecord(catId);

	const today = new Date().toISOString().slice(0, 10);
	const upcoming = (records ?? [])
		.filter((r) => r.nextDueDate && r.nextDueDate >= today)
		.sort((a, b) => (a.nextDueDate! < b.nextDueDate! ? -1 : 1));

	return (
		<div className="space-y-6">
			<div className="flex justify-end">
				<RecordForm catId={catId} />
			</div>

			{upcoming.length > 0 && (
				<Card variant="featured">
					<h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.2px] text-accent-lime">
						Upcoming reminders
					</h2>
					<ul className="space-y-1 text-sm">
						{upcoming.map((r) => (
							<li key={r.id} className="flex justify-between">
								<span>{r.recordType.replace('_', ' ')}</span>
								<span className="text-on-dark-muted">
									{fmt(r.nextDueDate!)}
								</span>
							</li>
						))}
					</ul>
				</Card>
			)}

			<section className="space-y-3">
				<h2 className="text-lg font-semibold">Health timeline</h2>
				{isLoading ? (
					<div className="space-y-2">
						{Array.from({ length: 4 }).map((_, i) => (
							<div
								key={i}
								className="flex items-center justify-between rounded-md border border-hairline-cloud bg-surface-canvas-light p-3"
							>
								<div className="flex flex-col gap-1.5">
									<div className="flex items-center gap-2">
										<Skeleton className="h-5 w-20 rounded-full" />
										<Skeleton className="h-3 w-20" />
									</div>
									<Skeleton className="h-3 w-32" />
								</div>
								<Skeleton className="size-4" />
							</div>
						))}
					</div>
				) : isError ? (
					<p className="text-sm text-accent-pink">Could not load records.</p>
				) : records && records.length > 0 ? (
					<ul className="space-y-2">
						{records.map((r) => (
							<li
								key={r.id}
								className="flex items-center justify-between rounded-md border border-hairline-cloud bg-surface-canvas-light p-3"
							>
								<div className="flex flex-col gap-1">
									<div className="flex items-center gap-2">
										<Pill tone="neutral">
											{capitalizeFirstChar(r.recordType.replace('_', ' '))}
										</Pill>
										<span className="text-xs text-muted">
											{fmt(r.recordedAt)}
										</span>
									</div>
									{detailOf(r) && (
										<span className="text-sm">{detailOf(r)}</span>
									)}
								</div>
								<button
									aria-label="Delete record"
									onClick={() => del.mutate(r.id)}
									className="text-muted hover:text-primary cursor-pointer"
								>
									<Trash2 size={16} />
								</button>
							</li>
						))}
					</ul>
				) : (
					<p className="text-sm text-muted">
						No health records yet. Add the first vaccination or vet visit.
					</p>
				)}
			</section>
		</div>
	);
}
