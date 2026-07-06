'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	Button,
	Card,
	Dialog,
	DialogClose,
	DialogContent,
	Skeleton,
	toast,
} from '@/components/ui';
import { useCat, useDeleteCat } from './hooks';
import { CatForm } from './cat-form';

export function EditCat({ catId }: { catId: number }) {
	const router = useRouter();
	const { data: cat, isLoading, isError } = useCat(catId);
	const del = useDeleteCat();
	const [confirm, setConfirm] = useState(false);

	if (isLoading)
		return (
			<div className="space-y-6">
				<Card className="space-y-4">
					<div className="flex items-center gap-4">
						<Skeleton className="size-20 rounded-full" />
						<Skeleton className="h-9 w-28 rounded-md" />
					</div>
					<div className="space-y-1.5">
						<Skeleton className="h-4 w-12" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="space-y-1.5">
						<Skeleton className="h-4 w-12" />
						<Skeleton className="h-10 w-full" />
					</div>
					<Skeleton className="h-10 w-24 rounded-md" />
				</Card>
				<Card className="border-danger/30">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="mt-2 h-3 w-48" />
					<Skeleton className="mt-3 h-9 w-28 rounded-md" />
				</Card>
			</div>
		);
	if (isError || !cat)
		return <p className="text-sm text-accent-pink">Could not load this cat.</p>;

	async function remove() {
		try {
			await del.mutateAsync(catId);
			toast.success(`${cat!.name} was removed.`);
			router.push('/dashboard');
		} catch {
			toast.error('Could not remove the cat.');
		}
	}

	return (
		<div className="space-y-6">
			<Card>
				<CatForm cat={cat} onDone={() => router.push(`/cats/${cat.id}`)} />
			</Card>

			<Card className="border-danger/30">
				<h3 className="text-sm font-semibold text-danger">Danger zone</h3>
				<p className="mt-1 text-sm text-muted">
					Remove {cat.name} and hide their board and history.
				</p>
				<div className="mt-3">
					<Dialog open={confirm} onOpenChange={setConfirm}>
						<Button variant="destructive" onClick={() => setConfirm(true)}>
							Remove cat
						</Button>
						<DialogContent title="Remove cat?">
							<p className="text-sm">
								Remove <strong>{cat.name}</strong>? This hides their board and
								history.
							</p>
							<div className="mt-4 flex justify-end gap-2">
								<DialogClose asChild>
									<Button variant="outline" size="sm">
										Cancel
									</Button>
								</DialogClose>
								<Button
									size="sm"
									variant="destructive"
									onClick={remove}
									disabled={del.isPending}
								>
									{del.isPending ? 'Removing…' : 'Remove'}
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</Card>
		</div>
	);
}
