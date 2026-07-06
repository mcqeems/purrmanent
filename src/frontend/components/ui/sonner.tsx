'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

/**
 * Branded toast surface. All toasts render via toast.custom (see toast.tsx)
 * so sonner's built-in icons/colors are unused here — this wrapper mainly
 * fixes position (bottom-right, matches sonner's default) and forces light
 * theme (the app has no dark-mode toggle — DESIGN.md is two-polarity by
 * page section, not a global theme switch, so next-themes isn't relevant).
 */
export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      gap={10}
      style={
        {
          '--normal-bg': 'var(--color-surface-canvas-light)',
          '--normal-text': 'var(--color-ink-deep)',
          '--normal-border': 'var(--color-hairline-cloud)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
