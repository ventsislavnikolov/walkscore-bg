export interface ScoreComponents {
  grocery: number
  restaurant: number
  shopping: number
  errands: number
  parks: number
  education: number
}

export interface ScoreResult {
  address: string
  lat: number
  lng: number
  walkScore: number
  transitScore: number
  bikeScore: number
  walkLabel: string
  transitLabel: string
  bikeLabel: string
  components: ScoreComponents
}

export interface Amenity {
  id: number
  category: string
  name: string
  nameBg: string
  distanceM: number
  lng: number
  lat: number
}

export interface HeatmapCell {
  id: number
  walkScore: number
  transitScore: number
  bikeScore: number
  walkLabel: string
  geojson: string
}

export interface CityStats {
  slug: string
  nameBg: string
  nameEn: string
  centerLat: number
  centerLng: number
  avgWalkScore: number
  avgTransitScore: number
  avgBikeScore: number
}

export type ScoreType = 'walk' | 'transit' | 'bike'
export type Locale = 'bg' | 'en'
