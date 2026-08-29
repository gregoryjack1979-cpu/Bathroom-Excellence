/**
 * Sparse decorative layer: slow-drifting droplets, glass discs and chrome
 * rings. Purely presentational, never overlaps interactive content, and all
 * motion is CSS (auto-paused under reduced motion via the global kill-switch).
 */
export function FloatingElements({ variant = "light" }: { variant?: "light" | "dark" }) {
  const stroke = variant === "dark" ? "#57b1c4" : "#8ccbd8";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* chrome ring */}
      <svg className="absolute -left-8 top-[18%] animate-drift opacity-40" width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r="46" fill="none" stroke={stroke} strokeWidth="7" opacity="0.5" />
        <circle cx="55" cy="55" r="46" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="40 250" opacity="0.8" />
      </svg>
      {/* droplets */}
      <svg className="absolute right-[8%] top-[12%] animate-float opacity-50" width="26" height="30" viewBox="0 0 26 30">
        <path d="M13 1.5C13 1.5 3 13.2 3 19.4a10 10 0 0 0 20 0C23 13.2 13 1.5 13 1.5Z" fill={stroke} opacity="0.5" />
      </svg>
      <svg className="absolute bottom-[20%] right-[4%] animate-float-slow opacity-40" width="18" height="21" viewBox="0 0 26 30">
        <path d="M13 1.5C13 1.5 3 13.2 3 19.4a10 10 0 0 0 20 0C23 13.2 13 1.5 13 1.5Z" fill={stroke} opacity="0.5" />
      </svg>
      {/* glass tile */}
      <div className="absolute bottom-[14%] left-[6%] hidden h-14 w-14 rotate-12 animate-drift rounded-2xl border border-white/50 bg-white/20 backdrop-blur-[2px] md:block" />
      {/* wave line */}
      <svg className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-25" width="420" height="30" viewBox="0 0 420 30">
        <path d="M0 15 q35 -14 70 0 t70 0 t70 0 t70 0 t70 0 t70 0" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}
