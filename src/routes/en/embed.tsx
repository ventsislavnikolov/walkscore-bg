import { createFileRoute } from "@tanstack/react-router";

import { setLocale } from "../../lib/i18n";
import { EmbedPage } from "../embed";

export const Route = createFileRoute("/en/embed")({
  beforeLoad: () => {
    setLocale("en");
  },
  component: EmbedPage,
});
