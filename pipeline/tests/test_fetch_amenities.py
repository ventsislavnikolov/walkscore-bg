import geopandas as gpd

from pipeline.fetch_amenities import _expand_query_part, build_overpass_query, fetch_city, parse_elements


def test_build_overpass_query_contains_city():
    query = build_overpass_query('area["name"="Sofia"]["admin_level"="8"]', ['nwr["shop"="supermarket"]'])
    assert '"Sofia"' in query
    assert '"8"' in query
    assert "out center" in query


def test_build_overpass_query_includes_all_categories():
    query = build_overpass_query(
        'area["name"="Sofia"]["admin_level"="8"]',
        ['nwr["shop"="supermarket"]', 'nwr["amenity"="restaurant"]', 'nwr["highway"="bus_stop"]'],
    )
    assert "supermarket" in query
    assert "restaurant" in query
    assert "bus_stop" in query


def test_expand_query_part_splits_regex_into_exact_queries():
    parts = _expand_query_part('nwr["amenity"~"bank|pharmacy|atm"]')
    assert parts == [
        'nwr["amenity"="bank"]',
        'nwr["amenity"="pharmacy"]',
        'nwr["amenity"="atm"]',
    ]


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
        "pipeline.fetch_amenities.select_area_selector",
        lambda *args, **kwargs: 'area["name"="Sofia"]["admin_level"="8"]',
    )
    monkeypatch.setattr(
        "pipeline.fetch_amenities.fetch_json",
        lambda *args, **kwargs: {"elements": []},
    )
    monkeypatch.setattr(gpd.GeoDataFrame, "to_file", lambda self, *args, **kwargs: None)

    gdf = fetch_city("София")

    assert gdf.empty
    assert list(gdf.columns) == ["geometry", "category", "name", "name_bg", "osm_id"]
    assert str(gdf.crs) == "EPSG:4326"
