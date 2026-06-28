"use client";

import { useActiveCat } from "./active-cat-provider";

export function CatSwitcher() {
  const { cats, activeCatId, setActiveCatId } = useActiveCat();
  if (cats.length === 0) return null;

  return (
    <select
      aria-label="Active cat"
      value={activeCatId ?? ""}
      onChange={(e) => setActiveCatId(Number(e.target.value))}
      className="rounded-md border border-hairline-cool bg-surface-canvas-light px-2 py-1 text-sm text-ink-deep"
    >
      {cats.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
