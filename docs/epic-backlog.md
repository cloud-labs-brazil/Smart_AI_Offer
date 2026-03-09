# Epic Backlog

> **Version:** 1.0 · **Date:** 2026-03-09 · **Priority:** P0 = Critical, P1 = High, P2 = Medium, P3 = Low

---

## EPIC-001: CSV Ingestion Pipeline (P0)

**Phase:** 2 · **Sprint:** 3–4 · **Owner:** Senior Data Engineer

| Story | Description | Points |
|-------|-------------|--------|
| ING-001 | RFC 4180 CSV parser supporting 52-column Jira schema | 5 |
| ING-002 | Field normalization: dates (DD/MM/YY → ISO-8601), currency, booleans | 3 |
| ING-003 | Participant deduplication (owner+participant → owner only) | 2 |
| ING-004 | Multi-value Participant field extraction (15 slots) | 3 |
| ING-005 | Human-readable name resolution (Jira login → display name) | 2 |
| ING-006 | Schema validation with structured error reporting | 3 |
| ING-007 | SHA-256 integrity hash on ingested CSV | 1 |
| ING-008 | Discrepancy validation (CSV vs API: ±1% threshold) | 3 |
| ING-009 | Data lineage capture with correlation IDs | 2 |
| ING-010 | 50k row stress test | 3 |

---

## EPIC-002: Allocation Engine (P0)

**Phase:** 2 · **Sprint:** 3–4 · **Owner:** Senior Data Engineer

| Story | Description | Points |
|-------|-------------|--------|
| ALC-001 | Daily per-architect allocation computation | 5 |
| ALC-002 | Owner weight = 100%, Participant weight = 10% (configurable) | 2 |
| ALC-003 | Overload detection (totalAllocation > 1.0) | 2 |
| ALC-004 | Percentage override support for simulation | 3 |
| ALC-005 | Cross-filtering by architect, practice, date range | 3 |

---

## EPIC-003: Backend API (P0)

**Phase:** 2 · **Sprint:** 3–4 · **Owner:** Staff Backend Engineer

| Story | Description | Points |
|-------|-------------|--------|
| API-001 | FastAPI app scaffold with health endpoint | 2 |
| API-002 | POST /upload — CSV file upload + ingestion trigger | 5 |
| API-003 | GET /offers — paginated offer listing with filters | 3 |
| API-004 | GET /allocations — daily allocation data | 3 |
| API-005 | GET /kpis — aggregated executive KPIs | 3 |
| API-006 | PostgreSQL schema (Offer, OfferParticipant, DailyAllocation) | 3 |
| API-007 | Alembic migration system setup | 2 |
| API-008 | RBAC middleware (SYSTEM_ADMIN vs standard roles) | 3 |
| API-009 | Structured JSON logging with X-Correlation-ID | 2 |

---

## EPIC-004: Executive Dashboards (P1)

**Phase:** 3 · **Sprint:** 5–6 · **Owner:** Staff Frontend Engineer

| Story | Description | Points |
|-------|-------------|--------|
| UI-001 | App chrome: 3:1 grid layout, header, tab navigation | 3 |
| UI-002 | Executive KPI strip (revenue, architects, overload days) | 3 |
| UI-003 | Allocation heatmap (21-day D3 grid) | 8 |
| UI-004 | Forecast timeline (area chart with capacity line) | 5 |
| UI-005 | Financial exposure (horizontal bar + HHI index) | 5 |
| UI-006 | Practice analytics (revenue by practice pie chart) | 3 |
| UI-007 | Investor presentation view | 5 |
| UI-008 | Internal board view | 3 |
| UI-009 | CSV uploader (drag-and-drop with validation) | 3 |
| UI-010 | Risk panel (overload detection sidebar) | 3 |

---

## EPIC-005: Theme System (P1)

**Phase:** 3 · **Sprint:** 5 · **Owner:** UX Director

| Story | Description | Points |
|-------|-------------|--------|
| THM-001 | 5 theme JSON files with CSS variable tokens | 3 |
| THM-002 | ThemeProvider component with lazy font loading | 3 |
| THM-003 | localStorage persistence (key: rsa-theme) | 1 |
| THM-004 | Chart palette integration per theme | 2 |

---

## EPIC-006: Scenario Simulator (P1)

**Phase:** 3 · **Sprint:** 6 · **Owner:** Staff Frontend Engineer

| Story | Description | Points |
|-------|-------------|--------|
| SIM-001 | Simulation mode toggle with baseline snapshot | 3 |
| SIM-002 | Reallocate offer action (change owner) | 3 |
| SIM-003 | Adjust allocation % action (percentage override) | 3 |
| SIM-004 | Add architect action (capacity planning) | 2 |
| SIM-005 | Comparison strip (4 KPIs with delta indicators) | 3 |
| SIM-006 | Scenario export to JSON | 2 |
| SIM-007 | Simulation audit log | 2 |

---

## EPIC-007: Quality & Security (P0)

**Phase:** 4 · **Sprint:** 7 · **Owner:** QA Automation Architect

| Story | Description | Points |
|-------|-------------|--------|
| QA-001 | Vitest suite ≥ 85% coverage | 5 |
| QA-002 | pytest suite for backend API | 5 |
| QA-003 | SAST scan (Bandit + npm audit) | 2 |
| QA-004 | Error boundary components | 2 |
| QA-005 | E2E smoke test (CSV upload → dashboard render) | 5 |

---

## EPIC-008: Decision Intelligence & AI (P2)

**Phase:** 5 · **Sprint:** 8 · **Owner:** Senior Data Analyst

| Story | Description | Points |
|-------|-------------|--------|
| AI-001 | Gemini chatbot integration | 5 |
| AI-002 | Confidence bands on allocation metrics | 3 |
| AI-003 | Anomaly detection (allocation outliers) | 5 |
| AI-004 | Metric dictionary (all KPIs fully defined) | 3 |
| AI-005 | Explainability layer (KPI → source record trace) | 5 |

---

## EPIC-009: Infrastructure & Deploy (P1)

**Phase:** 1, 4 · **Sprint:** 2, 7 · **Owner:** DevOps Architect

| Story | Description | Points |
|-------|-------------|--------|
| INF-001 | Docker Compose 3-service stack (db, backend, frontend) | 3 |
| INF-002 | Multi-stage Dockerfiles (Node 20 Alpine + Python 3.12 Slim) | 3 |
| INF-003 | Environment variable template (.env.example) | 1 |
| INF-004 | Health checks and readiness probes | 2 |
| INF-005 | CI quality gate pipeline | 3 |
| INF-006 | Deployment runbook | 2 |
