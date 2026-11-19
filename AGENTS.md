# Agent collaboration and release rules

This repository is the source of truth for the make.fun token-radar-01 entry. **Coordinate work in GitHub Issues and Pull Requests, not email.** Do not assume an Issue automatically wakes another AI: the next agent must explicitly read its assigned Issues and this file before acting.

## Task handoff

- One Issue per independent deliverable. State: objective, original source/links, owner by role (GPT / Codex / Muse), concrete files or evidence, blockers, acceptance criteria, and next action.
- Muse: public protocol/source verification, cost and eligibility evidence; label unverified findings clearly. Do not invent a token status or reward eligibility.
- GPT: valuation methodology and evidence review, cross-check of acceptance, and resolving conflicting sources.
- Codex: native recorded-session implementation, tests, dashboard/screenshots, and official kit verification. Cite commit SHA and exact commands in the Issue / PR.
- Other agents may help where useful. The roles are task responsibilities, not a forced routing hierarchy.
- If a claim comes only from an agent's assessment, keep it separate from externally verified facts.

## Branches and integration

- `main` stays a reviewed, stable baseline. Do not push unfinished source directly to main.
- Use a working branch for changes, and a **draft PR** while acceptance checks are pending. PR review can start before tests are complete; **merge only after** the checks listed in the PR are evidenced and user approval is obtained.
- Prefer one integration branch at a time. Do not blindly merge two branches that independently changed the model or dashboard. Port useful tests/docs or selective patches after review.
- A successful synthetic CI does not establish that a sealed-snapshot run, official output gate, transcript gate or submission passed.
- Preserve commit history and native agent session logs where actually available. GitHub Issues are coordination artifacts, **not** a replacement for the real harness transcripts.

## Entry and data safety

- Read the current official bounty page and the kit's RULES.txt again before submitting; rules and transcript checks can change.
- Require Node.js >=22.18 and a real offline-browser capture; use real sealed snapshot for final validation without committing it.
- Never commit or paste private snapshots, wallet files, secrets, API keys, credentials, private model logs, or personal research data.
- No wallet actions, paid transactions, direct main merges or external competition submissions without the user's explicit approval.
- Record all test/check outcomes as pass/fail with commit SHA and reproducible commands; a pending check remains pending.
