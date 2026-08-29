"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useReducer } from "react";
import clsx from "clsx";
import {
  FEATURE_OPTIONS,
  HOMEOWNER_OPTIONS,
  PROBLEM_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  TIMELINE_OPTIONS,
} from "@/lib/leadOptions";
import { submitLead } from "@/lib/submitLead";
import { EMPTY_LEAD, validateStep, type StepValidation } from "@/lib/validation";
import type { DesiredFeature, LeadFormData, LeadPayload, ShowerProblem } from "@/lib/types";
import { OptionCard } from "./OptionCard";
import { ProgressBar } from "./ProgressBar";
import { SuccessPanel } from "./SuccessPanel";
import { Button } from "@/components/ui/Button";

const TOTAL_STEPS = 6;

interface State {
  step: number;
  data: LeadFormData;
  phase: "form" | "submitting" | "success" | "error";
  validation: StepValidation | null;
  payload: LeadPayload | null;
  errorMessage: string | null;
}

type Action =
  | { type: "SET"; patch: Partial<LeadFormData> }
  | { type: "TOGGLE_PROBLEM"; value: ShowerProblem }
  | { type: "TOGGLE_FEATURE"; value: DesiredFeature }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "SUBMITTING" }
  | { type: "SUCCESS"; payload: LeadPayload }
  | { type: "FAIL"; message: string }
  | { type: "RETRY" };

const initialState: State = {
  step: 0,
  data: EMPTY_LEAD,
  phase: "form",
  validation: null,
  payload: null,
  errorMessage: null,
};

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET":
      return { ...state, data: { ...state.data, ...action.patch }, validation: null };
    case "TOGGLE_PROBLEM":
      return { ...state, validation: null, data: { ...state.data, problems: toggle(state.data.problems, action.value) } };
    case "TOGGLE_FEATURE":
      return { ...state, validation: null, data: { ...state.data, features: toggle(state.data.features, action.value) } };
    case "NEXT": {
      const validation = validateStep(state.step, state.data);
      if (!validation.ok) return { ...state, validation };
      return { ...state, step: Math.min(state.step + 1, TOTAL_STEPS - 1), validation: null };
    }
    case "BACK":
      return { ...state, step: Math.max(state.step - 1, 0), validation: null };
    case "SUBMITTING":
      return { ...state, phase: "submitting", errorMessage: null };
    case "SUCCESS":
      return { ...state, phase: "success", payload: action.payload };
    case "FAIL":
      return { ...state, phase: "error", errorMessage: action.message };
    case "RETRY":
      return { ...state, phase: "form" };
    default:
      return state;
  }
}

const stepTitles = [
  "What type of project are you interested in?",
  "What issues are you experiencing?",
  "What features are you interested in?",
  "When are you planning to start your project?",
  "Are you the homeowner?",
  "Where should we send your free estimate?",
];

