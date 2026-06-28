"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogClose,
  DialogTrigger,
  Pill,
  Spinner,
  useToast,
} from "@/components/ui";
import type { Cat } from "@/lib/types/api";
import { useCats, useDeleteCat } from "./hooks";
import { CatForm } from "./cat-form";

export function CatsList() {
  const { data: cats, isLoading, isError } = useCats();
  const del = useDeleteCat();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Cat | null>(null);

  if (isLoading) return <Spinner className="size-6 text-accent-violet" />;
  if (isError)
    return <p className="text-sm text-accent-pink">Could not load your cats.</p>;

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await del.mutateAsync(toDelete.id);
      toast({ tone: "success", description: `${toDelete.name} was removed.` });
    } catch {
      toast({ tone: "error", description: "Could not remove the cat." });
    } finally {
      setToDelete(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cats?.map((cat) => (
          <Card key={cat.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{cat.name}</h3>
              <Pill tone="lime">{cat.personality}</Pill>
            </div>
            <p className="text-sm text-muted">
              {cat.breed ?? "Cat"}
              {cat.ageMonths != null ? ` · ${cat.ageMonths} mo` : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              <Link
                href={`/cats/${cat.id}`}
                className="font-semibold text-accent-violet underline"
              >
                Open board
              </Link>
              <Link href={`/cats/${cat.id}/settings`} className="text-muted underline">
                Edit
              </Link>
              <button
                onClick={() => setToDelete(cat)}
                className="text-accent-pink underline"
              >
                Remove
              </button>
            </div>
          </Card>
        ))}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-hairline-cool text-muted hover:border-accent-violet hover:text-accent-violet">
              <Plus size={20} />
              <span className="text-sm font-medium">Add a cat</span>
            </button>
          </DialogTrigger>
          <DialogContent title="Add a cat">
            <CatForm onDone={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent title="Remove cat?">
          <p className="text-sm">
            Remove <strong>{toDelete?.name}</strong>? Their board and history
            will be hidden. This can be undone by support.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button
              size="sm"
              onClick={confirmDelete}
              disabled={del.isPending}
              className="bg-accent-pink"
            >
              {del.isPending ? "Removing…" : "Remove"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
