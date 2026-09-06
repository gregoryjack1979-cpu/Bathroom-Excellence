/**
 * Bathroom Design Builder — every selectable option, in one place.
 *
 * Components never hard-code options; they read these lists. To add a choice,
 * add an entry here (and a matching image under /public/assets) and it shows
 * up in the step, the preview, the summary and the export automatically.
 *
 * Image paths: `asset("walls/marble/calcutta.png")` resolves to
 * /public/assets/walls/marble/calcutta.png, prefixed with the deployment base
 * path. Replace any placeholder by dropping a real image at the same path.
 * Preview layers must share the 1600x1200 canvas (see docs/design-builder.md).
 */
import { withBasePath } from "@/config/site";
import type {
  AccentOption,
  BathroomType,
  DoorType,
  GroutColor,
  RoomTheme,
  SafetyOption,
  StepDefinition,
  StorageOption,
  TrimColor,
  TrimColorId,
  WallStyle,
  WallStyleId,
  WallType,
  WindowOption,
} from "./types";

export const asset = (path: string) => withBasePath(`/assets/${path}`);

const TRIM_IDS: TrimColorId[] = ["chrome", "matte-black", "brushed-nickel"];
const byTrim = (file: (trim: TrimColorId) => string) =>
  Object.fromEntries(TRIM_IDS.map((t) => [t, asset(file(t))])) as Record<TrimColorId, string>;

/* ── Step 1 ── */
export const bathroomTypes: BathroomType[] = [
  {
    id: "shower",
    name: "Shower",
    description: "Walk-in shower on a low-profile base.",
    image: asset("thumbs/bathroom-types/shower.png"),
    // no layer: the room image already shows the shower pan
  },
  {
    id: "bathtub",
    name: "Bathtub",
    description: "Full tub with a matching wall surround.",
    image: asset("thumbs/bathroom-types/bathtub.png"),
    layer: asset("bathroom-types/bathtub.png"),
  },
  {
    id: "seated-shower",
    name: "Seated Shower",
    description: "Shower with a built-in molded seat.",
    image: asset("thumbs/bathroom-types/seated-shower.png"),
    layer: asset("bathroom-types/seated-shower.png"),
  },
];

/* ── Step 2 ── */
export const roomThemes: RoomTheme[] = [
  {
    id: "blue",
    name: "Blue Room",
    description: "Deep blue walls, dark vanity.",
    image: asset("thumbs/rooms/blue.png"),
    background: asset("rooms/blue-room.jpg"),
  },
  {
    id: "green",
    name: "Green Room",
    description: "Olive walls, white vanity.",
    image: asset("thumbs/rooms/green.png"),
    background: asset("rooms/green-room.jpg"),
  },
  {
    id: "grey",
    name: "Grey Room",
    description: "Soft grey walls, oak vanity.",
    image: asset("thumbs/rooms/grey.png"),
    background: asset("rooms/grey-room.jpg"),
  },
];

/* ── Step 3 / 4: wall types and the styles each one allows ── */
const STONE_STYLES: WallStyleId[] = ["white", "sandstone", "silverstone", "limestone", "ridgestone"];
const SUBWAY_STYLES: WallStyleId[] = [
  "3x6",
  "3x6-vertical",
  "6x12",
  "6x12-vertical",
  "6x24",
  "12x24",
  "12x24-vertical",
  "trendz",
  "herringbone",
  "hexagon",
];

export const wallTypes: WallType[] = [
  {
    id: "smooth",
    name: "Smooth",
    description: "Solid panels, no pattern, no grout.",
    image: asset("thumbs/wall-types/smooth.png"),
    hasGrout: false,
    compatibleStyles: STONE_STYLES,
    wallFolder: "smooth",
  },
  {
    id: "tile-12x12",
    name: "12x12 Tile",
    description: "Square tile pattern.",
    image: asset("thumbs/wall-types/tile-12x12.png"),
    hasGrout: true,
    compatibleStyles: STONE_STYLES,
    wallFolder: "tile",
    groutPattern: "12x12",
  },
  {
    id: "tile-11x20",
    name: "11x20 Tile",
    description: "Large-format rectangular tile.",
    image: asset("thumbs/wall-types/tile-11x20.png"),
    hasGrout: true,
    compatibleStyles: STONE_STYLES,
    wallFolder: "tile",
    groutPattern: "11x20",
  },
  {
    id: "subway",
    name: "Subway Tile",
    description: "Classic brick-laid and decorative patterns.",
    image: asset("thumbs/wall-types/subway.png"),
    hasGrout: true,
    compatibleStyles: SUBWAY_STYLES,
    wallFolder: "subway",
    fixedWallImage: asset("walls/subway/white-tile.png"),
  },
  {
    id: "illusions-white",
    name: "Illusions White",
    description: "Printed panel — clean white.",
    image: asset("thumbs/wall-types/illusions-white.png"),
    hasGrout: false,
    compatibleStyles: ["white"],
    wallFolder: "smooth",
  },
  {
    id: "illusions-venatino",
    name: "Illusions Venatino",
    description: "Printed marble — fine grey veining.",
    image: asset("thumbs/wall-types/illusions-venatino.png"),
    hasGrout: false,
    compatibleStyles: ["venatino"],
    wallFolder: "marble",
  },
  {
    id: "illusions-calcutta",
    name: "Illusions Calcutta",
    description: "Printed marble — bold grey veining.",
    image: asset("thumbs/wall-types/illusions-calcutta.png"),
    hasGrout: false,
    compatibleStyles: ["calcutta"],
    wallFolder: "marble",
  },
  {
    id: "illusions-calcutta-vintage",
    name: "Illusions Calcutta Vintage",
    description: "Printed marble — warm, aged tone.",
    image: asset("thumbs/wall-types/illusions-calcutta-vintage.png"),
    hasGrout: false,
    compatibleStyles: ["calcutta-vintage"],
    wallFolder: "marble",
  },
  {
    id: "illusions-calcutta-gold",
    name: "Illusions Calcutta Gold",
    description: "Printed marble — gold veining.",
    image: asset("thumbs/wall-types/illusions-calcutta-gold.png"),
    hasGrout: false,
    compatibleStyles: ["calcutta-gold"],
    wallFolder: "marble",
  },
  {
    id: "illusions-carrara",
    name: "Illusions Carrara",
    description: "Printed marble — soft grey-white.",
    image: asset("thumbs/wall-types/illusions-carrara.png"),
    hasGrout: false,
    compatibleStyles: ["carrara"],
    wallFolder: "marble",
  },
];

