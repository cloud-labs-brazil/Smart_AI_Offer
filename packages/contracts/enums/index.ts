/**
 * Smart Offer — Domain Enums
 *
 * @see .claude/rules/02-business-domain.md
 */

/** Offer workflow statuses from Jira */
export enum OfferStatus {
    UNDER_STUDY = "Under Study",
    IN_PROGRESS = "In Progress",
    WON = "Won",
    LOST = "Lost",
    CANCELLED = "Cancelled",
}

/** Allocation role within an offer */
export enum AllocationRole {
    OWNER = "OWNER",
    PARTICIPANT = "PARTICIPANT",
}

/** Market verticals */
export enum Market {
    ENERGY = "Energy",
    TRANSPORT = "Transport",
    PA = "PA",
    ICT = "ICT",
    DEFENCE = "Defence",
    TELECOM = "Telecom",
    FINANCE = "Finance",
    HEALTH = "Health",
}

/** Available dashboard themes */
export enum Theme {
    MCKINSEY_MINIMAL = "McKinsey Minimal",
    CFO_DARK_PREMIUM = "CFO Dark Premium",
    BIG_TECH_SAAS = "Big Tech SaaS",
    WAR_ROOM_MODE = "War Room Mode",
    INSTITUTIONAL_CLEAN = "Institutional Clean",
}

/** Dashboard tab identifiers */
export enum DashboardTab {
    ALLOCATION = "allocation",
    FORECAST = "forecast",
    FINANCIAL = "financial",
    PRACTICE = "practice",
    INVESTOR = "investor",
    BOARD = "board",
    ADMIN = "admin",
}

/** Simulation action types */
export enum SimulationAction {
    REALLOCATE = "REALLOCATE",
    ADJUST_PERCENTAGE = "ADJUST_PERCENTAGE",
    ADD_ARCHITECT = "ADD_ARCHITECT",
}

/** Data confidence levels */
export enum ConfidenceLevel {
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW",
    UNVERIFIED = "UNVERIFIED",
}

/** Ingestion validation severity */
export enum ValidationSeverity {
    CRITICAL = "CRITICAL",
    ERROR = "ERROR",
    WARNING = "WARNING",
    INFO = "INFO",
}
