"""Fetch bike infrastructure (lanes, paths) from OSM."""

from pathlib import Path

import geopandas as gpd
import requests
from shapely.geometry import LineString

OVERPASS_URL = "https://overpass-api.de/api/interpreter"


def build_bike_infra_query(city_name: str, admin_level: int = 4) -> str:
    """Build Overpass query for bike infrastructure ways."""
    return f"""
[out:json][timeout:180];
area["name"="{city_name}"]["admin_level"="{admin_level}"]->.city;
(
  way["cycleway"](area.city);
  way["cycleway:left"](area.city);
  way["cycleway:right"](area.city);
  way["highway"="cycleway"](area.city);
  way["bicycle"="designated"](area.city);
);
out geom;
"""


def parse_bike_ways(elements: list[dict]) -> list[dict]:
    """Parse Overpass way elements into LineString features."""
    features = []
    for element in elements:
        if element.get("type") != "way":
            continue
        geom_nodes = element.get("geometry", [])
        if len(geom_nodes) < 2:
            continue

        coords = [(node["lon"], node["lat"]) for node in geom_nodes]
        features.append(
            {
                "geometry": LineString(coords),
                "osm_id": element["id"],
                "highway": element.get("tags", {}).get("highway", ""),
            }
        )
    return features


def fetch_bike_infra(city_name: str, admin_level: int = 4) -> gpd.GeoDataFrame:
    """Fetch bike infrastructure for a city."""
    query = build_bike_infra_query(city_name, admin_level)
    print(f"Fetching bike infrastructure for {city_name}...")

    response = requests.get(OVERPASS_URL, params={"data": query}, timeout=300)
    response.raise_for_status()
    data = response.json()

    features = parse_bike_ways(data.get("elements", []))
    gdf = gpd.GeoDataFrame(features, crs="EPSG:4326")

    out_path = Path(f"data/{city_name.lower()}_bike_infra.geojson")
    out_path.parent.mkdir(exist_ok=True)
    gdf.to_file(out_path, driver="GeoJSON")

    gdf_utm = gdf.to_crs("EPSG:32635")
    total_km = gdf_utm.geometry.length.sum() / 1000
    print(f"  {city_name}: {len(gdf)} bike ways, {total_km:.1f} km total")

    return gdf


if __name__ == "__main__":
    fetch_bike_infra("София", admin_level=4)
