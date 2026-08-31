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
  | `gallery-${number}`
  | `solution-${number}`
  | `service-${string}`;

export const siteConfig = {
  /** Company identity — override with NEXT_PUBLIC_COMPANY_NAME */
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || "Bathroom Excellence",
  legalName: "Bathroom Excellence",
  tagline: "Bathroom Remodeling in St. Charles, MO",

  /** Contact — override with NEXT_PUBLIC_PHONE_NUMBER / NEXT_PUBLIC_EMAIL */
  phoneDisplay: process.env.NEXT_PUBLIC_PHONE_NUMBER || "(800) 245-8143",
  phoneHref: `tel:+1${(process.env.NEXT_PUBLIC_PHONE_NUMBER || "8002458143").replace(/\D/g, "")}`,
  /** Leave empty to hide email everywhere it appears */
  email: process.env.NEXT_PUBLIC_EMAIL || "",

  /** Canonical URL — override with NEXT_PUBLIC_SITE_URL */
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.bathroomexcellence.com",

  /** Service area — replace with your real city/region */
  serviceArea: {
    headline: "Serving all of the St. Charles, MO and the Greater St. Louis Area",
    region: "St. Charles, MO & Greater St. Louis",
    localities: ["St. Charles", "St. Peters", "O'Fallon", "Cottleville", "Chesterfield", "St. Louis"],
  },

  /** Street address for the LocalBusiness schema — replace with your own */
  address: {
    street: "1811 Sherman Dr, Suite 10",
    city: "St Charles",
    state: "MO",
    zip: "63303",
  },

  hours: [
    { days: "Monday – Friday", time: "8:00 AM – 6:00 PM" },
    { days: "Saturday", time: "9:00 AM – 2:00 PM" },
    { days: "Sunday", time: "Closed" },
  ],

  /** Google rating shown in the hero and trust sections */
  rating: { value: "4.8", count: 203 },

  /** Online appointment booking page */
  bookingUrl: "https://www.bathroomexcellence.com/book",

  /** Where "Leave a Review" points — replace with your Google review short link */
  googleReviewUrl:
    "https://www.google.com/search?q=Bathroom+Excellence+St+Charles+MO+reviews",

  /** Social profiles — replace with your real URLs (or remove entries) */
  socials: [
    { label: "Facebook", href: "https://www.facebook.com/yourcompany" },
    { label: "Instagram", href: "https://www.instagram.com/yourcompany" },
    { label: "Houzz", href: "https://www.houzz.com/pro/yourcompany" },
  ],

  /** SEO defaults (per-page titles extend this) */
  seo: {
    title: "Shower Remodels | St. Charles, MO",
    titleTemplate: "%s | Bathroom Excellence",
    description:
      "We'll make your old shower a work of art. Shower remodels, tub-to-shower conversions, walk-in bathtubs and bathroom safety upgrades in St. Charles, MO and the Greater St. Louis Area. Free estimates — call (800) 245-8143.",
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
    { label: "Shower Remodels", href: "/gallery" },
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
    "solution-1": withBasePath("/images/solution-1.jpg"),
    "solution-2": withBasePath("/images/solution-2.jpg"),
    "solution-3": withBasePath("/images/solution-3.jpg"),
    "service-tub-to-shower-conversions": withBasePath("/images/service-tub-to-shower-conversions.jpg"),
    "service-full-bathroom-remodel": withBasePath("/images/service-full-bathroom-remodel.jpg"),
    "service-bathtubs-and-more": withBasePath("/images/service-bathtubs-and-more.jpg"),
    "service-walk-in-bathtubs": withBasePath("/images/service-walk-in-bathtubs.jpg"),
    "service-bath-wall-systems": withBasePath("/images/service-bath-wall-systems.jpg"),
    "service-bathroom-safety": withBasePath("/images/service-bathroom-safety.jpg"),
  } as Partial<Record<ImageSlotId, string>>,

  /** Identifies this site in webhook payloads */
  leadSource: "bathroomexcellence-website",
} as const;

export type SiteConfig = typeof siteConfig;
