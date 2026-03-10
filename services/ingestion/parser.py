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
from enum import IntEnum
from typing import Any

CSV_COLUMN_COUNT = 52
KNOWN_STATUSES = {
    "Under Study",
    "In Progress",
    "On Offer",
    "FollowUp",
    "Won-End",
    "Abandoned",
    "Rejected",
    "Won",
    "Lost",
    "Cancelled",
}

EXPECTED_HEADERS = [
    "Issue key",
    "Issue id",
    "Assignee",
    "Status",
    "Summary",
    "Custom field (Type of Service)",
    "Component/s",
    "Custom field (Offering Type)",
    "Priority",
    "Custom field (Total amount (€) weighted)",
    "Custom field (Type Business Opportunity)",
    "Custom field (Country)",
    "Custom field (Market)",
    "Custom field (Market Manager)",
    "Custom field (DN Manager)",
    "Custom field (Operations Manager)",
    "Custom field (Renewal)",
    "Custom field (Código GEP)",
    "Custom field (Temporal Scope)",
    "Custom field (Receipt of application)",
    "Custom field (Delivery Commitment)",
    *["Custom field (Participants)"] * 15,
    "Custom field (Total Amount (euros))",
    "Custom field (Budg.Loc.Currency)",
    "Custom field (Margin)",
    "Custom field (Offer Code (NG))",
    "Custom field (Offer Description (NG))",
    "Custom field (Transversal offer)",
    "Updated",
    "Created",
    "Custom field (Proposal Due Date)",
    "Custom field (Observations)",
    "Resolved",
    "Custom field (Cloud – Amount Infrastructure €)",
    "Custom field (Cloud – Amount Services €)",
    "Custom field (Type of Cloud Service)",
    "Custom field (Cloud Provider)",
    "Custom field (Others Cloud Providers)",
]


class CsvCol(IntEnum):
    ISSUE_KEY = 0
    ISSUE_ID = 1
    ASSIGNEE = 2
    STATUS = 3
    SUMMARY = 4
    TYPE_OF_SERVICE = 5
    COMPONENT = 6
    OFFERING_TYPE = 7
    PRIORITY = 8
    WEIGHTED_AMOUNT = 9
    BUSINESS_OPPORTUNITY_TYPE = 10
    COUNTRY = 11
    MARKET = 12
    MARKET_MANAGER = 13
    DN_MANAGER = 14
    OPERATIONS_MANAGER = 15
    RENEWAL = 16
    GEP_CODE = 17
    TEMPORAL_SCOPE = 18
    RECEIPT_OF_APPLICATION = 19
    DELIVERY_COMMITMENT = 20
    PARTICIPANTS_START = 21
    PARTICIPANTS_END = 36
    TOTAL_AMOUNT = 36
    LOCAL_CURRENCY_BUDGET = 37
    MARGIN = 38
    OFFER_CODE_NG = 39
    OFFER_DESCRIPTION_NG = 40
    TRANSVERSAL_OFFER = 41
    UPDATED = 42
    CREATED = 43
    PROPOSAL_DUE_DATE = 44
    OBSERVATIONS = 45
    RESOLVED = 46
    CLOUD_INFRA_AMOUNT = 47
    CLOUD_SERVICES_AMOUNT = 48
    CLOUD_SERVICE_TYPE = 49
    CLOUD_PROVIDER = 50
    OTHER_CLOUD_PROVIDERS = 51


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

    for value in row[CsvCol.PARTICIPANTS_START : CsvCol.PARTICIPANTS_END]:
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


