import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { DarkIntroPanel } from "@/components/sections/DarkIntroPanel";
import { ShowerProblems } from "@/components/sections/ShowerProblems";
import { GallerySection } from "@/components/sections/GallerySection";
import { LeadFormSection } from "@/components/sections/LeadFormSection";
import { Contact } from "@/components/sections/Contact";
import { withBasePath } from "@/config/site";

export const metadata: Metadata = {
  title: "Shower Remodels",
  description:
    "We'll make your old shower a work of art. Shower remodels in St. Charles, MO and the Greater St. Louis Area — custom designs, walk-in showers and more.",
};

/**
 * The dedicated Shower Remodels page — distinct from the homepage. Matches
 * the original site's own /shower-remodels: a page-title banner, the "We'll
 * Make Your Old Shower a Work of Art" intro, a compact problem list, a photo
 * CTA band, and the categorized shower gallery.
 */
export default function ShowerRemodelsPage() {
  return (
    <>
      <Header />
      <main>
        {/* page-title banner */}
        <section
          className="relative flex min-h-[260px] items-center justify-center overflow-hidden bg-abyss pt-32 text-center md:pt-36"
          style={{
            backgroundImage: `linear-gradient(rgb(20 20 20 / 0.7), rgb(20 20 20 / 0.7)), url(${withBasePath("/images/bg-marble.jpg")})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="px-4 py-10 sm:px-6">
            <h1 className="text-4xl text-white md:text-5xl">Shower Remodels</h1>
            <Button href="/contact" variant="light" size="lg" className="mt-6">
              Contact Us
            </Button>
          </div>
        </section>

        <DarkIntroPanel
          title="We'll Make Your Old Shower a Work of Art"
          subtitle="Team up with us for a shower remodel in St. Charles, MO and the Greater St. Louis Area"
          paragraphs={[
            "When your shower starts falling apart, it can put a real damper on your bathing routine. But you can reclaim the luxurious shower experience you crave with a shower remodel from Bathroom Excellence.",
            "You can hire us to install a new shower system for your bathroom in St. Charles, MO and the Greater St. Louis Area. We'll work with you to design and build a shower that's comfortable and convenient while having a style that makes your bathroom look incredible.",
          ]}
        />

        <ShowerProblems />

        <GallerySection heading />

        <LeadFormSection />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
