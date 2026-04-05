import { createServerFn } from '@tanstack/react-start'

import type { ScoreResult } from '../lib/types'
import { geocodeAddressInternal } from './geocode'
import { getSupabase } from './supabase'

interface ScoreParams {
  lat: number
  lng: number
  address?: string
}

export async function getScoreByCoordsInternal(data: ScoreParams): Promise<ScoreResult> {
  const supabase = getSupabase()

  const { data: scores, error } = await supabase.rpc('get_scores', {
    p_lng: data.lng,
    p_lat: data.lat,
  })

  if (error || !scores?.length) {
    throw new Error('No data for this location')
  }

  const score = scores[0]

  await supabase.from('ws_search_log').insert({
    query: data.address ?? `${data.lat},${data.lng}`,
    lat: data.lat,
    lng: data.lng,
    walk_score: score.walk_score,
  })

  return {
    address: data.address ?? `${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`,
    lat: data.lat,
    lng: data.lng,
    walkScore: score.walk_score,
    transitScore: score.transit_score,
    bikeScore: score.bike_score,
    walkLabel: score.walk_label,
    transitLabel: score.transit_label,
    bikeLabel: score.bike_label,
    components: {
      grocery: score.grocery,
      restaurant: score.restaurant,
      shopping: score.shopping,
      errands: score.errands,
      parks: score.parks,
      education: score.education,
    },
  }
}

export async function getScoreByAddressInternal(address: string) {
  const geocoded = await geocodeAddressInternal(address)
  return getScoreByCoordsInternal({
    lat: geocoded.lat,
    lng: geocoded.lng,
    address: geocoded.displayName,
  })
}

export const getScoreByCoords = createServerFn({ method: 'GET' })
  .inputValidator((input: ScoreParams) => input)
  .handler(async ({ data }) => getScoreByCoordsInternal(data))

export const getScoreByAddress = createServerFn({ method: 'GET' })
  .inputValidator((input: { address: string }) => input)
  .handler(async ({ data }) => getScoreByAddressInternal(data.address))
