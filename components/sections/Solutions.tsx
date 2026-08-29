import { AnimateIn } from "@/components/ui/AnimateIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { Button } from "@/components/ui/Button";
import { ShowerSceneNew } from "@/components/scenes/ShowerSceneNew";
import { SceneImage } from "@/components/scenes/SceneImage";
import type { ImageSlotId } from "@/config/site";

const featured = [
  {
    title: "Walk-In Showers",
    body: "Low-threshold entries, built-in seating and open glass — safer to use and beautiful to look at, tailored to your space.",
    scene: <ShowerSceneNew prefix="sol-walkin" className="h-full w-full" bench grabBar water={false} />,
  },
  {
    title: "Custom Shower Designs",
    body: "Rainfall heads, mosaic niches, chrome or matte-black trim — we design around how your family actually showers.",
    scene: <ShowerSceneNew prefix="sol-custom" className="h-full w-full" />,
  },
  {
    title: "Modern Wall Systems",
    body: "Large-format, grout-free wall panels in marble and stone looks that wipe clean in seconds and never harbor mold.",
    scene: (
      <ShowerSceneNew
        prefix="sol-walls"
        className="h-full w-full"
        water={false}
        palette={{ wall: "#eef0ee", wallShade: "#d7ddda", accent: "#5a8a7c", accentDeep: "#39604f", floor: "#d6dbd8" }}
      />
    ),
  },
];

const options = [
  { title: "Glass Shower Doors", body: "Frameless and semi-frameless doors that glide, seal and stay clear." },
  { title: "Shower Seating", body: "Fold-away teak or built-in benches placed exactly where you want them." },
  { title: "Grab Bars", body: "Designer-grade support rated to hold — that looks like part of the design." },
  { title: "Built-In Storage", body: "Recessed niches and corner shelves that end the shampoo-bottle clutter." },
  { title: "Easy-Clean Materials", body: "Non-porous surfaces that need a wipe-down, not a scrub-down." },
  { title: "Accessibility Options", body: "Barrier-free entries, hand-held heads and controls within easy reach." },
];

/** Remodeling solutions: three featured tilt cards + six compact options. */
export function Solutions() {
  return (
    <section id="solutions" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Shower remodeling solutions"
          title="Designed Around You, Built To Last"
          subtitle="We do fully custom work and can handle any size project — pick the layout, walls, glass and comfort features, and our team handles the rest."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((f, i) => (
            <AnimateIn key={f.title} delay={i * 0.12}>
              <TiltCard className="h-full overflow-hidden rounded-card bg-white shadow-card transition-shadow duration-300 hover:shadow-lift">
                <div className="aspect-[16/10] overflow-hidden">
                  <div className="h-full w-full transition-transform duration-500 group-hover:scale-[1.045]">
                    <SceneImage slot={`solution-${i + 1}` as ImageSlotId} alt={f.title} className="h-full w-full">
                      {f.scene}
                    </SceneImage>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-sans text-lg font-semibold text-ink">{f.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed">{f.body}</p>
                </div>
              </TiltCard>
            </AnimateIn>
          ))}
        </div>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((o, i) => (
            <AnimateIn key={o.title} as="li" delay={(i % 3) * 0.08}>
              <div className="flex h-full items-start gap-4 rounded-2xl border border-ink/8 bg-white/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/30 hover:shadow-card">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-50 text-teal-700" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-sans text-[15px] font-semibold text-ink">{o.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed">{o.body}</p>
                </div>
              </div>
            </AnimateIn>
          ))}
        </ul>

        <AnimateIn delay={0.1} className="mt-12 text-center">
          <Button href="/#free-estimate" size="lg">
            Design My New Shower
          </Button>
        </AnimateIn>
      </div>
    </section>
  );
}
