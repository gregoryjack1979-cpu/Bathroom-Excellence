import { AnimateIn } from "@/components/ui/AnimateIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

const problems = [
  {
    title: "Mold & mildew that keeps coming back",
    body: "Grout lines and aging caulk trap moisture no matter how hard you scrub. Non-porous wall systems remove the places mold lives.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="6" y="6" width="36" height="36" rx="6" fill="#ece4d4" />
        <circle cx="17" cy="30" r="5" fill="#5b7d67" opacity="0.75" />
        <circle cx="26" cy="35" r="3.5" fill="#5b7d67" opacity="0.6" />
        <circle cx="32" cy="28" r="2.5" fill="#5b7d67" opacity="0.5" />
        <path d="M12 14h24M12 20h24" stroke="#cbbfa4" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Chipped or damaged tiles",
    body: "Cracked tile isn't just cosmetic — it lets water reach the wall behind it. We replace it with seamless, watertight panels.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="6" y="6" width="36" height="36" rx="6" fill="#ece4d4" />
        <path d="M6 24h36M24 6v36" stroke="#cbbfa4" strokeWidth="2" />
        <path d="m14 12 6 5-3 5 5 4" stroke="#6f5426" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M30 30l5 4-2 6" stroke="#6f5426" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Leaking fixtures & dripping heads",
    body: "That slow drip wastes water and stains everything below it. New quality valves and fixtures stop it for good.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="6" y="6" width="36" height="36" rx="6" fill="#ece4d4" />
        <path d="M14 14h10a6 6 0 0 1 6 6v2" stroke="#6f5426" strokeWidth="3" strokeLinecap="round" />
        <rect x="26" y="22" width="8" height="6" rx="2" fill="#6f5426" />
        <path
          d="M30 32c0 0-3.5 4.2-3.5 6.4a3.5 3.5 0 0 0 7 0C33.5 36.2 30 32 30 32Z"
          fill="#a8834e"
          style={{ animation: "drip 2.4s ease-in infinite" }}
        />
      </svg>
    ),
  },
  {
    title: "Broken or sticking shower doors",
    body: "Doors that jump the track or won't seal make every shower a chore. Frameless glass glides smoothly and looks stunning.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="6" y="6" width="36" height="36" rx="6" fill="#ece4d4" />
        <rect x="12" y="10" width="24" height="30" rx="2" stroke="#6f5426" strokeWidth="2.4" />
        <path d="m17 16 8 10-5 8" stroke="#a8834e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="31" cy="26" r="2" fill="#6f5426" />
      </svg>
    ),
  },
  {
    title: "A design stuck in another decade",
    body: "Beige 4-inch tile and brass trim had their moment. Large-format walls and chrome details bring your bathroom up to date.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="6" y="6" width="36" height="36" rx="6" fill="#ece4d4" />
        <circle cx="24" cy="24" r="11" stroke="#6f5426" strokeWidth="2.4" />
        <path d="M24 17v7l5 4" stroke="#6f5426" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M37 11l4 4M41 11l-4 4" stroke="#a8834e" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Hard or unsafe to step in and out",
    body: "A high tub wall or slick floor shouldn't decide when you shower. Low-threshold entries, seating and grab bars restore confidence.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="6" y="6" width="36" height="36" rx="6" fill="#ece4d4" />
        <path d="M10 36h28" stroke="#cbbfa4" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M14 30h8l4-8" stroke="#6f5426" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="28" cy="14" r="3.5" fill="#6f5426" />
        <path d="M26 20l-5 6M34 34l-4-9" stroke="#6f5426" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    ),
  },
];

/** "We understand your problem" — six common shower issues, staggered in. */
export function PainPoints() {
  return (
    <section id="problems" className="relative bg-mist py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Wash away your shower&rsquo;s problems"
          title="Is Your Shower Showing Its Age?"
          subtitle="These are the problems homeowners call us about every week — and every one of them is fixable, usually in just a few days."
        />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((p, i) => (
            <AnimateIn key={p.title} as="li" delay={(i % 3) * 0.1 + Math.floor(i / 3) * 0.05}>
              <article className="group h-full rounded-card bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift">
                <div className="mb-5 h-14 w-14 transition-transform duration-300 group-hover:scale-110">{p.icon}</div>
                <h3 className="font-sans text-lg font-semibold text-ink">{p.title}</h3>
                <p className="mt-2.5 text-[15px] leading-relaxed">{p.body}</p>
              </article>
            </AnimateIn>
          ))}
        </ul>
        <AnimateIn delay={0.15} className="mt-12 text-center">
          <p className="mb-5 text-lg font-medium text-ink">
            We understand the problem — and we fix all of it.
          </p>
          <Button href="/#free-estimate" size="lg">
            Get a Free Estimate
          </Button>
        </AnimateIn>
      </div>
    </section>
  );
}
