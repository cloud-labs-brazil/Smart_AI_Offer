"use client";

import React from "react";
import { useOfferStore } from "../../stores/useOfferStore";

export function InvestorPresentation() {
    const { isLoading } = useOfferStore();

    if (isLoading) {
        return <div className="animate-pulse bg-[var(--color-bg)] rounded w-full h-full min-h-[400px]" />;
    }

    return (
        <div className="flex flex-col h-full w-full">
            <h2 className="text-lg font-[var(--font-weight-bold)] text-[var(--color-primary)] mb-4">Investor Presentation</h2>
            <div className="flex-1 w-full flex items-center justify-center min-h-[400px]">
                <p className="text-[var(--color-muted)] text-center">
                    Holistic view of scaling score, practice share, and margins. Placeholder.
                </p>
            </div>
        </div>
    );
}
