"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useOfferStore } from "../../stores/useOfferStore";

export function PracticeAnalytics() {
    const { isLoading } = useOfferStore();

    if (isLoading) {
        return <div className="animate-pulse bg-[var(--color-bg)] rounded w-full h-full min-h-[400px]" />;
    }

    const dummyData = [
        { name: "Digital", value: 400 },
        { name: "Strategy", value: 300 },
        { name: "Operations", value: 300 },
        { name: "Organization", value: 200 },
    ];

    const COLORS = ["var(--chart-0)", "var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

    return (
        <div className="flex flex-col h-full w-full">
            <h2 className="text-lg font-[var(--font-weight-bold)] text-[var(--color-primary)] mb-4">Practice Analytics Share</h2>
            <div className="flex-1 w-full min-h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={dummyData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={140}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {dummyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", borderRadius: "var(--radius-card)" }}
                            itemStyle={{ color: "var(--color-text)" }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
