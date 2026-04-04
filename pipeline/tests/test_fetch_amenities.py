from pipeline.fetch_amenities import build_overpass_query, parse_elements


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