def _validate_header(header: list[str]) -> dict[str, Any] | None:
    if len(header) != CSV_COLUMN_COUNT:
        return {
            "row": 0,
            "severity": "CRITICAL",
            "field": "header",
            "message": f"Expected {CSV_COLUMN_COUNT} columns, got {len(header)}",
        }

    mismatches: list[str] = []
    for index, expected in enumerate(EXPECTED_HEADERS):
        if (header[index] or "").strip() != expected:
            mismatches.append(f"col {index + 1}: expected '{expected}', got '{header[index]}'")
            if len(mismatches) >= 3:
                break

    if mismatches:
        return {
            "row": 0,
            "severity": "CRITICAL",
            "field": "header",
            "message": "CSV header does not match Jira contract; " + "; ".join(mismatches),
        }

    return None


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

    header_error = _validate_header(header)
    if header_error is not None:
        return [], [header_error]

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

        issue_key = _clean_text(row[CsvCol.ISSUE_KEY])
        assignee = _clean_text(row[CsvCol.ASSIGNEE])
        created_at = _parse_date(row[CsvCol.CREATED])

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

        status = _clean_text(row[CsvCol.STATUS]) or "Unknown"
        if status not in KNOWN_STATUSES:
            errors.append(
                {
                    "row": row_number,
                    "severity": "INFO",
                    "field": "Status",
                    "message": f"Unknown status value '{status}'",
                }
            )

        start_date = _parse_date(row[CsvCol.RECEIPT_OF_APPLICATION])
        end_date = _parse_date(row[CsvCol.DELIVERY_COMMITMENT])
        updated_at = _parse_date(row[CsvCol.UPDATED])
        proposal_due_date = _parse_date(row[CsvCol.PROPOSAL_DUE_DATE])
        resolved_at = _parse_date(row[CsvCol.RESOLVED])

        for field_name, raw_value in (
            ("Receipt of application", row[CsvCol.RECEIPT_OF_APPLICATION]),
            ("Delivery Commitment", row[CsvCol.DELIVERY_COMMITMENT]),
            ("Updated", row[CsvCol.UPDATED]),
            ("Proposal Due Date", row[CsvCol.PROPOSAL_DUE_DATE]),
            ("Resolved", row[CsvCol.RESOLVED]),
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

        weighted_amount = _parse_number(row[CsvCol.WEIGHTED_AMOUNT])
        total_amount = _parse_number(row[CsvCol.TOTAL_AMOUNT])
        local_currency_budget = _parse_number(row[CsvCol.LOCAL_CURRENCY_BUDGET])
        margin = _parse_number(row[CsvCol.MARGIN])
        cloud_infra_amount = _parse_number(row[CsvCol.CLOUD_INFRA_AMOUNT])
        cloud_services_amount = _parse_number(row[CsvCol.CLOUD_SERVICES_AMOUNT])

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
            "jira_id": int(_parse_number(row[CsvCol.ISSUE_ID]) or 0),
            "owner": assignee,
            "status": status,
            "summary": _clean_text(row[CsvCol.SUMMARY]) or "",
            "type_of_service": _clean_text(row[CsvCol.TYPE_OF_SERVICE]),
            "practice": _clean_text(row[CsvCol.TYPE_OF_SERVICE]),
            "offering_type": _clean_text(row[CsvCol.OFFERING_TYPE]),
            "priority": _clean_text(row[CsvCol.PRIORITY]),
            "weighted_amount": weighted_amount,
            "business_opportunity_type": _clean_text(row[CsvCol.BUSINESS_OPPORTUNITY_TYPE]),
            "country": _clean_text(row[CsvCol.COUNTRY]),
            "market": _clean_text(row[CsvCol.MARKET]),
            "market_manager": _clean_text(row[CsvCol.MARKET_MANAGER]),
            "dn_manager": _clean_text(row[CsvCol.DN_MANAGER]) or "",
            "operations_manager": _clean_text(row[CsvCol.OPERATIONS_MANAGER]),
            "renewal": _parse_bool(row[CsvCol.RENEWAL]),
            "gep_code": _clean_text(row[CsvCol.GEP_CODE]),
            "temporal_scope": _clean_text(row[CsvCol.TEMPORAL_SCOPE]),
            "start_date": start_date,
            "end_date": end_date,
            "participants": _parse_participants(row, assignee),
            "total_amount": total_amount,
            "local_currency_budget": local_currency_budget,
            "margin": margin,
            "offer_code_ng": _clean_text(row[CsvCol.OFFER_CODE_NG]),
            "offer_description_ng": _clean_text(row[CsvCol.OFFER_DESCRIPTION_NG]),
            "transversal": _parse_bool(row[CsvCol.TRANSVERSAL_OFFER]),
            "updated_at": updated_at,
            "created_at": created_at,
            "proposal_due_date": proposal_due_date,
            "observations": _clean_text(row[CsvCol.OBSERVATIONS]),
            "resolved_at": resolved_at,
            "cloud_infra_amount": cloud_infra_amount,
            "cloud_services_amount": cloud_services_amount,
            "cloud_service_type": _clean_text(row[CsvCol.CLOUD_SERVICE_TYPE]),
            "cloud_provider": _clean_text(row[CsvCol.CLOUD_PROVIDER]),
            "other_cloud_providers": _clean_text(row[CsvCol.OTHER_CLOUD_PROVIDERS]),
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
