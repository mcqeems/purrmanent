'use client';

import { useMemo, useState } from 'react';
import {
	DndContext,
	DragOverlay,
	PointerSensor,
	KeyboardSensor,
	useSensor,
	useSensors,
	useDraggable,
	useDroppable,
	type DragEndEvent,
	type DragStartEvent,
} from '@dnd-kit/core';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { GripVertical, MoreVertical, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { ChecklistItem, KanbanStatus } from '@/lib/types/api';

const COLUMNS: { id: KanbanStatus; label: string }[] = [
	{ id: 'todo', label: 'To-Do' },
	{ id: 'progress', label: 'In Progress' },
	{ id: 'done', label: 'Done' },
];

const STATUS_OPTIONS = COLUMNS.map((c) => ({ value: c.id, label: c.label }));

function MoveMenu({
	value,
	onMove,
}: {
	value: KanbanStatus;
	onMove: (newStatus: KanbanStatus) => void;
}) {
	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button
					aria-label="Change status"
					className="-mr-1 rounded p-1 text-muted hover:bg-surface-press-light hover:text-ink-deep transition-colors duration-200 cursor-pointer "
				>
					<MoreVertical size={16} />
				</button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content
					align="end"
					sideOffset={4}
					className="z-50 min-w-40 rounded-md border border-hairline-cloud bg-surface-canvas-light p-1 shadow-[rgba(0,0,0,0.1)_0_10px_15px_-3px] data-[state=open]:animate-[pm-fade-in_120ms_ease-out]"
				>
					{STATUS_OPTIONS.map((o) => (
						<DropdownMenu.Item
							key={o.value}
							onSelect={() => onMove(o.value)}
							className="flex cursor-pointer items-center justify-between rounded-sm px-3 py-2 text-sm text-ink-deep outline-none data-[highlighted]:bg-surface-press-light transition-all duration-200"
						>
							{o.label}
							{value === o.value && (
								<Check size={14} className="text-accent-violet" />
							)}
						</DropdownMenu.Item>
					))}
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}

function Card({
	item,
	onMove,
}: {
	item: ChecklistItem;
	onMove: (itemId: number, newStatus: KanbanStatus) => void;
}) {
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: item.id,
	});
	return (
		<div
			ref={setNodeRef}
			className={cn(
				'rounded-md border border-hairline-cloud bg-surface-canvas-light p-3 text-sm text-ink-deep shadow-sm transition-shadow hover:shadow-md',
				item.kanbanStatus === 'done' && 'opacity-70',
				isDragging && 'opacity-40',
			)}
		>
			<div className="flex items-start gap-2">
				<button
					{...attributes}
					{...listeners}
					aria-label="Drag to move"
					className="mt-0.5 hidden cursor-grab touch-none text-muted hover:text-ink-deep sm:block"
				>
					<GripVertical size={16} />
				</button>
				<span
					className={cn(
						'flex-1',
						item.kanbanStatus === 'done' && 'line-through',
					)}
				>
					{item.itemText}
				</span>
				<MoveMenu
					value={item.kanbanStatus}
					onMove={(s) => onMove(item.id, s)}
				/>
			</div>
		</div>
	);
}

function Column({
	id,
	label,
	items,
	onMove,
}: {
	id: KanbanStatus;
	label: string;
	items: ChecklistItem[];
	onMove: (itemId: number, newStatus: KanbanStatus) => void;
}) {
	const { setNodeRef, isOver } = useDroppable({ id });
	return (
		<div
			ref={setNodeRef}
			className={cn(
				'flex min-h-40 flex-1 flex-col gap-2 rounded-xl bg-surface-press-light p-3 transition-all duration-200',
				isOver && 'ring-2 ring-accent-violet/50',
			)}
		>
			<div className="flex items-center justify-between px-1">
				<h3 className="text-sm font-semibold text-ink-deep">{label}</h3>
				<span className="text-xs text-muted">{items.length}</span>
			</div>
			{items.map((item) => (
				<Card key={item.id} item={item} onMove={onMove} />
			))}
		</div>
	);
}

export function KanbanBoard({
	items,
	onMove,
}: {
	items: ChecklistItem[];
	onMove: (itemId: number, newStatus: KanbanStatus) => void;
}) {
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
		useSensor(KeyboardSensor),
	);

	const [activeId, setActiveId] = useState<number | null>(null);

	const byStatus = useMemo(() => {
		const map: Record<KanbanStatus, ChecklistItem[]> = {
			todo: [],
			progress: [],
			done: [],
		};
		for (const it of items) map[it.kanbanStatus]?.push(it);
		return map;
	}, [items]);

	const activeItem = items.find((i) => i.id === activeId) ?? null;

	function handleDragStart(e: DragStartEvent) {
		setActiveId(Number(e.active.id));
	}

	function handleDragEnd(e: DragEndEvent) {
		setActiveId(null);
		const itemId = Number(e.active.id);
		const target = e.over?.id as KanbanStatus | undefined;
		if (!target) return;
		const item = items.find((i) => i.id === itemId);
		if (item && item.kanbanStatus !== target) onMove(itemId, target);
	}

	return (
		<DndContext
			sensors={sensors}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDragCancel={() => setActiveId(null)}
		>
			<div className="flex flex-col gap-3 sm:flex-row">
				{COLUMNS.map((col) => (
					<Column
						key={col.id}
						id={col.id}
						label={col.label}
						items={byStatus[col.id]}
						onMove={onMove}
					/>
				))}
			</div>
			<DragOverlay dropAnimation={null}>
				{activeItem ? (
					<div className="scale-105 cursor-grabbing rounded-md border border-accent-violet bg-surface-canvas-light p-3 text-sm text-ink-deep shadow-[rgba(0,0,0,0.18)_0_8px_24px]">
						{activeItem.itemText}
					</div>
				) : null}
			</DragOverlay>
		</DndContext>
	);
}
