"use client";

import React, { useMemo } from "react";
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell
} from "recharts";
import { useOfferStore } from "../../stores/useOfferStore";
import { TrendingUp, Users, Target, Globe2, Layers, Percent } from "lucide-react";
import { DashboardInfo } from "../ui/DashboardInfo";

const COLORS = [
    "var(--chart-0)", "var(--chart-1)", "var(--chart-2)",
    "var(--chart-3)", "var(--chart-4)", "var(--chart-5)",
];

export function InvestorPresentation() {
    const { offers, allocations, isLoading } = useOfferStore();

    const metrics = useMemo(() => {
        if (!offers.length) return null;

        const totalRev = offers.reduce((sum, offer) => sum + (offer.totalAmount ?? 0), 0);
        const avgMargin = offers.reduce((sum, offer) => sum + (offer.margin ?? 0), 0) / offers.length;

        // Practice diversification
        const practices = new Set(offers.map((offer) => offer.practice).filter(Boolean));

        // Country spread
        const countries = new Set(offers.map((offer) => offer.country).filter(Boolean));

        // Active architects
        const architects = new Set(allocations.map((allocation) => allocation.architectName));

        // Weighted pipeline
        const weightedPipeline = offers.reduce((sum, offer) => sum + (offer.weightedAmount ?? 0), 0);

        // Renewal rate
        const renewals = offers.filter((offer) => offer.renewal === true).length;
        const renewalRate = offers.length > 0 ? (renewals / offers.length) * 100 : 0;

        // Radar data — normalize each dimension to 0–100
        const radarData = [
            { metric: "Revenue Scale", value: Math.min((totalRev / 50000000) * 100, 100) },
            { metric: "Margin Health", value: Math.min(avgMargin * 3, 100) },
            { metric: "Practice Diversity", value: Math.min(practices.size * 20, 100) },
            { metric: "Geo Spread", value: Math.min(countries.size * 25, 100) },
            { metric: "Team Scale", value: Math.min(architects.size * 10, 100) },
            { metric: "Pipeline Strength", value: Math.min((weightedPipeline / 30000000) * 100, 100) },
        ];

        // Top countries bar data
        const countryMap = new Map<string, number>();
        for (const offer of offers) {
            const country = offer.country ?? "Unknown";
            const amount = offer.totalAmount ?? 0;
            countryMap.set(country, (countryMap.get(country) || 0) + amount);
        }
        const topCountries = Array.from(countryMap.entries())
            .map(([country, revenue]) => ({ country, revenue }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 6);

        return {
            totalRev, avgMargin, practiceCount: practices.size,
            countryCount: countries.size, architectCount: architects.size,
            weightedPipeline, renewalRate, radarData, topCountries,
        };
    }, [offers, allocations]);

    if (isLoading) {
        return <div className="animate-pulse bg-[var(--color-bg)] rounded w-full h-full min-h-[400px]" />;
    }

    if (!metrics) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-[var(--color-muted)]">
                No offer data — upload a CSV to see the investor presentation.
            </div>
        );
    }

    const summaryCards = [
        { icon: TrendingUp, label: "Total Revenue", value: `€${(metrics.totalRev / 1000000).toFixed(1)}M`, color: "var(--color-accent)" },
        { icon: Percent, label: "Avg Margin", value: `${metrics.avgMargin.toFixed(1)}%`, color: "var(--color-success)" },
        { icon: Layers, label: "Practices", value: String(metrics.practiceCount), color: "var(--chart-2)" },
        { icon: Globe2, label: "Countries", value: String(metrics.countryCount), color: "var(--chart-3)" },
        { icon: Users, label: "Architects", value: String(metrics.architectCount), color: "var(--chart-4)" },
        { icon: Target, label: "Weighted Pipeline", value: `€${(metrics.weightedPipeline / 1000000).toFixed(1)}M`, color: "var(--chart-1)" },
    ];

    return (
        <div className="flex flex-col h-full w-full gap-6">
            <h2 className="text-lg font-[var(--font-weight-bold)] text-[var(--color-primary)]">
                Investor Presentation — Executive Summary
            </h2>

            <DashboardInfo title="Understanding the Executive Summary">
                <p><strong>What it shows:</strong> A high-level executive view of the offer pipeline, designed for investor presentations and senior leadership reviews.</p>
                <p><strong>KPI cards (top row):</strong> Six key performance indicators: Total Revenue (gross pipeline value), Average Margin (profitability health), number of Practices (service diversification), Countries (geographic reach), Architects (team size), and Weighted Pipeline (risk-adjusted revenue considering win probability).</p>
                <p><strong>Scaling Score (radar chart):</strong> A hexagonal radar showing normalized scores (0–100) across six dimensions. A larger area means the organization scores well across all dimensions. Dents in the shape reveal specific areas needing improvement — e.g., a low &quot;Geo Spread&quot; score suggests the business is too geographically concentrated.</p>
                <p><strong>Revenue by Country (bar chart):</strong> Shows the top 6 countries by total pipeline revenue. Useful for identifying geographic dependencies and growth opportunities.</p>
                <p><strong>Renewal Rate (bottom bar):</strong> The percentage of offers that are renewals vs. net-new business. Higher renewal rates indicate strong client retention and predictable revenue.</p>
            </DashboardInfo>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {summaryCards.map((card) => (
                    <div key={card.label} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-3 text-center">
                        <card.icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: card.color }} />
                        <p className="text-xs text-[var(--color-muted)] mb-0.5">{card.label}</p>
                        <p className="text-lg font-[var(--font-weight-bold)] text-[var(--color-text)]">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="flex flex-col lg:flex-row gap-6 flex-1">
                {/* Radar Chart */}
                <div className="flex-1 min-h-[300px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-4">
                    <h3 className="text-sm font-medium text-[var(--color-muted)] mb-2">Scaling Score</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <RadarChart data={metrics.radarData}>
                            <PolarGrid stroke="var(--color-border)" />
                            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "var(--color-muted)" }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                            <Radar
                                name="Score"
                                dataKey="value"
                                stroke="var(--color-accent)"
                                fill="var(--color-accent)"
                                fillOpacity={0.25}
                                strokeWidth={2}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "var(--color-surface)",
                                    borderColor: "var(--color-border)",
                                    borderRadius: "var(--radius-card)",
                                    color: "var(--color-text)",
                                }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Geographic Revenue Bar */}
                <div className="flex-1 min-h-[300px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-4">
                    <h3 className="text-sm font-medium text-[var(--color-muted)] mb-2">Revenue by Country</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={metrics.topCountries} layout="vertical" margin={{ left: 10, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal vertical={false} />
                            <XAxis
                                type="number"
                                stroke="var(--color-muted)"
                                tick={{ fontSize: 11 }}
                                tickFormatter={(v) => `€${(v / 1000000).toFixed(1)}M`}
                            />
                            <YAxis
                                dataKey="country"
                                type="category"
                                stroke="var(--color-muted)"
                                tick={{ fontSize: 11 }}
                                width={80}
                            />
                            <Tooltip
                                cursor={{ fill: "transparent" }}
                                contentStyle={{
                                    backgroundColor: "var(--color-surface)",
                                    borderColor: "var(--color-border)",
                                    borderRadius: "var(--radius-card)",
                                    color: "var(--color-text)",
                                }}
                                formatter={(value) => [`€${(Number(value) / 1000000).toFixed(2)}M`, "Revenue"]}
                            />
                            <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                                {metrics.topCountries.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Renewal Rate Footer */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-sm">
                <Target className="w-4 h-4 text-[var(--color-accent)]" />
                <span className="text-[var(--color-muted)]">Renewal Rate:</span>
                <span className="font-[var(--font-weight-bold)] text-[var(--color-text)]">{metrics.renewalRate.toFixed(1)}%</span>
                <span className="text-[var(--color-muted)]">|</span>
                <span className="text-[var(--color-muted)]">Active Offers:</span>
                <span className="font-[var(--font-weight-bold)] text-[var(--color-text)]">{offers.length}</span>
            </div>
        </div>
    );
}
