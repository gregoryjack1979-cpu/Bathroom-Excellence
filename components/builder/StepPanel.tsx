"use client";

import { useEffect, useRef, type ReactNode } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  WALL_STYLE_GROUP_LABELS,
  accentOptions,
  bathroomTypes,
  doorTypes,
  groutColors,
  roomThemes,
  safetyOptions,
  storageOptions,
  trimColors,
  wallTypes,
  windowOptions,
} from "@/lib/builder/configuratorData";
import { compatibleWallStyles, doorDisabledReason, findWallType, groutApplies, isStepApplicable } from "@/lib/builder/rules";
import { useConfigurator } from "@/lib/builder/useConfigurator";
import { useMotionPrefs } from "@/lib/hooks/useMotionPrefs";
import type { WallStyleGroup } from "@/lib/builder/types";
import { OptionCard } from "./OptionCard";
import { OptionGrid } from "./OptionGrid";

const GROUP_ORDER: WallStyleGroup[] = ["marble", "stone", "subway", "decorative"];

function Note({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "muted" }) {
  return (
    <p
      className={clsx(
        "rounded-xl border px-4 py-3 text-[13px] leading-relaxed",
        tone === "info" ? "border-teal-600/25 bg-teal-50 text-teal-900" : "border-ink/10 bg-porcelain text-body",
      )}
    >
      {children}
    </p>
  );
}

