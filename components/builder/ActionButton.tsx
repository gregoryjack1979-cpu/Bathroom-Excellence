"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  tone?: "default" | "danger";
}

/** Compact header action: icon always, label from `sm` up, title as the tooltip. */
export function ActionButton({ icon, label, tone = "default", className, ...rest }: ActionButtonProps) {
  return (
    <button
      type="button"
      title={rest.title ?? label}
      aria-label={label}
      className={clsx(
        "inline-flex h-10 items-center gap-2 rounded-md border px-2.5 font-sans text-[13px] font-semibold transition-colors sm:px-3.5",
        "disabled:cursor-not-allowed disabled:opacity-40",
        tone === "danger"
          ? "border-white/15 text-white/85 hover:border-[#e0a49a]/60 hover:bg-[#a33d2f]/25 hover:text-white"
          : "border-white/15 text-white/85 hover:border-teal-400/60 hover:bg-white/10 hover:text-white",
        className,
      )}
      {...rest}
    >
      <span aria-hidden="true" className="grid h-4 w-4 place-items-center">
        {icon}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
