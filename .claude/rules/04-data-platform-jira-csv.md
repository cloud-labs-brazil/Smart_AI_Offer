# Rule 04 — Data Platform: Jira CSV Contract

> **Scope:** CSV ingestion, field mapping, validation, normalization

---

## Source Format

- **Provider:** Jira Cloud (Indra Brazil)
- **Export Type:** CSV with all fields
- **Encoding:** UTF-8
- **Compliance:** RFC 4180 (quoted fields, embedded commas, multiline)
- **Row Count:** ~14,000 records (current export)
- **Column Count:** 52

## Field Schema

| # | CSV Column Name | Domain Field | Type | Required | Notes |
|---|----------------|-------------|------|----------|-------|
| 1 | `Issue key` | offerId | string | ✅ | Primary identifier (e.g., OFBRA-2902) |
| 2 | `Issue id` | jiraId | number | ✅ | Jira internal numeric ID |
| 3 | `Assignee` | assignee / owner | string | ✅ | Lead architect (Jira login) |
| 4 | `Status` | status | string | ✅ | Workflow status |
| 5 | `Summary` | summary | string | ✅ | Offer title |
| 6 | `Custom field (Type of Service)` | typeOfService | string | ☐ | Service classification |
| 7 | `Component/s` | practice | string | ☐ | Business practice / DN |
| 8 | `Custom field (Offering Type)` | offeringType | string | ☐ | Offering classification |
| 9 | `Priority` | priority | string | ☐ | Jira priority level |
| 10 | `Custom field (Total amount (€) weighted)` | weightedAmount | number | ☐ | Revenue × probability |
| 11 | `Custom field (Type Business Opportunity)` | businessOpportunityType | string | ☐ | Opportunity classification |
| 12 | `Custom field (Country)` | country | string | ☐ | Geographic market |
| 13 | `Custom field (Market)` | market | string | ☐ | Market vertical |
| 14 | `Custom field (Market Manager)` | marketManager | string | ☐ | Market-level manager |
| 15 | `Custom field (DN Manager)` | dnManager | string | ✅ | Business developer |
| 16 | `Custom field (Operations Manager)` | operationsManager | string | ☐ | Operations lead |
| 17 | `Custom field (Renewal)` | renewal | boolean | ☐ | Yes/No → true/false |
| 18 | `Custom field (Código GEP)` | gepCode | string | ☐ | ERP code |
| 19 | `Custom field (Temporal Scope)` | temporalScope | string | ☐ | Duration/phase |
| 20 | `Custom field (Receipt of application)` | startDate | date | ☐ | Offer start (DD/MM/YY HH:mm) |
| 21 | `Custom field (Delivery Commitment)` | endDate | date | ☐ | Offer end (DD/MM/YY HH:mm) |
| 22–36 | `Custom field (Participants)` ×15 | participants[] | string[] | ☐ | Up to 15 secondary contributors |
| 37 | `Custom field (Total Amount (euros))` | totalAmount | number | ☐ | Full revenue value |
| 38 | `Custom field (Budg.Loc.Currency)` | localCurrencyBudget | number | ☐ | Local currency amount |
| 39 | `Custom field (Margin)` | margin | number | ☐ | Profit margin % |
| 40 | `Custom field (Offer Code (NG))` | offerCodeNG | string | ☐ | Next-gen offer code |
| 41 | `Custom field (Offer Description (NG))` | offerDescriptionNG | string | ☐ | Next-gen description |
| 42 | `Custom field (Transversal offer)` | transversal | boolean | ☐ | Yes/No → true/false |
| 43 | `Updated` | updatedAt | datetime | ☐ | Last Jira update |
| 44 | `Created` | createdAt | ✅ | datetime | Jira creation date |
| 45 | `Custom field (Proposal Due Date)` | proposalDueDate | date | ☐ | Bid deadline |
| 46 | `Custom field (Observations)` | observations | string | ☐ | Free-text notes |
| 47 | `Resolved` | resolvedAt | datetime | ☐ | Resolution date |
| 48 | `Custom field (Cloud – Amount Infrastructure €)` | cloudInfraAmount | number | ☐ | Cloud infra cost |
| 49 | `Custom field (Cloud – Amount Services €)` | cloudServicesAmount | number | ☐ | Cloud services cost |
| 50 | `Custom field (Type of Cloud Service)` | cloudServiceType | string | ☐ | Cloud service classification |
| 51 | `Custom field (Cloud Provider)` | cloudProvider | string | ☐ | AWS/Azure/GCP/Other |
| 52 | `Custom field (Others Cloud Providers)` | otherCloudProviders | string | ☐ | Additional providers |

## Normalization Rules

### Dates
- **Input format:** `DD/MM/YY HH:mm` (e.g., `31/12/27 13:18`)
- **Output format:** ISO-8601 (`2027-12-31T13:18:00Z`)
- **Null handling:** Empty dates → `null`, never fabricated

### Booleans
- `Yes` / `No` → `true` / `false`
- Empty → `null`

### Numbers
- Strip currency symbols and thousand separators
- Parse as float
- Empty → `null` (not 0)

### Participants
- 15 repeated columns merged into `string[]`
- Empty slots excluded
- Deduplicated (case-insensitive)
- If participant === assignee → exclude from participants (owner takes precedence)

### Names
- Jira logins must be resolved to human-readable display names
- Resolution table maintained in admin settings
- Unresolved logins displayed with `[unresolved]` prefix

## Validation Rules

| Rule | Severity | Action |
|------|----------|--------|
| Missing `Issue key` | CRITICAL | Reject row |
| Missing `Assignee` | CRITICAL | Reject row |
| Invalid date format | WARNING | Log + set to null |
| Negative financial amount | WARNING | Log + flag for review |
| Duplicate `Issue key` | ERROR | Keep latest by `Updated` |
| Start date > End date | ERROR | Log + flag for review |
| Unknown status value | INFO | Accept + log |
