"use client";

import React, { useEffect } from "react";
import { useOfferStore } from "../../stores/useOfferStore";

export function AllocationHeatmap() {
    const { allocations, isLoading } = useOfferStore();

    if (isLoading) {
        return <div className="animate-pulse bg-[var(--color-bg)] rounded w-full h-full min-h-[400px]" />;
    }

    if (!allocations.length) {
        return <div className="flex items-center justify-center min-h-[400px] text-[var(--color-muted)]">No data — upload a CSV to get started.</div>;
    }

    return (
        <div className="flex flex-col h-full w-full">
            <h2 className="text-lg font-[var(--font-weight-bold)] text-[var(--color-primary)] mb-4">Allocation Heatmap (D3)</h2>
            <div id="d3-heatmap-container" className="flex-1 w-full bg-[var(--color-bg)] rounded border border-[var(--color-border)] p-4">
                {/* D3 chart will mount here */}
                <p className="text-sm text-[var(--color-muted)] text-center mt-10">D3 Heatmap Placeholder...</p>
            </div>
        </div>
    );
}
