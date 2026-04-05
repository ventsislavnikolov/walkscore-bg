import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

describe('geocodeAddress', () => {
  beforeEach(() => {
    vi.resetModules()
    fetchMock.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the first Nominatim result when available', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { lat: '42.6977', lon: '23.3219', display_name: 'Sofia Center, Sofia, Bulgaria' },
      ],
    })

    const { geocodeAddressInternal } = await import('../geocode')
    const result = await geocodeAddressInternal('Sofia Center')

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(result).toEqual({
      lat: 42.6977,
      lng: 23.3219,
      displayName: 'Sofia Center, Sofia, Bulgaria',
    })
  })

  it('falls back to Photon when Nominatim has no matches', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              geometry: { coordinates: [23.323, 42.699] },
              properties: {
                name: 'Sample',
                street: 'Graf Ignatiev',
                city: 'Sofia',
                country: 'Bulgaria',
              },
            },
          ],
        }),
      })

    const { geocodeAddressInternal } = await import('../geocode')
    const result = await geocodeAddressInternal('Graf Ignatiev')

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result).toEqual({
      lat: 42.699,
      lng: 23.323,
      displayName: 'Sample, Graf Ignatiev, Sofia, Bulgaria',
    })
  })

  it('throws when both providers fail', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: false })

    const { geocodeAddressInternal } = await import('../geocode')

    await expect(geocodeAddressInternal('Unknown')).rejects.toThrow('Address not found')
  })
})
