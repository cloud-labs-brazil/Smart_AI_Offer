# Unattended Launch Modes

## Recommended team mode
Use the shared project settings in `.claude/settings.json`.

This mode is designed to:
- run routine edits, tests, builds, migrations, and Docker Compose tasks without repeated approvals;
- stop and ask for confirmation on destructive or high-risk actions;
- keep secret reads blocked.

## Maximum-autonomy mode
Only in a trusted, isolated repository/workspace, you may run Claude Code with:

```bash
claude --dangerously-skip-permissions
```

This skips all permission prompts.

Use this only when you explicitly accept the tradeoff that the session will not pause on risky commands.
