"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMotionPrefs } from "@/lib/hooks/useMotionPrefs";

/** A single transient status message, announced to screen readers. */
export function Toast({ message, toastKey }: { message: string | null; toastKey: number }) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[150] flex justify-center px-4 lg:bottom-6" role="status" aria-live="polite">
      <AnimatePresence>
        {message && (
          <motion.div
            key={toastKey}
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2.5 rounded-full bg-ink px-4 py-2.5 font-sans text-sm font-semibold text-white shadow-lift"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-teal-300">
              <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
