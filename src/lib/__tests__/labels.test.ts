import { describe, expect, it } from "vitest";

import { CATEGORY_META, getScoreLabel } from "../labels";

describe("getScoreLabel", () => {
  it("returns expected English labels for each score band", () => {
    expect(getScoreLabel(95, "walk", "en")).toBe("Walker's Paradise");
    expect(getScoreLabel(72, "transit", "en")).toBe("Excellent Transit");
    expect(getScoreLabel(55, "bike", "en")).toBe("Bikeable");
    expect(getScoreLabel(30, "walk", "en")).toBe("Car-Dependent");
    expect(getScoreLabel(10, "bike", "en")).toBe("Not Bikeable");
  });

  it("returns expected Bulgarian labels for each score band", () => {
    expect(getScoreLabel(95, "walk", "bg")).toBe("Ежедневен рай");
    expect(getScoreLabel(75, "walk", "bg")).toBe("Много пешеходен");
    expect(getScoreLabel(55, "transit", "bg")).toBe("Добър транспорт");
    expect(getScoreLabel(30, "bike", "bg")).toBe("Минимална вело инфра");
    expect(getScoreLabel(10, "walk", "bg")).toBe("Почти непешеходен");
  });
});

describe("CATEGORY_META", () => {
  it("contains the six core walkability categories", () => {
    expect(Object.keys(CATEGORY_META)).toEqual([
      "grocery",
      "restaurant",
      "shopping",
      "errands",
      "parks",
      "education",
    ]);
  });

  it("stores localized labels and icons for each category", () => {
    for (const meta of Object.values(CATEGORY_META)) {
      expect(meta.bg).toBeTruthy();
      expect(meta.en).toBeTruthy();
      expect(meta.icon).toBeTruthy();
    }
  });
});
