"use client";

import React from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";

export function RiskPanel() {
    return (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card)] flex flex-col p-4">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--color-border)]">
                <ShieldAlert className="w-4 h-4 text-[var(--color-warning)]" />
                <h2 className="text-sm font-[var(--font-weight-bold)] text-[var(--color-primary)]">Top Risk Factors (Mock)</h2>
            </div>

            <ul className="space-y-3">
                <li className="flex gap-3 items-start">
                    <AlertTriangle className="w-4 h-4 text-[var(--color-danger)] shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-[var(--color-text)] leading-tight">Architect A Overloaded</p>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">Assigned to 14 concurrent offers (+140% capacity limit)</p>
                    </div>
                </li>
                <li className="flex gap-3 items-start">
                    <AlertTriangle className="w-4 h-4 text-[var(--color-warning)] shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-[var(--color-text)] leading-tight">Expiring Contracts</p>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">3 strategic offers end in &lt; 30 days without renewal pipelines</p>
                    </div>
                </li>
            </ul>
        </div>
    );
}
