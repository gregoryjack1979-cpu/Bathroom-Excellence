"use client";

import { useMotionValue, useSpring, type MotionValue } from "framer-motion";
import { useCallback } from "react";

export interface MouseParallax {
  /** Normalized pointer position within the bound element, -1 … 1 */
  x: MotionValue<number>;
  y: MotionValue<number>;
  bind: {
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerLeave: () => void;
  };
}

/**
 * Spring-smoothed, normalized mouse position for parallax layers.
 * Spread `bind` onto the tracked section; multiply x/y by a per-layer depth.
 */
export function useMouseParallax(stiffness = 55, damping = 16): MouseParallax {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness, damping });
  const y = useSpring(rawY, { stiffness, damping });

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (e.pointerType !== "mouse") return;
      const rect = e.currentTarget.getBoundingClientRect();
      rawX.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
      rawY.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
    },
    [rawX, rawY],
  );
  const onPointerLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return { x, y, bind: { onPointerMove, onPointerLeave } };
}
