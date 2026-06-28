import * as React from "react";
import { cn } from "@/lib/utils/cn";

/** Small status/category pill (DESIGN.md pill-neutral-dark + light variant). */
export function Pill({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "dark" | "lime";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-xs px-2 py-1 text-xs font-medium",
        tone === "dark" && "bg-surface-night text-on-primary",
        tone === "neutral" && "bg-surface-press-light text-ink-deep",
        tone === "lime" && "bg-accent-lime text-ink-deep",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Signature lime keyword highlight chip — DESIGN.md treats this as a glyph-level
 * decoration inside display headlines. Keep it scarce (one per viewport).
 */
export function Chip({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "rounded-xs bg-accent-lime px-3 text-ink-deep",
        className,
      )}
      {...props}
    />
  );
}
