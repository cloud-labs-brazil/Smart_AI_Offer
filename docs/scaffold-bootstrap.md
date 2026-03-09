# Scaffold Bootstrap Guide

Use this document to bootstrap the repository into implementation mode.

## Objectives
- Start from a professional monorepo layout.
- Preserve governance-first delivery.
- Avoid ad-hoc folder creation by agents.
- Ensure every code area has a clear ownership boundary.

## Repository zones
- `apps/web` — executive dashboards, admin panel, upload UI
- `apps/api` — analytics API, RBAC, metric registry endpoints
- `services/ingestion` — CSV parsing, normalization, reliability checks, lineage capture
- `packages/ui` — shared UI components and design tokens
- `packages/contracts` — shared TS contracts, enums, metric registry stubs
- `infra` — deployment manifests and environment composition
- `docs` — ADRs, roadmap, architecture, runbooks, milestones

## Bootstrap order
1. Confirm ADRs.
2. Confirm environment variables and secrets model.
3. Bring up Postgres via Docker.
4. Implement API health + config endpoints.
5. Implement ingestion package skeleton.
6. Implement web shell with design tokens and app chrome.
7. Add CI checks and pull-request quality gates.

## Constraints
- Do not invent extra root folders unless approved by ADR.
- Keep participant weight hidden from non-admin roles.
- Build backend truth before dashboard polish.
