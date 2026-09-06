import { withBasePath } from "@/config/site";

/**
 * Looks a visitor can browse in the "Choose Your Look" picker. Each one is a
 * real finished job we can point to, so the photo shown is the actual result
 * — not a rendering. Add a look by dropping a photo in /public/images and
 * adding an entry here.
 */
export interface ShowerLook {
  id: string;
  label: string;
  /** Short line under the big photo */
  caption: string;
  walls: string;
  finish: string;
  image: string;
  alt: string;
}

export const SHOWER_LOOKS: ShowerLook[] = [
  {
    id: "marble-black",
    label: "Marble & Black",
    caption: "Veined marble-look walls with matte-black rail, valve and hardware.",
    walls: "Marble-look panels",
    finish: "Matte black",
    image: withBasePath("/images/gallery-14.jpg"),
    alt: "Marble-look shower walls behind a sliding glass door with matte-black hardware",
  },
  {
    id: "marble-nickel",
    label: "Marble & Nickel",
    caption: "Low-threshold walk-in with a fold-down teak seat and brushed-nickel trim.",
    walls: "Marble-look panels",
    finish: "Brushed nickel",
    image: withBasePath("/images/gallery-15.jpg"),
    alt: "Walk-in marble-look shower with a teak fold-down seat and grab bar",
  },
  {
    id: "warm-stone",
    label: "Warm Stone",
    caption: "Seamless greige stone-look panels over a tub, with matte-black fittings.",
    walls: "Stone-look panels",
    finish: "Matte black",
    image: withBasePath("/images/service-bath-wall-systems.jpg"),
    alt: "Warm stone-look wall panels around a bathtub with matte-black fixtures",
  },
  {
    id: "classic-marble",
    label: "Classic Marble",
    caption: "Bright marble surround on a tub-and-shower combo with a storage niche.",
    walls: "Marble-look panels",
    finish: "Brushed nickel",
    image: withBasePath("/images/service-bathtubs-and-more.jpg"),
    alt: "Marble tub and shower combination with brushed-nickel fixtures and a niche",
  },
  {
    id: "white-subway",
    label: "White Subway",
    caption: "Crisp white subway walls with a recessed niche and a straight grab bar.",
    walls: "Subway-look panels",
    finish: "Brushed nickel",
    image: withBasePath("/images/service-bathroom-safety.jpg"),
    alt: "White subway-tile shower wall with a recessed niche and brushed-nickel grab bar",
  },
];

/** Extras a visitor can add to the estimate request. */
export interface ExtraOption {
  id: string;
  label: string;
  hint: string;
}

export const EXTRAS: ExtraOption[] = [
  { id: "glass-door", label: "Glass Door", hint: "Frameless or sliding glass" },
  { id: "niche", label: "Built-In Storage", hint: "Recessed shelf niche" },
  { id: "grab-bar", label: "Safety Bar", hint: "Designer-grade grab bar" },
  { id: "seat", label: "Shower Seat", hint: "Fold-down or built-in bench" },
  { id: "low-threshold", label: "Low Threshold", hint: "Easy, safer step-in" },
  { id: "handheld", label: "Handheld Sprayer", hint: "Alongside the main head" },
];
