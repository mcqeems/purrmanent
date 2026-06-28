"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  Card,
  Dialog,
  DialogContent,
  DialogTrigger,
  Pill,
  Spinner,
} from "@/components/ui";
import { useCats } from "./hooks";
import { CatForm } from "./cat-form";

export function CatsList() {
  const { data: cats, isLoading, isError } = useCats();
  const [open, setOpen] = useState(false);

  if (isLoading) return <Spinner className="size-6 text-accent-violet" />;
  if (isError)
    return <p className="text-sm text-accent-pink">Could not load your cats.</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cats?.map((cat) => (
        <Link key={cat.id} href={`/cats/${cat.id}`} className="block">
          <Card className="flex flex-col gap-2 transition-shadow hover:shadow-[rgba(0,0,0,0.1)_0_10px_15px_-3px]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{cat.name}</h3>
              <Pill tone="lime">{cat.personality}</Pill>
            </div>
            <p className="text-sm text-muted">
              {cat.breed ?? "Cat"}
              {cat.ageMonths != null ? ` · ${cat.ageMonths} mo` : ""}
            </p>
            <span className="mt-2 text-sm font-semibold text-accent-violet">
              Open board →
            </span>
          </Card>
        </Link>
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
  );
}
