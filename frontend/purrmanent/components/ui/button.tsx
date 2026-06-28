"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

// DESIGN.md single-primary CTA hierarchy + polarity-flipped variants.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-sans font-bold uppercase tracking-[0.2px] transition-colors disabled:cursor-not-allowed disabled:bg-hairline-cloud disabled:text-muted",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary hover:bg-ink-deep rounded-md",
        inverted:
          "bg-on-primary text-ink-deep hover:bg-surface-press-light rounded-md",
        ghost: "bg-on-dark-faint text-on-primary hover:bg-white/25 rounded-xl",
        violet: "bg-accent-violet-mid text-on-primary rounded-xl",
        outline:
          "border border-hairline-cool bg-transparent text-ink-deep hover:bg-surface-press-light rounded-md",
      },
      size: {
        sm: "text-xs px-3 py-2",
        md: "text-sm px-4 py-3",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant, size, asChild, ...props }, ref) {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
