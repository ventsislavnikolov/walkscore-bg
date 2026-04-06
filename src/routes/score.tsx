import { createFileRoute } from "@tanstack/react-router";
import { ScorePage } from "../pages/ScorePage";

export const Route = createFileRoute("/score")({
  validateSearch: (search: Record<string, unknown>) => ({
    address: typeof search.address === "string" ? search.address : "",
    lat: typeof search.lat === "string" ? Number(search.lat) : undefined,
    lng: typeof search.lng === "string" ? Number(search.lng) : undefined,
  }),
  component: ScoreRoutePage,
});

function ScoreRoutePage() {
  const { address, lat, lng } = Route.useSearch();
  return <ScorePage address={address} lat={lat} lng={lng} />;
}
