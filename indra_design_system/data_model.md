# Data Model — Jira Allocation Intelligence Platform

## Core Entities

### JiraOffer
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Jira issue key (e.g. PROJ-123) |
| `summary` | string | Offer title / description |
| `owner` | string | Primary responsible architect |
| `participants` | string[] | Up to 14 additional participants |
| `practice` | string | Business practice / DN (`Custom field (Type of Service)`) |
| `value` | number | Financial value (BRL or USD) |
| `startDate` | string | ISO-8601 start date |
| `endDate` | string | ISO-8601 end date |
| `status` | string | Jira workflow status |

### DailyAllocation
| Field | Type | Description |
|-------|------|-------------|
| `architectName` | string | Architect being allocated |
| `date` | string | ISO-8601 date (daily granularity) |
| `totalAllocation` | number | Sum of all active allocations (1.0 = 100%) |
| `allocations` | AllocationDetail[] | Per-offer breakdown |
| `isOverloaded` | boolean | True when totalAllocation > 1.0 |

### AllocationDetail
| Field | Type | Description |
|-------|------|-------------|
| `offerId` | string | Reference to JiraOffer.id |
| `role` | 'OWNER' \| 'PARTICIPANT' | Role in the offer |
| `weight` | number | Allocation weight (owner=1.0, participant=0.1 default) |

## Relationships
```
JiraOffer 1 ──── N AllocationDetail N ──── 1 Architect
                        │
                  DailyAllocation (pre-computed daily aggregate)
```

## Allocation Rules
- Owner default weight: **100%** (1.0)
- Participant default weight: **10%** (0.1)
- If same person is owner AND participant in same offer → treated as OWNER only
- Daily expansion: each offer generates one allocation record per day in its date range
- Overload threshold: totalAllocation > 1.0 (100%)

## State Management (Zustand)
- `dataStore`: offers, dailyAllocations, cross-filtering (selectedArchitect, selectedPractice)
- `simulationStore`: scenario copy for what-if analysis
- `themeStore`: active visual mode and design tokens
