"use client";

import React, { useEffect } from "react";
import { Users, TrendingUp, Percent, AlertTriangle } from "lucide-react";
import { motion, useSpring, useTransform } from "motion/react";
import { useOfferStore } from "../stores/useOfferStore";

import { DashboardInfo } from "./ui/DashboardInfo";

const AnimatedCounter = ({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) => {
    const spring = useSpring(0, { bounce: 0, duration: 800 });
    const display = useTransform(spring, (current) => {
        return `${prefix}${current.toFixed(decimals)}${suffix}`;
    });

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    return <motion.span>{display}</motion.span>;
};

export function ExecutiveKPIStrip() {
    const { kpis, isLoading } = useOfferStore();

    if (isLoading && !kpis) {
        return (
            <div className="flex gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md p-4 animate-pulse">
                        <div className="h-4 bg-[var(--color-muted)] opacity-20 rounded w-1/3 mb-4"></div>
                        <div className="h-8 bg-[var(--color-muted)] opacity-20 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    const { totalOffers = 0, totalRevenue = 0, avgMargin = 0, overloadedCount = 0 } = kpis || {};

    const cards = [
        {
            title: "Active Offers",
            value: totalOffers,
            icon: Users,
            color: "var(--color-accent)",
            description: "The total number of ongoing commercial opportunities currently tracked in the system.",
        },
        {
            title: "Total Target Revenue",
            value: totalRevenue,
            prefix: "€",
            suffix: "M",
            decimals: 1,
            icon: TrendingUp,
            color: "var(--color-success)",
            description: "The sum of all target revenue across all active pipeline offers.",
        },
        {
            title: "Average Margin",
            value: avgMargin,
            suffix: "%",
            decimals: 1,
            icon: Percent,
            color: "var(--color-warning)",
            description: "The calculated average profit margin across the entire active portfolio.",
        },
        {
            title: "Overloaded Architects",
            value: overloadedCount,
            icon: AlertTriangle,
            color: overloadedCount > 0 ? "var(--color-danger)" : "var(--color-muted)",
            isAlert: overloadedCount > 0,
            description: "The number of Solution Architects currently allocated beyond 100% capacity.",
        },
    ];

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {cards.map((card, idx) => (
                <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.3 }}
                    className={`flex-1 bg-[var(--color-surface)] border ${card.isAlert ? "border-[var(--color-danger)] shadow-sm shadow-[var(--color-danger)]" : "border-[var(--color-border)]"
                        } rounded-xl p-[var(--card-padding)] shadow-[var(--shadow-card)]`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-medium text-[var(--color-muted)]">{card.title}</h3>
                            <DashboardInfo title={card.title}>
                                <div className="space-y-2">
                                    <p className="text-xs text-[var(--color-text)] leading-relaxed">
                                        {card.description}
                                    </p>
                                </div>
                            </DashboardInfo>
                        </div>
                        <card.icon className="w-5 h-5" style={{ color: card.color }} />
                    </div>
                    <div className="text-3xl font-[var(--font-weight-bold)] text-[var(--color-text)]">
                        <AnimatedCounter
                            value={card.prefix === "€" ? card.value / 1000000 : card.value}
                            prefix={card.prefix}
                            suffix={card.suffix}
                            decimals={card.decimals}
                        />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
