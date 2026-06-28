"use client";

import { useMemo } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { cn } from "@/lib/utils/cn";
import type { ChecklistItem, KanbanStatus } from "@/lib/types/api";

const COLUMNS: { id: KanbanStatus; label: string }[] = [
  { id: "todo", label: "To-Do" },
  { id: "progress", label: "In Progress" },
  { id: "done", label: "Done" },
];

function Card({ item }: { item: ChecklistItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab rounded-md border border-hairline-cloud bg-surface-canvas-light p-3 text-sm text-ink-deep shadow-sm",
        item.kanbanStatus === "done" && "opacity-70",
        isDragging && "opacity-40",
      )}
    >
      <span className={item.kanbanStatus === "done" ? "line-through" : ""}>
        {item.itemText}
      </span>
    </div>
  );
}

function Column({
  id,
  label,
  items,
}: {
  id: KanbanStatus;
  label: string;
  items: ChecklistItem[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-40 flex-1 flex-col gap-2 rounded-xl bg-surface-press-light p-3",
        isOver && "ring-2 ring-accent-violet",
      )}
    >
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-ink-deep">{label}</h3>
        <span className="text-xs text-muted">{items.length}</span>
      </div>
      {items.map((item) => (
        <Card key={item.id} item={item} />
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

  const byStatus = useMemo(() => {
    const map: Record<KanbanStatus, ChecklistItem[]> = {
      todo: [],
      progress: [],
      done: [],
    };
    for (const it of items) map[it.kanbanStatus]?.push(it);
    return map;
  }, [items]);

  function handleDragEnd(e: DragEndEvent) {
    const itemId = Number(e.active.id);
    const target = e.over?.id as KanbanStatus | undefined;
    if (!target) return;
    const item = items.find((i) => i.id === itemId);
    if (item && item.kanbanStatus !== target) onMove(itemId, target);
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-3 sm:flex-row">
        {COLUMNS.map((col) => (
          <Column key={col.id} id={col.id} label={col.label} items={byStatus[col.id]} />
        ))}
      </div>
    </DndContext>
  );
}
