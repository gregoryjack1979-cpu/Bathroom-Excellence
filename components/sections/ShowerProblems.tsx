import { AnimateIn } from "@/components/ui/AnimateIn";
import { Button } from "@/components/ui/Button";

const problems = [
  {
    title: "Mold growth",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.4" /><path d="M3 12h18M12 3v18M3 7.5h4.5M16.5 3v4.5M7.5 16.5V21M16.5 16.5H21" stroke="currentColor" strokeWidth="1.1" /></svg>
    ),
  },
  {
    title: "Chipped tiles",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="1" stroke="currentColor" strokeWidth="1.4" /><path d="m8 4-3 6 4 3-2 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ),
  },
  {
    title: "A broken door",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 3h9l3 3v15H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><circle cx="14" cy="13" r="1" fill="currentColor" /></svg>
    ),
  },
  {
    title: "Leaky fixtures",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6h6a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><rect x="15" y="12" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.4" /><path d="M17.5 18c0 0-2.3 2.7-2.3 4.1a2.3 2.3 0 0 0 4.6 0c0-1.4-2.3-4.1-2.3-4.1Z" fill="currentColor" /></svg>
    ),
  },
];

/** The dedicated Shower Remodels page's compact problem list. */
export function ShowerProblems() {
  return (
    <section className="bg-mist py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start">
          <AnimateIn>
            <h2 className="text-3xl md:text-4xl">Wash away your shower&rsquo;s problems</h2>
            <p className="mt-4 text-[15px] leading-relaxed">
              You don&rsquo;t have to settle for a shower that&rsquo;s uncomfortable
              or even dangerous. Consider a shower remodel if your shower
              has&hellip;
            </p>
          </AnimateIn>
          <ul className="grid gap-6 sm:grid-cols-2">
            {problems.map((p, i) => (
              <AnimateIn key={p.title} as="li" delay={i * 0.08}>
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-ink/12 bg-white text-ink/70" aria-hidden="true">
                    <span className="h-5 w-5">{p.icon}</span>
                  </span>
                  <p className="font-sans text-[15px] font-semibold text-ink">{p.title}</p>
                </div>
              </AnimateIn>
            ))}
          </ul>
        </div>

        <AnimateIn delay={0.15}>
          <div className="mt-14 flex flex-col items-center justify-between gap-6 rounded-card bg-[#1e1e1e] p-8 text-center sm:flex-row sm:text-left">
            <p className="text-lg leading-snug text-white">
              We&rsquo;ll build you a new, beautiful shower and can even add
              features like grab bars, seating or storage.
              <br className="hidden sm:block" />
              Start customizing your new shower when you contact us today.
            </p>
            <Button href="/contact" variant="light" size="lg" className="shrink-0">
              Contact Us
            </Button>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
