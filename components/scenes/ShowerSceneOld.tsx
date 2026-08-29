import { SceneDefs } from "./TilePattern";
import { CrossHandles, OldShowerHead } from "./ChromeFixtures";

/**
 * The "before": dated beige tile, tired grout, cracks, grime, a sagging
 * curtain and a dripping wall-pipe showerhead. Static + server-renderable.
 */
export function ShowerSceneOld({ prefix: p, className }: { prefix: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 800"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <SceneDefs prefix={p} />

      {/* wall + floor */}
      <rect width="1200" height="656" fill={`url(#${p}-oldtile)`} />
      <rect y="656" width="1200" height="144" fill={`url(#${p}-oldfloor)`} />
      <rect y="648" width="1200" height="12" fill="#8f8468" />

      {/* dingy light */}
      <rect width="1200" height="800" fill="#4a3f2b" opacity="0.14" />
      <rect width="1200" height="360" fill={`url(#${p}-light)`} opacity="0.25" />

      {/* water-stain streaks below the head */}
      <g fill="#7d6f50" opacity="0.28" filter={`url(#${p}-soft)`}>
        <rect x="345" y="230" width="14" height="330" rx="7" />
        <rect x="380" y="260" width="9" height="290" rx="4.5" />
        <rect x="310" y="300" width="8" height="240" rx="4" />
      </g>

      {/* grime + mildew */}
      <g filter={`url(#${p}-soft)`}>
        <ellipse cx="70" cy="640" rx="130" ry="48" fill="#5c5236" opacity="0.4" />
        <ellipse cx="1150" cy="650" rx="150" ry="42" fill="#5c5236" opacity="0.35" />
        <ellipse cx="620" cy="660" rx="180" ry="24" fill="#6b6045" opacity="0.28" />
        <ellipse cx="180" cy="120" rx="90" ry="40" fill="#6b6045" opacity="0.22" />
      </g>
      <g fill="#4d5a3a" opacity="0.5">
        {[90, 150, 420, 480, 560, 700, 760, 1010, 1070].map((x, i) => (
          <circle key={x} cx={x} cy={636 - (i % 3) * 9} r={3 + (i % 2)} />
        ))}
      </g>

      {/* cracked + chipped tiles */}
      <g stroke="#6e6248" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M262 322 l30 26 l-8 30 l26 22" />
        <path d="M292 348 l24 -10" />
        <path d="M782 420 l26 30 l22 -8 l20 30" />
        <path d="M808 450 l-6 28" />
        <path d="M520 180 l22 24 l18 -6" />
      </g>
      <path d="M706 516 l40 0 l0 34 l-18 8 l-22 -12 Z" fill="#8f8468" opacity="0.85" />
      <path d="M706 516 l40 0 l-6 20 l-28 6 Z" fill="#6e6248" opacity="0.7" />

      {/* dated fixtures */}
      <g transform="translate(330 160)">
        <OldShowerHead prefix={p} />
      </g>
      <g transform="translate(330 430)">
        <CrossHandles prefix={p} />
      </g>

      {/* puddle under the drip */}
      <ellipse cx="372" cy="700" rx="90" ry="14" fill="#7fa3ad" opacity="0.35" />
      <ellipse cx="372" cy="700" rx="52" ry="8" fill="#9fc0c9" opacity="0.35" />

      {/* sagging rod + wavy curtain */}
      <path d="M540 96 Q 850 116 1160 98" stroke={`url(#${p}-oldmetal)`} strokeWidth="9" fill="none" strokeLinecap="round" />
      {[880, 940, 1000, 1060, 1120].map((x) => (
        <circle key={x} cx={x} cy={x % 120 === 40 ? 108 : 105} r="7" fill="#8f8672" />
      ))}
      <path
        d="M868 108 q22 8 44 0 q22 -8 44 0 q22 8 44 0 q22 -8 44 0 q22 8 44 0 l14 4 l-6 560 q-60 26 -116 6 q-56 -20 -108 4 Z"
        fill="#cfc6ae"
      />
      <path d="M900 130 q6 260 -4 520 M960 128 q10 270 2 520 M1020 132 q-6 250 4 508 M1080 128 q8 260 -2 516" stroke="#b3a98c" strokeWidth="5" fill="none" opacity="0.8" />

      {/* vignette */}
      <rect width="1200" height="800" fill="#2c2618" opacity="0.12" />
    </svg>
  );
}
