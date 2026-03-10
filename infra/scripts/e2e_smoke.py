"""Smart Offer end-to-end smoke test.

Prerequisite: frontend, backend, and database are already running.
"""

from __future__ import annotations

import csv
import io
import sys
from dataclasses import dataclass

import httpx


@dataclass
class SmokeConfig:
    web_url: str = "http://localhost:3000"
    api_url: str = "http://localhost:8000"


def _sample_csv_bytes() -> bytes:
    header = [
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
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
        "Custom field (Participants)",
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
    row = [""] * 52
    row[0] = "OFBRA-SMOKE-1"
    row[1] = "999001"
    row[2] = "Smoke User"
    row[3] = "In Progress"
    row[4] = "Smoke test offer"
    row[5] = "Service"
    row[6] = "Practice Smoke"
    row[7] = "Offering"
    row[8] = "High"
    row[9] = "5000"
    row[10] = "Proposal"
    row[11] = "Brazil"
    row[12] = "ICT"
    row[13] = "Manager One"
    row[14] = "DN Manager"
    row[15] = "Ops Manager"
    row[16] = "No"
    row[17] = "GEP-SMOKE"
    row[18] = "1.0"
    row[19] = "01/01/26 08:00"
    row[20] = "01/01/26 18:00"
    row[21] = "Smoke Participant"
    row[36] = "5000"
    row[37] = "25000"
    row[38] = "20"
    row[41] = "No"
    row[42] = "01/01/26 10:00"
    row[43] = "01/01/26 07:00"
    row[44] = "05/01/26 10:00"
    row[45] = "smoke"

    output = io.StringIO(newline="")
    writer = csv.writer(output)
    writer.writerow(header)
    writer.writerow(row)
    return output.getvalue().encode("utf-8")


def run_smoke(config: SmokeConfig) -> None:
    with httpx.Client(timeout=30.0) as client:
        web = client.get(config.web_url)
        web.raise_for_status()

        health = client.get(f"{config.api_url}/health")
        health.raise_for_status()

        upload = client.post(
            f"{config.api_url}/upload",
            headers={"X-User-Role": "SYSTEM_ADMIN"},
            files={"file": ("smoke.csv", _sample_csv_bytes(), "text/csv")},
        )
        upload.raise_for_status()

        offers = client.get(
            f"{config.api_url}/offers",
            headers={"X-User-Role": "SYSTEM_ADMIN"},
            params={"page": 1, "page_size": 5},
        )
        offers.raise_for_status()
        offers_payload = offers.json()
        if offers_payload.get("total", 0) < 1:
            raise RuntimeError("Smoke test failed: no offers available after upload.")

        allocations = client.get(
            f"{config.api_url}/allocations",
            headers={"X-User-Role": "SYSTEM_ADMIN"},
            params={"page_size": 5},
        )
        allocations.raise_for_status()
        alloc_payload = allocations.json()
        if alloc_payload.get("total", 0) < 1:
            raise RuntimeError("Smoke test failed: allocations not computed.")

    print("Smoke test passed: web+api reachable, upload processed, data visible.")


def main() -> int:
    config = SmokeConfig()
    try:
        run_smoke(config)
    except Exception as exc:
        print(f"Smoke test failed: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
