"""Allocation models."""

from __future__ import annotations

from datetime import date

from sqlalchemy import Boolean, Date, Enum, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .offer import AllocationRole


class DailyAllocation(Base):
    """Daily allocation aggregate per architect."""

    __tablename__ = "daily_allocations"
    __table_args__ = (UniqueConstraint("architect_name", "date", name="uq_daily_alloc_arch_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    architect_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    total_allocation: Mapped[float] = mapped_column(Float, nullable=False)
    is_overloaded: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)

    details: Mapped[list["AllocationDetail"]] = relationship(
        "AllocationDetail",
        back_populates="allocation",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class AllocationDetail(Base):
    """Per-offer contribution inside a daily allocation record."""

    __tablename__ = "allocation_details"
    __table_args__ = (UniqueConstraint("allocation_id", "offer_id", "role", name="uq_alloc_detail"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    allocation_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("daily_allocations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    offer_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("offers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[AllocationRole] = mapped_column(Enum(AllocationRole, name="allocation_role"), nullable=False)
    weight: Mapped[float] = mapped_column(Float, nullable=False)

    allocation: Mapped["DailyAllocation"] = relationship("DailyAllocation", back_populates="details")
