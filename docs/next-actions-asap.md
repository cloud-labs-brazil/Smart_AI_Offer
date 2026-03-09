# Next Actions — ASAP

If you want the agent to start immediately, instruct it to do this sequence without skipping steps:

1. Read `CLAUDE.md`
2. Read `docs/scaffold-bootstrap.md`
3. Read roadmap, backlog, milestones, and ADRs
4. Validate the scaffold structure against `docs/monorepo-structure.md`
5. Start with a planning memo and gap analysis
6. Then implement in this order:
   - `apps/api`
   - `services/ingestion`
   - `packages/contracts`
   - `packages/ui`
   - `apps/web`
7. Run tests and CI checks after every vertical slice
