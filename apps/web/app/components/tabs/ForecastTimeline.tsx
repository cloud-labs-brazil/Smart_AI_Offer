"use client";

import React, { useMemo, useState } from "react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, Legend
} from "recharts";
import { useOfferStore } from "../../stores/useOfferStore";
import { DashboardInfo } from "../ui/DashboardInfo";

/** Compute rolling mean ± z*σ confidence bands */
function addConfidenceBands(
    data: Array<{ week: string; "New Offers": number; "Closing Offers": number }>,
    window = 4,
    z = 1.28 // 80% CI
) {
    return data.map((point, idx) => {
        const windowSlice = data.slice(Math.max(0, idx - window + 1), idx + 1);

        const newVals = windowSlice.map((d) => d["New Offers"]);
        const closeVals = windowSlice.map((d) => d["Closing Offers"]);

        const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
        const std = (arr: number[]) => {
            const m = mean(arr);
            return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
        };

        const newMean = mean(newVals);
        const newStd = std(newVals);
        const closeMean = mean(closeVals);
        const closeStd = std(closeVals);

        return {
            ...point,
            newUpper: Math.round((newMean + z * newStd) * 10) / 10,
            newLower: Math.max(0, Math.round((newMean - z * newStd) * 10) / 10),
            closeUpper: Math.round((closeMean + z * closeStd) * 10) / 10,
            closeLower: Math.max(0, Math.round((closeMean - z * closeStd) * 10) / 10),
            newTrend: Math.round(newMean * 10) / 10,
            closeTrend: Math.round(closeMean * 10) / 10,
        };
    });
}

export function ForecastTimeline() {
    const { offers, isLoading } = useOfferStore();
    const [showBands, setShowBands] = useState(true);

    const chartData = useMemo(() => {
        if (!offers.length) return [];

        const weekMap = new Map<string, { active: number; closing: number }>();

        for (const offer of offers) {
            const sd = offer.startDate;
            const ed = offer.endDate;

            if (sd) {
                const d = new Date(sd);
                const weekStart = new Date(d);
                weekStart.setDate(d.getDate() - d.getDay());
                const key = weekStart.toISOString().split("T")[0];
                const entry = weekMap.get(key) || { active: 0, closing: 0 };
                entry.active += 1;
                weekMap.set(key, entry);
            }

            if (ed) {
                const d = new Date(ed);
                const weekStart = new Date(d);
                weekStart.setDate(d.getDate() - d.getDay());
                const key = weekStart.toISOString().split("T")[0];
                const entry = weekMap.get(key) || { active: 0, closing: 0 };
                entry.closing += 1;
                weekMap.set(key, entry);
            }
        }

        const rawData = Array.from(weekMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-16)
            .map(([week, counts]) => ({
                week: new Date(week).toLocaleDateString("en", { month: "short", day: "numeric" }),
                "New Offers": counts.active,
                "Closing Offers": counts.closing,
            }));

        return addConfidenceBands(rawData);
    }, [offers]);

    if (isLoading) {
        return <div className="animate-pulse bg-[var(--color-bg)] rounded w-full h-full min-h-[400px]" />;
    }

    if (!chartData.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-[var(--color-muted)]">
                No offer data — upload a CSV to see the forecast timeline.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-[var(--font-weight-bold)] text-[var(--color-primary)]">
                    Offer Forecast Timeline
                </h2>
                <label className="inline-flex items-center gap-2 text-xs cursor-pointer select-none" style={{ color: "var(--color-muted)" }}>
                    <input
                        type="checkbox"
                        checked={showBands}
                        onChange={(e) => setShowBands(e.target.checked)}
                        className="accent-[var(--color-accent)]"
                    />
                    Show 80% Confidence Bands
                </label>
            </div>

            <DashboardInfo title="Understanding the Forecast Timeline">
                <p><strong>What it shows:</strong> A week-by-week timeline of offer activity in your pipeline, displayed as two stacked areas over time.</p>
                <p><strong>Blue area (New Offers):</strong> The number of new offers entering the pipeline each week (based on their start date). Rising peaks indicate periods of high demand or active business development.</p>
                <p><strong>Orange area (Closing Offers):</strong> The number of offers reaching their end/close date each week. Peaks here indicate heavy delivery deadlines converging.</p>
                <p><strong>Capacity line (dashed):</strong> The horizontal reference line shows the team&apos;s estimated weekly throughput. When the stacked areas rise above this line, the team may be overcommitted.</p>
                <p><strong>Confidence Bands (shaded):</strong> The light shaded regions around each area represent the <em>80% confidence interval</em> based on a 4-week rolling average ± 1.28 standard deviations. If actual values fall <strong>outside</strong> the band, the week is more volatile than typical — this may indicate an anomaly or seasonal pattern requiring attention.</p>
                <p><strong>How to use it:</strong> Look for &quot;bottleneck weeks&quot; where closing offers spike above capacity. Also watch for weeks where values break out of confidence bands — these outliers deserve investigation.</p>
            </DashboardInfo>

            <div className="flex-1 w-full min-h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="colorClosing" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                        <XAxis dataKey="week" stroke="var(--color-muted)" tick={{ fontSize: 11 }} />
                        <YAxis stroke="var(--color-muted)" tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--color-surface)",
                                borderColor: "var(--color-border)",
                                borderRadius: "var(--radius-card)",
                                color: "var(--color-text)",
                            }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <ReferenceLine y={10} label="Capacity" stroke="var(--color-danger)" strokeDasharray="3 3" />

                        {/* 80% Confidence band for New Offers */}
                        {showBands && (
                            <Area
                                type="monotone"
                                dataKey="newUpper"
                                stroke="none"
                                fill="var(--color-accent)"
                                fillOpacity={0.08}
                                name="New CI Upper"
                                legendType="none"
                            />
                        )}
                        {showBands && (
                            <Area
                                type="monotone"
                                dataKey="newLower"
                                stroke="none"
                                fill="var(--color-bg)"
                                fillOpacity={0.6}
                                name="New CI Lower"
                                legendType="none"
                            />
                        )}

                        {/* 80% Confidence band for Closing Offers */}
                        {showBands && (
                            <Area
                                type="monotone"
                                dataKey="closeUpper"
                                stroke="none"
                                fill="var(--chart-1)"
                                fillOpacity={0.08}
                                name="Close CI Upper"
                                legendType="none"
                            />
                        )}
                        {showBands && (
                            <Area
                                type="monotone"
                                dataKey="closeLower"
                                stroke="none"
                                fill="var(--color-bg)"
                                fillOpacity={0.6}
                                name="Close CI Lower"
                                legendType="none"
                            />
                        )}

                        {/* Main data series */}
                        <Area
                            type="monotone"
                            dataKey="New Offers"
                            stroke="var(--color-accent)"
                            fillOpacity={1}
                            fill="url(#colorNew)"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="Closing Offers"
                            stroke="var(--chart-1)"
                            fillOpacity={1}
                            fill="url(#colorClosing)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

