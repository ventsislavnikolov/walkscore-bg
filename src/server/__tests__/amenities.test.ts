import { beforeEach, describe, expect, it, vi } from 'vitest'

const rpc = vi.fn()

vi.mock('../supabase', () => ({
  getSupabase: () => ({ rpc }),
}))

describe('getNearbyAmenities', () => {
  beforeEach(() => {
    vi.resetModules()
    rpc.mockReset()
  })

  it('formats nearby amenities and rounds distance', async () => {
    rpc.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          category: 'grocery',
          name: 'Billa',
          name_bg: 'Билла',
          distance_m: 150.6,
          lng: 23.32,
          lat: 42.69,
        },
      ],
      error: null,
    })

    const { getNearbyAmenitiesInternal } = await import('../amenities')
    const result = await getNearbyAmenitiesInternal({ lat: 42.69, lng: 23.32 })

    expect(result).toEqual([
      {
        id: 1,
        category: 'grocery',
        name: 'Billa',
        nameBg: 'Билла',
        distanceM: 151,
        lng: 23.32,
        lat: 42.69,
      },
    ])
  })

  it('throws when the rpc call fails', async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { message: 'broken rpc' } })

    const { getNearbyAmenitiesInternal } = await import('../amenities')

    await expect(getNearbyAmenitiesInternal({ lat: 42.69, lng: 23.32 })).rejects.toThrow(
      'broken rpc',
    )
  })
})
