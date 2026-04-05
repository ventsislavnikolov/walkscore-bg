import { createServerFn } from "@tanstack/react-start";

import { getSupabase } from "./supabase";

interface HeatmapParams {
  maxLat: number;
  maxLng: number;
  minLat: number;
  minLng: number;
  minScore?: number;
}

export async function getHeatmapDataInternal(data: HeatmapParams) {
  const supabase = getSupabase();

  const { data: cells, error } = await supabase.rpc("get_heatmap_bbox", {
    p_min_lng: data.minLng,
    p_min_lat: data.minLat,
    p_max_lng: data.maxLng,
    p_max_lat: data.maxLat,
    p_min_score: data.minScore ?? 0,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    type: "FeatureCollection" as const,
    features: (cells ?? []).map((row: Record<string, unknown>) => ({
      type: "Feature" as const,
      geometry: JSON.parse(String(row.geojson)) as GeoJSON.Geometry,
      properties: {
        walkScore: row.walk_score,
        transitScore: row.transit_score,
        bikeScore: row.bike_score,
        label: row.walk_label,
      },
    })),
  };
}

export const getHeatmapData = createServerFn({ method: "GET" })
  .inputValidator((input: HeatmapParams) => input)
  .handler(async ({ data }) => getHeatmapDataInternal(data));
