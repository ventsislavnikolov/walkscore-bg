import { beforeEach, describe, expect, it, vi } from 'vitest'

const rpc = vi.fn()

vi.mock('../supabase', () => ({
  getSupabase: () => ({ rpc }),
}))

describe('getHeatmapData', () => {
  beforeEach(() => {
    vi.resetModules()
    rpc.mockReset()
  })

  it('returns a GeoJSON feature collection', async () => {
    rpc.mockResolvedValueOnce({
      data: [
        {
          walk_score: 80,
          transit_score: 60,
          bike_score: 40,
          walk_label: 'Very Walkable',
          geojson:
            '{"type":"Polygon","coordinates":[[[23.32,42.69],[23.33,42.69],[23.33,42.7],[23.32,42.7],[23.32,42.69]]]}',
        },
      ],
      error: null,
    })

    const { getHeatmapDataInternal } = await import('../heatmap')
    const result = await getHeatmapDataInternal({
      minLng: 23.2,
      minLat: 42.6,
      maxLng: 23.4,
      maxLat: 42.8,
    })

    expect(result.type).toBe('FeatureCollection')
    expect(result.features).toHaveLength(1)
    expect(result.features[0].properties.walkScore).toBe(80)
  })

  it('throws when Supabase returns an error', async () => {
    rpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'DB error' },
    })

    const { getHeatmapDataInternal } = await import('../heatmap')

    await expect(
      getHeatmapDataInternal({
        minLng: 23.2,
        minLat: 42.6,
        maxLng: 23.4,
        maxLat: 42.8,
      }),
    ).rejects.toThrow('DB error')
  })
})
