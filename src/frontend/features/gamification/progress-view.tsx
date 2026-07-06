'use client';

import * as React from 'react';
import { Info } from 'lucide-react';
import {
	Button,
	Card,
	Dialog,
	DialogContent,
	DialogTrigger,
	Pill,
	Skeleton,
} from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { useGraduation } from '@/features/checklist/hooks';
import { BADGES, useGamificationStatus } from './hooks';
import Image from 'next/image';
import trophy from '@/app/assets/badges/trophy.png';
import type { GraduationStatus } from '@/lib/types/api';
import { CertificateDialog } from './certificate-dialog';

function GraduationHelp() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="link"
					className="flex flex-row gap-2 text-sm text-muted transition-all"
				>
					<Info size={16} />
					How to earn it?
				</Button>
			</DialogTrigger>
			<DialogContent title="How graduation works">
				<ol className="list-decimal space-y-2 pl-5 text-sm">
					<li>
						Your 90-day journey starts the day you add the cat to Purrmanent.
					</li>
					<li>
						Each day, complete all of that cat&apos;s daily todos that counts as
						one <em>qualifying day</em>.
					</li>
					<li>
						Miss a day (todos left undone)? It simply doesn&apos;t count, so the
						finish line moves out by that many days (+1, +2, …).
					</li>
					<li>
						Reach <strong>90 qualifying days</strong> and the cat graduates 🎓.
					</li>
				</ol>
			</DialogContent>
		</Dialog>
	);
}

export function ProgressView() {
	const { data: status, isLoading } = useGamificationStatus();
	const { data: grads = [] } = useGraduation();
	const [activeGrad, setActiveGrad] = React.useState<GraduationStatus | null>(null);
	const points = status?.points ?? 0;

	const graduated = grads.filter((g) => g.graduated);
	const inProgress = grads.filter((g) => !g.graduated);

	if (isLoading)
		return (
			<div className="space-y-8">
				<Card className="flex items-center justify-between p-6">
					<div className="space-y-2">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-10 w-32" />
					</div>
					<Skeleton className="h-[150px] w-[150px] rounded-lg" />
				</Card>
				<section className="space-y-3">
					<Skeleton className="h-6 w-16" />
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<Card key={i} className="flex flex-col items-center gap-1 p-4">
								<Skeleton className="h-24 w-24 rounded-lg" />
								<Skeleton className="h-4 w-16" />
								<Skeleton className="h-5 w-12 rounded-full" />
							</Card>
						))}
					</div>
				</section>
				<section className="space-y-3">
					<Skeleton className="h-6 w-40" />
					<div className="grid gap-3 sm:grid-cols-2">
						{Array.from({ length: 2 }).map((_, i) => (
							<Card key={i} className="min-h-[190px] p-6">
								<Skeleton className="mx-auto h-4 w-20" />
								<Skeleton className="mx-auto mt-2 h-6 w-32" />
								<Skeleton className="mx-auto mt-1 h-3 w-48" />
							</Card>
						))}
					</div>
				</section>
			</div>
		);

	return (
		<div className="space-y-8">
			<Card
				variant="featured"
				className="flex items-center justify-between shadow-emboss"
			>
				<div>
					<p className="text-sm uppercase tracking-[0.2px] text-accent-lime">
						Total points
					</p>
					<p className="font-display text-5xl font-bold">{points}</p>
				</div>
				<span className="h-[150px] w-[150px] " aria-hidden>
					<Image src={trophy} alt="trophy" height={150} width={150} />
				</span>
			</Card>

			<section className="space-y-3">
				<h2 className="text-lg font-semibold">Badges</h2>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{BADGES.map((b) => {
						const earned = points >= b.points;
						return (
							<Card
								key={b.label}
								className={cn(
									'flex flex-col items-center gap-1 text-center',
									!earned && 'opacity-40',
								)}
							>
								<span className="text-3xl w-24 h-24" aria-hidden>
									<Image src={b.image} alt={b.label} height={100} width={100} />
								</span>
								<p className="text-sm font-semibold">{b.label}</p>
								<Pill tone={earned ? 'lime' : 'neutral'}>{b.points} pts</Pill>
							</Card>
						);
					})}
				</div>
			</section>

			<section className="space-y-3">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold">Graduation certificates</h2>
					<GraduationHelp />
				</div>

				{grads.length === 0 ? (
					<p className="text-sm text-muted">
						Add a cat to start its 90-day journey.
					</p>
				) : (
					<div className="grid gap-3 sm:grid-cols-2">
						{graduated.map((g) => (
							<Card
								key={g.catId}
								variant="featured"
								className="flex flex-col items-center justify-between text-center shadow-emboss min-h-[190px] py-6"
							>
								<div>
									<p className="text-sm uppercase tracking-[0.2px] text-accent-lime">
										Graduated
									</p>
									<p className="mt-2 font-display text-2xl font-bold">{g.name}</p>
									<p className="mt-1 text-sm text-on-dark-muted">
										90 qualifying days complete. You did it!
									</p>
								</div>
								<Button
									variant="emboss"
									size="sm"
									className="mt-4"
									onClick={() => setActiveGrad(g)}
								>
									View Certificate
								</Button>
							</Card>
						))}

						{inProgress.map((g) => {
							const pct = Math.min(
								Math.round((g.qualifyingDays / g.requiredDays) * 100),
								100,
							);
							return (
								<Card
									key={g.catId}
									className="opacity-70 grayscale"
									aria-label={`${g.name} not yet graduated`}
								>
									<div className="flex items-center justify-between">
										<p className="font-semibold">{g.name}</p>
										<Pill tone="neutral">Not graduated</Pill>
									</div>
									<div className="mt-3 h-2 w-full rounded-full bg-surface-press-light">
										<div
											className="h-2 rounded-full bg-accent-violet"
											style={{ width: `${pct}%` }}
										/>
									</div>
									<p className="mt-2 text-sm text-muted">
										{g.qualifyingDays} / {g.requiredDays} qualifying days ·{' '}
										{g.requiredDays - g.qualifyingDays} to go
									</p>
									{g.missedDays > 0 && (
										<p className="text-xs text-accent-pink">
											{g.missedDays} missed day{g.missedDays > 1 ? 's' : ''} —
											complete every daily todo to keep your streak going.
										</p>
									)}
								</Card>
							);
						})}
					</div>
				)}
			</section>

			{activeGrad && (
				<CertificateDialog
					isOpen={!!activeGrad}
					onOpenChange={(open) => {
						if (!open) setActiveGrad(null);
					}}
					catName={activeGrad.name}
					graduationDate={activeGrad.graduationDate}
				/>
			)}
		</div>
	);
}
