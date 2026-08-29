import { siteConfig } from "@/config/site";
import { scoreLead } from "./leadScoring";
import {
  FEATURE_OPTIONS,
  HOMEOWNER_OPTIONS,
  labelFor,
  PROBLEM_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  TIMELINE_OPTIONS,
} from "./leadOptions";
import type { LeadFormData, LeadPayload } from "./types";

/** Build the flat, integration-friendly webhook payload from raw form state. */
export function buildLeadPayload(data: LeadFormData): LeadPayload {
  const { score, priority } = scoreLead(data);
  return {
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    phone: data.phone.trim(),
    email: data.email.trim(),
    address: data.address.trim(),
    zipCode: data.zip.trim(),
    projectType: labelFor(PROJECT_TYPE_OPTIONS, data.projectType),
    currentShowerProblems: data.problems.map((p) => labelFor(PROBLEM_OPTIONS, p)),
    desiredFeatures: data.features.map((f) => labelFor(FEATURE_OPTIONS, f)),
    projectTimeline: labelFor(TIMELINE_OPTIONS, data.timeline),
    homeownerStatus: labelFor(HOMEOWNER_OPTIONS, data.homeowner),
    leadSource: siteConfig.leadSource,
    leadScore: score,
    leadPriority: priority,
    submissionDate: new Date().toISOString(),
    page: typeof window !== "undefined" ? window.location.pathname : "/",
  };
}

export interface SubmitResult {
  ok: boolean;
  payload: LeadPayload;
  error?: string;
}

/**
 * POSTs the lead to NEXT_PUBLIC_WEBHOOK_URL (Zapier, Make.com, n8n,
 * GoHighLevel or any custom endpoint). When the env var is unset, the payload
 * is logged to the console and treated as a success so the site works in demos
 * and local development without any backend.
 */
export async function submitLead(data: LeadFormData): Promise<SubmitResult> {
  const payload = buildLeadPayload(data);
  const url = process.env.NEXT_PUBLIC_WEBHOOK_URL;

  if (!url) {
    console.info("[lead] NEXT_PUBLIC_WEBHOOK_URL not set — payload:", payload);
    return { ok: true, payload };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) {
      return { ok: false, payload, error: `Request failed (${res.status})` };
    }
    return { ok: true, payload };
  } catch {
    return { ok: false, payload, error: "Network error — please try again." };
  } finally {
    clearTimeout(timer);
  }
}
