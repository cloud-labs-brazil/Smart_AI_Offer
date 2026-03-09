# Project Brief — AI Offers Management Platform

> **Codename:** Smart Offer · **Version:** 1.0 · **Date:** 2026-03-09

---

## Executive Summary

The AI Offers Management platform is a Fortune-500-grade decision intelligence system that ingests Jira-exported CSV data for the Indra Brazil offer pipeline, normalizes and enriches offer records, computes reliable allocation analytics, and delivers executive dashboards to C-Level, Directors, Managers, and Presales teams.

## Problem Statement

Indra Brazil manages a pipeline of **~14,000 offer records** across multiple practice areas (Energy, Transport, PA, ICT, Defence, Telecom, Finance, Health). Currently:

- Offer visibility is fragmented across Jira boards and manual exports
- Architect allocation conflicts (overloads) are discovered reactively, not proactively
- Financial exposure and revenue concentration lack quantitative analysis
- Scenario planning for capacity is non-existent
- Executive dashboards do not exist — reporting relies on ad-hoc spreadsheet work

## Solution

A full-stack analytics platform with:

1. **CSV Ingestion Pipeline** — RFC 4180 compliant parser that normalizes 52-column Jira exports
2. **Allocation Engine** — Daily per-architect allocation computation across overlapping offers
3. **Scenario Simulator** — What-if analysis (reallocate, adjust %, add capacity) with baseline comparison
4. **Executive Dashboards** — 7 tabbed views (Allocation Heatmap, Forecast, Financial Exposure, Practice Analytics, Investor Presentation, Internal Board, Admin)
5. **AI Assistant** — Gemini-powered chatbot for natural-language querying of allocation data
6. **Decision Intelligence** — Confidence bands, explainability, and anomaly detection

## Stakeholders

| Role | Persona | Access Level |
|------|---------|--------------|
| C-Level | CEO, CFO, CTO | Read-only dashboards, KPI strips |
| Director | Practice Directors, VP Operations | Dashboards + drill-down + simulation |
| Manager | DN Managers, Operations Managers | Full data access + admin |
| Presales | Solution Architects, Bid Managers | Allocation views + capacity planning |
| System Admin | Platform Engineering | Full access + weight configuration |

## Data Source

- **Primary**: Jira Cloud CSV Export (`JIRA PBI (JIRA Indra)`)
- **Format**: RFC 4180 CSV, UTF-8
- **Volume**: ~14,000 rows, 52 columns
- **Key Fields**: Issue key, Assignee, Status, Summary, DN Manager, Market, Participants (×15 slots), Total Amount (€), Margin, Offer Code, Proposal Due Date
- **Refresh**: Manual upload or scheduled Jira API sync (future)

## Non-Negotiables

- Participant default weight: **0.10** (configurable by SYSTEM_ADMIN only)
- Participant weight visibility: **hidden from non-admin users**
- Assignee = lead architect; DN Manager = business developer
- Historical inactive users remain visible in historical reporting
- Dashboards display human-readable names, never Jira logins
- Every metric: defined, lineage-backed, auditable
- Corrupted/low-confidence data must NOT propagate to executive dashboards
- Design language: Indra corporate identity + enterprise UX principles

## Success Criteria

| Metric | Target |
|--------|--------|
| CSV parse time (14k rows) | < 500ms |
| Allocation compute time | < 300ms |
| Dashboard first contentful paint | < 2s |
| Test coverage (statements) | ≥ 85% |
| Quality gates passed | All 7 gates |
| Zero critical security findings | SAST clean |
| 50k row stress test | < 15 min end-to-end |

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript 5.9 |
| State | Zustand (dataStore, simulationStore, themeStore) |
| Charts | Recharts 3, D3 7 |
| Animations | Framer Motion 12 |
| Backend API | FastAPI (Python 3.12), Uvicorn |
| ORM | SQLAlchemy (async), Pydantic v2 |
| Database | PostgreSQL 15 |
| AI | Google Gemini (generativelanguage API) |
| Orchestration | Docker Compose (3-service stack) |
| Testing | Vitest (frontend), pytest (backend) |
| CI/CD | Quality gates, SAST (Bandit + npm audit) |
