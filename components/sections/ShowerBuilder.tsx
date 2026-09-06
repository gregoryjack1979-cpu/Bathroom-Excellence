"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { Button } from "@/components/ui/Button";
import { useMotionPrefs } from "@/lib/hooks/useMotionPrefs";
import { EXTRAS, SHOWER_LOOKS } from "@/lib/builderOptions";

/**
 * "Choose Your Look" — a configurator laid out like the in-home design tool:
 * collapsible option groups on the right, the result on the left. Picking a
 * style swaps in a photograph of a real finished job rather than a rendering,
 * and the extras build a short brief the visitor carries into the estimate.
 */
export function ShowerBuilder() {
  const [lookId, setLookId] = useState(SHOWER_LOOKS[0].id);
  const [extras, setExtras] = useState<string[]>([]);
  const [openGroup, setOpenGroup] = useState<string | null>("style");
  const { reducedMotion } = useMotionPrefs();

  const look = SHOWER_LOOKS.find((l) => l.id === lookId) ?? SHOWER_LOOKS[0];
  const chosen = EXTRAS.filter((e) => extras.includes(e.id));

  const toggleExtra = (id: string) =>
    setExtras((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <section id="design-your-shower" className="bg-mist py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Choose your look"
          title="Find the Style You Want"
          subtitle="Every look here is a real shower we built. Pick the one closest to what you have in mind, add the features you want, and bring it to your free estimate."
        />

        <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-start">
          {/* the result */}
          <AnimateIn className="min-w-0">
            <div className="chrome-edge overflow-hidden rounded-card shadow-lift">
              <div className="relative aspect-[4/3] w-full bg-porcelain">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={look.id}
                    initial={reducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reducedMotion ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={look.image}
                      alt={look.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <div aria-live="polite" className="mt-4">
              <h3 className="font-sans text-lg font-semibold text-ink">{look.label}</h3>
              <p className="mt-1 text-[15px] leading-relaxed">{look.caption}</p>
              <p className="mt-2 text-[13px] text-body">
                <span className="font-semibold text-ink">Walls:</span> {look.walls}
                <span className="px-2 text-ink/25">|</span>
                <span className="font-semibold text-ink">Finish:</span> {look.finish}
              </p>
            </div>
          </AnimateIn>

          {/* option groups */}
          <AnimateIn delay={0.1} className="min-w-0">
            <div className="overflow-hidden rounded-card bg-white shadow-card">
              <OptionGroup
                id="style"
                label="Wall Style &amp; Finish"
                summary={look.label}
                open={openGroup === "style"}
                onToggle={setOpenGroup}
                reducedMotion={reducedMotion}
              >
                <ul role="list">
                  {SHOWER_LOOKS.map((l) => {
                    const on = l.id === lookId;
                    return (
                      <li key={l.id}>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => setLookId(l.id)}
                          className={clsx(
                            "flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors",
                            on ? "bg-teal-50 text-teal-800" : "text-body hover:bg-porcelain",
                          )}
                        >
                          <span aria-hidden="true" className="grid h-4 w-4 shrink-0 place-items-center text-teal-700">
                            {on && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                          <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md">
                            <Image src={l.image} alt="" fill sizes="56px" className="object-cover" />
                          </span>
                          <span className={clsx("text-[14px]", on ? "font-semibold" : "font-medium")}>{l.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </OptionGroup>

              <OptionGroup
                id="features"
                label="Features"
                summary={chosen.length ? `${chosen.length} selected` : "None yet"}
                open={openGroup === "features"}
                onToggle={setOpenGroup}
                reducedMotion={reducedMotion}
              >
                <ul role="list">
                  {EXTRAS.map((e) => {
                    const on = extras.includes(e.id);
                    return (
                      <li key={e.id}>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggleExtra(e.id)}
                          className={clsx(
                            "flex w-full items-start gap-3 px-5 py-2.5 text-left transition-colors",
                            on ? "bg-teal-50" : "hover:bg-porcelain",
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={clsx(
                              "mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded border transition-colors",
                              on ? "border-teal-700 bg-teal-700 text-white" : "border-ink/25 bg-white",
                            )}
                          >
                            {on && (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className={clsx("block text-[14px] leading-tight", on ? "font-semibold text-teal-800" : "font-medium text-ink")}>
                              {e.label}
                            </span>
                            <span className="mt-0.5 block text-[12px] leading-snug text-body">{e.hint}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </OptionGroup>

              <div className="border-t border-ink/10 p-6">
                <p className="text-[13px] leading-relaxed text-body">
                  <span className="font-semibold text-ink">Your pick:</span> {look.label}
                  {chosen.length > 0 && <> with {chosen.map((e) => e.label.toLowerCase()).join(", ")}</>}
                </p>
                <Button href="/#free-estimate" size="lg" className="mt-4 w-full justify-center">
                  Get a Quote on This Look
                </Button>
              </div>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}

/** One collapsible option group — header always visible, list expands. */
function OptionGroup({
  id,
  label,
  summary,
  open,
  onToggle,
  reducedMotion,
  children,
}: {
  id: string;
  label: string;
  summary: string;
  open: boolean;
  onToggle: (id: string | null) => void;
  reducedMotion: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-ink/10">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`group-${id}`}
          onClick={() => onToggle(open ? null : id)}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-porcelain"
        >
          <span className="font-sans text-[15px] font-semibold text-ink">{label}</span>
          <span className="flex items-center gap-2.5">
            <span className="truncate text-[13px] text-body">{summary}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className={clsx("shrink-0 text-ink/45 transition-transform duration-200", open && "rotate-180")}
            >
              <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`group-${id}`}
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
