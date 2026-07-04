'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/app-shell';
import { CoachPage } from '@/features/coach/coach-page';
import { CoachBubbles } from '@/features/coach/coach-bubbles';
import { useCopilot } from '@/features/coach/copilot-provider';
import { motion, AnimatePresence } from 'motion/react';

export default function AICoachPage() {
  const { messages } = useCopilot();
  const hasMessages = messages.length > 0;
  const [showGradient, setShowGradient] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setShowGradient(window.innerWidth >= 640);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  return (
    <>
      <PageHeader
        title="AI Coach"
        subtitle="Chat, take actions, and revisit past conversations."
      />
      <div className="relative w-full">
        {/* Background Gradient Blobs (only when no conversation, rendered behind/outside the bordered container on sm and larger screens) */}
        <AnimatePresence>
          {!hasMessages && showGradient && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden sm:block absolute inset-0 pointer-events-none"
            >
              {/* Blob 1 */}
              <motion.div
                animate={{
                  x: [0, 30, -15, 0],
                  y: [0, -25, 25, 0],
                  scale: [1, 1.1, 0.95, 1],
                  opacity: [0.4, 0.6, 0.4],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-10 left-10 w-80 h-40 rounded-full bg-accent-pink/50 blur-[90px]"
              />

              {/* Blob 2 */}
              <motion.div
                animate={{
                  x: [0, -25, 25, 0],
                  y: [0, 30, -15, 0],
                  scale: [1, 0.95, 1.05, 1],
                  opacity: [0.35, 0.5, 0.35],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-20 -right-20 w-96 h-50 rounded-full bg-accent-violet/50 blur-[100px]"
              />

              {/* Blob 3 */}
              <motion.div
                animate={{
                  x: [0, 15, -20, 0],
                  y: [0, 15, -10, 0],
                  scale: [0.95, 1.05, 0.95, 0.95],
                  opacity: [0.3, 0.45, 0.3],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-1/4 left-1/3 w-72 h-48 rounded-full bg-accent-lime/50 blur-[90px]"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Workspace Area with responsive height to prevent overflow on mobile viewports */}
        <div className="relative flex flex-col h-[calc(100vh-16rem)] sm:h-[calc(100vh-12.5rem)] w-full bg-transparent rounded-xl border border-slate-100/50 z-10">
          <CoachPage />
        </div>
      </div>
      <CoachBubbles />
    </>
  );
}
