"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useState } from "react";
import clsx from "clsx";
import { GALLERY_CATEGORIES, galleryItems } from "@/lib/galleryData";
import type { GalleryCategory } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SceneImage } from "@/components/scenes/SceneImage";
import { GalleryScene } from "@/components/gallery/GalleryScene";
import { TiltCard } from "@/components/ui/TiltCard";
import { waterSplash } from "@/lib/waterSplash";
import { useMotionPrefs } from "@/lib/hooks/useMotionPrefs";
import type { ImageSlotId } from "@/config/site";

const Lightbox = dynamic(
  () => import("@/components/gallery/Lightbox").then((m) => m.Lightbox),
  { ssr: false },
);

interface GallerySectionProps {
  /** Compact mode shows fewer items (homepage); full mode is the /gallery page */
  limit?: number;
  heading?: boolean;
}

/** Filterable project gallery with animated re-layout and a lightbox viewer. */
export function GallerySection({ limit, heading = true }: GallerySectionProps) {
  const [category, setCategory] = useState<GalleryCategory | "all">("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { reducedMotion } = useMotionPrefs();

  const openItem = (index: number, e: React.MouseEvent) => {
    if (!reducedMotion) waterSplash(e.clientX, e.clientY);
    setLightboxIndex(index);
  };

  const filtered = galleryItems.filter((g) => category === "all" || g.category === category);
  const visible = limit ? filtered.slice(0, limit) : filtered;

  return (
    <section id="gallery" className="bg-mist py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {heading && (
          <SectionHeading
            eyebrow="Recent work"
            title="Explore Our Shower Gallery"
            subtitle="Browse designs by style — every project below was designed and installed by our own team."
          />
        )}

        {/* category filter */}
        <div role="group" aria-label="Filter gallery by category" className="mb-10 flex flex-wrap justify-center gap-2.5">
          {GALLERY_CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              aria-pressed={category === c.value}
              onClick={() => setCategory(c.value)}
              className={clsx(
                "rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200",
                category === c.value
                  ? "bg-teal-700 text-white shadow-[0_4px_14px_rgba(15,94,115,0.35)]"
                  : "border border-ink/10 bg-white text-body hover:border-teal-500/40 hover:text-teal-700",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* grid */}
        <motion.ul layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((item) => {
              const globalIndex = galleryItems.indexOf(item);
              return (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.28 }}
                >
                  <TiltCard maxTilt={4} className="overflow-hidden rounded-card bg-white shadow-card transition-shadow duration-300 hover:shadow-lift">
                    <button
                      type="button"
                      onClick={(e) => openItem(globalIndex, e)}
                      className="block w-full text-left"
                      aria-label={`Open ${item.title} in the gallery viewer`}
                    >
                      <div className="aspect-[16/11] overflow-hidden">
                        <div className="h-full w-full transition-transform duration-500 group-hover:scale-[1.05]">
                          <SceneImage
                            slot={`gallery-${globalIndex + 1}` as ImageSlotId}
                            alt={`${item.title}: ${item.description}`}
                            className="h-full w-full"
                          >
                            <GalleryScene variant={item.variant} prefix={`g-${item.id}`} className="h-full w-full" />
                          </SceneImage>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 p-5">
                        <div>
                          <h3 className="font-sans text-[15px] font-semibold text-ink">{item.title}</h3>
                          <p className="mt-0.5 line-clamp-1 text-[13px] text-body">{item.description}</p>
                        </div>
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-50 text-teal-700 transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2" />
                            <path d="m16.5 16.5 4 4M11 8v6M8 11h6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                          </svg>
                        </span>
                      </div>
                    </button>
                  </TiltCard>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>

        {visible.length === 0 && (
          <p className="py-12 text-center text-body">No projects in this category yet — check back soon.</p>
        )}

        <Lightbox
          items={galleryItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      </div>
    </section>
  );
}
