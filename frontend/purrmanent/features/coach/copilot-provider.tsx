"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useCoach } from "./use-coach";

type CopilotValue = ReturnType<typeof useCoach> & {
  open: boolean;
  setOpen: (open: boolean) => void;
  ask: (text: string) => void;
};

const CopilotContext = createContext<CopilotValue | null>(null);

export function useCopilot() {
  const ctx = useContext(CopilotContext);
  if (!ctx) throw new Error("useCopilot must be used within <CopilotProvider>");
  return ctx;
}

export function CopilotProvider({ children }: { children: ReactNode }) {
  const coach = useCoach();
  const [open, setOpen] = useState(false);

  const value = useMemo<CopilotValue>(
    () => ({
      ...coach,
      open,
      setOpen,
      ask: (text: string) => {
        setOpen(true);
        void coach.send(text);
      },
    }),
    [coach, open],
  );

  return (
    <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>
  );
}
