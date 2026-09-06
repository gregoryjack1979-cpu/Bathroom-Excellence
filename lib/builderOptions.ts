import type { MetalStops, ScenePalette } from "@/components/scenes/TilePattern";
import { POLISHED_CHROME } from "@/components/scenes/TilePattern";

/** A wall panel look. `swatch` is the color shown on the picker button. */
export interface WallStyle {
  id: string;
  label: string;
  swatch: string;
  palette: Omit<ScenePalette, "metal">;
}

export const WALL_STYLES: WallStyle[] = [
  {
    id: "white-marble",
    label: "White Marble",
    swatch: "#eff1f0",
    palette: { wall: "#f4f5f4", wallShade: "#dfe3e4", accent: "#b08d57", accentDeep: "#7d6039", floor: "#d9dedf" },
  },
  {
    id: "grey-marble",
    label: "Grey Marble",
    swatch: "#c8d0d3",
    palette: { wall: "#e4e8ea", wallShade: "#bfc8cc", accent: "#8d9aa0", accentDeep: "#5c686d", floor: "#ccd3d6" },
  },
  {
    id: "warm-stone",
    label: "Warm Stone",
    swatch: "#ded2bf",
    palette: { wall: "#efe8dd", wallShade: "#d6cab7", accent: "#a8834e", accentDeep: "#6f5426", floor: "#ded5c7" },
  },
  {
    id: "sage-stone",
    label: "Sage Stone",
    swatch: "#c6d3c4",
    palette: { wall: "#e8ede7", wallShade: "#c9d4c6", accent: "#5f8f6a", accentDeep: "#3d6247", floor: "#d5ddd3" },
  },
];

/** Fixture finishes. These repaint every piece of hardware in the scene. */
export interface FinishOption {
  id: string;
  label: string;
  swatch: string;
  metal: MetalStops;
}

export const FINISHES: FinishOption[] = [
  { id: "chrome", label: "Polished Chrome", swatch: "#b9c4cb", metal: POLISHED_CHROME },
  {
    id: "nickel",
    label: "Brushed Nickel",
    swatch: "#b3aca2",
    metal: { hi: "#efebe5", light: "#cbc4ba", core: "#8b847a", sheen: "#ded9d2", edgeV: "#a49d93", edgeH: "#9a938a" },
  },
  {
    id: "black",
    label: "Matte Black",
    swatch: "#2f2f2f",
    metal: { hi: "#5a5a5a", light: "#3d3d3d", core: "#1c1c1c", sheen: "#4a4a4a", edgeV: "#2a2a2a", edgeH: "#232323" },
  },
];

/** Toggleable extras — the keys match ShowerSceneNew's boolean props. */
export type ExtraId = "door" | "niche" | "grabBar" | "bench";

export interface ExtraOption {
  id: ExtraId;
  label: string;
  hint: string;
  /** What the estimate request should call this */
  quoteLabel: string;
}

export const EXTRAS: ExtraOption[] = [
  { id: "door", label: "Glass Door", hint: "Frameless sliding glass", quoteLabel: "Glass shower door" },
  { id: "niche", label: "Corner Shelf", hint: "Recessed storage niche", quoteLabel: "Built-in storage niche" },
  { id: "grabBar", label: "Safety Bar", hint: "Designer-grade grab bar", quoteLabel: "Grab bar" },
  { id: "bench", label: "Bench Seat", hint: "Built-in teak-look seat", quoteLabel: "Shower seating" },
];

export const DEFAULT_EXTRAS: Record<ExtraId, boolean> = {
  door: true,
  niche: true,
  grabBar: false,
  bench: false,
};

/** Build the full scene palette from a wall style + finish selection. */
export function buildPalette(wall: WallStyle, finish: FinishOption): ScenePalette {
  return { ...wall.palette, metal: finish.metal };
}
