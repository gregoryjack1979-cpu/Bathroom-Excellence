/**
 * Bathroom Design Builder — compatibility rules and derived state.
 *
 * Pure functions over a Configuration. `normalizeConfiguration` is the one
 * place incompatible values get reset, and the store runs it after every
 * change — so no component ever has to remember a rule.
 */
import {
  DEFAULT_GROUT,
  accentOptions,
  bathroomTypes,
  doorTypes,
  groutColors,
  roomThemes,
  safetyOptions,
  steps,
  storageOptions,
  trimColors,
  wallStyles,
  wallTypes,
  windowOptions,
} from "./configuratorData";
import type {
  Configuration,
  ConfigurationField,
  DoorTypeId,
  StepDefinition,
  StepId,
  StepStatus,
  WallStyle,
  WallType,
  WallTypeId,
} from "./types";

/**
 * The starting design — it is exactly what the room renders show, so the
 * preview and the state agree before anything is touched. (The in-home tool
 * opens the same way: smooth white walls, sliding door, chrome pre-selected.)
 */
export const DEFAULT_CONFIGURATION: Configuration = {
  bathroomType: "shower",
  roomTheme: "blue",
  wallType: "smooth",
  wallStyle: "white",
  groutColor: null,
  doorType: "sliding-glass",
  trimColor: "chrome",
  storageOption: "none",
  decorativeAccent: false,
  windowOption: "none",
  safetyOption: "none",
};

export const CONFIGURATION_FIELDS = Object.keys(DEFAULT_CONFIGURATION) as ConfigurationField[];

/** Fields that change what's inside the shower alcove (everything but the room). */
export const INTERIOR_FIELDS: ConfigurationField[] = CONFIGURATION_FIELDS.filter((f) => f !== "roomTheme");

export const findWallType = (id: WallTypeId | null): WallType | undefined =>
  id ? wallTypes.find((w) => w.id === id) : undefined;

/** Wall designs the chosen bathwall type allows (parent → child). */
export function compatibleWallStyles(wallTypeId: WallTypeId | null): WallStyle[] {
  const type = findWallType(wallTypeId);
  if (!type) return [];
  return wallStyles.filter((s) => type.compatibleStyles.includes(s.id));
}

/** Grout colour only applies to tile-patterned wall types. */
export const groutApplies = (config: Configuration): boolean =>
  findWallType(config.wallType)?.hasGrout ?? false;

/** A bathtub can't take a shower door. */
export const isDoorAllowed = (config: Configuration, door: DoorTypeId): boolean =>
  config.bathroomType !== "bathtub" || door === "none";

export const doorDisabledReason = (config: Configuration, door: DoorTypeId): string | null =>
  isDoorAllowed(config, door) ? null : "Not available with a bathtub";

/**
 * Resolve every cross-field rule. Safe to call repeatedly — the result is a
 * fixed point.
 *
 *  - no wall type            → no wall style, no grout
 *  - wall style not allowed  → cleared (or auto-picked when only one fits)
 *  - grout not applicable    → null;   applicable but unset → default
 *  - bathtub                 → door forced to "none"
 */
export function normalizeConfiguration(input: Configuration): Configuration {
  const config = { ...input };

  const type = findWallType(config.wallType);
  if (!type) {
    config.wallStyle = null;
  } else if (!config.wallStyle || !type.compatibleStyles.includes(config.wallStyle)) {
    config.wallStyle = type.compatibleStyles.length === 1 ? type.compatibleStyles[0] : null;
  }

  if (!groutApplies(config)) {
    config.groutColor = null;
  } else if (!config.groutColor) {
    config.groutColor = DEFAULT_GROUT;
  }

  if (config.bathroomType === "bathtub") {
    config.doorType = "none";
  }

  return config;
}

export const configurationsEqual = (a: Configuration, b: Configuration): boolean =>
  CONFIGURATION_FIELDS.every((f) => a[f] === b[f]);

