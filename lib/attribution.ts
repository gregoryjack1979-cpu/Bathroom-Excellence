import type { AttributionFields } from "./types";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  LEAD ATTRIBUTION
 *  Remembers how a visitor arrived so the CRM can tie a signed job back to the
 *  ad that produced it.
 *
 *  Google Ads reporting stops at the conversion — it knows a form was filled,
 *  never whether the job sold. Answering "which campaign actually made money"
 *  means joining Google's click to the CRM record, and the click identifier is
 *  what makes that join possible. It is captured on the landing page, kept
 *  while the visitor browses, and sent with the lead.
 *
 *  Sending the click identifier back to Google alongside the sale value is also
 *  what lets bidding optimise toward revenue instead of form fills.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Click identifiers Google appends to landing page URLs when auto-tagging is on. */
const CLICK_ID_PARAMS = [
  "gclid", // Google Ads
  "gbraid", // Google Ads, iOS app-to-web
  "wbraid", // Google Ads, iOS web-to-app
  "msclkid", // Microsoft Advertising
  "fbclid", // Meta
] as const;

/** Campaign parameters, for traffic that isn't from Google Ads. */
const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export type ClickIdParam = (typeof CLICK_ID_PARAMS)[number];
export type UtmParam = (typeof UTM_PARAMS)[number];

export interface Attribution {
  /** e.g. { gclid: "Cj0KCQ…" } — usually one, occasionally none. */
  clickIds: Partial<Record<ClickIdParam, string>>;
  utm: Partial<Record<UtmParam, string>>;
  /** Referring site on the visit that first captured this, "" for direct traffic. */
  referrer: string;
  /** Landing page path, so we know which page won the click. */
  landingPage: string;
  /** ISO timestamp of first capture. */
  capturedAt: string;
}

const STORAGE_KEY = "be.attribution";

/**
 * How long a stored attribution stays valid. Google's click-through conversion
 * window on these actions is 90 days, and a bathroom remodel is a slow decision
 * — someone may research in March and sign in May — so anything shorter would
 * drop real attribution.
 */
const MAX_AGE_DAYS = 90;

/** Reading storage throws in some privacy modes; never let that break the page. */
function safeRead(): Attribution | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Attribution;
    if (!parsed?.capturedAt) return null;
    const ageMs = Date.now() - new Date(parsed.capturedAt).getTime();
    if (!Number.isFinite(ageMs) || ageMs > MAX_AGE_DAYS * 86_400_000) return null;
    return parsed;
  } catch {
    return null;
  }
}

function safeWrite(value: Attribution): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* private browsing, storage disabled, quota — attribution is best-effort */
  }
}

/**
 * Capture attribution from the current URL, if it carries any. Call once per
 * page load; it is cheap and idempotent.
 *
 * A visit carrying a click identifier always overwrites what was stored: the
 * most recent paid click is the one that should get credit, and it is also the
 * one Google will accept an offline conversion against. A visit with no
 * identifiers leaves any existing record alone, so browsing the site doesn't
 * erase how the visitor originally arrived.
 */
export function captureAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const clickIds: Partial<Record<ClickIdParam, string>> = {};
  for (const key of CLICK_ID_PARAMS) {
    const value = params.get(key)?.trim();
    if (value) clickIds[key] = value;
  }
  const utm: Partial<Record<UtmParam, string>> = {};
  for (const key of UTM_PARAMS) {
    const value = params.get(key)?.trim();
    if (value) utm[key] = value;
  }

  const hasClickId = Object.keys(clickIds).length > 0;
  const hasUtm = Object.keys(utm).length > 0;
  const existing = safeRead();

  // Nothing to record on this visit — keep whatever brought them here first.
  if (!hasClickId && !hasUtm) return existing;

  // A campaign visit with no click identifier shouldn't overwrite a real one.
  if (!hasClickId && existing && Object.keys(existing.clickIds).length > 0) return existing;

  const captured: Attribution = {
    clickIds,
    utm,
    referrer: typeof document === "undefined" ? "" : document.referrer || "",
    landingPage: window.location.pathname,
    capturedAt: new Date().toISOString(),
  };
  safeWrite(captured);
  return captured;
}

/** The stored attribution, or null when there is none (direct or organic traffic). */
export function getAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  return safeRead();
}

/**
 * Flatten attribution into the webhook payload's shape: one key per identifier,
 * so CRM field mapping stays a drag-and-drop job rather than JSON parsing.
 * Absent values are omitted entirely rather than sent as empty strings.
 */
export function attributionFields(attribution: Attribution | null): AttributionFields {
  if (!attribution) return {};
  // Keys come from CLICK_ID_PARAMS / UTM_PARAMS, which are exactly the optional
  // keys of AttributionFields, so the assembled object satisfies it by
  // construction — assert once here rather than branch per field.
  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(attribution.clickIds)) if (value) fields[key] = value;
  for (const [key, value] of Object.entries(attribution.utm)) if (value) fields[key] = value;
  if (attribution.referrer) fields.referrer = attribution.referrer;
  if (attribution.landingPage) fields.landingPage = attribution.landingPage;
  if (attribution.capturedAt) fields.attributionCapturedAt = attribution.capturedAt;
  return fields as AttributionFields;
}
