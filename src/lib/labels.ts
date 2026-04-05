import type { Locale, ScoreType } from "./types";

const LABELS: Record<ScoreType, Record<string, { bg: string; en: string }>> = {
  walk: {
    paradise: { bg: "Ежедневен рай", en: "Walker's Paradise" },
    very: { bg: "Много пешеходен", en: "Very Walkable" },
    somewhat: { bg: "Донякъде пешеходен", en: "Somewhat Walkable" },
    car25: { bg: "Зависим от кола", en: "Car-Dependent" },
    car0: { bg: "Почти непешеходен", en: "Car-Dependent" },
  },
  transit: {
    paradise: { bg: "Отличен транспорт", en: "Rider's Paradise" },
    very: { bg: "Много добър транспорт", en: "Excellent Transit" },
    somewhat: { bg: "Добър транспорт", en: "Good Transit" },
    car25: { bg: "Малко транспорт", en: "Some Transit" },
    car0: { bg: "Минимален транспорт", en: "Minimal Transit" },
  },
  bike: {
    paradise: { bg: "Рай за велосипедисти", en: "Biker's Paradise" },
    very: { bg: "Много удобен за колело", en: "Very Bikeable" },
    somewhat: { bg: "Удобен за колело", en: "Bikeable" },
    car25: { bg: "Минимална вело инфра", en: "Minimal Bike Infra" },
    car0: { bg: "Неудобен за колело", en: "Not Bikeable" },
  },
};

export function getScoreLabel(
  score: number,
  type: ScoreType,
  locale: Locale
): string {
  let key: string;

  if (score >= 90) key = "paradise";
  else if (score >= 70) key = "very";
  else if (score >= 50) key = "somewhat";
  else if (score >= 25) key = "car25";
  else key = "car0";

  return LABELS[type][key][locale];
}

export const CATEGORY_META: Record<
  string,
  { bg: string; en: string; icon: string }
> = {
  grocery: { bg: "Хранителни", en: "Grocery", icon: "🛒" },
  restaurant: { bg: "Ресторанти", en: "Restaurants", icon: "🍽️" },
  shopping: { bg: "Шопинг", en: "Shopping", icon: "🛍️" },
  errands: { bg: "Ежедневни", en: "Errands", icon: "🏦" },
  parks: { bg: "Паркове", en: "Parks", icon: "🌳" },
  education: { bg: "Образование", en: "Education", icon: "🏫" },
};
