# Deployment Runbook (INF-006)

Production-oriented deployment guide for Smart Offer.

## 1. Scope

This runbook covers:

1. Release prerequisites
2. Image build and environment preparation
3. Deployment execution
4. Post-deploy validation
5. Rollback

## 2. Prerequisites

1. Docker Engine + Docker Compose available on the target host.
2. Environment file with production values based on `infra/.env.example`.
3. Database backup taken before deployment.
4. CI quality gates green:
   `apps/web`: lint + build + coverage
   `apps/api`: pytest + coverage
   SAST: Bandit + `npm audit`

## 3. Release Inputs

1. Git commit/tag to deploy.
2. Finalized `.env` with production values:
   `POSTGRES_PASSWORD`
   `DATABASE_URL`
   `CORS_ORIGINS`
   `GEMINI_API_KEY`
3. Port mapping decision (`WEB_PORT`, `API_PORT`, `DB_PORT`).

## 4. Deployment Procedure

### 4.1 Fetch and Build

```bash
git fetch --all --tags
git checkout <release-tag-or-commit>
docker compose -f infra/docker-compose.yml pull
docker compose -f infra/docker-compose.yml build --no-cache
```

### 4.2 Start/Upgrade Services

```bash
docker compose -f infra/docker-compose.yml up -d db
docker compose -f infra/docker-compose.yml up -d backend frontend
```

### 4.3 Apply Migrations

```bash
docker exec -it smartoffer-api alembic upgrade head
```

## 5. Post-Deploy Validation

### 5.1 Health Checks

```bash
curl -f http://localhost:${API_PORT:-8000}/health
curl -f http://localhost:${WEB_PORT:-3000}/
```

### 5.2 Smoke Test (QA-005)

```bash
python infra/scripts/e2e_smoke.py
```

### 5.3 Stress Test (ING-010)

```bash
python apps/api/scripts/stress_50k.py --api-url http://localhost:${API_PORT:-8000} --rows 50000
```

## 6. Rollback Procedure

1. Checkout previous known-good release.
2. Rebuild and restart containers:

```bash
git checkout <previous-release>
docker compose -f infra/docker-compose.yml build --no-cache
docker compose -f infra/docker-compose.yml up -d
```

3. If required, restore database backup taken before deployment.
4. Re-run smoke validation.

## 7. Operational Evidence

For each deployment record:

1. Release identifier (tag/commit SHA)
2. Migration version (`alembic current`)
3. Smoke test output
4. Stress test output (when executed)
5. Rollback status (if applicable)
