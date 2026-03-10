import { describe, expect, it } from "vitest";
import {
    getErrorMessage,
    mapAllocation,
    mapKpis,
    mapOffer,
    mapUploadResponse,
} from "./apiMappers";

describe("apiMappers", () => {
    it("maps snake_case offers to typed camelCase model", () => {
        const offer = mapOffer({
            id: 1234,
            jira_id: "100",
            owner: "Alice",
            status: "In Progress",
            summary: "Core migration",
            dn_manager: "Manager",
            created_at: "2026-01-01T00:00:00Z",
            participants: ["Bob", "Carol"],
            total_amount: 1500,
            weighted_amount: 600,
            renewal: "true",
        });

        expect(offer.id).toBe("1234");
        expect(offer.jiraId).toBe(100);
        expect(offer.totalAmount).toBe(1500);
        expect(offer.weightedAmount).toBe(600);
        expect(offer.renewal).toBe(true);
        expect(offer.participants).toEqual(["Bob", "Carol"]);
    });

    it("falls back safely for missing and invalid offer fields", () => {
        const offer = mapOffer({
            owner: "Alice",
            status: "Open",
            summary: "Fallback path",
            dn_manager: "Manager",
            created_at: "2026-01-01T00:00:00Z",
            participants: "Bob",
            renewal: "invalid-bool",
            margin: "",
            weighted_amount: "not-a-number",
        });

        expect(offer.id).toBe("");
        expect(offer.jiraId).toBe(0);
        expect(offer.participants).toEqual([]);
        expect(offer.renewal).toBeNull();
        expect(offer.margin).toBeNull();
        expect(offer.weightedAmount).toBe(0);
    });

    it("maps allocations and details from API payload", () => {
        const allocation = mapAllocation({
            architect_name: "Alice",
            date: "2026-01-10",
            total_allocation: 1.2,
            is_overloaded: true,
            allocations: [
                { offer_id: "OFBRA-1", role: "OWNER", weight: 1.0 },
                { offer_id: "OFBRA-2", role: "PARTICIPANT", weight: 0.2 },
            ],
        });

        expect(allocation.architectName).toBe("Alice");
        expect(allocation.totalAllocation).toBe(1.2);
        expect(allocation.isOverloaded).toBe(true);
        expect(allocation.allocations).toHaveLength(2);
        expect(allocation.allocations[1].role).toBe("PARTICIPANT");
    });

    it("normalizes allocation detail role and handles absent details array", () => {
        const allocation = mapAllocation({
            architect_name: "Bob",
            date: "2026-01-11",
            total_allocation: "0.5",
            is_overloaded: false,
            allocations: [{ offer_id: "OFBRA-3", role: "unknown", weight: "0.5" }],
        });

        const emptyDetailsAllocation = mapAllocation({
            architectName: "Carol",
            date: "2026-01-12",
            totalAllocation: 0,
        });

        expect(allocation.allocations[0].role).toBe("OWNER");
        expect(allocation.allocations[0].weight).toBe(0.5);
        expect(emptyDetailsAllocation.allocations).toEqual([]);
    });

    it("maps KPI response fields", () => {
        const kpis = mapKpis({
            total_offers: 12,
            total_revenue: 50000,
            avg_margin: 21.5,
            overloaded_count: 3,
        });

        expect(kpis).toEqual({
            totalOffers: 12,
            totalRevenue: 50000,
            avgMargin: 21.5,
            overloadedCount: 3,
        });
    });

    it("maps upload response fields", () => {
        const upload = mapUploadResponse({ ingested_count: 100, error_count: 2 });
        expect(upload.ingestedCount).toBe(100);
        expect(upload.errorCount).toBe(2);
    });

    it("falls back to zero when upload/KPI fields are malformed", () => {
        const upload = mapUploadResponse({ ingested_count: "bad", error_count: null });
        const kpis = mapKpis({ total_offers: "NaN" });

        expect(upload.ingestedCount).toBe(0);
        expect(upload.errorCount).toBe(0);
        expect(kpis.totalOffers).toBe(0);
        expect(kpis.totalRevenue).toBe(0);
    });

    it("extracts unknown error messages safely", () => {
        expect(getErrorMessage(new Error("boom"))).toBe("boom");
        expect(getErrorMessage("not-an-error")).toBe("Unexpected error");
    });
});
