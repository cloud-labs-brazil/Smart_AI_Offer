import { create } from "zustand";
import { type JiraOffer, type DailyAllocation } from "../types";
import { useOfferStore } from "./useOfferStore";

type ReallocatePayload = { offerId: string; oldOwner: string; newOwner: string };
type AdjustPercentagePayload = { offerId: string; architectName: string; percentage: number };
type AddArchitectPayload = { name: string; practice: string };
type SetGlobalCloseRatePayload = { rate: number };
type SetHeadcountDeltaPayload = { delta: number };

type SimulationPayload =
    | ReallocatePayload
    | AdjustPercentagePayload
    | AddArchitectPayload
    | SetGlobalCloseRatePayload
    | SetHeadcountDeltaPayload;

export interface SimulationAction {
    id: string;
    type: "REALLOCATE" | "ADJUST_PERCENTAGE" | "ADD_ARCHITECT" | "SET_GLOBAL_CLOSE_RATE" | "SET_HEADCOUNT_DELTA";
    timestamp: string;
    description: string;
    payload: SimulationPayload;
}

interface SimulationState {
    isSimulationMode: boolean;
    simulatedOffers: JiraOffer[];
    simulatedAllocations: DailyAllocation[];
    baseAllocations: DailyAllocation[];
    percentageOverrides: Record<string, number>; // key: `${offerId}::${architectName}`
    globalCloseRate: number;
    globalHeadcountDelta: number;
    actions: SimulationAction[];

    startSimulation: () => void;
    resetSimulation: () => void;
    reallocateOffer: (offerId: string, newOwner: string) => void;
    adjustPercentage: (offerId: string, architectName: string, percentage: number) => void;
    addArchitect: (name: string, practice: string) => void;
    setGlobalCloseRate: (rate: number) => void;
    setGlobalHeadcountDelta: (delta: number) => void;
    undoLastAction: () => void;
    exportScenario: () => void;

    _recomputeAllocations: () => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
    isSimulationMode: false,
    simulatedOffers: [],
    simulatedAllocations: [],
    baseAllocations: [],
    percentageOverrides: {},
    globalCloseRate: 1.0,
    globalHeadcountDelta: 0,
    actions: [],

    startSimulation: () => {
        const { offers, allocations } = useOfferStore.getState();
        set({
            isSimulationMode: true,
            simulatedOffers: JSON.parse(JSON.stringify(offers)), // deep clone
            simulatedAllocations: JSON.parse(JSON.stringify(allocations)),
            baseAllocations: JSON.parse(JSON.stringify(allocations)),
            percentageOverrides: {},
            globalCloseRate: 1.0,
            globalHeadcountDelta: 0,
            actions: [],
        });
    },

    resetSimulation: () => {
        set({
            isSimulationMode: false,
            simulatedOffers: [],
            simulatedAllocations: [],
            baseAllocations: [],
            percentageOverrides: {},
            globalCloseRate: 1.0,
            globalHeadcountDelta: 0,
            actions: [],
        });
    },

    reallocateOffer: (offerId: string, newOwner: string) => {
        const clonedOffers = [...get().simulatedOffers];
        const offerIndex = clonedOffers.findIndex((o) => o.id === offerId);
        if (offerIndex === -1) return;

        const oldOwner = clonedOffers[offerIndex].owner;
        clonedOffers[offerIndex] = { ...clonedOffers[offerIndex], owner: newOwner };

        const newAction: SimulationAction = {
            id: crypto.randomUUID(),
            type: "REALLOCATE",
            timestamp: new Date().toISOString(),
            description: `Reallocated ${offerId} from ${oldOwner || "None"} to ${newOwner}`,
            payload: { offerId, oldOwner, newOwner },
        };

        set({
            simulatedOffers: clonedOffers,
            actions: [...get().actions, newAction],
        });
        get()._recomputeAllocations();
    },

    adjustPercentage: (offerId: string, architectName: string, percentage: number) => {
        const key = `${offerId}::${architectName}`;
        const newOverrides = { ...get().percentageOverrides, [key]: percentage };

        const newAction: SimulationAction = {
            id: crypto.randomUUID(),
            type: "ADJUST_PERCENTAGE",
            timestamp: new Date().toISOString(),
            description: `Adjusted ${architectName} to ${percentage * 100}% on ${offerId}`,
            payload: { offerId, architectName, percentage },
        };

        set({
            percentageOverrides: newOverrides,
            actions: [...get().actions, newAction],
        });
        get()._recomputeAllocations();
    },

    addArchitect: (name: string, practice: string) => {
        const newAction: SimulationAction = {
            id: crypto.randomUUID(),
            type: "ADD_ARCHITECT",
            timestamp: new Date().toISOString(),
            description: `Added new architect ${name} (${practice})`,
            payload: { name, practice },
        };

        set({
            actions: [...get().actions, newAction],
        });
        // Doesn't affect allocations until they are assigned an offer
    },

    setGlobalCloseRate: (rate: number) => {
        const newAction: SimulationAction = {
            id: crypto.randomUUID(),
            type: "SET_GLOBAL_CLOSE_RATE",
            timestamp: new Date().toISOString(),
            description: `Set Global Close Rate Multiplier to ${rate}x`,
            payload: { rate },
        };
        set({ globalCloseRate: rate, actions: [...get().actions, newAction] });
        get()._recomputeAllocations();
    },

