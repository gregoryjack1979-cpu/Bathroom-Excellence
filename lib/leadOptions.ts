import type {
  DesiredFeature,
  HomeownerStatus,
  ProjectTimeline,
  ProjectType,
  ShowerProblem,
} from "./types";

/** Display labels for every form option — single source for steps, summaries and payloads. */

export const PROJECT_TYPE_OPTIONS: { value: ProjectType; label: string }[] = [
  { value: "shower-remodel", label: "Shower Remodel" },
  { value: "tub-to-shower-conversion", label: "Tub-to-Shower Conversion" },
  { value: "walk-in-shower", label: "Walk-In Shower" },
  { value: "full-bathroom-remodel", label: "Full Bathroom Remodel" },
  { value: "bathroom-safety-upgrade", label: "Bathroom Safety Upgrade" },
];

export const PROBLEM_OPTIONS: { value: ShowerProblem; label: string }[] = [
  { value: "mold-or-mildew", label: "Mold or mildew" },
  { value: "damaged-tiles", label: "Damaged tiles" },
  { value: "leaks", label: "Leaks" },
  { value: "broken-shower-door", label: "Broken shower door" },
  { value: "difficult-access", label: "Difficult to enter or exit" },
  { value: "outdated-design", label: "Outdated design" },
  { value: "want-to-upgrade", label: "I simply want to upgrade" },
];

export const FEATURE_OPTIONS: { value: DesiredFeature; label: string }[] = [
  { value: "walk-in-shower", label: "Walk-in shower" },
  { value: "seating", label: "Seating" },
  { value: "grab-bars", label: "Grab bars" },
  { value: "storage", label: "Storage" },
  { value: "glass-doors", label: "Glass doors" },
  { value: "new-shower-walls", label: "New shower walls" },
  { value: "other", label: "Other" },
];

export const TIMELINE_OPTIONS: { value: ProjectTimeline; label: string }[] = [
  { value: "asap", label: "As soon as possible" },
  { value: "within-1-month", label: "Within 1 month" },
  { value: "1-3-months", label: "Within 1–3 months" },
  { value: "just-researching", label: "Just researching" },
];

export const HOMEOWNER_OPTIONS: { value: HomeownerStatus; label: string }[] = [
  { value: "yes", label: "Yes, I own my home" },
  { value: "no", label: "No, I'm not the homeowner" },
];

export function labelFor<T extends string>(
  options: { value: T; label: string }[],
  value: T | null,
): string {
  return options.find((o) => o.value === value)?.label ?? "";
}
