export interface ScoreComponents {
  education: number;
  errands: number;
  grocery: number;
  parks: number;
  restaurant: number;
  shopping: number;
}

export interface ScoreResult {
  address: string;
  bikeLabel: string;
  bikeScore: number;
  components: ScoreComponents;
  lat: number;
  lng: number;
  transitLabel: string;
  transitScore: number;
  walkLabel: string;
  walkScore: number;
}

export interface Amenity {
  category: string;
  distanceM: number;
  id: number;
  lat: number;
  lng: number;
  name: string;
  nameBg: string;
}

export interface HeatmapCell {
  bikeScore: number;
  geojson: string;
  id: number;
  transitScore: number;
  walkLabel: string;
  walkScore: number;
}

export interface CityStats {
  avgBikeScore: number;
  avgTransitScore: number;
  avgWalkScore: number;
  centerLat: number;
  centerLng: number;
  nameBg: string;
  nameEn: string;
  slug: string;
}

export type ScoreType = "walk" | "transit" | "bike";
export type Locale = "bg" | "en";
