"use client";

import { buildExport, downloadJson, exportFilename } from "@/lib/builder/storage";
import { useConfigurator } from "@/lib/builder/useConfigurator";
import { ActionButton } from "./ActionButton";
import { useBuilderUi } from "./BuilderUi";

/**
 * Download the design summary as JSON. A PDF proposal, email share or CRM
 * hand-off would start from the same `buildExport()` object.
 */
export function ExportDesign() {
  const { configuration, isDefault } = useConfigurator();
  const { showToast } = useBuilderUi();

  const onExport = () => {
    downloadJson(buildExport(configuration), exportFilename());
    showToast("Design summary downloaded");
  };

  return (
    <ActionButton
      label="Export"
      title="Download the design summary (JSON)"
      onClick={onExport}
      disabled={isDefault}
      icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
      }
    />
  );
}
