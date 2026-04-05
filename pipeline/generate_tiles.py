"""Convert GeoJSON scores to PMTiles via tippecanoe."""

from pathlib import Path
import shutil
import subprocess


def generate_pmtiles(
    geojson_path: str,
    output_path: str,
    min_zoom: int = 10,
    max_zoom: int = 14,
) -> None:
    """Generate PMTiles from GeoJSON using tippecanoe."""
    if not shutil.which("tippecanoe"):
        raise RuntimeError("tippecanoe not found. Install it with `brew install tippecanoe`.")

    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.unlink(missing_ok=True)

    cmd = [
        "tippecanoe",
        "-o",
        str(output),
        f"-z{max_zoom}",
        f"-Z{min_zoom}",
        "--drop-densest-as-needed",
        "--extend-zooms-if-still-dropping",
        "--force",
        geojson_path,
    ]

    print(f"Generating PMTiles: {geojson_path} -> {output}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"tippecanoe failed: {result.stderr.strip()}")

    size_mb = output.stat().st_size / (1024 * 1024)
    print(f"  Output: {output} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    generate_pmtiles("data/sofia_scores.geojson", "public/tiles/sofia.pmtiles")
