import { createServerFn } from '@tanstack/react-start'

import type { ScoreResult } from '../lib/types'
import { geocodeAddress } from './geocode'
import { getSupabase } from './supabase'

export const getScoreByCoords = createServerFn({ method: 'GET' })
  .inputValidator((input: { lat: number; lng: number; address?: string }) => input)
  .handler(async ({ data }): Promise<ScoreResult> => {
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
  })

export const getScoreByAddress = createServerFn({ method: 'GET' })
  .inputValidator((input: { address: string }) => input)
  .handler(async ({ data }) => {
    const geocoded = await geocodeAddress({ data: { address: data.address } })
    return getScoreByCoords({
      data: {
        lat: geocoded.lat,
        lng: geocoded.lng,
        address: geocoded.displayName,
      },
    })
  })
