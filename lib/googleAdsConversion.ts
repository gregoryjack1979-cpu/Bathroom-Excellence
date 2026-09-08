/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  GOOGLE ADS CONVERSION TRACKING
 *  Reports a successful estimate request to Google Ads, so campaigns can bid
 *  toward leads instead of clicks.
 *
 *  The account already has one conversion action per service ("Submit lead form
 *  - Tub To Shower Pros", "- Walk In Shower", and so on), each expecting a
 *  manual event from the site. This maps the wizard's project type onto those
 *  actions so each lead lands in the right one and keeps its history.
 *
 *  Everything is env-driven and inert until configured — with no tag ID set,
 *  nothing loads and nothing fires. See docs/google-ads-api.md.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { LeadFormData, LeadPayload, ProjectType } from "./types";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Google tag ID, e.g. "AW-123456789". Empty disables conversion tracking entirely. */
export const googleAdsTagId = process.env.NEXT_PUBLIC_GOOGLE_ADS_TAG_ID?.trim() || "";

/**
 * Send hashed name / email / phone / ZIP alongside the conversion so Google can
 * match leads that its cookie alone would miss. Off unless explicitly enabled:
 * it shares customer contact details with Google, so the business must accept
 * Google's enhanced conversions terms and say so in its privacy policy first.
 */
export const enhancedConversionsEnabled =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ENHANCED_CONVERSIONS?.trim() === "true";

/** Parse a JSON object from an env var, warning rather than throwing on bad input. */
function parseJsonMap(raw: string | undefined, varName: string): Record<string, string> {
  if (!raw?.trim()) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    return parsed as Record<string, string>;
  } catch (err) {
    console.warn(`[google-ads] ${varName} is not valid JSON and was ignored:`, err);
    return {};
  }
}

/**
 * Conversion label per project type, plus a "default" fallback. Example:
 *   {"default":"AbC-1","shower-remodel":"AbC-2","walk-in-shower":"AbC-3"}
 * Labels come from the conversion action's tag setup in Google Ads, where the
 * snippet reads send_to: 'AW-…/<label>'.
 */
const conversionLabels = parseJsonMap(
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABELS,
  "NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABELS",
);

/**
 * Optional conversion value per project type, in dollars. Lets Google bid toward
 * the work worth having rather than counting every lead equally — a full remodel
 * enquiry is not worth the same as a grab-bar install. Without a value Google
 * falls back to the $1 default configured on the action.
 */
const conversionValues = parseJsonMap(
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_VALUES,
  "NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_VALUES",
);

/** The conversion label for a project type, falling back to the shared default. */
export function labelForProjectType(projectType: ProjectType | null): string {
  return conversionLabels[projectType ?? ""] || conversionLabels.default || "";
}

function valueForProjectType(projectType: ProjectType | null): number | undefined {
  const raw = conversionValues[projectType ?? ""] ?? conversionValues.default;
  const value = Number(raw);
  return raw !== undefined && Number.isFinite(value) ? value : undefined;
}

/** US phone digits to the E.164 form Google expects, or "" if it doesn't look valid. */
export function toE164(phone: string): string {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return "";
}

/**
 * Report one lead to Google Ads. Safe to call unconditionally: it returns
 * quietly when tracking is unconfigured, when gtag hasn't loaded, or when
 * there is no label for this project type.
 */
export function trackLeadConversion(data: LeadFormData, payload: LeadPayload): void {
  if (!googleAdsTagId || typeof window === "undefined") return;

  const label = labelForProjectType(data.projectType);
  if (!label) {
    console.warn(`[google-ads] no conversion label for project type "${data.projectType}" — not reported.`);
    return;
  }
  if (typeof window.gtag !== "function") {
    console.warn("[google-ads] gtag has not loaded — conversion not reported.");
    return;
  }

  try {
    if (enhancedConversionsEnabled) {
      // Google hashes these in the browser; raw values never leave the page.
      window.gtag("set", "user_data", {
        email: payload.email || undefined,
        phone_number: toE164(payload.phone) || undefined,
        address: {
          first_name: payload.firstName || undefined,
          last_name: payload.lastName || undefined,
          postal_code: payload.zipCode || undefined,
          country: "US",
        },
      });
    }

    const value = valueForProjectType(data.projectType);
    window.gtag("event", "conversion", {
      send_to: `${googleAdsTagId}/${label}`,
      ...(value !== undefined ? { value, currency: "USD" } : {}),
      // Lets a duplicate submission be de-duplicated against the same lead.
      transaction_id: `${payload.leadSource}-${payload.submissionDate}`,
    });
  } catch (err) {
    // Never let analytics break the form's success path.
    console.warn("[google-ads] conversion reporting failed:", err);
  }
}
