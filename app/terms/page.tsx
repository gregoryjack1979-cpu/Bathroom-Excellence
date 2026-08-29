import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Terms of use for the ${siteConfig.name} website.`,
  robots: { index: false },
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 pt-40 pb-20 sm:px-6">
        <h1 className="text-4xl">Terms &amp; Conditions</h1>
        <div className="mt-8 space-y-6 leading-relaxed [&_h2]:mt-8 [&_h2]:font-sans [&_h2]:text-xl [&_h2]:font-semibold">
          <p>
            Welcome to the {siteConfig.name} website. By using this site you agree to
            these terms.
          </p>
          <h2>Website content</h2>
          <p>
            Content on this site is provided for general information about our remodeling
            services. Project imagery is illustrative; final materials and designs are
            confirmed during your in-home consultation.
          </p>
          <h2>Estimates</h2>
          <p>
            Online inquiries generate a free, no-obligation consultation. Firm pricing is
            provided in writing after an in-home assessment.
          </p>
          <h2>Intellectual property</h2>
          <p>
            All site content, designs and branding belong to {siteConfig.legalName} and may
            not be reproduced without permission.
          </p>
          <h2>Limitation of liability</h2>
          <p>
            This website is provided &ldquo;as is.&rdquo; To the fullest extent permitted by law we
            disclaim liability for damages arising from use of the site.
          </p>
          <h2>Contact</h2>
          <p>
            Questions? Email {siteConfig.email} or call {siteConfig.phoneDisplay}.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
