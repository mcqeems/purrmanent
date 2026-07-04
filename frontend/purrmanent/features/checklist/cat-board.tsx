'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Button,
  Card,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
  Field,
  Input,
  SelectField,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from '@/components/ui';
import type {
  ChecklistBoard,
  ChecklistItem,
  KanbanStatus,
} from '@/lib/types/api';
import { KanbanBoard } from './kanban-board';
import { streamCoachChat } from '@/features/coach/stream';
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
  const { toast } = useToast();
  const qc = useQueryClient();
  if (isLoading) return <Spinner className="size-6 text-accent-violet" />;
  if (isError)
    return (
      <p className="text-sm text-accent-pink">Could not load the board.</p>
    );

  const empty = items.length === 0;
  const allDone = !empty && items.every((i) => i.kanbanStatus === 'done');

  async function askCoach(prompt: string) {
    toast({ description: 'AI coach is generating your checklist…' });
    try {
      await streamCoachChat({ message: prompt }, {});
      await qc.invalidateQueries({ queryKey: ['checklist'] });
      toast({ tone: 'success', description: 'Checklist updated!' });
    } catch {
      toast({ tone: 'error', description: 'AI coach couldn\'t generate the checklist.' });
    }
  }

  return (
    <div className="space-y-3">
      {(empty || allDone) && (
        <Card className="flex flex-col items-start gap-3 border-accent-lime/50 bg-accent-lime/10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            {empty
              ? 'This board is empty.'
              : "🎉 Everything's done — nice work!"}{' '}
            Want the AI Coach to add some tasks for you?
          </p>
          <Button
            size="sm"
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
            Ask AI Coach
          </Button>
        </Card>
      )}
      <KanbanBoard items={items} onMove={onMove} />
    </div>
  );
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
            toast({
              tone: 'success',
              description: `+${res.pointsAdded} points!`,
            });
        },
        onError: () =>
          toast({ tone: 'error', description: "Couldn't move that item." }),
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
