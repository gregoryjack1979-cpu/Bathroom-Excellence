"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { withBasePath } from "@/config/site";
import { useMotionPrefs } from "@/lib/hooks/useMotionPrefs";

/**
 * The Bathroom Excellence brand film as a full-width cinematic band —
 * the same video that played on the original site. Autoplays muted only
 * while visible; reduced-motion visitors get the poster with a play control.
 */
export function BrandVideo() {
  const { reducedMotion } = useMotionPrefs();
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [wantsPlay, setWantsPlay] = useState(false);

  // Play only while on screen; pause when scrolled away.
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video || (reducedMotion && !wantsPlay)) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, [reducedMotion, wantsPlay]);

  const showPosterGate = reducedMotion && !wantsPlay;

  return (
    <section
      ref={sectionRef}
      aria-label="Bathroom Excellence brand video"
      className="relative overflow-hidden bg-black"
    >
      <div className="relative mx-auto max-h-[70vh] max-w-6xl">
        {showPosterGate ? (
          <div className="relative">
            <Image
              src={withBasePath("/videos/brand-poster.jpg")}
              alt="Bathroom Excellence — Unbelievably Affordable"
              width={1196}
              height={670}
              className="h-auto w-full object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setWantsPlay(true);
                requestAnimationFrame(() => videoRef.current?.play().catch(() => {}));
              }}
              className="absolute inset-0 grid place-items-center bg-black/30 text-white transition-colors hover:bg-black/20"
            >
              <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-white/80 bg-black/40 backdrop-blur">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                </svg>
              </span>
              <span className="sr-only">Play the brand video</span>
            </button>
          </div>
        ) : null}
        <video
          ref={videoRef}
          className={showPosterGate ? "hidden" : "h-auto max-h-[70vh] w-full object-cover"}
          src={withBasePath("/videos/brand.mp4")}
          poster={withBasePath("/videos/brand-poster.jpg")}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Bathroom Excellence — Unbelievably Affordable"
        />
      </div>
      {/* soft fades into the surrounding dark sections */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-abyss to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-abyss to-transparent" />
    </section>
  );
}
