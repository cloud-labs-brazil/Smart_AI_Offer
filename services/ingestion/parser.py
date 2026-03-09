"""
Smart Offer — Ingestion Service: CSV Parser

Parses Jira CSV exports (RFC 4180) with 52-column schema.
Extracts, validates, and normalizes offer records.

@see .claude/rules/04-data-platform-jira-csv.md
@see indra_design_system/ingestion_strategy.md
"""

from __future__ import annotations

import csv
import io
import re
from datetime import datetime, timezone
from typing import Any

CSV_COLUMN_COUNT = 52
KNOWN_STATUSES = {"Under Study", "In Progress", "Won", "Lost", "Cancelled"}


def _clean_text(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


def _parse_date(value: str | None) -> str | None:
    raw = _clean_text(value)
    if raw is None:
        return None
    formats = ("%d/%m/%y %H:%M", "%d/%m/%Y %H:%M", "%d/%m/%y", "%d/%m/%Y")
    for fmt in formats:
        try:
            parsed = datetime.strptime(raw, fmt).replace(tzinfo=timezone.utc)
            return parsed.isoformat().replace("+00:00", "Z")
        except ValueError:
            continue
    return None


def _parse_bool(value: str | None) -> bool | None:
    raw = _clean_text(value)
    if raw is None:
        return None
    lowered = raw.lower()
    if lowered == "yes":
        return True
    if lowered == "no":
        return False
    return None


def _parse_number(value: str | None) -> float | None:
    raw = _clean_text(value)
    if raw is None:
        return None

    compact = re.sub(r"[^\d,.\-]", "", raw)
    if not compact:
        return None

    if "," in compact and "." in compact:
        if compact.rfind(",") > compact.rfind("."):
            compact = compact.replace(".", "").replace(",", ".")
        else:
            compact = compact.replace(",", "")
    elif "," in compact:
        left, _, right = compact.partition(",")
        if right and len(right) <= 2:
            compact = f"{left}.{right}"
        else:
            compact = compact.replace(",", "")

    try:
        return float(compact)
    except ValueError:
        return None


def _parse_participants(row: list[str], assignee: str | None) -> list[str]:
    participants: list[str] = []
    seen: set[str] = set()
    owner_key = (assignee or "").strip().lower()

    for value in row[21:36]:
        candidate = _clean_text(value)
        if candidate is None:
            continue
        lowered = candidate.lower()
        if lowered == owner_key or lowered in seen:
            continue
        seen.add(lowered)
        participants.append(candidate)

    return participants


def _iso_to_datetime(value: str | None) -> datetime | None:
    if value is None:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def parse_csv_bytes(content: bytes) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Parse a UTF-8 Jira CSV payload."""

    decoded = content.decode("utf-8-sig", errors="replace")
    return parse_csv_text(decoded)


def parse_csv_text(content: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Parse CSV text into normalized records and row-level errors."""

    errors: list[dict[str, Any]] = []
    dedup: dict[str, dict[str, Any]] = {}

    reader = csv.reader(io.StringIO(content, newline=""))
    header = next(reader, None)
    if header is None:
        return [], [{"row": 0, "severity": "CRITICAL", "field": "file", "message": "Empty CSV"}]

    if len(header) != CSV_COLUMN_COUNT:
        return [], [
            {
                "row": 0,
                "severity": "CRITICAL",
                "field": "header",
                "message": f"Expected {CSV_COLUMN_COUNT} columns, got {len(header)}",
            }
        ]

    for row_number, row in enumerate(reader, start=2):
        if len(row) != CSV_COLUMN_COUNT:
            errors.append(
                {
                    "row": row_number,
                    "severity": "CRITICAL",
                    "field": "row",
                    "message": f"Expected {CSV_COLUMN_COUNT} columns, got {len(row)}",
                }
            )
            continue

        issue_key = _clean_text(row[0])
        assignee = _clean_text(row[2])
        created_at = _parse_date(row[43])

        if issue_key is None:
            errors.append(
                {
                    "row": row_number,
                    "severity": "CRITICAL",
                    "field": "Issue key",
                    "message": "Missing required Issue key",
                }
            )
            continue

        if assignee is None:
            errors.append(
                {
                    "row": row_number,
                    "severity": "CRITICAL",
                    "field": "Assignee",
                    "message": "Missing required Assignee",
                }
            )
            continue

        if created_at is None:
            errors.append(
                {
                    "row": row_number,
                    "severity": "CRITICAL",
                    "field": "Created",
                    "message": "Missing or invalid Created date",
                }
            )
            continue

        status = _clean_text(row[3]) or "Unknown"
        if status not in KNOWN_STATUSES:
            errors.append(
                {
                    "row": row_number,
                    "severity": "INFO",
                    "field": "Status",
                    "message": f"Unknown status value '{status}'",
                }
            )

        start_date = _parse_date(row[19])
        end_date = _parse_date(row[20])
        updated_at = _parse_date(row[42])
        proposal_due_date = _parse_date(row[44])
        resolved_at = _parse_date(row[46])

        for field_name, raw_value in (
            ("Receipt of application", row[19]),
            ("Delivery Commitment", row[20]),
            ("Updated", row[42]),
            ("Proposal Due Date", row[44]),
            ("Resolved", row[46]),
        ):
            if _clean_text(raw_value) and _parse_date(raw_value) is None:
                errors.append(
                    {
                        "row": row_number,
                        "severity": "WARNING",
                        "field": field_name,
                        "message": f"Invalid date '{raw_value}' normalized to null",
                    }
                )

        if start_date and end_date and _iso_to_datetime(start_date) > _iso_to_datetime(end_date):
            errors.append(
                {
                    "row": row_number,
                    "severity": "ERROR",
                    "field": "date_range",
                    "message": "Start date is after end date",
                }
            )

        weighted_amount = _parse_number(row[9])
        total_amount = _parse_number(row[36])
        local_currency_budget = _parse_number(row[37])
        margin = _parse_number(row[38])
        cloud_infra_amount = _parse_number(row[47])
        cloud_services_amount = _parse_number(row[48])

        for field_name, value in (
            ("weightedAmount", weighted_amount),
            ("totalAmount", total_amount),
            ("localCurrencyBudget", local_currency_budget),
            ("cloudInfraAmount", cloud_infra_amount),
            ("cloudServicesAmount", cloud_services_amount),
        ):
            if value is not None and value < 0:
                errors.append(
                    {
                        "row": row_number,
                        "severity": "WARNING",
                        "field": field_name,
                        "message": "Negative financial amount",
                    }
                )

        record: dict[str, Any] = {
            "id": issue_key,
            "jira_id": int(_parse_number(row[1]) or 0),
            "owner": assignee,
            "status": status,
            "summary": _clean_text(row[4]) or "",
            "type_of_service": _clean_text(row[5]),
            "practice": _clean_text(row[6]),
            "offering_type": _clean_text(row[7]),
            "priority": _clean_text(row[8]),
            "weighted_amount": weighted_amount,
            "business_opportunity_type": _clean_text(row[10]),
            "country": _clean_text(row[11]),
            "market": _clean_text(row[12]),
            "market_manager": _clean_text(row[13]),
            "dn_manager": _clean_text(row[14]) or "",
            "operations_manager": _clean_text(row[15]),
            "renewal": _parse_bool(row[16]),
            "gep_code": _clean_text(row[17]),
            "temporal_scope": _clean_text(row[18]),
            "start_date": start_date,
            "end_date": end_date,
            "participants": _parse_participants(row, assignee),
            "total_amount": total_amount,
            "local_currency_budget": local_currency_budget,
            "margin": margin,
            "offer_code_ng": _clean_text(row[39]),
            "offer_description_ng": _clean_text(row[40]),
            "transversal": _parse_bool(row[41]),
            "updated_at": updated_at,
            "created_at": created_at,
            "proposal_due_date": proposal_due_date,
            "observations": _clean_text(row[45]),
            "resolved_at": resolved_at,
            "cloud_infra_amount": cloud_infra_amount,
            "cloud_services_amount": cloud_services_amount,
            "cloud_service_type": _clean_text(row[49]),
            "cloud_provider": _clean_text(row[50]),
            "other_cloud_providers": _clean_text(row[51]),
        }

        previous = dedup.get(issue_key)
        if previous is None:
            dedup[issue_key] = record
            continue

        errors.append(
            {
                "row": row_number,
                "severity": "ERROR",
                "field": "Issue key",
                "message": f"Duplicate issue key '{issue_key}' - keeping latest by Updated",
            }
        )
        prev_updated = _iso_to_datetime(previous.get("updated_at"))
        curr_updated = _iso_to_datetime(record.get("updated_at"))
        if prev_updated is None or (curr_updated is not None and curr_updated >= prev_updated):
            dedup[issue_key] = record

    return list(dedup.values()), errors
