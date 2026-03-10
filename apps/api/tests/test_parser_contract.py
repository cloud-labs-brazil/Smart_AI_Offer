from __future__ import annotations

import csv
import io

from services.ingestion.parser import EXPECTED_HEADERS, CsvCol, parse_csv_text


def _build_minimal_row() -> list[str]:
    row = [""] * 52
    row[CsvCol.ISSUE_KEY] = "OFBRA-9999"
    row[CsvCol.ISSUE_ID] = "9999"
    row[CsvCol.ASSIGNEE] = "asbraz"
    row[CsvCol.STATUS] = "On Offer"
    row[CsvCol.SUMMARY] = "Mapping contract test"
    row[CsvCol.TYPE_OF_SERVICE] = "SGE - SAP"
    row[CsvCol.COMPONENT] = "Telefonica | VIVO"
    row[CsvCol.DN_MANAGER] = "asbraz"
    row[CsvCol.RECEIPT_OF_APPLICATION] = "01/03/26 08:00"
    row[CsvCol.DELIVERY_COMMITMENT] = "05/03/26 18:00"
    row[CsvCol.UPDATED] = "03/03/26 10:00"
    row[CsvCol.CREATED] = "01/03/26 07:00"
    row[CsvCol.TOTAL_AMOUNT] = "1000000"
    row[CsvCol.MARGIN] = "24"
    return row


def _to_csv_text(header: list[str], rows: list[list[str]]) -> str:
    out = io.StringIO(newline="")
    writer = csv.writer(out)
    writer.writerow(header)
    writer.writerows(rows)
    return out.getvalue()


def test_parser_maps_practice_from_type_of_service_column() -> None:
    csv_text = _to_csv_text(EXPECTED_HEADERS, [_build_minimal_row()])
    records, errors = parse_csv_text(csv_text)

    assert len(records) == 1
    assert errors == []

    record = records[0]
    assert record["practice"] == "SGE - SAP"
    assert record["type_of_service"] == "SGE - SAP"


def test_parser_rejects_header_mismatch() -> None:
    bad_header = list(EXPECTED_HEADERS)
    bad_header[CsvCol.TYPE_OF_SERVICE] = "Custom field (Type Service INVALID)"

    csv_text = _to_csv_text(bad_header, [_build_minimal_row()])
    records, errors = parse_csv_text(csv_text)

    assert records == []
    assert len(errors) == 1
    assert errors[0]["severity"] == "CRITICAL"
    assert "col 6" in errors[0]["message"]
