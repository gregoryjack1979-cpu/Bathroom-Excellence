"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { Button } from "@/components/ui/Button";
import { ShowerSceneNew } from "@/components/scenes/ShowerSceneNew";
import { useMotionPrefs } from "@/lib/hooks/useMotionPrefs";
import {
  DEFAULT_EXTRAS,
  EXTRAS,
  FINISHES,
  WALL_STYLES,
  buildPalette,
  type ExtraId,
} from "@/lib/builderOptions";

/**
 * "Design Your Shower" — an interactive configurator. Every option repaints
 * the same layered SVG scene live, so there's no per-combination artwork to
 * ship. The running summary doubles as the brief a visitor hands us when they
 * click through to the estimate form.
 */
export function ShowerBuilder() {
  const [wallId, setWallId] = useState(WALL_STYLES[0].id);
  const [finishId, setFinishId] = useState(FINISHES[0].id);
  const [extras, setExtras] = useState<Record<ExtraId, boolean>>(DEFAULT_EXTRAS);
  const { reducedMotion } = useMotionPrefs();

  const wall = WALL_STYLES.find((w) => w.id === wallId) ?? WALL_STYLES[0];
  const finish = FINISHES.find((f) => f.id === finishId) ?? FINISHES[0];
  const palette = useMemo(() => buildPalette(wall, finish), [wall, finish]);

  const chosenExtras = EXTRAS.filter((e) => extras[e.id]);
  const toggle = (id: ExtraId) => setExtras((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <section id="design-your-shower" className="bg-mist py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Design your shower"
          title="See It Your Way Before We Build It"
          subtitle="Pick your walls, finish and features — the preview updates as you go. Bring your design to us and we'll quote it exactly."
        />

        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          {/* live preview */}
          <AnimateIn className="min-w-0">
            <div className="chrome-edge overflow-hidden rounded-card shadow-lift">
              <div className="aspect-[3/2] w-full">
                <ShowerSceneNew
                  prefix="builder"
                  className="h-full w-full"
                  palette={palette}
                  water={!reducedMotion}
                  door={extras.door}
                  niche={extras.niche}
                  grabBar={extras.grabBar}
                  bench={extras.bench}
                />
              </div>
            </div>
            <p aria-live="polite" className="mt-3 text-center text-sm text-body">
              <span className="font-semibold text-ink">{wall.label}</span> walls ·{" "}
              <span className="font-semibold text-ink">{finish.label}</span>
              {chosenExtras.length > 0 && (
                <> · {chosenExtras.map((e) => e.label).join(", ")}</>
              )}
            </p>
          </AnimateIn>

          {/* option pickers */}
          <AnimateIn delay={0.1} className="min-w-0">
            <div className="rounded-card bg-white p-6 shadow-card sm:p-8">
              <OptionGroup label="Wall Style">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {WALL_STYLES.map((w) => (
                    <SwatchButton
                      key={w.id}
                      selected={w.id === wallId}
                      swatch={w.swatch}
                      label={w.label}
                      onClick={() => setWallId(w.id)}
                    />
                  ))}
                </div>
              </OptionGroup>

              <OptionGroup label="Fixture Finish">
                <div className="grid grid-cols-3 gap-3">
                  {FINISHES.map((f) => (
                    <SwatchButton
                      key={f.id}
                      selected={f.id === finishId}
                      swatch={f.swatch}
                      label={f.label}
                      onClick={() => setFinishId(f.id)}
                    />
                  ))}
                </div>
              </OptionGroup>

              <OptionGroup label="Features">
                <div className="grid gap-3 sm:grid-cols-2">
                  {EXTRAS.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      aria-pressed={extras[e.id]}
                      onClick={() => toggle(e.id)}
                      className={clsx(
                        "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200",
                        extras[e.id]
                          ? "border-teal-600/45 bg-teal-50/70 shadow-card"
                          : "border-ink/10 bg-white hover:border-teal-500/30 hover:shadow-card",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={clsx(
                          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors",
                          extras[e.id] ? "border-teal-700 bg-teal-700 text-white" : "border-ink/25 bg-white",
                        )}
                      >
                        {extras[e.id] && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-sans text-[15px] font-semibold text-ink">{e.label}</span>
                        <span className="mt-0.5 block text-[13px] leading-snug text-body">{e.hint}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </OptionGroup>

              <div className="mt-8 border-t border-ink/10 pt-6">
                <Button href="/#free-estimate" size="lg" className="w-full justify-center">
                  Get a Quote on This Design
                </Button>
                <p className="mt-3 text-center text-[13px] leading-relaxed text-body">
                  Every option here is something we actually install — bring your
                  combination to the estimate and we&rsquo;ll price it as drawn.
                </p>
              </div>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}

function OptionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="mb-7 last:mb-0">
      <legend className="mb-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
        {label}
      </legend>
      {children}
    </fieldset>
  );
}

function SwatchButton({
  selected,
  swatch,
  label,
  onClick,
}: {
  selected: boolean;
  swatch: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={clsx(
        "group rounded-2xl border p-2 text-center transition-all duration-200",
        selected
          ? "border-teal-600/45 bg-teal-50/70 shadow-card"
          : "border-ink/10 bg-white hover:border-teal-500/30 hover:shadow-card",
      )}
    >
      <span
        aria-hidden="true"
        className={clsx(
          "block h-12 w-full rounded-xl border transition-transform duration-200 group-hover:scale-[1.03]",
          selected ? "border-teal-700/40" : "border-ink/10",
        )}
        style={{ backgroundColor: swatch }}
      />
      <span className="mt-2 block text-[12px] font-semibold leading-tight text-ink">{label}</span>
    </button>
  );
}
