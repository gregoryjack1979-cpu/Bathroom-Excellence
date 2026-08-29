import { ShowerSceneNew } from "@/components/scenes/ShowerSceneNew";
import type { ScenePalette } from "@/components/scenes/TilePattern";

interface VariantSpec {
  palette?: ScenePalette;
  bench?: boolean;
  grabBar?: boolean;
  water?: boolean;
}

const sand: ScenePalette = { wall: "#f0e9df", wallShade: "#ded2c0", accent: "#b08d57", accentDeep: "#7d6039", floor: "#dcd4c8" };
const sage: ScenePalette = { wall: "#edf0ec", wallShade: "#d5ddd4", accent: "#5a8a7c", accentDeep: "#39604f", floor: "#d5dad4" };
const graphite: ScenePalette = { wall: "#8b979d", wallShade: "#6b787f", accent: "#2a93ac", accentDeep: "#0b3542", floor: "#9aa5aa" };
const midnight: ScenePalette = { wall: "#7c8b93", wallShade: "#5d6c74", accent: "#d9a441", accentDeep: "#8a6420", floor: "#8d989e" };
const carrara: ScenePalette = { wall: "#f5f6f5", wallShade: "#e2e6e6", accent: "#57b1c4", accentDeep: "#17758d", floor: "#dde1e2" };

const variants: VariantSpec[] = [
  { bench: true, grabBar: true, water: false },          // 0 walk-in
  { palette: sand, water: false },                        // 1 sandstone
  { palette: sage, water: false },                        // 2 sage alcove
  { palette: graphite, water: true },                     // 3 graphite
  { palette: carrara, water: false },                     // 4 carrara
  { palette: sand, bench: true, water: false },           // 5 two-piece seat
  { grabBar: true, bench: true, water: false },           // 6 accessible
  { palette: sage, bench: false, water: true },           // 7 three-piece
  { palette: carrara, water: true },                      // 8 alcove + glass
  { palette: midnight, water: false },                    // 9 midnight
  { bench: true, water: true },                           // 10 rainfall retreat
  { water: false },                                       // 11 minimalist
];

/** Renders the SVG scene for a gallery variant index. */
export function GalleryScene({ variant, prefix, className }: { variant: number; prefix: string; className?: string }) {
  const v = variants[variant % variants.length];
  return (
    <ShowerSceneNew
      prefix={prefix}
      className={className}
      palette={v.palette}
      bench={v.bench}
      grabBar={v.grabBar}
      water={v.water ?? false}
    />
  );
}
