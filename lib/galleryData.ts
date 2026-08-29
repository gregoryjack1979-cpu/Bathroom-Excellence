import type { GalleryCategory, GalleryItem } from "./types";

export const GALLERY_CATEGORIES: { value: GalleryCategory | "all"; label: string }[] = [
  { value: "all", label: "All Projects" },
  { value: "popular", label: "Popular Shower Designs" },
  { value: "walk-in", label: "Walk-In Showers" },
  { value: "multi-piece", label: "Two & Three-Piece Showers" },
  { value: "alcove", label: "Alcove Shower Bases" },
  { value: "modern", label: "Modern Shower Remodels" },
];

/**
 * Gallery projects. `variant` selects the SVG scene styling in
 * components/gallery/GalleryScene.tsx; map a photo slot (gallery-<n>) in
 * config/site.ts to replace any item with real photography.
 */
export const galleryItems: GalleryItem[] = [
  { id: "g1", title: "Marble Serenity Walk-In", description: "Barrier-free entry with a teak bench, rainfall head and designer grab bar.", category: "walk-in", variant: 0 },
  { id: "g2", title: "Sandstone Spa Retreat", description: "Warm sandstone-look walls with brass accents and a frameless glass door.", category: "popular", variant: 1 },
  { id: "g3", title: "Coastal Sage Alcove", description: "A compact alcove base wrapped in calming sage panels — big feel, small footprint.", category: "alcove", variant: 2 },
  { id: "g4", title: "Graphite Statement Shower", description: "Deep graphite walls with polished chrome and a mosaic feature niche.", category: "modern", variant: 3 },
  { id: "g5", title: "Classic Carrara Refresh", description: "Bright Carrara-look panels and simple chrome trim — a timeless favorite.", category: "popular", variant: 4 },
  { id: "g6", title: "Two-Piece Comfort Suite", description: "A two-piece wall system with integrated seat, installed in a single day.", category: "multi-piece", variant: 5 },
  { id: "g7", title: "Accessible Ocean Walk-In", description: "Zero-threshold entry, dual grab bars and a hand-held head within easy reach.", category: "walk-in", variant: 6 },
  { id: "g8", title: "Three-Piece Family Bath", description: "Durable three-piece surround built for a busy family bathroom.", category: "multi-piece", variant: 7 },
  { id: "g9", title: "Alcove Base + Glass Combo", description: "New low-curb alcove base paired with clear sliding glass.", category: "alcove", variant: 8 },
  { id: "g10", title: "Midnight Modern Remodel", description: "Moody slate tones, linear drain and warm recessed lighting.", category: "modern", variant: 9 },
  { id: "g11", title: "Rainfall Retreat", description: "Ceiling rainfall shower with a bench and full-height mosaic niche.", category: "popular", variant: 10 },
  { id: "g12", title: "Minimalist Chrome Remodel", description: "Clean white panels, chrome details and nothing you don't need.", category: "modern", variant: 11 },
];
