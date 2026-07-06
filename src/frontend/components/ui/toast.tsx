'use client';

import Image from 'next/image';
import { toast as sonnerToast } from 'sonner';
import { Check, X } from 'lucide-react';
import logo from '@/app/assets/logo/logo-1000x1000.png';
import { cn } from '@/lib/utils/cn';
import { Spinner } from './spinner';

type ToastStatus = 'loading' | 'success' | 'error';

function StatusIcon({ status }: { status: ToastStatus }) {
  if (status === 'loading')
    return <Spinner className="size-4 text-accent-violet" />;
  if (status === 'success')
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-lime text-ink-deep">
        <Check size={13} strokeWidth={3} />
      </span>
    );
  return (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-danger text-on-primary">
      <X size={13} strokeWidth={3} />
    </span>
  );
}

/**
 * Branded toast body: logo pill (accent-lime, rounded-full) — message —
 * status icon/spinner at the end. Rendered via sonner's toast.custom, so
 * sonner still owns mount/unmount + enter/exit animation & stacking; this
 * component is purely the pill's content.
 */
function ToastBody({
  status,
  message,
}: {
  status: ToastStatus;
  message: string;
}) {
  return (
    <div
      className={cn(
        'flex w-full items-center gap-3 rounded-full border border-hairline-cloud bg-surface-canvas-light px-3 py-2 shadow-[rgba(0,0,0,0.1)_0_10px_15px_-3px]',
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-lime">
        <Image src={logo} alt="Purrmanent logo" width={20} height={20} className="rounded-full" />
      </span>
      <p className="flex-1 truncate text-sm font-medium text-ink-deep">
        {message}
      </p>
      <StatusIcon status={status} />
    </div>
  );
}

/**
 * Branded toast helper — every call site should use this instead of sonner's
 * toast() directly, so all toasts get the logo-pill look consistently.
 *
 * - success(message) / error(message): one-shot, auto-dismiss.
 * - loading(message): returns the toast id — stays open until you dismiss()
 *   or promise() resolves it. Use for long-running actions (e.g. AI coach
 *   generating something) that must not disappear mid-flight.
 * - promise(promise, messages): loading -> success/error, overwriting the
 *   SAME toast in place (one id) rather than stacking a new one — this is
 *   the "same cycle/action" overwrite case. Any other, unrelated action
 *   always gets its own new toast (just call success/error/loading again).
 */
export const toast = {
  success(message: string, opts?: { id?: string | number }) {
    return sonnerToast.custom(
      () => <ToastBody status="success" message={message} />,
      opts,
    );
  },
  error(message: string, opts?: { id?: string | number }) {
    return sonnerToast.custom(
      () => <ToastBody status="error" message={message} />,
      opts,
    );
  },
  loading(message: string, opts?: { id?: string | number }) {
    return sonnerToast.custom(
      () => <ToastBody status="loading" message={message} />,
      { duration: Infinity, ...opts },
    );
  },
  dismiss(id: string | number) {
    sonnerToast.dismiss(id);
  },
  /** Loading -> success/error, same toast id (overwrite-in-place). */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    },
  ): string | number {
    const id = sonnerToast.custom(
      () => <ToastBody status="loading" message={messages.loading} />,
      { duration: Infinity },
    );
    promise
      .then((data) => {
        const text =
          typeof messages.success === 'function'
            ? messages.success(data)
            : messages.success;
        sonnerToast.custom(() => <ToastBody status="success" message={text} />, {
          id,
          duration: 4000,
        });
      })
      .catch((err) => {
        const text =
          typeof messages.error === 'function'
            ? messages.error(err)
            : messages.error;
        sonnerToast.custom(() => <ToastBody status="error" message={text} />, {
          id,
          duration: 4000,
        });
      });
    return id;
  },
};
