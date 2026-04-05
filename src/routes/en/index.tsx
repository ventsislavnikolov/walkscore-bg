import { createFileRoute } from "@tanstack/react-router";

import { setLocale } from "../../lib/i18n";
import { HomePage } from "../index";

export const Route = createFileRoute("/en/")({
  beforeLoad: () => {
    setLocale("en");
  },
  component: HomePage,
});
