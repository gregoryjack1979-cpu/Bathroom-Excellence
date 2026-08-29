"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { SceneDefs } from "./TilePattern";
import {
  CrossHandles,
  LinearDrain,
  MixerBar,
  NicheShelf,
  OldShowerHead,
  RainHead,
} from "./ChromeFixtures";
import { GlassDoor } from "./GlassPanel";

interface TransformationSceneProps {
  /** 0 → old shower, 1 → finished remodel */
  progress: MotionValue<number>;
  className?: string;
}

/**
 * The signature scene: one SVG whose layers strip out (old tile, grime,
 * curtain, dated fixtures), rebuild (marble panels, chrome, glass) and
 * polish (light sweep, water, steam) as scroll progress runs 0 → 1.
 */
export function TransformationScene({ progress: p, className }: TransformationSceneProps) {
  const pre = "tf";

  /* ── stage 1: strip out ── */
  const grimeOpacity = useTransform(p, [0, 0.14], [1, 0]);
  const curtainX = useTransform(p, [0.02, 0.2], [0, 620]);
  const curtainOpacity = useTransform(p, [0.02, 0.2], [1, 0]);
  const oldFixY = useTransform(p, [0.12, 0.3], [0, 260]);
  const oldFixOpacity = useTransform(p, [0.12, 0.28], [1, 0]);
  const oldWallY = useTransform(p, [0.16, 0.36], [0, 120]);
  const oldWallOpacity = useTransform(p, [0.16, 0.36], [1, 0]);

  /* ── mid: bare wall + studs ── */
  const studsOpacity = useTransform(p, [0.24, 0.34, 0.5, 0.6], [0, 0.9, 0.9, 0]);

  /* ── stage 2: rebuild ── */
  const panel1Y = useTransform(p, [0.36, 0.5], [560, 0]);
  const panel1Opacity = useTransform(p, [0.36, 0.46], [0, 1]);
  const panel2Y = useTransform(p, [0.43, 0.57], [560, 0]);
  const panel2Opacity = useTransform(p, [0.43, 0.53], [0, 1]);
  const panel3Y = useTransform(p, [0.5, 0.64], [560, 0]);
  const panel3Opacity = useTransform(p, [0.5, 0.6], [0, 1]);
  const newFloorOpacity = useTransform(p, [0.44, 0.58], [0, 1]);
  const nicheOpacity = useTransform(p, [0.6, 0.7], [0, 1]);
  const rainY = useTransform(p, [0.58, 0.7], [-230, 0]);
  const rainOpacity = useTransform(p, [0.58, 0.68], [0, 1]);
  const mixerScale = useTransform(p, [0.62, 0.72], [0.6, 1]);
  const mixerOpacity = useTransform(p, [0.62, 0.72], [0, 1]);
  const drainOpacity = useTransform(p, [0.64, 0.72], [0, 1]);

  /* ── stage 3: reveal ── */
  const glassX = useTransform(p, [0.72, 0.85], [560, 0]);
  const glassOpacity = useTransform(p, [0.72, 0.83], [0, 1]);
  const sweepX = useTransform(p, [0.82, 0.97], [-500, 1700]);
  const sweepOpacity = useTransform(p, [0.82, 0.86, 0.94, 0.97], [0, 0.5, 0.5, 0]);
  const waterOpacity = useTransform(p, [0.88, 0.97], [0, 1]);
  const brighten = useTransform(p, [0.3, 0.8], [0.32, 0]);
  const glowOpacity = useTransform(p, [0.7, 1], [0.15, 0.75]);

  return (
    <svg
      viewBox="0 0 1200 800"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <SceneDefs prefix={pre} />

      {/* bare room shell (revealed mid-transition) */}
      <rect width="1200" height="656" fill="#ddd5c8" />
      <rect y="656" width="1200" height="144" fill="#b7a98e" />
      <motion.g style={{ opacity: studsOpacity }}>
        {[140, 340, 540, 740, 940, 1140].map((x) => (
          <rect key={x} x={x} y="0" width="26" height="656" fill="#c2b295" />
        ))}
        <rect y="300" width="1200" height="12" fill="#b3a284" />
      </motion.g>

      {/* ── NEW shower (builds in beneath the old layers) ── */}
      <motion.g style={{ opacity: newFloorOpacity }}>
        <rect y="656" width="1200" height="144" fill={`url(#${pre}-newfloor)`} />
        <rect y="650" width="1200" height="8" fill="#b7bec1" />
        <ellipse cx="420" cy="716" rx="230" ry="20" fill="#ffffff" opacity="0.2" />
      </motion.g>
      <motion.g style={{ y: panel1Y, opacity: panel1Opacity }}>
        <rect width="400" height="656" fill={`url(#${pre}-marble)`} />
        <path d="M60 90 q140 60 90 190 q-40 110 60 210" stroke="#aeb9bc" strokeWidth="3" fill="none" opacity="0.15" />
      </motion.g>
      <motion.g style={{ y: panel2Y, opacity: panel2Opacity }}>
        <rect x="400" width="400" height="656" fill={`url(#${pre}-marble)`} />
        <line x1="400" y1="0" x2="400" y2="656" stroke="#c3ccce" strokeWidth="3" />
        <path d="M480 40 q90 120 30 260 q-40 100 70 240" stroke="#aeb9bc" strokeWidth="3" fill="none" opacity="0.15" />
      </motion.g>
      <motion.g style={{ y: panel3Y, opacity: panel3Opacity }}>
        <rect x="800" width="400" height="656" fill={`url(#${pre}-marble)`} />
        <line x1="800" y1="0" x2="800" y2="656" stroke="#c3ccce" strokeWidth="3" />
        <path d="M900 120 q110 90 40 230 q-50 110 80 240" stroke="#aeb9bc" strokeWidth="3" fill="none" opacity="0.15" />
      </motion.g>
      <motion.g style={{ opacity: nicheOpacity }}>
        <g transform="translate(840 210)">
          <NicheShelf prefix={pre} />
        </g>
      </motion.g>
      <motion.g style={{ y: rainY, opacity: rainOpacity }}>
        <g transform="translate(330 30)">
          <RainHead prefix={pre} />
        </g>
      </motion.g>
      <motion.g style={{ scale: mixerScale, opacity: mixerOpacity, transformOrigin: "330px 440px" }}>
        <g transform="translate(330 440)">
          <MixerBar prefix={pre} />
        </g>
      </motion.g>
      <motion.g style={{ opacity: drainOpacity }}>
        <g transform="translate(400 730)">
          <LinearDrain prefix={pre} width={240} />
        </g>
      </motion.g>

      {/* falling water + steam (finished state) */}
      <motion.g style={{ opacity: waterOpacity }}>
        <g stroke="#9fd3e0" strokeWidth="2.4" strokeLinecap="round" opacity="0.38">
          {[-48, -32, -16, 0, 16, 32, 48].map((x, i) => (
            <line key={x} x1={330 + x} y1="112" x2={330 + x} y2={590 + (i % 3) * 30} />
          ))}
        </g>
        <g filter={`url(#${pre}-softer)`} fill="#ffffff">
          <ellipse cx="380" cy="240" rx="70" ry="26" opacity="0.28" />
          <ellipse cx="300" cy="330" rx="56" ry="20" opacity="0.2" />
        </g>
      </motion.g>

      {/* glass door slides in */}
      <motion.g style={{ x: glassX, opacity: glassOpacity }}>
        <g transform="translate(640 96)">
          <GlassDoor prefix={pre} w={430} h={560} droplets />
        </g>
      </motion.g>

      {/* ── OLD shower on top, stripping away ── */}
      <motion.g style={{ y: oldWallY, opacity: oldWallOpacity }}>
        <rect width="1200" height="656" fill={`url(#${pre}-oldtile)`} />
        <rect y="656" width="1200" height="144" fill={`url(#${pre}-oldfloor)`} />
        <rect y="648" width="1200" height="12" fill="#8f8468" />
        <g stroke="#6e6248" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M262 322 l30 26 l-8 30 l26 22" />
          <path d="M782 420 l26 30 l22 -8 l20 30" />
          <path d="M520 180 l22 24 l18 -6" />
        </g>
        <path d="M706 516 l40 0 l0 34 l-18 8 l-22 -12 Z" fill="#8f8468" opacity="0.85" />
        <g fill="#7d6f50" opacity="0.28" filter={`url(#${pre}-soft)`}>
          <rect x="345" y="230" width="14" height="330" rx="7" />
          <rect x="380" y="260" width="9" height="290" rx="4.5" />
        </g>
      </motion.g>
      <motion.g style={{ opacity: grimeOpacity }}>
        <g filter={`url(#${pre}-soft)`}>
          <ellipse cx="70" cy="640" rx="130" ry="48" fill="#5c5236" opacity="0.4" />
          <ellipse cx="1150" cy="650" rx="150" ry="42" fill="#5c5236" opacity="0.35" />
          <ellipse cx="620" cy="660" rx="180" ry="24" fill="#6b6045" opacity="0.28" />
        </g>
        <g fill="#4d5a3a" opacity="0.5">
          {[90, 150, 420, 480, 560, 700, 760, 1010].map((x, i) => (
            <circle key={x} cx={x} cy={636 - (i % 3) * 9} r={3 + (i % 2)} />
          ))}
        </g>
      </motion.g>
      <motion.g style={{ y: oldFixY, opacity: oldFixOpacity }}>
        <g transform="translate(330 160)">
          <OldShowerHead prefix={pre} />
        </g>
        <g transform="translate(330 430)">
          <CrossHandles prefix={pre} />
        </g>
        <ellipse cx="372" cy="700" rx="90" ry="14" fill="#7fa3ad" opacity="0.35" />
      </motion.g>
      <motion.g style={{ x: curtainX, opacity: curtainOpacity }}>
        <path d="M540 96 Q 850 116 1160 98" stroke={`url(#${pre}-oldmetal)`} strokeWidth="9" fill="none" strokeLinecap="round" />
        <path
          d="M868 108 q22 8 44 0 q22 -8 44 0 q22 8 44 0 q22 -8 44 0 q22 8 44 0 l14 4 l-6 560 q-60 26 -116 6 q-56 -20 -108 4 Z"
          fill="#cfc6ae"
        />
        <path d="M900 130 q6 260 -4 520 M960 128 q10 270 2 520 M1020 132 q-6 250 4 508" stroke="#b3a98c" strokeWidth="5" fill="none" opacity="0.8" />
      </motion.g>

      {/* lighting: dim → bright */}
      <motion.rect width="1200" height="800" fill="#2c2618" style={{ opacity: brighten }} />
      <motion.rect width="1200" height="420" fill={`url(#${pre}-light)`} style={{ opacity: glowOpacity }} />

      {/* reveal light sweep */}
      <motion.g style={{ x: sweepX, opacity: sweepOpacity }}>
        <rect x="-120" y="-80" width="260" height="960" fill="#ffffff" transform="skewX(-18)" />
      </motion.g>
    </svg>
  );
}
