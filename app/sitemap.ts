import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { services } from "@/lib/servicesData";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/gallery`, priority: 0.8 },
    { url: `${base}/contact`, priority: 0.8 },
    ...services.map((s) => ({ url: `${base}/services/${s.slug}`, priority: 0.7 })),
  ];
}
