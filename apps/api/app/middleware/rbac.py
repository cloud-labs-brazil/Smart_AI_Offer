"""
Smart Offer — RBAC (Role-Based Access Control) Middleware
=========================================================

Provides a lightweight role guard for FastAPI routes:

  - SYSTEM_ADMIN: full access (upload, settings, etc.)
  - ANALYST: read-only access to dashboards and KPIs.
  - VIEWER: read-only access, no export.

The role is resolved from the X-User-Role header for now.
In production, this would decode a JWT / Azure AD token.
"""

from __future__ import annotations

from enum import Enum
from functools import wraps
from typing import Callable, Sequence

from fastapi import HTTPException, Request


class Role(str, Enum):
    SYSTEM_ADMIN = "SYSTEM_ADMIN"
    ANALYST = "ANALYST"
    VIEWER = "VIEWER"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _resolve_role(request: Request) -> Role:
    """
    Extract the user role from the request.
    Defaults to VIEWER when the header is absent.
    """
    raw = request.headers.get("X-User-Role", "VIEWER").upper()
    try:
        return Role(raw)
    except ValueError:
        return Role.VIEWER


def _role_rank(role: Role) -> int:
    """Higher rank = more privileges."""
    return {
        Role.VIEWER: 0,
        Role.ANALYST: 1,
        Role.SYSTEM_ADMIN: 2,
    }.get(role, 0)


# ---------------------------------------------------------------------------
# Dependency — FastAPI Depends() style
# ---------------------------------------------------------------------------

def require_role(*allowed: Role):
    """
    FastAPI dependency that raises 403 when the caller's role is
    not in the allowed set.

    Usage:
        @router.post("/upload", dependencies=[Depends(require_role(Role.SYSTEM_ADMIN))])
        async def upload_csv(...): ...
    """
    async def _guard(request: Request):
        current = _resolve_role(request)
        if current not in allowed:
            raise HTTPException(
                status_code=403,
                detail=f"Forbidden — role '{current.value}' cannot access this resource. "
                       f"Allowed roles: {[r.value for r in allowed]}",
            )
        return current

    return _guard


def require_min_role(minimum: Role):
    """
    FastAPI dependency that requires the caller to have *at least*
    the specified role level (rank-based comparison).

    Usage:
        @router.get("/kpis", dependencies=[Depends(require_min_role(Role.ANALYST))])
        async def get_kpis(...): ...
    """
    async def _guard(request: Request):
        current = _resolve_role(request)
        if _role_rank(current) < _role_rank(minimum):
            raise HTTPException(
                status_code=403,
                detail=f"Forbidden — role '{current.value}' does not meet minimum "
                       f"required role '{minimum.value}'.",
            )
        return current

    return _guard
