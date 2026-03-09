"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { themes, DEFAULT_THEME, ThemeTokens } from "@packages/ui/theme";

interface ThemeContextType {
    currentTheme: ThemeTokens;
    setTheme: (slug: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [currentTheme, setCurrentThemeState] = useState<ThemeTokens>(themes[DEFAULT_THEME]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Read theme from localStorage securely on mount
        const savedTheme = localStorage.getItem("rsa-theme");
        if (savedTheme && themes[savedTheme]) {
            setCurrentThemeState(themes[savedTheme]);
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Persist and apply CSS variables when theme changes
        localStorage.setItem("rsa-theme", currentTheme.slug);

        const root = document.documentElement;
        const { colors, font, chart } = currentTheme;

        root.style.setProperty("--color-bg", colors.bg);
        root.style.setProperty("--color-surface", colors.surface);
        root.style.setProperty("--color-text", colors.text);
        root.style.setProperty("--color-muted", colors.muted);
        root.style.setProperty("--color-primary", colors.primary);
        root.style.setProperty("--color-accent", colors.accent);
        root.style.setProperty("--color-border", colors.border);
        root.style.setProperty("--color-danger", colors.danger);
        root.style.setProperty("--color-warning", colors.warning);
        root.style.setProperty("--color-success", colors.success);

        chart.forEach((color, i) => {
            root.style.setProperty(`--chart-${i}`, color);
        });

        root.style.setProperty("--font-family", font.family);
        root.style.setProperty("--font-weight-normal", font.weightNormal.toString());
        root.style.setProperty("--font-weight-bold", font.weightBold.toString());
        root.style.setProperty("--letter-spacing", font.letterSpacing);

        // Lazy load the font
        const fontName = font.family.split(",")[0].replace(/['"]/g, "").trim();
        const fontId = `font-${fontName.toLowerCase().replace(/\s+/g, "-")}`;

        if (!document.getElementById(fontId)) {
            const link = document.createElement("link");
            link.id = fontId;
            link.rel = "stylesheet";
            link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, "+")}:wght@${font.weightNormal};${font.weightBold}&display=swap`;
            document.head.appendChild(link);
        }
    }, [currentTheme, mounted]);

    const setTheme = (slug: string) => {
        if (themes[slug]) {
            setCurrentThemeState(themes[slug]);
        }
    };

    return (
        <ThemeContext.Provider value={{ currentTheme, setTheme }}>
            <div style={{ visibility: mounted ? "visible" : "hidden", display: "contents" }}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
