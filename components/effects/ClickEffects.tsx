"use client";

import { useEffect, useRef } from "react";

const MAX_RIPPLES = 6;

/**
 * Water-ripple + glass-flash click feedback, spawned at the exact pointer
 * position via one delegated capture-phase listener. Nodes are plain DOM
 * (no React re-render per click) and self-remove on animation end.
 */
export function ClickEffects() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return; // left/primary presses only

      if (container.childElementCount >= MAX_RIPPLES * 2) {
        container.firstElementChild?.remove();
        container.firstElementChild?.remove();
      }

      const ring = document.createElement("span");
      ring.className = "fx-ripple";
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;

      const flash = document.createElement("span");
      flash.className = "fx-ripple-inner";
      flash.style.left = `${e.clientX}px`;
      flash.style.top = `${e.clientY}px`;

      const cleanup = (el: HTMLElement) => {
        const t = window.setTimeout(() => el.remove(), 700);
        el.addEventListener(
          "animationend",
          () => {
            window.clearTimeout(t);
            el.remove();
          },
          { once: true },
        );
      };
      cleanup(ring);
      cleanup(flash);
      container.append(flash, ring);
    };

    document.addEventListener("pointerdown", onPointerDown, {
      capture: true,
      passive: true,
    });
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, {
        capture: true,
      });
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9990]"
    />
  );
}
