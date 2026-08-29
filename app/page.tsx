import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { PainPoints } from "@/components/sections/PainPoints";
import { Transformation } from "@/components/sections/Transformation";
import { Solutions } from "@/components/sections/Solutions";
import { GallerySection } from "@/components/sections/GallerySection";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { LeadFormSection } from "@/components/sections/LeadFormSection";
import { Contact } from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <PainPoints />
        <Transformation />
        <Solutions />
        <GallerySection limit={6} />
        <BeforeAfter />
        <WhyChooseUs />
        <LeadFormSection />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
