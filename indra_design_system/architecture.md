# Resource Smart Allocation — Architecture Design Document

> **Version:** 1.0 · **Date:** 2026-03-04 · **Status:** Production-Ready

---

## 1. System Overview

The Resource Smart Allocation platform is designed to operate seamlessly in a full-stack capacity, but notably supports a **front-end only deviation** where it ingests Jira CSV exports and provides real-time allocation intelligence through an interactive dashboard without requiring a live backend for data storage. There is **no mandatory external database** needed for basic visualization — data is parsed client-side and held in browser memory via Zustand stores. Data persistence features utilize the python backend and PostgreSQL database.

```mermaid
graph TB
    subgraph External["External Systems"]
        JIRA["Jira Cloud<br/>CSV Export"]
        GEMINI["Google Gemini API<br/>gemini-3.1-pro-preview"]
    end

    subgraph Host["Host Machine · Windows 11"]
        subgraph NextJS["Next.js 15.5.12 · Port 3001 (dev) / 3000 (prod)"]
            SSR["Server-Side Rendering<br/>React 19.2.1"]
            API_CSV["API Route<br/>/api/csv"]
            STATIC["Static Assets<br/>CSS · JS · Fonts"]
        end
        CSV_DIR["CSV/ Directory<br/>Bundled Jira Export<br/>13,832 rows · 51 columns"]
    end

    subgraph Browser["User Browser"]
        REACT["React SPA<br/>Client Components"]
        STORES["Zustand Stores<br/>In-Memory State"]
        ENGINE["Allocation Engine<br/>Client-Side Compute"]
    end

    JIRA -->|"Manual Export .csv"| CSV_DIR
    CSV_DIR -->|"fs.readFile"| API_CSV
    API_CSV -->|"HTTP GET /api/csv<br/>text/csv"| REACT
    REACT -->|"parseJiraCSV()"| ENGINE
    ENGINE -->|"DailyAllocation[]"| STORES
    STORES -->|"React hooks"| REACT
    REACT -->|"HTTPS POST<br/>@google/genai SDK"| GEMINI
    GEMINI -->|"AI Response"| REACT

    style JIRA fill:#0052CC,color:#fff
    style GEMINI fill:#4285F4,color:#fff
    style NextJS fill:#000,color:#fff
    style Browser fill:#1a1a2e,color:#fff
```

---

## 2. Network Topology

| Connection | Protocol | Source | Destination | Port | Auth |
|---|---|---|---|---|---|
| Dev Server | HTTP | Browser | `localhost` | **3001** | None |
| Prod Server | HTTP | Browser | `localhost` | **3000** | None |
| CSV API | HTTP GET | Browser JS | Next.js `/api/csv` | Same origin | None |
| Gemini AI | HTTPS | Browser JS | `generativelanguage.googleapis.com` | 443 | API Key (`NEXT_PUBLIC_GEMINI_API_KEY`) |
| Jira API (future) | HTTPS | Server | `*.atlassian.net` | 443 | Bearer Token (not yet wired) |
| Docker Container | HTTP | Host | Container | 3000→3000 | None |

> [!IMPORTANT]
> The Gemini API key is exposed client-side via `NEXT_PUBLIC_GEMINI_API_KEY`. The Chatbot calls Gemini directly from the browser. For production, proxy through a server-side API route.

---

## 3. Technology Stack — Full Version Inventory

### Runtime

| Component | Version | Purpose |
|---|---|---|
| Node.js | 20 (Alpine) | Server runtime (Docker base image) |
| Next.js | 15.5.12 | Full-stack React framework |
| React | 19.2.1 | UI component library |
| React DOM | 19.2.1 | DOM renderer |
| TypeScript | 5.9.3 | Type safety |

### Production Dependencies

| Package | Version | Role |
|---|---|---|
| `@google/genai` | ^1.17.0 | Gemini AI SDK for chatbot |
| `zustand` | ^5.0.11 | Client state management |
| `recharts` | ^3.7.0 | Chart visualizations |
| `d3` | ^7.9.0 | Data-driven heatmap rendering |
| `date-fns` | ^4.1.0 | Date parsing and formatting |
| `motion` (Framer) | ^12.23.24 | UI animations and transitions |
| `lucide-react` | ^0.553.0 | Icon library |
| `react-markdown` | ^10.1.0 | Markdown rendering in chatbot |
| `clsx` | ^2.1.1 | Conditional CSS class merging |
| `tailwind-merge` | ^3.5.0 | Tailwind class conflict resolution |
| `class-variance-authority` | ^0.7.1 | Component variant system |
| `autoprefixer` | ^10.4.21 | CSS vendor prefixing |
| `postcss` | ^8.5.6 | CSS processing pipeline |

