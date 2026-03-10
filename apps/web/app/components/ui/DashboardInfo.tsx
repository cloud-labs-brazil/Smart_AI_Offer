"use client";

import React, { useState } from "react";

interface DashboardInfoProps {
    title: string;
    children: React.ReactNode;
}

/**
 * Collapsible info panel that provides documentation about a dashboard tab.
 * Displays a small info icon button that expands to show explanatory text.
 */
export function DashboardInfo({ title, children }: DashboardInfoProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200"
                style={{
                    backgroundColor: isOpen
                        ? "color-mix(in srgb, var(--color-accent) 15%, transparent)"
                        : "color-mix(in srgb, var(--color-muted) 10%, transparent)",
                    color: isOpen ? "var(--color-accent)" : "var(--color-muted)",
                    border: `1px solid ${isOpen ? "var(--color-accent)" : "transparent"}`,
                }}
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                </svg>
                {isOpen ? "Hide Guide" : "How to Read This Dashboard"}
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                    }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {isOpen && (
                <div
                    className="mt-3 rounded-lg p-4 text-sm leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200"
                    style={{
                        backgroundColor: "color-mix(in srgb, var(--color-accent) 5%, var(--color-surface))",
                        border: "1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)",
                        color: "var(--color-text)",
                    }}
                >
                    <h4
                        className="text-sm font-bold mb-2 flex items-center gap-1.5"
                        style={{ color: "var(--color-accent)" }}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                        {title}
                    </h4>
                    <div className="space-y-2 text-[var(--color-text)]" style={{ opacity: 0.85 }}>
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
}
