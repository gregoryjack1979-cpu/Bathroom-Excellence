import { AnimateIn } from "@/components/ui/AnimateIn";

const items = [
  {
    title: "Completing a tub to shower conversion",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 15h16M6 15V9a2 2 0 0 1 2-2h1M12 3v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><circle cx="12" cy="4.5" r="1.3" stroke="currentColor" strokeWidth="1.6" /><path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeWidth="1.6" /></svg>
    ),
  },
  {
    title: "Replacing a bathtub",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 13h18v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-2Z" stroke="currentColor" strokeWidth="1.6" /><path d="M5 13V8a2 2 0 0 1 2-2 2 2 0 0 1 2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
    ),
  },
  {
    title: "Installing a walk-in bathtub",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="6" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M9 6v13" stroke="currentColor" strokeWidth="1.6" /><circle cx="14.5" cy="12.5" r="1" fill="currentColor" /></svg>
    ),
  },
  {
    title: "Renovating a shower",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><path d="M12 3v18" stroke="currentColor" strokeWidth="1.6" /></svg>
    ),
  },
  {
    title: "Adding a bathtub surround",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><path d="M4 12h16M12 4v16M8 4v4M16 4v4M8 16v4M16 16v4" stroke="currentColor" strokeWidth="1.2" /></svg>
    ),
  },
  {
    title: "Installing safety options like grab bars",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 19c3-1 4-4 6-6s3-5 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><circle cx="16" cy="6.5" r="1.4" stroke="currentColor" strokeWidth="1.6" /><path d="M9 12l2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
    ),
  },
  {
    title: "Replacing cabinets and countertops",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="8" width="18" height="4" stroke="currentColor" strokeWidth="1.6" /><rect x="3" y="12" width="18" height="8" stroke="currentColor" strokeWidth="1.6" /><path d="M12 12v8" stroke="currentColor" strokeWidth="1.2" /></svg>
    ),
  },
  {
    title: "Installing new fixtures, sinks, toilets or bidets",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 4h4l1 4H5l1-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M7 8v3a3 3 0 0 0 3 3" stroke="currentColor" strokeWidth="1.6" /><rect x="14" y="9" width="6" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M15 9V7a2 2 0 0 1 4 0v2" stroke="currentColor" strokeWidth="1.6" /></svg>
    ),
  },
  {
    title: "Replacing flooring, lighting or windows",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="1.2" /></svg>
    ),
  },
];

/** The original homepage's "How you can transform your bathroom" nine-item checklist. */
export function TransformChecklist() {
  return (
    <section aria-labelledby="transform-checklist-heading" className="bg-porcelain py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <AnimateIn>
          <h2 id="transform-checklist-heading" className="text-3xl md:text-4xl">
            How You Can Transform Your Bathroom
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed">
            You won&rsquo;t have to compromise when you work with our bathroom
            remodeling company. We can update your bathroom however you want,
            including&hellip;
          </p>
        </AnimateIn>

        <ul className="mt-10 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <AnimateIn key={item.title} as="li" delay={(i % 3) * 0.06 + Math.floor(i / 3) * 0.04}>
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-ink/12 bg-white text-ink/70" aria-hidden="true">
                  <span className="h-[18px] w-[18px]">{item.icon}</span>
                </span>
                <p className="pt-1.5 text-[15px] leading-snug text-ink">{item.title}</p>
              </div>
            </AnimateIn>
          ))}
        </ul>

        <AnimateIn delay={0.15}>
          <p className="mt-10 max-w-2xl text-sm leading-relaxed">
            Maybe you just want a bit more comfort or accessibility. Maybe
            it&rsquo;s time to give your bathroom a completely different look.
            No matter your vision, you can trust our experts to make it a
            reality.
          </p>
        </AnimateIn>
      </div>
    </section>
  );
}
