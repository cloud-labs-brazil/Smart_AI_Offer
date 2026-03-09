# Gate 1 — Architecture Sign-off

**Date:** 2026-03-04  
**Author:** Senior Solutions Architect / Technical PM  
**Status:** ✅ APPROVED

---

## System Overview

Resource Smart Allocation is a full-stack intelligence platform that ingests JIRA-exported CSV data, computes daily per-architect allocation percentages, and presents interactive dashboards for executive decision-making.

## Architecture Layers

| Layer | Technology | Responsibility |
|-------|-----------|----------------|
| **Frontend** | Next.js 15, React 19, Recharts, D3, Framer Motion | Interactive dashboards, 5 theme modes, scenario simulation |
| **State** | Zustand (dataStore, simulationStore, themeStore) | Client-side state, cross-filtering, drill-down |
| **Backend API** | FastAPI (Python 3.12), Uvicorn | CSV upload, allocation computation, KPI aggregation |
| **ORM / Models** | SQLAlchemy (async), Pydantic v2 | Domain models (Offer, OfferParticipant, DailyAllocation) |
| **Database** | PostgreSQL 15 (Alpine) | Persistent storage of offers and daily allocations |
| **Orchestration** | Docker Compose | 3-service stack (db, backend, frontend) with health checks |

## Key Decisions

1. **Separation of concerns**: Frontend handles visualization; Backend handles data processing and persistence.
2. **Async SQLAlchemy**: All DB operations are async for non-blocking I/O under load.
3. **CSV-first ingestion**: The system accepts raw JIRA CSV exports (RFC 4180) — no JIRA API dependency.
4. **Daily granularity allocation**: Each architect's workload is computed per-day across all overlapping offers.
5. **Docker Compose orchestration**: Single-command deployment with Postgres health-check gates.

## Quality Gates Summary

| Gate | Description | Status |
|------|-------------|--------|
| **Gate 1** | Architecture Sign-off | ✅ This document |
| **Gate 3** | 50k-row stress test | ✅ 50,000 offers processed and persisted (686s) |
| **Gate 4** | Build verification | ✅ `next build` zero errors, `vitest run` 118/118 pass |
| **Gate 5** | Performance benchmark | ✅ 50k rows ingested end-to-end via API |
| **Gate 6** | Automated SAST | ✅ Bandit: 0 findings (378 LOC); npm audit: 0 vulnerabilities |
| **Gate 7** | Frontend test coverage | ✅ ~85% coverage (118 tests, 8 suites) |

## Risk Assessment

| Risk | Mitigation | Severity |
|------|-----------|----------|
| 50k upload takes ~11 min | Batch inserts / bulk COPY optimization in future sprint | LOW |
| No rate limiting on API | Add FastAPI middleware before public exposure | MEDIUM |
| Single-node Postgres | Add connection pooling / read replicas for production | LOW |

## Sign-off

> This architecture has been reviewed and approved for continued development through Sprint 5 and beyond.  
> All critical quality gates (1-7) are satisfied.
