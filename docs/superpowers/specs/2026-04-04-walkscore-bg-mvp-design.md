# WalkScore.bg — MVP Design Spec

Bulgaria's first walkability index. Enter an address in Sofia, get Walk Score + Transit Score + Bike Score (0-100) with heatmap and category breakdown.

**Goal:** Same functionality as walkscore.com but with modern, clean UI/UX and proper Bulgarian data support.

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | TanStack Start + Router + Query + Store + Keys | Full TanStack ecosystem, SSR, type-safe |
| Map | MapLibre GL JS | Vector tiles, GPU-accelerated, free, premium feel |
| Tiles | PMTiles (static file) | No tile server, CDN-cacheable, instant heatmap |
| Backend | TanStack Start server functions | Unified stack, calls Supabase directly |
| Database | Supabase PostGIS | Spatial queries, RPC functions, free tier |
| Pipeline | Python 3.12+ | GeoPandas, scipy, tippecanoe for tile generation |
| Deploy | Vercel | First-class TanStack Start support, edge functions |
| Geocoding | Nominatim (OSM) + Photon fallback | Free, no API key, works for BG addresses |
| i18n | JSON translation files | BG default + EN toggle, extensible |

**MCP integrations:** Supabase MCP (DB/migrations), Vercel MCP (deploy), Linear MCP (task tracking).

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND                           │
│  TanStack Start + Router + Query + MapLibre GL        │
│                                                       │
│  Routes:                                              │
│  /              → Landing + search                    │
│  /score         → Score result + map + breakdown      │
│  /map           → Full-screen heatmap                 │
│  /compare       → Compare 2 addresses                 │
│  /sofia         → City overview + neighborhood ranks  │
│  /sofia/:hood   → Neighborhood page                   │
│  /embed         → Widget preview + embed code         │
│  /about         → Methodology + data sources          │
│  /en/...        → English versions of all above       │
└─────────────────────┬────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│              TANSTACK START SERVER FUNCTIONS           │
│                                                       │
│  • scoreByAddress(address) → geocode + lookup         │
│  • scoreByCoords(lat, lng) → direct lookup            │
│  • heatmapBbox(bbox, layer) → GeoJSON for area        │
│  • nearbyAmenities(lat, lng, radius) → POI list       │
│  • cityStats(city) → averages + neighborhood ranks    │
│  • ogImage(score, address) → dynamic social image     │
└─────────────────────┬────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│                  SUPABASE (PostGIS)                    │
│                                                       │
│  Tables: ws_cells, ws_amenities, ws_cities,           │
│          ws_search_log                                 │
│  RPC: get_scores(), get_nearby_amenities(),           │
│       get_city_stats()                                │
└──────────────────────────────────────────────────────┘
                      ▲
                      │ (batch, every 1-3 months)
