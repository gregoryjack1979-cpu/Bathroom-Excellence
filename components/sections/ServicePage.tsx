import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { LeadFormSection } from "@/components/sections/LeadFormSection";
import { Contact } from "@/components/sections/Contact";
import { GalleryScene } from "@/components/gallery/GalleryScene";
import { SceneImage } from "@/components/scenes/SceneImage";
import type { ImageSlotId } from "@/config/site";
import { siteConfig, withBasePath } from "@/config/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PhotoCtaBand } from "@/components/sections/PhotoCtaBand";
import type { ServiceInfo } from "@/lib/types";

/** Shared template for the lightweight service pages. */
export function ServicePage({ service, sceneVariant }: { service: ServiceInfo; sceneVariant: number }) {
  return (
    <>
      <Header />
      <main>
        {/* hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-porcelain to-mist pt-40 pb-16 md:pt-48 md:pb-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-teal-600/15 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                {service.title}
              </p>
              <h1 className="text-4xl leading-[1.1] md:text-5xl">{service.heroHeadline}</h1>
              <p className="mt-5 text-lg leading-relaxed">{service.intro}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button href="#free-estimate" size="lg">
                  Get a Free Estimate
                </Button>
                <Button href={siteConfig.phoneHref} variant="outline" size="lg">
                  Call {siteConfig.phoneDisplay}
                </Button>
              </div>
            </div>
            <AnimateIn delay={0.1}>
              <div className="chrome-edge overflow-hidden rounded-card shadow-lift">
                <SceneImage
                  slot={`service-${service.slug}` as ImageSlotId}
                  alt={`A finished ${service.title.toLowerCase()} project by Bathroom Excellence`}
                  className="aspect-[4/3]"
                >
                  <GalleryScene variant={sceneVariant} prefix={`svc-${service.slug}`} className="h-full w-full" />
                </SceneImage>
              </div>
            </AnimateIn>
          </div>
        </section>

        {/* benefits */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            {service.bulletsHeading && (
              <SectionHeading
                eyebrow={service.title}
                title={service.bulletsHeading.title}
                subtitle={service.bulletsHeading.subtitle}
              />
            )}
            <ul className={`grid gap-6 sm:grid-cols-2 ${service.bullets.length > 4 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
              {service.bullets.map((b, i) => (
                <AnimateIn key={b.title} as="li" delay={i * 0.08}>
                  <div className="h-full rounded-card bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                    <span className="mb-4 grid h-10 w-10 place-items-center rounded-full bg-teal-50 text-teal-700" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <h2 className="font-sans text-base font-semibold text-ink">{b.title}</h2>
                    <p className="mt-1.5 text-sm leading-relaxed">{b.body}</p>
                  </div>
                </AnimateIn>
              ))}
            </ul>
            <AnimateIn delay={0.1}>
              <p className="mx-auto mt-12 max-w-2xl text-center text-lg leading-relaxed text-ink">{service.closing}</p>
            </AnimateIn>
          </div>
        </section>

        {service.ctaBand && (
          <PhotoCtaBand title={service.ctaBand.title} subtitle={service.ctaBand.subtitle} />
        )}
        <LeadFormSection />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
