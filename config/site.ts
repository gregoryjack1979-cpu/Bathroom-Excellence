/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CENTRAL SITE CONFIGURATION
 *  Edit this file (or the NEXT_PUBLIC_* env vars) to rebrand the entire site:
 *  company name, phone, email, service area, social links, hours, SEO.
 *  No component edits required.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Deploy-time base path (e.g. "/Bathroom-Excellence" on GitHub Pages).
 * NEXT_PUBLIC_ so it is inlined into client components too.
 */
const bp = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a public-asset path with the deployment base path. */
export const withBasePath = (path: string) => `${bp}${path}`;

export type ImageSlotId =
  | "hero"
  | "before-after-old"
  | "before-after-new"
  | `gallery-${number}`;

export const siteConfig = {
  /** Company identity — override with NEXT_PUBLIC_COMPANY_NAME */
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || "AquaLux Bath & Shower",
  legalName: "AquaLux Bath & Shower LLC",
  tagline: "Premium Shower & Bathroom Remodeling",

  /** Contact — override with NEXT_PUBLIC_PHONE_NUMBER / NEXT_PUBLIC_EMAIL */
  phoneDisplay: process.env.NEXT_PUBLIC_PHONE_NUMBER || "(555) 214-7890",
  phoneHref: `tel:+1${(process.env.NEXT_PUBLIC_PHONE_NUMBER || "5552147890").replace(/\D/g, "")}`,
  email: process.env.NEXT_PUBLIC_EMAIL || "hello@aqualuxbath.com",

  /** Canonical URL — override with NEXT_PUBLIC_SITE_URL */
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.aqualuxbath.example.com",

  /** Service area — replace with your real city/region */
  serviceArea: {
    headline: "Proudly serving homeowners across the Greater Metro Area",
    region: "Greater Metro Area",
    localities: ["Downtown", "North County", "West Valley", "Lakeside", "Cedar Heights", "Maple Grove"],
  },

  /** Street address for the LocalBusiness schema — replace with your own */
  address: {
    street: "1200 Showroom Way, Suite 4",
    city: "Metro City",
    state: "MO",
    zip: "63301",
  },

  hours: [
    { days: "Monday – Friday", time: "8:00 AM – 6:00 PM" },
    { days: "Saturday", time: "9:00 AM – 2:00 PM" },
    { days: "Sunday", time: "Closed" },
  ],

  /** Social profiles — replace with your real URLs (or remove entries) */
  socials: [
    { label: "Facebook", href: "https://www.facebook.com/yourcompany" },
    { label: "Instagram", href: "https://www.instagram.com/yourcompany" },
    { label: "Houzz", href: "https://www.houzz.com/pro/yourcompany" },
  ],

  /** SEO defaults (per-page titles extend this) */
  seo: {
    title: "Shower Remodels & Walk-In Showers",
    titleTemplate: "%s | AquaLux Bath & Shower",
    description:
      "Transform your old shower into something beautiful. Custom shower remodels, tub-to-shower conversions, walk-in showers and bathroom safety upgrades — professionally installed, free estimates.",
    keywords: [
      "shower remodel",
      "tub to shower conversion",
      "walk-in shower",
      "bathroom remodeling",
      "shower replacement",
      "walk-in bathtub",
      "bathroom safety",
      "shower installation",
    ],
  },

  /** Header navigation. The flagship Shower Remodels experience is the homepage. */
  nav: [
    { label: "Home", href: "/" },
    { label: "Shower Remodels", href: "/shower-remodels" },
    { label: "Tub to Shower Conversions", href: "/services/tub-to-shower-conversions" },
    { label: "Full Bathroom Remodel", href: "/services/full-bathroom-remodel" },
    { label: "Bathtubs & More", href: "/services/bathtubs-and-more" },
    { label: "Walk-In Bathtubs", href: "/services/walk-in-bathtubs" },
    { label: "Bath Wall Systems", href: "/services/bath-wall-systems" },
    { label: "Bathroom Safety", href: "/services/bathroom-safety" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
  ],

  /**
   * Photo drop-in slots. The site ships with hand-drawn SVG scenes; to use real
   * photography, place files in /public/images and map slot IDs to paths here,
   * e.g.  "hero": "/images/hero.jpg". Components fall back to the SVG scene
   * whenever a slot is unset.
   */
  imageSlots: {
    "hero": withBasePath("/images/hero.jpg"),
    "gallery-1": withBasePath("/images/gallery-1.jpg"),
    "gallery-2": withBasePath("/images/gallery-2.jpg"),
    "gallery-3": withBasePath("/images/gallery-3.jpg"),
    "gallery-4": withBasePath("/images/gallery-4.jpg"),
    "gallery-5": withBasePath("/images/gallery-5.jpg"),
    "gallery-6": withBasePath("/images/gallery-6.jpg"),
    "gallery-7": withBasePath("/images/gallery-7.jpg"),
    "gallery-8": withBasePath("/images/gallery-8.jpg"),
    "gallery-9": withBasePath("/images/gallery-9.jpg"),
    "gallery-10": withBasePath("/images/gallery-10.jpg"),
    "gallery-11": withBasePath("/images/gallery-11.jpg"),
    "gallery-12": withBasePath("/images/gallery-12.jpg"),
  } as Partial<Record<ImageSlotId, string>>,

  /** Identifies this site in webhook payloads */
  leadSource: "shower-remodels-website",
} as const;

export type SiteConfig = typeof siteConfig;
