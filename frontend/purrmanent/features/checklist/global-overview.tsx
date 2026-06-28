"use client";

import Link from "next/link";
import { Card, Pill } from "@/components/ui";
import { useGlobalBoard } from "./hooks";

export function GlobalOverview() {
  const { data } = useGlobalBoard();
  if (!data || data.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((s) => (
        <Card key={s.catId} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Link
              href={`/cats/${s.catId}`}
              className="text-lg font-semibold hover:underline"
            >
              {s.name}
            </Link>
          </div>
          <div className="flex gap-2 text-xs">
            <Pill tone="neutral">To-Do {s.todo}</Pill>
            <Pill tone="dark">In progress {s.progress}</Pill>
            <Pill tone="lime">Done {s.done}</Pill>
          </div>
        </Card>
      ))}
    </div>
  );
}
