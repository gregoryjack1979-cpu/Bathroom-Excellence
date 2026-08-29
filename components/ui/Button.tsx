import Link from "next/link";
import clsx from "clsx";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "glass" | "dark";
type Size = "md" | "lg";

const base =
  "btn-sheen inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold tracking-wide " +
  "transition-[transform,box-shadow,background-color] duration-200 ease-out select-none " +
  "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985]";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-teal-500 to-teal-700 text-white shadow-[0_4px_14px_rgba(15,94,115,0.35)] " +
    "hover:shadow-[0_10px_28px_rgba(15,94,115,0.45)] hover:from-teal-400 hover:to-teal-600",
  outline:
    "chrome-edge text-teal-700 bg-white/70 shadow-card hover:shadow-lift hover:text-teal-600",
  glass:
    "glass-panel text-ink shadow-card hover:shadow-lift hover:bg-white/80",
  dark:
    "bg-deep text-white border border-white/15 shadow-card hover:shadow-lift hover:bg-abyss",
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
