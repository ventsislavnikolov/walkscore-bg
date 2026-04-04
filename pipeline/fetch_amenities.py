"""Fetch amenities from OpenStreetMap via Overpass API."""

from pathlib import Path

import geopandas as gpd
import requests
from shapely.geometry import Point

from pipeline.categories import BIKE_CATEGORIES, TRANSIT_MODES, WALK_CATEGORIES, classify

OVERPASS_URL = "https://overpass-api.de/api/interpreter"


def build_overpass_query(city_name: str, admin_level: int = 4) -> str:
    """Build Overpass QL query for all amenity categories."""
    all_parts = []
    for category in WALK_CATEGORIES.values():
        all_parts.extend(category["query_parts"])
    for mode in TRANSIT_MODES.values():
        all_parts.extend(mode["query_parts"])
    for bike in BIKE_CATEGORIES.values():
        all_parts.extend(bike["query_parts"])

    queries = ";\n  ".join(f"{part}(area.city)" for part in all_parts)

    return f"""
[out:json][timeout:180];
area["name"="{city_name}"]["admin_level"="{admin_level}"]->.city;
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


def fetch_city(city_name: str, admin_level: int = 4) -> gpd.GeoDataFrame:
    """Fetch and classify all amenities for a city."""
    query = build_overpass_query(city_name, admin_level)
    print(f"Fetching amenities for {city_name}...")

    response = requests.get(OVERPASS_URL, params={"data": query}, timeout=300)
    response.raise_for_status()
    data = response.json()

    features = parse_elements(data.get("elements", []))
    gdf = gpd.GeoDataFrame(features, crs="EPSG:4326")

    out_path = Path(f"data/{city_name.lower()}_amenities.geojson")
    out_path.parent.mkdir(exist_ok=True)
    gdf.to_file(out_path, driver="GeoJSON")

    print(f"  {city_name}: {len(gdf)} amenities total")
    for category in sorted(gdf.category.unique()):
        print(f"    {category}: {len(gdf[gdf.category == category])}")

    return gdf


if __name__ == "__main__":
    fetch_city("София", admin_level=4)
