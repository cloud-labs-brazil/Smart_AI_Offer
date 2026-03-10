# ADR-011: Zustand Store Normalization and Simulation State Strategy

**Status:** Accepted  
**Date:** 2026-03-09  
**Author:** Frontend Architecture Team

## Context

The frontend consumed backend payloads with mixed `snake_case` and `camelCase` fields. Components compensated with local casting/fallbacks, which increased `any` usage and duplicated mapping logic. Simulation features also required a predictable baseline/simulated state model across tabs.

## Decision

Use Zustand as the canonical client state layer with explicit normalization at ingress:

1. Normalize API payloads in store adapters (`snake_case` -> `camelCase`)
2. Store only typed domain objects (`JiraOffer`, `DailyAllocation`)
3. Keep simulation state isolated but derived from normalized base store data
4. Persist scenario actions as typed audit records for undo/export flows

## Consequences

Positive:

1. Removal of broad `any` casting in dashboard components
2. Clear ownership for data-shape transformations
3. More stable selectors and derived metric computations

Tradeoffs:

1. Slightly more code in store adapters
2. Adapter updates required when backend schemas evolve

## Alternatives Considered

1. Per-component normalization: rejected due duplication and drift risk.
2. Full server-side only normalization with no client adapters: rejected because simulation-specific client state still needs typed local contracts.
