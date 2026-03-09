from __future__ import annotations

import csv
import io

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session, get_db
from app.main import app
from app.models import AllocationDetail, DailyAllocation, Offer, OfferParticipant


async def _truncate_all(session: AsyncSession) -> None:
    await session.execute(delete(AllocationDetail))
    await session.execute(delete(DailyAllocation))
    await session.execute(delete(OfferParticipant))
    await session.execute(delete(Offer))
    await session.commit()


@pytest_asyncio.fixture
async def db_session() -> AsyncSession:
    async with async_session() as session:
        await _truncate_all(session)
        yield session
        await _truncate_all(session)


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncClient:
    async def override_get_db():
        try:
            yield db_session
            await db_session.commit()
        except Exception:
            await db_session.rollback()
            raise

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
        yield async_client
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def sample_csv_bytes() -> bytes:
    header = [
        "Issue key",
        "Issue id",
        "Assignee",
        "Status",
        "Summary",
        "Custom field (Type of Service)",
        "Component/s",
        "Custom field (Offering Type)",
        "Priority",
        "Custom field (Total amount (€) weighted)",
        "Custom field (Type Business Opportunity)",
        "Custom field (Country)",
        "Custom field (Market)",
        "Custom field (Market Manager)",
        "Custom field (DN Manager)",
        "Custom field (Operations Manager)",
        "Custom field (Renewal)",
        "Custom field (Código GEP)",
        "Custom field (Temporal Scope)",
        "Custom field (Receipt of application)",
        "Custom field (Delivery Commitment)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Total Amount (euros))",
        "Custom field (Budg.Loc.Currency)",
        "Custom field (Margin)",
        "Custom field (Offer Code (NG))",
        "Custom field (Offer Description (NG))",
        "Custom field (Transversal offer)",
        "Updated",
        "Created",
        "Custom field (Proposal Due Date)",
        "Custom field (Observations)",
        "Resolved",
        "Custom field (Cloud – Amount Infrastructure €)",
        "Custom field (Cloud – Amount Services €)",
        "Custom field (Type of Cloud Service)",
        "Custom field (Cloud Provider)",
        "Custom field (Others Cloud Providers)",
    ]

    def build_row(
        issue_key: str,
        issue_id: int,
        owner: str,
        participants: list[str],
        total_amount: float,
        margin: float,
    ) -> list[str]:
        row = [""] * 52
        row[0] = issue_key
        row[1] = str(issue_id)
        row[2] = owner
        row[3] = "In Progress"
        row[4] = f"Summary {issue_key}"
        row[5] = "Service"
        row[6] = "Practice A"
        row[7] = "Offering"
        row[8] = "High"
        row[9] = str(total_amount)
        row[10] = "Proposal"
        row[11] = "Brazil"
        row[12] = "ICT"
        row[13] = "Manager One"
        row[14] = "DN Manager"
        row[15] = "Ops Manager"
        row[16] = "No"
        row[17] = "GEP-1"
        row[18] = "1.0"
        row[19] = "01/01/26 08:00"
        row[20] = "01/01/26 18:00"
        for idx, participant in enumerate(participants[:15]):
            row[21 + idx] = participant
        row[36] = str(total_amount)
        row[37] = str(total_amount * 5)
        row[38] = str(margin)
        row[41] = "No"
        row[42] = "01/01/26 10:00"
        row[43] = "01/01/26 07:00"
        row[44] = "05/01/26 10:00"
        row[45] = "obs"
        return row

    rows = [
        build_row("OFBRA-1", 1, "Alice Doe", ["Bob Roe"], 1000.0, 10.0),
        build_row("OFBRA-2", 2, "Bob Roe", ["Alice Doe"], 2000.0, 20.0),
        build_row("OFBRA-3", 3, "Bob Roe", [], 3000.0, 30.0),
    ]

    output = io.StringIO(newline="")
    writer = csv.writer(output)
    writer.writerow(header)
    writer.writerows(rows)
    return output.getvalue().encode("utf-8")


@pytest_asyncio.fixture
async def loaded_data(client: AsyncClient, sample_csv_bytes: bytes) -> dict:
    response = await client.post(
        "/upload",
        files={"file": ("sample.csv", sample_csv_bytes, "text/csv")},
    )
    assert response.status_code == 200
    return response.json()

