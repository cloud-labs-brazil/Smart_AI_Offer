"""
Smart Offer — Ingestion Service: Normalizer

Data normalization, deduplication, and name resolution.

@see .claude/rules/02-business-domain.md (dedup rules)
@see .claude/rules/04-data-platform-jira-csv.md (normalization rules)
"""

from __future__ import annotations

from typing import Any

STATUS_MAP = {
    "under study": "Under Study",
    "in progress": "In Progress",
    "won": "Won",
    "lost": "Lost",
    "cancelled": "Cancelled",
}


def _resolve_name(name: str | None, name_map: dict[str, str] | None = None) -> str:
    if name is None:
        return ""
    cleaned = name.strip()
    if not cleaned:
        return ""
    if name_map and cleaned in name_map:
        return name_map[cleaned]
    if " " not in cleaned and cleaned.lower() == cleaned:
        return f"[unresolved] {cleaned}"
    return cleaned


def normalize_records(
    records: list[dict[str, Any]],
    name_map: dict[str, str] | None = None,
) -> list[dict[str, Any]]:
    """Normalize parsed records for persistence."""

    normalized: list[dict[str, Any]] = []
    for record in records:
        owner_raw = record.get("owner")
        owner = _resolve_name(owner_raw, name_map)

        participants: list[str] = []
        seen: set[str] = set()
        for participant in record.get("participants", []):
            participant_name = _resolve_name(participant, name_map)
            if not participant_name:
                continue
            key = participant_name.lower()
            if key == owner.lower() or key in seen:
                continue
            seen.add(key)
            participants.append(participant_name)

        normalized_record = dict(record)
        status = (record.get("status") or "").strip().lower()
        normalized_record["status"] = STATUS_MAP.get(status, record.get("status") or "Unknown")
        normalized_record["owner"] = owner
        normalized_record["dn_manager"] = _resolve_name(record.get("dn_manager"), name_map)
        normalized_record["market_manager"] = _resolve_name(record.get("market_manager"), name_map) or None
        normalized_record["operations_manager"] = _resolve_name(record.get("operations_manager"), name_map) or None
        normalized_record["participants"] = participants
        normalized.append(normalized_record)

    return normalized
