"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { PREVIEW_HEIGHT, PREVIEW_WIDTH, resolvePreviewLayers } from "@/lib/builder/previewLayers";
import { describeConfiguration } from "@/lib/builder/rules";
import { useConfigurator } from "@/lib/builder/useConfigurator";
import { useMotionPrefs } from "@/lib/hooks/useMotionPrefs";

/**
 * The layered preview. Each slot from `resolvePreviewLayers` is an absolutely
 * positioned image on a fixed 4:3 stage; when a slot's src changes the old
 * image fades out while the new one fades in. Knows nothing about bathrooms.
 */
export function BathroomPreview({ className }: { className?: string }) {
  const { configuration } = useConfigurator();
  const { reducedMotion } = useMotionPrefs();
  const layers = useMemo(() => resolvePreviewLayers(configuration), [configuration]);
  const label = describeConfiguration(configuration);

  // loading: the room must be up before we show anything; after that a small
  // indicator while any newly requested layer is still on its way
  const stage = useRef<HTMLDivElement>(null);
  const loaded = useRef(new Set<string>());
  const [roomReady, setRoomReady] = useState(false);
  const [pending, setPending] = useState(0);
  const roomSrc = layers.find((l) => l.id === "room")?.src ?? null;

  // Images that were in the server-rendered HTML can finish loading before
  // React attaches onLoad, so we also read `complete` off the DOM.
  const reconcile = useCallback(() => {
    stage.current?.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
      const src = img.getAttribute("src");
      if (src && img.complete && img.naturalWidth > 0) loaded.current.add(src);
    });
    setRoomReady((ready) => ready || !roomSrc || loaded.current.has(roomSrc));
    setPending(layers.filter((l) => l.src && !loaded.current.has(l.src)).length);
  }, [layers, roomSrc]);

  useEffect(reconcile, [reconcile]);

  // never leave the shimmer up if the room image stalls or fails
  useEffect(() => {
    if (roomReady) return;
    const t = window.setTimeout(() => setRoomReady(true), 4000);
    return () => window.clearTimeout(t);
  }, [roomReady]);

  const markLoaded = (src: string) => {
    loaded.current.add(src);
    reconcile();
  };

  return (
    <div className={clsx("relative", className)}>
      <div
        ref={stage}
        role="img"
        aria-label={`Bathroom preview: ${label}`}
        className="chrome-edge relative aspect-[4/3] w-full overflow-hidden rounded-card bg-[#d9dee2] shadow-lift"
      >
        {layers.map((layer) => (
          <div key={layer.id} className="absolute inset-0" style={{ zIndex: layer.zIndex }} aria-hidden="true">
            <AnimatePresence initial={false}>
              {layer.src && (
                <motion.img
                  key={layer.src}
                  src={layer.src}
                  alt=""
                  width={PREVIEW_WIDTH}
                  height={PREVIEW_HEIGHT}
                  draggable={false}
                  decoding="async"
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reducedMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  onLoad={() => markLoaded(layer.src!)}
                  onError={() => markLoaded(layer.src!)}
                  className="absolute inset-0 h-full w-full select-none object-cover"
                />
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* first-load shimmer */}
        {!roomReady && (
          <div aria-hidden="true" className="absolute inset-0 z-[100] animate-pulse bg-gradient-to-br from-sand via-mist to-sand" />
        )}

        {/* small "updating" pill while a new layer is still downloading */}
        <AnimatePresence>
          {roomReady && pending > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, delay: 0.25 }}
              aria-hidden="true"
              className="absolute right-3 top-3 z-[100] flex items-center gap-2 rounded-full bg-ink/70 px-3 py-1.5 font-sans text-[12px] font-semibold text-white backdrop-blur"
            >
              <span className="h-2 w-2 animate-ping rounded-full bg-teal-300" />
              Updating
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
