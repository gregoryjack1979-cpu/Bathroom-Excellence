import clsx from "clsx";
import Image from "next/image";
import { siteConfig, withBasePath } from "@/config/site";

/** Bathroom Excellence crest + wordmark. */
export function Logo({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const [first, ...rest] = siteConfig.name.split(" ");
  return (
    <span className={clsx("inline-flex min-w-0 items-center gap-2 sm:gap-3", className)}>
      <Image
        src={withBasePath("/images/logo-crest.jpg")}
        alt=""
        aria-hidden="true"
        width={136}
        height={124}
        className="h-9 w-10 shrink-0 rounded-md border border-white/15 object-cover sm:h-11 sm:w-12 md:h-14 md:w-[62px]"
      />
      <span
        className={clsx(
          "min-w-0 truncate font-display text-base leading-none tracking-tight sm:text-xl md:text-2xl",
          tone === "dark" ? "text-white" : "text-ink",
        )}
      >
        {first}
        {rest.length > 0 && <span className={tone === "dark" ? "text-teal-300" : "text-teal-600"}> {rest.join(" ")}</span>}
      </span>
    </span>
  );
}
