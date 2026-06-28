"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Dialog,
  DialogClose,
  DialogContent,
  Spinner,
  useToast,
} from "@/components/ui";
import { useCat, useDeleteCat } from "./hooks";
import { CatForm } from "./cat-form";

export function EditCat({ catId }: { catId: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: cat, isLoading, isError } = useCat(catId);
  const del = useDeleteCat();
  const [confirm, setConfirm] = useState(false);

  if (isLoading) return <Spinner className="size-6 text-accent-violet" />;
  if (isError || !cat)
    return <p className="text-sm text-accent-pink">Could not load this cat.</p>;

  async function remove() {
    try {
      await del.mutateAsync(catId);
      toast({ tone: "success", description: `${cat!.name} was removed.` });
      router.push("/dashboard");
    } catch {
      toast({ tone: "error", description: "Could not remove the cat." });
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
            <Button
              variant="outline"
              className="border-danger text-danger"
              onClick={() => setConfirm(true)}
            >
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
                  className="bg-danger"
                  onClick={remove}
                  disabled={del.isPending}
                >
                  {del.isPending ? "Removing…" : "Remove"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </div>
  );
}
