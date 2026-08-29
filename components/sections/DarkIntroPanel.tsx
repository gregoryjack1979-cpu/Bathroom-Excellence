import { siteConfig } from "@/config/site";
import { AnimateIn } from "@/components/ui/AnimateIn";

/**
 * The original homepage's signature block: a dark rounded panel with a white
 * inset card, floating over a subway-brick backdrop.
 */
export function DarkIntroPanel() {
  return (
    <section
      aria-label="Why remodel your bathroom"
      className="relative overflow-hidden py-16 md:py-24"
      style={{
        backgroundColor: "#e9e7e2",
        backgroundImage:
          "linear-gradient(rgb(255 255 255 / 0.55) 2px, transparent 2px), linear-gradient(90deg, rgb(160 158 152 / 0.4) 3px, transparent 3px)",
        backgroundSize: "160px 52px, 160px 52px",
        backgroundPosition: "0 0, 0 0",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateIn>
          <div className="grid gap-10 rounded-[1.5rem] bg-[#1e1e1e] p-8 shadow-lift sm:p-12 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
            <div>
              <h2 className="font-display text-3xl leading-tight text-white md:text-4xl">
                Turn Your Boring Bathroom Into a Refreshing Space
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-white/80">
                Schedule bathroom remodeling services in the St. Charles, MO and
                the Greater St. Louis Area
              </p>
              <svg viewBox="0 0 140 18" width="130" height="17" fill="none" aria-hidden="true" className="mt-6 text-teal-300">
                <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M64 9 C 50 16, 34 16, 29 10 C 25 5, 30 1, 35 4 C 39 7, 35 12, 28 10" />
                  <path d="M76 9 C 90 16, 106 16, 111 10 C 115 5, 110 1, 105 4 C 101 7, 105 12, 112 10" />
                </g>
                <path d="M70 3.5 L74 9 L70 14.5 L66 9 Z" fill="currentColor" />
              </svg>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-card sm:p-8">
              <p className="text-lg leading-snug text-body">
                You visit your bathroom multiple times a day.{" "}
                <strong className="font-semibold text-ink">
                  It should be a place where you feel comfortable.
                </strong>
              </p>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed">
                <p>
                  If your personal hygiene routine is something you dread, turn to
                  Bathroom Excellence. We can redesign your bathroom to make it more
                  beautiful and comfortable while making it easier to move around in.
                </p>
                <p>
                  You can hire us for bathroom remodeling services in St. Charles, MO
                  and the Greater St. Louis Area. From a total remodel to a tub to
                  shower conversion, we can take on any project and will work hard to
                  make your bathroom look and feel perfect.
                </p>
                <p>
                  <a href={siteConfig.phoneHref} className="font-semibold text-teal-700 underline-offset-2 hover:underline">
                    Call our bathroom remodeling company today
                  </a>{" "}
                  to discuss your ideas with a pro.
                </p>
              </div>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
