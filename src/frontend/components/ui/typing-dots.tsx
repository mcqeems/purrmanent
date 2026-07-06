import { cn } from '@/lib/utils/cn';

/** Animated "assistant is typing" indicator (bouncing dots). */
export function TypingDots({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Assistant is responding"
      className={cn('inline-flex items-center gap-1 align-middle', className)}
    >
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-1.5 rounded-full bg-current animate-[pm-bounce_1s_ease-in-out_infinite]"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}
