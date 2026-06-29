'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(function Checkbox({ className, ...props }, ref) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-xs border border-hairline-cool bg-surface-canvas-light data-[state=checked]:border-accent-violet data-[state=checked]:bg-accent-violet data-[state=checked]:text-on-primary',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <Check size={14} strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
