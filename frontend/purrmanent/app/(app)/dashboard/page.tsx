'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/app-shell';
import { Button, Card, Skeleton } from '@/components/ui';
import { useCats } from '@/features/cats/hooks';
import { GlobalOverview } from '@/features/checklist/global-overview';
import { DashboardAsk } from '@/features/coach/dashboard-ask';
import { DashboardStats } from '@/features/dashboard/dashboard-stats';
import { OnboardingModal } from '@/features/onboarding/onboarding-modal';

export default function DashboardPage() {
	const { data: cats, isLoading } = useCats();

	return (
		<>
			<OnboardingModal />
			<DashboardAsk />
			<PageHeader
				title="Overview"
				subtitle="Your cats and today's progress at a glance."
				action={
					<div className="flex items-center gap-3">
						<Link href="/cats">
							<Button variant="emboss" className="cursor-pointer">
								All cats
							</Button>
						</Link>
					</div>
				}
			/>
			{isLoading ? (
				<div className="space-y-8">
					<div className="mb-8 space-y-4">
						<div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
							{Array.from({ length: 5 }).map((_, i) => (
								<Card key={i} className="flex items-center gap-3 p-4">
									<Skeleton className="size-10 rounded-lg" />
									<div className="space-y-1">
										<Skeleton className="h-3 w-12" />
										<Skeleton className="h-6 w-10" />
									</div>
								</Card>
							))}
						</div>
						<div className="grid gap-4 lg:grid-cols-2">
							<Card className="p-4">
								<Skeleton className="mb-2 h-4 w-24" />
								<Skeleton className="h-[200px] w-full rounded-lg" />
							</Card>
							<Card className="p-4">
								<Skeleton className="mb-2 h-4 w-32" />
								<Skeleton className="h-[200px] w-full rounded-lg" />
							</Card>
						</div>
					</div>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 3 }).map((_, i) => (
							<Card key={i} className="flex flex-col gap-3">
								<Skeleton className="h-5 w-24" />
								<div className="flex gap-2">
									<Skeleton className="h-5 w-16 rounded-full" />
									<Skeleton className="h-5 w-16 rounded-full" />
									<Skeleton className="h-5 w-16 rounded-full" />
								</div>
							</Card>
						))}
					</div>
				</div>
			) : cats && cats.length === 0 ? (
				<div className="rounded-xl border border-hairline-cloud p-8 text-center">
					<p className="mb-4 text-muted">
						Let&apos;s set up your first cat&apos;s plan.
					</p>
					<Button asChild variant="emboss">
						<Link href="/cats">Add a cat</Link>
					</Button>
				</div>
			) : (
				<div className="space-y-8">
					<DashboardStats />
					<GlobalOverview />
				</div>
			)}
		</>
	);
}
