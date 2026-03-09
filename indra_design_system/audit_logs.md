# Audit Logs & Repository Structure

**Date:** 2026-03-04
**Status:** ✅ VERIFIED

## 1. Repository Structure
The repository has been successfully compartmentalized into two discrete services:
- **`backend/`**: Contains FastAPI, PostgreSQL models, Checkpoint system, and Allocation Engine.
- **`frontend/`**: Contains Next.js 15, React 19, Zustand store, and the 7-module dashboard.
- **Root**: `docker-compose.yml` orchestrates the entire cluster (db, backend, frontend).

## 2. CI/CD Files
- Required multi-stage Docker builds exist:
  - `frontend/Dockerfile` (Node 20 Alpine standalone)
  - `backend/Dockerfile` (Python 3.12 Slim)
- `docker-compose.yml` ensures network isolation and service readiness checks.

## 3. Code Audit Logs
- **Logging Standard:** Implemented JSON structured logging with Correlation IDs (`X-Correlation-ID`) passing from frontend store to backend HTTP responses.
- **Checkpoint System:** `backend/checkpoint_log.json` logs system execution states alongside SHA-256 hashes of critical artifacts (like parsed CSVs and executed phases) to prevent tampering.
