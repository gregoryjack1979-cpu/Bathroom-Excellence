/**
 * Bathroom Design Builder — shared types.
 *
 * Option ids are string unions so a typo in data or a component is a compile
 * error, and so the export/localStorage format stays stable.
 */

export type BathroomTypeId = "shower" | "bathtub" | "seated-shower";
export type RoomThemeId = "blue" | "green" | "grey";
export type WallTypeId =
  | "smooth"
  | "tile-12x12"
  | "tile-11x20"
  | "subway"
  | "illusions-white"
  | "illusions-venatino"
  | "illusions-calcutta"
  | "illusions-calcutta-vintage"
  | "illusions-calcutta-gold"
  | "illusions-carrara";
export type WallStyleId =
  // marble / stone
  | "venatino"
  | "calcutta"
  | "calcutta-vintage"
  | "calcutta-gold"
  | "carrara"
  | "white"
  | "sandstone"
  | "silverstone"
  | "limestone"
  | "ridgestone"
  // subway patterns
  | "3x6"
  | "3x6-vertical"
  | "6x12"
  | "6x12-vertical"
  | "6x24"
  | "12x24"
  | "12x24-vertical"
  // decorative patterns
  | "trendz"
  | "herringbone"
  | "hexagon";
export type GroutColorId = "black" | "silver";
export type DoorTypeId = "none" | "sliding-glass";
export type TrimColorId = "chrome" | "matte-black" | "brushed-nickel";
export type StorageOptionId = "none" | "glass-shelf" | "single-shelf" | "three-tier" | "tower-caddy";
export type AccentOptionId = "none" | "accent";
export type WindowOptionId = "none" | "acrylic-window";
export type SafetyOptionId = "none" | "grab-bar" | "safety-shelf";

/**
 * The single source of truth for a design. `null` means "not chosen yet";
 * the literal id "none" is a deliberate choice of nothing (so a step can be
 * complete without adding anything).
 */
export interface Configuration {
  bathroomType: BathroomTypeId | null;
  roomTheme: RoomThemeId | null;
  wallType: WallTypeId | null;
  wallStyle: WallStyleId | null;
  groutColor: GroutColorId | null;
  doorType: DoorTypeId | null;
  trimColor: TrimColorId | null;
  storageOption: StorageOptionId | null;
  decorativeAccent: boolean | null;
  windowOption: WindowOptionId | null;
  safetyOption: SafetyOptionId | null;
}

export type ConfigurationField = keyof Configuration;

/** Everything an option card needs to render itself. */
export interface BaseOption<Id extends string = string> {
  id: Id;
  name: string;
  description?: string;
  /** Thumbnail shown on the option card */
  image: string;
}

export interface BathroomType extends BaseOption<BathroomTypeId> {
  /** Preview layer: the pan / tub / seat */
  layer: string;
}

export interface RoomTheme extends BaseOption<RoomThemeId> {
  /** Full-canvas preview background */
  background: string;
}

export type WallFolder = "smooth" | "tile" | "subway" | "marble";

export interface WallType extends BaseOption<WallTypeId> {
  /** Whether grout colour applies to this wall type */
  hasGrout: boolean;
  /** Which wall styles may be chosen with this type (parent → child rule) */
  compatibleStyles: WallStyleId[];
  /** Folder under /assets/walls the wall layer is read from */
  wallFolder: WallFolder;
  /** A single fixed wall image regardless of style (subway uses one white tile field) */
  fixedWallImage?: string;
  /** A fixed grout pattern for this type (12x12 / 11x20); subway takes it from the style */
  groutPattern?: string;
}

export type WallStyleGroup = "stone" | "marble" | "subway" | "decorative";

export interface WallStyle extends BaseOption<WallStyleId> {
  group: WallStyleGroup;
  /** Grout line pattern drawn over the wall (subway + decorative styles) */
  groutPattern?: string;
}

export interface GroutColor extends BaseOption<GroutColorId> {
  swatch: string;
}

export interface DoorType extends BaseOption<DoorTypeId> {
  /** Preview layer per hardware finish — the rail and handle take the trim colour */
  layerByTrim?: Record<TrimColorId, string>;
}

export interface TrimColor extends BaseOption<TrimColorId> {
  swatch: string;
  /** Shower head + valve layer */
  fixturesLayer: string;
  /** Tub spout layer (bathtub only) */
  spoutLayer: string;
}

export interface StorageOption extends BaseOption<StorageOptionId> {
  layer?: string;
}

export interface AccentOption extends BaseOption<AccentOptionId> {
  value: boolean;
  layer?: string;
}

export interface WindowOption extends BaseOption<WindowOptionId> {
  layer?: string;
}

export interface SafetyOption extends BaseOption<SafetyOptionId> {
  layer?: string;
  /** Hardware (grab bar) follows the trim finish */
  layerByTrim?: Record<TrimColorId, string>;
}

export type StepId =
  | "bathroom-type"
  | "room"
  | "wall-type"
  | "wall-style"
  | "grout"
  | "door"
  | "trim"
  | "storage"
  | "accent"
  | "window"
  | "safety";

export interface StepDefinition {
  id: StepId;
  /** Short label for the step list and summary */
  title: string;
  /** Heading shown above the options */
  heading: string;
  description: string;
  field: ConfigurationField;
}

/**
 * Every step starts with a value (the starting design), so progress tracks
 * which steps the user has actually looked at.
 */
export type StepStatus = "reviewed" | "pending" | "not-applicable";

/** What we write to localStorage and to the exported file. */
export interface SavedDesign {
  version: 1;
  savedAt: string;
  configuration: Configuration;
}

/** One image slot in the layered preview. `src: null` hides the slot. */
export interface PreviewLayer {
  id: string;
  zIndex: number;
  src: string | null;
  label: string;
}
