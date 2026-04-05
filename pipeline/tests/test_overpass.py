import pytest

from pipeline.overpass import (
    area_selector_candidates,
    city_name_candidates,
    fetch_json,
    select_area_selector,
)


class DummyResponse:
    def __init__(self, status_code=200, payload=None, text=""):
        self.status_code = status_code
        self._payload = payload if payload is not None else {}
        self.text = text

    def json(self):
        if self.text and self._payload == {}:
            raise ValueError("invalid json")
        return self._payload


def test_city_name_candidates_include_transliteration():
    candidates = city_name_candidates("София")
    assert candidates[:2] == ["София", "Sofia"]


def test_area_selector_candidates_include_requested_and_fallback_levels():
    selectors = area_selector_candidates("София", admin_level=4)
    assert 'area["name"="Bulgaria"]["boundary"="administrative"]["admin_level"="2"]->.country;' in selectors[0]
    assert any('area["name"="София"]["admin_level"="4"](area.country)' in selector for selector in selectors)
    assert any('area["name"="София"]["admin_level"="8"](area.country)' in selector for selector in selectors)
    assert any('area["name"="Sofia"]["admin_level"="4"](area.country)' in selector for selector in selectors)
    assert any('area["name"="Sofia"]["admin_level"="8"](area.country)' in selector for selector in selectors)


def test_fetch_json_retries_temporary_failures(monkeypatch):
    responses = iter(
        [
            DummyResponse(status_code=504, text="gateway timeout"),
            DummyResponse(payload={"elements": [{"id": 1}]}),
        ]
    )

    monkeypatch.setattr(
        "pipeline.overpass.requests.get",
        lambda *args, **kwargs: next(responses),
    )

    data = fetch_json("query", urls=("https://one", "https://two"))
    assert data["elements"] == [{"id": 1}]


def test_select_area_selector_uses_candidate_with_probe_results(monkeypatch):
    responses = iter(
        [
            {"elements": []},
            {"elements": [{"id": 1}]},
        ]
    )

    monkeypatch.setattr(
        "pipeline.overpass.fetch_json",
        lambda *args, **kwargs: next(responses),
    )

    selector = select_area_selector("София", admin_level=4)
    assert selector == (
        'area["name"="Bulgaria"]["boundary"="administrative"]["admin_level"="2"]->.country;\n'
        'area["name"="София"]["admin_level"="8"](area.country)'
    )


def test_fetch_json_raises_clear_error_when_all_endpoints_fail(monkeypatch):
    monkeypatch.setattr(
        "pipeline.overpass.requests.get",
        lambda *args, **kwargs: DummyResponse(status_code=429, text="rate_limited"),
    )

    with pytest.raises(RuntimeError, match="temporary failure"):
        fetch_json("query", urls=("https://one",))


def test_fetch_json_skips_invalid_json_and_tries_next_endpoint(monkeypatch):
    responses = iter(
        [
            DummyResponse(status_code=200, text="<html>not json</html>"),
            DummyResponse(payload={"elements": [{"id": 2}]}),
        ]
    )

    monkeypatch.setattr(
        "pipeline.overpass.requests.get",
        lambda *args, **kwargs: next(responses),
    )

    data = fetch_json("query", urls=("https://one", "https://two"))
    assert data["elements"] == [{"id": 2}]
