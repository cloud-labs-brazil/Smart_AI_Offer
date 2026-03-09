# Milestones

> **Version:** 1.0 · **Date:** 2026-03-09

---

## M1 — Foundation Complete

**Target:** End of Sprint 2 · **Gate:** G1 (Architecture Sign-off)

| Deliverable | Status |
|-------------|--------|
| All governance docs created | ☐ |
| Rule files 01–09 in place | ☐ |
| ADR index with initial ADRs | ☐ |
| Monorepo scaffold matches structure doc | ☐ |
| Docker Compose stack boots successfully | ☐ |
| Shared contracts package exports core types | ☐ |
| Design tokens + 5 theme files created | ☐ |

**Exit Criteria:** All foundation documents reviewed and approved. `docker compose up` starts all 3 services. Architecture ADR signed off.

---

## M2 — Data Pipeline Operational

**Target:** End of Sprint 4 · **Gate:** G2 (Data Model Validation), G3 (50k Row Stress Test)

| Deliverable | Status |
|-------------|--------|
| CSV parser handles 52-column Jira exports | ☐ |
| Allocation engine computes daily per-architect loads | ☐ |
| FastAPI endpoints operational (upload, offers, allocations) | ☐ |
| PostgreSQL schema deployed with Alembic migrations | ☐ |
| 50k row stress test passes (< 15 min) | ☐ |
| Data lineage and integrity hashes captured | ☐ |
| Discrepancy validation rules active | ☐ |

**Exit Criteria:** End-to-end CSV upload → parse → compute → persist → query flow working. Stress test passes. Data model validated against Jira export schema.

---

## M3 — Dashboards Live

**Target:** End of Sprint 6 · **Gate:** G4 (Build Verification), G5 (Performance Benchmark)

| Deliverable | Status |
|-------------|--------|
| All 7 dashboard tabs rendering real data | ☐ |
| Executive KPI strip operational | ☐ |
| Scenario simulator with 3 action types | ☐ |
| 5 themes switchable with persistence | ☐ |
| CSV drag-and-drop uploader working | ☐ |
| Risk panel showing overload alerts | ☐ |
| `next build` zero errors | ☐ |
| FCP < 2s, parse < 500ms | ☐ |

**Exit Criteria:** Full dashboard experience available. All chart components render correctly with real Jira data. Themes switch cleanly. Build is clean.

---

## M4 — Production Hardened

**Target:** End of Sprint 7 · **Gate:** G6 (SAST), G7 (Coverage)

| Deliverable | Status |
|-------------|--------|
| Vitest ≥ 85% coverage | ☐ |
| pytest backend coverage adequate | ☐ |
| Bandit: 0 findings | ☐ |
| npm audit: 0 vulnerabilities | ☐ |
| Error boundaries prevent white screens | ☐ |
| RBAC separates admin from standard roles | ☐ |
| Structured logging with correlation IDs | ☐ |
| Deployment runbook completed | ☐ |

**Exit Criteria:** All 7 quality gates passed. Security scans clean. Platform ready for production deployment.

---

## M5 — Intelligence Layer

**Target:** End of Sprint 8 · **Gate:** N/A (Feature milestone)

| Deliverable | Status |
|-------------|--------|
| AI chatbot querying allocation data | ☐ |
| Confidence bands on key metrics | ☐ |
| Anomaly detection flagging outliers | ☐ |
| Metric dictionary fully documented | ☐ |
| Explainability traces for all KPIs | ☐ |

**Exit Criteria:** AI features operational. Every metric has lineage documentation. Anomaly alerts surface automatically.

---

## Milestone Summary

```
Sprint 1-2   ████████░░░░░░░░░░░░  M1 Foundation
Sprint 3-4   ░░░░░░░░████████░░░░  M2 Data Pipeline
Sprint 5-6   ░░░░░░░░░░░░░░░█████  M3 Dashboards
Sprint 7     ░░░░░░░░░░░░░░░░░░██  M4 Hardening
Sprint 8     ░░░░░░░░░░░░░░░░░░░█  M5 Intelligence
```
