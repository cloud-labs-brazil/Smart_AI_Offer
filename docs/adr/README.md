# Architecture Decision Records (ADR) Index

> **Project:** AI Offers Management · **Last Updated:** 2026-03-09

---

## What is an ADR?

An Architecture Decision Record captures a significant architectural decision along with its context, rationale, and consequences. ADRs are immutable once accepted — if a decision changes, a new ADR supersedes the old one.

## Template

Each ADR follows this structure:

```markdown
# ADR-NNN: [Title]

**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-NNN
**Date:** YYYY-MM-DD
**Author:** [Name/Role]

## Context
[What is the situation that requires a decision?]

## Decision
[What is the change being proposed?]

## Consequences
[What becomes easier or harder because of this decision?]

## Alternatives Considered
[What other options were evaluated?]
```

## ADR Registry

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| ADR-001 | Monorepo structure with zone ownership | Proposed | 2026-03-09 |
| ADR-002 | Next.js 15 + React 19 for frontend | Proposed | 2026-03-09 |
| ADR-003 | FastAPI + PostgreSQL for backend | Proposed | 2026-03-09 |
| ADR-004 | Zustand for client-side state management | Proposed | 2026-03-09 |
| ADR-005 | CSV-first ingestion with RFC 4180 compliance | Proposed | 2026-03-09 |
| ADR-006 | Participant weight hidden from non-admin roles | Proposed | 2026-03-09 |
| ADR-007 | 5-theme CSS variable system with localStorage | Proposed | 2026-03-09 |
| ADR-008 | Docker Compose 3-service orchestration | Proposed | 2026-03-09 |
| ADR-009 | Gemini AI integration for chatbot | Proposed | 2026-03-09 |

## Conventions

- ADRs are numbered sequentially: `ADR-001`, `ADR-002`, etc.
- Files are named: `adr-001-monorepo-structure.md`
- ADRs live in `docs/adr/`
- Each ADR requires sign-off from the Principal Architect
- Superseded ADRs link to their replacement
