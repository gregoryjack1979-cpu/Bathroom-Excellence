import clsx from "clsx";
import Image from "next/image";
import { siteConfig, withBasePath } from "@/config/site";

/** Bathroom Excellence crest + wordmark. */
export function Logo({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const [first, ...rest] = siteConfig.name.split(" ");
  return (
    <span className={clsx("inline-flex items-center gap-3", className)}>
      <Image
        src={withBasePath("/images/logo-crest.jpg")}
        alt=""
        aria-hidden="true"
        width={44}
        height={40}
        className="h-10 w-11 rounded-md border border-white/15 object-cover"
      />
      <span
        className={clsx(
          "font-display text-lg leading-none tracking-tight md:text-xl",
          tone === "dark" ? "text-white" : "text-ink",
        )}
      >
        {first}
        {rest.length > 0 && <span className={tone === "dark" ? "text-teal-300" : "text-teal-600"}> {rest.join(" ")}</span>}
      </span>
    </span>
  );
}
