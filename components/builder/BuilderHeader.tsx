"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { ExportDesign } from "./ExportDesign";
import { ResetButton } from "./ResetButton";
import { SaveDesign } from "./SaveDesign";

/** App bar: brand, tool name, and the design-level actions. */
export function BuilderHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-abyss text-white">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="shrink-0" title="Back to bathroomexcellence.com">
            <Logo tone="dark" />
          </Link>
          <span aria-hidden="true" className="hidden h-6 w-px bg-white/15 md:block" />
          <h1 className="hidden truncate font-sans text-[13px] font-semibold uppercase tracking-[0.18em] text-teal-300 md:block">
            Bathroom Design Builder
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          <SaveDesign />
          <ExportDesign />
          <ResetButton />
        </div>
      </div>
    </header>
  );
}