/** The options for the current step, plus Back / Next. */
export function StepPanel({ onReview }: { onReview: () => void }) {
  const c = useConfigurator();
  const { configuration: cfg, currentStep, stepIndex, steps } = c;
  const { reducedMotion } = useMotionPrefs();
  const panelRef = useRef<HTMLElement>(null);

  // when the step changes on a small screen, bring the options into view under the sticky preview
  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    const top = panelRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0 || top > window.innerHeight * 0.6) {
      panelRef.current?.scrollIntoView({ block: "start", behavior: reducedMotion ? "auto" : "smooth" });
    }
  }, [stepIndex, reducedMotion]);

  const nextIndex = (() => {
    let i = stepIndex + 1;
    while (i < steps.length && !isStepApplicable(cfg, steps[i].id)) i++;
    return i < steps.length ? i : null;
  })();

  const wallType = findWallType(cfg.wallType);

  let body: ReactNode;
  switch (currentStep.id) {
    case "bathroom-type":
      body = (
        <OptionGrid label={currentStep.heading} columns={3}>
          {bathroomTypes.map((o) => (
            <OptionCard key={o.id} {...o} selected={cfg.bathroomType === o.id} onSelect={() => c.setBathroomType(o.id)} />
          ))}
        </OptionGrid>
      );
      break;

    case "room":
      body = (
        <OptionGrid label={currentStep.heading} columns={3}>
          {roomThemes.map((o) => (
            <OptionCard key={o.id} {...o} selected={cfg.roomTheme === o.id} onSelect={() => c.setRoomTheme(o.id)} />
          ))}
        </OptionGrid>
      );
      break;

    case "wall-type":
      body = (
        <OptionGrid label={currentStep.heading} columns={2}>
          {wallTypes.map((o) => (
            <OptionCard key={o.id} {...o} selected={cfg.wallType === o.id} onSelect={() => c.setWallType(o.id)} />
          ))}
        </OptionGrid>
      );
      break;

    case "wall-style": {
      const compatible = compatibleWallStyles(cfg.wallType);
      if (!wallType) {
        body = (
          <div className="space-y-3">
            <Note tone="muted">Wall designs depend on the panel system. Choose a bathwall type first.</Note>
            <button type="button" onClick={() => c.goToStep(2)} className="font-sans text-sm font-semibold text-teal-700 underline-offset-2 hover:underline">
              Go to Step 3: Bathwall Type →
            </button>
          </div>
        );
        break;
      }
      const groups = GROUP_ORDER.filter((g) => compatible.some((s) => s.group === g));
      body = (
        <div className="space-y-5">
          {compatible.length === 1 && (
            <Note>
              {wallType.name} panels come in one finish — <strong>{compatible[0].name}</strong> is selected for you.
            </Note>
          )}
          {groups.map((g) => (
            <div key={g}>
              {groups.length > 1 && (
                <h3 className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700">{WALL_STYLE_GROUP_LABELS[g]}</h3>
              )}
              <OptionGrid label={`${WALL_STYLE_GROUP_LABELS[g]} designs`} columns={3}>
                {compatible
                  .filter((s) => s.group === g)
                  .map((o) => (
                    <OptionCard key={o.id} {...o} selected={cfg.wallStyle === o.id} onSelect={() => c.setWallStyle(o.id)} />
                  ))}
              </OptionGrid>
            </div>
          ))}
        </div>
      );
      break;
    }

    case "grout":
      body = groutApplies(cfg) ? (
        <OptionGrid label={currentStep.heading} columns={2}>
          {groutColors.map((o) => (
            <OptionCard key={o.id} {...o} selected={cfg.groutColor === o.id} onSelect={() => c.setGroutColor(o.id)} />
          ))}
        </OptionGrid>
      ) : (
        <Note tone="muted">
          {wallType ? `${wallType.name} panels have no grout lines` : "No wall type is chosen yet"}, so there&rsquo;s nothing to pick here. Grout colour appears for 12x12, 11x20 and subway tile.
        </Note>
      );
      break;

    case "door":
      body = (
        <div className="space-y-3">
          {cfg.bathroomType === "bathtub" && <Note>Bathtubs use a curtain rod, so a glass door isn&rsquo;t available with this bathroom type.</Note>}
          <OptionGrid label={currentStep.heading} columns={2}>
            {doorTypes.map((o) => {
              const reason = doorDisabledReason(cfg, o.id);
              return (
                <OptionCard
                  key={o.id}
                  {...o}
                  selected={cfg.doorType === o.id}
                  disabled={reason !== null}
                  disabledReason={reason}
                  onSelect={() => c.setDoorType(o.id)}
                />
              );
            })}
          </OptionGrid>
        </div>
      );
      break;

    case "trim":
      body = (
        <OptionGrid label={currentStep.heading} columns={3}>
          {trimColors.map((o) => (
            <OptionCard key={o.id} {...o} selected={cfg.trimColor === o.id} onSelect={() => c.setTrimColor(o.id)} />
          ))}
        </OptionGrid>
      );
      break;

    case "storage":
      body = (
        <OptionGrid label={currentStep.heading} columns={3}>
          {storageOptions.map((o) => (
            <OptionCard key={o.id} {...o} selected={cfg.storageOption === o.id} onSelect={() => c.setStorageOption(o.id)} />
          ))}
        </OptionGrid>
      );
      break;

    case "accent":
      body = (
        <OptionGrid label={currentStep.heading} columns={2}>
          {accentOptions.map((o) => (
            <OptionCard key={o.id} {...o} selected={cfg.decorativeAccent === o.value} onSelect={() => c.setDecorativeAccent(o.value)} />
          ))}
        </OptionGrid>
      );
      break;

    case "window":
      body = (
        <OptionGrid label={currentStep.heading} columns={2}>
          {windowOptions.map((o) => (
            <OptionCard key={o.id} {...o} selected={cfg.windowOption === o.id} onSelect={() => c.setWindowOption(o.id)} />
          ))}
        </OptionGrid>
      );
      break;

    case "safety":
      body = (
        <OptionGrid label={currentStep.heading} columns={3}>
          {safetyOptions.map((o) => (
            <OptionCard key={o.id} {...o} selected={cfg.safetyOption === o.id} onSelect={() => c.setSafetyOption(o.id)} />
          ))}
        </OptionGrid>
      );
      break;
  }

  return (
    <section ref={panelRef} aria-labelledby="builder-step-heading" className="scroll-mt-[22rem] rounded-card bg-white p-5 shadow-card sm:p-6 lg:scroll-mt-24">
      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-700">
        Step {stepIndex + 1} of {steps.length}
      </p>
      <h2 id="builder-step-heading" className="mt-1 font-display text-2xl leading-tight text-ink sm:text-[1.7rem]">
        {currentStep.heading}
      </h2>
      <p className="mt-1.5 text-[14px] leading-relaxed text-body">{currentStep.description}</p>

      <div className="mt-5 min-h-[120px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentStep.id}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {body}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-ink/10 pt-5">
        <button
          type="button"
          onClick={c.prevStep}
          disabled={c.isFirstStep}
          className="rounded-md border border-ink/15 bg-white px-4 py-2.5 font-sans text-sm font-semibold text-ink transition-colors hover:bg-porcelain disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Back
        </button>
        {nextIndex !== null ? (
          <button
            type="button"
            onClick={c.nextStep}
            className="btn-sheen min-w-0 rounded-md bg-ink px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-card transition-colors hover:bg-deep"
          >
            <span className="block truncate">Next: {steps[nextIndex].title} →</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onReview}
            className="btn-sheen rounded-md bg-gradient-to-b from-teal-500 to-teal-700 px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-card"
          >
            Review Design →
          </button>
        )}
      </div>
    </section>
  );
}
