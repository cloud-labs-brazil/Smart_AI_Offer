"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle } from "lucide-react";
import { useOfferStore } from "../../stores/useOfferStore";

export function AdminSettings() {
    const { uploadCsv, isLoading } = useOfferStore();
    const [dragActive, setDragActive] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            await handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file: File) => {
        setUploadStatus("Uploading...");
        try {
            const result = await uploadCsv(file);
            setUploadStatus(`Success: ${result.ingested_count || 0} offers ingested.`);
        } catch (err: any) {
            setUploadStatus(`Error: ${err.message}`);
        }
    };

    return (
        <div className="flex flex-col h-full w-full max-w-2xl mx-auto">
            <h2 className="text-lg font-[var(--font-weight-bold)] text-[var(--color-primary)] mb-6">Admin & Settings</h2>

            <div
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${dragActive ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5" : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <UploadCloud className="w-12 h-12 mx-auto text-[var(--color-muted)] mb-4" />
                <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">Upload Data Source (CSV)</h3>
                <p className="text-sm text-[var(--color-muted)] mb-6">Drag and drop your Jira export CSV here</p>

                <label className="bg-[var(--color-primary)] text-[var(--color-bg)] px-4 py-2 rounded-md font-medium cursor-pointer hover:opacity-90 transition-opacity">
                    Browse Files
                    <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                </label>
            </div>

            {isLoading && (
                <div className="mt-6 flex items-center justify-center text-[var(--color-accent)] text-sm font-medium">
                    <span className="animate-spin w-4 h-4 border-2 border-[var(--color-accent)] border-t-transparent rounded-full mr-2"></span>
                    Processing Upload...
                </div>
            )}

            {uploadStatus && !isLoading && (
                <div className={`mt-6 p-4 rounded-md flex items-start gap-3 ${uploadStatus.startsWith("Success") ? "bg-[var(--color-success)]/10 text-[var(--color-success)]" : "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
                    }`}>
                    {uploadStatus.startsWith("Success") && <CheckCircle className="w-5 h-5 shrink-0" />}
                    <p className="text-sm font-medium">{uploadStatus}</p>
                </div>
            )}

            <div className="mt-10 pt-6 border-t border-[var(--color-border)]">
                <h3 className="text-sm font-medium text-[var(--color-text)] mb-4">Configuration Status</h3>
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md p-4 text-sm font-mono text-[var(--color-muted)] space-y-2">
                    <div className="flex justify-between"><span className="text-[var(--color-text)]">API Server:</span> <span>{process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--color-text)]">Theme Mode:</span> <span>Active Dynamic Variables</span></div>
                </div>
            </div>
        </div>
    );
}
