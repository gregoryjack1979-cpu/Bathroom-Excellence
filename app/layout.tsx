import type { Metadata, Viewport } from "next";
import { Lora, Mulish } from "next/font/google";
import { siteConfig, withBasePath } from "@/config/site";
import { MotionPrefsProvider } from "@/lib/hooks/useMotionPrefs";
import { JsonLd } from "@/components/ui/JsonLd";
import { EffectsMount } from "@/components/effects/EffectsMount";
import { PageLoader } from "@/components/effects/PageLoader";
import "./globals.css";

const mulish = Mulish({
  subsets: ["latin"],
  variable: "--font-mulish",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.seo.title} | ${siteConfig.name}`,
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.seo.description,
  keywords: [...siteConfig.seo.keywords],
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.seo.title} | ${siteConfig.name}`,
    description: siteConfig.seo.description,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.seo.title} | ${siteConfig.name}`,
    description: siteConfig.seo.description,
  },
  robots: { index: true, follow: true },
  icons: { icon: withBasePath("/favicon.svg") },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#161616",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${mulish.variable} ${lora.variable}`}>
      <body>
        <MotionPrefsProvider>
          <PageLoader />
          {children}
          <EffectsMount />
        </MotionPrefsProvider>
        <JsonLd />
      </body>
    </html>
  );
}
