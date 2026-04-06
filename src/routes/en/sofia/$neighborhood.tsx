import { createFileRoute } from "@tanstack/react-router";

import { setLocale } from "../../../lib/i18n";
import { NeighborhoodPage } from "../../../pages/NeighborhoodPage";
import { getNeighborhoodData } from "../../sofia/$neighborhood";

export const Route = createFileRoute("/en/sofia/$neighborhood")({
  beforeLoad: () => {
    setLocale("en");
  },
  loader: ({ params }) =>
    getNeighborhoodData({ data: { neighborhood: params.neighborhood } }),
  component: EnglishNeighborhoodRoutePage,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `Walk Score - ${loaderData?.neighborhood} | WalkScore.bg`,
      },
      {
        name: "description",
        content: `Walk Score, Transit Score and Bike Score for ${loaderData?.neighborhood}, Sofia.`,
      },
    ],
  }),
});

function EnglishNeighborhoodRoutePage() {
  const { neighborhood, city } = Route.useLoaderData();
  return <NeighborhoodPage city={city} neighborhood={neighborhood} />;
}
