"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { IntlProvider } from "./intl-provider";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <IntlProvider>
      <QueryProvider>
        <ToastProvider>{children}</ToastProvider>
      </QueryProvider>
    </IntlProvider>
  );
}
