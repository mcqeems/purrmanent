import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

// DESIGN.md card surfaces follow canvas polarity.
const cardVariants = cva('rounded-xl p-6 sm:p-8', {
  variants: {
    variant: {
      light:
        'bg-surface-canvas-light text-ink-deep border border-hairline-cloud',
      featured: 'bg-surface-night text-on-primary',
      'feature-dark': 'bg-ink-deep text-on-primary rounded-xxl',
      spotlight: 'bg-accent-violet-deep text-on-primary rounded-xxl',
    },
  },
  defaultVariants: { variant: 'light' },
});

export interface CardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ className, variant, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ variant }), className)} {...props} />
  );
}
