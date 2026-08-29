/**
 * Frameless glass shower door with chrome rail, handle and specular streaks.
 * Origin: top-left of the glass. Panel is intentionally translucent so the
 * scene behind stays visible.
 */
export function GlassDoor({
  prefix: p,
  w = 420,
  h = 560,
  droplets = false,
}: {
  prefix: string;
  w?: number;
  h?: number;
  droplets?: boolean;
}) {
  return (
    <g>
      <rect width={w} height={h} rx="4" fill={`url(#${p}-glass)`} stroke="#9fb4bc" strokeWidth="3" strokeOpacity="0.9" />
      {/* diagonal specular streaks */}
      <path d={`M${w * 0.18} 0 L${w * 0.34} 0 L${w * 0.1} ${h} L${w * 0.02} ${h} Z`} fill="#ffffff" opacity="0.22" />
      <path d={`M${w * 0.5} 0 L${w * 0.56} 0 L${w * 0.3} ${h} L${w * 0.26} ${h} Z`} fill="#ffffff" opacity="0.13" />
      {/* chrome top rail + rollers */}
      <rect x="-14" y="-16" width={w + 28} height="14" rx="7" fill={`url(#${p}-chrome-h)`} />
      <circle cx={w * 0.22} cy="-9" r="10" fill={`url(#${p}-chrome-h)`} />
      <circle cx={w * 0.78} cy="-9" r="10" fill={`url(#${p}-chrome-h)`} />
      {/* vertical handle */}
      <rect x="26" y={h * 0.32} width="11" height="150" rx="5.5" fill={`url(#${p}-chrome-v)`} />
      <rect x="29" y={h * 0.32 + 6} width="3" height="138" rx="1.5" fill="#ffffff" opacity="0.6" />
      {droplets && (
        <g fill="#bfe3ec" opacity="0.65">
          <circle cx={w * 0.62} cy={h * 0.28} r="4" />
          <circle cx={w * 0.7} cy={h * 0.45} r="3" />
          <circle cx={w * 0.55} cy={h * 0.6} r="3.5" />
          <circle cx={w * 0.8} cy={h * 0.66} r="2.6" />
          <circle cx={w * 0.66} cy={h * 0.8} r="3" />
          <path d={`M${w * 0.62} ${h * 0.28} q2 26 0 40`} stroke="#bfe3ec" strokeWidth="2" fill="none" opacity="0.5" />
        </g>
      )}
    </g>
  );
}
