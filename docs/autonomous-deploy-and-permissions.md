# Autonomous deploy and permission strategy

This project is intended to run with minimal human interruption during implementation and deployment.

## Important limitation

A prompt file can tell the agent to avoid unnecessary pauses, but it **cannot override platform-level permission prompts by itself**.

To reduce repeated confirmations, combine three layers:

1. Project instruction in `CLAUDE.md` and `.claude/rules/`
2. Project-scoped permission config in `.claude/settings.json`
3. Optional bypass mode only for trusted repositories and isolated environments

## Recommended project instruction

Use the rule file:

- `.claude/rules/09-autonomous-execution-and-deploy.md`

This tells the agent to continue straight through build, test, migration, packaging, and deploy unless a critical issue appears.

## Recommended settings behavior

Use `.claude/settings.json.example` as the base for your real `.claude/settings.json`.

Key choices:

- `defaultMode = acceptEdits`
- allow common local dev and deploy commands
- ask for dangerous commands
- deny secrets and unsafe shell piping patterns
- enable sandboxing
- auto-allow sandboxed bash

## Maximum autonomy option

For fully unattended execution, Anthropic documents a bypass mode using `--dangerously-skip-permissions`. This should only be used in a trusted repo and ideally inside a hardened devcontainer or similarly isolated environment.

## Practical recommendation for this project

Best balance:

- normal day-to-day: `acceptEdits` + allow rules + sandbox
- deploy windows in trusted environment: bypass mode only if needed
- always stop on data loss risk, security issues, credential failures, failed migrations, or critical failing tests
