"""
Smart Offer — Backend API Entrypoint

FastAPI application for the AI Offers Management platform.
Handles CSV ingestion, allocation computation, KPI aggregation.

@see .claude/rules/03-architecture-stack.md
@see docs/implementation-roadmap.md (Phase 2)
"""

from __future__ import annotations

import json
import logging
import time
import uuid
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes import router as api_router
from app.schemas import HealthResponse

logger = logging.getLogger("smart_offer.api")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(message)s"))
    logger.addHandler(handler)
logger.setLevel(settings.log_level.upper())

app = FastAPI(
    title="Smart Offer API",
    description="AI Offers Management — Backend Analytics API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.middleware("http")
async def correlation_logging_middleware(request: Request, call_next):
    """Emit JSON request logs with correlation ID."""

    correlation_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
    request.state.correlation_id = correlation_id

    started = time.perf_counter()
    status_code = 500
    try:
        response = await call_next(request)
        status_code = response.status_code
    finally:
        duration_ms = round((time.perf_counter() - started) * 1000, 2)
        logger.info(
            json.dumps(
                {
                    "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                    "correlation_id": correlation_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": status_code,
                    "duration_ms": duration_ms,
                }
            )
        )

    response.headers["X-Correlation-ID"] = correlation_id
    return response


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for Docker readiness probe."""
    return {"status": "healthy", "service": "smart-offer-api"}
