# Rule 08 — Decision Intelligence

> **Scope:** AI features, explainability, confidence bands, anomaly detection

---

## AI Integration

### Gemini Chatbot
- **SDK:** `@google/genai` (v1.17+)
- **Model:** `gemini-3.1-pro-preview` (or latest available)
- **Invocation:** Client-side via `NEXT_PUBLIC_GEMINI_API_KEY`
- **Production plan:** Proxy through server-side API route to protect key
- **Context:** Chatbot receives offer data + allocation summary as context
- **Output:** Markdown-formatted responses rendered via `react-markdown`

### Capabilities
1. Natural-language querying of allocation data
2. "What if" scenario suggestions based on current overloads
3. Revenue and capacity trend analysis
4. Anomaly explanation

### Guardrails
- AI responses are advisory, never automate data mutations
- Responses include source reference indicators
- No PII in prompts beyond architect names (which are non-sensitive business data)
- Rate limiting: max 10 queries/minute per session

## Explainability Layer

Every KPI and metric displayed on a dashboard must support explainability:

| Level | Mechanism |
|-------|-----------|
| **L1 — Definition** | Tooltip showing metric name, formula, and unit |
| **L2 — Source** | Click to see source data (filtered table of contributing records) |
| **L3 — Lineage** | Trace to original CSV row, ingestion timestamp, and SHA-256 hash |
| **L4 — Confidence** | Badge showing data quality level (HIGH / MEDIUM / LOW / UNVERIFIED) |

## Confidence Bands

Confidence bands communicate data quality visually on charts and KPIs:

```
HIGH confidence:     Solid lines, full opacity
MEDIUM confidence:   Solid lines, slightly reduced opacity
LOW confidence:      Dashed lines, reduced opacity + warning tooltip
UNVERIFIED:          Excluded from charts, shown in separate "review needed" panel
```

### Calculation
- **Record completeness:** % of required fields present
- **Date range validity:** Start ≤ End, dates within reasonable bounds
- **Financial consistency:** Amount > 0, margin within 0–100%
- **Cross-reference validity:** Assignee exists, participants valid

## Anomaly Detection

### Rules-Based Anomalies

| Anomaly | Detection Rule | Severity |
|---------|---------------|----------|
| Architect overload spike | Daily allocation jumps > 200% in one day | HIGH |
| Revenue concentration | HHI > 2500 (highly concentrated) | MEDIUM |
| Stale offers | Status unchanged for > 90 days | LOW |
| Zero-value offers | Total amount = 0 EUR | MEDIUM |
| Orphan participants | Participant not assigned to any active offer | LOW |
| Date anomalies | Offers spanning > 3 years | HIGH |

### ML-Based Anomalies (Future)
- Allocation pattern deviation from 30-day rolling average
- Revenue forecasting outside 2σ confidence interval
- Cluster analysis for practice group anomalies

## Metric Dictionary Requirements

Every metric in the platform must have a dictionary entry containing:

```yaml
name: "Metric Display Name"
id: "metric_snake_case_id"
formula: "Mathematical formula or aggregation logic"
unit: "EUR | count | % | days | index"
source_fields: ["CSV column names used"]
refresh: "on_ingestion | computed | real_time"
owner: "Role responsible for this metric"
confidence: "How confidence is calculated for this metric"
dashboard: "Which tab(s) display this metric"
```
