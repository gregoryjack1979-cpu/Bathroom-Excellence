import { siteConfig } from "@/config/site";
import { reviews } from "@/lib/reviewsData";
import { AnimateIn } from "@/components/ui/AnimateIn";

function Stars({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#e9a83b" className="inline-block">
          <path d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8Z" />
        </svg>
      ))}
    </span>
  );
}

/** Google reviews band — the same rating and testimonials as the original site. */
export function Reviews() {
  return (
    <section aria-label="Customer reviews" className="bg-porcelain py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateIn>
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-mist px-6 py-4">
            <Stars />
            <p className="font-sans text-lg font-bold text-ink">
              {siteConfig.rating.value} stars{" "}
              <span className="text-sm font-medium text-body">{siteConfig.rating.count} reviews</span>
            </p>
            <a
              href={siteConfig.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-sheen rounded-md bg-[#e9a83b] px-4 py-1.5 text-sm font-bold text-white shadow-card transition-transform hover:-translate-y-0.5"
            >
              Leave a Review
            </a>
          </div>
        </AnimateIn>
        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {reviews.map((r, i) => (
            <AnimateIn key={r.name} as="li" delay={i * 0.1}>
              <figure className="flex h-full flex-col rounded-card border border-ink/10 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                <figcaption className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-teal-100 font-sans text-sm font-bold text-teal-700" aria-hidden="true">
                    {r.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-sans text-sm font-bold text-ink">{r.name}</p>
                    <Stars />
                  </div>
                </figcaption>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed">{r.text}</blockquote>
                <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-body/70">
                  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.5 12.2c0-.8-.07-1.5-.2-2.2H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.8h3.6c2-1.9 3.2-4.7 3.2-8.2Z" />
                    <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1-3.7 1a6.6 6.6 0 0 1-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23Z" />
                    <path fill="#FBBC05" d="M5.8 14a6.6 6.6 0 0 1 0-4.2V7H2.1a11 11 0 0 0 0 9.9L5.8 14Z" />
                    <path fill="#EA4335" d="M12 5.4c1.7 0 3.1.6 4.3 1.7l3.2-3.2A11 11 0 0 0 2.1 7l3.7 2.9A6.6 6.6 0 0 1 12 5.4Z" />
                  </svg>
                  Posted on Google
                </p>
              </figure>
            </AnimateIn>
          ))}
        </ul>
      </div>
    </section>
  );
}
