import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_explainability_returns_metric_trace(
    client: AsyncClient,
    loaded_data: dict,
) -> None:
    assert loaded_data["ingested_count"] == 3

    response = await client.get(
        "/metrics/explainability",
        params={
            "metric_id": "total_revenue",
            "sample_size": 2,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert len(payload["items"]) == 1
    item = payload["items"][0]
    assert item["metric_id"] == "total_revenue"
    assert item["computed_value"] == pytest.approx(6000.0)
    assert item["total_source_records"] == 3
    assert len(item["sampled_records"]) == 2
    assert item["sampled_records"][0]["source_type"] == "offer"
    assert "total_amount" in item["sampled_records"][0]["fields"]


@pytest.mark.asyncio
async def test_explainability_accepts_dictionary_aliases(
    client: AsyncClient,
    loaded_data: dict,
) -> None:
    assert loaded_data["ingested_count"] == 3

    response = await client.get(
        "/metrics/explainability",
        params={"metric_id": "average_margin"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["items"][0]["metric_id"] == "avg_margin"
    assert payload["items"][0]["computed_value"] == pytest.approx(20.0)


@pytest.mark.asyncio
async def test_explainability_default_returns_all_kpi_traces(
    client: AsyncClient,
    loaded_data: dict,
) -> None:
    assert loaded_data["ingested_count"] == 3

    response = await client.get(
        "/metrics/explainability",
        params={"sample_size": 1},
    )

    assert response.status_code == 200
    payload = response.json()
    metric_ids = {item["metric_id"] for item in payload["items"]}
    assert metric_ids == {"total_offers", "total_revenue", "avg_margin", "overloaded_count"}
    for item in payload["items"]:
        assert item["total_source_records"] >= 0
        assert len(item["sampled_records"]) <= 1


@pytest.mark.asyncio
async def test_explainability_rejects_unknown_metric(
    client: AsyncClient,
) -> None:
    response = await client.get(
        "/metrics/explainability",
        params={"metric_id": "does_not_exist"},
    )

    assert response.status_code == 400
    assert "Unsupported metric_id" in response.json()["detail"]
