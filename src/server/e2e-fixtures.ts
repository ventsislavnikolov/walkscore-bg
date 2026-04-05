import type { Amenity, ScoreResult } from "../lib/types";

interface MockLocation {
  amenities: Amenity[];
  score: ScoreResult;
}

function buildAmenities(lat: number, lng: number): Amenity[] {
  return [
    {
      id: 1,
      category: "grocery",
      name: "Billa Sofia Center",
      nameBg: "Била София Център",
      distanceM: 140,
      lng: lng + 0.0012,
      lat: lat + 0.0007,
    },
    {
      id: 2,
      category: "restaurant",
      name: "Made in Home",
      nameBg: "Made in Home",
      distanceM: 190,
      lng: lng - 0.001,
      lat: lat + 0.0004,
    },
    {
      id: 3,
      category: "parks",
      name: "City Garden",
      nameBg: "Градска градина",
      distanceM: 320,
      lng: lng + 0.0005,
      lat: lat - 0.0012,
    },
    {
      id: 4,
      category: "education",
      name: "Sofia University",
      nameBg: "Софийски университет",
      distanceM: 480,
      lng: lng + 0.0022,
      lat: lat + 0.0018,
    },
  ];
}

const E2E_LOCATIONS: MockLocation[] = [
  {
    score: {
      address: "ul. Graf Ignatiev 24, Sofia",
      lat: 42.6924,
      lng: 23.324,
      walkScore: 94,
      transitScore: 88,
      bikeScore: 71,
      walkLabel: "Walker's Paradise",
      transitLabel: "Excellent Transit",
      bikeLabel: "Bikeable",
      components: {
        grocery: 98,
        restaurant: 97,
        shopping: 96,
        errands: 92,
        parks: 81,
        education: 88,
      },
    },
    amenities: buildAmenities(42.6924, 23.324),
  },
  {
    score: {
      address: "Lozenets, Sofia",
      lat: 42.6736,
      lng: 23.3182,
      walkScore: 82,
      transitScore: 76,
      bikeScore: 63,
      walkLabel: "Very Walkable",
      transitLabel: "Good Transit",
      bikeLabel: "Bikeable",
      components: {
        grocery: 88,
        restaurant: 84,
        shopping: 76,
        errands: 79,
        parks: 74,
        education: 67,
      },
    },
    amenities: buildAmenities(42.6736, 23.3182),
  },
  {
    score: {
      address: "Lyulin, Sofia",
      lat: 42.7285,
      lng: 23.2681,
      walkScore: 61,
      transitScore: 58,
      bikeScore: 49,
      walkLabel: "Somewhat Walkable",
      transitLabel: "Some Transit",
      bikeLabel: "Somewhat Bikeable",
      components: {
        grocery: 69,
        restaurant: 55,
        shopping: 58,
        errands: 64,
        parks: 52,
        education: 50,
      },
    },
    amenities: buildAmenities(42.7285, 23.2681),
  },
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function isE2EMockMode() {
  return process.env.E2E_MOCKS === "1";
}

export function getE2EScoreFixtureByAddress(address: string): ScoreResult {
  const query = normalize(address);

  if (query.includes("lyulin") || query.includes("люлин")) {
    return E2E_LOCATIONS[2].score;
  }

  if (query.includes("lozenets") || query.includes("лозенец")) {
    return E2E_LOCATIONS[1].score;
  }

  return E2E_LOCATIONS[0].score;
}

export function getE2EScoreFixtureByCoords(
  lat: number,
  lng: number
): ScoreResult {
  const nearest = [...E2E_LOCATIONS].sort((a, b) => {
    const distanceA = Math.hypot(a.score.lat - lat, a.score.lng - lng);
    const distanceB = Math.hypot(b.score.lat - lat, b.score.lng - lng);
    return distanceA - distanceB;
  })[0];

  return nearest.score;
}

export function getE2EAmenitiesFixture(score: ScoreResult): Amenity[] {
  return (
    E2E_LOCATIONS.find((location) => location.score.address === score.address)
      ?.amenities ?? buildAmenities(score.lat, score.lng)
  );
}
