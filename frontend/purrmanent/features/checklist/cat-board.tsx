"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
  Field,
  Input,
  Select,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from "@/components/ui";
import type { ChecklistBoard, ChecklistItem, KanbanStatus } from "@/lib/types/api";
import { KanbanBoard } from "./kanban-board";
import {
  useAddCustomTodo,
  useMoveItem,
  usePhaseBoard,
  useTodayBoard,
} from "./hooks";

function BoardView({
  items,
  isLoading,
  isError,
  onMove,
}: {
  items: ChecklistItem[];
  isLoading: boolean;
  isError: boolean;
  onMove: (itemId: number, newStatus: KanbanStatus) => void;
}) {
  if (isLoading) return <Spinner className="size-6 text-accent-violet" />;
  if (isError)
    return <p className="text-sm text-accent-pink">Could not load the board.</p>;
  return <KanbanBoard items={items} onMove={onMove} />;
}

function useMoveHandler(catId: number, board: ChecklistBoard) {
  const { toast } = useToast();
  const move = useMoveItem(catId, board);
  return (itemId: number, newStatus: KanbanStatus) =>
    move.mutate(
      { itemId, newStatus },
      {
        onSuccess: (res) => {
          if (res.pointsAdded > 0)
            toast({ tone: "success", description: `+${res.pointsAdded} points!` });
        },
        onError: () =>
          toast({ tone: "error", description: "Couldn't move that item." }),
      },
    );
}

function DailySection({ catId }: { catId: number }) {
  const query = useTodayBoard(catId);
  const onMove = useMoveHandler(catId, "daily");
  return (
    <BoardView
      items={query.data ?? []}
      isLoading={query.isLoading}
      isError={query.isError}
      onMove={onMove}
    />
  );
}

function PhaseSection({ catId }: { catId: number }) {
  const query = usePhaseBoard(catId);
  const onMove = useMoveHandler(catId, "phase");
  return (
    <BoardView
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
  const [text, setText] = useState("");
  const [board, setBoard] = useState<ChecklistBoard>("daily");

  async function submit() {
    if (!text.trim()) return;
    await add.mutateAsync({ catId, itemText: text.trim(), board });
    setText("");
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
            <Select
              id="todo-board"
              value={board}
              onChange={(e) => setBoard(e.target.value as ChecklistBoard)}
            >
              <option value="daily">Daily</option>
              <option value="phase">Phase</option>
            </Select>
          </Field>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button size="sm" onClick={submit} disabled={add.isPending}>
              {add.isPending ? "Adding…" : "Add"}
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