### Development Dependencies

| Package | Version | Role |
|---|---|---|
| `tailwindcss` | 4.1.11 | Utility-first CSS framework |
| `@tailwindcss/postcss` | 4.1.11 | PostCSS integration |
| `@tailwindcss/typography` | ^0.5.19 | Prose styling plugin |
| `vitest` | ^4.0.18 | Unit testing framework |
| `@vitest/coverage-v8` | ^4.0.18 | Code coverage via V8 |
| `happy-dom` | ^20.8.3 | DOM simulation for tests |
| `eslint` | 9.39.1 | Code linting |
| `eslint-config-next` | 16.0.8 | Next.js ESLint rules |
| `firebase-tools` | ^15.0.0 | Deploy tooling (optional) |
| `tw-animate-css` | ^1.4.0 | Animation utilities |

---

## 4. Application Architecture — Component Map

```mermaid
graph LR
    subgraph Page["app/page.tsx — Main Dashboard"]
        HEADER["Header.tsx"]
        KPI["ExecutiveKPIStrip.tsx"]
        TABS["Tab System"]
    end

    subgraph TabContent["Dashboard Tabs"]
        T1["AllocationHeatmap.tsx"]
        T2["ForecastTimeline.tsx"]
        T3["FinancialExposure.tsx"]
        T4["PracticeAnalytics.tsx"]
        T5["InvestorPresentation.tsx"]
        T6["InternalBoard.tsx"]
        T7["JiraApiSettings.tsx"]
    end

    subgraph Sidebar["Sidebar Modules"]
        SIM["ScenarioSimulator.tsx"]
        RISK["RiskPanel.tsx"]
        CSV["CSVUploader.tsx"]
    end

    subgraph AI["AI Layer"]
        CHAT["Chatbot.tsx"]
        AUDIO["LiveAudio.tsx"]
    end

    subgraph State["Zustand Stores"]
        DS["dataStore.ts"]
        SS["simulationStore.ts"]
        TS["themeStore.ts"]
    end

    subgraph Lib["Core Libraries"]
        PARSER["csvParser.ts<br/>RFC 4180"]
        ENGINE["allocationEngine.ts<br/>Daily Compute"]
        JIRA["jiraApi.ts<br/>Mock Integration"]
        EXPORT["chartExport.ts<br/>PNG/JSON Export"]
        LOG["logger.ts<br/>Structured Logging"]
    end

    TABS --> T1 & T2 & T3 & T4 & T5 & T6 & T7
    T1 & T2 & T3 & T4 & T5 & T6 --> DS
    SIM --> SS
    HEADER --> TS
    CSV --> PARSER --> ENGINE --> DS
    T7 --> JIRA
    T1 & T2 & T3 & T4 --> EXPORT
    CHAT --> DS

    style Page fill:#1e293b,color:#e2e8f0
    style State fill:#7c3aed,color:#fff
    style Lib fill:#059669,color:#fff
```

---

## 5. Data Flow — End to End

```mermaid
sequenceDiagram
    participant User as Browser
    participant Page as app/page.tsx
    participant API as /api/csv (Server)
    participant FS as CSV/ Directory
    participant Parser as csvParser.ts
    participant Engine as allocationEngine.ts
    participant Store as dataStore (Zustand)
    participant UI as Dashboard Components
    participant Gemini as Google Gemini API

    Note over User,Gemini: Startup — Auto-Load Flow
    Page->>API: GET /api/csv
    API->>FS: fs.readFile(first .csv)
    FS-->>API: Raw CSV (13,832 rows)
    API-->>Page: text/csv response
    Page->>Parser: parseJiraCSV(csvText)
    Parser-->>Page: JiraOffer[] (1,666 offers)
    Page->>Engine: computeAllocations(offers)
    Engine-->>Page: DailyAllocation[]
    Page->>Store: setData(offers, allocations)
    Store-->>UI: React re-render

    Note over User,Gemini: User Interaction — AI Query
    User->>UI: Types question in chatbot
    UI->>Store: Read offers + allocations context
    UI->>Gemini: HTTPS POST (prompt + context)
    Gemini-->>UI: AI response (markdown)
    UI-->>User: Rendered response

    Note over User,Gemini: Simulation Mode
    User->>UI: Toggle simulation ON
    UI->>Store: simulationStore.toggleSimulation(true)
    User->>UI: Adjust percentage override
    UI->>Engine: recompute(offers, overrides)
    Engine-->>Store: Updated DailyAllocation[]
    Store-->>UI: Re-render with simulated data
```

---

## 6. File Structure

