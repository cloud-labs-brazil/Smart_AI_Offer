import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_upload_parses_csv_and_lists_offers(
    client: AsyncClient,
    sample_csv_bytes: bytes,
) -> None:
    upload_response = await client.post(
        "/upload",
        files={"file": ("sample.csv", sample_csv_bytes, "text/csv")},
    )

    assert upload_response.status_code == 200
    payload = upload_response.json()
    assert payload["ingested_count"] == 3
    assert payload["error_count"] == 0

    offers_response = await client.get("/offers?page=1&page_size=10")
    assert offers_response.status_code == 200
    offers_payload = offers_response.json()
    assert offers_payload["total"] == 3
    assert len(offers_payload["items"]) == 3
    assert offers_payload["items"][0]["id"].startswith("OFBRA-")
