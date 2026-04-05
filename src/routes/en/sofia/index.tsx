import { createFileRoute } from "@tanstack/react-router";

import { setLocale } from "../../../lib/i18n";
import { getCityData, SofiaCityPage } from "../../sofia/index";

export const Route = createFileRoute("/en/sofia/")({
  beforeLoad: () => {
    setLocale("en");
  },
  loader: () => getCityData(),
  component: SofiaCityPage,
});
