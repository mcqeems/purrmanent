'use client';

import { useState } from 'react';
import { Info, Plus } from 'lucide-react';
import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
	Button,
	Dialog,
	DialogClose,
	DialogContent,
	DialogTrigger,
	Field,
	Input,
	SelectField,
	Skeleton,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
	toast,
} from '@/components/ui';
import type {
	ChecklistBoard,
	ChecklistItem,
	KanbanStatus,
	PendingAction,
} from '@/lib/types/api';
import { KanbanBoard } from './kanban-board';
import { streamCoachChat } from '@/features/coach/stream';
import { confirmAction } from '@/features/coach/api';
import { useQueryClient } from '@tanstack/react-query';
import {
	useAddCustomTodo,
	useMoveItem,
	usePhaseBoard,
	useTodayBoard,
} from './hooks';

function BoardView({
	catId,
	board,
	items,
	isLoading,
	isError,
	onMove,
}: {
	catId: number;
	board: ChecklistBoard;
	items: ChecklistItem[];
	isLoading: boolean;
	isError: boolean;
	onMove: (itemId: number, newStatus: KanbanStatus) => void;
}) {
	const qc = useQueryClient();
	if (isLoading)
		return (
			<div className="flex flex-col gap-3 sm:flex-row">
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className="flex-1 space-y-2">
						<Skeleton className="h-4 w-16" />
						<Skeleton className="h-12 w-full rounded-md" />
						<Skeleton className="h-12 w-full rounded-md" />
					</div>
				))}
			</div>
		);
	if (isError)
		return (
			<p className="text-sm text-accent-pink">Could not load the board.</p>
		);

	const empty = items.length === 0;
	const allDone = !empty && items.every((i) => i.kanbanStatus === 'done');

	async function askCoach(prompt: string) {
		const id = toast.loading('AI coach is generating your checklist…');
		let pending: PendingAction | null = null;
		const handlers = {
			onConfirm: (p: PendingAction) => {
				pending = p;
			},
		};
		try {
			await streamCoachChat({ message: prompt }, handlers);
			if (!pending) {
				await streamCoachChat({ message: 'Yes, add them all.' }, handlers);
			}
			if (pending) {
				const p = pending as PendingAction;
				await confirmAction({
					actionName: p.actionName,
					args: p.args,
					confirm: true,
					catId,
				});
			}
			await qc.invalidateQueries({ queryKey: ['checklist'] });
			toast.success('Checklist updated!', { id });
		} catch {
			toast.error("AI coach couldn't generate the checklist.", { id });
		}
	}

	return (
		<div className="space-y-3">
			{(empty || allDone) && (
				<Alert className="border-accent-pink/40 bg-accent-pink/10">
					<Info className="inline-block mr-1" />
					<AlertTitle>
						{empty ? 'Board is empty' : "Everything's done, nice work!"}
					</AlertTitle>
					<AlertDescription className="text-surface-canvas-dark">
						Want the AI Coach to add some tasks for you?
					</AlertDescription>
					<AlertAction className="top-3">
						<Button
							variant="emboss"
							className="bg-green-400 hover:bg-green-500 py-2 px-6 text-xs"
							onClick={() =>
								askCoach(
									`My ${board} checklist for cat #${catId} is ${
										empty ? 'empty' : 'all complete'
									} — please add a few helpful ${
										board === 'daily' ? 'daily care' : 'milestone'
									} tasks to that cat's ${board} board.`,
								)
							}
						>
							Yes
						</Button>
					</AlertAction>
				</Alert>
			)}
			<KanbanBoard items={items} onMove={onMove} />
		</div>
	);
}

function useMoveHandler(catId: number, board: ChecklistBoard) {
	const move = useMoveItem(catId, board);
	return (itemId: number, newStatus: KanbanStatus) =>
		move.mutate(
			{ itemId, newStatus },
			{
				onSuccess: (res) => {
					if (res.pointsAdded > 0) toast.success(`+${res.pointsAdded} points!`);
				},
				onError: () => toast.error("Couldn't move that item."),
			},
		);
}

function DailySection({ catId }: { catId: number }) {
	const query = useTodayBoard(catId);
	const onMove = useMoveHandler(catId, 'daily');
	return (
		<BoardView
			catId={catId}
			board="daily"
			items={query.data ?? []}
			isLoading={query.isLoading}
			isError={query.isError}
			onMove={onMove}
		/>
	);
}

function PhaseSection({ catId }: { catId: number }) {
	const query = usePhaseBoard(catId);
	const onMove = useMoveHandler(catId, 'phase');
	return (
		<BoardView
			catId={catId}
			board="phase"
			items={query.data ?? []}
			isLoading={query.isLoading}
			isError={query.isError}
			onMove={onMove}
		/>
	);
}

function AddTodo({ catId }: { catId: number }) {
	const add = useAddCustomTodo(catId);
	const [open, setOpen] = useState(false);
	const [text, setText] = useState('');
	const [board, setBoard] = useState<ChecklistBoard>('daily');

	async function submit() {
		if (!text.trim()) return;
		await add.mutateAsync({ catId, itemText: text.trim(), board });
		setText('');
		setOpen(false);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm" variant="outline">
					<Plus size={16} /> Add task
				</Button>
			</DialogTrigger>
			<DialogContent title="Add a custom task">
				<div className="space-y-4">
					<Field label="Task" htmlFor="todo-text">
						<Input
							id="todo-text"
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder="e.g. Buy a scratching post"
						/>
					</Field>
					<Field label="Board" htmlFor="todo-board">
						<SelectField
							id="todo-board"
							value={board}
							onValueChange={(v) => setBoard(v as ChecklistBoard)}
							options={[
								{ value: 'daily', label: 'Daily' },
								{ value: 'phase', label: 'Phase' },
							]}
						/>
					</Field>
					<div className="flex justify-end gap-2">
						<DialogClose asChild>
							<Button variant="outline" size="sm">
								Cancel
							</Button>
						</DialogClose>
						<Button size="sm" onClick={submit} disabled={add.isPending}>
							{add.isPending ? 'Adding…' : 'Add'}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export function CatBoard({ catId }: { catId: number }) {
	return (
		<Tabs defaultValue="daily" className="space-y-4">
			<div className="flex items-center justify-between">
				<TabsList>
					<TabsTrigger value="daily">Daily</TabsTrigger>
					<TabsTrigger value="phase">90-day phase</TabsTrigger>
				</TabsList>
				<AddTodo catId={catId} />
			</div>
			<TabsContent value="daily">
				<DailySection catId={catId} />
			</TabsContent>
			<TabsContent value="phase">
				<PhaseSection catId={catId} />
			</TabsContent>
		</Tabs>
	);
}
