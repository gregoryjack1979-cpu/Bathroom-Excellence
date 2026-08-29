import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LeadFormSection } from "@/components/sections/LeadFormSection";
import { Contact } from "@/components/sections/Contact";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${siteConfig.name} — call ${siteConfig.phoneDisplay}, email us, or request your free in-home shower remodeling estimate.`,
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <div className="bg-teal-50 pt-32 md:pt-36">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h1 className="text-4xl md:text-5xl">Let&rsquo;s Talk About Your Bathroom</h1>
            <p className="mt-4 text-lg leading-relaxed">
              Questions, ideas or ready to schedule? Reach us any way you like —
              or start your free estimate below.
            </p>
          </div>
        </div>
        <LeadFormSection />
        <section className="bg-porcelain py-14">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 text-center sm:grid-cols-3 sm:px-6 sm:text-left">
            <div>
              <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Business hours</h2>
              <ul className="mt-3 space-y-1.5 text-[15px]">
                {siteConfig.hours.map((h) => (
                  <li key={h.days}>
                    <span className="font-medium text-ink">{h.days}:</span> {h.time}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Visit the showroom</h2>
              <p className="mt-3 text-[15px] leading-relaxed">
                {siteConfig.address.street}
                <br />
                {siteConfig.address.city}, {siteConfig.address.state} {siteConfig.address.zip}
              </p>
            </div>
            <div>
              <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Service area</h2>
              <p className="mt-3 text-[15px] leading-relaxed">{siteConfig.serviceArea.localities.join(" · ")}</p>
            </div>
          </div>
        </section>
        <Contact />
      </main>
      <Footer />
    </>
  );
}
