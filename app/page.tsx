import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { PainPoints } from "@/components/sections/PainPoints";
import { ServiceCardsBand } from "@/components/sections/ServiceCardsBand";
import { DarkIntroPanel } from "@/components/sections/DarkIntroPanel";
import { TransformChecklist } from "@/components/sections/TransformChecklist";
import { PhotoCtaBand } from "@/components/sections/PhotoCtaBand";
import { Reviews } from "@/components/sections/Reviews";
import { Transformation } from "@/components/sections/Transformation";
import { Solutions } from "@/components/sections/Solutions";
import { TransformationClips } from "@/components/sections/TransformationClips";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { Contact } from "@/components/sections/Contact";
import { BrandVideo } from "@/components/sections/BrandVideo";

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <ServiceCardsBand />
        <DarkIntroPanel />
        <TransformChecklist />
        <PainPoints />
        <Transformation />
        <Solutions />
        <TransformationClips />
        <BeforeAfter />
        <PhotoCtaBand
          title="Turn Your Old Bathtub Into a Beautiful, Spacious Shower"
          subtitle="We specialize in tub to shower conversions for style, comfort and accessibility"
        />
        <WhyChooseUs />
        <Reviews />
        <Contact />
        <BrandVideo />
      </main>
      <Footer />
    </>
  );
}