const style = (id: WallStyleId, name: string, group: WallStyle["group"], extra: Partial<WallStyle> = {}): WallStyle => ({
  id,
  name,
  group,
  image: asset(`thumbs/wall-styles/${id}.png`),
  ...extra,
});

export const wallStyles: WallStyle[] = [
  // marble / stone
  style("venatino", "Venatino", "marble"),
  style("calcutta", "Calcutta", "marble"),
  style("calcutta-vintage", "Calcutta Vintage", "marble"),
  style("calcutta-gold", "Calcutta Gold", "marble"),
  style("carrara", "Carrara Marble", "marble"),
  style("white", "White", "stone"),
  style("sandstone", "Sandstone", "stone"),
  style("silverstone", "Silverstone", "stone"),
  style("limestone", "Limestone", "stone"),
  style("ridgestone", "Ridgestone", "stone"),
  // subway patterns
  style("3x6", "3x6 Subway", "subway", { groutPattern: "3x6" }),
  style("3x6-vertical", "3x6 Vertical", "subway", { groutPattern: "3x6-vertical" }),
  style("6x12", "6x12 Subway", "subway", { groutPattern: "6x12" }),
  style("6x12-vertical", "6x12 Vertical", "subway", { groutPattern: "6x12-vertical" }),
  style("6x24", "6x24 Subway", "subway", { groutPattern: "6x24" }),
  style("12x24", "12x24 Subway", "subway", { groutPattern: "12x24" }),
  style("12x24-vertical", "12x24 Vertical", "subway", { groutPattern: "12x24-vertical" }),
  // decorative patterns
  style("trendz", "Trendz", "decorative", { groutPattern: "trendz" }),
  style("herringbone", "Herringbone", "decorative", { groutPattern: "herringbone" }),
  style("hexagon", "Hexagon", "decorative", { groutPattern: "hexagon" }),
];

export const WALL_STYLE_GROUP_LABELS: Record<WallStyle["group"], string> = {
  marble: "Marble",
  stone: "Stone",
  subway: "Subway Tile Patterns",
  decorative: "Decorative Patterns",
};

/* ── Step 5 ── */
export const groutColors: GroutColor[] = [
  { id: "black", name: "Black Grout", description: "High contrast, defines every tile.", image: asset("thumbs/grout/black.png"), swatch: "#1d1d1d" },
  { id: "silver", name: "Silver Grout", description: "Soft lines, lets the tile lead.", image: asset("thumbs/grout/silver.png"), swatch: "#c8ccd0" },
];

/** Grout defaults to this the moment a grout-compatible wall is chosen. */
export const DEFAULT_GROUT: GroutColor["id"] = "silver";

/* ── Step 6 ── */
export const doorTypes: DoorType[] = [
  { id: "none", name: "No Door", description: "Open entry or a curtain.", image: asset("thumbs/doors/none.png") },
  {
    id: "sliding-glass",
    name: "Sliding Glass Door",
    description: "Bypass glass on a top rail.",
    image: asset("thumbs/doors/sliding-glass.png"),
    layerByTrim: byTrim((t) => `doors/sliding-glass-${t}.png`),
  },
];

