import type { LeadFormData } from "./types";

export interface StepValidation {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<keyof LeadFormData, string>>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Per-step gate for the wizard's Continue action. */
export function validateStep(step: number, data: LeadFormData): StepValidation {
  switch (step) {
    case 0:
      return data.projectType
        ? { ok: true }
        : { ok: false, message: "Please choose the project you have in mind." };
    case 1:
      return data.problems.length > 0
        ? { ok: true }
        : { ok: false, message: "Select at least one issue — or “I simply want to upgrade.”" };
    case 2:
      return data.features.length > 0
        ? { ok: true }
        : { ok: false, message: "Pick at least one feature you'd like (or “Other”)." };
    case 3:
      return data.timeline
        ? { ok: true }
        : { ok: false, message: "Let us know your rough timeline." };
    case 4:
      return data.homeowner
        ? { ok: true }
        : { ok: false, message: "Please tell us if you own the home." };
    case 5: {
      const fieldErrors: StepValidation["fieldErrors"] = {};
      if (!data.firstName.trim()) fieldErrors.firstName = "First name is required.";
      if (!data.lastName.trim()) fieldErrors.lastName = "Last name is required.";
      if (data.phone.replace(/\D/g, "").length < 10) fieldErrors.phone = "Enter a 10-digit phone number.";
      if (!EMAIL_RE.test(data.email.trim())) fieldErrors.email = "Enter a valid email address.";
      if (!/^\d{5}(-\d{4})?$/.test(data.zip.trim())) fieldErrors.zip = "Enter a 5-digit ZIP code.";
      return Object.keys(fieldErrors).length
        ? { ok: false, fieldErrors, message: "Please fix the highlighted fields." }
        : { ok: true };
    }
    default:
      return { ok: true };
  }
}

export const EMPTY_LEAD: LeadFormData = {
  projectType: null,
  problems: [],
  features: [],
  timeline: null,
  homeowner: null,
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  zip: "",
  address: "",
};
