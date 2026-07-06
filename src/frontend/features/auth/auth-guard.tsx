'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/client';
import { Spinner } from '@/components/ui';

/** Redirects to /login when there is no session. */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { data, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !data) router.replace('/login');
  }, [isPending, data, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-6 text-accent-violet" />
      </div>
    );
  }
  if (!data) return null;
  return <>{children}</>;
}
