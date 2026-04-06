import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { NeighborhoodPage } from "../../pages/NeighborhoodPage";
import { getSupabase } from "../../server/supabase";

export const getNeighborhoodData = createServerFn({ method: "GET" })
  .inputValidator((data: { neighborhood: string }) => data)
  .handler(async ({ data }) => {
    try {
      const supabase = getSupabase();
      const { data: city } = await supabase
        .from("ws_cities")
        .select("*")
        .eq("slug", "sofia")
        .single();

      return {
        neighborhood: data.neighborhood,
        city,
      };
    } catch {
      return {
        neighborhood: data.neighborhood,
        city: null,
      };
    }
  });

export const Route = createFileRoute("/sofia/$neighborhood")({
  loader: ({ params }) =>
    getNeighborhoodData({ data: { neighborhood: params.neighborhood } }),
  component: NeighborhoodRoutePage,
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

function NeighborhoodRoutePage() {
  const { neighborhood, city } = Route.useLoaderData();
  return <NeighborhoodPage city={city} neighborhood={neighborhood} />;
}
