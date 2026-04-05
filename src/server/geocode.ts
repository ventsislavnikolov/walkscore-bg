import { createServerFn } from '@tanstack/react-start'

interface GeocodeResult {
  lat: number
  lng: number
  displayName: string
}

async function geocodeAddressInternal(address: string): Promise<GeocodeResult> {
  const query = `${address}, България`

  const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv2&limit=1&countrycodes=bg`
  const nominatimResponse = await fetch(nominatimUrl, {
    headers: { 'User-Agent': 'WalkScoreBG/1.0 (walkscore.bg)' },
  })

  if (nominatimResponse.ok) {
    const nominatimResults = (await nominatimResponse.json()) as Array<{
      lat: string
      lon: string
      display_name: string
    }>

    if (nominatimResults.length > 0) {
      return {
        lat: Number.parseFloat(nominatimResults[0].lat),
        lng: Number.parseFloat(nominatimResults[0].lon),
        displayName: nominatimResults[0].display_name,
      }
    }
  }

  const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1&lang=bg&lat=42.6977&lon=23.3219`
  const photonResponse = await fetch(photonUrl)
  if (photonResponse.ok) {
    const photonData = (await photonResponse.json()) as {
      features?: Array<{
        geometry: { coordinates: [number, number] }
        properties: Record<string, string | undefined>
      }>
    }

    if (photonData.features?.length) {
      const feature = photonData.features[0]
      const properties = feature.properties

      return {
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        displayName: [
          properties.name,
          properties.street,
          properties.city,
          properties.country,
        ]
          .filter(Boolean)
          .join(', '),
      }
    }
  }

  throw new Error('Address not found')
}

export const geocodeAddress = createServerFn({ method: 'GET' })
  .inputValidator((input: { address: string }) => input)
  .handler(async ({ data }) => geocodeAddressInternal(data.address))
