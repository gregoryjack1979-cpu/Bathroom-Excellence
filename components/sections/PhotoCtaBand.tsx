import { Button } from "@/components/ui/Button";
import { siteConfig, withBasePath } from "@/config/site";

interface PhotoCtaBandProps {
  title: string;
  subtitle: string;
  /** Public path to the backdrop image */
  image?: string;
}

/** Full-width photo CTA band — reused on the homepage and on service pages. */
export function PhotoCtaBand({ title, subtitle, image = "/images/bg-rain.jpg" }: PhotoCtaBandProps) {
  return (
    <section
      aria-label={title}
      className="relative overflow-hidden py-20 text-center md:py-28"
      style={{
        backgroundImage: `linear-gradient(rgb(16 16 16 / 0.78), rgb(16 16 16 / 0.85)), url(${withBasePath(image)})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-display text-3xl leading-tight text-white md:text-5xl">{title}</h2>
        <p className="mt-4 text-lg text-white/85">{subtitle}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button href="#free-estimate" size="lg" variant="light">
            Free Estimate
          </Button>
          <Button href={siteConfig.phoneHref} size="lg" variant="dark">
            Call Now
          </Button>
        </div>
      </div>
    </section>
  );
}
