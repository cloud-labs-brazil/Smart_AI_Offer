# Rule 01 — Delivery Contract

> **Scope:** All agents and implementation sessions

---

## Contract Terms

1. **Planning before code.** No production code is written until architecture, data contracts, and delivery sequencing artifacts exist and are approved.

2. **Vertical slices.** Implementation proceeds in small, testable vertical slices — never horizontal layers in isolation.

3. **Artifact-first output.** Every session must produce concrete files, runnable code, explicit assumptions, or documentation. Conversational-only output is not acceptable.

4. **Quality gates are mandatory.** No deployment without passing all 7 quality gates (G1–G7). Gates cannot be skipped or deferred.

5. **Rollback readiness.** Every change must be reversible. Database migrations include down scripts. Feature flags are preferred over hard deploys.

6. **Observability by default.** All services emit structured logs with correlation IDs. No silent failures.

7. **ADR governance.** Significant architectural decisions require an ADR before implementation. No ad-hoc structural changes.

## Deliverable Standards

| Artifact | Required Content |
|----------|-----------------|
| Code files | Tests, types, error handling, logging |
| API endpoints | OpenAPI spec, request/response schemas, auth |
| Database changes | Alembic migration + rollback script |
| Frontend components | Props interface, error boundary, loading state |
| Documentation | Purpose, usage, constraints, examples |

## Acceptance Protocol

- Every deliverable references its epic and story ID
- Every deliverable has at least one automated test
- Every deliverable passes linting and type checking
- Code review is required before merge to main
