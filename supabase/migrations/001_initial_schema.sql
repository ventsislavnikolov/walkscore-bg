-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Grid cells with pre-computed scores
CREATE TABLE ws_cells (
    id BIGSERIAL PRIMARY KEY,
    city TEXT NOT NULL DEFAULT 'sofia',
    geom GEOMETRY(Polygon, 4326) NOT NULL,
    center GEOMETRY(Point, 4326) NOT NULL,
    walk_score REAL NOT NULL DEFAULT 0,
    transit_score REAL NOT NULL DEFAULT 0,
    bike_score REAL NOT NULL DEFAULT 0,
    walk_label TEXT NOT NULL DEFAULT '',
    transit_label TEXT NOT NULL DEFAULT '',
    bike_label TEXT NOT NULL DEFAULT '',
    grocery REAL DEFAULT 0,
    restaurant REAL DEFAULT 0,
    shopping REAL DEFAULT 0,
    errands REAL DEFAULT 0,
    parks REAL DEFAULT 0,
    education REAL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ws_cells_geom ON ws_cells USING GIST(geom);
CREATE INDEX idx_ws_cells_center ON ws_cells USING GIST(center);
CREATE INDEX idx_ws_cells_city ON ws_cells(city);

-- Amenities (POIs from OSM)
CREATE TABLE ws_amenities (
    id BIGSERIAL PRIMARY KEY,
    city TEXT NOT NULL DEFAULT 'sofia',
    osm_id BIGINT NOT NULL,
    category TEXT NOT NULL,
    name TEXT,
    name_bg TEXT,
    geom GEOMETRY(Point, 4326) NOT NULL
);

CREATE INDEX idx_ws_amenities_geom ON ws_amenities USING GIST(geom);
CREATE INDEX idx_ws_amenities_city_cat ON ws_amenities(city, category);

-- City metadata
CREATE TABLE ws_cities (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name_bg TEXT NOT NULL,
    name_en TEXT NOT NULL,
    center_lat FLOAT NOT NULL,
    center_lng FLOAT NOT NULL,
    bbox FLOAT[4],
    avg_walk_score REAL DEFAULT 0,
    avg_transit_score REAL DEFAULT 0,
    avg_bike_score REAL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active'
);

-- Insert Sofia
INSERT INTO ws_cities (slug, name_bg, name_en, center_lat, center_lng, bbox, status)
VALUES ('sofia', 'София', 'Sofia', 42.6977, 23.3219,
        ARRAY[23.2, 42.6, 23.45, 42.75], 'active');

-- Search log (anonymized analytics)
CREATE TABLE ws_search_log (
    id BIGSERIAL PRIMARY KEY,
    query TEXT,
    lat FLOAT,
    lng FLOAT,
    walk_score REAL,
    lang TEXT DEFAULT 'bg',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RPC: Get scores for a point
CREATE OR REPLACE FUNCTION get_scores(p_lng FLOAT, p_lat FLOAT)
RETURNS TABLE (
    walk_score REAL,
    transit_score REAL,
    bike_score REAL,
    walk_label TEXT,
    transit_label TEXT,
    bike_label TEXT,
    grocery REAL,
    restaurant REAL,
    shopping REAL,
    errands REAL,
    parks REAL,
    education REAL
) AS $$
    SELECT
        c.walk_score, c.transit_score, c.bike_score,
        c.walk_label, c.transit_label, c.bike_label,
        c.grocery, c.restaurant, c.shopping,
        c.errands, c.parks, c.education
    FROM ws_cells c
    WHERE ST_Contains(c.geom, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326))
    LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- RPC: Get nearby amenities
CREATE OR REPLACE FUNCTION get_nearby_amenities(
    p_lng FLOAT,
    p_lat FLOAT,
    p_radius_m INT DEFAULT 1000
)
RETURNS TABLE (
    id BIGINT,
    category TEXT,
    name TEXT,
    name_bg TEXT,
    distance_m FLOAT,
    lng FLOAT,
    lat FLOAT
) AS $$
    SELECT
        a.id,
        a.category,
        a.name,
        a.name_bg,
        ST_Distance(
            a.geom::geography,
            ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
        ) as distance_m,
        ST_X(a.geom) as lng,
        ST_Y(a.geom) as lat
    FROM ws_amenities a
    WHERE ST_DWithin(
        a.geom::geography,
        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
        p_radius_m
    )
    ORDER BY distance_m
    LIMIT 50;
$$ LANGUAGE SQL STABLE;

-- RPC: Get heatmap data for bounding box
CREATE OR REPLACE FUNCTION get_heatmap_bbox(
    p_min_lng FLOAT, p_min_lat FLOAT,
    p_max_lng FLOAT, p_max_lat FLOAT,
    p_min_score FLOAT DEFAULT 0
)
RETURNS TABLE (
    id BIGINT,
    walk_score REAL,
    transit_score REAL,
    bike_score REAL,
    walk_label TEXT,
    geojson TEXT
) AS $$
    SELECT
        c.id, c.walk_score, c.transit_score, c.bike_score,
        c.walk_label,
        ST_AsGeoJSON(c.geom)::TEXT as geojson
    FROM ws_cells c
    WHERE c.geom && ST_MakeEnvelope(p_min_lng, p_min_lat, p_max_lng, p_max_lat, 4326)
      AND c.walk_score >= p_min_score
    LIMIT 5000;
$$ LANGUAGE SQL STABLE;
