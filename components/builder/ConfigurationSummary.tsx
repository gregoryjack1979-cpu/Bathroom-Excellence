"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { describeSelection } from "@/lib/builder/rules";
import { useConfigurator } from "@/lib/builder/useConfigurator";
import { useMotionPrefs } from "@/lib/hooks/useMotionPrefs";

interface SummaryProps {
  /** "panel": a card (desktop). "sheet": a collapsible bar pinned to the bottom (mobile). */
  variant: "panel" | "sheet";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Rows({ onChange }: { onChange?: () => void }) {
  const { steps, stepStatus, configuration, goToStep } = useConfigurator();
  return (
    <dl className="divide-y divide-ink/8">
      {steps.map((step, i) => {
        const status = stepStatus(step);
        const value = describeSelection(configuration, step.field);
        return (
          <div key={step.id} className="flex items-center gap-3 py-2.5">
            <dt className="w-[38%] shrink-0 font-sans text-[12px] font-semibold uppercase tracking-wider text-body/80">{step.title}</dt>
            <dd className={clsx("min-w-0 flex-1 truncate text-[14px]", value ? "font-semibold text-ink" : "italic text-body/60")}>
              {status === "not-applicable" ? "Not applicable" : (value ?? "Not chosen")}
            </dd>
            {status !== "not-applicable" && (
              <button
                type="button"
                onClick={() => {
                  goToStep(i);
                  onChange?.();
                }}
                className="shrink-0 font-sans text-[12px] font-semibold text-teal-700 underline-offset-2 hover:underline"
              >
                {value ? "Change" : "Choose"}
              </button>
            )}
          </div>
        );
      })}
    </dl>
  );
}

/** Live summary of every choice. Updates as the design changes. */
export function ConfigurationSummary({ variant, open = false, onOpenChange }: SummaryProps) {
  const { completedCount, applicableCount } = useConfigurator();
  const { reducedMotion } = useMotionPrefs();
  const counter = (
    <span className="font-sans text-[12px] font-semibold text-body">
      <span className="text-teal-700">{completedCount}</span>/{applicableCount} chosen
    </span>
  );

  if (variant === "panel") {
    return (
      <section aria-labelledby="builder-summary-heading" className="rounded-card bg-white p-5 shadow-card">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="builder-summary-heading" className="font-display text-xl text-ink">
            Your Bathroom Design
          </h2>
          {counter}
        </div>
        <div className="mt-2">
          <Rows />
        </div>
      </section>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[120] lg:hidden">
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            className="fixed inset-0 bg-ink/40"
            onClick={() => onOpenChange?.(false)}
          />
        )}
      </AnimatePresence>
      <div className="relative rounded-t-card bg-white shadow-[0_-8px_30px_rgba(20,20,20,0.18)]">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="builder-summary-sheet"
          onClick={() => onOpenChange?.(!open)}
          className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left"
        >
          <span className="min-w-0">
            <span className="block font-sans text-[14px] font-semibold text-ink">Your Bathroom Design</span>
            {counter}
          </span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={clsx("shrink-0 text-ink/50 transition-transform duration-200", open ? "rotate-0" : "rotate-180")}
          >
            <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id="builder-summary-sheet"
              initial={reducedMotion ? false : { height: 0 }}
              animate={{ height: "auto" }}
              exit={reducedMotion ? undefined : { height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="max-h-[55vh] overflow-y-auto border-t border-ink/10 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <Rows onChange={() => onOpenChange?.(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
