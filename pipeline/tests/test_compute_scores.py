import numpy as np

from pipeline.compute_scores import (
    compute_bike_score_for_cell,
    compute_transit_score_for_cell,
    compute_walk_score_for_cell,
    distance_decay,
    score_label,
)


def test_decay_zero_distance():
    assert distance_decay(0, max_dist=2400) == 1.0


def test_decay_max_distance():
    assert distance_decay(2400, max_dist=2400) == 0.0


def test_decay_beyond_max():
    assert distance_decay(3000, max_dist=2400) == 0.0


def test_decay_midpoint():
    val = distance_decay(1200, max_dist=2400)
    assert 0.0 < val < 1.0


def test_decay_near_is_higher():
    near = distance_decay(200, max_dist=2400)
    far = distance_decay(1500, max_dist=2400)
    assert near > far


def test_score_label_paradise():
    assert score_label(95, "walk") == "Walker's Paradise"
    assert score_label(92, "transit") == "Rider's Paradise"
    assert score_label(91, "bike") == "Biker's Paradise"


def test_score_label_low():
    assert score_label(10, "walk") == "Car-Dependent"


def test_walk_score_all_nearby():
    distances = {
        "grocery": [0.0],
        "restaurant": [0.0, 0.0, 0.0, 0.0, 0.0],
        "shopping": [0.0, 0.0, 0.0],
        "errands": [0.0],
        "parks": [0.0],
        "education": [0.0],
    }
    score = compute_walk_score_for_cell(distances)
    assert score >= 99.0


def test_walk_score_all_far():
    distances = {
        "grocery": [3000.0],
        "restaurant": [3000.0],
        "shopping": [3000.0],
        "errands": [3000.0],
        "parks": [3000.0],
        "education": [3000.0],
    }
    score = compute_walk_score_for_cell(distances)
    assert score == 0.0


def test_transit_score_metro_nearby():
    mode_distances = {"transit_metro": [100.0], "transit_tram": [], "transit_bus": []}
    density = 5
    score = compute_transit_score_for_cell(mode_distances, density)
    assert score >= 70.0


def test_transit_score_nothing():
    mode_distances = {"transit_metro": [], "transit_tram": [], "transit_bus": []}
    score = compute_transit_score_for_cell(mode_distances, 0)
    assert score == 0.0


def test_bike_score_components():
    score = compute_bike_score_for_cell(
        infra_meters=800.0,
        amenity_distances=[50.0, 100.0],
        intersection_density=15.0,
    )
    assert 0 <= score <= 100
    assert score > 50
