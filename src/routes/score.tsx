import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { CategoryBreakdown } from "../components/CategoryBreakdown";
import { HeatmapMap } from "../components/HeatmapMap";
import { LayerSwitcher } from "../components/LayerSwitcher";
import { NearbyAmenities } from "../components/NearbyAmenities";
import { ScoreTriple } from "../components/ScoreTriple";
import { ShareEmbed } from "../components/ShareEmbed";
import { useTranslation } from "../lib/i18n";
import type { ScoreType } from "../lib/types";
import { getNearbyAmenities } from "../server/amenities";
import {
  DATASET_UNAVAILABLE_ERROR,
  getScoreByAddress,
  getScoreByCoords,
} from "../server/score";

export const Route = createFileRoute("/score")({
  validateSearch: (search: Record<string, unknown>) => ({
    address: typeof search.address === "string" ? search.address : "",
    lat: typeof search.lat === "string" ? Number(search.lat) : undefined,
    lng: typeof search.lng === "string" ? Number(search.lng) : undefined,
  }),
  component: ScorePage,
});

export function ScorePage() {
  const { address, lat, lng } = Route.useSearch();
  const { t, locale } = useTranslation();
  const [scoreType, setScoreType] = useState<ScoreType>("walk");
  const homeHref = locale === "en" ? "/en/" : "/";

  const scoreQuery = useQuery({
    queryKey: ["score", address, lat, lng],
    queryFn: () => {
      if (typeof lat === "number" && typeof lng === "number") {
        return getScoreByCoords({ data: { lat, lng } });
      }

      if (address) {
        return getScoreByAddress({ data: { address } });
      }

      throw new Error("Missing address or coordinates");
    },
  });

  const amenitiesQuery = useQuery({
    queryKey: ["amenities", scoreQuery.data?.lat, scoreQuery.data?.lng],
    queryFn: () =>
      getNearbyAmenities({
        data: {
          lat: scoreQuery.data!.lat,
          lng: scoreQuery.data!.lng,
        },
      }),
    enabled: !!scoreQuery.data,
  });

  if (scoreQuery.isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </main>
    );
  }

  if (scoreQuery.error) {
    const errorMessage =
      scoreQuery.error instanceof Error &&
      scoreQuery.error.message === DATASET_UNAVAILABLE_ERROR
        ? t("errors.datasetUnavailable")
        : t("errors.noData");

    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-12 text-center">
        <p className="text-lg text-stone-600">{errorMessage}</p>
        <a className="text-emerald-600 hover:underline" href={homeHref}>
          {t("score.newSearch")}
        </a>
      </main>
    );
  }

  const data = scoreQuery.data;
  if (!data) return null;

  return (
    <main className="bg-stone-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <a
            className="mb-2 inline-block text-emerald-600 text-sm hover:underline"
            href={homeHref}
          >
            {t("score.newSearch")}
          </a>
          <h1 className="font-bold text-2xl text-stone-900">{data.address}</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-[0_28px_80px_-50px_rgba(68,64,60,0.55)] ring-1 ring-stone-200/70">
            <div className="h-[520px]">
              <HeatmapMap
                center={[data.lng, data.lat]}
                markerPosition={[data.lng, data.lat]}
                scoreType={scoreType}
                zoom={15}
              />
            </div>

            <div className="absolute top-4 left-4">
              <LayerSwitcher active={scoreType} onChange={setScoreType} />
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-[0_28px_80px_-50px_rgba(68,64,60,0.55)] ring-1 ring-stone-200/70">
              <ScoreTriple
                bikeScore={data.bikeScore}
                size="md"
                transitScore={data.transitScore}
                walkScore={data.walkScore}
              />
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-[0_28px_80px_-50px_rgba(68,64,60,0.55)] ring-1 ring-stone-200/70">
              <h2 className="mb-4 font-semibold text-lg text-stone-900">
                {t("score.breakdown")}
              </h2>
              <CategoryBreakdown components={data.components} />
            </section>

            {amenitiesQuery.data ? (
              <section className="rounded-3xl bg-white p-6 shadow-[0_28px_80px_-50px_rgba(68,64,60,0.55)] ring-1 ring-stone-200/70">
                <NearbyAmenities amenities={amenitiesQuery.data} />
              </section>
            ) : null}

            <section className="rounded-3xl bg-white p-6 shadow-[0_28px_80px_-50px_rgba(68,64,60,0.55)] ring-1 ring-stone-200/70">
              <ShareEmbed lat={data.lat} lng={data.lng} />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
