"use client";

import { useEffect, useRef } from "react";

const TRAIL_COUNT = 4;
const INTERACTIVE =
  "a, button, [role='button'], input, textarea, select, label, summary, [data-cursor='grow']";

/**
 * Water-droplet cursor for fine-pointer devices. The overlay is fully
 * pointer-events-none, positions are lerped in a single rAF loop with direct
 * style writes (no React state per frame), and the native cursor is restored
 * on unmount. Text fields keep their native I-beam via CSS.
 */
export function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    document.documentElement.classList.add("has-custom-cursor");

    const main = root.querySelector<HTMLElement>("[data-cursor-main]")!;
    const scaleEl = root.querySelector<HTMLElement>("[data-cursor-scale]")!;
    const dots = Array.from(root.querySelectorAll<HTMLElement>("[data-cursor-dot]"));

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    const points = Array.from({ length: TRAIL_COUNT + 1 }, () => ({
      x: targetX,
      y: targetY,
    }));
    let raf = 0;
    let shown = false;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!shown) {
        shown = true;
        root.style.opacity = "1";
        // Snap everything to the pointer so the trail doesn't streak in.
        points.forEach((p) => {
          p.x = targetX;
          p.y = targetY;
        });
      }
    };
    const onLeave = () => {
      shown = false;
      root.style.opacity = "0";
    };
    const onOver = (e: PointerEvent) => {
      const t = e.target;
      const grow = t instanceof Element && !!t.closest(INTERACTIVE);
      scaleEl.dataset.hover = grow ? "true" : "false";
    };
    const onDown = () => {
      scaleEl.dataset.pressed = "true";
    };
    const onUp = () => {
      scaleEl.dataset.pressed = "false";
    };

    const loop = () => {
      // Head chases the pointer; each trail dot chases its predecessor.
      points[0].x += (targetX - points[0].x) * 0.22;
      points[0].y += (targetY - points[0].y) * 0.22;
      for (let i = 1; i < points.length; i++) {
        points[i].x += (points[i - 1].x - points[i].x) * 0.32;
        points[i].y += (points[i - 1].y - points[i].y) * 0.32;
      }
      main.style.transform = `translate3d(${points[0].x}px, ${points[0].y}px, 0)`;
      dots.forEach((dot, i) => {
        const p = points[i + 1];
        dot.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      });
      raf = requestAnimationFrame(loop);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[10000] opacity-0 transition-opacity duration-200"
    >
      {/* Trail dots (rendered beneath the head) */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <span
          key={i}
          data-cursor-dot
          className="absolute left-0 top-0 rounded-full bg-teal-400/40"
          style={{
            width: 10 - i * 2,
            height: 10 - i * 2,
            marginLeft: -(10 - i * 2) / 2,
            marginTop: -(10 - i * 2) / 2,
            opacity: 0.45 - i * 0.09,
          }}
        />
      ))}
      {/* Droplet head */}
      <span data-cursor-main className="absolute left-0 top-0 will-change-transform">
        <span
          data-cursor-scale
          data-hover="false"
          data-pressed="false"
          className="block -translate-x-1/2 -translate-y-1/2 transition-transform duration-150 ease-out data-[hover=true]:scale-150 data-[pressed=true]:scale-90"
        >
          <svg width="26" height="30" viewBox="0 0 26 30" fill="none">
            <defs>
              <radialGradient id="cursor-drop" cx="38%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="42%" stopColor="#bfe3ec" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#2a93ac" stopOpacity="0.85" />
              </radialGradient>
            </defs>
            <path
              d="M13 1.5C13 1.5 3 13.2 3 19.4a10 10 0 0 0 20 0C23 13.2 13 1.5 13 1.5Z"
              fill="url(#cursor-drop)"
              stroke="rgba(255,255,255,0.75)"
              strokeWidth="1"
            />
            <ellipse cx="9.4" cy="17.2" rx="2.5" ry="3.6" fill="white" opacity="0.65" transform="rotate(-18 9.4 17.2)" />
          </svg>
        </span>
      </span>
    </div>
  );
}
