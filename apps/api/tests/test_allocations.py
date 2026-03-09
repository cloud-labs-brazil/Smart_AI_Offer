import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_allocations_owner_participant_and_overload(
    client: AsyncClient,
    loaded_data: dict,
) -> None:
    assert loaded_data["ingested_count"] == 3

    response = await client.get(
        "/allocations",
        params={
            "architect": "Bob Roe",
            "start_date": "2026-01-01",
            "end_date": "2026-01-01",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 1
    item = payload["items"][0]
    assert item["architect_name"] == "Bob Roe"
    assert item["is_overloaded"] is True
    assert item["total_allocation"] == pytest.approx(2.1)

    weights_by_role = sorted((detail["role"], detail["weight"]) for detail in item["allocations"])
    assert ("OWNER", 1.0) in weights_by_role
    assert ("PARTICIPANT", 0.1) in weights_by_role
