import { createFileRoute } from "@tanstack/react-router";

import { setLocale } from "../../lib/i18n";
import { MapPage } from "../../pages/MapPage";

export const Route = createFileRoute("/en/map")({
  beforeLoad: () => {
    setLocale("en");
  },
  component: MapPage,
});
