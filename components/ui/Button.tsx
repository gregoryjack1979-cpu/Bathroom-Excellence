import Link from "next/link";
import clsx from "clsx";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "glass" | "dark" | "light";
type Size = "md" | "lg";

const base =
  "btn-sheen inline-flex items-center justify-center gap-2 rounded-md font-sans font-semibold tracking-wide " +
  "transition-[transform,box-shadow,background-color] duration-200 ease-out select-none " +
  "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985]";

const variants: Record<Variant, string> = {
  /* black CTA — matches the original site's Submit/dark buttons */
  primary:
    "bg-gradient-to-b from-[#2e2e2e] to-[#141414] text-white border border-white/10 " +
    "shadow-[0_4px_14px_rgba(0,0,0,0.35)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.45)] hover:from-[#3a3a3a] hover:to-[#1c1c1c]",
  /* white button with a thin border — the original's Contact Us / Free Estimate style */
  outline:
    "bg-white text-ink border border-ink/25 shadow-card hover:shadow-lift hover:border-ink/45",
  light:
    "bg-white text-ink border border-white/60 shadow-card hover:shadow-lift hover:bg-porcelain",
  glass:
    "glass-panel text-ink shadow-card hover:shadow-lift hover:bg-white/80",
  dark:
    "bg-transparent text-white border border-white/40 hover:bg-white/10 hover:border-white/70",
};

const sizes: Record<Size, string> = {
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ButtonAsLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, children, ...rest } = props;
  const classes = clsx(base, variants[variant], sizes[size], className);

  if ("href" in props && typeof props.href === "string") {
    const { href, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    };
    const external = /^(https?:|tel:|mailto:)/.test(props.href);
    if (external) {
      return (
        <a href={props.href} className={classes} {...anchorRest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={props.href} className={classes} {...anchorRest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
