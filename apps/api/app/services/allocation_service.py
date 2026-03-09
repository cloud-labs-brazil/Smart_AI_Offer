"""Allocation calculation service."""

from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime, timedelta
from typing import Any

from sqlalchemy import and_, delete, func, insert, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.models import AllocationDetail, AllocationRole, DailyAllocation, Offer, OfferParticipant
from app.schemas import AllocationRead, AllocationSummary


class AllocationService:
    """Compute and query daily architect allocations."""

    def __init__(self, participant_weight: float | None = None) -> None:
        self._participant_weight = participant_weight or settings.participant_weight

    async def recompute_daily_allocations(self, session: AsyncSession) -> int:
        """Rebuild allocation tables from current offers and participants."""

        offers = (
            await session.scalars(
                select(Offer).options(selectinload(Offer.participants)).order_by(Offer.id.asc())
            )
        ).all()

        daily_map: dict[tuple[str, date], dict[str, Any]] = defaultdict(
            lambda: {"total_allocation": 0.0, "details": []}
        )

        for offer in offers:
            start = (offer.start_date or offer.created_at).date()
            end = (offer.end_date or offer.start_date or offer.created_at).date()
            if end < start:
                end = start

            current = start
            while current <= end:
                owner_key = (offer.owner, current)
                daily_map[owner_key]["total_allocation"] += 1.0
                daily_map[owner_key]["details"].append(
                    {"offer_id": offer.id, "role": AllocationRole.OWNER.value, "weight": 1.0}
                )

                for participant in offer.participants:
                    participant_key = (participant.architect_name, current)
                    daily_map[participant_key]["total_allocation"] += self._participant_weight
                    daily_map[participant_key]["details"].append(
                        {
                            "offer_id": offer.id,
                            "role": AllocationRole.PARTICIPANT.value,
                            "weight": self._participant_weight,
                        }
                    )

                current += timedelta(days=1)

        await session.execute(delete(AllocationDetail))
        await session.execute(delete(DailyAllocation))

        if not daily_map:
            return 0

        ordered_keys = list(daily_map.keys())
        daily_rows = []
        for architect_name, day in ordered_keys:
            total = float(daily_map[(architect_name, day)]["total_allocation"])
            daily_rows.append(
                {
                    "architect_name": architect_name,
                    "date": day,
                    "total_allocation": total,
                    "is_overloaded": total > 1.0,
                }
            )

        result = await session.execute(insert(DailyAllocation).returning(DailyAllocation.id), daily_rows)
        allocation_ids = [row[0] for row in result.all()]

        detail_rows = []
        for allocation_id, key in zip(allocation_ids, ordered_keys):
            for detail in daily_map[key]["details"]:
                detail_rows.append({"allocation_id": allocation_id, **detail})

        if detail_rows:
            await session.execute(insert(AllocationDetail), detail_rows)

        return len(daily_rows)

    async def list_allocations(
        self,
        session: AsyncSession,
        architect: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> AllocationSummary:
        """Return daily allocations with optional filters."""

        filters = []
        if architect:
            filters.append(DailyAllocation.architect_name == architect)
        if start_date:
            filters.append(DailyAllocation.date >= start_date)
        if end_date:
            filters.append(DailyAllocation.date <= end_date)

        count_stmt = select(func.count(DailyAllocation.id))
        overloaded_stmt = select(func.count(DailyAllocation.id)).where(DailyAllocation.is_overloaded.is_(True))
        if filters:
            count_stmt = count_stmt.where(and_(*filters))
            overloaded_stmt = overloaded_stmt.where(and_(*filters))

        total = int((await session.execute(count_stmt)).scalar_one() or 0)
        overloaded_count = int((await session.execute(overloaded_stmt)).scalar_one() or 0)

        stmt = (
            select(DailyAllocation)
            .options(selectinload(DailyAllocation.details))
            .order_by(DailyAllocation.date.asc(), DailyAllocation.architect_name.asc())
        )
        if filters:
            stmt = stmt.where(and_(*filters))

        rows = (await session.scalars(stmt)).all()
        items = [
            AllocationRead(
                architect_name=row.architect_name,
                date=row.date,
                total_allocation=row.total_allocation,
                is_overloaded=row.is_overloaded,
                allocations=[
                    {
                        "offer_id": detail.offer_id,
                        "role": detail.role.value,
                        "weight": detail.weight,
                    }
                    for detail in row.details
                ],
            )
            for row in rows
        ]
        return AllocationSummary(items=items, total=total, overloaded_count=overloaded_count)

