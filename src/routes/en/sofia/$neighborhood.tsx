import { createFileRoute } from "@tanstack/react-router";

import { setLocale } from "../../../lib/i18n";
import {
  getNeighborhoodData,
  NeighborhoodPage,
} from "../../sofia/$neighborhood";

export const Route = createFileRoute("/en/sofia/$neighborhood")({
  beforeLoad: () => {
    setLocale("en");
  },
  loader: ({ params }) =>
    getNeighborhoodData({ data: { neighborhood: params.neighborhood } }),
  component: NeighborhoodPage,
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
