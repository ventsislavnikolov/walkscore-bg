import geopandas as gpd
import pytest

from pipeline.fetch_amenities import build_overpass_query, fetch_city, parse_elements


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


def test_build_overpass_query_contains_city():
    query = build_overpass_query("София", admin_level=4)
    assert '"София"' in query
    assert '"4"' in query
    assert "out center" in query


def test_build_overpass_query_includes_all_categories():
    query = build_overpass_query("София")
    assert "supermarket" in query
    assert "restaurant" in query
    assert "bus_stop" in query
    assert "bicycle_parking" in query


def test_parse_elements_node():
    elements = [
        {
            "type": "node",
            "id": 1,
            "lat": 42.69,
            "lon": 23.32,
            "tags": {"shop": "supermarket", "name": "Billa"},
        },
    ]
    features = parse_elements(elements)
    assert len(features) == 1
    assert features[0]["category"] == "grocery"
    assert features[0]["name"] == "Billa"
    assert features[0]["osm_id"] == 1


def test_parse_elements_center():
    elements = [
        {
            "type": "way",
            "id": 2,
            "center": {"lat": 42.69, "lon": 23.32},
            "tags": {"amenity": "cafe", "name": "Happy"},
        },
    ]
    features = parse_elements(elements)
    assert len(features) == 1
    assert features[0]["category"] == "restaurant"


def test_parse_elements_skips_unknown():
    elements = [
        {
            "type": "node",
            "id": 3,
            "lat": 42.69,
            "lon": 23.32,
            "tags": {"tourism": "hotel"},
        },
    ]
    features = parse_elements(elements)
    assert len(features) == 0


def test_parse_elements_skips_missing_coords():
    elements = [
        {"type": "relation", "id": 4, "tags": {"amenity": "bank"}},
    ]
    features = parse_elements(elements)
    assert len(features) == 0


def test_fetch_city_returns_empty_geodataframe_for_no_results(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(
        "pipeline.fetch_amenities.requests.get",
        lambda *args, **kwargs: DummyResponse(payload={"elements": []}),
    )
    monkeypatch.setattr(gpd.GeoDataFrame, "to_file", lambda self, *args, **kwargs: None)

    gdf = fetch_city("София")

    assert gdf.empty
    assert list(gdf.columns) == ["geometry", "category", "name", "name_bg", "osm_id"]
    assert str(gdf.crs) == "EPSG:4326"


def test_fetch_city_raises_clear_error_on_rate_limit(monkeypatch):
    monkeypatch.setattr(
        "pipeline.fetch_amenities.requests.get",
        lambda *args, **kwargs: DummyResponse(
            status_code=429,
            text="rate_limited",
        ),
    )

    with pytest.raises(RuntimeError, match="Overpass API rate limit"):
        fetch_city("София")
