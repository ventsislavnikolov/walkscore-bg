"""Fetch amenities from OpenStreetMap via Overpass API."""

from pathlib import Path
import re

import geopandas as gpd
from shapely.geometry import Point

from pipeline.categories import BIKE_CATEGORIES, TRANSIT_MODES, WALK_CATEGORIES, classify
from pipeline.overpass import fetch_json, select_area_selector


def _empty_amenities_gdf() -> gpd.GeoDataFrame:
    return gpd.GeoDataFrame(
        {
            "geometry": [],
            "category": [],
            "name": [],
            "name_bg": [],
            "osm_id": [],
        },
        geometry="geometry",
        crs="EPSG:4326",
    )


def build_overpass_query(area_selector: str, query_parts: list[str]) -> str:
    """Build Overpass QL query for a batch of amenity selectors."""
    queries = ";\n  ".join(f"{part}(area.city)" for part in query_parts)
    return f"""
[out:json][timeout:60];
{area_selector}->.city;
(
  {queries};
);
out center;
"""


def parse_elements(elements: list[dict]) -> list[dict]:
    """Parse Overpass elements into classified features."""
    features = []
    for element in elements:
        lat = element.get("lat") or (element.get("center") or {}).get("lat")
        lon = element.get("lon") or (element.get("center") or {}).get("lon")
        if lat is None or lon is None:
            continue

        tags = element.get("tags", {})
        category = classify(tags)
        if category == "other":
            continue

        features.append(
            {
                "geometry": Point(lon, lat),
                "category": category,
                "name": tags.get("name", tags.get("name:bg", "")),
                "name_bg": tags.get("name:bg", tags.get("name", "")),
                "osm_id": element["id"],
            }
        )
    return features


def _all_query_parts() -> list[str]:
    query_parts = []
    for category in WALK_CATEGORIES.values():
        for query_part in category["query_parts"]:
            query_parts.extend(_expand_query_part(query_part))
    for mode in TRANSIT_MODES.values():
        for query_part in mode["query_parts"]:
            query_parts.extend(_expand_query_part(query_part))
    for bike in BIKE_CATEGORIES.values():
        for query_part in bike["query_parts"]:
            query_parts.extend(_expand_query_part(query_part))
    return query_parts


def _expand_query_part(query_part: str) -> list[str]:
    match = re.fullmatch(r'(?P<prefix>nwr\["[^"]+")~"(?P<values>[^"]+)"\]', query_part)
    if not match:
        return [query_part]

    prefix = match.group("prefix")
    values = match.group("values").split("|")
    return [f'{prefix}="{value}"]' for value in values]


def _fetch_elements(area_selector: str) -> list[dict]:
    elements_by_key: dict[tuple[str, int], dict] = {}
    for query_part in _all_query_parts():
        data = fetch_json(build_overpass_query(area_selector, [query_part]), timeout=60)
        for element in data.get("elements", []):
            key = (element.get("type", ""), element["id"])
            elements_by_key[key] = element
    return list(elements_by_key.values())


def fetch_city(city_name: str, admin_level: int = 4) -> gpd.GeoDataFrame:
    """Fetch and classify all amenities for a city."""
    print(f"Fetching amenities for {city_name}...")
    area_selector = select_area_selector(city_name, admin_level)
    features = parse_elements(_fetch_elements(area_selector))
    gdf = gpd.GeoDataFrame(features, geometry="geometry", crs="EPSG:4326") if features else _empty_amenities_gdf()

    out_path = Path(f"data/{city_name.lower()}_amenities.geojson")
    out_path.parent.mkdir(exist_ok=True)
    gdf.to_file(out_path, driver="GeoJSON")

    print(f"  {city_name}: {len(gdf)} amenities total")
    for category in sorted(gdf.category.unique()):
        print(f"    {category}: {len(gdf[gdf.category == category])}")

    return gdf


if __name__ == "__main__":
    fetch_city("София", admin_level=4)
