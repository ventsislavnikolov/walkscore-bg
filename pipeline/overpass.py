"""Shared helpers for querying Overpass with fallbacks."""

from collections.abc import Iterable
import time

import requests

OVERPASS_URLS = (
    "https://lz4.overpass-api.de/api/interpreter",
    "https://z.overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
)
TEMPORARY_STATUS_CODES = {429, 502, 504}
CITY_NAME_ALIASES = {
    "София": "Sofia",
}
BULGARIA_SCOPE = 'area["name"="Bulgaria"]["boundary"="administrative"]["admin_level"="2"]->.country;'
_BG_TO_LATIN = str.maketrans(
    {
        "А": "A",
        "а": "a",
        "Б": "B",
        "б": "b",
        "В": "V",
        "в": "v",
        "Г": "G",
        "г": "g",
        "Д": "D",
        "д": "d",
        "Е": "E",
        "е": "e",
        "Ж": "Zh",
        "ж": "zh",
        "З": "Z",
        "з": "z",
        "И": "I",
        "и": "i",
        "Й": "Y",
        "й": "y",
        "К": "K",
        "к": "k",
        "Л": "L",
        "л": "l",
        "М": "M",
        "м": "m",
        "Н": "N",
        "н": "n",
        "О": "O",
        "о": "o",
        "П": "P",
        "п": "p",
        "Р": "R",
        "р": "r",
        "С": "S",
        "с": "s",
        "Т": "T",
        "т": "t",
        "У": "U",
        "у": "u",
        "Ф": "F",
        "ф": "f",
        "Х": "H",
        "х": "h",
        "Ц": "Ts",
        "ц": "ts",
        "Ч": "Ch",
        "ч": "ch",
        "Ш": "Sh",
        "ш": "sh",
        "Щ": "Sht",
        "щ": "sht",
        "Ъ": "A",
        "ъ": "a",
        "Ь": "Y",
        "ь": "y",
        "Ю": "Yu",
        "ю": "yu",
        "Я": "Ya",
        "я": "ya",
    }
)


def transliterate_bg_to_latin(text: str) -> str:
    """Return a basic Bulgarian-to-Latin transliteration."""
    return text.translate(_BG_TO_LATIN)


def city_name_candidates(city_name: str) -> list[str]:
    """Return unique city name variants to probe in Overpass."""
    candidates = [city_name]
    alias = CITY_NAME_ALIASES.get(city_name)
    if alias and alias != city_name:
        candidates.append(alias)
    transliterated = transliterate_bg_to_latin(city_name)
    if transliterated not in candidates:
        candidates.append(transliterated)
    return candidates


def area_selector_candidates(city_name: str, admin_level: int = 4) -> list[str]:
    """Return ordered area selectors for the requested city."""
    levels = [admin_level]
    for fallback_level in (8, 4, 6):
        if fallback_level not in levels:
            levels.append(fallback_level)

    candidate_names = city_name_candidates(city_name)

    selectors = []
    for candidate_name in candidate_names:
        for level in levels:
            selectors.append(
                f'{BULGARIA_SCOPE}\narea["name"="{candidate_name}"]["admin_level"="{level}"](area.country)'
            )
    return selectors


def fetch_json(
    query: str,
    *,
    timeout: int = 180,
    urls: Iterable[str] = OVERPASS_URLS,
    rounds: int = 3,
) -> dict:
    """Execute an Overpass query with endpoint fallback for transient failures."""
    failures: list[str] = []
    urls = tuple(urls)

    for attempt in range(1, rounds + 1):
        for url in urls:
            try:
                response = requests.get(url, params={"data": query}, timeout=timeout)
            except requests.RequestException as exc:
                failures.append(f"{url}: {exc.__class__.__name__}")
                continue

            if response.status_code in TEMPORARY_STATUS_CODES:
                failures.append(f"{url}: HTTP {response.status_code}")
                continue
            if response.status_code >= 400:
                body_preview = response.text.strip().splitlines()[0][:120] if response.text else ""
                raise RuntimeError(f"Overpass API request failed with HTTP {response.status_code}: {body_preview}")

            try:
                return response.json()
            except ValueError:
                body_preview = response.text.strip().splitlines()[0][:120] if response.text else ""
                failures.append(f"{url}: invalid JSON {body_preview}")
                continue

        if attempt < rounds:
            time.sleep(attempt)

    failures_text = "; ".join(failures) if failures else "no Overpass endpoints available"
    raise RuntimeError(f"Overpass API temporary failure across all endpoints: {failures_text}")


def select_area_selector(
    city_name: str,
    admin_level: int = 4,
    *,
    probe_selector: str = 'nwr["highway"="bus_stop"]',
) -> str:
    """Pick the first city area selector that returns probe data."""
    first_successful_selector = None

    for selector in area_selector_candidates(city_name, admin_level):
        query = f"""
[out:json][timeout:60];
{selector}->.city;
{probe_selector}(area.city);
out ids 1;
"""
        data = fetch_json(query, timeout=120)
        if data.get("elements"):
            return selector
        if first_successful_selector is None:
            first_successful_selector = selector

    if first_successful_selector is not None:
        return first_successful_selector
    raise RuntimeError(f"Unable to resolve an Overpass area for {city_name}.")
