"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Sparkles, Loader2, Bot, User } from "lucide-react";

interface ChatMessage {
    role: "user" | "model";
    content: string;
    timestamp: Date;
    sources?: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const SUGGESTED_QUESTIONS = [
    "How do I read the Allocation Heatmap?",
    "What does the HHI index mean?",
    "How are weighted pipeline values calculated?",
    "What are the overload thresholds?",
    "Explain the Scaling Score dimensions",
];

export function GeminiChatbot({ activeTab }: { activeTab?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const sendMessage = useCallback(
        async (text: string) => {
            if (!text.trim() || isLoading) return;

            const userMsg: ChatMessage = {
                role: "user",
                content: text.trim(),
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMsg]);
            setInput("");
            setIsLoading(true);

            try {
                const history = messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                }));

                const resp = await fetch(`${API_URL}/chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: text.trim(),
                        history,
                        active_tab: activeTab || null,
                    }),
                });

                const data = await resp.json();

                const botMsg: ChatMessage = {
                    role: "model",
                    content: data.reply || "I couldn't process that. Please try again.",
                    timestamp: new Date(),
                    sources: data.sources,
                };

                setMessages((prev) => [...prev, botMsg]);
            } catch {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "model",
                        content: "❌ Connection error. Please check that the API server is running.",
                        timestamp: new Date(),
                    },
                ]);
            } finally {
                setIsLoading(false);
            }
        },
        [messages, isLoading, activeTab]
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                        style={{
                            background: "linear-gradient(135deg, var(--color-accent), var(--color-primary))",
                            color: "white",
                            boxShadow: "0 4px 20px color-mix(in srgb, var(--color-accent) 40%, transparent)",
                        }}
                        aria-label="Open AI Assistant"
                    >
                        <Sparkles className="w-6 h-6" />
                        {/* Pulse ring */}
                        <span
                            className="absolute inset-0 rounded-full animate-ping"
                            style={{
                                backgroundColor: "var(--color-accent)",
                                opacity: 0.3,
                                animationDuration: "2s",
                            }}
                        />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] rounded-2xl flex flex-col overflow-hidden"
                        style={{
                            backgroundColor: "var(--color-surface)",
                            border: "1px solid var(--color-border)",
                            boxShadow: "0 25px 60px rgba(0,0,0,0.3), 0 0 0 1px color-mix(in srgb, var(--color-accent) 15%, transparent)",
                        }}
                    >
                        {/* Header */}
                        <div
                            className="px-5 py-4 flex items-center justify-between shrink-0"
                            style={{
                                background: "linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 15%, var(--color-surface)), var(--color-surface))",
                                borderBottom: "1px solid var(--color-border)",
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                                    style={{
                                        background: "linear-gradient(135deg, var(--color-accent), var(--color-primary))",
                                    }}
                                >
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
                                        Smart Offer AI
                                    </h3>
                                    <p className="text-[10px]" style={{ color: "var(--color-muted)" }}>
                                        Powered by Gemini • Metric-aware
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg transition-colors hover:bg-[color-mix(in_srgb,var(--color-muted)_15%,transparent)]"
                                style={{ color: "var(--color-muted)" }}
                                aria-label="Close chat"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: "thin" }}>
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-4">
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                        style={{
                                            background: "linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 20%, transparent), color-mix(in srgb, var(--color-primary) 10%, transparent))",
                                        }}
                                    >
                                        <Bot className="w-8 h-8" style={{ color: "var(--color-accent)" }} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text)" }}>
                                            Ask about your dashboard
                                        </p>
                                        <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                                            I understand every KPI, chart, and metric in Smart Offer.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                                        {SUGGESTED_QUESTIONS.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => sendMessage(q)}
                                                className="text-[11px] px-3 py-1.5 rounded-full transition-all hover:scale-105"
                                                style={{
                                                    backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
                                                    color: "var(--color-accent)",
                                                    border: "1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)",
                                                }}
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, i) => (
                                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    {msg.role === "model" && (
                                        <div
                                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                                            style={{
                                                background: "linear-gradient(135deg, var(--color-accent), var(--color-primary))",
                                            }}
                                        >
                                            <Sparkles className="w-3.5 h-3.5 text-white" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === "user" ? "rounded-br-md" : "rounded-bl-md"
                                            }`}
                                        style={
                                            msg.role === "user"
                                                ? {
                                                    background: "linear-gradient(135deg, var(--color-accent), var(--color-primary))",
                                                    color: "white",
                                                }
                                                : {
                                                    backgroundColor: "color-mix(in srgb, var(--color-muted) 10%, var(--color-bg))",
                                                    color: "var(--color-text)",
                                                    border: "1px solid var(--color-border)",
                                                }
                                        }
                                    >
                                        <div
                                            className="whitespace-pre-wrap"
                                            dangerouslySetInnerHTML={{
                                                __html: msg.content
                                                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                                    .replace(/\*(.*?)\*/g, "<em>$1</em>")
                                                    .replace(/`(.*?)`/g, '<code style="background:rgba(0,0,0,0.1);padding:0 4px;border-radius:3px;font-size:0.85em">$1</code>')
                                                    .replace(/\n/g, "<br/>"),
                                            }}
                                        />
                                        {msg.sources && msg.sources.length > 0 && (
                                            <div
                                                className="mt-2 pt-2 flex flex-wrap gap-1"
                                                style={{ borderTop: "1px solid color-mix(in srgb, var(--color-border) 50%, transparent)" }}
                                            >
                                                {msg.sources.map((s, si) => (
                                                    <span
                                                        key={si}
                                                        className="text-[9px] px-1.5 py-0.5 rounded-full"
                                                        style={{
                                                            backgroundColor: "color-mix(in srgb, var(--color-accent) 15%, transparent)",
                                                            color: "var(--color-accent)",
                                                        }}
                                                    >
                                                        📊 {s}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {msg.role === "user" && (
                                        <div
                                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                                            style={{ backgroundColor: "color-mix(in srgb, var(--color-muted) 20%, transparent)" }}
                                        >
                                            <User className="w-3.5 h-3.5" style={{ color: "var(--color-muted)" }} />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-2 items-start">
                                    <div
                                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                        style={{
                                            background: "linear-gradient(135deg, var(--color-accent), var(--color-primary))",
                                        }}
                                    >
                                        <Sparkles className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <div
                                        className="rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2"
                                        style={{
                                            backgroundColor: "color-mix(in srgb, var(--color-muted) 10%, var(--color-bg))",
                                            border: "1px solid var(--color-border)",
                                        }}
                                    >
                                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--color-accent)" }} />
                                        <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                                            Thinking...
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div
                            className="px-4 py-3 shrink-0"
                            style={{
                                borderTop: "1px solid var(--color-border)",
                                backgroundColor: "color-mix(in srgb, var(--color-bg) 50%, var(--color-surface))",
                            }}
                        >
                            <div
                                className="flex items-center gap-2 rounded-xl px-4 py-2.5"
                                style={{
                                    backgroundColor: "var(--color-bg)",
                                    border: "1px solid var(--color-border)",
                                }}
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about any KPI or chart..."
                                    disabled={isLoading}
                                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-muted)]"
                                    style={{ color: "var(--color-text)" }}
                                />
                                <button
                                    onClick={() => sendMessage(input)}
                                    disabled={!input.trim() || isLoading}
                                    className="p-1.5 rounded-lg transition-all disabled:opacity-30"
                                    style={{
                                        backgroundColor: input.trim() ? "var(--color-accent)" : "transparent",
                                        color: input.trim() ? "white" : "var(--color-muted)",
                                    }}
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-[9px] mt-1.5 text-center" style={{ color: "var(--color-muted)", opacity: 0.6 }}>
                                AI responses are based on your metric dictionary • Gemini 2.0 Flash
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