/** True while nothing has been changed from the starting design. */
export const isDefaultConfiguration = (config: Configuration): boolean =>
  configurationsEqual(config, DEFAULT_CONFIGURATION);

/** True while the shower interior is still exactly the design the room renders show. */
export const interiorIsDefault = (config: Configuration): boolean =>
  INTERIOR_FIELDS.every((f) => config[f] === DEFAULT_CONFIGURATION[f]);

/** Steps that don't apply to the current design are skipped by Next/Back. */
export function isStepApplicable(config: Configuration, stepId: StepId): boolean {
  if (stepId === "grout") return groutApplies(config);
  return true;
}

export function getStepStatus(config: Configuration, step: StepDefinition, visited: ReadonlySet<StepId>): StepStatus {
  if (!isStepApplicable(config, step.id)) return "not-applicable";
  return visited.has(step.id) ? "reviewed" : "pending";
}

export const reviewedStepCount = (config: Configuration, visited: ReadonlySet<StepId>): number =>
  steps.filter((s) => getStepStatus(config, s, visited) === "reviewed").length;

export const applicableStepCount = (config: Configuration): number =>
  steps.filter((s) => isStepApplicable(config, s.id)).length;

/** Human-readable value for a field — for the summary panel and the export. */
export function describeSelection(config: Configuration, field: ConfigurationField): string | null {
  const value = config[field];
  if (value === null) return null;
  switch (field) {
    case "bathroomType":
      return bathroomTypes.find((o) => o.id === value)?.name ?? null;
    case "roomTheme":
      return roomThemes.find((o) => o.id === value)?.name ?? null;
    case "wallType":
      return wallTypes.find((o) => o.id === value)?.name ?? null;
    case "wallStyle":
      return wallStyles.find((o) => o.id === value)?.name ?? null;
    case "groutColor":
      return groutColors.find((o) => o.id === value)?.name ?? null;
    case "doorType":
      return doorTypes.find((o) => o.id === value)?.name ?? null;
    case "trimColor":
      return trimColors.find((o) => o.id === value)?.name ?? null;
    case "storageOption":
      return storageOptions.find((o) => o.id === value)?.name ?? null;
    case "decorativeAccent":
      return accentOptions.find((o) => o.value === value)?.name ?? null;
    case "windowOption":
      return windowOptions.find((o) => o.id === value)?.name ?? null;
    case "safetyOption":
      return safetyOptions.find((o) => o.id === value)?.name ?? null;
  }
}

/** One sentence describing the design — used as the preview's accessible name. */
export function describeConfiguration(config: Configuration): string {
  const parts: string[] = [];
  const type = describeSelection(config, "bathroomType");
  const room = describeSelection(config, "roomTheme");
  parts.push(type ? `${type}${room ? ` in the ${room}` : ""}` : room ? `Empty ${room}` : "Empty room");
  const wall = describeSelection(config, "wallStyle");
  const wallType = describeSelection(config, "wallType");
  if (wall) {
    // "Sandstone 12x12 Tile walls", but not "Calcutta Gold Illusions Calcutta Gold walls"
    const t = wallType && !wallType.toLowerCase().includes(wall.toLowerCase()) ? ` ${wallType}` : "";
    parts.push(`${wall}${t} walls`);
  }
  const grout = describeSelection(config, "groutColor");
  if (grout) parts.push(grout.toLowerCase());
  if (config.doorType === "sliding-glass") parts.push("sliding glass door");
  const trim = describeSelection(config, "trimColor");
  if (trim) parts.push(`${trim.toLowerCase()} hardware`);
  if (config.storageOption && config.storageOption !== "none") parts.push(describeSelection(config, "storageOption")!.toLowerCase());
  if (config.decorativeAccent) parts.push("decorative accent");
  if (config.windowOption === "acrylic-window") parts.push("acrylic window");
  if (config.safetyOption && config.safetyOption !== "none") parts.push(describeSelection(config, "safetyOption")!.toLowerCase());
  return parts.join(", ") + ".";
}
