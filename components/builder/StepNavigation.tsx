"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import { describeSelection } from "@/lib/builder/rules";
import { useConfigurator } from "@/lib/builder/useConfigurator";
import type { StepStatus } from "@/lib/builder/types";

function Bubble({ n, status, current }: { n: number; status: StepStatus; current: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "grid h-7 w-7 shrink-0 place-items-center rounded-full font-sans text-[12px] font-bold transition-colors",
        status === "reviewed" && "bg-teal-700 text-white",
        status === "pending" && (current ? "bg-ink text-white" : "border border-ink/20 bg-white text-ink"),
        status === "not-applicable" && "border border-dashed border-ink/25 bg-transparent text-ink/40",
      )}
    >
      {status === "reviewed" ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : status === "not-applicable" ? (
        "–"
      ) : (
        n
      )}
    </span>
  );
}

/**
 * The step list. A vertical checklist on desktop; a horizontal strip of chips
 * on smaller screens. Every step is clickable so earlier choices can be revisited.
 */
export function StepNavigation() {
  const { steps, stepIndex, stepStatus, goToStep, configuration } = useConfigurator();
  const stripRef = useRef<HTMLOListElement>(null);

  // keep the active chip in view on the mobile strip
  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLElement>(`[data-step-index="${stepIndex}"]`);
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [stepIndex]);

  const statusText = (status: StepStatus, value: string | null) =>
    status === "not-applicable" ? "Not applicable" : (value ?? "Not chosen");

  return (
    <nav aria-label="Design steps">
      {/* desktop checklist */}
      <ol className="hidden overflow-hidden rounded-card bg-white shadow-card lg:block">
        {steps.map((step, i) => {
          const status = stepStatus(step);
          const current = i === stepIndex;
          const value = describeSelection(configuration, step.field);
          return (
            <li key={step.id} className="border-b border-ink/8 last:border-b-0">
              <button
                type="button"
                aria-current={current ? "step" : undefined}
                onClick={() => goToStep(i)}
                className={clsx(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                  current ? "bg-teal-50" : "hover:bg-porcelain",
                )}
              >
                <Bubble n={i + 1} status={status} current={current} />
                <span className="min-w-0 flex-1">
                  <span className={clsx("block font-sans text-[14px] leading-tight", current ? "font-semibold text-ink" : "font-medium text-ink")}>
                    {step.title}
                  </span>
                  <span className={clsx("mt-0.5 block truncate text-[12px]", status === "reviewed" ? "text-teal-800" : "text-body/80")}>
                    {statusText(status, value)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* mobile / tablet strip */}
      <ol
        ref={stripRef}
        className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:hidden [&::-webkit-scrollbar]:hidden"
      >
        {steps.map((step, i) => {
          const status = stepStatus(step);
          const current = i === stepIndex;
          return (
            <li key={step.id} data-step-index={i} className="shrink-0">
              <button
                type="button"
                aria-current={current ? "step" : undefined}
                onClick={() => goToStep(i)}
                className={clsx(
                  "flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 font-sans text-[13px] font-semibold transition-colors",
                  current ? "border-ink bg-ink text-white" : "border-ink/12 bg-white text-ink",
                )}
              >
                <span
                  aria-hidden="true"
                  className={clsx(
                    "grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold",
                    status === "reviewed" && "bg-teal-600 text-white",
                    status === "pending" && (current ? "bg-white/20 text-white" : "bg-porcelain text-ink"),
                    status === "not-applicable" && "bg-transparent text-current opacity-50",
                  )}
                >
                  {status === "reviewed" ? "✓" : status === "not-applicable" ? "–" : i + 1}
                </span>
                {step.title}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
