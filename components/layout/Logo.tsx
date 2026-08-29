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
        width={136}
        height={124}
        className="h-12 w-[53px] rounded-md border border-white/15 object-cover md:h-14 md:w-[62px]"
      />
      <span
        className={clsx(
          "font-display text-xl leading-none tracking-tight md:text-2xl",
          tone === "dark" ? "text-white" : "text-ink",
        )}
      >
        {first}
        {rest.length > 0 && <span className={tone === "dark" ? "text-teal-300" : "text-teal-600"}> {rest.join(" ")}</span>}
      </span>
    </span>
  );
}
