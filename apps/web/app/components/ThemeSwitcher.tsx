"use client";

import React, { useState, useRef, useEffect } from "react";
import { Palette, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { themes } from "@packages/ui/theme";
import { useTheme } from "./ThemeProvider";

export function ThemeSwitcher() {
    const { currentTheme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors duration-200"
                aria-label="Select theme"
                aria-expanded={isOpen}
            >
                <Palette className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="text-sm font-medium hidden sm:inline-block">Theme</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-56 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-[var(--shadow-card)] z-50 overflow-hidden"
                        role="menu"
                    >
                        <div className="py-1">
                            {Object.values(themes).map((theme) => {
                                const isActive = currentTheme.slug === theme.slug;
                                return (
                                    <button
                                        key={theme.slug}
                                        onClick={() => {
                                            setTheme(theme.slug);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-[var(--color-border)] transition-colors ${isActive ? "bg-[var(--color-border)]" : ""
                                            }`}
                                        role="menuitem"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded-full border border-[var(--color-border)]"
                                                style={{ backgroundColor: theme.colors.bg }}
                                            />
                                            <span className="font-medium">{theme.name}</span>
                                        </div>
                                        {isActive && <Check className="w-4 h-4 text-[var(--color-success)]" />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
