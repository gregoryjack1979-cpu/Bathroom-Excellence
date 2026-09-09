"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureAttribution } from "@/lib/attribution";

/**
 * Records how the visitor arrived, on the landing page and on every subsequent
 * navigation. Renders nothing.
 *
 * It has to run on arrival rather than at form submission: someone clicks an ad
 * onto the homepage, browses to a service page, and only then opens the estimate
 * wizard — by which point the click identifier has long gone from the URL.
 */
export function AttributionCapture() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    captureAttribution();
  }, [pathname, searchParams]);

  return null;
}
