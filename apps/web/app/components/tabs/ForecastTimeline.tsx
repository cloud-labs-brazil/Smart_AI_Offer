"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useOfferStore } from "../../stores/useOfferStore";

export function ForecastTimeline() {
    const { offers, isLoading } = useOfferStore();

    if (isLoading) {
        return <div className="animate-pulse bg-[var(--color-bg)] rounded w-full h-full min-h-[400px]" />;
    }

    const dummyData = [
        { date: "Day 1", count: 12 },
        { date: "Day 2", count: 20 },
        { date: "Day 3", count: 18 },
        { date: "Day 4", count: 27 },
        { date: "Day 5", count: 19 },
        { date: "Day 6", count: 32 },
        { date: "Day 7", count: 40 },
    ];

    return (
        <div className="flex flex-col h-full w-full">
            <h2 className="text-lg font-[var(--font-weight-bold)] text-[var(--color-primary)] mb-4">60-Day Forecast Timeline</h2>
            <div className="flex-1 w-full min-h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dummyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                        <XAxis dataKey="date" stroke="var(--color-muted)" tick={{ fontSize: 12 }} />
                        <YAxis stroke="var(--color-muted)" tick={{ fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", borderRadius: "var(--radius-card)" }}
                            itemStyle={{ color: "var(--color-text)" }}
                        />
                        <ReferenceLine y={25} label="Capacity Limit" stroke="var(--color-danger)" strokeDasharray="3 3" />
                        <Area type="monotone" dataKey="count" stroke="var(--color-accent)" fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
