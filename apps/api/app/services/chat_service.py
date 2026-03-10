"""
Smart Offer — Chat Service (Gemini AI Proxy)

Provides a backend proxy for Gemini API calls so the API key stays server-side.
The chat endpoint enriches prompts with metric dictionary context so the
AI can answer questions about dashboard KPIs accurately.
"""

from __future__ import annotations

import logging
from typing import Optional

import httpx
from pydantic import BaseModel

from app.core.config import settings
from app.services.metric_dictionary import METRIC_DICTIONARY

logger = logging.getLogger("smart_offer.chat")

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

# ── Request / Response models ──


class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    active_tab: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    sources: list[str] = []


# ── System prompt with metric context ──

def _build_system_prompt(active_tab: Optional[str] = None) -> str:
    """Build a system prompt enriched with metric dictionary context."""
    # Filter metrics by active tab if provided
    metrics = METRIC_DICTIONARY
    if active_tab:
        metrics = [m for m in metrics if active_tab in m.dashboard_tabs]

    metrics_context = "\n".join(
        f"- **{m.label}** (id: {m.id}, unit: {m.unit}): {m.short_description} "
        f"Formula: {m.formula}. Rationale: {m.rationale}. "
        f"Tabs: {', '.join(m.dashboard_tabs)}."
        + (f" Thresholds — Green: {m.thresholds.green}, Amber: {m.thresholds.amber}, Red: {m.thresholds.red}." if m.thresholds else "")
        for m in metrics
    )

    return f"""You are the Smart Offer AI Assistant, an expert analytics companion for the Smart Offer dashboard.

Your role is to help users understand:
1. Dashboard KPIs, metrics, and how to read charts
2. Allocation and capacity management concepts
3. Financial exposure and portfolio risk analysis
4. Simulation scenario outcomes

## Metric Dictionary
{metrics_context}

## Guidelines
- Always reference specific metrics by name and explain their formulas
- Use the threshold values (Green/Amber/Red) to interpret metric health
- Be concise but thorough — executives need actionable insights
- If asked about a metric not in the dictionary, say so honestly
- Format responses with markdown for readability (bold, bullets, etc.)
- When discussing trends, suggest what actions the user could take
- Respond in the same language as the user's message"""


async def chat_with_gemini(request: ChatRequest) -> ChatResponse:
    """Send a message to Gemini API with metric context."""
    api_key = settings.gemini_api_key

    if not api_key:
        return ChatResponse(
            reply="⚠️ **Gemini API key not configured.** Please set `GEMINI_API_KEY` in your environment variables to enable the AI assistant.\n\nIn the meantime, you can click **\"How to Read This Dashboard\"** on any tab to see metric documentation.",
            sources=["Configuration required"],
        )

    system_prompt = _build_system_prompt(request.active_tab)

    # Build conversation contents
    contents = []

    # Add history
    for msg in request.history[-10:]:  # Keep last 10 messages for context
        contents.append({
            "role": msg.role,
            "parts": [{"text": msg.content}],
        })

    # Add current user message
    contents.append({
        "role": "user",
        "parts": [{"text": request.message}],
    })

    payload = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": contents,
        "generationConfig": {
            "temperature": 0.3,
            "topP": 0.8,
            "maxOutputTokens": 1024,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{GEMINI_API_URL}?key={api_key}",
                json=payload,
                headers={"Content-Type": "application/json"},
            )

            if resp.status_code != 200:
                logger.error("Gemini API error: %s %s", resp.status_code, resp.text[:200])
                return ChatResponse(
                    reply=f"⚠️ Gemini API returned an error (HTTP {resp.status_code}). Please try again later.",
                    sources=[],
                )

            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                return ChatResponse(reply="I couldn't generate a response. Please rephrase your question.", sources=[])

            reply_text = candidates[0]["content"]["parts"][0]["text"]

            # Extract metric IDs mentioned in the response for source attribution
            mentioned_metrics = [
                m.label for m in METRIC_DICTIONARY
                if m.id in reply_text.lower() or m.label.lower() in reply_text.lower()
            ]

            return ChatResponse(reply=reply_text, sources=mentioned_metrics[:5])

    except httpx.TimeoutException:
        return ChatResponse(reply="⏳ The AI service timed out. Please try a shorter question.", sources=[])
    except Exception as e:
        logger.exception("Chat service error: %s", e)
        return ChatResponse(reply="❌ An unexpected error occurred. Please try again.", sources=[])
