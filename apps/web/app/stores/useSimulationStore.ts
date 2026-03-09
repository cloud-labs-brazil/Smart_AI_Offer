import { create } from "zustand";
import { type JiraOffer, type DailyAllocation } from "@packages/contracts/types";
import { useOfferStore } from "./useOfferStore";

export interface SimulationAction {
    id: string;
    type: "REALLOCATE" | "ADJUST_PERCENTAGE" | "ADD_ARCHITECT";
    timestamp: string;
    description: string;
    payload: any;
}

interface SimulationState {
    isSimulationMode: boolean;
    simulatedOffers: JiraOffer[];
    simulatedAllocations: DailyAllocation[];
    baseAllocations: DailyAllocation[];
    percentageOverrides: Record<string, number>; // key: `${offerId}::${architectName}`
    actions: SimulationAction[];

    startSimulation: () => void;
    resetSimulation: () => void;
    reallocateOffer: (offerId: string, newOwner: string) => void;
    adjustPercentage: (offerId: string, architectName: string, percentage: number) => void;
    addArchitect: (name: string, practice: string) => void;
    exportScenario: () => void;

    _recomputeAllocations: () => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
    isSimulationMode: false,
    simulatedOffers: [],
    simulatedAllocations: [],
    baseAllocations: [],
    percentageOverrides: {},
    actions: [],

    startSimulation: () => {
        const { offers, allocations } = useOfferStore.getState();
        set({
            isSimulationMode: true,
            simulatedOffers: JSON.parse(JSON.stringify(offers)), // deep clone
            simulatedAllocations: JSON.parse(JSON.stringify(allocations)),
            baseAllocations: JSON.parse(JSON.stringify(allocations)),
            percentageOverrides: {},
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

    _recomputeAllocations: () => {
        // Basic stub logic for recomputation - in reality this would match backend logic.
        // For now we just mutate cloned state so the UI reacts to something.
        const { simulatedOffers, percentageOverrides } = get();
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
