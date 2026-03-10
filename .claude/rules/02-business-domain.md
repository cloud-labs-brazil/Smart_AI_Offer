# Rule 02 — Business Domain

> **Scope:** Data modeling, terminology, business logic

---

## Domain Glossary

| Term | Definition |
|------|-----------|
| **Offer** | A business opportunity tracked in Jira (issue type). Each offer has a unique Issue Key (e.g., OFBRA-2902). |
| **Assignee** | The lead architect responsible for the offer. Always maps to the `Assignee` Jira field. |
| **DN Manager** | The business developer leading the opportunity. Maps to `Custom field (DN Manager)`. |
| **Operations Manager** | The operations lead. Maps to `Custom field (Operations Manager)`. |
| **Market Manager** | The market-level manager. Maps to `Custom field (Market Manager)`. |
| **Participant** | A secondary contributor to an offer. Up to 15 participants per offer, stored in repeated `Custom field (Participants)` columns. |
| **Practice / DN** | The business practice or directorate. Derived from `Custom field (Type of Service)`. |
| **Component** | Client/account label from Jira `Component/s` field. |
| **Market** | The market vertical (Energy, Transport, PA, ICT, Defence, Telecom, Finance, Health). Maps to `Custom field (Market)`. |
| **Country** | The geographic market. Maps to `Custom field (Country)`. |
| **Allocation** | The computed daily workload percentage for an architect across all active offers. |
| **Overload** | When an architect's total daily allocation exceeds 100% (1.0). |
| **Offer Code (NG)** | Next-generation offer identifier from the ERP. Maps to `Custom field (Offer Code (NG))`. |
| **GEP Code** | Internal ERP code. Maps to `Custom field (Código GEP)`. |
| **Weighted Amount** | Revenue weighted by probability. Maps to `Custom field (Total amount (€) weighted)`. |
| **Total Amount** | Full revenue value. Maps to `Custom field (Total Amount (euros))`. |
| **Margin** | Profit margin percentage. Maps to `Custom field (Margin)`. |
| **Temporal Scope** | Duration/phase of the offer. Maps to `Custom field (Temporal Scope)`. |
| **Renewal** | Whether the offer is a renewal (Yes/No). Maps to `Custom field (Renewal)`. |
| **Transversal Offer** | Whether the offer spans multiple practices (Yes/No). Maps to `Custom field (Transversal offer)`. |
| **HHI** | Herfindahl-Hirschman Index — revenue concentration metric across practices. |

## Business Rules

1. **One owner per offer.** The `Assignee` field is always the single lead architect.
2. **Participant weight is 10%.** Default allocation weight for participants is `0.10`. This is configurable only by `SYSTEM_ADMIN`.
3. **Owner weight is 100%.** Default allocation weight for the owner is `1.0`.
4. **Deduplication.** If the same person appears as both owner and participant on the same offer, treat as owner only.
5. **Historical visibility.** Inactive users remain visible in historical reporting — never purge or hide them.
6. **Human-readable names.** Dashboards always display full names, never Jira login IDs.
7. **Date range.** Offers span from `Receipt of application` to `Delivery Commitment` (or `Proposal Due Date` as fallback).

## Offer Lifecycle

```
Created → Under Study → In Progress → Won / Lost / Cancelled
```

Workflow statuses from Jira are preserved as-is during ingestion.
