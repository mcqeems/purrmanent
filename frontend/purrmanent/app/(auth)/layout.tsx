import type { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-surface-canvas-dark px-4 py-12 text-on-primary">
      <Link href="/" className="font-display text-3xl font-bold">
        Purrmanent
      </Link>
      <div className="w-full max-w-sm rounded-xl bg-surface-night p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
}
