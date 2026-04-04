"""Fetch bike infrastructure (lanes, paths) from OSM."""

from pathlib import Path

import geopandas as gpd
from shapely.geometry import LineString

from pipeline.overpass import fetch_json, select_area_selector


def _empty_bike_gdf() -> gpd.GeoDataFrame:
    return gpd.GeoDataFrame(
        {
            "geometry": [],
            "osm_id": [],
            "highway": [],
        },
        geometry="geometry",
        crs="EPSG:4326",
    )


def build_bike_infra_query(area_selector: str, query_parts: list[str]) -> str:
    """Build Overpass query for bike infrastructure ways."""
    queries = ";\n  ".join(f"{part}(area.city)" for part in query_parts)
    return f"""
[out:json][timeout:180];
{area_selector}->.city;
(
  {queries};
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


def _bike_query_parts() -> list[str]:
    return [
        'way["cycleway"]',
        'way["cycleway:left"]',
        'way["cycleway:right"]',
        'way["highway"="cycleway"]',
        'way["bicycle"="designated"]',
    ]


def _fetch_elements(area_selector: str) -> list[dict]:
    elements_by_key: dict[tuple[str, int], dict] = {}
    for query_part in _bike_query_parts():
        data = fetch_json(build_bike_infra_query(area_selector, [query_part]), timeout=300)
        for element in data.get("elements", []):
            key = (element.get("type", ""), element["id"])
            elements_by_key[key] = element
    return list(elements_by_key.values())


def fetch_bike_infra(city_name: str, admin_level: int = 4) -> gpd.GeoDataFrame:
    """Fetch bike infrastructure for a city."""
    print(f"Fetching bike infrastructure for {city_name}...")
    area_selector = select_area_selector(
        city_name,
        admin_level,
        probe_selector='way["highway"="cycleway"]',
    )
    features = parse_bike_ways(_fetch_elements(area_selector))
    gdf = gpd.GeoDataFrame(features, geometry="geometry", crs="EPSG:4326") if features else _empty_bike_gdf()

    out_path = Path(f"data/{city_name.lower()}_bike_infra.geojson")
    out_path.parent.mkdir(exist_ok=True)
    gdf.to_file(out_path, driver="GeoJSON")

    total_km = 0.0
    if not gdf.empty:
        gdf_utm = gdf.to_crs("EPSG:32635")
        total_km = gdf_utm.geometry.length.sum() / 1000
    print(f"  {city_name}: {len(gdf)} bike ways, {total_km:.1f} km total")

    return gdf


if __name__ == "__main__":
    fetch_bike_infra("София", admin_level=4)
