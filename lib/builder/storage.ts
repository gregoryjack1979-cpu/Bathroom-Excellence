/**
 * Bathroom Design Builder — local persistence and export.
 *
 * Two localStorage records:
 *   bathroomConfiguration        the design the user explicitly saved
 *   bathroomConfiguration:draft  autosaved working copy, offered back on reload
 *
 * Everything is wrapped so a blocked or full storage never breaks the app.
 * A server-side store (shareable links, CRM hand-off) would replace the
 * functions in this file and nothing else.
 */
import { steps } from "./configuratorData";
import { CONFIGURATION_FIELDS, DEFAULT_CONFIGURATION, describeConfiguration, describeSelection, groutApplies, normalizeConfiguration } from "./rules";
import type { Configuration, SavedDesign } from "./types";

export const SAVED_KEY = "bathroomConfiguration";
export const DRAFT_KEY = "bathroomConfiguration:draft";

const storage = (): Storage | null => {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
};

/** Accepts anything, returns a valid Configuration or null. */
export function parseConfiguration(raw: unknown): Configuration | null {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;
  const config = { ...DEFAULT_CONFIGURATION } as Record<string, unknown>;
  for (const field of CONFIGURATION_FIELDS) {
    const v = source[field];
    if (v === null || typeof v === "string" || typeof v === "boolean") config[field] = v ?? null;
  }
  return normalizeConfiguration(config as unknown as Configuration);
}

function read(key: string): SavedDesign | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedDesign>;
    const configuration = parseConfiguration(parsed.configuration);
    if (!configuration) return null;
    return { version: 1, savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : new Date(0).toISOString(), configuration };
  } catch {
    return null;
  }
}

function write(key: string, configuration: Configuration): SavedDesign | null {
  const s = storage();
  if (!s) return null;
  const record: SavedDesign = { version: 1, savedAt: new Date().toISOString(), configuration };
  try {
    s.setItem(key, JSON.stringify(record));
    return record;
  } catch {
    return null;
  }
}

function remove(key: string) {
  try {
    storage()?.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const saveDesign = (c: Configuration) => write(SAVED_KEY, c);
export const loadSavedDesign = () => read(SAVED_KEY);
export const hasSavedDesign = () => read(SAVED_KEY) !== null;

export const saveDraft = (c: Configuration) => write(DRAFT_KEY, c);
export const loadDraft = () => read(DRAFT_KEY);
export const clearDraft = () => remove(DRAFT_KEY);

/* ── export ── */

export interface DesignExport {
  app: "Bathroom Design Builder";
  version: 1;
  exportedAt: string;
  summary: string;
  /** Human-readable, in walkthrough order */
  design: Record<string, string>;
  /** Raw ids — what an integration would map to SKUs */
  selections: Configuration;
}

export function buildExport(config: Configuration): DesignExport {
  const design: Record<string, string> = {};
  for (const step of steps) {
    const value = describeSelection(config, step.field);
    design[step.field] =
      value ?? (step.id === "grout" && !groutApplies(config) ? "Not applicable" : "Not chosen");
  }
  return {
    app: "Bathroom Design Builder",
    version: 1,
    exportedAt: new Date().toISOString(),
    summary: describeConfiguration(config),
    design,
    selections: config,
  };
}

/** Trigger a browser download of `data` as pretty-printed JSON. */
export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const exportFilename = () => `bathroom-design-${new Date().toISOString().slice(0, 10)}.json`;
