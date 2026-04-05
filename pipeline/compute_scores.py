"""Compute Walk, Transit, and Bike scores on a 100m grid."""

from pathlib import Path

import geopandas as gpd
import numpy as np
from scipy.spatial import cKDTree
from shapely.geometry import Point, box

from pipeline.categories import TRANSIT_MODES, WALK_CATEGORIES

UTM_CRS = "EPSG:32635"
WGS84_CRS = "EPSG:4326"


def distance_decay(distance_m: float, max_dist: float = 2400.0) -> float:
    """Return a smooth 0..1 decay for a distance in meters."""
    if distance_m >= max_dist:
        return 0.0
    if distance_m <= 0:
        return 1.0

    d = distance_m / max_dist
    return 1.0 - (6 * d**5 - 15 * d**4 + 10 * d**3)


def score_label(score: float, score_type: str = "walk") -> str:
    """Return a human-readable label for the score."""
    if score_type == "transit":
        labels = [
            (90, "Rider's Paradise"),
            (70, "Excellent Transit"),
            (50, "Good Transit"),
            (25, "Some Transit"),
            (0, "Minimal Transit"),
        ]
    elif score_type == "bike":
        labels = [
            (90, "Biker's Paradise"),
            (70, "Very Bikeable"),
            (50, "Bikeable"),
            (25, "Minimal Bike Infra"),
            (0, "Not Bikeable"),
        ]
    else:
        labels = [
            (90, "Walker's Paradise"),
            (70, "Very Walkable"),
            (50, "Somewhat Walkable"),
            (25, "Car-Dependent"),
            (0, "Car-Dependent"),
        ]

    for threshold, label in labels:
        if score >= threshold:
            return label
    return labels[-1][1]


def compute_walk_score_for_cell(distances_by_category: dict[str, list[float]]) -> float:
    """Compute Walk Score from amenity distances by category."""
    total_weighted = 0.0
    total_weight = 0.0

    for category_name, category_info in WALK_CATEGORIES.items():
        dists = distances_by_category.get(category_name, [])
        if dists:
            decays = [distance_decay(distance) for distance in dists[: category_info["nearest_n"]]]
            category_score = float(np.mean(decays)) * 100
        else:
            category_score = 0.0

        total_weighted += category_score * category_info["weight"]
        total_weight += category_info["weight"]

    return round(total_weighted / total_weight, 1) if total_weight else 0.0


def compute_transit_score_for_cell(
    mode_distances: dict[str, list[float]],
    stop_density: int,
) -> float:
    """Compute Transit Score from nearest-mode distances and local stop density."""
    total_weighted = 0.0
    total_weight = 0.0

    for mode_name, mode_info in TRANSIT_MODES.items():
        distances = mode_distances.get(mode_name, [])
        if distances:
            mode_score = distance_decay(distances[0], max_dist=mode_info["max_distance"]) * 100
            total_weighted += mode_score * mode_info["weight"]
            total_weight += mode_info["weight"]
        else:
            continue

    base_score = total_weighted / total_weight if total_weight else 0.0
    density_bonus = min(stop_density, 20)
    return min(round(base_score + density_bonus, 1), 100.0)


def compute_bike_score_for_cell(
    infra_meters: float,
    amenity_distances: list[float],
    intersection_density: float,
    max_infra_meters: float = 2000.0,
    max_intersection_density: float = 30.0,
) -> float:
    """Compute Bike Score from infra length, bike amenities, and connectivity."""
    infra_score = min(infra_meters / max_infra_meters, 1.0) * 100

    if amenity_distances:
        amenity_decays = [distance_decay(distance, max_dist=1200) for distance in amenity_distances[:3]]
        amenity_score = float(np.mean(amenity_decays)) * 100
    else:
        amenity_score = 0.0

    connectivity_score = min(intersection_density / max_intersection_density, 1.0) * 100
    total = infra_score * 0.4 + amenity_score * 0.3 + connectivity_score * 0.3
    return round(total, 1)


def create_grid(
    bounds_gdf: gpd.GeoDataFrame,
    cell_size: int = 100,
    buffer_km: float = 1.0,
) -> gpd.GeoDataFrame:
    """Create a buffered square grid around the input geometries."""
    if bounds_gdf.empty:
        raise ValueError("Cannot create a score grid from empty input geometries.")

    gdf_utm = bounds_gdf.to_crs(UTM_CRS)
    bounds = gdf_utm.total_bounds

    buffer_m = buffer_km * 1000
    minx, miny = bounds[0] - buffer_m, bounds[1] - buffer_m
    maxx, maxy = bounds[2] + buffer_m, bounds[3] + buffer_m

    cols = np.arange(minx, maxx, cell_size)
    rows = np.arange(miny, maxy, cell_size)

    cells = [
        {
            "geometry": box(x, y, x + cell_size, y + cell_size),
            "cx": x + cell_size / 2,
            "cy": y + cell_size / 2,
        }
        for x in cols
        for y in rows
    ]

    grid = gpd.GeoDataFrame(cells, crs=UTM_CRS)
    print(f"Grid: {len(grid)} cells ({len(cols)} x {len(rows)})")
    return grid


def build_kd_trees(amenities_utm: gpd.GeoDataFrame) -> dict[str, tuple[cKDTree, np.ndarray]]:
    """Build KD trees per amenity category for nearest-neighbor lookups."""
    trees: dict[str, tuple[cKDTree, np.ndarray]] = {}
    if amenities_utm.empty:
        return trees

    for category_name in amenities_utm.category.unique():
        category_points = amenities_utm[amenities_utm.category == category_name]
        if category_points.empty:
            continue
        xy = np.array([(geometry.x, geometry.y) for geometry in category_points.geometry])
        trees[category_name] = (cKDTree(xy), xy)

    return trees


