import type { ServiceInfo } from "./types";

/** Content for the lightweight service pages (app/services/[slug]). */
export const services: ServiceInfo[] = [
  {
    slug: "tub-to-shower-conversions",
    navLabel: "Tub to Shower Conversions",
    title: "Tub-to-Shower Conversions",
    heroHeadline: "Your Old Tub Could Be a Beautiful Shower",
    intro:
      "Sinking into a bathtub can be very relaxing — but showers provide plenty of benefits. You can get in and out more easily, you'll use less water and you'll have more space to move around while bathing. We take care of tub-to-shower conversions for clients in St. Charles, MO and the Greater St. Louis Area, and we do fully custom work, so you'll have full creative control over how your shower ends up.",
    bullets: [
      { title: "An acrylic or tile base", body: "Choose the base material and look that fits your bathroom and budget." },
      { title: "A custom shower door", body: "Framed, semi-frameless or frameless glass, sized to your exact opening." },
      { title: "Pressure-balanced faucets", body: "Steady, safe water temperature — no more shock when someone runs a tap." },
      { title: "Grab bars & storage options", body: "If you have accessibility concerns, we keep all of your needs in mind." },
    ],
    closing: "Learn more about bathtub-to-shower conversions when you call today — your shower will be beautiful, comfortable and safe.",
  },
  {
    slug: "full-bathroom-remodel",
    navLabel: "Full Bathroom Remodel",
    title: "Full Bathroom Remodeling",
    heroHeadline: "Create a New Style for Your Space",
    intro:
      "Time for a bathroom remodel? Turn to our professionals in the St. Charles, MO and Greater St. Louis area. We manage extensive remodeling projects from start to finish — update this essential space and create a luxurious room that makes you feel right at home.",
    bullets: [
      { title: "Replace faucets and fixtures", body: "New sinks, toilets, bidets and hardware, professionally plumbed." },
      { title: "Upgrade your tub or shower", body: "From a total remodel to a tub-to-shower conversion — any size project." },
      { title: "Build a new vanity", body: "Cabinets and countertops designed around your storage and style." },
      { title: "Walls, flooring & lighting", body: "Repaint, re-floor and re-light the room so everything feels new." },
    ],
    closing: "Turn your boring bathroom into a refreshing space — contact our bathroom remodeling company today to discuss your ideas with a pro.",
  },
  {
    slug: "bathtubs-and-more",
    navLabel: "Bathtubs & More",
    title: "Bathtubs & More",
    heroHeadline: "Soaking Tubs, Tub Surrounds and Fresh Fixtures",
    intro:
      "Love a good soak? We install new bathtubs, seamless tub surrounds, and the faucets and finishing touches that make a bath feel brand new — across St. Charles, MO and the Greater St. Louis Area.",
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
    heroHeadline: "Bathe Comfortably and Safely",
    intro:
      "Hitting your leg on the side of the tub when you're climbing in or out is a great way to ruin your day — and it can be dangerous. A walk-in bathtub gives you the same bathing experience without the need for climbing: open the door, step in, close the door and enjoy your bath. Our walk-in bathtubs are made in the USA.",
    bullets: [
      { title: "Hydromassage spa system", body: "A hydrotherapy system that will make your tub feel like a spa." },
      { title: "Heated seats and a headrest", body: "Bathe comfortably seated, warm from the moment you sit down." },
      { title: "Non-slip flooring", body: "Textured surfaces that grip even when wet." },
      { title: "Integrated safety bars", body: "Support exactly where you need it, built into the tub itself." },
    ],
    closing: "Find out more about walk-in tubs when you call us — we can complete your installation in no time.",
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
      "One in three people over 65 falls in the tub each year. Small changes make a big difference: grab bars, low thresholds, slip-resistant floors and seating that let you or a loved one bathe with confidence.",
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
