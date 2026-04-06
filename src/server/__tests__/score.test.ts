import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
const insert = vi.fn();
const select = vi.fn();
const from = vi.fn((table: string) => {
  if (table === "ws_search_log") {
    return { insert };
  }

  if (table === "ws_cells") {
    return { select };
  }

  throw new Error(`Unexpected table: ${table}`);
});

vi.mock("../supabase", () => ({
  getSupabase: () => ({
    rpc,
    from,
  }),
}));

vi.mock("../geocode", () => ({
  geocodeAddressInternal: vi.fn().mockResolvedValue({
    lat: 42.6977,
    lng: 23.3219,
    displayName: "Sofia Center, Sofia, Bulgaria",
  }),
}));

describe("score server functions", () => {
  beforeEach(() => {
    vi.resetModules();
    rpc.mockReset();
    from.mockClear();
    insert.mockReset();
    insert.mockResolvedValue({ error: null });
    select.mockReset();
    select.mockResolvedValue({ count: 1, error: null });
  });

  it("formats score results returned from Supabase", async () => {
    rpc.mockResolvedValueOnce({
      data: [
        {
          walk_score: 87,
          transit_score: 72,
          bike_score: 45,
          walk_label: "Walker's Paradise",
          transit_label: "Excellent Transit",
          bike_label: "Bikeable",
          grocery: 95,
          restaurant: 88,
          shopping: 70,
          errands: 92,
          parks: 65,
          education: 80,
        },
      ],
      error: null,
    });

    const { getScoreByCoordsInternal } = await import("../score");
    const result = await getScoreByCoordsInternal({
      lat: 42.6977,
      lng: 23.3219,
    });

    expect(rpc).toHaveBeenCalledWith("get_scores", {
      p_lng: 23.3219,
      p_lat: 42.6977,
    });
    expect(insert).toHaveBeenCalledWith({
      query: "42.6977,23.3219",
      lat: 42.6977,
      lng: 23.3219,
      walk_score: 87,
    });
    expect(result.walkScore).toBe(87);
    expect(result.components.grocery).toBe(95);
    expect(result.address).toBe("42.6977, 23.3219");
  });

  it("throws when Supabase returns no score rows", async () => {
    rpc.mockResolvedValueOnce({ data: [], error: null });

    const { getScoreByCoordsInternal } = await import("../score");

    await expect(getScoreByCoordsInternal({ lat: 0, lng: 0 })).rejects.toThrow(
      "No data for this location"
    );
  });

  it("throws a dataset error when no cells are loaded", async () => {
    rpc.mockResolvedValueOnce({ data: [], error: null });
    select.mockResolvedValueOnce({ count: 0, error: null });

    const { DATASET_UNAVAILABLE_ERROR, getScoreByCoordsInternal } =
      await import("../score");

    await expect(getScoreByCoordsInternal({ lat: 0, lng: 0 })).rejects.toThrow(
      DATASET_UNAVAILABLE_ERROR
    );
  });

  it("geocodes an address and delegates to coordinate scoring", async () => {
    rpc.mockResolvedValueOnce({
      data: [
        {
          walk_score: 80,
          transit_score: 60,
          bike_score: 40,
          walk_label: "Very Walkable",
          transit_label: "Good Transit",
          bike_label: "Bikeable",
          grocery: 70,
          restaurant: 60,
          shopping: 50,
          errands: 40,
          parks: 30,
          education: 20,
        },
      ],
      error: null,
    });

    const { getScoreByAddressInternal } = await import("../score");
    const result = await getScoreByAddressInternal("Sofia Center");

    expect(result.address).toBe("Sofia Center, Sofia, Bulgaria");
    expect(result.walkScore).toBe(80);
    expect(insert).toHaveBeenCalledOnce();
  });
});
