'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import {
	Button,
	Card,
	Dialog,
	DialogContent,
	DialogTrigger,
	Input,
	Pill,
	Skeleton,
} from '@/components/ui';
import { useCats } from './hooks';
import { CatForm } from './cat-form';

export function AllCats() {
	const { data: cats, isLoading, isError } = useCats();
	const [open, setOpen] = useState(false);
	const [q, setQ] = useState('');

	const filtered = useMemo(() => {
		const query = q.trim().toLowerCase();
		const list = cats ?? [];
		if (!query) return list;
		return list.filter(
			(c) =>
				c.name.toLowerCase().includes(query) ||
				(c.breed ?? '').toLowerCase().includes(query) ||
				c.personality.toLowerCase().includes(query),
		);
	}, [cats, q]);

	if (isLoading)
		return (
			<div className="space-y-4">
				<Skeleton className="h-10 w-full" />
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<Card key={i} className="flex flex-col gap-2">
							<div className="flex items-center justify-between">
								<Skeleton className="h-5 w-24" />
								<Skeleton className="h-5 w-16 rounded-full" />
							</div>
							<Skeleton className="h-3 w-32" />
							<Skeleton className="mt-2 h-3 w-20" />
						</Card>
					))}
				</div>
			</div>
		);
	if (isError)
		return (
			<p className="text-sm text-accent-pink">Could not load your cats.</p>
		);

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<div className="relative flex-1">
					<Search
						size={16}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted "
					/>
					<Input
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder="Search by name, breed, personality…"
						className="pl-9"
						aria-label="Search cats"
					/>
				</div>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button size="sm" variant="emboss">
							<Plus size={16} /> Add cat
						</Button>
					</DialogTrigger>
					<DialogContent title="Add a cat">
						<CatForm onDone={() => setOpen(false)} />
					</DialogContent>
				</Dialog>
			</div>

			{filtered.length === 0 ? (
				<p className="text-sm text-muted">
					{q ? `No cats match “${q}”.` : 'No cats yet — add your first one.'}
				</p>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{filtered.map((cat) => (
						<Link key={cat.id} href={`/cats/${cat.id}`} className="block">
							<Card className="flex flex-col gap-2 hover:shadow-[rgba(0,0,0,0.1)_0_10px_15px_-3px] hover:bg-sidebar-accent transition-all duration-200">
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-semibold">{cat.name}</h3>
									<Pill tone="lime">
										{(cat.personality ?? 'Unknown').charAt(0).toUpperCase() + (cat.personality ?? 'Unknown').slice(1)}
									</Pill>
								</div>
								<p className="text-sm text-muted">
									{cat.breed ?? 'Cat'}
									{cat.ageMonths != null ? ` · ${cat.ageMonths} months` : ''}
								</p>
								<span className="mt-2 text-sm font-semibold text-muted">
									Open board →
								</span>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
