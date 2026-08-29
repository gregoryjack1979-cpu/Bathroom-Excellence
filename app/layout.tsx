import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { siteConfig, withBasePath } from "@/config/site";
import { MotionPrefsProvider } from "@/lib/hooks/useMotionPrefs";
import { JsonLd } from "@/components/ui/JsonLd";
import { EffectsMount } from "@/components/effects/EffectsMount";
import { PageLoader } from "@/components/effects/PageLoader";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
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
  themeColor: "#0b3542",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
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
