# Implementation Roadmap

> **Version:** 1.0 · **Date:** 2026-03-09

---

## Phase 1 — Foundation & Architecture (Sprint 1–2)

**Goal:** Establish governance, data contracts, and repository scaffold.

| Deliverable | Owner | Acceptance Criteria |
|-------------|-------|---------------------|
| Project brief, roadmap, backlog | PM | All docs reviewed and approved |
| Monorepo scaffold | Architect | Directories match `monorepo-structure.md` |
| ADR index + initial ADRs | Architect | ADR-001 through ADR-005 documented |
| Rule files 01–09 | Architect | All governance rules in `.claude/rules/` |
| Design tokens + theme system | UX Director | 5 themes with CSS variable tokens |
| Shared contracts package | Architect | `JiraOffer`, `DailyAllocation` types exported |
| Docker Compose stack | DevOps | `docker compose up` starts db + api + web |

---

## Phase 2 — Data Ingestion & Backend Core (Sprint 3–4)

**Goal:** Build the reliable data pipeline from CSV to database.

| Deliverable | Owner | Acceptance Criteria |
|-------------|-------|---------------------|
| RFC 4180 CSV parser | Data Engineer | Handles 52-column Jira exports, 14k+ rows < 500ms |
| Field normalizer | Data Engineer | Participant dedup, date standardization, name resolution |
| Allocation engine | Data Engineer | Daily per-architect compute, owner 100% / participant 10% |
| Discrepancy validation | Data Engineer | CSV vs API comparison with ±1% thresholds |
| Data lineage capture | Data Engineer | SHA-256 hashes, correlation IDs, audit trail |
| FastAPI endpoints | Backend Engineer | `POST /upload`, `GET /offers`, `GET /allocations` |
| PostgreSQL schema | Backend Engineer | Offer, OfferParticipant, DailyAllocation tables |
| Alembic migrations | Backend Engineer | Versioned schema migrations |
| 50k row stress test | QA | < 15 min end-to-end, memory stable |

---

## Phase 3 — Frontend Dashboards (Sprint 5–6)

**Goal:** Build executive-grade visualization layer.

| Deliverable | Owner | Acceptance Criteria |
|-------------|-------|---------------------|
| App chrome + layout | Frontend Engineer | 3:1 grid, header, tab navigation |
| Executive KPI strip | Frontend Engineer | Revenue, architect count, overload days |
| Allocation heatmap | Frontend Engineer | 21-day grid, D3 rendering, overload highlighting |
| Forecast timeline | Frontend Engineer | Area chart with capacity line, 30/60/90 markers |
| Financial exposure | Frontend Engineer | Horizontal bar + HHI concentration index |
| Practice analytics | Frontend Engineer | Revenue distribution pie chart by practice |
| CSV uploader | Frontend Engineer | Drag-and-drop, validation feedback, progress |
| Theme switcher | Frontend Engineer | 5 themes, localStorage persistence |
| Scenario simulator | Frontend Engineer | Reallocate, adjust %, add capacity + comparison |
| Risk panel | Frontend Engineer | Overload detection sidebar |

---

## Phase 4 — Quality, Security & Observability (Sprint 7)

**Goal:** Harden the platform for production readiness.

| Deliverable | Owner | Acceptance Criteria |
|-------------|-------|---------------------|
| Vitest suite ≥ 85% coverage | QA | All components + engine + parser tested |
| pytest suite for backend | QA | API routes + services + models tested |
| SAST scan (Bandit + npm audit) | Security | 0 critical findings |
| Structured logging | DevOps | JSON logs with correlation IDs |
| Error boundaries | Frontend Engineer | Graceful degradation, no white screens |
| RBAC middleware | Backend Engineer | Role-based access for admin vs non-admin |

---

## Phase 5 — Decision Intelligence & AI (Sprint 8)

**Goal:** Add intelligence layer on top of analytics.

| Deliverable | Owner | Acceptance Criteria |
|-------------|-------|---------------------|
| AI chatbot (Gemini) | Frontend Engineer | Natural-language querying of offer data |
| Confidence bands on metrics | Data Analyst | Visual indicators of data quality |
| Anomaly detection | Data Analyst | Automatic flagging of allocation outliers |
| Metric dictionary | Data Analyst | Every dashboard metric fully defined |
| Explainability layer | Architect | Every KPI traces back to source records |

---

## Quality Gates (All Phases)

| Gate | Phase | Pass Criteria |
|------|-------|---------------|
| G1 — Architecture Sign-off | 1 | ADRs approved, stack confirmed |
| G2 — Data Model Validation | 2 | Schema matches Jira CSV structure |
| G3 — 50k Row Stress Test | 2 | Performance within thresholds |
| G4 — Build Verification | 3 | `next build` + `uvicorn` zero errors |
| G5 — Performance Benchmark | 3 | FCP < 2s, parse < 500ms |
| G6 — Automated SAST | 4 | Bandit 0 findings, npm audit clean |
| G7 — Code Coverage | 4 | ≥ 85% statements, ≥ 80% branches |
