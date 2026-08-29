import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GallerySection } from "@/components/sections/GallerySection";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { Contact } from "@/components/sections/Contact";

export const metadata: Metadata = {
  title: "Project Gallery",
  description:
    "Browse recent shower remodels, walk-in showers, alcove bases and modern bathroom transformations — designed and installed by our team.",
};

export default function GalleryPage() {
  return (
    <>
      <Header />
      <main>
        <div className="bg-mist pt-32 md:pt-36">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h1 className="text-4xl md:text-5xl">Our Project Gallery</h1>
            <p className="mt-4 text-lg leading-relaxed">
              Real layouts, real materials — explore the styles we install every week
              and picture your own bathroom among them.
            </p>
          </div>
        </div>
        <GallerySection heading={false} />
        <BeforeAfter />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
