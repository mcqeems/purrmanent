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
				'flex size-5 shrink-0 items-center justify-center rounded-xs border bg-surface-canvas-light data-[state=checked]:drop-shadow-2xl data-[state=checked]:bg-accent-lime/85 data-[state=checked]:hover:bg-accent-lime data-[state=checked]:text-surface-canvas-dark cursor-pointer hover:bg-surface-press-light',
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
