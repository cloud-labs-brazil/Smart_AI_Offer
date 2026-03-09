"""
Smart Offer — Ingestion Service: Reliability Checks

Discrepancy validation rules for CSV vs API data comparison.

@see indra_design_system/ingestion_strategy.md
@see .claude/rules/05-governance-metrics-lineage.md
"""

from typing import List, Dict, Any

class DiscrepancyReport:
    """Discrepancy report from ingestion validation."""
    def __init__(self, record_count_delta: float, allocation_delta: float, revenue_delta: float, timestamp: str):
        self.record_count_delta = record_count_delta
        self.allocation_delta = allocation_delta
        self.revenue_delta = revenue_delta
        self.timestamp = timestamp
        
        # Hardcoded thresholds per design guidelines
        self.status = "VERIFIED" if (
            abs(record_count_delta) <= 0.01 and
            abs(allocation_delta) <= 0.005 and 
            abs(revenue_delta) <= 0.005
        ) else "UNVERIFIED"

def validate_ingestion(old_records: List[Dict[str, Any]], new_records: List[Dict[str, Any]], timestamp: str) -> DiscrepancyReport:
    """Validate that new ingestion matches expectations within thresholds compared to old data."""
    if not old_records:
        return DiscrepancyReport(0.0, 0.0, 0.0, timestamp)

    old_count = len(old_records)
    new_count = len(new_records)
    
    old_revenue = sum([r.get("totalAmount", 0) for r in old_records])
    new_revenue = sum([r.get("totalAmount", 0) for r in new_records])
    
    count_delta = (new_count - old_count) / old_count if old_count > 0 else 0.0
    revenue_delta = (new_revenue - old_revenue) / old_revenue if old_revenue > 0 else 0.0
    
    return DiscrepancyReport(
        record_count_delta=count_delta,
        allocation_delta=0.0,  # Placeholder, needs matching logic for daily allocation extraction
        revenue_delta=revenue_delta,
        timestamp=timestamp
    )
