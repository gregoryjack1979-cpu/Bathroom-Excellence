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

/** Remodeling solutions: three featured tilt cards. */
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

        <AnimateIn delay={0.1} className="mt-12 text-center">
          <Button href="/#free-estimate" size="lg">
            Design My New Shower
          </Button>
        </AnimateIn>
      </div>
    </section>
  );
}
