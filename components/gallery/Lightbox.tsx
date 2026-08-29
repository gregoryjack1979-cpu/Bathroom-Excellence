"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import { galleryItems } from "@/lib/galleryData";
import { GALLERY_CATEGORIES } from "@/lib/galleryData";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { SceneImage } from "@/components/scenes/SceneImage";
import { GalleryScene } from "./GalleryScene";
import type { ImageSlotId } from "@/config/site";

interface LightboxProps {
  items: typeof galleryItems;
  index: number | null;
  onClose: () => void;
  onNavigate: (next: number) => void;
}

/** Modal viewer: Esc/←/→ keys, swipe, focus trap, prev/next controls. */
export function Lightbox({ items, index, onClose, onNavigate }: LightboxProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const open = index !== null;
  useFocusTrap(panelRef, open);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return;
      onNavigate((index + dir + items.length) % items.length);
    },
    [index, items.length, onNavigate],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, go, onClose]);

  const item = index !== null ? items[index] : null;

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-abyss/80 p-4 backdrop-blur-md sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${item.title} — project photo`}
            className="relative w-full max-w-4xl overflow-hidden rounded-card bg-porcelain shadow-lift"
            initial={{ scale: 0.94, y: 18 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
              touchStartX.current = null;
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22 }}
              >
                <SceneImage
                  slot={`gallery-${index! + 1}` as ImageSlotId}
                  alt={`${item.title}: ${item.description}`}
                  className="aspect-[16/10] w-full"
                >
                  <GalleryScene variant={item.variant} prefix={`lb-${item.id}`} className="h-full w-full" />
                </SceneImage>
                <div className="flex flex-wrap items-start justify-between gap-3 p-5 sm:p-6">
                  <div>
                    <h3 className="font-sans text-lg font-semibold text-ink">{item.title}</h3>
                    <p className="mt-1 max-w-xl text-sm leading-relaxed">{item.description}</p>
                  </div>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                    {GALLERY_CATEGORIES.find((c) => c.value === item.category)?.label}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* controls */}
            <button
              type="button"
              aria-label="Close viewer"
              onClick={onClose}
              className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-abyss/55 text-white backdrop-blur transition-colors hover:bg-abyss/75"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
            </button>
            <button
              type="button"
              aria-label="Previous project"
              onClick={() => go(-1)}
              className="absolute left-3 top-[38%] grid h-11 w-11 place-items-center rounded-full bg-abyss/55 text-white backdrop-blur transition-colors hover:bg-abyss/75"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.5 5 8 12l6.5 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button
              type="button"
              aria-label="Next project"
              onClick={() => go(1)}
              className="absolute right-3 top-[38%] grid h-11 w-11 place-items-center rounded-full bg-abyss/55 text-white backdrop-blur transition-colors hover:bg-abyss/75"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9.5 5 16 12l-6.5 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
