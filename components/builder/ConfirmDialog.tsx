"use client";

import { useEffect, useRef, type ReactNode } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { useMotionPrefs } from "@/lib/hooks/useMotionPrefs";

export interface ConfirmOptions {
  title: string;
  body?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" styles the confirm button for destructive actions */
  tone?: "default" | "danger";
}

interface ConfirmDialogProps {
  options: ConfirmOptions | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Accessible modal confirm: focus-trapped, Esc and backdrop cancel. */
export function ConfirmDialog({ options, onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDivElement>(null);
  const open = options !== null;
  const { reducedMotion } = useMotionPrefs();
  useFocusTrap(ref, open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && options && (
        <motion.div
          className="fixed inset-0 z-[200] grid place-items-center bg-ink/55 p-4 backdrop-blur-[2px]"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
        >
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby="builder-confirm-title"
            className="w-full max-w-md rounded-card bg-white p-6 shadow-lift sm:p-7"
            initial={reducedMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <h2 id="builder-confirm-title" className="font-display text-2xl leading-tight text-ink">
              {options.title}
            </h2>
            {options.body && <div className="mt-3 text-[15px] leading-relaxed text-body">{options.body}</div>}
            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-md border border-ink/15 bg-white px-5 py-2.5 font-sans text-sm font-semibold text-ink transition-colors hover:bg-porcelain"
              >
                {options.cancelLabel ?? "Cancel"}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={clsx(
                  "rounded-md px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-card transition-colors",
                  options.tone === "danger" ? "bg-[#a33d2f] hover:bg-[#8c3226]" : "bg-ink hover:bg-deep",
                )}
              >
                {options.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
