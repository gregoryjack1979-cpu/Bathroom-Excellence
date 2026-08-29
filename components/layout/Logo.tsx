import clsx from "clsx";
import { siteConfig } from "@/config/site";

/** Droplet mark + wordmark, built from the configured company name. */
export function Logo({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const [first, ...rest] = siteConfig.name.split(" ");
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <radialGradient id="logo-drop" cx="38%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#e8f6fa" />
            <stop offset="45%" stopColor="#57b1c4" />
            <stop offset="100%" stopColor="#0f5e73" />
          </radialGradient>
        </defs>
        <path d="M32 4C32 4 10 30 10 43a22 22 0 0 0 44 0C54 30 32 4 32 4Z" fill="url(#logo-drop)" />
        <ellipse cx="24" cy="38" rx="5" ry="8" fill="#fff" opacity="0.55" transform="rotate(-18 24 38)" />
      </svg>
      <span
        className={clsx(
          "font-display text-lg leading-none tracking-tight md:text-xl",
          tone === "dark" ? "text-white" : "text-ink",
        )}
      >
        {first}
        {rest.length > 0 && (
          <span className={tone === "dark" ? "text-teal-300" : "text-teal-600"}> {rest.join(" ")}</span>
        )}
      </span>
    </span>
  );
}
