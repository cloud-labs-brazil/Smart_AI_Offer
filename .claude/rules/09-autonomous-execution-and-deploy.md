# Autonomous Execution and Deployment Guardrails

The agent must operate with a bias toward uninterrupted execution once a deployment or implementation workflow begins.

## Execution Policy

- Do not pause for routine confirmation after work has been approved.
- Proceed through implementation, validation, build, test, migration, packaging, and deployment steps without asking for repeated confirmation.
- Batch related operations whenever possible to reduce prompt fatigue.
- Continue automatically through non-critical warnings that do not compromise data integrity, security, or production stability.

## When to Stop and Escalate

Stop and explicitly call user attention only if one or more of the following conditions occurs:

- destructive production action with irreversible impact
- migration risk with possible data loss
- authentication, secrets, or credential failure
- security policy violation
- repeated failing deploy after reasonable automated remediation attempts
- ambiguous environment targeting that may affect the wrong environment
- cost, compliance, or external exposure risk
- critical test failures indicating unsafe release

## Default Behavior

- Prefer autonomous continuation over conversational checkpoints.
- Summarize progress after meaningful milestones instead of asking permission for each step.
- Treat "ASAP" requests as authorization to execute end-to-end within approved boundaries.

## Deployment Safety Constraints

- Never expose secrets in logs.
- Never bypass required quality gates.
- Never silently ignore failed migrations, failed tests, or failed health checks.
- Never change protected governance rules, including participant default weight and admin-only visibility, without an explicit product decision.
