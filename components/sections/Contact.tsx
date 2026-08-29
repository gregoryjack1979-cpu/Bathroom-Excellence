import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { FloatingElements } from "./FloatingElements";

const cards = [
  {
    title: "Call or text",
    body: siteConfig.phoneDisplay,
    href: siteConfig.phoneHref,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Email us",
    body: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
        <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Service area",
    body: siteConfig.serviceArea.region,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: "Showroom hours",
    body: `${siteConfig.hours[0].days}: ${siteConfig.hours[0].time}`,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7v5l3.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/** Final conversion band: big CTA over deep water, plus contact details. */
export function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden bg-gradient-to-b from-deep to-abyss py-20 md:py-28">
      <FloatingElements variant="dark" />
      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6">
        <AnimateIn>
          <h2 className="mx-auto max-w-3xl text-3xl leading-tight text-white md:text-5xl">
            Ready to Transform Your Shower?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-teal-100/85">
            Get your free estimate today — a design consultant will visit your
            home, take exact measurements and give you a firm quote.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Button href="/#free-estimate" size="lg">
              Get a Free Estimate
            </Button>
            <Button href={siteConfig.phoneHref} variant="dark" size="lg">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              Call Now — {siteConfig.phoneDisplay}
            </Button>
          </div>
        </AnimateIn>

        <div className="mt-16 grid gap-5 text-left sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <AnimateIn key={c.title} delay={i * 0.08}>
              <div className="glass-dark h-full rounded-2xl p-5">
                <span className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-teal-400/15 text-teal-300" aria-hidden="true">
                  {c.icon}
                </span>
                <h3 className="font-sans text-sm font-semibold uppercase tracking-wide text-teal-100/70">{c.title}</h3>
                {c.href ? (
                  <a href={c.href} className="mt-1 block font-sans text-[15px] font-semibold text-white hover:text-teal-300">
                    {c.body}
                  </a>
                ) : (
                  <p className="mt-1 font-sans text-[15px] font-semibold text-white">{c.body}</p>
                )}
              </div>
            </AnimateIn>
          ))}
        </div>
        <p className="mt-8 text-sm text-teal-100/60">{siteConfig.serviceArea.headline}</p>
      </div>
    </section>
  );
}