function Field({
  id,
  label,
  error,
  ...input
}: { id: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={clsx(
          "w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-ink placeholder:text-body/50",
          "transition-colors focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/25",
          error ? "border-red-400" : "border-ink/15",
        )}
        {...input}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/** Six-step estimate wizard with scoring + webhook submission. */
export function LeadForm() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { step, data, phase, validation, payload } = state;
  const fieldErrors = validation?.fieldErrors ?? {};

  const selectAndAdvance = (patch: Partial<LeadFormData>) => {
    dispatch({ type: "SET", patch });
    // brief pause so the selection state is visible before sliding on
    window.setTimeout(() => dispatch({ type: "NEXT" }), 260);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validateStep(5, data);
    if (!v.ok) {
      dispatch({ type: "NEXT" }); // stores validation errors via reducer
      return;
    }
    dispatch({ type: "SUBMITTING" });
    const result = await submitLead(data);
    if (result.ok) dispatch({ type: "SUCCESS", payload: result.payload });
    else dispatch({ type: "FAIL", message: result.error ?? "Something went wrong." });
  };

  if (phase === "success" && payload) {
    return <SuccessPanel payload={payload} />;
  }

  return (
    <div>
      <ProgressBar step={step} total={TOTAL_STEPS} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 34 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -34 }}
          transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <h3 className="mb-5 font-display text-xl text-ink md:text-2xl">{stepTitles[step]}</h3>

          {step === 0 && (
            <div role="radiogroup" aria-label={stepTitles[0]} className="grid gap-3 sm:grid-cols-2">
              {PROJECT_TYPE_OPTIONS.map((o) => (
                <OptionCard
                  key={o.value}
                  label={o.label}
                  selected={data.projectType === o.value}
                  onSelect={() => selectAndAdvance({ projectType: o.value })}
                />
              ))}
            </div>
          )}

          {step === 1 && (
            <div role="group" aria-label={stepTitles[1]} className="grid gap-3 sm:grid-cols-2">
              {PROBLEM_OPTIONS.map((o) => (
                <OptionCard
                  key={o.value}
                  label={o.label}
                  multi
                  selected={data.problems.includes(o.value)}
                  onSelect={() => dispatch({ type: "TOGGLE_PROBLEM", value: o.value })}
                />
              ))}
            </div>
          )}

          {step === 2 && (
            <div role="group" aria-label={stepTitles[2]} className="grid gap-3 sm:grid-cols-2">
              {FEATURE_OPTIONS.map((o) => (
                <OptionCard
                  key={o.value}
                  label={o.label}
                  multi
                  selected={data.features.includes(o.value)}
                  onSelect={() => dispatch({ type: "TOGGLE_FEATURE", value: o.value })}
                />
              ))}
            </div>
          )}

          {step === 3 && (
            <div role="radiogroup" aria-label={stepTitles[3]} className="grid gap-3 sm:grid-cols-2">
              {TIMELINE_OPTIONS.map((o) => (
                <OptionCard
                  key={o.value}
                  label={o.label}
                  selected={data.timeline === o.value}
                  onSelect={() => selectAndAdvance({ timeline: o.value })}
                />
              ))}
            </div>
          )}

          {step === 4 && (
            <div role="radiogroup" aria-label={stepTitles[4]} className="grid gap-3 sm:grid-cols-2">
              {HOMEOWNER_OPTIONS.map((o) => (
                <OptionCard
                  key={o.value}
                  label={o.label}
                  selected={data.homeowner === o.value}
                  onSelect={() => selectAndAdvance({ homeowner: o.value })}
                />
              ))}
            </div>
          )}

          {step === 5 && (
            <form onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
              <Field id="lead-first" label="First Name" autoComplete="given-name" value={data.firstName} error={fieldErrors.firstName} onChange={(e) => dispatch({ type: "SET", patch: { firstName: e.target.value } })} />
              <Field id="lead-last" label="Last Name" autoComplete="family-name" value={data.lastName} error={fieldErrors.lastName} onChange={(e) => dispatch({ type: "SET", patch: { lastName: e.target.value } })} />
              <Field id="lead-phone" label="Phone Number" type="tel" inputMode="tel" autoComplete="tel" value={data.phone} error={fieldErrors.phone} onChange={(e) => dispatch({ type: "SET", patch: { phone: e.target.value } })} />
              <Field id="lead-email" label="Email Address" type="email" autoComplete="email" value={data.email} error={fieldErrors.email} onChange={(e) => dispatch({ type: "SET", patch: { email: e.target.value } })} />
              <Field id="lead-zip" label="ZIP Code" inputMode="numeric" autoComplete="postal-code" value={data.zip} error={fieldErrors.zip} onChange={(e) => dispatch({ type: "SET", patch: { zip: e.target.value } })} />
              <Field id="lead-address" label="Street Address (optional)" autoComplete="street-address" value={data.address} onChange={(e) => dispatch({ type: "SET", patch: { address: e.target.value } })} />
              {phase === "error" && (
                <p role="alert" className="sm:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {state.errorMessage} —{" "}
                  <button type="button" onClick={() => dispatch({ type: "RETRY" })} className="underline">
                    try again
                  </button>
                </p>
              )}
              <div className="sm:col-span-2 mt-2 flex items-center justify-between gap-3">
                <BackButton onClick={() => dispatch({ type: "BACK" })} />
                <Button type="submit" size="lg" disabled={phase === "submitting"} className={clsx(phase === "submitting" && "opacity-70")}>
                  {phase === "submitting" ? "Sending…" : "Get My Free Estimate"}
                </Button>
              </div>
              <p className="sm:col-span-2 text-xs leading-relaxed text-body/70">
                By submitting, you agree to be contacted about your project by phone, email or text.
                We never sell your information.
              </p>
            </form>
          )}

          {validation?.message && step !== 5 && (
            <p role="alert" className="mt-4 text-sm font-medium text-red-600">
              {validation.message}
            </p>
          )}

          {step > 0 && step < 5 && (
            <div className="mt-6 flex items-center justify-between">
              <BackButton onClick={() => dispatch({ type: "BACK" })} />
              {(step === 1 || step === 2) && (
                <Button type="button" onClick={() => dispatch({ type: "NEXT" })}>
                  Continue
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-body transition-colors hover:text-teal-700"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M14.5 5 8 12l6.5 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );
}
