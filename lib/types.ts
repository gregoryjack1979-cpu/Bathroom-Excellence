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
export interface LeadPayload {
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

export type GalleryCategory =
  | "popular"
  | "walk-in"
  | "multi-piece"
  | "alcove"
  | "modern";

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
  bullets: { title: string; body: string }[];
  closing: string;
}
