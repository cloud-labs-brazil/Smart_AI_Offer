/**
 * Smart Offer — Metric Dictionary
 *
 * Centralized reference of every KPI, chart, and metric used in the platform.
 * Each entry includes: id, label, unit, formula/rationale, which dashboard tab
 * it appears in, and recommended thresholds for RAG (Red-Amber-Green) alerting.
 *
 * This file serves as:
 *  1. Single source of truth for metric definitions
 *  2. Data source for the AI chatbot (AI-001)
 *  3. Code documentation for future developers
 *
 * @see components/ui/DashboardInfo.tsx — user-facing explanation panels
 */

export interface MetricDefinition {
    /** Unique metric ID (e.g., "pipeline_total_revenue") */
    id: string;
    /** Human-readable display name */
    label: string;
    /** Measurement unit: "€", "%", "count", "days", "score" */
    unit: string;
    /** Short description — 1 line */
    shortDescription: string;
    /** Full rationale: what it measures, why it matters */
    rationale: string;
    /** Calculation formula in plain text */
    formula: string;
    /** Which dashboard tab(s) display this metric */
    dashboardTabs: string[];
    /** RAG thresholds — when to worry */
    thresholds?: {
        green: string;
        amber: string;
        red: string;
    };
    /** Data source field(s) from JiraOffer or DailyAllocation */
    dataSource: string;
}

