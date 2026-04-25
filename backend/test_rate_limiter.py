import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).parent))

from app import main
from app.config import settings
from app.dependencies import _is_valid_session_format, check_rate_limit_for_session
from app.services.rate_limiter import RateLimiter


class FakeDB:
    def add(self, record):
        self.record = record

    def commit(self):
        pass

    def rollback(self):
        pass


def override_db():
    return FakeDB()


@pytest.fixture(autouse=True)
def reset_state(monkeypatch):
    monkeypatch.setattr(settings, "RATE_LIMIT_PER_HOUR", 3, raising=False)
    monkeypatch.setattr(settings, "RATE_LIMIT_PER_DAY", 3, raising=False)

    limiter = RateLimiter()
    monkeypatch.setattr("app.dependencies.rate_limiter", limiter)

    main.search_cache.clear()
    main.app.dependency_overrides[main.get_db] = override_db
    yield limiter
    main.search_cache.clear()
    main.app.dependency_overrides.clear()


def test_session_format_validation():
    assert _is_valid_session_format("8b8051f4-76fd-4657-83f6-1348036f4ff7")
    assert _is_valid_session_format("valid-session-123abc456")

    assert not _is_valid_session_format("short")
    assert not _is_valid_session_format("valid123")
    assert not _is_valid_session_format("a" * 200)
    assert not _is_valid_session_format("invalid@session!")


def test_rate_limiter_enforces_hourly_and_daily_limits(reset_state):
    session_id = "8b8051f4-76fd-4657-83f6-1348036f4ff7"

    first = check_rate_limit_for_session(session_id)
    second = check_rate_limit_for_session(session_id)
    third = check_rate_limit_for_session(session_id)

    assert first.remaining_hour == 2
    assert first.remaining_day == 2
    assert second.remaining_hour == 1
    assert second.remaining_day == 1
    assert third.remaining_hour == 0
    assert third.remaining_day == 0

    with pytest.raises(Exception) as exc:
        check_rate_limit_for_session(session_id)

    assert getattr(exc.value, "status_code", None) == 429


def test_cached_stream_response_does_not_consume_rate_limit(reset_state):
    session_id = "8b8051f4-76fd-4657-83f6-1348036f4ff7"
    query = "cached recommendation"
    main.search_cache[f"{query}_all"] = [{"id": 1, "title": "Cached Movie"}]

    client = TestClient(main.app)
    response = client.get(
        f"/api/movies/search/stream?query={query}",
        cookies={"session_id": session_id},
    )

    assert response.status_code == 200
    assert response.headers["X-RateLimit-Remaining-Hour"] == "3"
    assert response.headers["X-RateLimit-Remaining-Day"] == "3"
    assert "Cached Movie" in response.text
    assert '"type": "rate_limit"' in response.text
    assert '"status": "ok"' in response.text
    assert '"hourRemaining": 3' in response.text
    assert '"quotaConsumed": false' in response.text

    current = reset_state.get_current_limits(session_id)
    assert current.remaining_hour == 3
    assert current.remaining_day == 3


def test_uncached_stream_response_consumes_rate_limit_before_openai(monkeypatch, reset_state):
    session_id = "8b8051f4-76fd-4657-83f6-1348036f4ff7"

    def fail_openai(*args, **kwargs):
        raise AssertionError("OpenAI should not be reached once rate limited")

    monkeypatch.setattr(main, "query_openai_for_movies", fail_openai)
    check_rate_limit_for_session(session_id)
    check_rate_limit_for_session(session_id)
    check_rate_limit_for_session(session_id)

    client = TestClient(main.app)
    response = client.get(
        "/api/movies/search/stream?query=uncached",
        cookies={"session_id": session_id},
    )

    assert response.status_code == 200
    assert response.headers["X-RateLimit-Remaining-Hour"] == "0"
    assert '"type": "error"' in response.text
    assert '"status": "exceeded"' in response.text
    assert '"limit_type": "per_hour"' in response.text
    assert "You have exceeded your hourly search limit" in response.text
    assert '"hourRemaining": 0' in response.text


def test_section_stream_response_does_not_consume_rate_limit(monkeypatch, reset_state):
    session_id = "8b8051f4-76fd-4657-83f6-1348036f4ff7"

    def fake_openai(*args, **kwargs):
        return [main.MovieListItem(title="Section Movie", year=2024)]

    async def fake_fetch_details(movie_item, content_filter=None, index=0, client=None):
        return index, {"id": 10, "title": movie_item.title}

    monkeypatch.setattr(main, "query_openai_for_movies", fake_openai)
    monkeypatch.setattr(main, "fetch_movie_details", fake_fetch_details)

    client = TestClient(main.app)
    response = client.get(
        "/api/movies/sections/stream?query=homepage-section",
        cookies={"session_id": session_id},
    )

    assert response.status_code == 200
    assert '"Section Movie"' in response.text
    assert '"quotaConsumed": false' in response.text

    current = reset_state.get_current_limits(session_id)
    assert current.remaining_hour == 3
    assert current.remaining_day == 3


def test_rate_limit_payload_warns_when_close_to_hourly_limit(reset_state):
    session_id = "8b8051f4-76fd-4657-83f6-1348036f4ff7"

    first = check_rate_limit_for_session(session_id)
    second = check_rate_limit_for_session(session_id)

    first_payload = main.serialize_rate_limit(first, quota_consumed=True)
    second_payload = main.serialize_rate_limit(second, quota_consumed=True)

    assert first_payload["status"] == "ok"
    assert second_payload["status"] == "warning"
    assert second_payload["limitType"] == "per_hour"
    assert second_payload["quotaConsumed"] is True
    assert "You're close to your hourly search limit" in second_payload["message"]


def test_cached_rate_limit_payload_does_not_warn(reset_state):
    session_id = "8b8051f4-76fd-4657-83f6-1348036f4ff7"

    check_rate_limit_for_session(session_id)
    info = check_rate_limit_for_session(session_id)
    payload = main.serialize_rate_limit(
        info,
        quota_consumed=False,
    )

    assert payload["status"] == "ok"
    assert payload["message"] is None
    assert payload["quotaConsumed"] is False
