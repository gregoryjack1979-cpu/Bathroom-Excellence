"use client";

import { useCallback, useRef, useState } from "react";
import clsx from "clsx";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { ShowerSceneOld } from "@/components/scenes/ShowerSceneOld";
import { ShowerSceneNew } from "@/components/scenes/ShowerSceneNew";
import { SceneImage } from "@/components/scenes/SceneImage";
import { waterSplash } from "@/lib/waterSplash";
import { useMotionPrefs } from "@/lib/hooks/useMotionPrefs";

const projects = [
  {
    id: "hall-bath",
    label: "Hall Bath Rescue",
    description:
      "A 1980s tiled stall with cracked grout and a dripping head became a bright marble-look shower with a rainfall fixture and frameless glass — installed in 3 days.",
    newSceneProps: {},
  },
  {
    id: "primary-walkin",
    label: "Primary Walk-In Upgrade",
    description:
      "We removed a high-curb shower the homeowners struggled to step into and built a barrier-free walk-in with a teak bench and designer grab bar.",
    newSceneProps: { bench: true, grabBar: true, water: false },
  },
];

/**
 * Draggable before/after reveal. The chrome-droplet handle is a real slider
 * (role="slider", arrow keys); dragging writes clip-path via rAF for
 * jank-free updates and pulses a water ripple while active.
 */
export function BeforeAfter() {
  const [project, setProject] = useState(0);
  const [pct, setPct] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const latest = useRef(50);
  const { reducedMotion } = useMotionPrefs();

  const apply = useCallback((value: number) => {
    const v = Math.min(100, Math.max(0, value));
    latest.current = v;
    if (frame.current === null) {
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        const p = latest.current;
        if (beforeRef.current) beforeRef.current.style.clipPath = `inset(0 ${100 - p}% 0 0)`;
        if (handleRef.current) handleRef.current.style.left = `${p}%`;
      });
    }
    setPct(Math.round(v));
  }, []);

  const fromClientX = useCallback(
    (clientX: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      apply(((clientX - rect.left) / rect.width) * 100);
    },
    [apply],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragging(true);
    if (!reducedMotion) waterSplash(e.clientX, e.clientY);
    fromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    fromClientX(e.clientX);
  };
  const endDrag = () => setDragging(false);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 5;
    if (e.key === "ArrowLeft") apply(latest.current - step);
    else if (e.key === "ArrowRight") apply(latest.current + step);
    else if (e.key === "Home") apply(0);
    else if (e.key === "End") apply(100);
    else return;
    e.preventDefault();
  };

  const selectProject = (i: number) => {
    setProject(i);
    apply(50);
  };

  const current = projects[project];

  return (
    <section id="before-after" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Before &amp; after"
          title="See the Difference for Yourself"
          subtitle="Drag the droplet to reveal the transformation — these are the kinds of results we deliver every week."
        />

        {/* project selector */}
        <div role="group" aria-label="Choose a project" className="mb-8 flex flex-wrap justify-center gap-2.5">
          {projects.map((p, i) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={project === i}
              onClick={() => selectProject(i)}
              className={clsx(
                "rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200",
                project === i
                  ? "bg-teal-700 text-white shadow-[0_4px_14px_rgba(15,94,115,0.35)]"
                  : "border border-ink/10 bg-white text-body hover:border-teal-500/40 hover:text-teal-700",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <AnimateIn>
          <div
            ref={containerRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className={clsx(
              "chrome-edge relative aspect-[16/10] select-none overflow-hidden rounded-card shadow-lift sm:aspect-[16/9]",
              dragging ? "cursor-grabbing" : "cursor-ew-resize",
            )}
            style={{ touchAction: "pan-y" }}
          >
            {/* AFTER (base layer) */}
            <SceneImage slot="before-after-new" alt="After: the remodeled shower" className="absolute inset-0">
              <ShowerSceneNew
                key={`new-${current.id}`}
                prefix={`ba-new-${current.id}`}
                className="h-full w-full"
                {...current.newSceneProps}
              />
            </SceneImage>
            {/* BEFORE (clipped on top) */}
            <div ref={beforeRef} className="absolute inset-0" style={{ clipPath: "inset(0 50% 0 0)" }}>
              <SceneImage slot="before-after-old" alt="Before: the outdated shower" className="absolute inset-0">
                <ShowerSceneOld prefix={`ba-old-${current.id}`} className="h-full w-full" />
              </SceneImage>
            </div>

            {/* labels */}
            <span
              className={clsx(
                "absolute left-4 top-4 rounded-full bg-abyss/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur transition-opacity",
                pct < 14 && "opacity-0",
              )}
            >
              Before
            </span>
            <span
              className={clsx(
                "absolute right-4 top-4 rounded-full bg-teal-700/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur transition-opacity",
                pct > 86 && "opacity-0",
              )}
            >
              After
            </span>

            {/* divider + droplet handle */}
            <div
              ref={handleRef}
              role="slider"
              tabIndex={0}
              aria-label="Reveal the before and after comparison"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              aria-valuetext={`${pct}% of the old shower shown`}
              onKeyDown={onKeyDown}
              data-dragging={dragging}
              className="group absolute top-0 bottom-0 z-10 -ml-px w-0.5 bg-white/85 shadow-[0_0_12px_rgba(0,0,0,0.3)]"
              style={{ left: "50%", touchAction: "none" }}
            >
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                {/* ripple pulse while dragging */}
                <span
                  aria-hidden="true"
                  className={clsx(
                    "absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-teal-300/70 transition-opacity",
                    dragging ? "animate-ping opacity-70" : "opacity-0",
                  )}
                />
                <svg width="52" height="60" viewBox="0 0 52 60" className="drop-shadow-lg transition-transform duration-200 group-hover:scale-110 group-focus-visible:scale-110" aria-hidden="true">
                  <defs>
                    <radialGradient id={`ba-handle-${current.id}`} cx="38%" cy="30%" r="80%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="45%" stopColor="#c9d3da" />
                      <stop offset="100%" stopColor="#5f707b" />
                    </radialGradient>
                  </defs>
                  <path d="M26 3C26 3 6 26.4 6 38.8a20 20 0 0 0 40 0C46 26.4 26 3 26 3Z" fill={`url(#ba-handle-${current.id})`} stroke="#ffffff" strokeWidth="2" />
                  <path d="m18 38-5 4 5 4M34 38l5 4-5 4" stroke="#13272f" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <ellipse cx="18" cy="30" rx="4" ry="6" fill="#fff" opacity="0.55" transform="rotate(-18 18 30)" />
                </svg>
              </div>
            </div>
          </div>
        </AnimateIn>

        <AnimateIn delay={0.1}>
          <p className="mx-auto mt-6 max-w-2xl text-center text-[15px] leading-relaxed">{current.description}</p>
        </AnimateIn>
      </div>
    </section>
  );
}
