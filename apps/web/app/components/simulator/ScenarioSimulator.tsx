"use client";

import React, { useMemo } from "react";
import { Play, RotateCcw, Activity, Undo2, Clock, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { useSimulationStore, useOverloadDelta, useRevenueAtRisk, useResourcePoolSize } from "../../stores/useSimulationStore";
import { useOfferStore } from "../../stores/useOfferStore";
import { DashboardInfo } from "../ui/DashboardInfo";

export function ScenarioSimulator() {
    const { isSimulationMode, startSimulation, resetSimulation, actions, undoLastAction, globalCloseRate, setGlobalCloseRate, globalHeadcountDelta, setGlobalHeadcountDelta, simulatedOffers } = useSimulationStore();
    const overloadDelta = useOverloadDelta();
    const revenueAtRisk = useRevenueAtRisk();
    const resourcePool = useResourcePoolSize();
    const { offers } = useOfferStore();

    const baselineRevenue = useMemo(() => {
        return offers.reduce((sum, o) => {
            if (o.weightedAmount != null) {
                return sum + o.weightedAmount;
            }
            return sum + (o.totalAmount ?? 0);
        }, 0);
    }, [offers]);

    const simulatedRevenue = useMemo(() => {
        return simulatedOffers.reduce((sum, o) => {
            return sum + (o.weightedAmount || 0);
        }, 0) * globalCloseRate;
    }, [simulatedOffers, globalCloseRate]);

    const chartData = [
        {
            name: "Revenue",
            Baseline: baselineRevenue,
            Simulated: simulatedRevenue,
        },
        {
            name: "Capacity",
            Baseline: resourcePool * 1000, // scaled for chart visibility, will format in tooltip
            Simulated: (resourcePool + globalHeadcountDelta) * 1000,
        }
    ];

    const typeBadgeColor: Record<string, string> = {
        REALLOCATE: "var(--color-accent)",
        ADJUST_PERCENTAGE: "var(--color-warning)",
        ADD_ARCHITECT: "var(--color-success)",
        SET_GLOBAL_CLOSE_RATE: "var(--color-primary)",
        SET_HEADCOUNT_DELTA: "var(--color-danger)"
    };

    const formatTime = (iso: string) => {
        try { return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
        catch { return "--:--"; }
    };

    return (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card)] flex flex-col overflow-hidden h-fit max-h-[600px]">
            <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg)] flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                    <div>
                        <h2 className="text-base font-[var(--font-weight-bold)] text-[var(--color-primary)]">Scenario Simulator</h2>
                        <p className="text-xs text-[var(--color-muted)]">&quot;What-If&quot; Planning Console</p>
                    </div>
                    <DashboardInfo title="Scenario Simulator">
                        <div className="space-y-2">
                            <p className="text-xs text-[var(--color-text)] leading-relaxed">
                                A sandbox environment to test <em>&quot;what-if&quot;</em> changes to your pipeline without altering live data.
                            </p>
                            <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                                Simulate global adjustments like altering win rates and team headcount capacity. Reallocate architects to observe real-time impacts on targeted revenue and resource pool constraints.
                            </p>
                        </div>
                    </DashboardInfo>
                </div>

                {!isSimulationMode ? (
                    <button
                        onClick={startSimulation}
                        className="flex items-center gap-1.5 bg-[var(--color-accent)] text-white px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        <Play className="w-4 h-4" /> Start
                    </button>
                ) : (
                    <button
                        onClick={resetSimulation}
                        className="flex items-center gap-1.5 border border-[var(--color-border)] text-[var(--color-text)] px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[var(--color-bg)] transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" /> Reset
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {!isSimulationMode ? (
                    <motion.div
                        key="inactive"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-8 flex flex-col items-center justify-center text-center text-[var(--color-muted)]"
                    >
                        <Activity className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-sm font-medium mb-1">Simulation Mode Inactive</p>
                        <p className="text-xs max-w-[200px]">Click Start to explore reallocation and capacity changes without affecting live data.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="active"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col flex-1"
                    >
                        {/* Quick KPIs Strip */}
                        <div className="grid grid-cols-2 gap-px bg-[var(--color-border)] mb-4">
                            <div className="bg-[var(--color-surface)] p-3 flex flex-col items-center">
                                <span className="text-[10px] uppercase font-bold text-[var(--color-muted)]">Overload Delta</span>
                                <span className={`text-lg font-bold ${overloadDelta > 0 ? "text-[var(--color-danger)]" : overloadDelta < 0 ? "text-[var(--color-success)]" : "text-[var(--color-muted)]"}`}>
                                    {overloadDelta > 0 ? `▲ +${overloadDelta}` : overloadDelta < 0 ? `▼ ${overloadDelta}` : "0"} Days
                                </span>
                            </div>
                            <div className="bg-[var(--color-surface)] p-3 flex flex-col items-center">
                                <span className="text-[10px] uppercase font-bold text-[var(--color-muted)]">Rev at Risk</span>
                                <span className={`text-lg font-bold ${revenueAtRisk > 0 ? "text-[var(--color-warning)]" : "text-[var(--color-success)]"}`}>
                                    {revenueAtRisk > 0 ? `€${(revenueAtRisk / 1000).toFixed(0)}k` : "€0"}
                                </span>
                            </div>
                            <div className="bg-[var(--color-surface)] p-3 flex flex-col items-center">
                                <span className="text-[10px] uppercase font-bold text-[var(--color-muted)]">Resource Pool</span>
                                <span className="text-lg font-bold text-[var(--color-text)]">{resourcePool}</span>
                            </div>
                            <div className="bg-[var(--color-surface)] p-3 flex flex-col items-center">
                                <span className="text-[10px] uppercase font-bold text-[var(--color-muted)]">Actions Applied</span>
                                <span className="text-lg font-bold text-[var(--color-accent)]">{actions.length}</span>
                            </div>
                        </div>

                        {/* Actions Area */}
                        <div className="px-4 pb-2">
                            <h3 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-2 mt-2">Adjust Global Variables</h3>
                            <div className="space-y-4">
                                {/* Global Close Rate slider */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--color-text)] font-medium">Global Win Rate Adjust</span>
                                        <span className="font-bold text-[var(--color-accent)]">{(globalCloseRate * 100).toFixed(0)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="2"
                                        step="0.05"
                                        value={globalCloseRate}
                                        onChange={(e) => setGlobalCloseRate(parseFloat(e.target.value))}
                                        className="w-full accent-[var(--color-accent)]"
                                    />
                                    <p className="text-[10px] text-[var(--color-muted)]">Multiplies the win probability of all active pipeline opportunities.</p>
                                </div>

                                {/* Headcount slider */}
                                <div className="space-y-1 pb-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--color-text)] font-medium">Headcount Adjustment</span>
                                        <span className="font-bold text-[var(--color-success)]">{globalHeadcountDelta > 0 ? "+" : ""}{globalHeadcountDelta} FTEs</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="-10"
                                        max="20"
                                        step="1"
                                        value={globalHeadcountDelta}
                                        onChange={(e) => setGlobalHeadcountDelta(parseInt(e.target.value))}
                                        className="w-full accent-[var(--color-success)]"
                                    />
                                    <p className="text-[10px] text-[var(--color-muted)]">Simulate hiring or capacity reduction on overall bandwidth.</p>
                                </div>
                            </div>
                        </div>

                        {/* Comparative Flow Chart */}
                        <div className="px-4 pb-2 w-full h-[150px]">
                            <h3 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-2">Impact Projection</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={60} stroke="var(--color-muted)" tick={{ fontSize: 10 }} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", borderRadius: "var(--radius-card)", fontSize: "12px", color: "var(--color-text)" }}
                                        formatter={(value, name, props) => {
                                            if (props.payload.name === "Capacity") {
                                                return [(Number(value) / 1000).toFixed(0) + " FTE", name];
                                            }
                                            return ["€" + (Number(value) / 1000).toFixed(0) + "k", name];
                                        }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                                    <Bar dataKey="Baseline" fill="var(--color-muted)" radius={[0, 4, 4, 0]} barSize={12} />
                                    <Bar dataKey="Simulated" fill="var(--color-accent)" radius={[0, 4, 4, 0]} barSize={12} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Simulation Audit Log */}
                        <div className="mt-2 flex-1 border-t border-[var(--color-border)] bg-[var(--color-bg)] overflow-y-auto max-h-[200px]">
                            <div className="px-4 py-2 flex items-center gap-1.5 border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-bg)] z-10">
                                <Clock className="w-3 h-3 text-[var(--color-muted)]" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Audit Log ({actions.length})</span>
                            </div>
                            {actions.length === 0 ? (
                                <p className="text-xs text-center text-[var(--color-muted)] py-6">No actions applied yet. Use the buttons above to simulate changes.</p>
                            ) : (
                                <ul className="text-xs">
                                    {[...actions].reverse().map((action, idx) => (
                                        <li
                                            key={action.id}
                                            className="px-4 py-2.5 border-b border-[var(--color-border)] flex items-start gap-2 hover:bg-[var(--color-surface)] transition-colors group"
                                        >
                                            {/* Type badge */}
                                            <span
                                                className="shrink-0 mt-0.5 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white"
                                                style={{ backgroundColor: typeBadgeColor[action.type] || "var(--color-muted)" }}
                                            >
                                                {action.type.replace("_", " ")}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[var(--color-text)] truncate">{action.description}</p>
                                                <p className="text-[var(--color-muted)] text-[10px] mt-0.5">{formatTime(action.timestamp)}</p>
                                            </div>
                                            {/* Undo button — only on the most recent action (idx 0 since reversed) */}
                                            {idx === 0 && (
                                                <button
                                                    onClick={undoLastAction}
                                                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[var(--color-danger)] hover:text-white text-[var(--color-muted)]"
                                                    title="Undo this action"
                                                >
                                                    <Undo2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="p-3 border-t border-[var(--color-border)] flex gap-2">
                            {actions.length > 0 && (
                                <button
                                    onClick={undoLastAction}
                                    className="flex-1 flex items-center justify-center gap-1.5 border border-[var(--color-border)] text-[var(--color-text)] text-xs font-medium py-2 rounded-md hover:bg-[var(--color-surface)] transition-colors"
                                >
                                    <Undo2 className="w-3.5 h-3.5" /> Undo Last
                                </button>
                            )}
                            <button
                                className="flex-1 flex items-center justify-center gap-1.5 bg-[var(--color-primary)] text-[var(--color-bg)] text-xs font-medium py-2 rounded-md hover:opacity-90 transition-opacity"
                                onClick={() => useSimulationStore.getState().exportScenario()}
                            >
                                <Download className="w-3.5 h-3.5" /> Export Scenario
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
