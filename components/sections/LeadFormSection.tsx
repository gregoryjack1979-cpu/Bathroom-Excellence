import { LeadForm } from "@/components/form/LeadForm";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { siteConfig } from "@/config/site";

const points = [
  "Free in-home design consultation",
  "Exact written quote — no surprises",
  "Flexible financing options",
  "Many projects done in as little as a day",
];

/** Estimate wizard wrapped with trust copy — the primary conversion point. */
export function LeadFormSection() {
  return (
    <section id="free-estimate" className="relative overflow-hidden bg-teal-50 py-20 md:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-28 -top-24 h-96 w-96 rounded-full bg-teal-300/25 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-white/60 blur-3xl" />
      </div>
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
        <AnimateIn>
          <div className="lg:sticky lg:top-36">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              Free estimate
            </p>
            <h2 className="text-3xl leading-tight md:text-4xl">
              Tell Us About Your Project — Get an Exact Quote
            </h2>
            <p className="mt-4 text-base leading-relaxed md:text-lg">
              Answer six quick questions and {siteConfig.name} will prepare a
              personalized plan and firm pricing for your new shower.
            </p>
            <ul className="mt-7 space-y-3.5">
              {points.map((pt) => (
                <li key={pt} className="flex items-center gap-3 text-[15px] font-medium text-ink">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal-600 text-white" aria-hidden="true">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {pt}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-body">
              Prefer to talk?{" "}
              <a href={siteConfig.phoneHref} className="font-semibold text-teal-700 underline-offset-2 hover:underline">
                Call {siteConfig.phoneDisplay}
              </a>
            </p>
          </div>
        </AnimateIn>
        <AnimateIn delay={0.12}>
          <div className="glass-panel rounded-card p-6 shadow-lift sm:p-9">
            <LeadForm />
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
