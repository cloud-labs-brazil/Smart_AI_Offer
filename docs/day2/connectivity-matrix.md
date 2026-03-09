# Connectivity Matrix

This document maps all network connections within the Smart Offer platform. Use this matrix when configuring firewalls, security groups, or troubleshooting "Connection Refused" errors.

## Internal Traffic (Docker Bridge Network)

These connections happen entirely *within* the virtual Docker network. They are not exposed to the host machine unless explicitly bound in `docker-compose.yml`.

| Source Component | Target Component | Protocol | Port | Description |
|---|---|---|---|---|
| `smartoffer-api` | `smartoffer-db` | TCP (PostgreSQL) | `5432` | AsyncPG connection pool. SSL is disabled internally. |
| `smartoffer-web` | `smartoffer-api` | HTTP/1.1 (REST) | `8000` | SSR (Server-Side Rendering) data fetching during build or server render. |

## External Traffic (Exposed to Host)

These ports are bound to `0.0.0.0` or `localhost` on the host machine running Docker Compose. Avoid exposing these directly to the public internet; place them behind a reverse proxy (e.g., Nginx, Traefik) handling TLS termination.

| Host Port | Target Component | Exposed Service | Audience |
|---|---|---|---|
| `localhost:3000` | `smartoffer-web` | Next.js App UI | End Users (Architects, Managers) |
| `localhost:8000` | `smartoffer-api` | FastAPI Endpoints | Frontend Client & OpenAPI spec readers (`/docs`) |
| `localhost:5432` | `smartoffer-db` | Postgres DB | Administrators / DB Tools (DBeaver, DataGrip) |

## Outbound Traffic (Internet Egress)

The application requires internet access for the following third-party integrations:

| Source Component | Target URL / Service | Protocol | Port | Purpose |
|---|---|---|---|---|
| `smartoffer-api` | `generativelanguage.googleapis.com` | HTTPS | `443` | Google Gemini API calls for AI-assisted insights and parsing fallback. |

> **Note:** If this application runs in an air-gapped or corporate environment with strict egress rules, you must whitelist `generativelanguage.googleapis.com` and ensure proxy environment variables (`HTTP_PROXY`, `HTTPS_PROXY`) are passed into the `smartoffer-api` container.
