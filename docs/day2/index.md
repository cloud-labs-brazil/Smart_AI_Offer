# Smart Offer — Day 2 Operations

Welcome to the operations documentation for the **Smart Offer (AI Offers Management)** platform. This guide is intended for DevOps, SREs, and maintaining developers taking over the project after the initial launch (Day 2).

It contains everything you need to understand the architecture, validate system health, troubleshoot issues, and manage deployments.

## Documentation Index

| Section | Description |
|---|---|
| 📦 **[Component Registry](./component-registry.md)** | Inventory of all microservices, backend packages, UI libraries, and database containers. |
| 🏗️ **[Architecture & Data Flow](./architecture.md)** | Network topology, Mermaid architecture diagrams, and high-level data flow paths. |
| 🔌 **[Connectivity Matrix](./connectivity-matrix.md)** | Network ACL reference detailing which components communicate over which ports and protocols. |
| 🛠️ **[Operational Runbook](./runbook.md)** | Step-by-step guides for starting/stopping services, running database migrations, uploading CSVs, and troubleshooting. |
| 🔐 **[Environment Variables](./environment-variables.md)** | Complete reference of all configurable settings, feature flags, and secrets. |

---

## Quick Start

If you are just looking to get the application running locally or in staging:

**Windows:**
```powershell
.\bootstrap.ps1
```

**Linux / macOS:**
```bash
./bootstrap.sh
```

*(These scripts will validate prerequisites, load the `.env` file, start Docker Compose, and wait for health checks to pass before exiting).*
