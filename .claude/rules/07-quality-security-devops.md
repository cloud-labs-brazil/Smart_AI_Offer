# Rule 07 — Quality, Security & DevOps

> **Scope:** Testing, security scanning, CI/CD, deployment, monitoring

---

## Quality Gates

| Gate | Name | Phase | Pass Criteria |
|------|------|-------|---------------|
| G1 | Architecture Sign-off | 1 | All ADRs documented and approved |
| G2 | Data Model Validation | 2 | Schema matches 52-column Jira CSV structure |
| G3 | 50k Row Stress Test | 2 | < 15 min end-to-end, memory stable |
| G4 | Build Verification | 3 | `next build` zero errors, `uvicorn` starts clean |
| G5 | Performance Benchmark | 3 | FCP < 2s, CSV parse < 500ms, allocation < 300ms |
| G6 | Automated SAST | 4 | Bandit: 0 findings; npm audit: 0 vulnerabilities |
| G7 | Code Coverage | 4 | ≥ 85% statements, ≥ 80% branches |

**No gate may be skipped or deferred.** All gates must pass before deployment.

## Testing Standards

### Frontend (Vitest)
- **Runner:** Vitest 4.x with happy-dom
- **Coverage:** V8 provider, ≥ 85% statements
- **Scope:** Components, stores, parser, engine, utilities
- **Naming:** `*.test.ts` / `*.test.tsx` colocated with source
- **Command:** `npx vitest run --coverage`

### Backend (pytest)
- **Runner:** pytest with async support
- **Scope:** Routes, services, models, migrations
- **Naming:** `test_*.py` in `tests/` directory
- **Command:** `pytest --cov=app --cov-report=term-missing`

### Integration
- E2E smoke: CSV upload → parse → compute → dashboard render
- API contract: OpenAPI schema validation
- Docker: `docker compose up` → health check → 200 OK

## Security

### SAST (Static Application Security Testing)
- **Python:** Bandit scan on all `.py` files
- **Node.js:** `npm audit --audit-level=high`
- **Schedule:** Every build, every PR

### Secrets Management
- API keys in environment variables, never in code
- `NEXT_PUBLIC_*` vars for client-side (with proxying plan for production)
- `.env.example` template, `.env` in `.gitignore`
- Docker secrets for production deployment

### Access Control
- `SYSTEM_ADMIN` role: weight configuration, API settings, data purge
- Standard roles: read dashboards, run simulations, export data
- Participant weight (`0.10`) never visible to non-admin roles

## DevOps

### Docker Configuration

| Service | Image | Port | Health Check |
|---------|-------|------|-------------|
| `db` | `postgres:15-alpine` | 5432 | `pg_isready` |
| `backend` | Python 3.12 Slim | 8000 | `GET /health` |
| `frontend` | Node 20 Alpine (standalone) | 3000 | `GET /` every 30s |

### Container Security
- Non-root user (`nextjs:nodejs`, UID 1001)
- Multi-stage builds (builder → runner)
- Alpine/Slim base images
- `restart: unless-stopped`

### Logging
- **Format:** JSON structured logs
- **Correlation:** `X-Correlation-ID` propagated across services
- **Checkpoint:** `checkpoint_log.json` with SHA-256 hashes
- **No secrets in logs** — ever

### CI Pipeline (Target)
```
lint → typecheck → test → coverage → SAST → build → docker → smoke
```
