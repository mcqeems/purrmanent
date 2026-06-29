'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils/cn';

/** Renders standard Markdown (GFM: tables, lists, code) with prose styling. */
export function Markdown({
  content,
  dark,
  className,
}: {
  content: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'prose prose-sm max-w-none break-words prose-pre:bg-black/40 prose-pre:text-xs',
        dark && 'prose-invert',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
