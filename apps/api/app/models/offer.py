"""Offer-related models."""

from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class AllocationRole(str, enum.Enum):
    """Role of an architect in an offer."""

    OWNER = "OWNER"
    PARTICIPANT = "PARTICIPANT"


class Offer(Base):
    """Normalized Jira offer record."""

    __tablename__ = "offers"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    jira_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    owner: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    type_of_service: Mapped[str | None] = mapped_column(String(255))
    practice: Mapped[str | None] = mapped_column(String(255), index=True)
    offering_type: Mapped[str | None] = mapped_column(String(255))
    priority: Mapped[str | None] = mapped_column(String(128))
    weighted_amount: Mapped[float | None] = mapped_column(Float)
    business_opportunity_type: Mapped[str | None] = mapped_column(String(255))
    country: Mapped[str | None] = mapped_column(String(128))
    market: Mapped[str | None] = mapped_column(String(128))
    market_manager: Mapped[str | None] = mapped_column(String(255))
    dn_manager: Mapped[str] = mapped_column(String(255), nullable=False)
    operations_manager: Mapped[str | None] = mapped_column(String(255))
    renewal: Mapped[bool | None] = mapped_column(Boolean)
    gep_code: Mapped[str | None] = mapped_column(String(128))
    temporal_scope: Mapped[str | None] = mapped_column(String(255))
    start_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    end_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    total_amount: Mapped[float | None] = mapped_column(Float)
    local_currency_budget: Mapped[float | None] = mapped_column(Float)
    margin: Mapped[float | None] = mapped_column(Float)
    offer_code_ng: Mapped[str | None] = mapped_column(String(255))
    offer_description_ng: Mapped[str | None] = mapped_column(Text)
    transversal: Mapped[bool | None] = mapped_column(Boolean)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    proposal_due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    observations: Mapped[str | None] = mapped_column(Text)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    cloud_infra_amount: Mapped[float | None] = mapped_column(Float)
    cloud_services_amount: Mapped[float | None] = mapped_column(Float)
    cloud_service_type: Mapped[str | None] = mapped_column(String(255))
    cloud_provider: Mapped[str | None] = mapped_column(String(255))
    other_cloud_providers: Mapped[str | None] = mapped_column(String(255))

    participants: Mapped[list["OfferParticipant"]] = relationship(
        "OfferParticipant",
        back_populates="offer",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class OfferParticipant(Base):
    """Architect linked to an offer with role."""

    __tablename__ = "offer_participants"

    offer_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("offers.id", ondelete="CASCADE"),
        primary_key=True,
    )
    architect_name: Mapped[str] = mapped_column(String(255), primary_key=True, index=True)
    role: Mapped[AllocationRole] = mapped_column(
        Enum(AllocationRole, name="allocation_role"),
        primary_key=True,
        default=AllocationRole.PARTICIPANT,
    )

    offer: Mapped["Offer"] = relationship("Offer", back_populates="participants")
