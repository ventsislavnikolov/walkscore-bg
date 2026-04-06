import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { SofiaCityPage } from "../../pages/SofiaCityPage";
import { getSupabase } from "../../server/supabase";

export const getCityData = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const supabase = getSupabase();
      const { data: city } = await supabase
        .from("ws_cities")
        .select("*")
        .eq("slug", "sofia")
        .single();

      return { city };
    } catch {
      return { city: null };
    }
  }
);

export const Route = createFileRoute("/sofia/")({
  loader: () => getCityData(),
  component: SofiaCityRoutePage,
});

function SofiaCityRoutePage() {
  const { city } = Route.useLoaderData();
  return <SofiaCityPage city={city} />;
}
