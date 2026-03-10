"""Explainability service for KPI/source-record traceability."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import DailyAllocation, Offer
from app.schemas import ExplainabilityItem, ExplainabilityResponse, ExplainabilitySourceRecord


class ExplainabilityService:
    """Build metric explainability payloads from persisted source records."""

    _metric_aliases: dict[str, str] = {
        # API KPI IDs
        "total_offers": "total_offers",
        "total_revenue": "total_revenue",
        "avg_margin": "avg_margin",
        "overloaded_count": "overloaded_count",
        # Metric dictionary aliases
        "pipeline_total_revenue": "total_revenue",
        "average_margin": "avg_margin",
        "overload_days": "overloaded_count",
    }

    _metric_meta: dict[str, tuple[str, str]] = {
        "total_offers": ("Total Offers", "COUNT(Offer.id)"),
        "total_revenue": ("Total Revenue", "SUM(Offer.total_amount)"),
        "avg_margin": ("Average Margin", "AVG(Offer.margin)"),
        "overloaded_count": ("Overloaded Count", "COUNT(DailyAllocation WHERE is_overloaded=true)"),
    }

    async def get_explainability(
        self,
        session: AsyncSession,
        metric_id: str | None = None,
        sample_size: int = 25,
    ) -> ExplainabilityResponse:
        """Return explainability traces for one metric or the KPI bundle."""

        metric_keys = self._resolve_metric_ids(metric_id)
        items: list[ExplainabilityItem] = []

        for key in metric_keys:
            if key == "total_offers":
                items.append(await self._build_total_offers_trace(session, sample_size))
            elif key == "total_revenue":
                items.append(await self._build_total_revenue_trace(session, sample_size))
            elif key == "avg_margin":
                items.append(await self._build_avg_margin_trace(session, sample_size))
            elif key == "overloaded_count":
                items.append(await self._build_overloaded_count_trace(session, sample_size))

        return ExplainabilityResponse(
            generated_at=datetime.now(timezone.utc),
            items=items,
        )

    def _resolve_metric_ids(self, metric_id: str | None) -> list[str]:
        if metric_id is None:
            return ["total_offers", "total_revenue", "avg_margin", "overloaded_count"]

        canonical = self._metric_aliases.get(metric_id)
        if canonical is None:
            supported = ", ".join(sorted(self._metric_aliases.keys()))
            raise ValueError(f"Unsupported metric_id '{metric_id}'. Supported values: {supported}")
        return [canonical]

    async def _build_total_offers_trace(self, session: AsyncSession, sample_size: int) -> ExplainabilityItem:
        total = int((await session.execute(select(func.count(Offer.id)))).scalar_one() or 0)
        rows = (
            await session.execute(
                select(Offer.id, Offer.owner, Offer.status, Offer.total_amount, Offer.created_at)
                .order_by(Offer.created_at.desc())
                .limit(sample_size)
            )
        ).all()

        records = [
            ExplainabilitySourceRecord(
                source_id=row.id,
                source_type="offer",
                fields={
                    "owner": row.owner,
                    "status": row.status,
                    "total_amount": float(row.total_amount or 0.0),
                    "created_at": row.created_at.isoformat(),
                },
                contribution=1.0,
            )
            for row in rows
        ]
        label, formula = self._metric_meta["total_offers"]
        return ExplainabilityItem(
            metric_id="total_offers",
            metric_label=label,
            formula=formula,
            computed_value=float(total),
            total_source_records=total,
            sampled_records=records,
        )

    async def _build_total_revenue_trace(self, session: AsyncSession, sample_size: int) -> ExplainabilityItem:
        total_revenue = float(
            (await session.execute(select(func.coalesce(func.sum(Offer.total_amount), 0.0)))).scalar_one() or 0.0
        )
        total_records = int((await session.execute(select(func.count(Offer.id)))).scalar_one() or 0)
        rows = (
            await session.execute(
                select(Offer.id, Offer.owner, Offer.status, Offer.total_amount)
                .order_by(Offer.total_amount.desc())
                .limit(sample_size)
            )
        ).all()

        records = [
            ExplainabilitySourceRecord(
                source_id=row.id,
                source_type="offer",
                fields={
                    "owner": row.owner,
                    "status": row.status,
                    "total_amount": float(row.total_amount or 0.0),
                },
                contribution=float(row.total_amount or 0.0),
            )
            for row in rows
        ]
        label, formula = self._metric_meta["total_revenue"]
        return ExplainabilityItem(
            metric_id="total_revenue",
            metric_label=label,
            formula=formula,
            computed_value=total_revenue,
            total_source_records=total_records,
            sampled_records=records,
        )

    async def _build_avg_margin_trace(self, session: AsyncSession, sample_size: int) -> ExplainabilityItem:
        avg_margin = float(
            (await session.execute(select(func.coalesce(func.avg(Offer.margin), 0.0)))).scalar_one() or 0.0
        )
        total_records = int(
            (await session.execute(select(func.count(Offer.id)).where(Offer.margin.is_not(None)))).scalar_one() or 0
        )
        rows = (
            await session.execute(
                select(Offer.id, Offer.owner, Offer.status, Offer.margin)
                .where(Offer.margin.is_not(None))
                .order_by(Offer.margin.asc())
                .limit(sample_size)
            )
        ).all()

        records = [
            ExplainabilitySourceRecord(
                source_id=row.id,
                source_type="offer",
                fields={
                    "owner": row.owner,
                    "status": row.status,
                    "margin": float(row.margin or 0.0),
                },
                contribution=float(row.margin or 0.0),
            )
            for row in rows
        ]
        label, formula = self._metric_meta["avg_margin"]
        return ExplainabilityItem(
            metric_id="avg_margin",
            metric_label=label,
            formula=formula,
            computed_value=avg_margin,
            total_source_records=total_records,
            sampled_records=records,
        )

    async def _build_overloaded_count_trace(self, session: AsyncSession, sample_size: int) -> ExplainabilityItem:
        total = int(
            (
                await session.execute(
                    select(func.count(DailyAllocation.id)).where(DailyAllocation.is_overloaded.is_(True))
                )
            ).scalar_one()
            or 0
        )
        rows = (
            await session.execute(
                select(
                    DailyAllocation.id,
                    DailyAllocation.architect_name,
                    DailyAllocation.date,
                    DailyAllocation.total_allocation,
                )
                .where(DailyAllocation.is_overloaded.is_(True))
                .order_by(DailyAllocation.total_allocation.desc(), DailyAllocation.date.desc())
                .limit(sample_size)
            )
        ).all()

        records = [
            ExplainabilitySourceRecord(
                source_id=str(row.id),
                source_type="daily_allocation",
                fields={
                    "architect_name": row.architect_name,
                    "date": row.date.isoformat(),
                    "total_allocation": float(row.total_allocation),
                    "is_overloaded": True,
                },
                contribution=float(row.total_allocation),
            )
            for row in rows
        ]
        label, formula = self._metric_meta["overloaded_count"]
        return ExplainabilityItem(
            metric_id="overloaded_count",
            metric_label=label,
            formula=formula,
            computed_value=float(total),
            total_source_records=total,
            sampled_records=records,
        )
