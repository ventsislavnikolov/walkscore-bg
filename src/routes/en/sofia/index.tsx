import { createFileRoute } from "@tanstack/react-router";

import { setLocale } from "../../../lib/i18n";
import { SofiaCityPage } from "../../../pages/SofiaCityPage";
import { getCityData } from "../../sofia/index";

export const Route = createFileRoute("/en/sofia/")({
  beforeLoad: () => {
    setLocale("en");
  },
  loader: () => getCityData(),
  component: EnglishSofiaCityRoutePage,
});

function EnglishSofiaCityRoutePage() {
  const { city } = Route.useLoaderData();
  return <SofiaCityPage city={city} />;
}
