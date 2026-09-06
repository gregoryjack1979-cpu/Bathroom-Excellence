import clsx from "clsx";
import type { ReactNode } from "react";

const COLUMNS = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4",
} as const;

interface OptionGridProps {
  label: string;
  columns?: keyof typeof COLUMNS;
  className?: string;
  children: ReactNode;
}

/** Responsive grid of OptionCards, grouped for assistive tech. */
export function OptionGrid({ label, columns = 3, className, children }: OptionGridProps) {
  return (
    <div role="group" aria-label={label} className={clsx("grid gap-3", COLUMNS[columns], className)}>
      {children}
    </div>
  );
}
