# Environment Variables Reference

Environment variables define runtime configuration across the Smart Offer platform. The single source of truth locally is the `infra/.env` file.

## Postgres Database Config

Variables used by both the `db` container initialization and the `backend` connection string.

| Variable | Default Value | Purpose | Secret? |
|---|---|---|---|
| `POSTGRES_DB` | `smartoffer` | The name of the logical default database to create. | No |
| `POSTGRES_USER` | `smartoffer` | The initial superuser created. | No |
| `POSTGRES_PASSWORD` | `changeme` | The password for the initial superuser. | **Yes** |
| `DB_PORT` | `5432` | The port exposed to the host machine for external DB inspection. | No |

## Backend API Config

Variables configuring the FastAPI runtime engine and business rules.

| Variable | Default Value | Purpose | Secret? |
|---|---|---|---|
| `API_PORT` | `8000` | Port exposed to host machine for external REST connections. | No |
| `DATABASE_URL` | *(composite)* | SQLAlchemy+asyncpg connection string. Example: `postgresql+asyncpg://user:pass@db:5432/dbname` | **Yes** |
| `LOG_LEVEL` | `info` | Minimum log severity. Options: `debug`, `info`, `warning`, `error`, `critical`. | No |
| `CORS_ORIGINS` | `["http://localhost:3000"]` | JSON array of permitted origins for browser preflight checks. | No |
| `PARTICIPANT_WEIGHT` | `0.10` | Business rule baseline: Assume 10% daily capacity minimum per architect per offer. | No |

## Frontend Config

Variables required for the Next.js runtime. Note that Next.js requires variables exposed to the browser to begin with `NEXT_PUBLIC_`.

| Variable | Default Value | Purpose | Secret? |
|---|---|---|---|
| `WEB_PORT` | `3000` | Port exposed to host machine for browser access. | No |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Base URL used by the frontend to fetch data. In production, this might be `https://api.domain.com`. | No |

## External Integrations

Third-party API keys and tokens.

| Variable | Default Value | Purpose | Secret? |
|---|---|---|---|
| `GEMINI_API_KEY` | *(empty)* | Key for the Google Gemini inference API. | **Yes** |
| `NEXT_PUBLIC_GEMINI_API_KEY` | *(empty)* | Deprecated/Dev only. Do not populate in production; route via Backend instead. | **Yes** |

---

## 🔒 Security Posture on Defaults

If testing locally via the bootstrap scripts, the stack relies on the default credentials (e.g., `changeme`).

**Before deploying to a public-facing cloud or production VM:**
1. Generate secure, high-entropy passwords for `POSTGRES_PASSWORD`.
2. Update the `DATABASE_URL` composite string to match.
3. Overwrite `CORS_ORIGINS` to precisely match your production frontend domain (e.g., `["https://dashboard.company.com"]`). Avoid wildcards (`*`).
