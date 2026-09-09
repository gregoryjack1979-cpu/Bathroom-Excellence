/** Shared domain types for the lead pipeline, gallery and services. */

export type ProjectType =
  | "shower-remodel"
  | "tub-to-shower-conversion"
  | "walk-in-shower"
  | "full-bathroom-remodel"
  | "bathroom-safety-upgrade";

export type ShowerProblem =
  | "mold-or-mildew"
  | "damaged-tiles"
  | "leaks"
  | "broken-shower-door"
  | "difficult-access"
  | "outdated-design"
  | "want-to-upgrade";

export type DesiredFeature =
  | "walk-in-shower"
  | "seating"
  | "grab-bars"
  | "storage"
  | "glass-doors"
  | "new-shower-walls"
  | "other";

export type ProjectTimeline =
  | "asap"
  | "within-1-month"
  | "1-3-months"
  | "just-researching";

export type HomeownerStatus = "yes" | "no";

export type LeadPriority = "High Priority" | "Medium Priority" | "Low Priority";

/** Raw multi-step form state. */
export interface LeadFormData {
  projectType: ProjectType | null;
  problems: ShowerProblem[];
  features: DesiredFeature[];
  timeline: ProjectTimeline | null;
  homeowner: HomeownerStatus | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  zip: string;
  address: string;
}

/**
 * Webhook payload — flat, human-readable keys so it drops straight into
 * Zapier / Make.com / n8n / GoHighLevel field mapping.
 */
export interface LeadPayload extends AttributionFields {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  zipCode: string;
  projectType: string;
  currentShowerProblems: string[];
  desiredFeatures: string[];
  projectTimeline: string;
  homeownerStatus: string;
  leadSource: string;
  leadScore: number;
  leadPriority: LeadPriority;
  submissionDate: string;
  page: string;
}

/**
 * How the visitor arrived. Every field is optional — organic and direct traffic
 * carries none of them — and each is a flat key so CRM field mapping stays a
 * drag-and-drop job. The click identifiers are what let a signed job be traced
 * back to the campaign that produced it. See lib/attribution.ts.
 */
export interface AttributionFields {
  /** Google Ads click identifier, appended to landing URLs by auto-tagging. */
  gclid?: string;
  /** Google Ads, iOS app-to-web journeys. */
  gbraid?: string;
  /** Google Ads, iOS web-to-app journeys. */
  wbraid?: string;
  msclkid?: string;
  fbclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landingPage?: string;
  attributionCapturedAt?: string;
}

export type GalleryCategory =
  | "popular"
  | "walk-in"
  | "multi-piece"
  | "alcove"
  | "modern"
  | "full-bath";

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: GalleryCategory;
  /** Which SVG scene variant renders this item (until a photo slot is mapped). */
  variant: number;
}

export interface ServiceInfo {
  slug: string;
  navLabel: string;
  title: string;
  heroHeadline: string;
  intro: string;
  /** Optional heading rendered above the bullets grid */
  bulletsHeading?: { title: string; subtitle: string };
  bullets: { title: string; body: string }[];
  closing: string;
  /** Optional photo CTA band rendered before the estimate form */
  ctaBand?: { title: string; subtitle: string };
}
