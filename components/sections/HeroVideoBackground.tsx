"use client";

import { useEffect, useRef } from "react";
import { withBasePath } from "@/config/site";
import { useMotionPrefs } from "@/lib/hooks/useMotionPrefs";

/**
 * Full-bleed ambient video behind the hero — the marble bathroom walkthrough.
 * Plays on desktop and mobile alike (muted + playsInline satisfy iOS/Android
 * autoplay rules); only reduced-motion visitors get the still poster frame
 * instead (same footage, no motion). A gradient scrim keeps the hero copy
 * readable over it.
 */
export function HeroVideoBackground() {
  const { reducedMotion } = useMotionPrefs();
  const videoRef = useRef<HTMLVideoElement>(null);
  const showVideo = !reducedMotion;

  useEffect(() => {
    if (!showVideo) return;
    const video = videoRef.current;
    if (!video) return;
    const onVisibility = () => {
      if (document.hidden) video.pause();
      else video.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    video.play().catch(() => {});
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [showVideo]);

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-30 overflow-hidden bg-porcelain">
      {showVideo ? (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={withBasePath("/videos/hero-bg.mp4")}
          poster={withBasePath("/videos/hero-bg-poster.jpg")}
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={withBasePath("/videos/hero-bg-poster.jpg")}
          alt=""
          className="h-full w-full object-cover"
        />
      )}
      {/* scrim: warm and opaque behind the copy on the left, sheer over the form on the right */}
      <div className="absolute inset-0 bg-gradient-to-r from-porcelain via-porcelain/70 to-porcelain/10 md:via-porcelain/55 md:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-porcelain/55 via-transparent to-porcelain/15" />
    </div>
  );
}
