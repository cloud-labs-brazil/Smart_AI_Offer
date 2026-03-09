/**
 * Smart Offer — Shared Type Contracts
 *
 * Core domain types shared between frontend and backend.
 * These are the canonical type definitions for the entire platform.
 *
 * @see .claude/rules/02-business-domain.md
 * @see .claude/rules/04-data-platform-jira-csv.md
 * @see indra_design_system/data_model.md
 */

/** Jira offer record — normalized from CSV */
export interface JiraOffer {
    /** Primary identifier — Jira issue key (e.g., OFBRA-2902) */
    id: string;
    /** Jira internal numeric ID */
    jiraId: number;
    /** Lead architect (human-readable name) */
    owner: string;
    /** Jira workflow status */
    status: string;
    /** Offer title / description */
    summary: string;
    /** Service classification */
    typeOfService: string | null;
    /** Business practice / DN (from Component/s) */
    practice: string | null;
    /** Offering classification */
    offeringType: string | null;
    /** Priority level */
    priority: string | null;
    /** Revenue × probability (EUR) */
    weightedAmount: number | null;
    /** Opportunity classification */
    businessOpportunityType: string | null;
    /** Geographic market */
    country: string | null;
    /** Market vertical */
    market: string | null;
    /** Market-level manager */
    marketManager: string | null;
    /** Business developer (DN Manager) */
    dnManager: string;
    /** Operations lead */
    operationsManager: string | null;
    /** Renewal flag */
    renewal: boolean | null;
    /** ERP code */
    gepCode: string | null;
    /** Duration/phase */
    temporalScope: string | null;
    /** Offer start date (ISO-8601) */
    startDate: string | null;
    /** Offer end date (ISO-8601) */
    endDate: string | null;
    /** Secondary contributors (deduplicated, max 15) */
    participants: string[];
    /** Full revenue value (EUR) */
    totalAmount: number | null;
    /** Local currency budget */
    localCurrencyBudget: number | null;
    /** Profit margin % */
    margin: number | null;
    /** Next-gen offer code */
    offerCodeNG: string | null;
    /** Next-gen description */
    offerDescriptionNG: string | null;
    /** Multi-practice flag */
    transversal: boolean | null;
    /** Last Jira update (ISO-8601) */
    updatedAt: string | null;
    /** Jira creation date (ISO-8601) */
    createdAt: string;
    /** Bid deadline (ISO-8601) */
    proposalDueDate: string | null;
    /** Free-text observations */
    observations: string | null;
    /** Resolution date (ISO-8601) */
    resolvedAt: string | null;
    /** Cloud infrastructure cost (EUR) */
    cloudInfraAmount: number | null;
    /** Cloud services cost (EUR) */
    cloudServicesAmount: number | null;
    /** Cloud service classification */
    cloudServiceType: string | null;
    /** Primary cloud provider */
    cloudProvider: string | null;
    /** Additional cloud providers */
    otherCloudProviders: string | null;
}

/** Daily allocation record for a single architect */
export interface DailyAllocation {
    /** Architect being allocated */
    architectName: string;
    /** ISO-8601 date (daily granularity) */
    date: string;
    /** Sum of all active allocations (1.0 = 100%) */
    totalAllocation: number;
    /** Per-offer breakdown */
    allocations: AllocationDetail[];
    /** True when totalAllocation > 1.0 */
    isOverloaded: boolean;
}

/** Per-offer allocation detail */
export interface AllocationDetail {
    /** Reference to JiraOffer.id */
    offerId: string;
    /** Role in the offer */
    role: "OWNER" | "PARTICIPANT";
    /** Allocation weight (owner=1.0, participant=0.1 default) */
    weight: number;
}

/** Simulation action types */
export type SimulationActionType =
    | "REALLOCATE"
    | "ADJUST_PERCENTAGE"
    | "ADD_ARCHITECT";

/** Simulation action record */
export interface SimulationAction {
    type: SimulationActionType;
    timestamp: string;
    params: Record<string, unknown>;
}

/** Discrepancy report from ingestion validation */
export interface DiscrepancyReport {
    status: "VERIFIED" | "UNVERIFIED";
    recordCountDelta: number;
    allocationDelta: number;
    revenueDelta: number;
    timestamp: string;
}

/** Confidence level for data quality */
export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW" | "UNVERIFIED";
