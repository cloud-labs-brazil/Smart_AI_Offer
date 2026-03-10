# Operational Runbook

Actionable guides for operating and maintaining the Smart Offer platform in Day 2.

## Table of Contents
- [1. Starting and Stopping the Stack](#1-starting-and-stopping-the-stack)
- [2. Database Management & Migrations](#2-database-management--migrations)
- [3. Application Data & State](#3-application-data--state)
- [4. Troubleshooting & Logging](#4-troubleshooting--logging)
- [5. Validation Scripts](#5-validation-scripts)

---

## 1. Starting and Stopping the Stack

The preferred way to start the stack locally or in a single-instance VM is via the provided bootstrap scripts.

### Start Everything (with Health Checks)

**Windows:**
```powershell
.\bootstrap.ps1
```

**Linux/macOS:**
```bash
./bootstrap.sh
```

### Stop Everything

From the root project folder containing `infra/docker-compose.yml`:

```bash
docker compose -f infra/docker-compose.yml down
```

*Note: The `pgdata` volume is persistent. Running `down` does not delete the database.*

### Wipe Database & Start Fresh

If you need to completely reset the environment and destroy all data:

```bash
docker compose -f infra/docker-compose.yml down -v
# Run bootstrap again
.\bootstrap.ps1
```

Wait for the stack to come online, then run Alembic migrations (see below) to recreate the schema.

---

## 2. Database Management & Migrations

The database schema is managed by [Alembic](https://alembic.sqlalchemy.org/). Schema changes must always be executed as migrations.

### Apply Migrations (Upgrade/Create Tables)

After a fresh boot with empty volumes, or after pulling new code, you must apply the migrations.

1. Connect to the running backend container:
   ```bash
   docker exec -it smartoffer-api bash
   ```
2. Run Alembic:
   ```bash
   alembic upgrade head
   ```

### Create a New Migration

If you've modified the SQLAlchemy models in `apps/api/app/models.py`, you need to generate a new migration file:

1. Exec into the container:
   ```bash
   docker exec -it smartoffer-api bash
   ```
2. Generate the revision:
   ```bash
   alembic revision --autogenerate -m "description_of_change"
   ```
3. The new file will appear in `apps/api/alembic/versions`. You should review it before committing to Git.

---

## 3. Application Data & State

### How to Upload Initial Data (CSV)

To populate the application, a user must upload an export from Jira.

1. Go to the Web UI at `http://localhost:3000`
2. Look for the **Upload Offers** area in the App Shell sidebar or top menu.
3. Select a valid CSV export containing fields like *Atlassian ID*, *Key*, *Assignee*, *Original estimate*, etc.
4. Submit the file. The backend will parse, bulk insert, and compute utilization.

### Overriding System Parameters

Certain behaviors (like expected daily hours capacity) are governed by environment variables in the `.env` file (e.g., `PARTICIPANT_WEIGHT`). Do **not** hardcode these into the application.

If you change an `.env` variable, restart the API to apply it:

```bash
docker compose -f infra/docker-compose.yml restart backend
```

---

## 4. Troubleshooting & Logging

### Viewing Logs

By default, the Docker orchestrator captures all stdout/stderr from the containers. Look here first.

**View all logs (tailing):**
```bash
docker compose -f infra/docker-compose.yml logs -f
```

**View specific service:**
```bash
# Only the API
docker compose -f infra/docker-compose.yml logs -f backend

# Only the DB
docker compose -f infra/docker-compose.yml logs -f db
```

### Common Issues

#### Problem: Frontend shows "Network Error" or 500
- **Symptoms:** The UI is loaded, but charts are empty and a red error toasts appears.
- **Cause:** The frontend cannot reach the backend API at `http://localhost:8000`.
- **Resolution:** 
  1. Check the backend container status: `docker ps | grep smartoffer-api`
  2. If the container is restarting repeatedly, check API logs. Often indicates a DB connection string mismatch or missing `.env` file mapping.

#### Problem: Alembic says "Relation does not exist"
- **Symptoms:** Trying to bulk upload CSV data results in a database error.
- **Cause:** Migrations have not been applied to the Postgres database.
- **Resolution:** Run `alembic upgrade head` inside the backend container as detailed in Section 2.

#### Problem: Container fails with "port is already allocated"
- **Symptoms:** Docker compose fails during `up`.
- **Cause:** You are running another local Postgres on port `5432`, or another web server on `3000` or `8000`.
- **Resolution:** Either stop your local daemon, or modify the `.env` file to map to different host ports:
  ```env
  DB_PORT=5433
  WEB_PORT=3001
  API_PORT=8001
  ```

---

## 5. Validation Scripts

### E2E Smoke Test (QA-005)

Runs a minimal end-to-end verification (web reachable, API healthy, upload works, offers/allocations visible):

```bash
python infra/scripts/e2e_smoke.py
```

### 50k Stress Test (ING-010)

Generates a synthetic CSV and uploads it to validate ingestion throughput:

```bash
python apps/api/scripts/stress_50k.py --rows 50000 --api-url http://localhost:8000
```
