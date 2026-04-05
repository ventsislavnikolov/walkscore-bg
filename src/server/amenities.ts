import { createServerFn } from '@tanstack/react-start'

import type { Amenity } from '../lib/types'
import { getE2EAmenitiesFixture, getE2EScoreFixtureByCoords, isE2EMockMode } from './e2e-fixtures'
import { getSupabase } from './supabase'

interface NearbyAmenitiesParams {
  lat: number
  lng: number
  radiusM?: number
}

export async function getNearbyAmenitiesInternal(
  data: NearbyAmenitiesParams,
): Promise<Amenity[]> {
  if (isE2EMockMode()) {
    return getE2EAmenitiesFixture(getE2EScoreFixtureByCoords(data.lat, data.lng))
  }

  const supabase = getSupabase()

  const { data: amenities, error } = await supabase.rpc('get_nearby_amenities', {
    p_lng: data.lng,
    p_lat: data.lat,
    p_radius_m: data.radiusM ?? 1000,
  })

  if (error) {
    throw new Error(error.message)
  }

  return (amenities ?? []).map((amenity: Record<string, unknown>) => ({
    id: Number(amenity.id),
    category: String(amenity.category),
    name: String(amenity.name ?? ''),
    nameBg: String(amenity.name_bg ?? ''),
    distanceM: Math.round(Number(amenity.distance_m)),
    lng: Number(amenity.lng),
    lat: Number(amenity.lat),
  }))
}

export const getNearbyAmenities = createServerFn({ method: 'GET' })
  .inputValidator((input: NearbyAmenitiesParams) => input)
  .handler(async ({ data }) => getNearbyAmenitiesInternal(data))
