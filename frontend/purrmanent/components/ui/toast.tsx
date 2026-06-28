"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "@/lib/utils/cn";

type ToastTone = "default" | "success" | "error";

interface ToastItem {
  id: number;
  title?: string;
  description: string;
  tone: ToastTone;
}

interface ToastInput {
  title?: string;
  description: string;
  tone?: ToastTone;
}

const ToastContext = React.createContext<{ toast: (t: ToastInput) => void } | null>(
  null,
);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((t: ToastInput) => {
    setItems((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), tone: t.tone ?? "default", ...t },
    ]);
  }, []);

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {items.map((it) => (
          <ToastPrimitive.Root
            key={it.id}
            duration={4000}
            onOpenChange={(open) => {
              if (!open) setItems((p) => p.filter((x) => x.id !== it.id));
            }}
            className={cn(
              "flex flex-col gap-1 rounded-md border p-4 shadow-[rgba(0,0,0,0.1)_0_10px_15px_-3px]",
              it.tone === "success" && "border-accent-lime bg-surface-night text-on-primary",
              it.tone === "error" && "border-accent-pink bg-surface-night text-on-primary",
              it.tone === "default" && "border-hairline-cloud bg-surface-canvas-light text-ink-deep",
            )}
          >
            {it.title && (
              <ToastPrimitive.Title className="text-sm font-semibold">
                {it.title}
              </ToastPrimitive.Title>
            )}
            <ToastPrimitive.Description className="text-sm">
              {it.description}
            </ToastPrimitive.Description>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
