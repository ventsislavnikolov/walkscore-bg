import { createFileRoute } from "@tanstack/react-router";

import { setLocale } from "../../lib/i18n";
import { ComparePage } from "../../pages/ComparePage";

export const Route = createFileRoute("/en/compare")({
  beforeLoad: () => {
    setLocale("en");
  },
  component: ComparePage,
});
