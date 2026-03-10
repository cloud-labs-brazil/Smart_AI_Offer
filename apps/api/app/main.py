"""
Smart Offer — Backend API Entrypoint

FastAPI application for the AI Offers Management platform.
Handles CSV ingestion, allocation computation, KPI aggregation.

@see .claude/rules/03-architecture-stack.md
@see docs/implementation-roadmap.md (Phase 2)
"""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.middleware.correlation import CorrelationMiddleware, setup_structured_logging
from app.routes import router as api_router
from app.schemas import HealthResponse

# ---------------------------------------------------------------------------
# Structured logging — replaces ad-hoc handler setup
# ---------------------------------------------------------------------------
setup_structured_logging(level=getattr(logging, settings.log_level.upper(), logging.INFO))
logger = logging.getLogger("smart_offer.api")

# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Smart Offer API",
    description="AI Offers Management — Backend Analytics API",
    version="0.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# Middleware stack (order matters — outermost first)
# ---------------------------------------------------------------------------

# CORS — allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Correlation ID → ContextVar for async-safe structured logging
app.add_middleware(CorrelationMiddleware)

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
app.include_router(api_router)


@app.get("/health", response_model=HealthResponse)
@app.get("/healthz", response_model=HealthResponse, include_in_schema=False)
async def health_check():
    """Health check endpoint for Docker readiness probe."""
    return {"status": "healthy", "service": "smart-offer-api"}
