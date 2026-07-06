import { cn } from '@/lib/utils/cn';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="skeleton"
			className={cn(
				'animate-pulse rounded-md bg-surface-press-stronger',
				className,
			)}
			{...props}
		/>
	);
}

export { Skeleton };
