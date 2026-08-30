"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { useMouseParallax } from "@/lib/hooks/useMouseParallax";
import { useMotionPrefs } from "@/lib/hooks/useMotionPrefs";
import { LeadForm } from "@/components/form/LeadForm";
import { HeroVideoBackground } from "./HeroVideoBackground";

/** Positions a child at a parallax depth (px of travel at full pointer sweep). */
function Layer({
  x,
  y,
  depth,
  className,
  children,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  depth: number;
  className?: string;
  children: ReactNode;
}) {
  const tx = useTransform(x, (v) => v * depth);
  const ty = useTransform(y, (v) => v * depth * 0.7);
  return (
    <motion.div style={{ x: tx, y: ty }} className={className} aria-hidden="true">
      {children}
    </motion.div>
  );
}

function Droplet({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.16} viewBox="0 0 26 30" fill="none" aria-hidden="true">
      <path
        d="M13 1.5C13 1.5 3 13.2 3 19.4a10 10 0 0 0 20 0C23 13.2 13 1.5 13 1.5Z"
        fill="url(#hero-droplet)"
        stroke="rgba(255,255,255,0.7)"
      />
      <ellipse cx="9.4" cy="17.2" rx="2.5" ry="3.6" fill="#fff" opacity="0.6" transform="rotate(-18 9.4 17.2)" />
    </svg>
  );
}

/**
 * Shower Remodels hero: content column + a 3D "glass showcase" of the
 * finished shower that tilts and parallaxes with the mouse. Static (centered)
 * on touch, small screens and under reduced motion.
 */
export function Hero() {
  const { desktop, pointerFine, reducedMotion } = useMotionPrefs();
  const interactive = desktop && pointerFine && !reducedMotion;
  const { x, y, bind } = useMouseParallax();

  return (
    <section
      {...(interactive ? bind : {})}
      className="relative overflow-hidden pt-36 pb-16 md:pt-44 md:pb-24 lg:min-h-[100svh]"
    >
      {/* ambient background: the marble-bathroom video, scrimmed for legible copy */}
      <HeroVideoBackground />
      <Layer x={x} y={y} depth={-10} className="absolute inset-0 -z-10">
        <div className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-teal-300/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-teal-500/10 blur-3xl" />
      </Layer>

      {/* shared gradient for droplets */}
      <svg width="0" height="0" aria-hidden="true">
        <defs>
          <radialGradient id="hero-droplet" cx="38%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#9fd3e0" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7e97a1" stopOpacity="0.9" />
          </radialGradient>
        </defs>
      </svg>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        {/* ─── Copy column ─── */}
        <div className="relative z-10 min-w-0 max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-600/15 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" aria-hidden="true" />
            Shower Remodeling Specialists
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="text-3xl leading-[1.15] sm:text-4xl sm:leading-[1.08] md:text-5xl lg:text-[3.6rem]"
          >
            Your Destination for{" "}
            <span className="relative whitespace-normal sm:whitespace-nowrap text-teal-700">
              Bathroom Remodeling
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" aria-hidden="true" preserveAspectRatio="none">
                <path d="M2 9C60 3 150 2 298 7" stroke="#c9a86a" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
              </svg>
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg leading-relaxed"
          >
            In St. Charles, MO and the Greater St. Louis Area — from shower
            remodels and tub-to-shower conversions to full bathroom remodels
            and walk-in bathtubs, we design and build spaces that are
            comfortable, convenient and beautiful. Many projects are finished
            in as little as a day.{" "}
            <a href="/services/full-bathroom-remodel" className="font-semibold text-teal-700 underline-offset-2 hover:underline">
              Ask us about our full Bathroom Remodeling services!
            </a>
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Button href="/#free-estimate" size="lg">
              Get a Free Estimate
            </Button>
            <Button href={siteConfig.phoneHref} variant="outline" size="lg">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              Call Now
            </Button>
            <Button href={siteConfig.bookingUrl} target="_blank" rel="noopener noreferrer" variant="gold" size="lg">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2"/><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="m9 15 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Book Appointment Now
            </Button>
          </motion.div>
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.42 }}
            className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-ink/80"
          >
            {["Licensed & insured", "Free estimates", "Fully custom work"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" fill="#ece4d4" />
                  <path d="m8 12.5 2.6 2.6L16 9.6" stroke="#6f5426" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* ─── Estimate form card (like the original homepage) ─── */}
        <div id="free-estimate" className="relative z-10 min-w-0 scroll-mt-36">
          {/* chrome ring accent behind the card */}
          <Layer x={x} y={y} depth={-18} className="absolute -right-10 -top-14 hidden lg:block">
            <svg width="176" height="176" viewBox="0 0 176 176" className="animate-float-slow opacity-60">
              <defs>
                <linearGradient id="hero-ring" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#eef3f6" />
                  <stop offset="0.45" stopColor="#8fa0ab" />
                  <stop offset="0.7" stopColor="#e2e9ee" />
                  <stop offset="1" stopColor="#9aa9b3" />
                </linearGradient>
              </defs>
              <circle cx="88" cy="88" r="80" fill="none" stroke="url(#hero-ring)" strokeWidth="12" />
            </svg>
          </Layer>

          <motion.div
            initial={{ opacity: 0, y: 34, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="glass-dark relative rounded-card p-6 shadow-lift sm:p-8"
          >
            <h2 className="text-center font-display text-2xl text-white md:text-[1.7rem]">
              Get A Free Estimate
            </h2>
            <p className="mb-6 mt-1.5 text-center text-sm text-white/70">
              Six quick questions — exact quote, zero obligation.
            </p>
            <LeadForm dark />
          </motion.div>

          {/* floating trust badges — hidden on mobile, where there's no room beside the card */}
          <Layer x={x} y={y} depth={26} className="absolute -left-5 -top-6 hidden md:-left-9 md:block">
            <div className="glass-panel animate-float rounded-2xl px-4 py-3 shadow-card">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">Many projects done</p>
              <p className="font-display text-xl text-ink">in a day</p>
            </div>
          </Layer>
          <Layer x={x} y={y} depth={34} className="absolute -bottom-6 right-4 hidden md:right-8 md:block">
            <div className="glass-panel animate-float-slow rounded-2xl px-4 py-3 shadow-card">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#e9b949" aria-hidden="true"><path d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8Z" /></svg>
                {siteConfig.rating.value} stars on Google
              </p>
              <p className="mt-0.5 text-xs text-body">{siteConfig.rating.count} homeowner reviews</p>
            </div>
          </Layer>
          {/* compact mobile-only trust strip beneath the card */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-ink/70 md:hidden">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#e9b949" aria-hidden="true"><path d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8Z" /></svg>
            {siteConfig.rating.value} stars on Google · {siteConfig.rating.count} reviews · Many projects done in a day
          </div>
          <Layer x={x} y={y} depth={44} className="absolute right-14 -top-8 hidden md:block">
            <div className="animate-float"><Droplet size={30} /></div>
          </Layer>
        </div>
      </div>

      {/* scroll cue */}
      <div className="pointer-events-none absolute inset-x-0 bottom-5 hidden justify-center lg:flex" aria-hidden="true">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-ink/20 p-1.5">
          <motion.span
            className="h-2 w-1 rounded-full bg-teal-600"
            animate={reducedMotion ? undefined : { y: [0, 10, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </section>
  );
}
