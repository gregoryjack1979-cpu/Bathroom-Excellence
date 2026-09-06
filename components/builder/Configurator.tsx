"use client";

import { useEffect, useRef, useState } from "react";
import { ConfiguratorProvider, useConfigurator } from "@/lib/builder/useConfigurator";
import { BathroomPreview } from "./BathroomPreview";
import { BuilderHeader } from "./BuilderHeader";
import { BuilderUiProvider, useBuilderUi } from "./BuilderUi";
import { ConfigurationSummary } from "./ConfigurationSummary";
import { ProgressBar } from "./ProgressBar";
import { StepNavigation } from "./StepNavigation";
import { StepPanel } from "./StepPanel";

/**
 * The Bathroom Design Builder. Desktop: options on the left, the preview and
 * summary pinned on the right. Mobile: preview pinned at the top, steps below,
 * summary as a sheet at the bottom.
 */
export function Configurator() {
  return (
    <ConfiguratorProvider>
      <BuilderUiProvider>
        <Shell />
      </BuilderUiProvider>
    </ConfiguratorProvider>
  );
}

function Shell() {
  const { pendingRestore, restoreDraft, discardDraft } = useConfigurator();
  const { confirm } = useBuilderUi();
  const [sheetOpen, setSheetOpen] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  // offer a previous visit's draft back — once, when it's found
  const restore = useRef({ restoreDraft, discardDraft });
  restore.current = { restoreDraft, discardDraft };
  useEffect(() => {
    if (!pendingRestore) return;
    let cancelled = false;
    const when = new Date(pendingRestore.savedAt);
    const stamp = Number.isNaN(when.getTime()) ? "earlier" : when.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    confirm({
      title: "Restore your previous design?",
      body: `You were working on a design here (${stamp}). Pick up where you left off, or start fresh.`,
      confirmLabel: "Restore design",
      cancelLabel: "Start fresh",
    }).then((ok) => {
      if (cancelled) return;
      if (ok) restore.current.restoreDraft();
      else restore.current.discardDraft();
    });
    return () => {
      cancelled = true;
    };
  }, [pendingRestore, confirm]);

  const onReview = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      summaryRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } else {
      setSheetOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-mist text-body">
      <BuilderHeader />

      <main className="mx-auto max-w-[1600px] px-3 pb-28 pt-3 sm:px-6 sm:pt-5 lg:grid lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-6 lg:pb-10 xl:grid-cols-[440px_minmax(0,1fr)]">
        {/* preview + summary. `contents` on small screens lets the preview's own
            sticky wrapper stick against <main> (a sticky element only sticks
            inside its parent); on desktop this becomes the pinned right column. */}
        <div className="contents lg:order-2 lg:block lg:sticky lg:top-[5.5rem] lg:self-start">
          <div className="sticky top-16 z-30 -mx-3 bg-mist px-3 pb-3 pt-1 sm:-mx-6 sm:px-6 lg:static lg:m-0 lg:bg-transparent lg:p-0">
            <BathroomPreview className="mx-auto lg:max-w-[calc((100vh-12.5rem)*4/3)]" />
          </div>
          <div ref={summaryRef} className="mt-5 hidden lg:block">
            <ConfigurationSummary variant="panel" />
          </div>
        </div>

        {/* walkthrough */}
        <div className="mt-3 space-y-4 lg:order-1 lg:mt-0">
          <ProgressBar />
          <StepNavigation />
          <StepPanel onReview={onReview} />
        </div>
      </main>

      <ConfigurationSummary variant="sheet" open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
