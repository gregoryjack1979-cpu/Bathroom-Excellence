"use client";

import clsx from "clsx";
import { useConfigurator } from "@/lib/builder/useConfigurator";

/** "Step 3 of 11" plus a segmented bar — one segment per step, filled once reviewed. */
export function ProgressBar() {
  const { steps, stepIndex, stepStatus, reviewedCount, applicableCount } = useConfigurator();
  return (
    <div className="rounded-card bg-white px-5 py-4 shadow-card">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-sans text-sm font-semibold text-ink">
          Step {stepIndex + 1} <span className="font-medium text-body">of {steps.length}</span>
        </p>
        <p className="font-sans text-[13px] text-body">
          <span className="font-semibold text-teal-700">{reviewedCount}</span> of {applicableCount} reviewed
        </p>
      </div>
      <div
        role="progressbar"
        aria-label="Steps reviewed"
        aria-valuemin={0}
        aria-valuemax={applicableCount}
        aria-valuenow={reviewedCount}
        className="mt-3 flex gap-1"
      >
        {steps.map((step, i) => {
          const status = stepStatus(step);
          return (
            <span
              key={step.id}
              title={`${step.title}: ${status === "not-applicable" ? "not applicable" : status}`}
              className={clsx(
                "h-2 flex-1 rounded-full transition-colors duration-300",
                status === "reviewed" && "bg-teal-600",
                status === "pending" && "bg-ink/10",
                status === "not-applicable" && "bg-[repeating-linear-gradient(45deg,#d9d4c9_0_4px,transparent_4px_8px)]",
                i === stepIndex && "ring-2 ring-teal-600/40 ring-offset-1",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
