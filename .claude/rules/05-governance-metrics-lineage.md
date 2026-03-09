# Rule 05 — Governance, Metrics & Lineage

> **Scope:** Metric definitions, data lineage, audit trail, confidence scoring

---

## Metric Registry

Every metric displayed on a dashboard must be registered here with its definition, formula, source, and lineage.

### Executive KPIs

| Metric | Formula | Source | Unit |
|--------|---------|--------|------|
| Total Revenue | `SUM(offers.totalAmount)` | `Custom field (Total Amount (euros))` | EUR |
| Weighted Revenue | `SUM(offers.weightedAmount)` | `Custom field (Total amount (€) weighted)` | EUR |
| Active Offers | `COUNT(offers WHERE status IN active_statuses)` | `Status` | count |
| Active Architects | `COUNT(DISTINCT allocations.architectName)` | Computed | count |
| Overload Days | `COUNT(allocations WHERE totalAllocation > 1.0)` | Computed | days |
| Revenue at Risk | `SUM(offers.totalAmount WHERE has_overload_day)` | Computed | EUR |
| Average Margin | `AVG(offers.margin WHERE margin IS NOT NULL)` | `Custom field (Margin)` | % |
| HHI Concentration | `SUM((practice_share)^2)` for all practices | Computed | 0–10000 |

### Allocation Metrics

| Metric | Formula | Source |
|--------|---------|--------|
| Daily Allocation % | `SUM(weights) for architect on date` | Computed from rules |
| Owner Weight | `1.0` (default, configurable by SYSTEM_ADMIN) | Config |
| Participant Weight | `0.10` (default, configurable by SYSTEM_ADMIN) | Config |
| Overload Threshold | `totalAllocation > 1.0` | Fixed |

## Data Lineage Requirements

1. **Ingestion Hash:** Every CSV upload receives a SHA-256 hash of the raw file content
2. **Correlation ID:** Every API request carries `X-Correlation-ID` header, propagated through all service calls
3. **Checkpoint Log:** Backend maintains `checkpoint_log.json` with execution states and artifact hashes
4. **Audit Trail:** All simulation actions logged with timestamp, user, action type, and parameters
5. **Source Tracing:** Every KPI on a dashboard must link back to its source records (drill-down)

## Confidence Scoring

| Level | Criteria | Visual Indicator |
|-------|----------|-----------------|
| HIGH | All required fields present, validated, consistent | Green badge |
| MEDIUM | Some optional fields missing, no validation errors | Yellow badge |
| LOW | Missing required fields, date inconsistencies | Red badge + tooltip |
| UNVERIFIED | Discrepancy validation failed (>±1% threshold) | Red warning banner |

## Governance Rules

- **No metric without definition.** If a metric appears on a dashboard, it must exist in this registry.
- **No silent data mutations.** All transformations are logged and traceable.
- **Corrupted data isolation.** Low-confidence records are excluded from executive KPIs and flagged for review.
- **Participant weight is SYSTEM_ADMIN only.** The 0.10 default and any override is never exposed to non-admin roles.
