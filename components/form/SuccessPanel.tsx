"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import type { LeadPayload } from "@/lib/types";

/** Post-submit thank-you with the lead summary and consultation CTA. */
export function SuccessPanel({ payload }: { payload: LeadPayload }) {
  const high = payload.leadPriority === "High Priority";
  const rows: [string, string][] = [
    ["Project", payload.projectType],
    ["Issues", payload.currentShowerProblems.join(", ") || "—"],
    ["Features", payload.desiredFeatures.join(", ") || "—"],
    ["Timeline", payload.projectTimeline],
    ["Homeowner", payload.homeownerStatus],
    ["Contact", `${payload.firstName} ${payload.lastName} · ${payload.phone}`],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center"
    >
      <motion.span
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-600 text-white shadow-glow"
        aria-hidden="true"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.span>
      <h3 className="mt-5 font-display text-2xl text-ink">Thank you — your estimate request is in!</h3>
      <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed">
        {high
          ? "Your project is a great fit. A design consultant will call you within one business hour to schedule your free in-home consultation."
          : "A design consultant will reach out within one business day to schedule your free in-home consultation."}
      </p>

      <dl className="mx-auto mt-6 max-w-md divide-y divide-ink/8 rounded-2xl border border-ink/10 bg-white text-left text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-3 px-4 py-2.5">
            <dt className="w-24 shrink-0 font-semibold text-ink">{k}</dt>
            <dd className="text-body">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button href={siteConfig.bookingUrl} target="_blank" rel="noopener noreferrer" variant="gold" size="lg">
          Book Appointment Now
        </Button>
        <Button href={siteConfig.phoneHref} size="lg">
          Call to Schedule
        </Button>
        <Button href="/gallery" variant="outline" size="lg">
          Browse the Gallery
        </Button>
      </div>
    </motion.div>
  );
}
