"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useOfferStore } from "../../stores/useOfferStore";
import { DashboardInfo } from "../ui/DashboardInfo";

const COLORS = [
    "var(--chart-0)", "var(--chart-1)", "var(--chart-2)",
    "var(--chart-3)", "var(--chart-4)", "var(--chart-5)",
];

export function PracticeAnalytics() {
    const { offers, isLoading } = useOfferStore();

    const chartData = useMemo(() => {
        if (!offers.length) return [];

        const practiceMap = new Map<string, { count: number; revenue: number }>();

        for (const offer of offers) {
            const practice = offer.practice ?? "Unknown";
            const amount = offer.totalAmount ?? 0;
            const entry = practiceMap.get(practice) || { count: 0, revenue: 0 };
            entry.count += 1;
            entry.revenue += amount;
            practiceMap.set(practice, entry);
        }

        return Array.from(practiceMap.entries())
            .map(([name, data]) => ({ name, count: data.count, revenue: data.revenue }))
            .sort((a, b) => b.revenue - a.revenue);
    }, [offers]);

    if (isLoading) {
        return <div className="animate-pulse bg-[var(--color-bg)] rounded w-full h-full min-h-[400px]" />;
    }

    if (!chartData.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-[var(--color-muted)]">
                No offer data — upload a CSV to see practice analytics.
            </div>
        );
    }

    const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);

    return (
        <div className="flex flex-col h-full w-full">
            <h2 className="text-lg font-[var(--font-weight-bold)] text-[var(--color-primary)] mb-4">
                Practice Analytics — Revenue Share
            </h2>

            <DashboardInfo title="Understanding Practice Analytics">
                <p><strong>What it shows:</strong> A breakdown of your offer pipeline by service practice, showing both the number of offers and the total revenue for each practice area.</p>
                <p><strong>Donut chart:</strong> Each colored slice represents a practice. Larger slices indicate practices with more revenue in the pipeline. The center of the donut is left empty to emphasize proportion over absolute values.</p>
                <p><strong>Revenue table:</strong> The companion table on the right lists every practice with its offer count, total revenue (€), and percentage share of the total pipeline. This gives you exact numbers behind the visual distribution.</p>
                <p><strong>How to use it:</strong> Compare this view with the Financial Exposure tab. A practice with many small offers (high count, low revenue) tells a different story from one with few large offers (low count, high revenue). Use this to assess which practices generate the most value per offer and where to focus business development efforts.</p>
                <p><strong>Data source:</strong> Practice names are sourced from the Jira &quot;Custom field (Type of Service)&quot; field, which reflects the actual service classification assigned to each offer in your project management tool.</p>
            </DashboardInfo>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 w-full">
                {/* Donut Chart */}
                <div className="flex-1 min-h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={140}
                                paddingAngle={3}
                                dataKey="revenue"
                                nameKey="name"
                                animationBegin={0}
                                animationDuration={800}
                            >
                                {chartData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "var(--color-surface)",
                                    borderColor: "var(--color-border)",
                                    borderRadius: "var(--radius-card)",
                                    color: "var(--color-text)",
                                }}
                                formatter={(value) => [`€${(Number(value) / 1000000).toFixed(2)}M`, "Revenue"]}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Practice Breakdown Table */}
                <div className="w-full lg:w-[320px] overflow-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="text-left py-2 text-[var(--color-muted)] font-medium">Practice</th>
                                <th className="text-right py-2 text-[var(--color-muted)] font-medium">Offers</th>
                                <th className="text-right py-2 text-[var(--color-muted)] font-medium">Revenue</th>
                                <th className="text-right py-2 text-[var(--color-muted)] font-medium">Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chartData.map((row, idx) => (
                                <tr key={row.name} className="border-b border-[var(--color-border)] border-opacity-40">
                                    <td className="py-2 flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[idx % COLORS.length] }} />
                                        <span className="truncate max-w-[140px]">{row.name}</span>
                                    </td>
                                    <td className="text-right py-2 text-[var(--color-muted)]">{row.count}</td>
                                    <td className="text-right py-2 font-medium">€{(row.revenue / 1000000).toFixed(2)}M</td>
                                    <td className="text-right py-2 text-[var(--color-accent)] font-medium">
                                        {totalRevenue > 0 ? ((row.revenue / totalRevenue) * 100).toFixed(1) : 0}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
