'use client';

import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/en.json';

// EN-first; structured for ID later.
export function IntlProvider({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider
      locale="en"
      messages={messages}
      timeZone="Asia/Jakarta"
    >
      {children}
    </NextIntlClientProvider>
  );
}
