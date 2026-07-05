import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
	'inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus disabled:pointer-events-none disabled:bg-hairline-cloud disabled:text-on-dark-muted disabled:opacity-100 disabled:shadow-none gap-2 cursor-pointer',
	{
		variants: {
			variant: {
				default:
					'bg-primary/80 hover:bg-primary/90 text-on-primary font-bold text-[14px] leading-[1.14] tracking-[0.2px]   active:bg-primary',
				inverted:
					'bg-surface-canvas-light hover:bg-surface-press-stronger text-ink-deep font-bold text-[14px] leading-[1.14] tracking-[0.2px] active:bg-surface-press-light active:text-ink-press shadow-[0_2px_8px_0_rgba(0,0,0,0.08)] disabled:text-ink-deep/75 disabled:bg-surface-press-stronger disabled:text-muted',
				'ghost-on-dark':
					'bg-on-dark-faint text-on-primary font-bold text-[14px] leading-[1.14] tracking-[0.2px]',
				'violet-token':
					'bg-accent-violet-mid text-on-primary font-medium text-[14px] leading-[1.29] tracking-[0.2px] border border-hairline-violet',
				violet:
					'bg-accent-violet-mid text-on-primary font-medium text-[14px] leading-[1.29] tracking-[0.2px] border border-hairline-violet',
				emboss:
					'bg-accent-lime text-ink-deep font-bold text-[14px] leading-[1.14] tracking-[0.2px] shadow-emboss rounded-[24px] border border-accent-lime/20 hover:bg-accent-lime/90 hover:scale-[0.97] active:scale-[0.95] transition-all duration-200',
				// Fallbacks for standard Shadcn UI variants
				destructive:
					'bg-danger/90 text-on-primary font-bold text-[14px] leading-[1.14] tracking-[0.2px] active:bg-danger hover:bg-danger disabled:bg-danger/50',
				outline:
					'border border-hairline-cool bg-surface-canvas-light hover:bg-surface-press-light text-ink-deep font-bold text-[14px] leading-[1.14] tracking-[0.2px] active:bg-surface-press-light active:text-ink-press',
				secondary:
					'bg-surface-night text-on-primary font-bold text-[14px] leading-[1.14] tracking-[0.2px]   active:bg-surface-press-stronger active:text-ink-press',
				ghost:
					'hover:bg-surface-press-light hover:text-ink-deep text-ink-deep font-bold text-[14px] leading-[1.14] tracking-[0.2px]  ',
				link: 'text-ink-deep underline-offset-4 hover:underline',
			},
			size: {
				default: 'px-4 py-3 rounded-md',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-12 rounded-md px-8',
				icon: 'h-10 w-10 rounded-md',
				'icon-sm': 'h-8 w-8 rounded-md',
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