┌──────────────────────────────────────────────────────┐
│                  DATA PIPELINE (Python)                │
│                                                       │
│  1. Overpass API → amenities + bike infra GeoJSON     │
│  2. 100m grid → Walk/Transit/Bike score per cell      │
│  3. tippecanoe → PMTiles (static vector tiles)        │
│  4. Upload → Supabase PostGIS                         │
└──────────────────────────────────────────────────────┘
```

**Map rendering:** MapLibre loads PMTiles directly from Vercel static hosting (CDN). No tile server. The heatmap renders instantly from the static file (~5-15MB for Sofia).

---

## Data Pipeline

### Step 1: Fetch Amenities

**File:** `pipeline/fetch_amenities.py`

Overpass API query for Sofia (admin_level=4). Categories:

| Category | OSM Tags | Score Type |
|----------|----------|-----------|
| grocery | shop=supermarket/convenience/greengrocer/bakery/butcher/deli/pastry, amenity=marketplace | Walk |
| restaurant | amenity=restaurant/cafe/bar/fast_food/pub/food_court | Walk |
| shopping | shop=clothes/shoes/electronics/department_store/mall/hardware/furniture/optician | Walk |
| errands | amenity=bank/pharmacy/post_office/atm/dentist/doctors/clinic | Walk |
| parks | leisure=park/garden/playground/fitness_station/sports_centre | Walk |
| education | amenity=school/kindergarten/university/college/library | Walk |
| transit_bus | highway=bus_stop | Transit |
| transit_tram | railway=tram_stop | Transit |
| transit_metro | station=subway, railway=station | Transit |
| bike_parking | amenity=bicycle_parking | Bike |
| bike_shop | shop=bicycle | Bike |
| bike_sharing | amenity=bicycle_rental | Bike |

**Output:** `data/sofia_amenities.geojson`

### Step 2: Fetch Bike Infrastructure

**File:** `pipeline/fetch_bike_infra.py`

Overpass query for way geometries:
- `cycleway=*`
- `highway=cycleway`
- `bicycle=designated`

Computes meters of bike infrastructure within 500m of each grid cell center.

**Output:** `data/sofia_bike_infra.geojson`

### Step 3: Compute Scores

**File:** `pipeline/compute_scores.py`

**Grid:** 100m x 100m cells in UTM 35N (EPSG:32635), covering Sofia with 1km buffer.

**Distance decay function (smootherstep):**
```
decay(d) = 1 - (6d^5 - 15d^4 + 10d^3)  where d = distance / max_distance
```
- 0-400m: ~full score
- 400-800m: rapid decay
- >2400m: zero

#### Walk Score (0-100)

Weighted average across 6 categories:

| Category | Weight | Nearest N |
|----------|--------|-----------|
| grocery | 3 | 1 |
| restaurant | 2 | 5 |
| shopping | 1 | 3 |
| errands | 3 | 1 |
| parks | 1 | 1 |
| education | 1 | 1 |

Per category: find N nearest amenities, apply decay to each distance, average the decay values, multiply by 100. Final Walk Score = weighted average across categories.

#### Transit Score (0-100)

Mode-weighted proximity + density bonus:

| Mode | Weight | Max Distance |
|------|--------|-------------|
| metro | 5 | 1200m |
| tram | 3 | 800m |
| bus | 1 | 600m |

Per mode: find nearest stop, apply decay with mode-specific max distance. Density bonus: count of stops within 600m, normalized (0-20 bonus points). Final Transit Score = weighted sum + density bonus, capped at 100.

#### Bike Score (0-100)

Three components:

| Component | Weight | Method |
|-----------|--------|--------|
| Bike infrastructure | 40% | Meters of bike lanes within 500m, normalized to 0-100 |
| Bike amenities | 30% | Proximity to bike parking/shops/sharing, decay function |
| Road connectivity | 30% | Intersection density from OSM road network within 500m |

Final Bike Score = weighted sum of components.

**Output:** `data/sofia_scores.geojson`

### Step 4: Generate Tiles

**File:** `pipeline/generate_tiles.py`

Convert GeoJSON to PMTiles using `tippecanoe`:
```bash
tippecanoe -o sofia.pmtiles -z14 -Z10 --drop-densest-as-needed sofia_scores.geojson
```

**Output:** `public/tiles/sofia.pmtiles`

### Step 5: Upload to Supabase

**File:** `pipeline/upload_supabase.py`

Insert grid cells and amenities into PostGIS tables. Create/update RPC functions.

---

## Database Schema

### Table: `ws_cells`

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL PK | |
| city | TEXT | City slug (e.g., "sofia") |
| geom | GEOMETRY(Polygon, 4326) | Cell polygon |
| center | GEOMETRY(Point, 4326) | Cell centroid |
| walk_score | REAL | 0-100 |
| transit_score | REAL | 0-100 |
| bike_score | REAL | 0-100 |
| walk_label | TEXT | Score label |
| transit_label | TEXT | Score label |
| bike_label | TEXT | Score label |
| grocery | REAL | Category sub-score |
| restaurant | REAL | Category sub-score |
| shopping | REAL | Category sub-score |
| errands | REAL | Category sub-score |
| parks | REAL | Category sub-score |
| education | REAL | Category sub-score |
| updated_at | TIMESTAMPTZ | Last pipeline run |

**Indexes:** GIST on geom, GIST on center, B-tree on city.

### Table: `ws_amenities`

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL PK | |
| city | TEXT | City slug |
| osm_id | BIGINT | OpenStreetMap ID |
| category | TEXT | Category key |
| name | TEXT | POI name |
| name_bg | TEXT | Bulgarian name |
| geom | GEOMETRY(Point, 4326) | Location |

**Indexes:** GIST on geom, B-tree on city + category.

### Table: `ws_cities`

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | |
| slug | TEXT UNIQUE | URL slug (e.g., "sofia") |
| name_bg | TEXT | Bulgarian name |
| name_en | TEXT | English name |
| center_lat | FLOAT | City center latitude |
| center_lng | FLOAT | City center longitude |
| bbox | FLOAT[4] | Bounding box [minLng, minLat, maxLng, maxLat] |
| avg_walk_score | REAL | City average |
| avg_transit_score | REAL | City average |
| avg_bike_score | REAL | City average |
| status | TEXT | "active" or "coming_soon" |

### Table: `ws_search_log`

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL PK | |
| query | TEXT | Search input (anonymized) |
| lat | FLOAT | Resolved latitude |
| lng | FLOAT | Resolved longitude |
| walk_score | REAL | Result score |
| lang | TEXT | User language |
| created_at | TIMESTAMPTZ | Timestamp |

No user-identifying data. For analytics only.

### RPC Functions

**`get_scores(lng FLOAT, lat FLOAT)`**
Returns walk_score, transit_score, bike_score, all labels, and all category sub-scores for the cell containing the given point.

**`get_nearby_amenities(lng FLOAT, lat FLOAT, radius_m INT DEFAULT 1000)`**
Returns amenities within radius, ordered by distance, grouped by category.

**`get_city_stats(city_slug TEXT)`**
Returns city averages, neighborhood rankings (using admin boundaries or grid aggregation).

---

## Pages & UX

### `/` — Landing Page

**Hero section:**
- Large heading: "Walk Score **.bg**" with emerald accent
- Subheading: "How walkable is your address? Bulgaria's first walkability index."
- Search bar with MapPin icon, placeholder "ul. Vitoshka 42, Sofia"
- "Check" button (emerald)
- Quick-try links: "ul. Graf Ignatiev", "zh.k. Lyulin", "kv. Lozenets", "Vitosha"

**How it works:** 3 columns — Enter address, Get scores, See the map.

**CTA:** Link to full-screen heatmap.

**Footer:** About, methodology, data sources, language toggle.

### `/score` — Score Result Page

**Desktop layout:** Two columns — map (60% left), score panel (40% right).

**Score panel (right):**
1. Address header with resolved address
2. Three score gauges — circular arc, large number, color-coded (green/amber/red):
   - Walk Score with label
   - Transit Score with label
   - Bike Score with label
3. Category breakdown — expandable per score type:
   - Walk: 6 categories with horizontal bars
   - Transit: nearest stop per mode + distance
   - Bike: infrastructure, amenities, connectivity bars
4. Nearby amenities — grouped by category, name + distance, clickable (highlights on map)
5. Share/embed section — copy link, embed code

**Map (left):**
- MapLibre with PMTiles heatmap overlay (~2km around searched point)
- Address marker
- Amenity markers with category icons (toggleable)
- Click any heatmap cell for popup with score
- Layer toggle: Walk / Transit / Bike heatmap

**Mobile:** Stacks vertically — scores on top, map below (full-width), breakdown below map.

### `/map` — Full-Screen Heatmap

- MapLibre full viewport
- Layer switcher: Walk Score / Transit Score / Bike Score
- Color legend (score → color mapping)
- Search bar overlay (top)
- Click any cell → popup with scores + "See full details" link to `/score`
- City-wide view, zoom to neighborhood level

### `/compare` — Compare 2 Addresses

- Two search inputs side by side
- Side-by-side score display with winner highlighted per category
- Split map view or single map with both points marked
- Useful for people choosing between apartments

### `/sofia` — City Overview

- City name + average Walk/Transit/Bike scores
- City-wide heatmap (mini, MapLibre)
- Neighborhood rankings table: name, walk score, transit score, bike score — sortable
- Each neighborhood links to `/sofia/:neighborhood`

### `/sofia/:neighborhood` — Neighborhood Page

- Neighborhood name + average scores
- Local heatmap (zoomed to neighborhood bounds)
- Top amenities list
- SEO-optimized description text
- Pre-rendered for search engine indexing

### `/embed` — Widget Preview

- Live preview of iframe widget at different sizes
- Customization: theme (light/dark), language (BG/EN), size
- Copy-paste HTML code
- Shows how it looks on a real estate listing (mockup)

### `/about` — Methodology

- How each score is calculated (plain language + formula for nerds)
- Data sources (OSM, update frequency)
- Comparison with walkscore.com and what we do differently
- Contact / feedback form

---

## i18n

**Approach:**
- Translation files: `src/locales/bg.json`, `src/locales/en.json`
- Language detection: browser locale → BG default
- Toggle in header (BG/EN flag icons or text)
- URL structure: no prefix for BG (default), `/en/` prefix for English
- TanStack Router: locale as a layout wrapper parameter
- All UI strings through translation helper, never hardcoded

**Extensible:** Adding a new language = adding a new JSON file + route prefix.

---

## SEO

**Pre-rendered pages:**
- `/sofia` and all `/sofia/:neighborhood` pages — server-rendered with scores baked in
- ~30-40 neighborhood pages extracted from OSM admin boundaries (admin_level=9 for Sofia districts, e.g., "Lozenets", "Mladost", "Lyulin"). Fallback: manually curated list of well-known neighborhoods if OSM coverage is incomplete.

**Dynamic OG images:**
- Server function generates an image with score gauge + address + mini-map
- URL: `/api/og?score=87&transit=72&bike=65&address=ul.+Vitoshka+42`

**Structured data:**
- JSON-LD: Place schema with address and aggregateRating (the scores)

**Sitemap:**
- Auto-generated `sitemap.xml` from cities + neighborhoods list
- Both BG and EN versions

**Meta descriptions:**
- Include actual score values: "Walk Score 87/100 for ul. Vitoshka, Sofia. Walker's Paradise."

---

## Embed Widget

**Format:** Iframe, responsive.

**Default size:** 350x200px.

**Content:** Address, three mini-gauges (Walk/Transit/Bike), "Powered by WalkScore.bg" link.

**URL params:** `lat`, `lng`, `theme` (light|dark), `lang` (bg|en).

**Distribution:** Free with branding. Future: paid tier without branding.

---

## Public API

**Endpoints (TanStack Start server functions, also exposed as REST-like routes):**

`GET /api/score?address=...` or `GET /api/score?lat=...&lng=...`
- Returns: walk_score, transit_score, bike_score, labels, category breakdown, resolved address

`GET /api/heatmap?bbox=minLng,minLat,maxLng,maxLat&layer=walk|transit|bike`
- Returns: GeoJSON FeatureCollection

**Rate limiting:** 100 requests/day per IP (unauthenticated). Documented on `/about`.

**Future:** API keys, tiered plans, higher limits.

---

## MVP Scope — Explicitly Out

- User accounts / favorites / login
- Apartment/real estate listings
- API key management / billing
- Multiple cities (Sofia only)
- GTFS transit frequency data (use proximity-only for Transit Score)
- SRTM elevation data for Bike Score (assume flat for MVP)
- Historical score trends
- AI analysis / predictions
- Mobile native app
