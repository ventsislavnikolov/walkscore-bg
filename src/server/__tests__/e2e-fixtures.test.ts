import { afterEach, describe, expect, it } from "vitest";

import {
  getE2EAmenitiesFixture,
  getE2EScoreFixtureByAddress,
  getE2EScoreFixtureByCoords,
  isE2EMockMode,
} from "../e2e-fixtures";

describe("e2e fixtures", () => {
  const envSnapshot = process.env.E2E_MOCKS;

  afterEach(() => {
    if (envSnapshot === undefined) {
      process.env.E2E_MOCKS = undefined;
      return;
    }

    process.env.E2E_MOCKS = envSnapshot;
  });

  it("detects when e2e mock mode is enabled", () => {
    process.env.E2E_MOCKS = "1";
    expect(isE2EMockMode()).toBe(true);

    process.env.E2E_MOCKS = "0";
    expect(isE2EMockMode()).toBe(false);
  });

  it("matches address fixtures by Bulgarian and English neighborhood names", () => {
    expect(getE2EScoreFixtureByAddress("жк Люлин 5")).toMatchObject({
      address: "Lyulin, Sofia",
      walkScore: 61,
    });

    expect(getE2EScoreFixtureByAddress("Lozenets, Sofia")).toMatchObject({
      address: "Lozenets, Sofia",
      walkScore: 82,
    });

    expect(getE2EScoreFixtureByAddress("Unknown address")).toMatchObject({
      address: "ul. Graf Ignatiev 24, Sofia",
      walkScore: 94,
    });
  });

  it("returns the nearest coordinate fixture and matching amenities", () => {
    const score = getE2EScoreFixtureByCoords(42.674, 23.318);

    expect(score.address).toBe("Lozenets, Sofia");

    const amenities = getE2EAmenitiesFixture(score);

    expect(amenities).toHaveLength(4);
    expect(amenities[0]).toMatchObject({
      category: "grocery",
      nameBg: "Била София Център",
    });
  });

  it("builds fallback amenities for arbitrary coordinates", () => {
    const amenities = getE2EAmenitiesFixture({
      address: "Custom place",
      lat: 42.7,
      lng: 23.31,
      walkScore: 50,
      transitScore: 50,
      bikeScore: 50,
      walkLabel: "Average",
      transitLabel: "Average",
      bikeLabel: "Average",
      components: {
        grocery: 50,
        restaurant: 50,
        shopping: 50,
        errands: 50,
        parks: 50,
        education: 50,
      },
    });

    expect(amenities).toHaveLength(4);
    expect(amenities[0]).toMatchObject({
      lng: 23.3112,
    });
    expect(amenities[0].lat).toBeCloseTo(42.7007, 4);
  });
});
