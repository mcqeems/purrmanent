'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';

/** Page-level fade + slide-up on mount. */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

/** Container that staggers its FadeInItem children. Supports viewport scroll triggering. */
export function Stagger({
  children,
  className,
  viewport = true,
  once = true,
  margin = '-50px',
  delay = 0.08,
}: {
  children: ReactNode;
  className?: string;
  viewport?: boolean;
  once?: boolean;
  margin?: string;
  delay?: number;
}) {
  const trigger = viewport ? { whileInView: 'show' } : { animate: 'show' };
  return (
    <motion.div
      className={className}
      initial="hidden"
      {...trigger}
      viewport={viewport ? { once, margin } : undefined}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Individual item that fades and slides up. Inherits triggers from parent Stagger. */
export function FadeInItem({
  children,
  className,
  viewport = false, // defaults to false when used inside a Stagger container
  once = true,
  margin = '-50px',
  yOffset = 16,
  duration = 0.4,
}: {
  children: ReactNode;
  className?: string;
  viewport?: boolean;
  once?: boolean;
  margin?: string;
  yOffset?: number;
  duration?: number;
}) {
  const trigger = viewport ? { whileInView: 'show' } : {};
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: yOffset },
        show: { opacity: 1, y: 0 },
      }}
      {...(viewport ? { initial: 'hidden', ...trigger } : {})}
      viewport={viewport ? { once, margin } : undefined}
      transition={{ duration, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
