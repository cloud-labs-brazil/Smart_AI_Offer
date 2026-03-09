"""KPI aggregation service."""

from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import DailyAllocation, Offer
from app.schemas import KPIResponse


class KPIService:
    """Compute executive KPI metrics."""

    async def get_kpis(self, session: AsyncSession) -> KPIResponse:
        stmt = select(
            func.count(Offer.id),
            func.coalesce(func.sum(Offer.total_amount), 0.0),
            func.coalesce(func.avg(Offer.margin), 0.0),
        )
        total_offers, total_revenue, avg_margin = (await session.execute(stmt)).one()

        overloaded_stmt = select(func.count(DailyAllocation.id)).where(DailyAllocation.is_overloaded.is_(True))
        overloaded_count = int((await session.execute(overloaded_stmt)).scalar_one() or 0)

        return KPIResponse(
            total_offers=int(total_offers or 0),
            total_revenue=float(total_revenue or 0.0),
            avg_margin=float(avg_margin or 0.0),
            overloaded_count=overloaded_count,
        )

