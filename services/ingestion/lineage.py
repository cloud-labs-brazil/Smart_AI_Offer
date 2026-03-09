"""
Smart Offer — Ingestion Service: Data Lineage

SHA-256 hashing, correlation IDs, and audit trail capture.

@see .claude/rules/05-governance-metrics-lineage.md
"""

import hashlib
import uuid
from datetime import datetime
from typing import Dict, Any

def generate_correlation_id() -> str:
    """Generate a unique tracking identifier for an ingestion run."""
    return str(uuid.uuid4())

def hash_content(content: bytes) -> str:
    """Compute SHA-256 hash of raw byte content."""
    hasher = hashlib.sha256()
    hasher.update(content)
    return hasher.hexdigest()

def create_checkpoint(action: str, status: str, correlation_id: str, details: Dict[str, Any] = None) -> Dict[str, Any]:
    """Create an audit log checkpoint for data lineage."""
    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "correlation_id": correlation_id,
        "action": action,
        "status": status,
        "details": details or {}
    }
