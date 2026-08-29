import Image from "next/image";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig, withBasePath } from "@/config/site";

const reasons = [
  { title: "Unbelievably Affordable", body: "Customers are continuously surprised by our affordability — their words, not ours." },
  { title: "Fully Custom Work", body: "We do fully custom work and can handle any size project, big or small." },
  { title: "Skilled Tradespeople", body: "We only hire skilled tradespeople and take the time to do every job right." },
  { title: "Fast Turnaround", body: "We can complete many projects in as little as a day." },
  { title: "High-Quality Materials", body: "Non-porous walls, tempered glass and fixtures we'd put in our own homes." },
  { title: "Free Estimates", body: "An in-home visit, exact quote and design ideas — always free, never pushy." },
  { title: "Total Customer Satisfaction", body: "Excellence is in our name, and we always strive for total satisfaction." },
];

const stats = [
  { value: `${siteConfig.rating.value}★`, label: `Google rating · ${siteConfig.rating.count} reviews` },
  { value: "100%", label: "Fully custom work" },
  { value: "1 day", label: "Many installs finished" },
  { value: "St. Charles", label: "& the Greater St. Louis Area" },
];

/** Trust-building reasons + proof stats on a deep-water panel. */
export function WhyChooseUs() {
  return (
    <section id="why-us" className="relative overflow-hidden bg-deep py-20 md:py-28">
      {/* photographic backdrop + soft caustic glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.16]"
          style={{ backgroundImage: `url(${withBasePath("/images/bg-marble.jpg")})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep via-deep/85 to-deep" />
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-teal-500/15 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-teal-300/10 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 grid items-center gap-10 md:mb-16 lg:grid-cols-[1.5fr_1fr]">
          <SectionHeading
            eyebrow="Why homeowners choose us"
            title={<>A Remodel You Can Trust, <span className="text-teal-300">Start to Finish</span></>}
            subtitle="You want to know you can trust the people working on your home. Excellence is in our name — and our customers love working with us."
            tone="dark"
            align="left"
            className="mb-0 md:mb-0"
          />
          <AnimateIn delay={0.15} className="hidden justify-center lg:flex">
            <div className="animate-float-slow rounded-full p-1.5" style={{ background: "linear-gradient(140deg,#eef3f6,#8fa0ab,#e2e9ee)" }}>
              <Image
                src={withBasePath("/images/photo-shower-circle.jpg")}
                alt="A customer enjoying their new rainfall shower"
                width={280}
                height={280}
                className="h-64 w-64 rounded-full object-cover xl:h-72 xl:w-72"
              />
            </div>
          </AnimateIn>
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <AnimateIn key={r.title} as="li" delay={(i % 3) * 0.08}>
              <div className="glass-dark h-full rounded-2xl p-6 transition-colors duration-300 hover:border-teal-400/40">
                <span className="mb-4 grid h-10 w-10 place-items-center rounded-full bg-teal-400/15 text-teal-300" aria-hidden="true">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3 className="font-sans text-base font-semibold text-white">{r.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-teal-100/75">{r.body}</p>
              </div>
            </AnimateIn>
          ))}
        </ul>

        <AnimateIn delay={0.15}>
          <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-10 text-center md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dd className="font-display text-4xl text-white">{s.value}</dd>
                <dt className="mt-1 text-sm text-teal-100/70">{s.label}</dt>
              </div>
            ))}
          </dl>
        </AnimateIn>
      </div>
    </section>
  );
}
