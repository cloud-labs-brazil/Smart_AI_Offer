# ADR-010: Premium Dark UI Overhaul for Executive Dashboards

**Status:** Accepted  
**Date:** 2026-03-09  
**Author:** Frontend Architecture Team

## Context

The Smart Offer dashboards are consumed by executive stakeholders during portfolio and risk reviews. The previous UI baseline was functionally correct but visually plain, making dense data views harder to scan quickly.

## Decision

Adopt a premium dark-first visual direction with:

1. Glassmorphism cards and layered surfaces
2. Higher visual contrast for KPI hierarchy and alerts
3. Animated transitions for tab/content context switching
4. Standardized chart color semantics (risk, warning, success)
5. Inline `DashboardInfo` help popovers on major panels

## Consequences

Positive:

1. Faster executive readability for KPI and risk hotspots
2. More cohesive visual identity across tabs
3. Better onboarding via inline explainability content

Tradeoffs:

1. Higher CSS complexity and stricter token governance
2. More visual regression surface for UI tests

## Alternatives Considered

1. Keep existing neutral theme with incremental polish: rejected due limited differentiation and readability gains.
2. Light-mode-first redesign: rejected because current stakeholder preference and contrast behavior favored dark-first execution.