```
Resource_Smart_Allocation/
├── app/
│   ├── page.tsx                    # Main dashboard (411 lines)
│   ├── layout.tsx                  # Root layout + ThemeProvider
│   ├── globals.css                 # Global styles
│   └── api/csv/
│       └── route.ts                # GET handler — serves bundled CSV
│
├── components/
│   ├── dashboard/
│   │   ├── AllocationHeatmap.tsx    # 21-day heatmap (table/chart/graph)
│   │   ├── CSVUploader.tsx         # Drag-and-drop CSV upload
│   │   ├── ExecutiveKPIStrip.tsx   # Revenue/architects/overload KPIs
│   │   ├── FinancialExposure.tsx   # Revenue distribution + HHI index
│   │   ├── ForecastTimeline.tsx    # Capacity vs demand curve
│   │   ├── Header.tsx              # Theme switcher + nav
│   │   ├── InternalBoard.tsx       # Offer multiplicity + alerts
│   │   ├── InvestorPresentation.tsx # Scaling score + practice share
│   │   ├── JiraApiSettings.tsx     # Jira API config panel
│   │   ├── PracticeAnalytics.tsx   # Revenue by practice pie chart
│   │   └── RiskPanel.tsx           # Overload detection sidebar
│   ├── ai/
│   │   ├── Chatbot.tsx             # Gemini-powered chatbot overlay
│   │   └── LiveAudio.tsx           # Voice interaction module
│   ├── simulator/
│   │   └── ScenarioSimulator.tsx   # What-if simulation controls
│   └── theme/
│       └── ThemeProvider.tsx        # CSS variable injection
│
├── store/
│   ├── dataStore.ts                # Offers, allocations, filters
│   ├── simulationStore.ts          # Simulation state + engine
│   └── themeStore.ts               # Active theme + switcher
│
├── lib/
│   ├── parser/
│   │   └── csvParser.ts            # RFC 4180 parser (263 lines)
│   ├── engine/
│   │   ├── allocationEngine.ts     # Daily allocation compute
│   │   └── types.ts                # JiraOffer, DailyAllocation interfaces
│   ├── integrations/
│   │   └── jiraApi.ts              # Jira REST API client (mock)
│   ├── chartExport.ts              # PNG/JSON export utility
│   ├── logger.ts                   # Structured logging
│   └── utils.ts                    # Shared utilities
│
├── themes/                         # 5 JSON theme files
│   ├── mckinsey_minimal.json
│   ├── cfo_dark_premium.json       # "Bloomberg Terminal"
│   ├── war_room_mode.json          # Neon green/black
│   ├── institutional_clean.json    # "Figma Studio"
│   └── big_tech_saas.json          # "Night Ops"
│
├── CSV/                            # Bundled Jira export data
├── docs/                           # Documentation
├── Dockerfile                      # Multi-stage (node:20-alpine)
├── docker-compose.yml              # Single-service compose
├── vitest.config.ts                # 118 tests, 85% coverage
├── next.config.ts                  # Standalone output mode
└── package.json                    # Dependency manifest
```

---

## 7. Store Architecture

```mermaid
graph TB
    subgraph dataStore["dataStore.ts"]
        D_OFFERS["offers: JiraOffer[]"]
        D_ALLOC["dailyAllocations: DailyAllocation[]"]
        D_LOADING["isLoading: boolean"]
        D_DATES["dateRange: {start, end}"]
        D_FILTER["selectedArchitect / selectedPractice"]
        D_DISC["discrepancyReport: DiscrepancyReport"]
    end

    subgraph simulationStore["simulationStore.ts"]
        S_MODE["isSimulationMode: boolean"]
        S_BASE["baseOffers / baseAllocations"]
        S_SIM["simulatedOffers / simulatedAllocations"]
        S_OVER["percentageOverrides: Map"]
        S_ACT["actions: SimulationAction[]"]
    end

    subgraph themeStore["themeStore.ts"]
        T_THEME["currentTheme: string"]
        T_LIST["available themes: 5"]
    end

    D_OFFERS -->|"Cross-filter"| D_FILTER
    S_BASE -->|"Deep clone"| S_SIM
    S_SIM -->|"recompute()"| S_SIM
    T_THEME -->|"CSS variables"| PROVIDER["ThemeProvider.tsx"]

    style dataStore fill:#7c3aed,color:#fff
    style simulationStore fill:#dc2626,color:#fff
    style themeStore fill:#059669,color:#fff
```

| Store | State Size | Update Frequency |
|---|---|---|
| `dataStore` | ~1,666 offers + ~35K daily allocations | On CSV load / filter change |
| `simulationStore` | Clone of dataStore + overrides | On simulation actions |
| `themeStore` | 1 active theme string | On theme switch |

---

