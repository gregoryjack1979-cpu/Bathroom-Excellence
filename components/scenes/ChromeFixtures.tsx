/**
 * Fixture building blocks shared by the shower scenes. Every part is a plain
 * <g> positioned by its parent via transform, and references gradients from
 * <SceneDefs> through the same `prefix`.
 */

/** Modern ceiling-mounted rainfall head (origin: top-center of the arm). */
export function RainHead({ prefix: p, water = false }: { prefix: string; water?: boolean }) {
  return (
    <g>
      <rect x="-5" y="0" width="10" height="64" rx="3" fill={`url(#${p}-chrome-v)`} />
      <rect x="-62" y="60" width="124" height="14" rx="7" fill={`url(#${p}-chrome-h)`} />
      <rect x="-56" y="72" width="112" height="5" rx="2.5" fill="#5c6b74" />
      {water && (
        <g stroke="#9fd3e0" strokeWidth="2.4" strokeLinecap="round" opacity="0.38">
          {[-48, -32, -16, 0, 16, 32, 48].map((x, i) => (
            <line key={x} x1={x} y1="82" x2={x} y2={560 + (i % 3) * 30} />
          ))}
        </g>
      )}
    </g>
  );
}

/** Dated wall-pipe showerhead (origin: wall joint). */
export function OldShowerHead({ prefix: p }: { prefix: string }) {
  return (
    <g>
      <circle cx="0" cy="0" r="9" fill={`url(#${p}-oldmetal)`} />
      <rect x="-4" y="-64" width="8" height="64" fill={`url(#${p}-oldmetal)`} />
      <rect x="-4" y="-2" width="52" height="8" rx="4" transform="rotate(38 0 0)" fill={`url(#${p}-oldmetal)`} />
      <g transform="translate(40 32)">
        <ellipse cx="0" cy="0" rx="17" ry="12" fill={`url(#${p}-oldmetal)`} />
        <ellipse cx="0" cy="5" rx="13" ry="6" fill="#5f584a" />
      </g>
      {/* the drip */}
      <circle cx="40" cy="52" r="3.2" fill="#8fb9c6" opacity="0.85" />
      <circle cx="42" cy="86" r="2.4" fill="#8fb9c6" opacity="0.55" />
    </g>
  );
}

/** Modern thermostatic mixer bar with lever (origin: plate center). */
export function MixerBar({ prefix: p }: { prefix: string }) {
  return (
    <g>
      <rect x="-10" y="-70" width="20" height="140" rx="10" fill={`url(#${p}-chrome-v)`} />
      <circle cx="0" cy="-38" r="14" fill={`url(#${p}-chrome-h)`} />
      <circle cx="0" cy="-38" r="6" fill="#4d5b64" />
      <rect x="-3" y="24" width="6" height="44" rx="3" fill={`url(#${p}-chrome-v)`} />
      <circle cx="0" cy="24" r="9" fill={`url(#${p}-chrome-h)`} />
    </g>
  );
}

/** Dated cross-handle pair + spout (origin between handles). */
export function CrossHandles({ prefix: p }: { prefix: string }) {
  const knob = (
    <>
      <circle r="12" fill={`url(#${p}-oldmetal)`} />
      <rect x="-13" y="-3" width="26" height="6" rx="3" fill="#7a7260" />
      <rect x="-3" y="-13" width="6" height="26" rx="3" fill="#7a7260" />
      <circle r="4" fill="#d9d2bd" />
    </>
  );
  return (
    <g>
      <g transform="translate(-34 0)">{knob}</g>
      <g transform="translate(34 0)">{knob}</g>
      <path d="M-6 34 h12 v14 q0 10 12 10 h4 v8 h-4 q-24 0 -24 -20 Z" fill={`url(#${p}-oldmetal)`} />
    </g>
  );
}

/** Brushed linear drain (origin: center). */
export function LinearDrain({ prefix: p, width = 200 }: { prefix: string; width?: number }) {
  return (
    <g>
      <rect x={-width / 2} y="-7" width={width} height="14" rx="7" fill={`url(#${p}-chrome-h)`} />
      <rect x={-width / 2 + 8} y="-2.5" width={width - 16} height="5" rx="2.5" fill="#54626b" />
    </g>
  );
}

/** Safety grab bar, 45° or horizontal (origin: left end). */
export function GrabBar({ prefix: p, length = 150, angle = 0 }: { prefix: string; length?: number; angle?: number }) {
  return (
    <g transform={`rotate(${angle})`}>
      <circle cx="0" cy="0" r="10" fill={`url(#${p}-chrome-h)`} />
      <circle cx={length} cy="0" r="10" fill={`url(#${p}-chrome-h)`} />
      <rect x="0" y="-6.5" width={length} height="13" rx="6.5" fill={`url(#${p}-chrome-v)`} />
      <rect x="4" y="-5" width={length - 8} height="4" rx="2" fill="#ffffff" opacity="0.55" />
    </g>
  );
}

/** Recessed mosaic niche with a glass shelf (origin: top-left). */
export function NicheShelf({ prefix: p, w = 170, h = 120 }: { prefix: string; w?: number; h?: number }) {
  return (
    <g>
      <rect width={w} height={h} rx="6" fill={`url(#${p}-mosaic)`} stroke="#0b3542" strokeOpacity="0.35" strokeWidth="2" />
      <rect x="6" y={h / 2 - 2} width={w - 12} height="4" rx="2" fill="#cfe6ec" opacity="0.85" />
      {/* toiletries */}
      <rect x={w * 0.14} y={h * 0.18} width="16" height={h * 0.3} rx="3" fill="#e9eef0" />
      <rect x={w * 0.3} y={h * 0.1} width="12" height={h * 0.38} rx="3" fill="#cfe0e5" />
      <rect x={w * 0.16} y={h * 0.62} width="20" height={h * 0.26} rx="3" fill="#e4ebee" />
    </g>
  );
}

/** Fold-down teak bench seat (origin: wall edge, extends right). */
export function BenchSeat({ prefix: p, w = 190 }: { prefix: string; w?: number }) {
  return (
    <g>
      <rect x="0" y="0" width={w} height="16" rx="6" fill="#c9a97c" />
      <rect x="0" y="0" width={w} height="6" rx="3" fill="#e0c396" />
      {[0.2, 0.45, 0.7].map((f) => (
        <rect key={f} x={w * f} y="2" width="4" height="12" fill="#a9884f" opacity="0.6" />
      ))}
      <rect x="8" y="16" width="10" height="34" rx="4" fill={`url(#${p}-chrome-v)`} />
      <rect x={w - 18} y="16" width="10" height="34" rx="4" fill={`url(#${p}-chrome-v)`} />
    </g>
  );
}

/** Towel bar with a folded towel (origin: left bracket). */
export function TowelBar({ prefix: p, accent = "#b08d57", length = 150 }: { prefix: string; accent?: string; length?: number }) {
  return (
    <g>
      <rect x="0" y="0" width={length} height="9" rx="4.5" fill={`url(#${p}-chrome-v)`} />
      <path
        d={`M${length * 0.18} 4 h${length * 0.5} v96 q0 8 -8 8 h-${length * 0.5 - 16} q-8 0 -8 -8 Z`}
        fill={accent}
      />
      <rect x={length * 0.18} y="30" width={length * 0.5} height="7" fill="#ffffff" opacity="0.3" />
      <rect x={length * 0.18} y="66" width={length * 0.5} height="7" fill="#0b3542" opacity="0.18" />
    </g>
  );
}
