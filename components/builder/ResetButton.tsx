"use client";

import { useConfigurator } from "@/lib/builder/useConfigurator";
import { ActionButton } from "./ActionButton";
import { useBuilderUi } from "./BuilderUi";

/** Clear every choice and return to Step 1 — after confirming. */
export function ResetButton() {
  const { resetConfiguration, isDefault } = useConfigurator();
  const { confirm, showToast } = useBuilderUi();

  const onReset = async () => {
    const ok = await confirm({
      title: "Reset this design?",
      body: "Every selection will be cleared and you'll go back to Step 1. A design you saved earlier is kept.",
      confirmLabel: "Reset design",
      tone: "danger",
    });
    if (!ok) return;
    resetConfiguration();
    showToast("Design reset");
  };

  return (
    <ActionButton
      label="Reset"
      title="Reset the design and start over"
      tone="danger"
      onClick={onReset}
      disabled={isDefault}
      icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
        </svg>
      }
    />
  );
}
