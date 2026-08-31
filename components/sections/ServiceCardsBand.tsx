import Link from "next/link";
import Image from "next/image";
import { withBasePath } from "@/config/site";
import { AnimateIn } from "@/components/ui/AnimateIn";

const cards = [
  { href: "/services/tub-to-shower-conversions", label: "Tub to Shower Conversions", img: "/images/card-tub-to-shower.jpg" },
  { href: "/services/full-bathroom-remodel", label: "Full Bathroom Remodel", img: "/images/card-full-bathroom.jpg" },
  { href: "/services/walk-in-bathtubs", label: "Walk-In Bathtubs", img: "/images/card-walk-in-tubs.jpg" },
  { href: "/gallery", label: "Shower Remodels", img: "/images/card-shower-remodels.jpg" },
];

/** The original homepage's four-service photo band (labels are part of the photos). */
export function ServiceCardsBand() {
  return (
    <section aria-label="Our services" className="bg-abyss">
      <ul className="grid grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <AnimateIn key={c.label} as="li" delay={i * 0.08}>
            <Link
              href={c.href}
              aria-label={c.label}
              className="group relative block overflow-hidden focus-visible:z-10"
            >
              <Image
                src={withBasePath(c.img)}
                alt={c.label}
                width={678}
                height={846}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <span
                aria-hidden="true"
                className="absolute bottom-4 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-teal-300 transition-all duration-300 group-hover:w-2/3"
              />
            </Link>
          </AnimateIn>
        ))}
      </ul>
    </section>
  );
}
