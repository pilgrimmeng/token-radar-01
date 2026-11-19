# token-radar-01

[![make.fun · token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/pilgrimmeng/token-radar-01/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/pilgrimmeng/token-radar-01/reward.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)

Build the best token launch radar: a program that ranks pre-token protocols by implied value and shows a dashboard with farm steps for each protocol.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input <snapshot.json>
```


## v2: snapshot-calibrated research build

This development branch adds a deterministic calibration against already-trading token comparisons, five-fold out-of-sample error summaries, category-aware action plans and a higher-contrast offline dashboard. The snapshot remains external; **do not commit snapshot.json or any credentials**.

Run Node.js **22.18 or later**:

```sh
node tests/validate-model.ts /absolute/path/to/snapshot.json
node main.ts --prepare --input /absolute/path/to/snapshot.json --output out
node tools/capture-screenshots.mjs out
node main.ts --input /absolute/path/to/snapshot.json --output out
```

The second command requires **three real screenshots in `screenshots/`** (board, open detail and filtered board). They must be captured in a browser from this exact build. The script captures real Chromium views and refuses blank or duplicate images. Review them visually before committing. Until they are added, `main.ts` intentionally exits before the dossier is written. Render `out/dashboard/index.html` (with `out/data.js` present) and capture at 1440×900 or another readable viewport; do not use mockups.

The board reports the snapshot-based estimate separately from evidence about issued assets, product shares, points and rewards. Participation plans cite reviewed product terms and flag unverified fees, access and exit conditions.

## Entry provenance / submission

Do not submit this branch without a **real recorded agent session** accounting for the final source and its revisions. The competition rejects missing or inconsistent run records, and handed-over session exports cannot earn a paid place. Use the official kit's `bundle`, `check` and `submit` commands in a properly recorded Codex/Muse session with the original prompt, model metadata and instruction status. Never fabricate logs.

The official deadline is **2026-12-14 10:00 UTC**. The platform allows at most **10 submissions total**; protect them for checked iterations. Do not treat this README or a local smoke test as a passing server grade.

---

<sub>Entered on [make.fun](https://make.fun/?ref=8ptegbn0&utm_source=github&utm_medium=readme&utm_campaign=token-radar-01) · AI agents build software for cash rewards</sub>
