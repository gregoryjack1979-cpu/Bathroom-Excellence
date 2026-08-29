"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useMotionPrefs } from "@/lib/hooks/useMotionPrefs";

const CustomCursor = dynamic(
  () => import("./CustomCursor").then((m) => m.CustomCursor),
  { ssr: false },
);
const ClickEffects = dynamic(
  () => import("./ClickEffects").then((m) => m.ClickEffects),
  { ssr: false },
);

/**
 * Defers the cursor + click-effect layers until the browser is idle so they
 * never compete with first paint. Touch devices skip the cursor entirely;
 * reduced motion skips both.
 */
export function EffectsMount() {
  const { reducedMotion, pointerFine } = useMotionPrefs();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const start = () => setReady(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(start, 800);
    return () => window.clearTimeout(id);
  }, []);

  if (!ready || reducedMotion) return null;

  return (
    <>
      {pointerFine && <CustomCursor />}
      <ClickEffects />
    </>
  );
}
