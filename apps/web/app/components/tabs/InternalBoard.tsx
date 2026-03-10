"use client";

import React, { useMemo, useState } from "react";
import { useOfferStore } from "../../stores/useOfferStore";
import { ArrowUpDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import { DashboardInfo } from "../ui/DashboardInfo";

type SortKey = "id" | "owner" | "practice" | "totalAmount" | "margin" | "status" | "participantCount";

export function InternalBoard() {
    const { offers, allocations, isLoading } = useOfferStore();
    const [sortKey, setSortKey] = useState<SortKey>("totalAmount");
    const [sortAsc, setSortAsc] = useState(false);

    const rows = useMemo(() => {
        if (!offers.length) return [];

        // Count how many unique architects each offer involves
        const offerArchitectMap = new Map<string, Set<string>>();
        for (const alloc of allocations) {
            const details = alloc.allocations;
            for (const det of details) {
                const offerId = det.offerId;
                const archName = alloc.architectName;
                if (!offerArchitectMap.has(offerId)) offerArchitectMap.set(offerId, new Set());
                offerArchitectMap.get(offerId)!.add(archName);
            }
        }

        return offers.map((offer) => ({
            id: offer.id,
            owner: offer.owner,
            practice: offer.practice ?? "—",
            status: offer.status ?? "—",
            totalAmount: offer.totalAmount ?? 0,
            margin: offer.margin ?? 0,
            participantCount: (offer.participants ?? []).length,
            architectCount: offerArchitectMap.get(offer.id)?.size ?? 0,
            startDate: offer.startDate ?? null,
            endDate: offer.endDate ?? null,
        }));
    }, [offers, allocations]);

    const sorted = useMemo(() => {
        const copy = [...rows];
        copy.sort((a, b) => {
            const aVal = a[sortKey] ?? 0;
            const bVal = b[sortKey] ?? 0;
            if (typeof aVal === "string" && typeof bVal === "string") {
                return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
        });
        return copy;
    }, [rows, sortKey, sortAsc]);

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortAsc(!sortAsc);
        } else {
            setSortKey(key);
            setSortAsc(false);
        }
    };

    if (isLoading) {
        return <div className="animate-pulse bg-[var(--color-bg)] rounded w-full h-full min-h-[400px]" />;
    }

    if (!rows.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-[var(--color-muted)]">
                No offer data — upload a CSV to see the internal board.
            </div>
        );
    }

    const renderSortHeader = (label: string, field: SortKey) => (
        <th
            key={field}
            className="px-3 py-2.5 text-left text-[var(--color-muted)] font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-[var(--color-primary)] transition-colors select-none"
            onClick={() => toggleSort(field)}
        >
            <span className="inline-flex items-center gap-1">
                {label}
                <ArrowUpDown className="w-3 h-3" style={{ opacity: sortKey === field ? 1 : 0.3 }} />
            </span>
        </th>
    );

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-[var(--font-weight-bold)] text-[var(--color-primary)]">
                    Internal Board — Offer Multiplicity
                </h2>
                <span className="text-sm text-[var(--color-muted)]">
                    {rows.length} offers
                </span>
            </div>

            <DashboardInfo title="Understanding the Internal Board">
                <p><strong>What it shows:</strong> A sortable table listing every offer in the pipeline with key metrics: owner, practice area, status, revenue, margin, team size, and timeline.</p>
                <p><strong>Sorting:</strong> Click any column header to sort by that field. Click again to reverse the order. The active sort column is highlighted with a bold arrow icon.</p>
                <p><strong>Margin colors:</strong> Green (&ge;20%) = healthy margin. Orange (10–20%) = acceptable but watch closely. Red (&lt;10%) = below target — needs attention before approval.</p>
                <p><strong>Status icons:</strong> A green checkmark (✓) indicates won/closed offers. A yellow triangle (⚠) flags offers at risk that need escalation.</p>
                <p><strong>How to use it:</strong> Use this table for governance reviews. Sort by revenue to prioritize high-value offers, or by margin to spot low-profitability deals early. The team count helps assess resource allocation — offers with many architects may need coordination attention.</p>
            </DashboardInfo>

            <div className="flex-1 w-full overflow-auto rounded-lg border border-[var(--color-border)]">
                <table className="w-full text-sm">
                    <thead className="bg-[var(--color-bg)] sticky top-0 z-10">
                        <tr className="border-b border-[var(--color-border)]">
                            {renderSortHeader("Offer ID", "id")}
                            {renderSortHeader("Owner", "owner")}
                            {renderSortHeader("Practice", "practice")}
                            {renderSortHeader("Status", "status")}
                            {renderSortHeader("Revenue", "totalAmount")}
                            {renderSortHeader("Margin", "margin")}
                            {renderSortHeader("Team", "participantCount")}
                            <th className="px-3 py-2.5 text-left text-[var(--color-muted)] font-medium text-xs uppercase tracking-wider">Dates</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((row, idx) => (
                            <tr
                                key={row.id || idx}
                                className="border-b border-[var(--color-border)] border-opacity-40 hover:bg-[var(--color-bg)] transition-colors"
                            >
                                <td className="px-3 py-2 font-medium text-[var(--color-accent)] whitespace-nowrap">{row.id}</td>
                                <td className="px-3 py-2 truncate max-w-[140px]">{row.owner}</td>
                                <td className="px-3 py-2">
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-bg)] border border-[var(--color-border)]">
                                        {row.practice}
                                    </span>
                                </td>
                                <td className="px-3 py-2">
                                    <span className="inline-flex items-center gap-1 text-xs">
                                        {row.status.toLowerCase().includes("won") || row.status.toLowerCase().includes("closed") ? (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)]" />
                                        ) : row.status.toLowerCase().includes("risk") ? (
                                            <AlertTriangle className="w-3.5 h-3.5 text-[var(--color-danger)]" />
                                        ) : null}
                                        {row.status}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-right font-medium whitespace-nowrap">
                                    €{(row.totalAmount / 1000000).toFixed(2)}M
                                </td>
                                <td className="px-3 py-2 text-right">
                                    <span style={{ color: (row.margin ?? 0) >= 20 ? "var(--color-success)" : (row.margin ?? 0) >= 10 ? "var(--color-warning)" : "var(--color-danger)" }}>
                                        {(row.margin ?? 0).toFixed(1)}%
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-center">
                                    <span className="text-xs">{row.participantCount + 1}</span>
                                </td>
                                <td className="px-3 py-2 text-xs text-[var(--color-muted)] whitespace-nowrap">
                                    {row.startDate ? new Date(row.startDate).toLocaleDateString("en", { month: "short", day: "numeric" }) : "—"}
                                    {" → "}
                                    {row.endDate ? new Date(row.endDate).toLocaleDateString("en", { month: "short", day: "numeric" }) : "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
