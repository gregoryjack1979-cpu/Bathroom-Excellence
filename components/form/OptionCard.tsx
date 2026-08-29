"use client";

import clsx from "clsx";

interface OptionCardProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  multi?: boolean;
}

/** Selectable option tile used by every choice step. */
export function OptionCard({ label, selected, onSelect, multi = false }: OptionCardProps) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onSelect}
      className={clsx(
        "flex w-full items-center gap-3 rounded-2xl border px-5 py-4 text-left text-[15px] font-medium transition-all duration-200",
        selected
          ? "border-teal-600 bg-teal-50 text-teal-800 shadow-[0_4px_16px_rgba(15,94,115,0.18)]"
          : "border-ink/12 bg-white text-ink hover:-translate-y-0.5 hover:border-teal-500/50 hover:shadow-card",
      )}
    >
      <span
        aria-hidden="true"
        className={clsx(
          "grid h-6 w-6 shrink-0 place-items-center border-2 transition-colors",
          multi ? "rounded-md" : "rounded-full",
          selected ? "border-teal-600 bg-teal-600 text-white" : "border-chrome bg-white text-transparent",
        )}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {label}
    </button>
  );
}
