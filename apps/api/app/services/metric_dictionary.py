"""
Smart Offer — Metric Dictionary (Python mirror)

Server-side copy of the metric dictionary for API consumption.
Provides /metrics/dictionary endpoint for the AI chatbot and external tools.
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class ThresholdDef(BaseModel):
    green: str
    amber: str
    red: str


class MetricDefinition(BaseModel):
    id: str
    label: str
    unit: str
    short_description: str
    rationale: str
    formula: str
    dashboard_tabs: list[str]
    thresholds: Optional[ThresholdDef] = None
    data_source: str


METRIC_DICTIONARY: list[MetricDefinition] = [
    # ── EXECUTIVE SUMMARY ──
    MetricDefinition(
        id="pipeline_total_revenue",
        label="Total Pipeline Revenue",
        unit="€",
        short_description="Gross value of all offers currently in the pipeline.",
        rationale="Measures the total addressable revenue across all active offers, regardless of win probability.",
        formula="SUM(totalAmount) for all offers with status ≠ REJECTED",
        dashboard_tabs=["Investor Presentation"],
        data_source="JiraOffer.totalAmount",
    ),
    MetricDefinition(
        id="weighted_pipeline",
        label="Weighted Pipeline",
        unit="€",
        short_description="Risk-adjusted pipeline revenue (revenue × probability).",
        rationale="More realistic than gross revenue because it discounts each offer by its win probability.",
        formula="SUM(weightedAmount) for all active offers",
        dashboard_tabs=["Investor Presentation"],
        data_source="JiraOffer.weightedAmount",
    ),
    MetricDefinition(
        id="average_margin",
        label="Average Margin",
        unit="%",
        short_description="Mean profit margin across all offers.",
        rationale="Indicates overall profitability health. Declining margins may signal aggressive pricing.",
        formula="AVG(margin) where margin IS NOT NULL",
        dashboard_tabs=["Investor Presentation", "Internal Board"],
        thresholds=ThresholdDef(green="≥ 20%", amber="10% – 20%", red="< 10%"),
        data_source="JiraOffer.margin",
    ),
    MetricDefinition(
        id="practice_count",
        label="Active Practices",
        unit="count",
        short_description="Number of distinct service practices in the pipeline.",
        rationale="Measures service diversification. More practices = lower concentration risk.",
        formula="COUNT(DISTINCT practice) where practice IS NOT NULL",
        dashboard_tabs=["Investor Presentation", "Practice Analytics"],
        data_source="JiraOffer.practice",
    ),
    MetricDefinition(
        id="country_count",
        label="Active Countries",
        unit="count",
        short_description="Number of distinct markets/countries in the pipeline.",
        rationale="Geographic diversification indicator.",
        formula="COUNT(DISTINCT country) where country IS NOT NULL",
        dashboard_tabs=["Investor Presentation"],
        data_source="JiraOffer.country",
    ),
    MetricDefinition(
        id="architect_count",
        label="Active Architects",
        unit="count",
        short_description="Total unique team members assigned to pipeline offers.",
        rationale="Shows team size and utilization potential.",
        formula="COUNT(DISTINCT architects from owners + participants)",
        dashboard_tabs=["Investor Presentation", "Allocation Heatmap"],
        data_source="JiraOffer.owner + JiraOffer.participants",
    ),
    MetricDefinition(
        id="scaling_score",
        label="Scaling Score",
        unit="score",
        short_description="Radar chart showing normalized scores across 6 dimensions.",
        rationale="Holistic assessment of organizational readiness across Revenue, Margin, Breadth, Geo, Team, Velocity.",
        formula="Each dimension normalized to 0–100 scale",
        dashboard_tabs=["Investor Presentation"],
        data_source="Derived from multiple fields",
    ),
    MetricDefinition(
        id="renewal_rate",
        label="Renewal Rate",
        unit="%",
        short_description="Percentage of offers that are contract renewals.",
        rationale="Higher renewal rates indicate strong client retention and predictable revenue.",
        formula="COUNT(renewal=true) / COUNT(all) × 100",
        dashboard_tabs=["Investor Presentation"],
        thresholds=ThresholdDef(green="40%–60%", amber="<30% or >70%", red="<15% or >85%"),
        data_source="JiraOffer.renewal",
    ),
    # ── FORECAST TIMELINE ──
    MetricDefinition(
        id="new_offers_weekly",
        label="New Offers (Weekly)",
        unit="count",
        short_description="Number of new offers entering the pipeline each week.",
        rationale="Measures business development velocity.",
        formula="COUNT(offers WHERE startDate in week)",
        dashboard_tabs=["Forecast Timeline"],
        data_source="JiraOffer.startDate",
    ),
    MetricDefinition(
        id="closing_offers_weekly",
        label="Closing Offers (Weekly)",
        unit="count",
        short_description="Number of offers reaching their end date each week.",
        rationale="Indicates delivery pressure and converging deadlines.",
        formula="COUNT(offers WHERE endDate in week)",
        dashboard_tabs=["Forecast Timeline"],
        data_source="JiraOffer.endDate",
    ),
    # ── ALLOCATION HEATMAP ──
    MetricDefinition(
        id="allocation_intensity",
        label="Allocation Intensity",
        unit="%",
        short_description="How heavily an architect is allocated in a given week.",
        rationale="Core capacity management metric showing utilization vs overload.",
        formula="SUM(weights for all offers in week) × 100",
        dashboard_tabs=["Allocation Heatmap"],
        thresholds=ThresholdDef(green="≤ 30%", amber="31%–90%", red="> 90%"),
        data_source="DailyAllocation.totalAllocation",
    ),
    MetricDefinition(
        id="overload_days",
        label="Overload Days",
        unit="days",
        short_description="Days where an architect exceeds 100% allocation.",
        rationale="Direct measure of over-commitment. Target: 0.",
        formula="COUNT(isOverloaded = true)",
        dashboard_tabs=["Allocation Heatmap", "Scenario Simulator"],
        thresholds=ThresholdDef(green="0 days", amber="1–5 days", red="> 5 days"),
        data_source="DailyAllocation.isOverloaded",
    ),
    # ── FINANCIAL EXPOSURE ──
    MetricDefinition(
        id="hhi_index",
        label="HHI (Herfindahl-Hirschman Index)",
        unit="score",
        short_description="Portfolio concentration index measuring revenue diversification.",
        rationale="Standard economic measure of market concentration.",
        formula="SUM((practice_share)² × 10,000)",
        dashboard_tabs=["Financial Exposure"],
        thresholds=ThresholdDef(green="< 1,500", amber="1,500–2,500", red="> 2,500"),
        data_source="Derived from totalAmount grouped by practice",
    ),
    # ── SCENARIO SIMULATOR ──
    MetricDefinition(
        id="sim_overload_delta",
        label="Overload Delta",
        unit="days",
        short_description="Change in overloaded days between baseline and simulated scenario.",
        rationale="Key outcome metric of a simulation. Negative = improvement.",
        formula="COUNT(sim overloaded) − COUNT(base overloaded)",
        dashboard_tabs=["Scenario Simulator"],
        thresholds=ThresholdDef(green="≤ 0", amber="+1 to +3", red="> +3"),
        data_source="DailyAllocation.isOverloaded (baseline vs simulated)",
    ),
    MetricDefinition(
        id="sim_revenue_at_risk",
        label="Revenue at Risk",
        unit="€",
        short_description="Total weighted revenue of offers affected by simulation actions.",
        rationale="Quantifies financial impact of proposed reallocation changes.",
        formula="SUM(weightedAmount) for REALLOCATE-touched offers",
        dashboard_tabs=["Scenario Simulator"],
        data_source="JiraOffer.weightedAmount (filtered by simulation actions)",
    ),
]
