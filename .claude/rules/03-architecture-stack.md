# Rule 03 — Architecture & Technology Stack

> **Scope:** Technology choices, dependency constraints, architectural patterns

---

## Stack Decision Matrix

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Frontend Framework | Next.js | 15.x | App Router, SSR, standalone output |
| UI Library | React | 19.x | Concurrent features, server components |
| Language | TypeScript | 5.9+ | Strict type safety across all code |
| State Management | Zustand | 5.x | Lightweight, no boilerplate, middleware |
| Charts | Recharts | 3.x | Declarative React charting |
| Heatmaps | D3 | 7.x | Low-level data-driven rendering |
| Animations | Framer Motion | 12.x | Declarative animation system |
| Icons | Lucide React | 0.553+ | Consistent icon set |
| CSS | Tailwind CSS | 4.x | Utility-first, PostCSS pipeline |
| Backend Framework | FastAPI | latest | Async, OpenAPI auto-docs, Pydantic v2 |
| Backend Language | Python | 3.12 | Latest stable, performance improvements |
| ORM | SQLAlchemy | 2.x async | Async sessions, relationship loading |
| Validation | Pydantic | v2 | Schema validation, serialization |
| Database | PostgreSQL | 15 Alpine | ACID, JSON support, battle-tested |
| AI SDK | @google/genai | 1.17+ | Gemini API access |
| Testing (FE) | Vitest | 4.x | Fast, ESM-native, coverage via V8 |
| Testing (BE) | pytest | latest | Python standard |
| Containerization | Docker | Multi-stage | Node 20 Alpine + Python 3.12 Slim |
| Orchestration | Docker Compose | v3 | 3-service stack with health checks |

## Architectural Patterns

### Frontend
- **App Router** (Next.js 15) — no Pages Router
- **Client Components** for interactive dashboards
- **Server-side API routes** for CSV serving
- **Zustand stores** for global state (no Redux, no Context API for state)
- **CSS variables** driven by theme system
- **Framer Motion** for all animations and transitions

### Backend
- **FastAPI with async** — all I/O operations are non-blocking
- **Repository pattern** — data access abstracted behind service layer
- **Pydantic v2 schemas** — all request/response validation
- **Alembic migrations** — versioned, reversible schema changes
- **Structured logging** — JSON format with correlation IDs

### Data Flow
```
CSV File → Parser (RFC 4180) → Normalizer → Validator → Engine → Store/DB → Dashboard
```

## Constraints

- No additional frontend frameworks (no Angular, no Vue)
- No additional state libraries (no Redux, no MobX, no Jotai)
- No additional ORM libraries (no Prisma, no TypeORM in backend)
- No additional CSS frameworks beyond Tailwind
- Dependencies must be justified by an ADR if not in the approved list above
- `ignoreBuildErrors: true` must be removed before production
