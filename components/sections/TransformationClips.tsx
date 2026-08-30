"use client";

import { useEffect, useRef } from "react";
import { withBasePath } from "@/config/site";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useMotionPrefs } from "@/lib/hooks/useMotionPrefs";

interface Clip {
  id: string;
  title: string;
  body: string;
  video: string;
  poster: string;
}

const clips: Clip[] = [
  {
    id: "green-subway",
    title: "Bare Walls to Glossy Subway Tile",
    body: "Watch a stripped-down shower wall gain its new glossy subway tile, plank by plank — the same care we bring to every install.",
    video: "/videos/transform-green.mp4",
    poster: "/videos/transform-green-poster.jpg",
  },
  {
    id: "marble-slab",
    title: "From Concrete to Statement Marble",
    body: "Large-format marble-look panels land in place to turn a raw room into a showroom-ready feature wall.",
    video: "/videos/transform-marble.mp4",
    poster: "/videos/transform-marble-poster.jpg",
  },
];

function Clip({ clip }: { clip: Clip }) {
  const { reducedMotion } = useMotionPrefs();
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || reducedMotion) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [reducedMotion]);

  return (
    <div className="overflow-hidden rounded-card bg-abyss shadow-lift">
      <div className="aspect-video">
        {reducedMotion ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={withBasePath(clip.poster)} alt={clip.title} className="h-full w-full object-cover" />
        ) : (
          <video
            ref={ref}
            className="h-full w-full object-cover"
            src={withBasePath(clip.video)}
            poster={withBasePath(clip.poster)}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={clip.title}
          />
        )}
      </div>
      <div className="p-6">
        <h3 className="font-sans text-lg font-semibold text-white">{clip.title}</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-teal-100/75">{clip.body}</p>
      </div>
    </div>
  );
}

/** Short looping transformation clips — bare-room-to-finished-wall showcases. */
export function TransformationClips() {
  return (
    <section aria-label="More transformations in motion" className="bg-porcelain py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="More transformations"
          title="See More Transformations in Motion"
          subtitle="A few extra glimpses of the craftsmanship that goes into every wall we build."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {clips.map((clip, i) => (
            <AnimateIn key={clip.id} delay={i * 0.1}>
              <Clip clip={clip} />
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