export const METRIC_DICTIONARY: MetricDefinition[] = [
    // ─────────────────────────────────────────────────────
    // EXECUTIVE SUMMARY (Investor Presentation)
    // ─────────────────────────────────────────────────────
    {
        id: "pipeline_total_revenue",
        label: "Total Pipeline Revenue",
        unit: "€",
        shortDescription: "Gross value of all offers currently in the pipeline.",
        rationale:
            "Measures the total addressable revenue across all active offers, regardless of win probability. Used for top-line sizing of the portfolio and headcount planning.",
        formula: "SUM(JiraOffer.totalAmount) for all offers with status ≠ REJECTED",
        dashboardTabs: ["Investor Presentation"],
        dataSource: "JiraOffer.totalAmount",
    },
    {
        id: "weighted_pipeline",
        label: "Weighted Pipeline",
        unit: "€",
        shortDescription: "Risk-adjusted pipeline revenue (revenue × probability).",
        rationale:
            "More realistic than gross revenue because it discounts each offer by its win probability. A €1M offer with 30% probability contributes €300k. Used for revenue forecasting and board reporting.",
        formula: "SUM(JiraOffer.weightedAmount) for all active offers",
        dashboardTabs: ["Investor Presentation"],
        dataSource: "JiraOffer.weightedAmount",
    },
    {
        id: "average_margin",
        label: "Average Margin",
        unit: "%",
        shortDescription: "Mean profit margin across all offers.",
        rationale:
            "Indicates overall profitability health. Declining margins may signal aggressive pricing or rising delivery costs. Target: ≥20% for healthy operations.",
        formula: "AVG(JiraOffer.margin) where margin IS NOT NULL",
        dashboardTabs: ["Investor Presentation", "Internal Board"],
        thresholds: {
            green: "≥ 20%",
            amber: "10% – 20%",
            red: "< 10%",
        },
        dataSource: "JiraOffer.margin",
    },
    {
        id: "practice_count",
        label: "Active Practices",
        unit: "count",
        shortDescription: "Number of distinct service practices in the pipeline.",
        rationale:
            "Measures service diversification. More practices = lower concentration risk. If only 1-2 practices have offers, the team is exposed to sector-specific downturns.",
        formula: "COUNT(DISTINCT JiraOffer.practice) where practice IS NOT NULL",
        dashboardTabs: ["Investor Presentation", "Practice Analytics"],
        dataSource: "JiraOffer.practice",
    },
    {
        id: "country_count",
        label: "Active Countries",
        unit: "count",
        shortDescription: "Number of distinct markets/countries in the pipeline.",
        rationale:
            "Geographic diversification indicator. Heavy concentration in one country creates regulatory and economic risk.",
        formula: "COUNT(DISTINCT JiraOffer.country) where country IS NOT NULL",
        dashboardTabs: ["Investor Presentation"],
        dataSource: "JiraOffer.country",
    },
    {
        id: "architect_count",
        label: "Active Architects",
        unit: "count",
        shortDescription: "Total unique team members assigned to pipeline offers.",
        rationale:
            "Shows team size and utilization potential. Compare with overload count to assess if more headcount is needed.",
        formula: "COUNT(DISTINCT architects from all offers including owners and participants)",
        dashboardTabs: ["Investor Presentation", "Allocation Heatmap"],
        dataSource: "JiraOffer.owner + JiraOffer.participants",
    },
    {
        id: "scaling_score",
        label: "Scaling Score",
        unit: "score",
        shortDescription: "Radar chart showing normalized scores across 6 dimensions.",
        rationale:
            "Provides a holistic assessment of organizational readiness. Dimensions: Revenue Scale, Margin Quality, Service Breadth, Geo Spread, Team Depth, Pipeline Velocity. A larger radar area = healthier organization. Dents reveal specific weaknesses.",
        formula: "Each dimension normalized to 0–100 scale based on internal benchmarks",
        dashboardTabs: ["Investor Presentation"],
        dataSource: "Derived from multiple JiraOffer fields",
    },
    {
        id: "renewal_rate",
        label: "Renewal Rate",
        unit: "%",
        shortDescription: "Percentage of offers that are contract renewals.",
        rationale:
            "Higher renewal rates indicate strong client retention and predictable revenue. New business is important for growth, but renewals provide stability. Target: 40-60% renewals for balanced growth.",
        formula: "COUNT(offers WHERE renewal = true) / COUNT(all offers) × 100",
        dashboardTabs: ["Investor Presentation"],
        thresholds: {
            green: "40% – 60% (balanced mix)",
            amber: "< 30% or > 70% (imbalanced)",
            red: "< 15% (acquisition-dependent) or > 85% (no growth)",
        },
        dataSource: "JiraOffer.renewal",
    },

    // ─────────────────────────────────────────────────────
    // FORECAST TIMELINE
    // ─────────────────────────────────────────────────────
    {
        id: "new_offers_weekly",
        label: "New Offers (Weekly)",
        unit: "count",
        shortDescription: "Number of new offers entering the pipeline each week.",
        rationale:
            "Measures business development velocity. Rising peaks = high demand periods. Consistent flow indicates healthy BD activity. Gaps signal pipeline drought needing attention.",
        formula: "COUNT(offers WHERE startDate falls within the week)",
        dashboardTabs: ["Forecast Timeline"],
        dataSource: "JiraOffer.startDate",
    },
    {
        id: "closing_offers_weekly",
        label: "Closing Offers (Weekly)",
        unit: "count",
        shortDescription: "Number of offers reaching their end/close date each week.",
        rationale:
            "Indicates delivery pressure. Peaks show converging deadlines that may overwhelm the team. Use to plan resource allocation proactively.",
        formula: "COUNT(offers WHERE endDate falls within the week)",
        dashboardTabs: ["Forecast Timeline"],
        dataSource: "JiraOffer.endDate",
    },
    {
        id: "capacity_line",
        label: "Capacity Line",
        unit: "count",
        shortDescription: "Horizontal reference showing estimated weekly team throughput.",
        rationale:
            "When the stacked areas (new + closing) rise above this line, the team is overcommitted. Acts as a visual threshold for go/no-go decisions on accepting new offers.",
        formula: "Static value based on team size × average offers per person per week",
        dashboardTabs: ["Forecast Timeline"],
        dataSource: "Configuration / derived from architect count",
    },

    // ─────────────────────────────────────────────────────
    // ALLOCATION HEATMAP
    // ─────────────────────────────────────────────────────
    {
        id: "allocation_intensity",
        label: "Allocation Intensity",
        unit: "%",
        shortDescription: "How heavily an architect is allocated in a given week.",
        rationale:
            "Core capacity management metric. Shows if team members are underutilized (wasted capacity) or overloaded (quality/burnout risk). The heatmap color code makes patterns instantly visible.",
        formula: "SUM(allocation weights for all offers assigned to that architect in that week) × 100",
        dashboardTabs: ["Allocation Heatmap"],
        thresholds: {
            green: "≤ 30% — has capacity for more work",
            amber: "31% – 90% — moderate to near-full capacity",
            red: "> 90% — overloaded, risk of burnout or quality issues",
        },
        dataSource: "DailyAllocation.totalAllocation",
    },
    {
        id: "overload_days",
        label: "Overload Days",
        unit: "days",
        shortDescription: "Number of days where an architect exceeds 100% allocation.",
        rationale:
            "Direct measure of over-commitment. Each overloaded day means someone is assigned to more work than one person can reasonably handle. Target: 0 overload days.",
        formula: "COUNT(DailyAllocation records WHERE isOverloaded = true)",
        dashboardTabs: ["Allocation Heatmap", "Scenario Simulator"],
        thresholds: {
            green: "0 days",
            amber: "1 – 5 days",
            red: "> 5 days",
        },
        dataSource: "DailyAllocation.isOverloaded",
    },

    // ─────────────────────────────────────────────────────
    // FINANCIAL EXPOSURE
    // ─────────────────────────────────────────────────────
    {
        id: "exposure_by_practice",
        label: "Financial Exposure by Practice",
        unit: "€",
        shortDescription: "Total pipeline value grouped by service practice.",
        rationale:
            "Reveals which practices carry the most financial weight. High concentration in one practice creates risk — if that service area loses demand, a large portion of revenue is at risk.",
        formula: "SUM(JiraOffer.totalAmount) GROUP BY JiraOffer.practice, ordered descending",
        dashboardTabs: ["Financial Exposure"],
        dataSource: "JiraOffer.totalAmount, JiraOffer.practice",
    },
    {
        id: "hhi_index",
        label: "HHI (Herfindahl-Hirschman Index)",
        unit: "score",
        shortDescription: "Portfolio concentration index measuring revenue diversification.",
        rationale:
            "Standard economic measure of market concentration, adapted for portfolio analysis. Calculated by summing the squares of each practice's revenue share. Lower = more diversified = healthier.",
        formula: "SUM((practice_revenue / total_revenue)² × 10,000) across all practices",
        dashboardTabs: ["Financial Exposure"],
        thresholds: {
            green: "< 1,500 — healthy diversification",
            amber: "1,500 – 2,500 — moderate concentration",
            red: "> 2,500 — high concentration risk",
        },
        dataSource: "Derived from JiraOffer.totalAmount grouped by practice",
    },

    // ─────────────────────────────────────────────────────
    // PRACTICE ANALYTICS
    // ─────────────────────────────────────────────────────
    {
        id: "practice_offer_count",
        label: "Offers per Practice",
        unit: "count",
        shortDescription: "Number of active offers in each service practice.",
        rationale:
            "Together with revenue, reveals value density. A practice with many small offers has different risk/ops characteristics than one with few large offers.",
        formula: "COUNT(JiraOffer) GROUP BY JiraOffer.practice",
        dashboardTabs: ["Practice Analytics"],
        dataSource: "JiraOffer.practice",
    },
    {
        id: "practice_revenue_share",
        label: "Practice Revenue Share",
        unit: "%",
        shortDescription: "Percentage of total pipeline revenue attributed to each practice.",
        rationale:
            "Helps assess which practices generate the most value. Ideally no single practice should exceed 30–40% of total pipeline value.",
        formula: "(practice_revenue / total_pipeline_revenue) × 100",
        dashboardTabs: ["Practice Analytics"],
        thresholds: {
            green: "10% – 30% (healthy share)",
            amber: "30% – 50% (becoming dominant)",
            red: "> 50% (over-concentrated)",
        },
        dataSource: "Derived from JiraOffer.totalAmount grouped by practice",
    },

    // ─────────────────────────────────────────────────────
    // INTERNAL BOARD
    // ─────────────────────────────────────────────────────
    {
        id: "offer_margin",
        label: "Offer Margin",
        unit: "%",
        shortDescription: "Profit margin for an individual offer.",
        rationale:
            "Critical profitability indicator at the offer level. Reviewed in governance meetings to ensure pricing discipline. Below-target margins may need renegotiation before approval.",
        formula: "JiraOffer.margin (direct from Jira field)",
        dashboardTabs: ["Internal Board"],
        thresholds: {
            green: "≥ 20%",
            amber: "10% – 20%",
            red: "< 10%",
        },
        dataSource: "JiraOffer.margin",
    },
    {
        id: "team_size",
        label: "Team Size (per offer)",
        unit: "count",
        shortDescription: "Number of architects assigned to an offer (owner + participants).",
        rationale:
            "Offers with many team members need more coordination. Very large teams on a single offer may indicate scope creep or a need to split the engagement.",
        formula: "1 (owner) + COUNT(JiraOffer.participants)",
        dashboardTabs: ["Internal Board"],
        dataSource: "JiraOffer.owner, JiraOffer.participants",
    },

    // ─────────────────────────────────────────────────────
    // SCENARIO SIMULATOR
    // ─────────────────────────────────────────────────────
    {
        id: "sim_overload_delta",
        label: "Overload Delta",
        unit: "days",
        shortDescription: "Change in overloaded days between baseline and simulated scenario.",
        rationale:
            "Key outcome metric of a simulation. Negative values (▼) mean the simulation reduces overload — a good outcome. Positive values (▲) mean the change makes things worse.",
        formula: "COUNT(simulated overloaded days) − COUNT(baseline overloaded days)",
        dashboardTabs: ["Scenario Simulator"],
        thresholds: {
            green: "≤ 0 (reduced or same overload)",
            amber: "+1 to +3 days (minor increase)",
            red: "> +3 days (significant worsening)",
        },
        dataSource: "DailyAllocation.isOverloaded (baseline vs simulated)",
    },
    {
        id: "sim_revenue_at_risk",
        label: "Revenue at Risk",
        unit: "€",
        shortDescription: "Total weighted revenue of offers affected by simulation actions.",
        rationale:
            "When offers are reassigned, their revenue is 'at risk' during the transition period. This metric quantifies the financial impact of proposed changes.",
        formula: "SUM(weightedAmount) for offers touched by REALLOCATE actions",
        dashboardTabs: ["Scenario Simulator"],
        dataSource: "JiraOffer.weightedAmount (filtered by simulation actions)",
    },
    {
        id: "sim_resource_pool",
        label: "Resource Pool",
        unit: "count",
        shortDescription: "Total unique architects in the simulated scenario.",
        rationale:
            "Includes both existing team members and any virtual architects added via simulation. Useful to compare team size changes needed to achieve target allocation levels.",
        formula: "COUNT(DISTINCT architectName from simulated allocations) + COUNT(ADD_ARCHITECT actions)",
        dashboardTabs: ["Scenario Simulator"],
        dataSource: "DailyAllocation.architectName + simulation actions",
    },
    {
        id: "sim_actions_applied",
        label: "Actions Applied",
        unit: "count",
        shortDescription: "Number of simulation actions in the current session.",
        rationale:
            "Helps track the complexity of a simulated scenario. Fewer actions with the same or better outcome = more elegant solution. Compare multiple scenarios by action count + outcome.",
        formula: "COUNT(simulation actions in the current session)",
        dashboardTabs: ["Scenario Simulator"],
        dataSource: "SimulationAction[]",
    },
];

/** Lookup a metric by its ID */
export function getMetric(id: string): MetricDefinition | undefined {
    return METRIC_DICTIONARY.find((m) => m.id === id);
}

/** Get all metrics for a specific dashboard tab */
export function getMetricsForTab(tab: string): MetricDefinition[] {
    return METRIC_DICTIONARY.filter((m) => m.dashboardTabs.includes(tab));
}
