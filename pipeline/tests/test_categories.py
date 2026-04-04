from pipeline.categories import WALK_CATEGORIES, TRANSIT_MODES, BIKE_CATEGORIES, classify


def test_walk_categories_have_required_fields():
    for name, cat in WALK_CATEGORIES.items():
        assert "query_parts" in cat, f"{name} missing query_parts"
        assert "weight" in cat, f"{name} missing weight"
        assert "nearest_n" in cat, f"{name} missing nearest_n"
        assert "label_bg" in cat, f"{name} missing label_bg"
        assert "label_en" in cat, f"{name} missing label_en"


def test_transit_modes_have_required_fields():
    for name, mode in TRANSIT_MODES.items():
        assert "query_parts" in mode
        assert "weight" in mode
        assert "max_distance" in mode


def test_bike_categories_have_required_fields():
    for name, category in BIKE_CATEGORIES.items():
        assert "query_parts" in category, f"{name} missing query_parts"
        assert "label_bg" in category, f"{name} missing label_bg"
        assert "label_en" in category, f"{name} missing label_en"


def test_classify_grocery():
    assert classify({"shop": "supermarket"}) == "grocery"
    assert classify({"shop": "bakery"}) == "grocery"
    assert classify({"amenity": "marketplace"}) == "grocery"


def test_classify_restaurant():
    assert classify({"amenity": "restaurant"}) == "restaurant"
    assert classify({"amenity": "cafe"}) == "restaurant"


def test_classify_transit():
    assert classify({"highway": "bus_stop"}) == "transit_bus"
    assert classify({"railway": "tram_stop"}) == "transit_tram"
    assert classify({"station": "subway"}) == "transit_metro"


def test_classify_bike():
    assert classify({"amenity": "bicycle_parking"}) == "bike_parking"
    assert classify({"shop": "bicycle"}) == "bike_shop"
    assert classify({"amenity": "bicycle_rental"}) == "bike_sharing"


def test_classify_unknown():
    assert classify({"tourism": "hotel"}) == "other"
    assert classify({}) == "other"
