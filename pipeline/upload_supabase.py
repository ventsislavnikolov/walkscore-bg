"""Upload computed scores and amenities to Supabase PostGIS."""

import os

import geopandas as gpd
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()


def get_supabase():
    """Create a Supabase client from environment variables."""
    url = os.environ["SUPABASE_URL"].strip()
    key = os.environ["SUPABASE_SERVICE_KEY"].strip()
    return create_client(url, key)


def upload_cells(scores_path: str, city: str = "sofia", batch_size: int = 500) -> None:
    """Upload score grid cells to ws_cells via RPC."""
    supabase = get_supabase()
    gdf = gpd.read_file(scores_path)

    print(f"Uploading {len(gdf)} cells for {city}...")
    supabase.table("ws_cells").delete().eq("city", city).execute()

    rows = []
    uploaded = 0

    for _, row in gdf.iterrows():
        center = row.geometry.centroid
        rows.append(
            {
                "city": city,
                "geom": row.geometry.wkt,
                "center": center.wkt,
                "walk_score": float(row.walk_score),
                "transit_score": float(row.transit_score),
                "bike_score": float(row.bike_score),
                "walk_label": row.walk_label,
                "transit_label": row.transit_label,
                "bike_label": row.bike_label,
                "grocery": float(row.get("grocery", 0)),
                "restaurant": float(row.get("restaurant", 0)),
                "shopping": float(row.get("shopping", 0)),
                "errands": float(row.get("errands", 0)),
                "parks": float(row.get("parks", 0)),
                "education": float(row.get("education", 0)),
            }
        )

        if len(rows) >= batch_size:
            supabase.rpc("insert_cells_wkt", {"cells": rows}).execute()
            uploaded += len(rows)
            print(f"  Uploaded {uploaded}/{len(gdf)} cells...")
            rows = []

    if rows:
        supabase.rpc("insert_cells_wkt", {"cells": rows}).execute()
        uploaded += len(rows)

    print(f"  Done: {uploaded} cells uploaded.")


def upload_amenities(amenities_path: str, city: str = "sofia", batch_size: int = 500) -> None:
    """Upload amenities to ws_amenities via RPC."""
    supabase = get_supabase()
    gdf = gpd.read_file(amenities_path)

    print(f"Uploading {len(gdf)} amenities for {city}...")
    supabase.table("ws_amenities").delete().eq("city", city).execute()

    rows = []
    uploaded = 0

    for _, row in gdf.iterrows():
        rows.append(
            {
                "city": city,
                "osm_id": int(row.osm_id),
                "category": row.category,
                "name": row.get("name", ""),
                "name_bg": row.get("name_bg", ""),
                "geom": row.geometry.wkt,
            }
        )

        if len(rows) >= batch_size:
            supabase.rpc("insert_amenities_wkt", {"amenities": rows}).execute()
            uploaded += len(rows)
            print(f"  Uploaded {uploaded}/{len(gdf)} amenities...")
            rows = []

    if rows:
        supabase.rpc("insert_amenities_wkt", {"amenities": rows}).execute()
        uploaded += len(rows)

    print(f"  Done: {uploaded} amenities uploaded.")


def update_city_stats(city: str = "sofia") -> None:
    """Update average city-level scores from ws_cells."""
    supabase = get_supabase()
    result = supabase.rpc("get_city_averages", {"p_city": city}).execute()

    if not result.data:
        print(f"  No city averages returned for {city}.")
        return

    stats = result.data[0]
    supabase.table("ws_cities").update(
        {
            "avg_walk_score": stats["avg_walk"],
            "avg_transit_score": stats["avg_transit"],
            "avg_bike_score": stats["avg_bike"],
        }
    ).eq("slug", city).execute()

    print(
        "  City averages updated: "
        f"walk={stats['avg_walk']:.1f}, "
        f"transit={stats['avg_transit']:.1f}, "
        f"bike={stats['avg_bike']:.1f}"
    )
