"use client";

import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import { useOfferStore } from "../../stores/useOfferStore";

export function FinancialExposure() {
    const { isLoading } = useOfferStore();

    if (isLoading) {
        return <div className="animate-pulse bg-[var(--color-bg)] rounded w-full h-full min-h-[400px]" />;
    }

    const dummyData = [
        { client: "Client A", amount: 4500000, color: "var(--chart-0)" },
        { client: "Client B", amount: 3200000, color: "var(--chart-1)" },
        { client: "Client C", amount: 2800000, color: "var(--chart-2)" },
        { client: "Client D", amount: 1500000, color: "var(--chart-3)" },
        { client: "Client E", amount: 900000, color: "var(--chart-4)" },
    ];

    return (
        <div className="flex flex-col h-full w-full">
            <h2 className="text-lg font-[var(--font-weight-bold)] text-[var(--color-primary)] mb-4">Financial Exposure & HHI Concentration</h2>
            <div className="flex-1 w-full min-h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dummyData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={true} vertical={false} />
                        <XAxis type="number" stroke="var(--color-muted)" tick={{ fontSize: 12 }} tickFormatter={(val) => `€${val / 1000000}M`} />
                        <YAxis dataKey="client" type="category" stroke="var(--color-muted)" tick={{ fontSize: 12 }} width={80} />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", borderRadius: "var(--radius-card)", color: 'var(--color-text)' }}
                        />
                        <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                            {dummyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
