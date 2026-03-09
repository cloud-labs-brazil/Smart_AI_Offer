# Rule 06 — UI/UX & Indra Design System

> **Scope:** Visual design, theme system, component standards, accessibility

---

## Brand Identity

- **Company:** Indra (indragroup.com) — global technology and consulting company
- **Subsidiaries:** Minsait (digital transformation), IndraMind (AI solutions)
- **Verticals:** Defence, Air Traffic, Space, Mobility, Energy, Transport, PA, ICT, Telecom, Finance, Health
- **Design Language:** Enterprise-grade, executive-focused, data-dense, analytically precise

## Theme System

The platform supports **5 visual themes**, switchable at runtime, persisted to `localStorage` under key `rsa-theme`.

| Theme | Font | Character |
|-------|------|-----------|
| McKinsey Minimal | Inter | Clean, corporate white — default |
| CFO Dark Premium | Outfit | Dark mode, gold accents — Bloomberg Terminal feel |
| Big Tech SaaS | Plus Jakarta Sans | Modern indigo — SaaS dashboard |
| War Room Mode | JetBrains Mono | Terminal green-on-black — operations center |
| Institutional Clean | Roboto | Standard blue — corporate presentations |

### Token Structure

Each theme provides these CSS variable groups:

| Token Group | Variables |
|-------------|----------|
| **Colors** | `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-primary`, `--color-accent`, `--color-border`, `--color-danger`, `--color-warning`, `--color-success` |
| **Charts** | `--chart-0` through `--chart-5` |
| **Typography** | `--font-family`, `--font-weight-normal`, `--font-weight-bold`, `--letter-spacing` |
| **Spacing** | `--card-padding`, `--grid-gap` |
| **Surface** | `--radius-card`, `--shadow-card` |

### Font Loading

- Google Fonts loaded lazily via `<link>` injection in `ThemeProvider.tsx`
- Only loaded once per font family per session
- Does not block initial render
- CDN: `fonts.googleapis.com`

## Layout

- **Grid:** 3:1 ratio (main content : sidebar)
- **Left column (3/4):** Tabbed dashboard views
- **Right column (1/4):** Scenario Simulator + Risk Panel
- **Header:** Theme switcher + page-level controls

## Dashboard Tabs

| Tab | Component | Description |
|-----|-----------|-------------|
| Allocation | `AllocationHeatmap` | 21-day heatmap grid (D3) |
| Forecast | `ForecastTimeline` | Area chart with capacity line (Recharts) |
| Financial | `FinancialExposure` | Horizontal bar + HHI index (Recharts) |
| Practice | `PracticeAnalytics` | Revenue pie chart by practice (Recharts) |
| Investor | `InvestorPresentation` | Scaling score + practice share |
| Board | `InternalBoard` | Offer multiplicity + alerts |
| Admin | `JiraApiSettings` | API configuration + sync settings |

## Animation Standards

- All tab transitions: Framer Motion (`motion/react`)
- Enter: `fade-in` + `slide-in-from-bottom-2`
- Tab switch: `opacity: 0, x: -10` → `opacity: 1, x: 0`
- Duration: 200–300ms
- Easing: `ease-out`

## Component Standards

- Every component has a TypeScript props interface
- Every interactive component has loading, error, and empty states
- Icons: Lucide React exclusively
- CSS: Tailwind utilities + CSS variables from active theme
- No inline styles except for dynamic D3 rendering
- All chart components support PNG/JSON export via `chartExport.ts`

## Accessibility

- Semantic HTML5 elements
- ARIA labels on interactive elements
- Keyboard navigation for tab system
- Color contrast: WCAG AA minimum
- Focus indicators visible in all themes