    setGlobalHeadcountDelta: (delta: number) => {
        const newAction: SimulationAction = {
            id: crypto.randomUUID(),
            type: "SET_HEADCOUNT_DELTA",
            timestamp: new Date().toISOString(),
            description: `Adjusted Global Headcount by ${delta > 0 ? "+" : ""}${delta}`,
            payload: { delta },
        };
        set({ globalHeadcountDelta: delta, actions: [...get().actions, newAction] });
        get()._recomputeAllocations();
    },

    undoLastAction: () => {
        const { actions, simulatedOffers, percentageOverrides } = get();
        if (actions.length === 0) return;

        const last = actions[actions.length - 1];
        const remaining = actions.slice(0, -1);

        if (last.type === "REALLOCATE") {
            // Restore old owner
            const { offerId, oldOwner } = last.payload as ReallocatePayload;
            const cloned = [...simulatedOffers];
            const idx = cloned.findIndex((o) => o.id === offerId);
            if (idx !== -1) cloned[idx] = { ...cloned[idx], owner: oldOwner || "" };
            set({ simulatedOffers: cloned, actions: remaining });
        } else if (last.type === "ADJUST_PERCENTAGE") {
            // Remove override for this key
            const { offerId, architectName } = last.payload as AdjustPercentagePayload;
            const key = `${offerId}::${architectName}`;
            const newOverrides = { ...percentageOverrides };
            delete newOverrides[key];
            set({ percentageOverrides: newOverrides, actions: remaining });
        } else if (last.type === "SET_GLOBAL_CLOSE_RATE") {
            // Find the previous rate
            const previousRateAction = remaining.slice().reverse().find(a => a.type === "SET_GLOBAL_CLOSE_RATE");
            const prevRate = previousRateAction ? (previousRateAction.payload as SetGlobalCloseRatePayload).rate : 1.0;
            set({ globalCloseRate: prevRate, actions: remaining });
        } else if (last.type === "SET_HEADCOUNT_DELTA") {
            const previousDeltaAction = remaining.slice().reverse().find(a => a.type === "SET_HEADCOUNT_DELTA");
            const prevDelta = previousDeltaAction ? (previousDeltaAction.payload as SetHeadcountDeltaPayload).delta : 0;
            set({ globalHeadcountDelta: prevDelta, actions: remaining });
        } else {
            // ADD_ARCHITECT or unknown — just remove from log
            set({ actions: remaining });
        }

        get()._recomputeAllocations();
    },

    _recomputeAllocations: () => {
        // Basic stub logic for recomputation - in reality this would match backend logic.
        // For now we just mutate cloned state so the UI reacts to something.
        // Recompute DailyAllocations placeholder based on mutated offers:
        // We would map over simulatedOffers and build daily buckets.
        // Since complex date math is omitted here, we will just copy state.
        // In a full client implementation we'd recreate the API's aggregation algorithm.
        // We assume an API call to a specific "simulate" endpoint could be used, or we do logic here.

        // For MVP frontend simulation: just flag that a change occurred.
        set({
            simulatedAllocations: [...get().baseAllocations] // Deep clone
        });
    },

    exportScenario: () => {
        const state = get();
        const exportData = {
            timestamp: new Date().toISOString(),
            actions: state.actions,
            overrides: state.percentageOverrides,
            simulatedOffersCount: state.simulatedOffers.length,
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `smart-offer-scenario-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },
}));

/* ─── Derived selectors (call outside of store for reactivity) ─── */

/** Overload delta: difference in # overloaded days (simulated − baseline) */
export function useOverloadDelta(): number {
    return useSimulationStore((s) => {
        const baseDays = s.baseAllocations.filter((a) => a.isOverloaded).length;
        const simDays = s.simulatedAllocations.filter((a) => a.isOverloaded).length;
        return simDays - baseDays;
    });
}

/** Revenue at risk: sum of weightedAmount for offers touched by REALLOCATE actions */
export function useRevenueAtRisk(): number {
    return useSimulationStore((s) => {
        let risk = 0;

        // Base risk from reallocated offers
        const movedIds = new Set(
            s.actions
                .filter((a) => a.type === "REALLOCATE")
                .map((a) => (a.payload as ReallocatePayload).offerId)
                .filter(Boolean),
        );
        if (movedIds.size > 0) {
            risk += s.simulatedOffers
                .filter((o) => movedIds.has(o.id))
                .reduce((sum, o) => sum + (o.weightedAmount ?? 0), 0);
        }

        // Apply close rate risk (difference from base)
        if (s.globalCloseRate !== 1.0) {
            const totalWeighted = s.simulatedOffers.reduce((sum, o) => sum + (o.weightedAmount ?? 0), 0);
            const deltaRevenue = totalWeighted * (1.0 - s.globalCloseRate);
            risk += deltaRevenue;
        }

        return risk;
    });
}

/** Resource pool size: unique architects in the simulated allocation set */
export function useResourcePoolSize(): number {
    return useSimulationStore((s) => {
        const names = new Set(s.simulatedAllocations.map((a) => a.architectName));
        // Also count architects added via ADD_ARCHITECT action
        s.actions
            .filter((a) => a.type === "ADD_ARCHITECT")
            .forEach((a) => {
                const name = (a.payload as AddArchitectPayload).name;
                if (name) names.add(name);
            });

        return names.size + s.globalHeadcountDelta;
    });
}
