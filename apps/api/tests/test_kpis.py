import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_kpi_aggregation_returns_expected_totals(
    client: AsyncClient,
    loaded_data: dict,
) -> None:
    assert loaded_data["ingested_count"] == 3

    response = await client.get("/kpis")

    assert response.status_code == 200
    payload = response.json()
    assert payload["total_offers"] == 3
    assert payload["total_revenue"] == pytest.approx(6000.0)
    assert payload["avg_margin"] == pytest.approx(20.0)
    assert payload["overloaded_count"] >= 2
