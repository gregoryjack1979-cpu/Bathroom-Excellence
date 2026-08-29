"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { useMotionPrefs } from "@/lib/hooks/useMotionPrefs";

/**
 * One-shot intro: a droplet falls, ripples, the logo appears, the page fades
 * in. Hard-capped at ~1.1s, skipped for reduced motion and repeat views in
 * the same browser session.
 */
export function PageLoader() {
  const { reducedMotion } = useMotionPrefs();
  const [show, setShow] = useState<boolean | null>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("loader-seen") === "1";
      sessionStorage.setItem("loader-seen", "1");
    } catch {
      /* storage unavailable — just play it */
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || media) {
      setShow(false);
      return;
    }
    setShow(true);
    const t = window.setTimeout(() => setShow(false), 1150);
    return () => window.clearTimeout(t);
  }, []);

  if (reducedMotion) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[11000] grid place-items-center bg-porcelain"
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          aria-hidden="true"
        >
          <div className="relative flex flex-col items-center">
            {/* falling droplet */}
            <motion.svg
              width="30" height="35" viewBox="0 0 26 30"
              initial={{ y: -110, opacity: 0 }}
              animate={{ y: 0, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.5, ease: "easeIn", times: [0, 0.25, 0.85, 1] }}
              className="absolute -top-2"
            >
              <path d="M13 1.5C13 1.5 3 13.2 3 19.4a10 10 0 0 0 20 0C23 13.2 13 1.5 13 1.5Z" fill="#2a93ac" />
            </motion.svg>
            {/* ripple rings */}
            {[0, 1].map((i) => (
              <motion.span
                key={i}
                className="absolute top-6 h-6 w-6 rounded-full border-2 border-teal-500/70"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 4 + i * 2, opacity: [0, 0.7, 0] }}
                transition={{ delay: 0.45 + i * 0.12, duration: 0.55, ease: "easeOut" }}
              />
            ))}
            {/* logo reveal */}
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.55, duration: 0.35 }}
              className="mt-14"
            >
              <Logo className="scale-125" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
