import { create } from "zustand";
import type { JiraOffer, DailyAllocation } from "@packages/contracts/types";

interface KPIResponse {
    total_offers: number;
    total_revenue: number;
    avg_margin: number;
    overloaded_count: number;
}

interface OfferStoreState {
    offers: JiraOffer[];
    allocations: DailyAllocation[];
    kpis: KPIResponse | null;
    isLoading: boolean;
    error: string | null;

    fetchOffers: () => Promise<void>;
    fetchAllocations: () => Promise<void>;
    fetchKpis: () => Promise<void>;
    uploadCsv: (file: File) => Promise<any>;
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
            set({ offers: data.items, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    fetchAllocations: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/allocations`);
            if (!res.ok) throw new Error("Failed to fetch allocations");
            const data = await res.json();
            set({ allocations: data.items, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    fetchKpis: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/kpis`);
            if (!res.ok) throw new Error("Failed to fetch KPIs");
            const data = await res.json();
            set({ kpis: data, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
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
            return data;
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
            throw err;
        }
    },
}));
