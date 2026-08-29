"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { TransformationScene } from "@/components/scenes/TransformationScene";
import { ShowerSceneNew } from "@/components/scenes/ShowerSceneNew";
import { useMotionPrefs } from "@/lib/hooks/useMotionPrefs";
import { Button } from "@/components/ui/Button";

const stages = [
  {
    range: [0, 0.3] as const,
    eyebrow: "Stage 1 — The problem",
    title: "The shower you put up with",
    body: "Dated tile, tired grout, a curtain past its prime and fixtures that drip.",
  },
  {
    range: [0.34, 0.68] as const,
    eyebrow: "Stage 2 — The remodel",
    title: "Out with the old, in with the beautiful",
    body: "We strip it to the studs, then set watertight walls, chrome fixtures and glass — precisely.",
  },
  {
    range: [0.72, 1] as const,
    eyebrow: "Stage 3 — The reveal",
    title: "Your brand-new shower",
    body: "Bright, easy to clean, safe to step into — and finished in days, not months.",
  },
];

function StageCaption({
  progress,
  index,
}: {
  progress: MotionValue<number>;
  index: number;
}) {
  const [a, b] = stages[index].range;
  const fadeIn = Math.max(a - 0.02, 0);
  const opacity = useTransform(
    progress,
    index === 0
      ? [0, b, b + 0.05]
      : index === stages.length - 1
        ? [fadeIn, a + 0.04, 1]
        : [fadeIn, a + 0.04, b, b + 0.05],
    index === 0 ? [1, 1, 0] : index === stages.length - 1 ? [0, 1, 1] : [0, 1, 1, 0],
  );
  const y = useTransform(opacity, [0, 1], [14, 0]);
  const s = stages[index];
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-300">{s.eyebrow}</p>
      <h3 className="mt-1.5 font-display text-2xl text-white md:text-3xl">{s.title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-teal-100/80 md:text-[15px]">{s.body}</p>
    </motion.div>
  );
}

function StageDot({
  progress,
  index,
}: {
  progress: MotionValue<number>;
  index: number;
}) {
  const [a, b] = stages[index].range;
  const scale = useTransform(progress, [a - 0.04, a, b, b + 0.04], [1, 1.5, 1.5, 1]);
  const opacity = useTransform(progress, [a - 0.04, a, b, b + 0.04], [0.35, 1, 1, 0.35]);
  return (
    <motion.span
      style={{ scale, opacity }}
      className="block h-2.5 w-2.5 rounded-full bg-teal-300"
      aria-hidden="true"
    />
  );
}

/**
 * Signature scroll experience: a 300vh track pins the scene while scrolling
 * plays old → remodel → new. Falls back to the finished scene + captions
 * under reduced motion.
 */
export function Transformation() {
  const trackRef = useRef<HTMLElement>(null);
  const { reducedMotion } = useMotionPrefs();
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 26, mass: 0.4 });
  const barWidth = useTransform(progress, [0, 1], ["0%", "100%"]);

  if (reducedMotion) {
    return (
      <section id="transformation" className="bg-abyss py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-teal-300">
            The signature transformation
          </p>
          <h2 className="mt-3 text-center text-3xl text-white md:text-4xl">
            From the Shower You Put Up With to the One You Love
          </h2>
          <div className="mt-10 overflow-hidden rounded-card shadow-lift">
            <ShowerSceneNew prefix="tf-static" className="aspect-[3/2] h-auto w-full" />
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {stages.map((s) => (
              <div key={s.title}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-300">{s.eyebrow}</p>
                <h3 className="mt-1.5 font-display text-xl text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-teal-100/80">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="transformation" ref={trackRef} className="relative h-[300vh] bg-abyss">
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        {/* heading */}
        <div className="relative z-10 px-4 pt-32 text-center md:pt-36">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-300 md:text-xs">
            The signature transformation
          </p>
          <h2 className="mx-auto mt-2 max-w-2xl text-2xl text-white sm:text-3xl md:text-4xl">
            Watch an Old Shower Become Brand New
          </h2>
        </div>

        {/* scene */}
        <div className="relative mx-auto mt-5 w-full max-w-6xl flex-1 px-4 pb-40 sm:px-6 md:pb-36">
          <div className="chrome-edge relative h-full overflow-hidden rounded-card shadow-lift">
            <TransformationScene progress={progress} className="h-full w-full" />
          </div>
        </div>

        {/* caption + progress hud */}
        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="mx-auto flex max-w-6xl items-end justify-between gap-6 px-6 pb-8 sm:px-8">
            <div className="relative h-32 flex-1 md:h-28">
              {stages.map((_, i) => (
                <StageCaption key={i} progress={progress} index={i} />
              ))}
            </div>
            <div className="hidden flex-col items-center gap-3 md:flex" aria-hidden="true">
              {stages.map((_, i) => (
                <StageDot key={i} progress={progress} index={i} />
              ))}
            </div>
          </div>
          {/* scroll progress bar */}
          <div className="h-1 w-full bg-white/10" aria-hidden="true">
            <motion.div style={{ width: barWidth }} className="h-full bg-gradient-to-r from-teal-500 to-teal-300" />
          </div>
        </div>

        {/* gradient legibility scrim at the bottom */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-abyss via-abyss/70 to-transparent" aria-hidden="true" />
      </div>
    </section>
  );
}
