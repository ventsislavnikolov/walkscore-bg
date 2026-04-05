import geopandas as gpd

from pipeline.fetch_bike_infra import (
    build_bike_infra_query,
    fetch_bike_infra,
    parse_bike_ways,
)


def test_build_bike_infra_query_contains_city():
    query = build_bike_infra_query('area["name"="Sofia"]["admin_level"="8"]', ['way["highway"="cycleway"]'])
    assert '"Sofia"' in query
    assert '"8"' in query
    assert "out geom" in query


def test_parse_bike_ways_skips_non_ways_and_short_geometries():
    features = parse_bike_ways(
        [
            {"type": "node", "id": 1},
            {"type": "way", "id": 2, "geometry": [{"lon": 23.32, "lat": 42.69}]},
        ]
    )
    assert features == []


def test_parse_bike_ways_builds_linestring():
    features = parse_bike_ways(
        [
            {
                "type": "way",
                "id": 3,
                "geometry": [
                    {"lon": 23.32, "lat": 42.69},
                    {"lon": 23.33, "lat": 42.70},
                ],
                "tags": {"highway": "cycleway"},
            }
        ]
    )
    assert len(features) == 1
    assert features[0]["osm_id"] == 3
    assert features[0]["highway"] == "cycleway"


def test_fetch_bike_infra_returns_empty_geodataframe_for_no_results(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(
        "pipeline.fetch_bike_infra.select_area_selector",
        lambda *args, **kwargs: 'area["name"="Sofia"]["admin_level"="8"]',
    )
    monkeypatch.setattr(
        "pipeline.fetch_bike_infra.fetch_json",
        lambda *args, **kwargs: {"elements": []},
    )
    monkeypatch.setattr(gpd.GeoDataFrame, "to_file", lambda self, *args, **kwargs: None)

    gdf = fetch_bike_infra("София")

    assert gdf.empty
    assert list(gdf.columns) == ["geometry", "osm_id", "highway"]
    assert str(gdf.crs) == "EPSG:4326"