/* ── Step 7 ── */
export const trimColors: TrimColor[] = [
  { id: "chrome", name: "Chrome", description: "Polished, bright.", image: asset("thumbs/trim/chrome.png"), swatch: "#c7ced4", fixturesLayer: asset("fixtures/chrome.png"), spoutLayer: asset("fixtures/tub-spout-chrome.png") },
  { id: "matte-black", name: "Matte Black", description: "Modern, high contrast.", image: asset("thumbs/trim/matte-black.png"), swatch: "#2a2a2a", fixturesLayer: asset("fixtures/matte-black.png"), spoutLayer: asset("fixtures/tub-spout-matte-black.png") },
  { id: "brushed-nickel", name: "Brushed Nickel", description: "Warm, soft satin.", image: asset("thumbs/trim/brushed-nickel.png"), swatch: "#bdb6ac", fixturesLayer: asset("fixtures/brushed-nickel.png"), spoutLayer: asset("fixtures/tub-spout-brushed-nickel.png") },
];

/** Hardware layers need a finish even before the trim step — chrome until chosen. */
export const DEFAULT_HARDWARE_TRIM: TrimColorId = "chrome";

/* ── Step 8 ── */
export const storageOptions: StorageOption[] = [
  { id: "none", name: "None", description: "Keep the walls clear.", image: asset("thumbs/storage/none.png") },
  { id: "glass-shelf", name: "Glass Shelf", description: "One clear corner shelf.", image: asset("thumbs/storage/glass-shelf.png"), layer: asset("storage/glass-shelf.png") },
  { id: "single-shelf", name: "Single Shelf", description: "One matching corner shelf.", image: asset("thumbs/storage/single-shelf.png"), layer: asset("storage/single-shelf.png") },
  { id: "three-tier", name: "Three-Tier Caddy", description: "Three corner shelves.", image: asset("thumbs/storage/three-tier.png"), layer: asset("storage/three-tier.png") },
  { id: "tower-caddy", name: "Tower Caddy", description: "Full-height corner tower.", image: asset("thumbs/storage/tower-caddy.png"), layer: asset("storage/tower-caddy.png") },
];

/* ── Step 9 ── */
export const accentOptions: AccentOption[] = [
  { id: "none", name: "No Accent", description: "Plain wall, no band.", image: asset("thumbs/accent/none.png"), value: false },
  { id: "accent", name: "Add Accent", description: "Decorative mosaic band.", image: asset("thumbs/accent/accent.png"), value: true, layer: asset("accents/decorative-accent.png") },
];

/* ── Step 10 ── */
export const windowOptions: WindowOption[] = [
  { id: "none", name: "No Window", description: "Solid back wall.", image: asset("thumbs/windows/none.png") },
  { id: "acrylic-window", name: "Acrylic Window", description: "Frosted acrylic block window.", image: asset("thumbs/windows/acrylic-window.png"), layer: asset("windows/acrylic-window.png") },
];

/* ── Step 11 ── */
export const safetyOptions: SafetyOption[] = [
  { id: "none", name: "None", description: "No safety hardware.", image: asset("thumbs/safety/none.png") },
  { id: "grab-bar", name: "Grab Bar", description: "Wall-mounted support bar.", image: asset("thumbs/safety/grab-bar.png"), layerByTrim: byTrim((t) => `safety/grab-bar-${t}.png`) },
  { id: "safety-shelf", name: "Safety Shelf", description: "Corner shelf rated as a support.", image: asset("thumbs/safety/safety-shelf.png"), layer: asset("safety/safety-shelf.png") },
];

/* ── The walkthrough ── */
export const steps: StepDefinition[] = [
  { id: "bathroom-type", title: "Bathroom Type", heading: "Choose Your Bathroom Type", description: "Start with the fixture the room is built around.", field: "bathroomType" },
  { id: "room", title: "Room", heading: "Choose Room Environment", description: "The room around the bathroom — pick the one closest to the customer's space.", field: "roomTheme" },
  { id: "wall-type", title: "Bathwall Type", heading: "Choose Bathwall Type", description: "The panel system. This decides which wall designs are available next.", field: "wallType" },
  { id: "wall-style", title: "Wall Design", heading: "Choose Your Wall Design", description: "Colour, stone or pattern for the panels.", field: "wallStyle" },
  { id: "grout", title: "Grout Color", heading: "Choose Grout Color", description: "Only for tile patterns — smooth and printed panels have no grout.", field: "groutColor" },
  { id: "door", title: "Shower Door", heading: "Choose Door Style", description: "A glass door or an open entry.", field: "doorType" },
  { id: "trim", title: "Hardware Finish", heading: "Choose Hardware Finish", description: "Shower head, valve, spout, door rail and grab bar all take this finish.", field: "trimColor" },
  { id: "storage", title: "Storage", heading: "Add Storage", description: "Shelving and caddies inside the shower.", field: "storageOption" },
  { id: "accent", title: "Decorative Accent", heading: "Decorative Accent", description: "A decorative band across the wall panels.", field: "decorativeAccent" },
  { id: "window", title: "Window", heading: "Window Option", description: "Add a frosted acrylic window to the back wall.", field: "windowOption" },
  { id: "safety", title: "Safety", heading: "Safety & Accessibility", description: "Support hardware for confident, independent use.", field: "safetyOption" },
];
