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
  { id: "g1", title: "Marble Spa Shower with Bench", description: "Marble-look walls, corner shelves and a fold-down bench under a handheld rain head.", category: "popular", variant: 0 },
  { id: "g2", title: "Marble Slider on Navy", description: "Sliding chrome glass door and bright marble surround set against deep navy walls.", category: "popular", variant: 4 },
  { id: "g3", title: "Subway Classic, Matte Black", description: "Crisp white subway panels with matte-black grab bars and fixtures.", category: "popular", variant: 11 },
  { id: "g4", title: "Low-Threshold Twin-Seat Walk-In", description: "Barrier-free walk-in with two molded seats and full-width grab bars.", category: "walk-in", variant: 0 },
  { id: "g5", title: "Biscuit Walk-In with Bench", description: "Warm biscuit tones, built-in bench and storage in an easy-entry layout.", category: "walk-in", variant: 6 },
  { id: "g6", title: "Bright Two-Piece Suite", description: "A luminous two-piece wall system paired with a black double vanity.", category: "multi-piece", variant: 5 },
  { id: "g7", title: "Three-Piece Family Shower", description: "A durable three-piece surround built to shrug off busy mornings.", category: "multi-piece", variant: 7 },
  { id: "g8", title: "Alcove with Mosaic Niche", description: "Compact alcove behind a pivot glass door with a tiled storage niche.", category: "alcove", variant: 2 },
  { id: "g9", title: "Tan Alcove Refresh", description: "Warm tan surround and chrome slider — a one-day alcove transformation.", category: "alcove", variant: 8 },
  { id: "g10", title: "Dark Stone Panorama", description: "Dramatic stone-look panels wrap this statement shower corner to corner.", category: "modern", variant: 3 },
  { id: "g11", title: "Espresso Tile Frameless", description: "Espresso tile, frameless glass and a recessed double niche.", category: "modern", variant: 9 },
  { id: "g12", title: "Chrome Frameless Slider", description: "Minimalist frameless slider with polished chrome rail and hardware.", category: "modern", variant: 11 },
];
