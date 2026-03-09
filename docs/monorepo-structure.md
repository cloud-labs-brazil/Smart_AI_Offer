# Monorepo Structure

> **Version:** 1.0 · **Last Updated:** 2026-03-09

---

## Directory Layout

```
Smart_Offer/
├── CLAUDE.md                           # Agent operating instructions
├── .claude/
│   ├── settings.json                   # Agent permissions and sandbox config
│   └── rules/                          # Governance rule files (01–09)
│
├── apps/
│   ├── web/                            # Next.js 15 executive dashboard
│   │   ├── app/                        # App Router pages and layouts
│   │   │   ├── page.tsx                # Main dashboard page
│   │   │   ├── layout.tsx              # Root layout + ThemeProvider
│   │   │   ├── globals.css             # Global styles
│   │   │   └── api/csv/route.ts        # CSV serving API route
│   │   ├── components/
│   │   │   ├── dashboard/              # 10 dashboard tab components
│   │   │   ├── ai/                     # Chatbot + LiveAudio
│   │   │   ├── simulator/              # ScenarioSimulator
│   │   │   └── theme/                  # ThemeProvider
│   │   ├── store/                      # Zustand stores
│   │   │   ├── dataStore.ts            # Offers, allocations, filters
│   │   │   ├── simulationStore.ts      # Simulation state + engine
│   │   │   └── themeStore.ts           # Theme switcher
│   │   ├── lib/                        # Core logic libraries
│   │   │   ├── parser/csvParser.ts     # RFC 4180 CSV parser
│   │   │   ├── engine/                 # allocationEngine.ts + types.ts
│   │   │   ├── integrations/jiraApi.ts # Jira REST client (mock)
│   │   │   ├── chartExport.ts          # PNG/JSON export
│   │   │   ├── logger.ts              # Structured logging
│   │   │   └── utils.ts               # Shared utilities
│   │   ├── themes/                     # 5 theme JSON files
│   │   ├── CSV/                        # Bundled Jira export data
│   │   ├── Dockerfile                  # Multi-stage Node 20 Alpine
│   │   ├── vitest.config.ts            # Test config
│   │   ├── next.config.ts              # Next.js config
│   │   └── package.json                # Frontend dependencies
│   │
│   └── api/                            # FastAPI backend
│       ├── app/
│       │   ├── main.py                 # FastAPI app entrypoint
│       │   ├── models/                 # SQLAlchemy models
│       │   ├── schemas/                # Pydantic v2 schemas
│       │   ├── services/               # Business logic services
│       │   ├── routes/                 # API route handlers
│       │   └── core/                   # Config, DB, security
│       ├── migrations/                 # Alembic migrations
│       ├── tests/                      # pytest test suite
│       ├── Dockerfile                  # Python 3.12 Slim
│       └── requirements.txt            # Python dependencies
│
├── services/
│   └── ingestion/                      # CSV parsing + normalization service
│       ├── parser.py                   # CSV field extraction + validation
│       ├── normalizer.py               # Data normalization + dedup
│       ├── reliability.py              # Discrepancy validation rules
│       ├── lineage.py                  # Data lineage capture
│       └── tests/                      # Ingestion test suite
│
├── packages/
│   ├── ui/                             # Shared UI component library
│   │   ├── components/                 # Reusable React components
│   │   ├── tokens/                     # Design tokens (CSS variables)
│   │   └── package.json
│   │
│   └── contracts/                      # Shared TypeScript contracts
│       ├── types/                      # JiraOffer, DailyAllocation, etc.
│       ├── enums/                      # Status, Role, Practice enums
│       ├── metrics/                    # Metric registry stubs
│       └── package.json
│
├── infra/
│   ├── docker-compose.yml              # 3-service stack (db, backend, frontend)
│   ├── .env.example                    # Environment variable template
│   └── scripts/                        # Deployment and maintenance scripts
│
├── docs/
│   ├── project_brief.md                # This project's mission and scope
│   ├── monorepo-structure.md           # This file
│   ├── scaffold-bootstrap.md           # Bootstrap sequence guide
│   ├── implementation-roadmap.md       # Phased delivery plan
│   ├── epic-backlog.md                 # Prioritized epic list
│   ├── milestones.md                   # Release milestones
│   └── adr/                            # Architecture Decision Records
│       └── README.md                   # ADR index
│
└── indra_design_system/                # Reference: Indra brand assets
    ├── architecture.md
    ├── ux_spec.md
    ├── theme_system.md
    ├── data_model.md
    ├── allocation_rules.md
    ├── simulation_engine.md
    └── ...
```

## Zone Ownership

| Zone | Owner Role | Responsibility |
|------|-----------|----------------|
| `apps/web` | Staff Frontend Engineer | Executive dashboards, admin panel, upload UI |
| `apps/api` | Staff Backend Engineer | Analytics API, RBAC, metric registry endpoints |
| `services/ingestion` | Senior Data Engineer | CSV parsing, normalization, reliability checks, lineage |
| `packages/ui` | UX Director | Shared UI components and design tokens |
| `packages/contracts` | Principal Architect | Shared TS contracts, enums, metric registry |
| `infra` | DevOps Architect | Deployment manifests and environment composition |
| `docs` | Agile PM | ADRs, roadmap, architecture, runbooks, milestones |

## Constraints

- **No ad-hoc root folders** — new top-level directories require an ADR
- **Shared types live in `packages/contracts`** — never duplicate type definitions
- **Design tokens live in `packages/ui/tokens`** — consumed by all frontend apps
- **All state management in Zustand** — no Redux, no Context API for global state
- **Backend is the source of truth** — frontend is a read model with client-side simulation
