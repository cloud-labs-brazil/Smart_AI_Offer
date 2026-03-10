import type { DailyAllocation, JiraOffer } from "../types";

type GenericRecord = Record<string, unknown>;

function pick(source: GenericRecord, camelKey: string, snakeKey: string): unknown {
    return source[camelKey] ?? source[snakeKey];
}

function toStringValue(value: unknown, fallback = ""): string {
    if (typeof value === "string") {
        return value;
    }
    if (value == null) {
        return fallback;
    }
    return String(value);
}

function toNullableString(value: unknown): string | null {
    if (value == null) {
        return null;
    }
    return toStringValue(value);
}

function toNumberValue(value: unknown, fallback = 0): number {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }
    return fallback;
}

function toNullableNumber(value: unknown): number | null {
    if (value == null || value === "") {
        return null;
    }
    return toNumberValue(value, 0);
}

function toNullableBoolean(value: unknown): boolean | null {
    if (typeof value === "boolean") {
        return value;
    }
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized === "true") return true;
        if (normalized === "false") return false;
    }
    return null;
}

function toStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.map((item) => toStringValue(item)).filter((item) => item.length > 0);
    }
    return [];
}

export interface KpiResponse {
    totalOffers: number;
    totalRevenue: number;
    avgMargin: number;
    overloadedCount: number;
}

export interface UploadCsvResponse {
    ingestedCount: number;
    errorCount: number;
}

export function mapOffer(rawValue: unknown): JiraOffer {
    const raw = (rawValue ?? {}) as GenericRecord;
    return {
        id: toStringValue(pick(raw, "id", "id")),
        jiraId: toNumberValue(pick(raw, "jiraId", "jira_id")),
        owner: toStringValue(pick(raw, "owner", "owner")),
        status: toStringValue(pick(raw, "status", "status")),
        summary: toStringValue(pick(raw, "summary", "summary")),
        typeOfService: toNullableString(pick(raw, "typeOfService", "type_of_service")),
        practice: toNullableString(pick(raw, "practice", "practice")),
        offeringType: toNullableString(pick(raw, "offeringType", "offering_type")),
        priority: toNullableString(pick(raw, "priority", "priority")),
        weightedAmount: toNullableNumber(pick(raw, "weightedAmount", "weighted_amount")),
        businessOpportunityType: toNullableString(
            pick(raw, "businessOpportunityType", "business_opportunity_type"),
        ),
        country: toNullableString(pick(raw, "country", "country")),
        market: toNullableString(pick(raw, "market", "market")),
        marketManager: toNullableString(pick(raw, "marketManager", "market_manager")),
        dnManager: toStringValue(pick(raw, "dnManager", "dn_manager")),
        operationsManager: toNullableString(pick(raw, "operationsManager", "operations_manager")),
        renewal: toNullableBoolean(pick(raw, "renewal", "renewal")),
        gepCode: toNullableString(pick(raw, "gepCode", "gep_code")),
        temporalScope: toNullableString(pick(raw, "temporalScope", "temporal_scope")),
        startDate: toNullableString(pick(raw, "startDate", "start_date")),
        endDate: toNullableString(pick(raw, "endDate", "end_date")),
        participants: toStringArray(pick(raw, "participants", "participants")),
        totalAmount: toNullableNumber(pick(raw, "totalAmount", "total_amount")),
        localCurrencyBudget: toNullableNumber(pick(raw, "localCurrencyBudget", "local_currency_budget")),
        margin: toNullableNumber(pick(raw, "margin", "margin")),
        offerCodeNG: toNullableString(pick(raw, "offerCodeNG", "offer_code_ng")),
        offerDescriptionNG: toNullableString(
            pick(raw, "offerDescriptionNG", "offer_description_ng"),
        ),
        transversal: toNullableBoolean(pick(raw, "transversal", "transversal")),
        updatedAt: toNullableString(pick(raw, "updatedAt", "updated_at")),
        createdAt: toStringValue(pick(raw, "createdAt", "created_at")),
        proposalDueDate: toNullableString(pick(raw, "proposalDueDate", "proposal_due_date")),
        observations: toNullableString(pick(raw, "observations", "observations")),
        resolvedAt: toNullableString(pick(raw, "resolvedAt", "resolved_at")),
        cloudInfraAmount: toNullableNumber(pick(raw, "cloudInfraAmount", "cloud_infra_amount")),
        cloudServicesAmount: toNullableNumber(pick(raw, "cloudServicesAmount", "cloud_services_amount")),
        cloudServiceType: toNullableString(pick(raw, "cloudServiceType", "cloud_service_type")),
        cloudProvider: toNullableString(pick(raw, "cloudProvider", "cloud_provider")),
        otherCloudProviders: toNullableString(
            pick(raw, "otherCloudProviders", "other_cloud_providers"),
        ),
    };
}

export function mapAllocation(rawValue: unknown): DailyAllocation {
    const raw = (rawValue ?? {}) as GenericRecord;
    const rawDetails = pick(raw, "allocations", "allocations");
    const details = Array.isArray(rawDetails) ? rawDetails : [];
    return {
        architectName: toStringValue(pick(raw, "architectName", "architect_name")),
        date: toStringValue(pick(raw, "date", "date")),
        totalAllocation: toNumberValue(pick(raw, "totalAllocation", "total_allocation")),
        isOverloaded: Boolean(pick(raw, "isOverloaded", "is_overloaded")),
        allocations: details.map((detailValue) => {
            const detail = detailValue as GenericRecord;
            const roleValue = toStringValue(pick(detail, "role", "role")).toUpperCase();
            return {
                offerId: toStringValue(pick(detail, "offerId", "offer_id")),
                role: roleValue === "PARTICIPANT" ? "PARTICIPANT" : "OWNER",
                weight: toNumberValue(pick(detail, "weight", "weight")),
            };
        }),
    };
}

export function mapKpis(rawValue: unknown): KpiResponse {
    const raw = (rawValue ?? {}) as GenericRecord;
    return {
        totalOffers: toNumberValue(pick(raw, "totalOffers", "total_offers")),
        totalRevenue: toNumberValue(pick(raw, "totalRevenue", "total_revenue")),
        avgMargin: toNumberValue(pick(raw, "avgMargin", "avg_margin")),
        overloadedCount: toNumberValue(pick(raw, "overloadedCount", "overloaded_count")),
    };
}

export function mapUploadResponse(rawValue: unknown): UploadCsvResponse {
    const raw = (rawValue ?? {}) as GenericRecord;
    return {
        ingestedCount: toNumberValue(pick(raw, "ingestedCount", "ingested_count")),
        errorCount: toNumberValue(pick(raw, "errorCount", "error_count")),
    };
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return "Unexpected error";
}
