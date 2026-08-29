"use client";

/**
 * Water splash burst at (x, y) in viewport coordinates: a bright glass flash,
 * two expanding ripple rings and a fan of droplets. Used when visitors click
 * imagery (gallery cards, before/after). Plain DOM nodes, self-removing —
 * no React re-render. Skipped under reduced motion by callers.
 */
export function waterSplash(x: number, y: number) {
  if (typeof document === "undefined") return;
  let layer = document.getElementById("fx-splash-layer");
  if (!layer) {
    layer = document.createElement("div");
    layer.id = "fx-splash-layer";
    layer.setAttribute("aria-hidden", "true");
    layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9995";
    document.body.appendChild(layer);
  }

  const make = (cls: string, vars: Record<string, string>) => {
    const el = document.createElement("span");
    el.className = cls;
    el.style.setProperty("--x", `${x}px`);
    el.style.setProperty("--y", `${y}px`);
    for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
    el.addEventListener("animationend", () => el.remove(), { once: true });
    window.setTimeout(() => el.remove(), 900); // safety net
    layer!.appendChild(el);
  };

  make("fx-splash-flash", {});
  make("fx-splash-ring", { "--delay": "0ms" });
  make("fx-splash-ring", { "--delay": "110ms" });

  const drops = 9;
  for (let i = 0; i < drops; i++) {
    const angle = (i / drops) * Math.PI * 2 + Math.random() * 0.5;
    const dist = 46 + Math.random() * 52;
    make("fx-splash-drop", {
      "--dx": `${Math.cos(angle) * dist}px`,
      "--dy": `${Math.sin(angle) * dist - 18}px`,
      "--size": `${7 + Math.random() * 7}px`,
    });
  }
}
