"use client";

import React, { useState } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { ExecutiveKPIStrip } from "./ExecutiveKPIStrip";
import { Filter, Upload, Download, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Placeholder imports for tabs and simulator
import { AllocationHeatmap } from "./tabs/AllocationHeatmap";
import { ForecastTimeline } from "./tabs/ForecastTimeline";
import { FinancialExposure } from "./tabs/FinancialExposure";
import { PracticeAnalytics } from "./tabs/PracticeAnalytics";
import { InvestorPresentation } from "./tabs/InvestorPresentation";
import { InternalBoard } from "./tabs/InternalBoard";
import { AdminSettings } from "./tabs/AdminSettings";
import { ScenarioSimulator } from "./simulator/ScenarioSimulator";
import { RiskPanel } from "./simulator/RiskPanel";

const TABS = [
    { id: "heatmap", label: "Allocation Heatmap", component: AllocationHeatmap },
    { id: "forecast", label: "Forecast Timeline", component: ForecastTimeline },
    { id: "exposure", label: "Financial Exposure", component: FinancialExposure },
    { id: "practice", label: "Practice Analytics", component: PracticeAnalytics },
    { id: "investor", label: "Investor Presentation", component: InvestorPresentation },
    { id: "board", label: "Internal Board", component: InternalBoard },
    { id: "admin", label: "Admin Settings", component: AdminSettings },
];

export function AppShell() {
    const [activeTab, setActiveTab] = useState(TABS[0].id);

    const ActiveComponent = TABS.find((t) => t.id === activeTab)?.component || AllocationHeatmap;

    return (
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col font-sans transition-colors duration-300">
            {/* Header Bar */}
            <header className="sticky top-0 z-40 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm px-6 h-16 flex items-center justify-between">
                <div className="flex-1">
                    <h1 className="text-xl font-[var(--font-weight-bold)] text-[var(--color-primary)]">
                        Smart Offer <span className="text-[var(--color-accent)]">AI</span>
                    </h1>
                </div>

                {/* Center Navigation */}
                <nav className="hidden lg:flex gap-1 bg-[var(--color-bg)] p-1 rounded-lg border border-[var(--color-border)]">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id ? "text-[var(--color-primary)] bg-[var(--color-surface)] shadow-sm" : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                                }`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="active-tab"
                                    className="absolute inset-0 bg-[var(--color-surface)] rounded-md border border-[var(--color-border)] shadow-sm -z-10"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Right Controls */}
                <div className="flex-1 flex justify-end items-center gap-3">
                    <div className="hidden sm:flex gap-2 mr-4 border-r border-[var(--color-border)] pr-4">
                        <button className="p-2 text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors" aria-label="Filter">
                            <Filter className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors" aria-label="Upload">
                            <Upload className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors" aria-label="Download">
                            <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors" aria-label="Reset">
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                    <ThemeSwitcher />
                </div>
            </header>

            {/* Main 3:1 Grid Layout */}
            <div className="flex-1 p-6 max-w-[1920px] mx-auto w-full grid grid-cols-1 xl:grid-cols-4 gap-[var(--grid-gap)]">

                {/* Left Side: 75% Content Area */}
                <main className="xl:col-span-3 flex flex-col">
                    <ExecutiveKPIStrip />

                    <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-[var(--card-padding)] shadow-[var(--shadow-card)] relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className="h-full"
                            >
                                <ActiveComponent />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>

                {/* Right Side: 25% Sidebar */}
                <aside className="xl:col-span-1 flex flex-col gap-[var(--grid-gap)] w-full">
                    <ScenarioSimulator />
                    <RiskPanel />
                </aside>
            </div>
        </div>
    );
}
