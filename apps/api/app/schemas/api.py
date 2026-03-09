"""Pydantic schemas for API I/O."""

from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class DiscrepancyReport(BaseModel):
    """Discrepancy report from ingestion validation."""

    status: Literal["VERIFIED", "UNVERIFIED"] = "VERIFIED"
    record_count_delta: float = 0.0
    allocation_delta: float = 0.0
    revenue_delta: float = 0.0
    timestamp: datetime


class UploadError(BaseModel):
    """Row-level ingestion error."""

    row: int
    severity: str
    field: str
    message: str


class UploadResponse(BaseModel):
    """Upload endpoint response."""

    ingested_count: int
    error_count: int
    errors: list[UploadError] = Field(default_factory=list)
    discrepancy_report: DiscrepancyReport | None = None


class OfferBase(BaseModel):
    """Normalized offer payload."""

    id: str
    jira_id: int
    owner: str
    status: str
    summary: str
    type_of_service: str | None = None
    practice: str | None = None
    offering_type: str | None = None
    priority: str | None = None
    weighted_amount: float | None = None
    business_opportunity_type: str | None = None
    country: str | None = None
    market: str | None = None
    market_manager: str | None = None
    dn_manager: str
    operations_manager: str | None = None
    renewal: bool | None = None
    gep_code: str | None = None
    temporal_scope: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    participants: list[str] = Field(default_factory=list)
    total_amount: float | None = None
    local_currency_budget: float | None = None
    margin: float | None = None
    offer_code_ng: str | None = None
    offer_description_ng: str | None = None
    transversal: bool | None = None
    updated_at: datetime | None = None
    created_at: datetime
    proposal_due_date: datetime | None = None
    observations: str | None = None
    resolved_at: datetime | None = None
    cloud_infra_amount: float | None = None
    cloud_services_amount: float | None = None
    cloud_service_type: str | None = None
    cloud_provider: str | None = None
    other_cloud_providers: str | None = None

    model_config = ConfigDict(from_attributes=True)


class OfferCreate(OfferBase):
    """Offer create schema."""


class OfferRead(OfferBase):
    """Offer read schema."""


class OfferList(BaseModel):
    """Paginated offer list."""

    items: list[OfferRead]
    page: int
    page_size: int
    total: int


class AllocationDetailRead(BaseModel):
    """Per-offer allocation detail."""

    offer_id: str
    role: Literal["OWNER", "PARTICIPANT"]
    weight: float

    model_config = ConfigDict(from_attributes=True)


class AllocationRead(BaseModel):
    """Daily allocation item."""

    architect_name: str
    date: date
    total_allocation: float
    is_overloaded: bool
    allocations: list[AllocationDetailRead]

    model_config = ConfigDict(from_attributes=True)


class AllocationSummary(BaseModel):
    """Allocation list summary."""

    items: list[AllocationRead]
    total: int
    overloaded_count: int


class KPIResponse(BaseModel):
    """Executive KPI response."""

    total_offers: int
    total_revenue: float
    avg_margin: float
    overloaded_count: int


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    service: str
