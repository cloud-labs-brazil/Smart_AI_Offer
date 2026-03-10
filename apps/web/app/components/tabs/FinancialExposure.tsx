"use client";

import React, { useMemo } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, LabelList
} from "recharts";
import { useOfferStore } from "../../stores/useOfferStore";
import { DashboardInfo } from "../ui/DashboardInfo";

const CHART_COLORS = [
    "var(--chart-0)", "var(--chart-1)", "var(--chart-2)",
    "var(--chart-3)", "var(--chart-4)", "var(--chart-5)",
];

export function FinancialExposure() {
    const { offers, isLoading } = useOfferStore();

    const { chartData, hhi } = useMemo(() => {
        if (!offers.length) return { chartData: [], hhi: 0 };

        // Aggregate total_amount by practice
        const practiceMap = new Map<string, number>();
        let grandTotal = 0;

        for (const offer of offers) {
            const practice = offer.practice ?? "Unknown";
            const amount = offer.totalAmount ?? 0;
            practiceMap.set(practice, (practiceMap.get(practice) || 0) + amount);
            grandTotal += amount;
        }

        const chartData = Array.from(practiceMap.entries())
            .map(([practice, amount]) => ({ practice, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 10);

        // Herfindahl-Hirschman Index (HHI)
        let hhi = 0;
        if (grandTotal > 0) {
            for (const [, amount] of practiceMap) {
                const share = (amount / grandTotal) * 100;
                hhi += share * share;
            }
        }

        return { chartData, hhi: Math.round(hhi) };
    }, [offers]);

    if (isLoading) {
        return <div className="animate-pulse bg-[var(--color-bg)] rounded w-full h-full min-h-[400px]" />;
    }

    if (!chartData.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-[var(--color-muted)]">
                No financial data — upload a CSV to see exposure analysis.
            </div>
        );
    }

    const hhiLabel = hhi < 1500 ? "Low Concentration" : hhi < 2500 ? "Moderate" : "High Concentration";
    const hhiColor = hhi < 1500 ? "var(--color-success)" : hhi < 2500 ? "var(--color-warning)" : "var(--color-danger)";

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-[var(--font-weight-bold)] text-[var(--color-primary)]">
                    Financial Exposure by Practice
                </h2>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium" style={{ backgroundColor: `color-mix(in srgb, ${hhiColor} 15%, transparent)`, color: hhiColor }}>
                    HHI: {hhi.toLocaleString()} — {hhiLabel}
                </div>
            </div>

            <DashboardInfo title="Understanding Financial Exposure">
                <p><strong>What it shows:</strong> The total financial value (€) of all offers currently in the pipeline, broken down by service practice. Each horizontal bar represents one practice area.</p>
                <p><strong>How to read the bars:</strong> Longer bars indicate higher financial concentration in that practice. The value inside each bar shows the amount in millions (e.g., €2.3M). Bars are sorted from the largest exposure at the top to the smallest at the bottom.</p>
                <p><strong>HHI (Herfindahl-Hirschman Index):</strong> The badge in the top-right corner measures portfolio concentration. <strong>Below 1,500</strong> = healthy diversification across practices. <strong>1,500–2,500</strong> = moderate concentration — consider expanding into underrepresented practices. <strong>Above 2,500</strong> = high concentration risk — revenue is too dependent on a small number of practices.</p>
                <p><strong>Decision guidance:</strong> If one practice dominates (e.g., &gt;50% of total), the team should actively pursue offers in other service areas to reduce risk. Ideally, no single practice should exceed 30–40% of total pipeline value.</p>
            </DashboardInfo>

            <div className="flex-1 w-full min-h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal vertical={false} />
                        <XAxis
                            type="number"
                            stroke="var(--color-muted)"
                            tick={{ fontSize: 11 }}
                            tickFormatter={(val) => `€${(val / 1000000).toFixed(1)}M`}
                        />
                        <YAxis
                            dataKey="practice"
                            type="category"
                            stroke="var(--color-muted)"
                            tick={{ fontSize: 11 }}
                            width={120}
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
                        <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                            <LabelList
                                dataKey="amount"
                                position="insideRight"
                                formatter={(label) => {
                                    const value = Number(label ?? 0);
                                    return value > 0 ? `€${(value / 1000000).toFixed(1)}M` : "";
                                }}
                                style={{
                                    fill: "#fff",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                                }}
                            />
                            {chartData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
