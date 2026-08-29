import { siteConfig } from "@/config/site";

/** LocalBusiness structured data built from the central site config. */
export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    description: siteConfig.seo.description,
    url: siteConfig.url,
    telephone: siteConfig.phoneDisplay,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.state,
      postalCode: siteConfig.address.zip,
      addressCountry: "US",
    },
    areaServed: siteConfig.serviceArea.localities.map((name) => ({
      "@type": "Place",
      name,
    })),
    openingHours: ["Mo-Fr 08:00-18:00", "Sa 09:00-14:00"],
    priceRange: "$$",
    makesOffer: [
      "Shower Remodeling",
      "Tub-to-Shower Conversions",
      "Walk-In Showers",
      "Full Bathroom Remodeling",
      "Bathroom Safety Upgrades",
    ].map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
