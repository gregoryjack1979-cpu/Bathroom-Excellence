import Image from "next/image";
import clsx from "clsx";
import type { ReactNode } from "react";
import { siteConfig, type ImageSlotId } from "@/config/site";

interface SceneImageProps {
  /** Photo slot ID — map it in config/site.ts `imageSlots` to swap in a photo */
  slot: ImageSlotId;
  alt: string;
  className?: string;
  /** SVG scene fallback rendered while the slot is unmapped */
  children: ReactNode;
}

/**
 * Photo drop-in point. Renders the real photograph when `config/site.ts`
 * maps this slot to a file under /public, otherwise the hand-drawn SVG scene.
 */
export function SceneImage({ slot, alt, className, children }: SceneImageProps) {
  const src = siteConfig.imageSlots[slot];
  if (src) {
    return (
      <div className={clsx("relative overflow-hidden", className)}>
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover" />
      </div>
    );
  }
  return (
    <div role="img" aria-label={alt} className={clsx("relative overflow-hidden", className)}>
      {children}
    </div>
  );
}
