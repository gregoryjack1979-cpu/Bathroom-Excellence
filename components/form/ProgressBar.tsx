"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

/** Wizard progress: filled water bar + step announcement for screen readers. */
export function ProgressBar({ step, total, dark = false }: { step: number; total: number; dark?: boolean }) {
  const pct = ((step + 1) / total) * 100;
  return (
    <div className="mb-8">
      <div className={clsx("mb-2 flex items-center justify-between text-xs font-semibold", dark ? "text-white/75" : "text-body")}>
        <span aria-live="polite">
          Step {step + 1} of {total}
        </span>
        <span aria-hidden="true">{Math.round(pct)}%</span>
      </div>
      <div className={clsx("h-2 overflow-hidden rounded-full", dark ? "bg-white/15" : "bg-teal-100")} role="presentation">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-700"
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 160, damping: 24 }}
        />
      </div>
    </div>
  );
}
