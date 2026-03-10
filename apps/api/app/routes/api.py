"""Primary API routes."""

from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.middleware.rbac import Role, require_min_role, require_role
from app.schemas import AllocationSummary, ExplainabilityResponse, KPIResponse, OfferList, UploadResponse
from app.services import AllocationService, ExplainabilityService, IngestionService, KPIService

router = APIRouter(tags=["smart-offer"])

ingestion_service = IngestionService()
allocation_service = AllocationService()
kpi_service = KPIService()
explainability_service = ExplainabilityService()


@router.post(
    "/upload",
    response_model=UploadResponse,
    dependencies=[Depends(require_role(Role.SYSTEM_ADMIN))],
)
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


@router.get(
    "/kpis",
    response_model=KPIResponse,
    dependencies=[Depends(require_min_role(Role.ANALYST))],
)
async def get_kpis(db: AsyncSession = Depends(get_db)) -> KPIResponse:
    """Get executive KPI aggregates."""

    return await kpi_service.get_kpis(db)


@router.get("/metrics/dictionary")
async def get_metric_dictionary(
    tab: str | None = Query(default=None, description="Filter by dashboard tab name"),
    metric_id: str | None = Query(default=None, description="Get a single metric by ID"),
) -> dict:
    """Return the metric dictionary for documentation / AI chatbot consumption."""

    from app.services.metric_dictionary import METRIC_DICTIONARY

    metrics = METRIC_DICTIONARY

    if metric_id:
        match = [m for m in metrics if m.id == metric_id]
        if not match:
            raise HTTPException(status_code=404, detail=f"Metric '{metric_id}' not found")
        return {"count": 1, "metrics": [m.model_dump() for m in match]}

    if tab:
        metrics = [m for m in metrics if tab in m.dashboard_tabs]

    return {"count": len(metrics), "metrics": [m.model_dump() for m in metrics]}


@router.get(
    "/metrics/explainability",
    response_model=ExplainabilityResponse,
    dependencies=[Depends(require_min_role(Role.ANALYST))],
)
async def get_metric_explainability(
    metric_id: str | None = Query(default=None, description="Metric ID from /metrics/dictionary or API KPI IDs"),
    sample_size: int = Query(default=25, ge=1, le=100, description="How many source records to include per metric"),
    db: AsyncSession = Depends(get_db),
) -> ExplainabilityResponse:
    """Trace metric values back to source records for auditability."""

    try:
        return await explainability_service.get_explainability(
            session=db,
            metric_id=metric_id,
            sample_size=sample_size,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/chat")
async def chat(
    body: dict,
) -> dict:
    """AI chatbot endpoint — proxies to Gemini with metric dictionary context."""

    from app.services.chat_service import ChatRequest, chat_with_gemini

    request = ChatRequest(**body)
    result = await chat_with_gemini(request)
    return result.model_dump()
