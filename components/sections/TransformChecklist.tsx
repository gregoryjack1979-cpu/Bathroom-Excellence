"use client";

import { useCallback, useRef, useState } from "react";
import clsx from "clsx";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { ShowerSceneOld } from "@/components/scenes/ShowerSceneOld";
import { ShowerSceneNew } from "@/components/scenes/ShowerSceneNew";
import { SceneImage } from "@/components/scenes/SceneImage";
import { waterSplash } from "@/lib/waterSplash";
import { useMotionPrefs } from "@/lib/hooks/useMotionPrefs";

const items = [
  {
    title: "Completing a tub to shower conversion",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 15h16M6 15V9a2 2 0 0 1 2-2h1M12 3v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><circle cx="12" cy="4.5" r="1.3" stroke="currentColor" strokeWidth="1.6" /><path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeWidth="1.6" /></svg>
    ),
  },
  {
    title: "Replacing a bathtub",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 13h18v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-2Z" stroke="currentColor" strokeWidth="1.6" /><path d="M5 13V8a2 2 0 0 1 2-2 2 2 0 0 1 2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
    ),
  },
  {
    title: "Installing a walk-in bathtub",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="6" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M9 6v13" stroke="currentColor" strokeWidth="1.6" /><circle cx="14.5" cy="12.5" r="1" fill="currentColor" /></svg>
    ),
  },
  {
    title: "Renovating a shower",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><path d="M12 3v18" stroke="currentColor" strokeWidth="1.6" /></svg>
    ),
  },
  {
    title: "Adding a bathtub surround",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><path d="M4 12h16M12 4v16M8 4v4M16 4v4M8 16v4M16 16v4" stroke="currentColor" strokeWidth="1.2" /></svg>
    ),
  },
  {
    title: "Installing safety options like grab bars",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 19c3-1 4-4 6-6s3-5 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><circle cx="16" cy="6.5" r="1.4" stroke="currentColor" strokeWidth="1.6" /><path d="M9 12l2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
    ),
  },
  {
    title: "Replacing cabinets and countertops",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="8" width="18" height="4" stroke="currentColor" strokeWidth="1.6" /><rect x="3" y="12" width="18" height="8" stroke="currentColor" strokeWidth="1.6" /><path d="M12 12v8" stroke="currentColor" strokeWidth="1.2" /></svg>
    ),
  },
  {
    title: "Installing new fixtures, sinks, toilets or bidets",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 4h4l1 4H5l1-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M7 8v3a3 3 0 0 0 3 3" stroke="currentColor" strokeWidth="1.6" /><rect x="14" y="9" width="6" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M15 9V7a2 2 0 0 1 4 0v2" stroke="currentColor" strokeWidth="1.6" /></svg>
    ),
  },
  {
    title: "Replacing flooring, lighting or windows",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="1.2" /></svg>
    ),
  },
];

/**
 * The original homepage's "How you can transform your bathroom" block: a
 * nine-item checklist beside a compact before/after reveal. Reuses the same
 * old/new shower scenes as the larger BeforeAfter section further down.
 */
export function TransformChecklist() {
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

  return (
    <section aria-labelledby="transform-checklist-heading" className="bg-porcelain py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <AnimateIn>
          <h2 id="transform-checklist-heading" className="text-3xl md:text-4xl">
            How You Can Transform Your Bathroom
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed">
            You won&rsquo;t have to compromise when you work with our bathroom
            remodeling company. We can update your bathroom however you want,
            including&hellip;
          </p>
        </AnimateIn>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {items.map((item, i) => (
              <AnimateIn key={item.title} as="li" delay={(i % 5) * 0.06}>
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-ink/12 bg-white text-ink/70" aria-hidden="true">
                    <span className="h-[18px] w-[18px]">{item.icon}</span>
                  </span>
                  <p className="pt-1.5 text-[15px] leading-snug text-ink">{item.title}</p>
                </div>
              </AnimateIn>
            ))}
          </ul>

          <AnimateIn delay={0.1}>
            <div>
              <div
                ref={containerRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className={clsx(
                  "chrome-edge relative aspect-[4/3] select-none overflow-hidden rounded-card shadow-lift",
                  dragging ? "cursor-grabbing" : "cursor-ew-resize",
                )}
                style={{ touchAction: "pan-y" }}
              >
                <SceneImage slot="before-after-new" alt="After: the remodeled bathroom" className="absolute inset-0">
                  <ShowerSceneNew prefix="tc-new" className="h-full w-full" />
                </SceneImage>
                <div ref={beforeRef} className="absolute inset-0" style={{ clipPath: "inset(0 50% 0 0)" }}>
                  <SceneImage slot="before-after-old" alt="Before: the outdated bathroom" className="absolute inset-0">
                    <ShowerSceneOld prefix="tc-old" className="h-full w-full" />
                  </SceneImage>
                </div>

                <span className={clsx("absolute left-3 top-3 rounded-full bg-abyss/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur transition-opacity", pct < 14 && "opacity-0")}>
                  Before
                </span>
                <span className={clsx("absolute right-3 top-3 rounded-full bg-teal-700/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur transition-opacity", pct > 86 && "opacity-0")}>
                  After
                </span>

                <div
                  ref={handleRef}
                  role="slider"
                  tabIndex={0}
                  aria-label="Reveal the before and after comparison"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                  onKeyDown={onKeyDown}
                  className="group absolute top-0 bottom-0 z-10 -ml-px w-0.5 bg-white/85 shadow-[0_0_12px_rgba(0,0,0,0.3)]"
                  style={{ left: "50%", touchAction: "none" }}
                >
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span
                      aria-hidden="true"
                      className={clsx(
                        "absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/70 transition-opacity",
                        dragging ? "animate-ping opacity-70" : "opacity-0",
                      )}
                    />
                    <svg width="38" height="44" viewBox="0 0 52 60" className="drop-shadow-lg transition-transform duration-200 group-hover:scale-110" aria-hidden="true">
                      <defs>
                        <radialGradient id="tc-handle" cx="38%" cy="30%" r="80%">
                          <stop offset="0%" stopColor="#ffffff" />
                          <stop offset="45%" stopColor="#c9d3da" />
                          <stop offset="100%" stopColor="#5f707b" />
                        </radialGradient>
                      </defs>
                      <path d="M26 3C26 3 6 26.4 6 38.8a20 20 0 0 0 40 0C46 26.4 26 3 26 3Z" fill="url(#tc-handle)" stroke="#ffffff" strokeWidth="2" />
                      <path d="m18 38-5 4 5 4M34 38l5 4-5 4" stroke="#13272f" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed">
                Maybe you just want a bit more comfort or accessibility. Maybe
                it&rsquo;s time to give your bathroom a completely different look.
                No matter your vision, you can trust our experts to make it a
                reality.
              </p>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
