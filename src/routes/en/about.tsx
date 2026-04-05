import { createFileRoute } from "@tanstack/react-router";

import { setLocale } from "../../lib/i18n";
import { AboutPage } from "../about";

export const Route = createFileRoute("/en/about")({
  beforeLoad: () => {
    setLocale("en");
  },
  component: AboutPage,
});
