/**
 * Bathroom Design Builder — the preview engine's layer resolver.
 *
 * Turns a Configuration into an ordered list of image slots. The component
 * that renders it (BathroomPreview) knows nothing about bathrooms; it just
 * stacks whatever comes back by zIndex and cross-fades slots whose src changed.
 *
 * To add a product category: give it a slot here with a zIndex between its
 * neighbours, and a layer image on the shared canvas. Nothing else changes.
 */
import {
  DEFAULT_HARDWARE_TRIM,
  accentOptions,
  asset,
  bathroomTypes,
  doorTypes,
  roomThemes,
  safetyOptions,
  storageOptions,
  trimColors,
  wallStyles,
  wallTypes,
  windowOptions,
} from "./configuratorData";
import type { Configuration, PreviewLayer, RoomThemeId } from "./types";

/** Every layer image is authored on this canvas. */
export const PREVIEW_WIDTH = 1600;
export const PREVIEW_HEIGHT = 1200;

/** Shown behind an empty design so the canvas is never blank. */
export const FALLBACK_ROOM: RoomThemeId = "grey";

export function resolvePreviewLayers(config: Configuration): PreviewLayer[] {
  const room = roomThemes.find((r) => r.id === (config.roomTheme ?? FALLBACK_ROOM));
  const bathroomType = bathroomTypes.find((b) => b.id === config.bathroomType);
  const wallType = wallTypes.find((w) => w.id === config.wallType);
  const wallStyle = wallStyles.find((s) => s.id === config.wallStyle);
  const trim = trimColors.find((t) => t.id === config.trimColor);
  const hardwareTrim = trim?.id ?? DEFAULT_HARDWARE_TRIM;
  const door = doorTypes.find((d) => d.id === config.doorType);
  const storage = storageOptions.find((s) => s.id === config.storageOption);
  const accent = accentOptions.find((a) => a.value === config.decorativeAccent);
  const window_ = windowOptions.find((w) => w.id === config.windowOption);
  const safety = safetyOptions.find((s) => s.id === config.safetyOption);

  const wallSrc =
    wallType && wallStyle && wallType.compatibleStyles.includes(wallStyle.id)
      ? (wallType.fixedWallImage ?? asset(`walls/${wallType.wallFolder}/${wallStyle.id}.png`))
      : null;

  const groutPattern = wallType?.hasGrout ? (wallType.groutPattern ?? wallStyle?.groutPattern ?? null) : null;
  const groutSrc = groutPattern && config.groutColor ? asset(`walls/grout/${groutPattern}-${config.groutColor}.png`) : null;

  return [
    { id: "room", zIndex: 0, src: room?.background ?? null, label: "Room" },
    { id: "wall", zIndex: 10, src: wallSrc, label: "Wall panels" },
    { id: "grout", zIndex: 20, src: groutSrc, label: "Grout" },
    { id: "accent", zIndex: 30, src: accent?.layer ?? null, label: "Decorative accent" },
    { id: "window", zIndex: 40, src: window_?.layer ?? null, label: "Window" },
    { id: "base", zIndex: 50, src: bathroomType?.layer ?? null, label: "Bathroom base" },
    { id: "fixtures", zIndex: 60, src: trim?.fixturesLayer ?? null, label: "Fixtures" },
    { id: "spout", zIndex: 62, src: config.bathroomType === "bathtub" && trim ? trim.spoutLayer : null, label: "Tub spout" },
    { id: "storage", zIndex: 70, src: storage?.layer ?? null, label: "Storage" },
    { id: "safety", zIndex: 80, src: safety?.layerByTrim?.[hardwareTrim] ?? safety?.layer ?? null, label: "Safety hardware" },
    { id: "door", zIndex: 90, src: door?.layerByTrim?.[hardwareTrim] ?? null, label: "Shower door" },
  ];
}
