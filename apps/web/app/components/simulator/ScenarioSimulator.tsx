"use client";

import React from "react";
import { Play, RotateCcw, AlertCircle, Users, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSimulationStore } from "../../stores/useSimulationStore";

export function ScenarioSimulator() {
    const { isSimulationMode, startSimulation, resetSimulation, actions } = useSimulationStore();

    return (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card)] flex flex-col overflow-hidden h-fit max-h-[600px]">
            <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg)] flex justify-between items-center">
                <div>
                    <h2 className="text-base font-[var(--font-weight-bold)] text-[var(--color-primary)]">Scenario Simulator</h2>
                    <p className="text-xs text-[var(--color-muted)]">"What-If" Planning Console</p>
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
                                <span className="text-lg font-bold text-[var(--color-danger)]">+0 Days</span>
                            </div>
                            <div className="bg-[var(--color-surface)] p-3 flex flex-col items-center">
                                <span className="text-[10px] uppercase font-bold text-[var(--color-muted)]">Rev at Risk</span>
                                <span className="text-lg font-bold text-[var(--color-success)]">-€0</span>
                            </div>
                            <div className="bg-[var(--color-surface)] p-3 flex flex-col items-center">
                                <span className="text-[10px] uppercase font-bold text-[var(--color-muted)]">Resource Pool</span>
                                <span className="text-lg font-bold text-[var(--color-text)]">0</span>
                            </div>
                            <div className="bg-[var(--color-surface)] p-3 flex flex-col items-center">
                                <span className="text-[10px] uppercase font-bold text-[var(--color-muted)]">Actions Applied</span>
                                <span className="text-lg font-bold text-[var(--color-accent)]">{actions.length}</span>
                            </div>
                        </div>

                        {/* Actions Area */}
                        <div className="px-4 pb-2">
                            <h3 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-2">Simulate Action</h3>
                            <div className="space-y-2">
                                <button className="w-full text-left px-3 py-2 text-sm border border-[var(--color-border)] rounded hover:border-[var(--color-accent)] transition-colors">
                                    Reallocate Offer...
                                </button>
                                <button className="w-full text-left px-3 py-2 text-sm border border-[var(--color-border)] rounded hover:border-[var(--color-accent)] transition-colors">
                                    Adjust Allocation %...
                                </button>
                                <button className="w-full text-left px-3 py-2 text-sm border border-[var(--color-border)] rounded hover:border-[var(--color-accent)] transition-colors">
                                    Add Virtual Architect...
                                </button>
                            </div>
                        </div>

                        {/* Action Log */}
                        <div className="mt-2 flex-1 border-t border-[var(--color-border)] bg-[var(--color-bg)] overflow-y-auto max-h-[150px]">
                            {actions.length === 0 ? (
                                <p className="text-xs text-center text-[var(--color-muted)] py-4">No actions applied yet.</p>
                            ) : (
                                <ul className="text-xs divide-y divide-[var(--color-border)]">
                                    {actions.map(action => (
                                        <li key={action.id} className="p-2 px-4 whitespace-nowrap overflow-hidden text-ellipsis">
                                            <span className="text-[var(--color-accent)] font-medium mr-1">[{action.type}]</span>
                                            {action.description}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="p-3 border-t border-[var(--color-border)]">
                            <button
                                className="w-full bg-[var(--color-primary)] text-[var(--color-bg)] text-xs font-medium py-2 rounded-md hover:opacity-90 transition-opacity"
                                onClick={() => useSimulationStore.getState().exportScenario()}
                            >
                                Export Scenario JSON
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
