"use client";

import { useEffect, useState } from "react";
import { configurationsEqual } from "@/lib/builder/rules";
import { hasSavedDesign, loadSavedDesign, saveDesign } from "@/lib/builder/storage";
import { useConfigurator } from "@/lib/builder/useConfigurator";
import { ActionButton } from "./ActionButton";
import { useBuilderUi } from "./BuilderUi";

/** Save the working design to the browser, and load it back. */
export function SaveDesign() {
  const { configuration, isDefault, loadConfiguration } = useConfigurator();
  const { showToast, confirm } = useBuilderUi();
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => setHasSaved(hasSavedDesign()), []);

  const onSave = () => {
    if (saveDesign(configuration)) {
      setHasSaved(true);
      showToast("Design saved on this device");
    } else {
      showToast("Couldn't save — browser storage is unavailable");
    }
  };

  const onLoad = async () => {
    const saved = loadSavedDesign();
    if (!saved) {
      setHasSaved(false);
      showToast("No saved design yet");
      return;
    }
    if (configurationsEqual(saved.configuration, configuration)) {
      showToast("That design is already loaded");
      return;
    }
    const ok =
      isDefault ||
      (await confirm({
        title: "Load your saved design?",
        body: "This replaces the design you're working on with the one saved on this device.",
        confirmLabel: "Load saved design",
      }));
    if (!ok) return;
    loadConfiguration(saved.configuration);
    showToast("Saved design loaded");
  };

  return (
    <>
      <ActionButton
        label="Save"
        title="Save current design on this device"
        onClick={onSave}
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
            <path d="M17 21v-8H7v8M7 3v5h8" />
          </svg>
        }
      />
      <ActionButton
        label="Load"
        title={hasSaved ? "Load the design saved on this device" : "No saved design yet"}
        onClick={onLoad}
        disabled={!hasSaved}
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
          </svg>
        }
      />
    </>
  );
}