## 8. Deployment Options

### Option A: Local Development (Current)

```
npm run dev → http://localhost:3001
```

### Option B: Docker Container

```mermaid
graph LR
    subgraph Docker["Docker Container · rsa-app"]
        NODE["node:20-alpine"]
        NEXT["Next.js Standalone<br/>server.js"]
    end
    
    HOST["Host :3000"] -->|"port mapping"| Docker
    Docker -->|"healthcheck every 30s"| NEXT

    style Docker fill:#2496ED,color:#fff
```

```bash
docker compose up -d
# → http://localhost:3000
# Health check: wget http://localhost:3000 every 30s
```

| Docker Config | Value |
|---|---|
| Base Image | `node:20-alpine` |
| Build | Multi-stage (builder → runner) |
| User | `nextjs:nodejs` (non-root, UID 1001) |
| Output | Next.js standalone mode |
| Port | 3000 |
| Restart | `unless-stopped` |
| Health Check | HTTP GET `/` every 30s, 3 retries |

### Option C: Firebase Hosting (configured but not deployed)

`firebase-tools` is installed as a dev dependency. No `firebase.json` found — would need configuration.

---

## 9. Environment Variables

| Variable | Scope | Required | Current Value |
|---|---|---|---|
| `GEMINI_API_KEY` | Server-side | Optional | `MY_GEMINI_API_KEY` (placeholder) |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Client-side | Optional (for AI chatbot) | `MY_GEMINI_API_KEY` (placeholder) |
| `APP_URL` | Server-side | Optional | `MY_APP_URL` (placeholder) |
| `NODE_ENV` | Runtime | Auto-set | `development` / `production` |
| `PORT` | Docker | Auto-set | `3000` |

---

## 10. Security Considerations

| Area | Status | Notes |
|---|---|---|
| Authentication | ❌ None | No auth layer — local/internal use |
| API Key Exposure | ⚠️ Client-side | Gemini key in `NEXT_PUBLIC_*` |
| CORS | ✅ Same-origin | API route on same Next.js server |
| Docker User | ✅ Non-root | UID 1001 `nextjs` user |
| TypeScript Strict | ⚠️ Relaxed | `ignoreBuildErrors: true` in config |
| Input Validation | ✅ Parser | CSV parser validates all field types |
| No Database | ✅ | No SQL injection surface |

---

## 11. Performance Characteristics

| Metric | Value |
|---|---|
| Production Bundle | 312 kB (page) |
| CSV Parse Time | ~200ms for 13,832 rows |
| Allocation Compute | ~150ms for 1,666 offers |
| Memory (browser) | ~50 MB with full dataset |
| Test Suite | 118 tests in 1.87s |
| Coverage | 85%+ statements, 80%+ branches |
| Cold Start (Docker) | ~3s |

---

## 12. Component Dependency Graph

```mermaid
graph TD
    PAGE["app/page.tsx"] --> HEADER["Header"]
    PAGE --> KPI["ExecutiveKPIStrip"]
    PAGE --> HEATMAP["AllocationHeatmap"]
    PAGE --> FORECAST["ForecastTimeline"]
    PAGE --> FINANCIAL["FinancialExposure"]
    PAGE --> PRACTICE["PracticeAnalytics"]
    PAGE --> INVESTOR["InvestorPresentation"]
    PAGE --> BOARD["InternalBoard"]
    PAGE --> ADMIN["JiraApiSettings"]
    PAGE --> RISK["RiskPanel"]
    PAGE --> CSV_UP["CSVUploader"]
    PAGE --> SIM["ScenarioSimulator"]
    PAGE --> CHAT["Chatbot"]

    HEADER --> themeStore
    CSV_UP --> csvParser
    csvParser --> allocationEngine
    allocationEngine --> dataStore
    HEATMAP --> dataStore
    HEATMAP --> chartExport
    FORECAST --> dataStore
    FORECAST --> chartExport
    FINANCIAL --> dataStore
    FINANCIAL --> chartExport
    PRACTICE --> dataStore
    PRACTICE --> chartExport
    INVESTOR --> dataStore
    BOARD --> dataStore
    KPI --> dataStore
    RISK --> dataStore
    SIM --> simulationStore
    simulationStore --> allocationEngine
    CHAT --> dataStore
    CHAT --> GoogleGenAI["@google/genai"]
    ADMIN --> jiraApi

    style dataStore fill:#7c3aed,color:#fff
    style simulationStore fill:#dc2626,color:#fff
    style themeStore fill:#059669,color:#fff
    style allocationEngine fill:#f59e0b,color:#000
    style csvParser fill:#f59e0b,color:#000
    style GoogleGenAI fill:#4285F4,color:#fff
```
