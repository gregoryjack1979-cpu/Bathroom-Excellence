import clsx from "clsx";
import type { ReactNode } from "react";

function Flourish({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 18" width="120" height="16" fill="none" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M64 9 C 50 16, 34 16, 29 10 C 25 5, 30 1, 35 4 C 39 7, 35 12, 28 10" />
        <path d="M76 9 C 90 16, 106 16, 111 10 C 115 5, 110 1, 105 4 C 101 7, 105 12, 112 10" />
        <path d="M20 9 C 14 9, 8 9, 3 9" opacity="0.7" />
        <path d="M120 9 C 126 9, 132 9, 137 9" opacity="0.7" />
      </g>
      <path d="M70 3.5 L74 9 L70 14.5 L66 9 Z" fill="currentColor" />
    </svg>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  tone?: "light" | "dark";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  tone = "light",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={clsx(
        "mb-12 max-w-3xl md:mb-16",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow && (
        <p
          className={clsx(
            "mb-3 text-xs font-semibold uppercase tracking-[0.22em]",
            tone === "dark" ? "text-teal-300" : "text-teal-600",
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={clsx(
          "text-3xl leading-tight md:text-4xl lg:text-[2.75rem]",
          tone === "dark" && "text-white",
        )}
      >
        {title}
      </h2>
      <Flourish
        className={clsx(
          "mt-4",
          align === "center" && "mx-auto",
          tone === "dark" ? "text-teal-300" : "text-teal-600",
        )}
      />
      {subtitle && (
        <p
          className={clsx(
            "mt-4 text-base leading-relaxed md:text-lg",
            tone === "dark" ? "text-teal-100/80" : "text-body",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
