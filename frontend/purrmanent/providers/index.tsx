'use client';

import type { ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { IntlProvider } from './intl-provider';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <IntlProvider>
      <QueryProvider>
        {children}
        <Toaster />
      </QueryProvider>
    </IntlProvider>
  );
}
