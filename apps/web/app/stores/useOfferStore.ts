import { create } from "zustand";
import type { JiraOffer, DailyAllocation } from "../types";
import { getErrorMessage, mapAllocation, mapKpis, mapOffer, mapUploadResponse, type KpiResponse, type UploadCsvResponse } from "../lib/apiMappers";

interface OfferStoreState {
    offers: JiraOffer[];
    allocations: DailyAllocation[];
    kpis: KpiResponse | null;
    isLoading: boolean;
    error: string | null;

    fetchOffers: () => Promise<void>;
    fetchAllocations: () => Promise<void>;
    fetchKpis: () => Promise<void>;
    uploadCsv: (file: File) => Promise<UploadCsvResponse>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const useOfferStore = create<OfferStoreState>((set, get) => ({
    offers: [],
    allocations: [],
    kpis: null,
    isLoading: false,
    error: null,

    fetchOffers: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/offers`);
            if (!res.ok) throw new Error("Failed to fetch offers");
            const data = await res.json();
            set({ offers: (data.items ?? []).map(mapOffer), isLoading: false });
        } catch (err: unknown) {
            set({ error: getErrorMessage(err), isLoading: false });
        }
    },

    fetchAllocations: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/allocations`);
            if (!res.ok) throw new Error("Failed to fetch allocations");
            const data = await res.json();
            set({ allocations: (data.items ?? []).map(mapAllocation), isLoading: false });
        } catch (err: unknown) {
            set({ error: getErrorMessage(err), isLoading: false });
        }
    },

    fetchKpis: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/kpis`);
            if (!res.ok) throw new Error("Failed to fetch KPIs");
            const data = await res.json();
            set({ kpis: mapKpis(data), isLoading: false });
        } catch (err: unknown) {
            set({ error: getErrorMessage(err), isLoading: false });
        }
    },

    uploadCsv: async (file: File) => {
        set({ isLoading: true, error: null });
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${API_URL}/upload`, {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();

            // Refresh data after successful upload
            await Promise.all([
                get().fetchOffers(),
                get().fetchAllocations(),
                get().fetchKpis(),
            ]);

            set({ isLoading: false });
            return mapUploadResponse(data);
        } catch (err: unknown) {
            set({ error: getErrorMessage(err), isLoading: false });
            throw err;
        }
    },
}));
