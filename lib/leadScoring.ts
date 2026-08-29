import type {
  HomeownerStatus,
  LeadPriority,
  ProjectTimeline,
  ProjectType,
} from "./types";

/** Points awarded per answer, per the lead-qualification rules. */
const HOMEOWNER_POINTS: Record<HomeownerStatus, number> = {
  yes: 20,
  no: 0,
};

const TIMELINE_POINTS: Record<ProjectTimeline, number> = {
  "asap": 20,
  "within-1-month": 15,
  "1-3-months": 10,
  "just-researching": 5,
};

const PROJECT_POINTS: Record<ProjectType, number> = {
  "full-bathroom-remodel": 20,
  "shower-remodel": 15,
  "tub-to-shower-conversion": 15,
  "walk-in-shower": 15,
  "bathroom-safety-upgrade": 10,
};

export interface LeadScore {
  score: number;
  priority: LeadPriority;
}

export function scoreLead(input: {
  homeowner: HomeownerStatus | null;
  timeline: ProjectTimeline | null;
  projectType: ProjectType | null;
}): LeadScore {
  const score =
    (input.homeowner ? HOMEOWNER_POINTS[input.homeowner] : 0) +
    (input.timeline ? TIMELINE_POINTS[input.timeline] : 0) +
    (input.projectType ? PROJECT_POINTS[input.projectType] : 0);

  const priority: LeadPriority =
    score >= 40 ? "High Priority" : score >= 25 ? "Medium Priority" : "Low Priority";

  return { score, priority };
}
