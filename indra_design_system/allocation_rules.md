# Allocation Rules

## Overview

The allocation engine (`lib/engine/allocationEngine.ts`) computes daily allocation percentages for every architect across all active Jira offers.

## Rules

| Role | Default % | Override Allowed |
|------|-----------|------------------|
| Owner | 100% | Yes (simulation) |
| Participant | 10% | Yes (simulation) |

### Owner Allocation
- Every offer has exactly **one owner**.
- The owner is allocated **100% for each calendar day** between `startDate` and `endDate` (inclusive).

### Participant Allocation
- Offers may list zero or more **participants**.
- Each participant is allocated **10% per day**.
- If a person appears as both owner and participant on the same offer, they are treated as **owner only** (deduplication).

## Overload Detection
- A daily allocation is flagged as **overloaded** when `totalAllocation > 1.0` (i.e., > 100%).
- This occurs when an architect owns or participates in multiple concurrent offers.

## Percentage Overrides (Simulation Mode)
- The engine accepts an optional `percentageOverrides` map.
- Override keys follow the format: `{offerId}_{architectName}`.
- When an override exists, it replaces the default percentage for that offer-architect pair.
- Overrides do **not** change the role label — they only change the numeric allocation.

## Data Flow

```
CSV → parseJiraCSV() → JiraOffer[] → computeAllocations() → DailyAllocation[]
                                         ↑
                                    (optional)
                                 percentageOverrides
```

## Key Constraints
- Dates are expanded day-by-day (inclusive of start and end).
- Weekend/holiday filtering is **not** applied (all calendar days count).
- Allocations are aggregated per architect-date pair across all offers.
