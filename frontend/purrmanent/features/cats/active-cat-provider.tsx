"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Cat } from "@/lib/types/api";
import { useCats } from "./hooks";

interface ActiveCatValue {
  cats: Cat[];
  activeCat: Cat | null;
  activeCatId: number | null;
  setActiveCatId: (id: number) => void;
  isLoading: boolean;
}

const ActiveCatContext = createContext<ActiveCatValue | null>(null);
const STORAGE_KEY = "purrmanent.activeCatId";

export function useActiveCat() {
  const ctx = useContext(ActiveCatContext);
  if (!ctx) throw new Error("useActiveCat must be used within <ActiveCatProvider>");
  return ctx;
}

function storedId(): number | null {
  if (typeof window === "undefined") return null;
  const n = Number(localStorage.getItem(STORAGE_KEY));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function ActiveCatProvider({ children }: { children: ReactNode }) {
  const { data: cats = [], isLoading } = useCats();
  const [selected, setSelected] = useState<number | null>(null);

  // Effective active id (no setState-in-effect): explicit selection → stored → first cat.
  const activeCatId = useMemo(() => {
    if (selected != null && cats.some((c) => c.id === selected)) return selected;
    const stored = storedId();
    if (stored != null && cats.some((c) => c.id === stored)) return stored;
    return cats[0]?.id ?? null;
  }, [selected, cats]);

  function setActiveCatId(id: number) {
    setSelected(id);
    if (typeof window !== "undefined")
      localStorage.setItem(STORAGE_KEY, String(id));
  }

  const activeCat = cats.find((c) => c.id === activeCatId) ?? null;

  const value = useMemo<ActiveCatValue>(
    () => ({ cats, activeCat, activeCatId, setActiveCatId, isLoading }),
    [cats, activeCat, activeCatId, isLoading],
  );

  return (
    <ActiveCatContext.Provider value={value}>
      {children}
    </ActiveCatContext.Provider>
  );
}
