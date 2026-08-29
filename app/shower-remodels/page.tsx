import type { Metadata } from "next";
import HomePage from "../page";

/**
 * The flagship Shower Remodels experience IS the homepage; this route serves
 * the nav link on static hosting (no server redirects there). Canonical
 * points at "/" so search engines index one copy.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default HomePage;
