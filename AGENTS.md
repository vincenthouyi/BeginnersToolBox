# AGENTS.md — BeginnersToolBox Repository Rules

## Scope

This file contains **repository-wide rules** only.
Tool-specific behavior belongs in the tool’s own docs/specs (if any), not here.

## Product constraints

- Default: **no backend** (100% in-browser) unless explicitly approved.
- URL sharing:
  - Only allow short, bounded params (options / short inputs).
  - Never put unbounded/large inputs into URL.
  - Enforce a hard limit for URL text params (default: **500 chars**).

## UX baseline

- Mobile must be usable (~420px width).
- Error UX: show clear, actionable errors (avoid wiping last successful output where possible).
- Keep copy behavior consistent across tools.

## Dependencies

- Minimize new dependencies; prefer small, maintained packages.
- Lockfile must be updated.
- If adding a dependency, state *why* in the PR/commit message or docs.

## Git hygiene

- Small focused commits; avoid drive-by refactors.
- Don’t commit generated artifacts (`dist/`, Playwright reports, `test-results/`).

## Safety / privacy

- Do not log or exfiltrate secrets or private user data.
