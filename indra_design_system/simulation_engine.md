# Simulation Engine

## Overview

The Simulation Engine enables "what-if" scenario analysis on resource allocations without modifying production data. It is built on the `useSimulationStore` (Zustand) and integrates with the allocation engine via `percentageOverrides`.

## Architecture

```
┌─────────────────────────┐
│   ScenarioSimulator UI  │
│   (React Component)     │
├─────────────────────────┤
│   useSimulationStore    │
│   (Zustand)             │
│   - simulatedOffers     │
│   - simulatedAllocations│
│   - baseAllocations     │
│   - percentageOverrides │
│   - actions[]           │
├─────────────────────────┤
│   computeAllocations()  │
│   (with overrides)      │
└─────────────────────────┘
```

## Supported Actions

### 1. Reallocate Offer
- Changes the owner of an offer to a different architect.
- Triggers full recomputation of allocations.
- Action type: `REALLOCATE`

### 2. Adjust Percentage
- Modifies the allocation percentage for a specific architect on a specific offer.
- Uses `percentageOverrides` map (key: `{offerId}::{architectName}`).
- Action type: `ADJUST_PERCENTAGE`

### 3. Add Architect (Capacity Planning)
- Adds a virtual architect to the simulation's offer pool.
- Does not change allocations until a reallocation is performed.
- Action type: `ADD_ARCHITECT`

## Baseline vs Scenario Comparison

The comparison panel displays 4 KPIs:

| Metric | Description |
|--------|-------------|
| Overload Days | Days where any architect exceeds 100% allocation |
| Revenue at Risk | Total value of offers that have at least one conflict day |
| Resource Pool | Count of unique architects in the simulation |
| Actions Applied | Number of simulation actions performed |

Each metric shows the current simulated value, the delta from baseline, and the baseline value.

## Export

`exportScenario()` generates a JSON report containing:
- All applied actions with timestamps
- Summary statistics (overload delta, revenue impact, architect count)
- The full list of simulated offers

## State Management

| State Key | Type | Purpose |
|-----------|------|---------|
| `simulatedOffers` | `JiraOffer[]` | Copy of offers with mutations applied |
| `simulatedAllocations` | `DailyAllocation[]` | Recomputed allocations |
| `baseAllocations` | `DailyAllocation[]` | Frozen baseline for comparison |
| `percentageOverrides` | `Map<string, number>` | Custom allocation percentages |
| `actions` | `SimulationAction[]` | Audit log of all mutations |
| `isSimulationMode` | `boolean` | Whether simulation is active |
