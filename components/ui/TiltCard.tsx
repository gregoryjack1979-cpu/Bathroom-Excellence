"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import clsx from "clsx";
import type { ReactNode } from "react";
import { useMotionPrefs } from "@/lib/hooks/useMotionPrefs";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

/**
 * Pointer-tracking 3D tilt with a soft glass glare. Disabled automatically on
 * touch devices and under reduced motion.
 */
export function TiltCard({ children, className, maxTilt = 5 }: TiltCardProps) {
  const { pointerFine, reducedMotion } = useMotionPrefs();
  const active = pointerFine && !reducedMotion;

  const rx = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 });
  const ry = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 });
  const gx = useSpring(useMotionValue(50), { stiffness: 180, damping: 24 });
  const gy = useSpring(useMotionValue(50), { stiffness: 180, damping: 24 });
  const glare = useMotionTemplate`radial-gradient(340px circle at ${gx}% ${gy}%, rgba(255,255,255,0.32), transparent 62%)`;

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!active || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    ry.set((px - 0.5) * 2 * maxTilt);
    rx.set(-(py - 0.5) * 2 * maxTilt);
    gx.set(px * 100);
    gy.set(py * 100);
  };
  const onPointerLeave = () => {
    rx.set(0);
    ry.set(0);
    gx.set(50);
    gy.set(50);
  };

  return (
    <div className="[perspective:1000px]">
      <motion.div
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        style={active ? { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" } : undefined}
        className={clsx("group relative", className)}
      >
        {children}
        {active && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: glare }}
          />
        )}
      </motion.div>
    </div>
  );
}
