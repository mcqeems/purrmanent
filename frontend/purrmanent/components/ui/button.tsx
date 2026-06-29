import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus disabled:pointer-events-none disabled:bg-hairline-cloud disabled:text-on-dark-muted disabled:opacity-100 disabled:shadow-none',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-on-primary font-bold text-[14px] leading-[1.14] tracking-[0.2px] uppercase active:bg-surface-press-stronger active:text-ink-press',
        inverted:
          'bg-on-primary text-ink-deep font-bold text-[14px] leading-[1.14] tracking-[0.2px] uppercase active:bg-surface-press-light active:text-ink-press shadow-[0_2px_8px_0_rgba(0,0,0,0.08)]',
        'ghost-on-dark':
          'bg-on-dark-faint text-on-primary font-bold text-[14px] leading-[1.14] tracking-[0.2px] uppercase',
        'violet-token':
          'bg-accent-violet-mid text-on-primary font-medium text-[14px] leading-[1.29] tracking-[0.2px] uppercase border border-hairline-violet',
        // Fallbacks for standard Shadcn UI variants
        destructive:
          'bg-danger text-on-primary font-bold text-[14px] leading-[1.14] tracking-[0.2px] uppercase active:bg-danger/90',
        outline:
          'border border-hairline-cool bg-surface-canvas-light text-ink-deep font-bold text-[14px] leading-[1.14] tracking-[0.2px] uppercase active:bg-surface-press-light active:text-ink-press',
        secondary:
          'bg-surface-night text-on-primary font-bold text-[14px] leading-[1.14] tracking-[0.2px] uppercase active:bg-surface-press-stronger active:text-ink-press',
        ghost:
          'hover:bg-surface-press-light hover:text-ink-deep text-ink-deep font-bold text-[14px] leading-[1.14] tracking-[0.2px] uppercase',
        link: 'text-ink-deep underline-offset-4 hover:underline',
      },
      size: {
        default: 'px-4 py-3 rounded-md',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-12 rounded-md px-8',
        icon: 'h-10 w-10 rounded-md',
        'ghost-on-dark': 'p-2 rounded-xl',
        'violet-token': 'px-4 py-2 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
