"""
Smart Offer — Correlation ID & Structured Logging Middleware
=============================================================

1. Injects an X-Correlation-ID into every request/response
   (from the incoming header or auto-generated).
2. Configures Python's `logging` to emit structured JSON lines
   tagged with the correlation ID.
"""

from __future__ import annotations

import json
import logging
import sys
import uuid
from contextvars import ContextVar
from datetime import datetime, timezone

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

# ---------- context var (async-safe) ----------
_correlation_id: ContextVar[str] = ContextVar("correlation_id", default="-")

HEADER_NAME = "X-Correlation-ID"


def get_correlation_id() -> str:
    """Return the correlation ID for the current async context."""
    return _correlation_id.get()


# ---------- Middleware ----------

class CorrelationMiddleware(BaseHTTPMiddleware):
    """
    Starlette middleware that:
      1. Reads or generates an X-Correlation-ID.
      2. Stores it in a `ContextVar` for logging.
      3. Echoes it back in the response header.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        cid = request.headers.get(HEADER_NAME) or str(uuid.uuid4())
        token = _correlation_id.set(cid)

        try:
            response = await call_next(request)
            response.headers[HEADER_NAME] = cid
            return response
        finally:
            _correlation_id.reset(token)


# ---------- Structured JSON log formatter ----------

class StructuredJsonFormatter(logging.Formatter):
    """
    Outputs each log record as a single JSON object per line.
    Includes: timestamp (ISO-8601), level, logger, message,
    correlation_id, plus any `extra` keys.
    """

    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "correlation_id": _correlation_id.get(),
        }

        # Merge extra attrs (exclude standard LogRecord internals)
        _INTERNAL = {
            "name", "msg", "args", "created", "relativeCreated",
            "exc_info", "exc_text", "stack_info", "lineno", "funcName",
            "pathname", "filename", "module", "levelno", "levelname",
            "msecs", "message", "processName", "process", "threadName", "thread",
            "taskName",
        }
        for key, val in record.__dict__.items():
            if key not in _INTERNAL and not key.startswith("_"):
                try:
                    json.dumps(val)
                    payload[key] = val
                except (TypeError, ValueError):
                    payload[key] = str(val)

        if record.exc_info and record.exc_info[1]:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload, default=str, ensure_ascii=False)


def setup_structured_logging(level: int = logging.INFO) -> None:
    """
    Replace the root logger's handlers with a single structured
    JSON handler writing to ``stderr``.
    Call this once during app startup (e.g. in ``main.py``).
    """
    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(StructuredJsonFormatter())

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level)

    # Silence overly noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
