import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses and protects your personal information.`,
  robots: { index: false },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 pt-40 pb-20 sm:px-6">
        <h1 className="text-4xl">Privacy Policy</h1>
        <div className="mt-8 space-y-6 leading-relaxed [&_h2]:mt-8 [&_h2]:font-sans [&_h2]:text-xl [&_h2]:font-semibold">
          <p>
            {siteConfig.legalName} (&ldquo;we,&rdquo; &ldquo;us&rdquo;) respects your privacy. This policy
            explains what we collect through this website and how we use it.
          </p>
          <h2>Information we collect</h2>
          <p>
            When you request an estimate or contact us, we collect the details you provide:
            name, phone number, email address, project address and information about your
            remodeling project. We also collect standard analytics data such as pages visited.
          </p>
          <h2>How we use it</h2>
          <p>
            We use your information to respond to your inquiry, schedule consultations,
            prepare estimates and provide our services. We do not sell or rent your
            personal information to third parties.
          </p>
          <h2>Communications</h2>
          <p>
            By submitting a form you agree that we may contact you about your project by
            phone, email or text. You can opt out at any time by replying STOP to texts or
            contacting us at {siteConfig.email}.
          </p>
          <h2>Data retention &amp; security</h2>
          <p>
            We keep lead information only as long as needed to serve you and meet legal
            obligations, and we protect it with commercially reasonable safeguards.
          </p>
          <h2>Contact</h2>
          <p>
            Questions about this policy? Email {siteConfig.email} or call {siteConfig.phoneDisplay}.
          </p>
          <p className="text-sm text-body/70">Last updated: {new Date().getFullYear()}</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