def count_within_radius(tree: cKDTree, center: np.ndarray, radius: float) -> int:
    """Count points within a radius of the provided center coordinate."""
    return len(tree.query_ball_point(center, radius))


def _query_k_nearest(tree: cKDTree, center: np.ndarray, max_items: int) -> list[float]:
    """Return distances to up to max_items nearest neighbors."""
    if tree.n == 0 or max_items <= 0:
        return []

    k = min(max_items, tree.n)
    distances, _ = tree.query(center, k=k)
    if k == 1:
        return [float(distances)]
    return [float(distance) for distance in np.atleast_1d(distances)]


def compute_all_scores(
    grid: gpd.GeoDataFrame,
    amenities: gpd.GeoDataFrame,
    bike_infra: gpd.GeoDataFrame,
) -> gpd.GeoDataFrame:
    """Compute Walk, Transit, and Bike scores for every grid cell."""
    amenities_utm = amenities.to_crs(UTM_CRS)
    trees = build_kd_trees(amenities_utm)

    if bike_infra.empty:
        bike_utm = gpd.GeoDataFrame(columns=["geometry"], geometry="geometry", crs=UTM_CRS)
    else:
        bike_utm = bike_infra.to_crs(UTM_CRS)

    centers = np.array([(row.cx, row.cy) for _, row in grid.iterrows()])
    n_cells = len(grid)

    walk_scores = np.zeros(n_cells)
    transit_scores = np.zeros(n_cells)
    bike_scores = np.zeros(n_cells)
    category_scores = {category_name: np.zeros(n_cells) for category_name in WALK_CATEGORIES}

    for index in range(n_cells):
        center = centers[index]

        distances_by_category: dict[str, list[float]] = {}
        for category_name, category_info in WALK_CATEGORIES.items():
            if category_name in trees:
                tree, _ = trees[category_name]
                distances_by_category[category_name] = _query_k_nearest(
                    tree,
                    center,
                    category_info["nearest_n"],
                )
            else:
                distances_by_category[category_name] = []

        walk_score = compute_walk_score_for_cell(distances_by_category)
        walk_scores[index] = walk_score

        for category_name, category_info in WALK_CATEGORIES.items():
            distances = distances_by_category.get(category_name, [])
            if not distances:
                continue
            decays = [distance_decay(distance) for distance in distances[: category_info["nearest_n"]]]
            category_scores[category_name][index] = round(float(np.mean(decays)) * 100, 1)

        transit_mode_distances: dict[str, list[float]] = {}
        stop_count = 0
        for mode_name in TRANSIT_MODES:
            if mode_name in trees:
                tree, _ = trees[mode_name]
                distances = _query_k_nearest(tree, center, 1)
                transit_mode_distances[mode_name] = distances
                stop_count += count_within_radius(tree, center, 600)
            else:
                transit_mode_distances[mode_name] = []

        transit_scores[index] = compute_transit_score_for_cell(transit_mode_distances, stop_count)

        infra_meters = 0.0
        if not bike_utm.empty:
            cell_point = Point(center[0], center[1])
            nearby = bike_utm[bike_utm.geometry.distance(cell_point) <= 500]
            if not nearby.empty:
                infra_meters = float(nearby.geometry.length.sum())

        bike_amenity_distances: list[float] = []
        for bike_category in ("bike_parking", "bike_shop", "bike_sharing"):
            if bike_category in trees:
                tree, _ = trees[bike_category]
                bike_amenity_distances.extend(_query_k_nearest(tree, center, 1))

        intersection_density = min(stop_count * 2.0, 30.0)
        bike_scores[index] = compute_bike_score_for_cell(
            infra_meters=infra_meters,
            amenity_distances=bike_amenity_distances,
            intersection_density=intersection_density,
        )

        if (index + 1) % 10000 == 0:
            print(f"  Processed {index + 1}/{n_cells} cells...")

    result = grid.copy()
    result["walk_score"] = walk_scores
    result["transit_score"] = transit_scores
    result["bike_score"] = bike_scores
    result["walk_label"] = [score_label(score, "walk") for score in walk_scores]
    result["transit_label"] = [score_label(score, "transit") for score in transit_scores]
    result["bike_label"] = [score_label(score, "bike") for score in bike_scores]

    for category_name in WALK_CATEGORIES:
        result[category_name] = category_scores[category_name]

    return result


def run_scoring(
    amenities_path: str,
    bike_infra_path: str,
    output_path: str,
    cell_size: int = 100,
) -> gpd.GeoDataFrame:
    """Load data, compute scores, and export score cells to GeoJSON."""
    amenities = gpd.read_file(amenities_path)
    try:
        bike_infra = gpd.read_file(bike_infra_path)
    except Exception:
        print("  No bike infrastructure data found, using empty.")
        bike_infra = gpd.GeoDataFrame(columns=["geometry"], geometry="geometry", crs=WGS84_CRS)

    grid = create_grid(amenities, cell_size=cell_size)
    print("Computing scores...")
    scored_grid = compute_all_scores(grid, amenities, bike_infra)

    scored_wgs = scored_grid.to_crs(WGS84_CRS)
    scored_wgs = scored_wgs[scored_wgs.walk_score > 0]

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    scored_wgs.to_file(output_path, driver="GeoJSON")

    print(f"\nResults: {len(scored_wgs)} cells with score > 0")
    print(
        f"  Walk Score  - mean: {scored_wgs.walk_score.mean():.1f}, "
        f"median: {scored_wgs.walk_score.median():.1f}"
    )
    print(f"  Transit     - mean: {scored_wgs.transit_score.mean():.1f}")
    print(f"  Bike        - mean: {scored_wgs.bike_score.mean():.1f}")

    return scored_wgs
