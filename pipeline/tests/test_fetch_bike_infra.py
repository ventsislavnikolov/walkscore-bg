import geopandas as gpd
import pytest

from pipeline.fetch_bike_infra import (
    build_bike_infra_query,
    fetch_bike_infra,
    parse_bike_ways,
)


class DummyResponse:
    def __init__(self, status_code=200, payload=None, text=""):
        self.status_code = status_code
        self._payload = payload if payload is not None else {}
        self.text = text

    def json(self):
        return self._payload

    def raise_for_status(self):
        if self.status_code >= 400:
            raise RuntimeError(f"http {self.status_code}")


def test_build_bike_infra_query_contains_city():
    query = build_bike_infra_query("София", admin_level=4)
    assert '"София"' in query
    assert '"4"' in query
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
        "pipeline.fetch_bike_infra.requests.get",
        lambda *args, **kwargs: DummyResponse(payload={"elements": []}),
    )
    monkeypatch.setattr(gpd.GeoDataFrame, "to_file", lambda self, *args, **kwargs: None)

    gdf = fetch_bike_infra("София")

    assert gdf.empty
    assert list(gdf.columns) == ["geometry", "osm_id", "highway"]
    assert str(gdf.crs) == "EPSG:4326"


def test_fetch_bike_infra_raises_clear_error_on_rate_limit(monkeypatch):
    monkeypatch.setattr(
        "pipeline.fetch_bike_infra.requests.get",
        lambda *args, **kwargs: DummyResponse(
            status_code=429,
            text="rate_limited",
        ),
    )

    with pytest.raises(RuntimeError, match="Overpass API rate limit"):
        fetch_bike_infra("София")
