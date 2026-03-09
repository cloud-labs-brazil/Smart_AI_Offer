# Component Registry

This inventory details every moving piece of the Smart Offer platform — including running containers (services) and static libraries (packages).

## 🐋 Running Services (Docker)

These components map to running containers in the `docker-compose.yml` stack.

| Component Name | Service / Container | Technology | Version | Port | Internal / External | Health Check Method |
|---|---|---|---|---|---|---|
| **Database** | `db` / `smartoffer-db` | PostgreSQL | 15 (Alpine) | `:5432` | Internal | `pg_isready` (Periodic ping) |
| **Backend API** | `backend` / `smartoffer-api` | Python / FastAPI / Uvicorn | 3.12 (Slim) | `:8000` | Ext. via API Gateway | `/health` (HTTP GET) |
| **Frontend Web**| `frontend` / `smartoffer-web` | Node.js / Next.js | 22 (Alpine) | `:3000` | Ext. via Browser | `http.get` on `/` |

## 📦 Packages & Libraries (Monorepo)

These are internal dependencies shared across the running services.

| Package Name | Path | Purpose | Consumed By |
|---|---|---|---|
| **Contracts** | `packages/contracts` | Shared TypeScript types/interfaces mirroring the Python Pydantic models. | `frontend` |
| **UI Kit** | `packages/ui` | Theme tokens, Tailwind configs, and base design system utilities. | `frontend` |
| **Ingestion** | `services/ingestion` | (Future/Placeholder) Dedicated offline worker for massive CSV parsing files. Currently handled in-process by the Backend API. | `backend` |

## 📚 Third-Party Integrations

| Service | Protocol | Purpose | Authentication |
|---|---|---|---|
| **Gemini AI** | HTTPS (REST) | Generating UI code and performing inference tasks. | API Key via Environment Variable |
