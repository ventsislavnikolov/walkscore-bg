-- RPC: Batch insert score cells from WKT geometry strings
CREATE OR REPLACE FUNCTION insert_cells_wkt(cells JSONB)
RETURNS VOID AS $$
DECLARE
    cell JSONB;
BEGIN
    FOR cell IN SELECT * FROM jsonb_array_elements(cells)
    LOOP
        INSERT INTO ws_cells (
            city, geom, center, walk_score, transit_score, bike_score,
            walk_label, transit_label, bike_label,
            grocery, restaurant, shopping, errands, parks, education
        ) VALUES (
            cell->>'city',
            ST_GeomFromText(cell->>'geom', 4326),
            ST_GeomFromText(cell->>'center', 4326),
            (cell->>'walk_score')::REAL,
            (cell->>'transit_score')::REAL,
            (cell->>'bike_score')::REAL,
            cell->>'walk_label',
            cell->>'transit_label',
            cell->>'bike_label',
            (cell->>'grocery')::REAL,
            (cell->>'restaurant')::REAL,
            (cell->>'shopping')::REAL,
            (cell->>'errands')::REAL,
            (cell->>'parks')::REAL,
            (cell->>'education')::REAL
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- RPC: Batch insert amenities from WKT point strings
CREATE OR REPLACE FUNCTION insert_amenities_wkt(amenities JSONB)
RETURNS VOID AS $$
DECLARE
    amenity JSONB;
BEGIN
    FOR amenity IN SELECT * FROM jsonb_array_elements(amenities)
    LOOP
        INSERT INTO ws_amenities (
            city, osm_id, category, name, name_bg, geom
        ) VALUES (
            amenity->>'city',
            (amenity->>'osm_id')::BIGINT,
            amenity->>'category',
            NULLIF(amenity->>'name', ''),
            NULLIF(amenity->>'name_bg', ''),
            ST_GeomFromText(amenity->>'geom', 4326)
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- RPC: Get city average scores
CREATE OR REPLACE FUNCTION get_city_averages(p_city TEXT)
RETURNS TABLE (avg_walk REAL, avg_transit REAL, avg_bike REAL) AS $$
    SELECT
        AVG(walk_score)::REAL AS avg_walk,
        AVG(transit_score)::REAL AS avg_transit,
        AVG(bike_score)::REAL AS avg_bike
    FROM ws_cells
    WHERE city = p_city AND walk_score > 0;
$$ LANGUAGE SQL STABLE;
