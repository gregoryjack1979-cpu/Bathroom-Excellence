import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServicePage } from "@/components/sections/ServicePage";
import { getService, services } from "@/lib/servicesData";

const SCENE_VARIANTS: Record<string, number> = {
  "tub-to-shower-conversions": 8,
  "full-bathroom-remodel": 4,
  "bathtubs-and-more": 1,
  "walk-in-bathtubs": 5,
  "bath-wall-systems": 11,
  "bathroom-safety": 6,
};

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const service = getService((await params).slug);
  if (!service) return {};
  return {
    title: service.title,
    description: `${service.heroHeadline}. ${service.intro}`,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const service = getService((await params).slug);
  if (!service) notFound();
  return <ServicePage service={service} sceneVariant={SCENE_VARIANTS[service.slug] ?? 0} />;
}
