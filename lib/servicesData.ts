import type { ServiceInfo } from "./types";

/** Content for the lightweight service pages (app/services/[slug]). */
export const services: ServiceInfo[] = [
  {
    slug: "tub-to-shower-conversions",
    navLabel: "Tub to Shower Conversions",
    title: "Tub-to-Shower Conversions",
    heroHeadline: "Trade the Tub You Never Use for a Shower You'll Love",
    intro:
      "If your bathtub mostly collects dust — or has become hard to climb into — a tub-to-shower conversion turns that space into a roomy, easy-access shower, usually in just one or two days.",
    bullets: [
      { title: "One-to-two day installs", body: "We remove the tub, prep the plumbing and set your new shower fast, with minimal disruption." },
      { title: "Low-threshold entry", body: "Step over inches, not a tub wall — safer for every member of the family." },
      { title: "More usable space", body: "A converted shower feels dramatically larger in the same footprint." },
      { title: "Watertight wall systems", body: "Non-porous panels mean no grout lines to scrub and no leaks behind the wall." },
    ],
    closing: "Wondering if your bathroom is a fit? Most tubs convert beautifully — get a free in-home assessment and exact quote.",
  },
  {
    slug: "full-bathroom-remodel",
    navLabel: "Full Bathroom Remodel",
    title: "Full Bathroom Remodeling",
    heroHeadline: "Reimagine Your Entire Bathroom, Managed End to End",
    intro:
      "From vanities and flooring to lighting and fixtures, our design team plans the whole room and our installers deliver it — one crew, one timeline, one warranty.",
    bullets: [
      { title: "Complete design service", body: "Materials, colors and layout chosen with a designer, visualized before we start." },
      { title: "Licensed trades in-house", body: "Plumbing and electrical handled by our own licensed professionals." },
      { title: "Real timelines", body: "A written schedule up front — and a crew that shows up when it says." },
      { title: "Everything warrantied", body: "One workmanship warranty covers the entire room, not just the shower." },
    ],
    closing: "Bring us the bathroom you have and the Pinterest board you love — we'll bridge the two with a firm quote.",
  },
  {
    slug: "bathtubs-and-more",
    navLabel: "Bathtubs & More",
    title: "Bathtubs & More",
    heroHeadline: "Soaking Tubs, Tub Surrounds and Fresh Fixtures",
    intro:
      "Love a good soak? We install new bathtubs, seamless tub surrounds, and the faucets and finishing touches that make a bath feel brand new.",
    bullets: [
      { title: "New tub installation", body: "Soaker, standard or deep-soak tubs professionally set and plumbed." },
      { title: "Seamless tub surrounds", body: "Grout-free walls around your tub that wipe clean and never mold." },
      { title: "Fixture upgrades", body: "Modern valves, spouts and shower heads that end the drips." },
      { title: "Repair or replace advice", body: "Honest guidance on whether your current tub is worth keeping." },
    ],
    closing: "Tell us how your family uses the bath — we'll recommend the right tub and give you a firm price on the spot.",
  },
  {
    slug: "walk-in-bathtubs",
    navLabel: "Walk-In Bathtubs",
    title: "Walk-In Bathtubs",
    heroHeadline: "Bathe Safely and Independently Again",
    intro:
      "A walk-in bathtub combines a watertight door, built-in seat and grab-ready design so you can enjoy a deep, warm soak without climbing over a tub wall.",
    bullets: [
      { title: "Ultra-low entry door", body: "A sealed, swing-in door with a threshold of just a few inches." },
      { title: "Built-in seating", body: "Bathe comfortably seated, with controls within easy reach." },
      { title: "Hydrotherapy options", body: "Optional air and water jets soothe joints and muscles." },
      { title: "Installed by specialists", body: "Fitted, sealed and tested by our own certified installers." },
    ],
    closing: "Ask about accessibility financing — a safer bath may be more affordable than you think.",
  },
  {
    slug: "bath-wall-systems",
    navLabel: "Bath Wall Systems",
    title: "Bath Wall Systems",
    heroHeadline: "Beautiful Walls With Zero Grout to Scrub",
    intro:
      "Our large-format wall systems install right over your existing layout in marble, stone and tile looks — watertight, durable and effortless to clean.",
    bullets: [
      { title: "Dozens of designer looks", body: "Marble, slate, subway and modern patterns to match any style." },
      { title: "Non-porous surface", body: "Mold and mildew have nowhere to grow — a wipe keeps walls like new." },
      { title: "Installed in about a day", body: "Most wall systems go in over one working day." },
      { title: "Backed for life", body: "Wall systems carry a lifetime warranty against cracking and fading." },
    ],
    closing: "See the wall styles in person — book a free design visit and we'll bring samples to your door.",
  },
  {
    slug: "bathroom-safety",
    navLabel: "Bathroom Safety",
    title: "Bathroom Safety Upgrades",
    heroHeadline: "Stay Safe, Comfortable and Independent at Home",
    intro:
      "Small changes make a big difference: grab bars, low thresholds, slip-resistant floors and seating that let you or a loved one bathe with confidence.",
    bullets: [
      { title: "Designer grab bars", body: "Rated support that looks like part of the design — never an afterthought." },
      { title: "Low & no-threshold entries", body: "Barrier-free showers that welcome walkers and wheelchairs." },
      { title: "Slip-resistant surfaces", body: "Textured bases and flooring that grip even when wet." },
      { title: "Comfort-height seating", body: "Built-in or fold-away benches placed exactly where needed." },
    ],
    closing: "We'll assess your bathroom's safety for free and recommend only what genuinely helps.",
  },
];

export function getService(slug: string): ServiceInfo | undefined {
  return services.find((s) => s.slug === slug);
}
