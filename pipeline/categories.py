"""Category definitions for WalkScore.bg amenity classification."""

WALK_CATEGORIES = {
    "grocery": {
        "query_parts": [
            'nwr["shop"~"supermarket|convenience|greengrocer|bakery|butcher|deli|pastry"]',
            'nwr["amenity"="marketplace"]',
        ],
        "weight": 3,
        "nearest_n": 1,
        "label_bg": "Хранителни",
        "label_en": "Grocery",
    },
    "restaurant": {
        "query_parts": [
            'nwr["amenity"~"restaurant|cafe|bar|fast_food|pub|food_court"]',
        ],
        "weight": 2,
        "nearest_n": 5,
        "label_bg": "Ресторанти и кафенета",
        "label_en": "Restaurants & Cafes",
    },
    "shopping": {
        "query_parts": [
            'nwr["shop"~"clothes|shoes|electronics|department_store|mall|hardware|furniture|optician"]',
        ],
        "weight": 1,
        "nearest_n": 3,
        "label_bg": "Шопинг",
        "label_en": "Shopping",
    },
    "errands": {
        "query_parts": [
            'nwr["amenity"~"bank|pharmacy|post_office|atm|dentist|doctors|clinic"]',
        ],
        "weight": 3,
        "nearest_n": 1,
        "label_bg": "Ежедневни нужди",
        "label_en": "Errands",
    },
    "parks": {
        "query_parts": [
            'nwr["leisure"~"park|garden|playground|fitness_station|sports_centre"]',
        ],
        "weight": 1,
        "nearest_n": 1,
        "label_bg": "Паркове и отдих",
        "label_en": "Parks & Recreation",
    },
    "education": {
        "query_parts": [
            'nwr["amenity"~"school|kindergarten|university|college|library"]',
        ],
        "weight": 1,
        "nearest_n": 1,
        "label_bg": "Образование",
        "label_en": "Education",
    },
}

TRANSIT_MODES = {
    "transit_bus": {
        "query_parts": ['nwr["highway"="bus_stop"]'],
        "weight": 1,
        "max_distance": 600,
        "label_bg": "Автобус",
        "label_en": "Bus",
    },
    "transit_tram": {
        "query_parts": ['nwr["railway"="tram_stop"]'],
        "weight": 3,
        "max_distance": 800,
        "label_bg": "Трамвай",
        "label_en": "Tram",
    },
    "transit_metro": {
        "query_parts": [
            'nwr["station"="subway"]',
            'nwr["railway"="station"]',
        ],
        "weight": 5,
        "max_distance": 1200,
        "label_bg": "Метро",
        "label_en": "Metro",
    },
}

BIKE_CATEGORIES = {
    "bike_parking": {
        "query_parts": ['nwr["amenity"="bicycle_parking"]'],
        "label_bg": "Велопаркинг",
        "label_en": "Bike Parking",
    },
    "bike_shop": {
        "query_parts": ['nwr["shop"="bicycle"]'],
        "label_bg": "Веломагазин",
        "label_en": "Bike Shop",
    },
    "bike_sharing": {
        "query_parts": ['nwr["amenity"="bicycle_rental"]'],
        "label_bg": "Велосподеляне",
        "label_en": "Bike Sharing",
    },
}

_SHOP_MAP = {
    "supermarket": "grocery",
    "convenience": "grocery",
    "greengrocer": "grocery",
    "bakery": "grocery",
    "butcher": "grocery",
    "deli": "grocery",
    "pastry": "grocery",
    "clothes": "shopping",
    "shoes": "shopping",
    "electronics": "shopping",
    "department_store": "shopping",
    "mall": "shopping",
    "hardware": "shopping",
    "furniture": "shopping",
    "optician": "shopping",
    "bicycle": "bike_shop",
}

_AMENITY_MAP = {
    "marketplace": "grocery",
    "restaurant": "restaurant",
    "cafe": "restaurant",
    "bar": "restaurant",
    "fast_food": "restaurant",
    "pub": "restaurant",
    "food_court": "restaurant",
    "bank": "errands",
    "pharmacy": "errands",
    "post_office": "errands",
    "atm": "errands",
    "dentist": "errands",
    "doctors": "errands",
    "clinic": "errands",
    "school": "education",
    "kindergarten": "education",
    "university": "education",
    "college": "education",
    "library": "education",
    "bicycle_parking": "bike_parking",
    "bicycle_rental": "bike_sharing",
}

_LEISURE_MAP = {
    "park": "parks",
    "garden": "parks",
    "playground": "parks",
    "fitness_station": "parks",
    "sports_centre": "parks",
}


def classify(tags: dict) -> str:
    """Classify an OSM element into a WalkScore category."""
    shop = tags.get("shop", "")
    if shop in _SHOP_MAP:
        return _SHOP_MAP[shop]

    amenity = tags.get("amenity", "")
    if amenity in _AMENITY_MAP:
        return _AMENITY_MAP[amenity]

    leisure = tags.get("leisure", "")
    if leisure in _LEISURE_MAP:
        return _LEISURE_MAP[leisure]

    if tags.get("highway") == "bus_stop":
        return "transit_bus"
    if tags.get("public_transport") == "stop_position":
        return "transit_bus"
    if tags.get("railway") == "tram_stop":
        return "transit_tram"
    if tags.get("station") == "subway" or tags.get("railway") == "station":
        return "transit_metro"

    return "other"
