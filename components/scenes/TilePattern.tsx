/**
 * Shared SVG <defs> for every bathroom scene: tile patterns, marble, chrome
 * and glass gradients, soft-light radials and blur filters. Each scene passes
 * a unique `prefix` so multiple scenes can live on one page without gradient
 * ID collisions.
 */

export interface ScenePalette {
  /** Marble/wall base tint for the finished shower */
  wall: string;
  wallShade: string;
  /** Accent color (niche mosaic, towel) */
  accent: string;
  accentDeep: string;
  /** Floor tile tone */
  floor: string;
}

export const DEFAULT_PALETTE: ScenePalette = {
  wall: "#f4f5f4",
  wallShade: "#dfe3e4",
  accent: "#b08d57",
  accentDeep: "#7d6039",
  floor: "#d9dedf",
};

export function SceneDefs({
  prefix: p,
  palette = DEFAULT_PALETTE,
}: {
  prefix: string;
  palette?: ScenePalette;
}) {
  return (
    <defs>
      {/* Finished shower: large-format marble panel */}
      <linearGradient id={`${p}-marble`} x1="0" y1="0" x2="0.25" y2="1">
        <stop offset="0" stopColor="#fbfbfa" />
        <stop offset="0.35" stopColor={palette.wall} />
        <stop offset="0.7" stopColor={palette.wallShade} />
        <stop offset="1" stopColor={palette.wall} />
      </linearGradient>

      {/* Chrome: vertical + horizontal polished metal */}
      <linearGradient id={`${p}-chrome-v`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#f6f9fb" />
        <stop offset="0.3" stopColor="#c3ced6" />
        <stop offset="0.52" stopColor="#77868f" />
        <stop offset="0.72" stopColor="#e6edf1" />
        <stop offset="1" stopColor="#98a7b1" />
      </linearGradient>
      <linearGradient id={`${p}-chrome-h`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f6f9fb" />
        <stop offset="0.3" stopColor="#c3ced6" />
        <stop offset="0.55" stopColor="#77868f" />
        <stop offset="0.75" stopColor="#e6edf1" />
        <stop offset="1" stopColor="#8d9ba5" />
      </linearGradient>

      {/* Aged brass/nickel for the dated fixtures */}
      <linearGradient id={`${p}-oldmetal`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#c9bfa8" />
        <stop offset="0.5" stopColor="#8f8672" />
        <stop offset="1" stopColor="#6e6754" />
      </linearGradient>

      {/* Glass specular sweep */}
      <linearGradient id={`${p}-glass`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
        <stop offset="0.22" stopColor="#ffffff" stopOpacity="0.05" />
        <stop offset="0.45" stopColor="#dff0f4" stopOpacity="0.22" />
        <stop offset="0.6" stopColor="#ffffff" stopOpacity="0.04" />
        <stop offset="1" stopColor="#cfe6ec" stopOpacity="0.18" />
      </linearGradient>

      {/* Soft ceiling light */}
      <radialGradient id={`${p}-light`} cx="0.5" cy="0" r="1">
        <stop offset="0" stopColor="#fffdf5" stopOpacity="0.85" />
        <stop offset="0.55" stopColor="#fffdf5" stopOpacity="0.18" />
        <stop offset="1" stopColor="#fffdf5" stopOpacity="0" />
      </radialGradient>

      {/* Dated beige wall tile (small squares, tired grout) */}
      <pattern id={`${p}-oldtile`} width="64" height="64" patternUnits="userSpaceOnUse">
        <rect width="64" height="64" fill="#c9bd9c" />
        <rect x="2" y="2" width="60" height="60" rx="2" fill="#d8cdab" />
        <rect x="4" y="4" width="56" height="20" rx="2" fill="#ded4b5" opacity="0.7" />
      </pattern>

      {/* Dated floor */}
      <pattern id={`${p}-oldfloor`} width="42" height="42" patternUnits="userSpaceOnUse">
        <rect width="42" height="42" fill="#a89d82" />
        <rect x="1.5" y="1.5" width="39" height="39" fill="#bab090" />
      </pattern>

      {/* Finished floor: large porcelain tile */}
      <pattern id={`${p}-newfloor`} width="120" height="120" patternUnits="userSpaceOnUse">
        <rect width="120" height="120" fill="#c6cdcf" />
        <rect x="1.5" y="1.5" width="117" height="117" fill={palette.floor} />
        <rect x="1.5" y="1.5" width="117" height="40" fill="#ffffff" opacity="0.12" />
      </pattern>

      {/* Accent mosaic for the niche */}
      <pattern id={`${p}-mosaic`} width="22" height="22" patternUnits="userSpaceOnUse">
        <rect width="22" height="22" fill={palette.accentDeep} />
        <rect x="1.25" y="1.25" width="19.5" height="19.5" rx="1.5" fill={palette.accent} />
        <rect x="1.25" y="1.25" width="19.5" height="8" rx="1.5" fill="#ffffff" opacity="0.16" />
      </pattern>

      {/* Blur for grime, steam, shadows */}
      <filter id={`${p}-soft`} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="7" />
      </filter>
      <filter id={`${p}-softer`} x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="14" />
      </filter>
    </defs>
  );
}
