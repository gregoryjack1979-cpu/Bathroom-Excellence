"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { useMotionPrefs } from "@/lib/hooks/useMotionPrefs";

interface OptionCardProps {
  name: string;
  description?: string;
  /** Thumbnail; falls back to a flat swatch when absent */
  image?: string;
  /** Colour chip — shown alone if there's no image, or as a dot beside the name */
  swatch?: string;
  selected: boolean;
  disabled?: boolean;
  /** Shown on the card and as a tooltip when disabled */
  disabledReason?: string | null;
  onSelect: () => void;
}

/** One selectable choice. Visual, touch-sized, and honest about being disabled. */
export function OptionCard({ name, description, image, swatch, selected, disabled = false, disabledReason, onSelect }: OptionCardProps) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      title={disabled && disabledReason ? disabledReason : undefined}
      onClick={onSelect}
      className={clsx(
        "group relative w-full overflow-hidden rounded-2xl border-2 bg-white text-left transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 focus-visible:ring-offset-mist",
        selected ? "border-teal-600 shadow-glow" : "border-ink/10 shadow-card",
        disabled ? "cursor-not-allowed opacity-55" : "hover:-translate-y-0.5 hover:border-teal-500/50 hover:shadow-lift active:translate-y-0",
      )}
    >
      <span className="relative block aspect-[4/3] w-full overflow-hidden bg-porcelain">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- static asset on a fixed canvas; no optimizer in static export
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            className={clsx("h-full w-full select-none object-cover transition-transform duration-300", !disabled && "group-hover:scale-[1.04]")}
          />
        ) : (
          <span aria-hidden="true" className="absolute inset-0" style={{ backgroundColor: swatch }} />
        )}
        {selected && (
          <motion.span
            aria-hidden="true"
            initial={reducedMotion ? false : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-teal-700 text-white shadow-card"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.span>
        )}
        {disabled && (
          <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-white">
            Not available
          </span>
        )}
      </span>
      <span className="block px-3 py-2.5">
        <span className="flex items-center gap-2">
          <span className="font-sans text-[14px] font-semibold leading-tight text-ink">{name}</span>
          {swatch && image && (
            <span aria-hidden="true" className="h-3.5 w-3.5 shrink-0 rounded-full border border-ink/15" style={{ backgroundColor: swatch }} />
          )}
        </span>
        {description && <span className="mt-0.5 block text-[12px] leading-snug text-body">{description}</span>}
        {disabled && disabledReason && <span className="mt-1 block text-[11px] font-medium text-teal-800">{disabledReason}</span>}
      </span>
    </button>
  );
}
