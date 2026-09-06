import type { Metadata } from "next";
import { Configurator } from "@/components/builder/Configurator";

export const metadata: Metadata = {
  title: "Bathroom Design Builder",
  description:
    "Design your shower or bathtub remodel: pick the bathroom type, wall panels, grout, door, hardware finish, storage and safety features and watch the preview update.",
};

/** The interactive configurator — a standalone tool, so no site header/footer. */
export default function DesignBuilderPage() {
  return <Configurator />;
}
