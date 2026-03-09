"""Primary API routes."""

from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas import AllocationSummary, KPIResponse, OfferList, UploadResponse
from app.services import AllocationService, IngestionService, KPIService

router = APIRouter(tags=["smart-offer"])

ingestion_service = IngestionService()
allocation_service = AllocationService()
kpi_service = KPIService()


@router.post("/upload", response_model=UploadResponse)
async def upload_csv(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
) -> UploadResponse:
    """Ingest a Jira CSV file into the database."""

    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    result = await ingestion_service.ingest_csv(db, content)
    return UploadResponse.model_validate(result)


@router.get("/offers", response_model=OfferList)
async def list_offers(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=500),
    status: str | None = None,
    owner: str | None = None,
    practice: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> OfferList:
    """Get paginated offers with optional filters."""

    return await ingestion_service.list_offers(
        session=db,
        page=page,
        page_size=page_size,
        status=status,
        owner=owner,
        practice=practice,
    )


@router.get("/allocations", response_model=AllocationSummary)
async def list_allocations(
    architect: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    db: AsyncSession = Depends(get_db),
) -> AllocationSummary:
    """Get daily allocation view by architect."""

    return await allocation_service.list_allocations(
        session=db,
        architect=architect,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/kpis", response_model=KPIResponse)
async def get_kpis(db: AsyncSession = Depends(get_db)) -> KPIResponse:
    """Get executive KPI aggregates."""

    return await kpi_service.get_kpis(db)

