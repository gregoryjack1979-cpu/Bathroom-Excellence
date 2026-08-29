"use client";

import { MotionConfig } from "framer-motion";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface MotionPrefs {
  /** User asked for reduced motion — disable all non-essential animation. */
  reducedMotion: boolean;
  /** Precise pointer (mouse/trackpad) — enables cursor, tilt and hover FX. */
  pointerFine: boolean;
  /** Wide viewport — enables the heavier parallax/tilt effects. */
  desktop: boolean;
}

const defaultPrefs: MotionPrefs = {
  reducedMotion: false,
  pointerFine: false,
  desktop: false,
};

const MotionPrefsContext = createContext<MotionPrefs>(defaultPrefs);

export function useMotionPrefs(): MotionPrefs {
  return useContext(MotionPrefsContext);
}

/** Single shared set of matchMedia listeners for the whole app. */
export function MotionPrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<MotionPrefs>(defaultPrefs);

  useEffect(() => {
    const queries = {
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)"),
      pointerFine: window.matchMedia("(pointer: fine)"),
      desktop: window.matchMedia("(min-width: 768px)"),
    };
    const update = () =>
      setPrefs({
        reducedMotion: queries.reducedMotion.matches,
        pointerFine: queries.pointerFine.matches,
        desktop: queries.desktop.matches,
      });
    update();
    const lists = Object.values(queries);
    lists.forEach((q) => q.addEventListener("change", update));
    return () => lists.forEach((q) => q.removeEventListener("change", update));
  }, []);

  return (
    <MotionPrefsContext.Provider value={prefs}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </MotionPrefsContext.Provider>
  );
}
