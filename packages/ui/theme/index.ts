/**
 * Smart Offer — Theme Tokens
 *
 * CSS variable maps for the 5 Indra design system themes.
 *
 * @see .claude/rules/06-ui-ux-indra-design-system.md
 * @see indra_design_system/theme_system.md
 */

export interface ThemeTokens {
    name: string;
    slug: string;
    colors: {
        bg: string;
        surface: string;
        text: string;
        muted: string;
        primary: string;
        accent: string;
        border: string;
        danger: string;
        warning: string;
        success: string;
    };
    chart: string[];
    font: {
        family: string;
        weightNormal: number;
        weightBold: number;
        letterSpacing: string;
    };
}

export const themes: Record<string, ThemeTokens> = {
    "mckinsey-minimal": {
        name: "McKinsey Minimal",
        slug: "mckinsey-minimal",
        colors: {
            bg: "#ffffff",
            surface: "#f8fafc",
            text: "#0f172a",
            muted: "#64748b",
            primary: "#1e293b",
            accent: "#3b82f6",
            border: "#e2e8f0",
            danger: "#ef4444",
            warning: "#f59e0b",
            success: "#22c55e",
        },
        chart: ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444", "#22c55e"],
        font: {
            family: '"Inter", system-ui, sans-serif',
            weightNormal: 400,
            weightBold: 700,
            letterSpacing: "-0.01em",
        },
    },
    "cfo-dark-premium": {
        name: "CFO Dark Premium",
        slug: "cfo-dark-premium",
        colors: {
            bg: "#0f172a",
            surface: "#1e293b",
            text: "#f1f5f9",
            muted: "#94a3b8",
            primary: "#e2e8f0",
            accent: "#818cf8",
            border: "#334155",
            danger: "#f87171",
            warning: "#fbbf24",
            success: "#4ade80",
        },
        chart: ["#818cf8", "#c084fc", "#22d3ee", "#fbbf24", "#f87171", "#4ade80"],
        font: {
            family: '"Inter", system-ui, sans-serif',
            weightNormal: 300,
            weightBold: 600,
            letterSpacing: "-0.02em",
        },
    },
    "big-tech-saas": {
        name: "Big Tech SaaS",
        slug: "big-tech-saas",
        colors: {
            bg: "#fafafa",
            surface: "#ffffff",
            text: "#09090b",
            muted: "#71717a",
            primary: "#18181b",
            accent: "#2563eb",
            border: "#e4e4e7",
            danger: "#dc2626",
            warning: "#d97706",
            success: "#16a34a",
        },
        chart: ["#2563eb", "#7c3aed", "#0891b2", "#d97706", "#dc2626", "#16a34a"],
        font: {
            family: '"Outfit", system-ui, sans-serif',
            weightNormal: 400,
            weightBold: 700,
            letterSpacing: "0em",
        },
    },
    "war-room-mode": {
        name: "War Room Mode",
        slug: "war-room-mode",
        colors: {
            bg: "#030712",
            surface: "#111827",
            text: "#f9fafb",
            muted: "#6b7280",
            primary: "#f9fafb",
            accent: "#ef4444",
            border: "#1f2937",
            danger: "#ef4444",
            warning: "#f59e0b",
            success: "#22c55e",
        },
        chart: ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"],
        font: {
            family: '"JetBrains Mono", monospace',
            weightNormal: 400,
            weightBold: 700,
            letterSpacing: "0em",
        },
    },
    "institutional-clean": {
        name: "Institutional Clean",
        slug: "institutional-clean",
        colors: {
            bg: "#f8fafc",
            surface: "#ffffff",
            text: "#1e293b",
            muted: "#64748b",
            primary: "#0f4c81",
            accent: "#0ea5e9",
            border: "#cbd5e1",
            danger: "#e11d48",
            warning: "#ea580c",
            success: "#059669",
        },
        chart: ["#0ea5e9", "#0f4c81", "#14b8a6", "#ea580c", "#e11d48", "#059669"],
        font: {
            family: '"Roboto", system-ui, sans-serif',
            weightNormal: 400,
            weightBold: 700,
            letterSpacing: "0em",
        },
    },
};

/** Default theme slug */
export const DEFAULT_THEME = "mckinsey-minimal";
