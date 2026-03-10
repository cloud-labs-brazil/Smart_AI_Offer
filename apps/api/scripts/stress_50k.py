"""Generate and ingest a 50k-row CSV to stress-test Smart Offer ingestion."""

from __future__ import annotations

import argparse
import csv
import io
import time
from dataclasses import dataclass

import httpx


@dataclass
class StressResult:
    rows: int
    generation_seconds: float
    upload_seconds: float
    rows_per_second: float
    ingested_count: int


HEADER = [
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


def _build_row(index: int) -> list[str]:
    issue_id = 100000 + index
    total_amount = float((index % 1000) + 1000)
    row = [""] * 52
    row[0] = f"OFBRA-STRESS-{index}"
    row[1] = str(issue_id)
    row[2] = f"Owner {index % 200}"
    row[3] = "In Progress"
    row[4] = f"Stress offer {index}"
    row[5] = "Service"
    row[6] = f"Practice {index % 20}"
    row[7] = "Offering"
    row[8] = "Medium"
    row[9] = f"{total_amount * 0.4:.2f}"
    row[10] = "Proposal"
    row[11] = "Brazil"
    row[12] = "ICT"
    row[13] = "Manager"
    row[14] = "DN Manager"
    row[15] = "Ops Manager"
    row[16] = "No"
    row[17] = f"GEP-{index}"
    row[18] = "1.0"
    row[19] = "01/01/26 08:00"
    row[20] = "15/01/26 18:00"
    row[21] = f"Participant {index % 350}"
    row[22] = f"Participant {(index + 1) % 350}"
    row[36] = f"{total_amount:.2f}"
    row[37] = f"{total_amount * 5:.2f}"
    row[38] = f"{10 + (index % 25):.2f}"
    row[41] = "No"
    row[42] = "01/01/26 10:00"
    row[43] = "01/01/26 07:00"
    row[44] = "20/01/26 10:00"
    row[45] = "stress run"
    return row


def generate_csv(rows: int) -> bytes:
    output = io.StringIO(newline="")
    writer = csv.writer(output)
    writer.writerow(HEADER)
    for index in range(1, rows + 1):
        writer.writerow(_build_row(index))
    return output.getvalue().encode("utf-8")


def run_stress(api_url: str, rows: int, timeout_seconds: int) -> StressResult:
    generation_start = time.perf_counter()
    csv_bytes = generate_csv(rows)
    generation_seconds = time.perf_counter() - generation_start

    upload_start = time.perf_counter()
    with httpx.Client(timeout=timeout_seconds) as client:
        response = client.post(
            f"{api_url}/upload",
            headers={"X-User-Role": "SYSTEM_ADMIN"},
            files={"file": ("stress_50k.csv", csv_bytes, "text/csv")},
        )
    upload_seconds = time.perf_counter() - upload_start
    response.raise_for_status()

    payload = response.json()
    ingested_count = int(payload.get("ingested_count", 0))
    rows_per_second = rows / upload_seconds if upload_seconds > 0 else 0.0

    return StressResult(
        rows=rows,
        generation_seconds=generation_seconds,
        upload_seconds=upload_seconds,
        rows_per_second=rows_per_second,
        ingested_count=ingested_count,
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Run Smart Offer 50k ingestion stress test.")
    parser.add_argument("--api-url", default="http://localhost:8000", help="Base URL of the backend API")
    parser.add_argument("--rows", type=int, default=50000, help="How many CSV rows to generate")
    parser.add_argument("--timeout-seconds", type=int, default=1800, help="HTTP timeout for upload call")
    args = parser.parse_args()

    result = run_stress(
        api_url=args.api_url.rstrip("/"),
        rows=args.rows,
        timeout_seconds=args.timeout_seconds,
    )

    print(f"Rows generated: {result.rows}")
    print(f"Generation time: {result.generation_seconds:.2f}s")
    print(f"Upload time: {result.upload_seconds:.2f}s")
    print(f"Throughput: {result.rows_per_second:.2f} rows/s")
    print(f"Ingested count: {result.ingested_count}")

    if result.ingested_count < result.rows:
        print("Stress test failed: backend ingested fewer rows than generated.")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
