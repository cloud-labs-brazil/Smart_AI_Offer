"use client";

import React, { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallbackTitle?: string;
    /** If true, show technical error details (dev only) */
    showDetails?: boolean;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

/**
 * Global error boundary to prevent full‑app white‑screens.
 * Catches render errors in the component tree below it and
 * shows a friendly recovery UI with a retry button.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({ errorInfo });

        // Log to console — in production this would go to a remote error tracker
        console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[300px] p-8 rounded-xl border-2 border-dashed border-[var(--color-danger)] bg-[var(--color-surface)]">
                    <AlertTriangle className="w-12 h-12 text-[var(--color-danger)] mb-4" />

                    <h3 className="text-lg font-[var(--font-weight-bold)] text-[var(--color-text)] mb-2">
                        {this.props.fallbackTitle ?? "Something went wrong"}
                    </h3>

                    <p className="text-sm text-[var(--color-muted)] mb-6 text-center max-w-md">
                        This component encountered an unexpected error. Your data is safe — try
                        reloading the section or refreshing the page.
                    </p>

                    <button
                        onClick={this.handleReload}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-bg)] font-medium text-sm hover:opacity-90 transition-opacity"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                    </button>

                    {this.props.showDetails && this.state.error && (
                        <details className="mt-6 w-full max-w-lg">
                            <summary className="text-xs text-[var(--color-muted)] cursor-pointer hover:text-[var(--color-text)]">
                                Technical details
                            </summary>
                            <pre className="mt-2 p-3 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-danger)] overflow-auto max-h-[200px] font-mono">
                                {this.state.error.message}
                                {"\n\n"}
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
