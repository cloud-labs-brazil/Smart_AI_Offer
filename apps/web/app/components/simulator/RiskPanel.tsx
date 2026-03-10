"use client";

import React, { useMemo } from "react";
import { AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useOfferStore } from "../../stores/useOfferStore";
import { DashboardInfo } from "../ui/DashboardInfo";

interface RiskItem {
    severity: "critical" | "warning" | "info";
    title: string;
    detail: string;
}

export function RiskPanel() {
    const { offers, allocations } = useOfferStore();

    const risks = useMemo<RiskItem[]>(() => {
        const items: RiskItem[] = [];

        // 1. Overloaded architects
        const overloaded = allocations.filter((allocation) => allocation.totalAllocation > 1.0);
        if (overloaded.length > 0) {
            const names = overloaded
                .map((allocation) => allocation.architectName)
                .filter((v, i, arr) => arr.indexOf(v) === i)
                .slice(0, 3);
            items.push({
                severity: "critical",
                title: `${overloaded.length} Overloaded Allocation${overloaded.length > 1 ? "s" : ""}`,
                detail: `${names.join(", ")}${overloaded.length > 3 ? ` +${overloaded.length - 3} more` : ""} exceed 100% capacity`,
            });
        }

        // 2. Offers expiring within 30 days
        const now = new Date();
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const expiring = offers.filter((offer) => {
            const ed = offer.endDate;
            if (!ed) return false;
            const endDate = new Date(ed);
            return endDate > now && endDate <= thirtyDays;
        });
        if (expiring.length > 0) {
            items.push({
                severity: "warning",
                title: `${expiring.length} Offer${expiring.length > 1 ? "s" : ""} Expiring Soon`,
                detail: `Ending within 30 days without confirmed renewal`,
            });
        }

        // 3. High concentration risk (HHI)
        const practiceRev = new Map<string, number>();
        let grandTotal = 0;
        for (const offer of offers) {
            const practice = offer.practice ?? "Unknown";
            const amount = offer.totalAmount ?? 0;
            practiceRev.set(practice, (practiceRev.get(practice) || 0) + amount);
            grandTotal += amount;
        }
        if (grandTotal > 0) {
            let hhi = 0;
            for (const [, amt] of practiceRev) {
                const share = (amt / grandTotal) * 100;
                hhi += share * share;
            }
            if (hhi >= 2500) {
                items.push({
                    severity: "warning",
                    title: "High Revenue Concentration",
                    detail: `HHI ${Math.round(hhi).toLocaleString()} — portfolio is concentrated in few practices`,
                });
            }
        }

        // 4. Low-margin offers
        const lowMargin = offers.filter((offer) => (offer.margin ?? 0) < 10 && (offer.margin ?? 0) > 0);
        if (lowMargin.length > 0) {
            items.push({
                severity: "info",
                title: `${lowMargin.length} Low-Margin Offer${lowMargin.length > 1 ? "s" : ""}`,
                detail: "Offers with margins below 10% may need pricing review",
            });
        }

        return items;
    }, [offers, allocations]);

    const severityConfig = {
        critical: { icon: AlertTriangle, color: "var(--color-danger)" },
        warning: { icon: AlertTriangle, color: "var(--color-warning)" },
        info: { icon: CheckCircle2, color: "var(--color-accent)" },
    };

    return (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card)] flex flex-col p-4">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--color-border)]">
                <ShieldAlert className="w-4 h-4 text-[var(--color-warning)]" />
                <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-[var(--font-weight-bold)] text-[var(--color-primary)]">
                        Risk Factors
                    </h2>
                    <DashboardInfo title="Risk Factors">
                        <div className="space-y-2">
                            <p className="text-xs text-[var(--color-text)] leading-relaxed">
                                Highlights critical active risks in your commercial portfolio, such as overloaded solution architects, imminent expiring offers, high revenue concentration, and low-margin deals.
                            </p>
                            <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                                Focus attention here to proactively mitigate compliance, pricing, or resourcing risks.
                            </p>
                        </div>
                    </DashboardInfo>
                </div>
                {risks.length > 0 && (
                    <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-[var(--color-danger)] text-white font-medium">
                        {risks.length}
                    </span>
                )}
            </div>

            {risks.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-[var(--color-success)]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>No active risk factors detected</span>
                </div>
            ) : (
                <ul className="space-y-3">
                    {risks.map((risk, idx) => {
                        const config = severityConfig[risk.severity];
                        const Icon = config.icon;
                        return (
                            <li key={idx} className="flex gap-3 items-start">
                                <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: config.color }} />
                                <div>
                                    <p className="text-sm font-medium text-[var(--color-text)] leading-tight">{risk.title}</p>
                                    <p className="text-xs text-[var(--color-muted)] mt-0.5">{risk.detail}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
