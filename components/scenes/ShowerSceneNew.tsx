import { SceneDefs, type ScenePalette } from "./TilePattern";
import {
  BenchSeat,
  GrabBar,
  LinearDrain,
  MixerBar,
  NicheShelf,
  RainHead,
  TowelBar,
} from "./ChromeFixtures";
import { GlassDoor } from "./GlassPanel";

interface ShowerSceneNewProps {
  prefix: string;
  className?: string;
  palette?: ScenePalette;
  /** Show falling water + steam from the rain head */
  water?: boolean;
  /** Walk-in extras */
  bench?: boolean;
  grabBar?: boolean;
}

/**
 * The "after": large-format marble panels, rainfall head, mosaic niche,
 * frameless glass and a linear drain. Static + server-renderable; palette
 * prop creates the gallery variants.
 */
export function ShowerSceneNew({
  prefix: p,
  className,
  palette,
  water = true,
  bench = false,
  grabBar = false,
}: ShowerSceneNewProps) {
  return (
    <svg
      viewBox="0 0 1200 800"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <SceneDefs prefix={p} palette={palette} />

      {/* marble wall panels with seams + faint veining */}
      <rect width="1200" height="656" fill={`url(#${p}-marble)`} />
      <g stroke="#c3ccce" strokeWidth="3">
        <line x1="400" y1="0" x2="400" y2="656" />
        <line x1="800" y1="0" x2="800" y2="656" />
      </g>
      <g stroke="#aeb9bc" strokeWidth="3" fill="none" opacity="0.15">
        <path d="M60 90 q140 60 90 190 q-40 110 60 210" />
        <path d="M480 40 q90 120 30 260 q-40 100 70 240" />
        <path d="M900 120 q110 90 40 230 q-50 110 80 240" />
        <path d="M1130 30 q40 130 -30 250" />
      </g>

      {/* floor + level entry */}
      <rect y="656" width="1200" height="144" fill={`url(#${p}-newfloor)`} />
      <rect y="650" width="1200" height="8" fill="#b7bec1" />

      {/* soft ceiling light + recessed spots */}
      <rect width="1200" height="420" fill={`url(#${p}-light)`} opacity="0.7" />
      <g>
        <circle cx="300" cy="26" r="13" fill="#5f6d75" />
        <circle cx="300" cy="26" r="8" fill="#fff8e0" />
        <circle cx="900" cy="26" r="13" fill="#5f6d75" />
        <circle cx="900" cy="26" r="8" fill="#fff8e0" />
      </g>

      {/* niche (sits behind the glass) */}
      <g transform="translate(840 210)">
        <NicheShelf prefix={p} />
      </g>

      {/* fixtures */}
      <g transform="translate(330 30)">
        <RainHead prefix={p} water={water} />
      </g>
      <g transform="translate(330 440)">
        <MixerBar prefix={p} />
      </g>
      {grabBar && (
        <g transform="translate(120 330)">
          <GrabBar prefix={p} length={170} angle={-32} />
        </g>
      )}
      {bench && (
        <g transform="translate(40 560)">
          <BenchSeat prefix={p} w={200} />
        </g>
      )}
      {!bench && (
        <g transform="translate(70 300)">
          <TowelBar prefix={p} accent={palette?.accent ?? "#b08d57"} length={140} />
        </g>
      )}

      {/* steam wisps */}
      {water && (
        <g filter={`url(#${p}-softer)`} fill="#ffffff">
          <ellipse cx="380" cy="240" rx="70" ry="26" opacity="0.28" />
          <ellipse cx="300" cy="330" rx="56" ry="20" opacity="0.2" />
          <ellipse cx="430" cy="400" rx="60" ry="22" opacity="0.16" />
        </g>
      )}

      {/* wet-floor sheen + drain */}
      <ellipse cx="420" cy="716" rx="230" ry="20" fill="#ffffff" opacity="0.2" />
      <g transform="translate(400 730)">
        <LinearDrain prefix={p} width={240} />
      </g>

      {/* frameless glass door (over the niche side) */}
      <g transform="translate(640 96)">
        <GlassDoor prefix={p} w={430} h={560} droplets={water} />
      </g>

      {/* greenery for warmth */}
      <g transform="translate(1108 610)">
        <path d="M0 90 q-8 -70 18 -110 M8 92 q4 -80 42 -104 M16 94 q22 -60 58 -66" stroke="#5f8f6a" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M-2 96 h64 l-8 58 q-24 10 -48 0 Z" fill="#c9b394" />
        <rect x="-2" y="96" width="64" height="10" rx="4" fill="#b39d7d" />
      </g>
    </svg>
  );
}
