"""Full pipeline orchestrator: fetch -> compute -> tiles -> upload."""

import argparse
from pathlib import Path

from pipeline.compute_scores import run_scoring
from pipeline.fetch_amenities import fetch_city
from pipeline.fetch_bike_infra import fetch_bike_infra
from pipeline.generate_tiles import generate_pmtiles
from pipeline.upload_supabase import update_city_stats, upload_amenities, upload_cells


def run_pipeline(
    city_name: str = "София",
    city_slug: str = "sofia",
    admin_level: int = 4,
    cell_size: int = 100,
    skip_fetch: bool = False,
    skip_upload: bool = False,
) -> None:
    """Run the full WalkScore.bg data pipeline for a city."""
    data_dir = Path("data")
    amenities_path = data_dir / f"{city_slug}_amenities.geojson"
    bike_infra_path = data_dir / f"{city_slug}_bike_infra.geojson"
    scores_path = data_dir / f"{city_slug}_scores.geojson"
    tiles_path = Path(f"public/tiles/{city_slug}.pmtiles")

    if not skip_fetch:
        print("=" * 60)
        print("STEP 1: Fetching amenities from OSM")
        print("=" * 60)
        fetch_city(city_name, admin_level, output_path=amenities_path)

        print("\nSTEP 1b: Fetching bike infrastructure")
        fetch_bike_infra(city_name, admin_level, output_path=bike_infra_path)
    else:
        print("Skipping fetch (using existing data)")

    print("\n" + "=" * 60)
    print("STEP 2: Computing scores")
    print("=" * 60)
    run_scoring(
        str(amenities_path),
        str(bike_infra_path),
        str(scores_path),
        cell_size=cell_size,
    )

    print("\n" + "=" * 60)
    print("STEP 3: Generating PMTiles")
    print("=" * 60)
    generate_pmtiles(str(scores_path), str(tiles_path))

    if not skip_upload:
        print("\n" + "=" * 60)
        print("STEP 4: Uploading to Supabase")
        print("=" * 60)
        upload_cells(str(scores_path), city_slug)
        upload_amenities(str(amenities_path), city_slug)
        update_city_stats(city_slug)
    else:
        print("Skipping Supabase upload")

    print("\n" + "=" * 60)
    print("PIPELINE COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="WalkScore.bg Data Pipeline")
    parser.add_argument("--city", default="София", help="City name in OSM")
    parser.add_argument("--slug", default="sofia", help="City URL slug")
    parser.add_argument("--admin-level", type=int, default=4)
    parser.add_argument("--cell-size", type=int, default=100)
    parser.add_argument("--skip-fetch", action="store_true")
    parser.add_argument("--skip-upload", action="store_true")
    args = parser.parse_args()

    run_pipeline(
        city_name=args.city,
        city_slug=args.slug,
        admin_level=args.admin_level,
        cell_size=args.cell_size,
        skip_fetch=args.skip_fetch,
        skip_upload=args.skip_upload,
    )
