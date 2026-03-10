from __future__ import annotations

from typing import Any

import pytest
from httpx import AsyncClient

from app.core import database as db_module
from app.services import chat_service


@pytest.mark.asyncio
async def test_metric_dictionary_route_filters_and_lookup(client: AsyncClient) -> None:
    response = await client.get("/metrics/dictionary")
    assert response.status_code == 200
    payload = response.json()
    assert payload["count"] > 0

    tab_response = await client.get("/metrics/dictionary", params={"tab": "Financial Exposure"})
    assert tab_response.status_code == 200
    tab_payload = tab_response.json()
    assert tab_payload["count"] > 0
    for metric in tab_payload["metrics"]:
        assert "Financial Exposure" in metric["dashboard_tabs"]

    metric_response = await client.get("/metrics/dictionary", params={"metric_id": "hhi_index"})
    assert metric_response.status_code == 200
    metric_payload = metric_response.json()
    assert metric_payload["count"] == 1
    assert metric_payload["metrics"][0]["id"] == "hhi_index"

    missing_metric = await client.get("/metrics/dictionary", params={"metric_id": "missing_metric"})
    assert missing_metric.status_code == 404


@pytest.mark.asyncio
async def test_chat_route_returns_configuration_warning_without_api_key(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(chat_service.settings, "gemini_api_key", "")

    response = await client.post(
        "/chat",
        json={
            "message": "How do I read HHI?",
            "history": [],
            "active_tab": "Financial Exposure",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert "Gemini API key not configured" in payload["reply"]
    assert payload["sources"] == ["Configuration required"]


class _FakeResponse:
    def __init__(self, status_code: int, payload: dict[str, Any], text: str = "") -> None:
        self.status_code = status_code
        self._payload = payload
        self.text = text

    def json(self) -> dict[str, Any]:
        return self._payload


class _FakeAsyncClient:
    def __init__(self, behavior: Any, timeout: float) -> None:
        self.behavior = behavior
        self.timeout = timeout

    async def __aenter__(self) -> "_FakeAsyncClient":
        return self

    async def __aexit__(self, exc_type, exc, tb) -> bool:
        return False

    async def post(self, *_args, **_kwargs):
        if isinstance(self.behavior, Exception):
            raise self.behavior
        return self.behavior


def _patch_httpx_client(monkeypatch: pytest.MonkeyPatch, behavior: Any) -> None:
    def _factory(timeout: float = 30.0) -> _FakeAsyncClient:
        return _FakeAsyncClient(behavior=behavior, timeout=timeout)

    monkeypatch.setattr(chat_service.httpx, "AsyncClient", _factory)


@pytest.mark.asyncio
async def test_chat_service_build_system_prompt_filters_metrics() -> None:
    prompt = chat_service._build_system_prompt("Financial Exposure")
    assert "HHI" in prompt
    assert "Active Practices" not in prompt


@pytest.mark.asyncio
async def test_chat_service_handles_non_200_response(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(chat_service.settings, "gemini_api_key", "test-key")
    _patch_httpx_client(monkeypatch, _FakeResponse(status_code=500, payload={}, text="server error"))

    result = await chat_service.chat_with_gemini(chat_service.ChatRequest(message="hello"))
    assert "HTTP 500" in result.reply


@pytest.mark.asyncio
async def test_chat_service_handles_empty_candidates(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(chat_service.settings, "gemini_api_key", "test-key")
    _patch_httpx_client(monkeypatch, _FakeResponse(status_code=200, payload={"candidates": []}))

    result = await chat_service.chat_with_gemini(chat_service.ChatRequest(message="hello"))
    assert "couldn't generate a response" in result.reply.lower()


@pytest.mark.asyncio
async def test_chat_service_returns_sources_on_success(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(chat_service.settings, "gemini_api_key", "test-key")
    _patch_httpx_client(
        monkeypatch,
        _FakeResponse(
            status_code=200,
            payload={
                "candidates": [
                    {"content": {"parts": [{"text": "The HHI (Herfindahl-Hirschman Index) is high."}]}}
                ]
            },
        ),
    )

    result = await chat_service.chat_with_gemini(chat_service.ChatRequest(message="What about HHI?"))
    assert "HHI" in result.reply
    assert len(result.sources) >= 1


@pytest.mark.asyncio
async def test_chat_service_handles_timeout(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(chat_service.settings, "gemini_api_key", "test-key")
    _patch_httpx_client(monkeypatch, chat_service.httpx.TimeoutException("timeout"))

    result = await chat_service.chat_with_gemini(chat_service.ChatRequest(message="timeout test"))
    assert "timed out" in result.reply.lower()


@pytest.mark.asyncio
async def test_chat_service_handles_unexpected_exception(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(chat_service.settings, "gemini_api_key", "test-key")
    _patch_httpx_client(monkeypatch, RuntimeError("boom"))

    result = await chat_service.chat_with_gemini(chat_service.ChatRequest(message="boom"))
    assert "unexpected error" in result.reply.lower()


class _FakeSession:
    def __init__(self) -> None:
        self.commit_called = False
        self.rollback_called = False

    async def commit(self) -> None:
        self.commit_called = True

    async def rollback(self) -> None:
        self.rollback_called = True


class _FakeSessionFactory:
    def __init__(self, session: _FakeSession) -> None:
        self.session = session

    def __call__(self):
        return self

    async def __aenter__(self) -> _FakeSession:
        return self.session

    async def __aexit__(self, exc_type, exc, tb) -> bool:
        return False


@pytest.mark.asyncio
async def test_get_db_commits_on_success(monkeypatch: pytest.MonkeyPatch) -> None:
    session = _FakeSession()
    monkeypatch.setattr(db_module, "async_session", _FakeSessionFactory(session))

    gen = db_module.get_db()
    yielded = await gen.__anext__()
    assert yielded is session
    with pytest.raises(StopAsyncIteration):
        await gen.__anext__()
    assert session.commit_called is True
    assert session.rollback_called is False


@pytest.mark.asyncio
async def test_get_db_rolls_back_on_exception(monkeypatch: pytest.MonkeyPatch) -> None:
    session = _FakeSession()
    monkeypatch.setattr(db_module, "async_session", _FakeSessionFactory(session))

    gen = db_module.get_db()
    await gen.__anext__()
    with pytest.raises(RuntimeError):
        await gen.athrow(RuntimeError("boom"))

    assert session.rollback_called is True
