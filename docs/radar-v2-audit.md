# Radar v2 — reproducible snapshot audit (2026-11-18)

Source: the 2026-11-14 make.fun sealed snapshot attached to the Muse hand-off email. 758 protocols, 40 watchlist slugs, $50M watchlist floor. This file is a development audit, not a claim of verified token status or expected market price.

## Changes
- Keep TVL × 0.25, clipped seven-day growth and age multiplier from v1.
- Apply a bounded chain multiplier: `1 + min(0.20, max(unique_chains - 1, 0) × 0.04)`.
- Chain names are trimmed and lowercased before counting; no protocol is special-cased.
- Do not overweight spikes such as four-digit weekly percentage changes.

## Snapshot results

The original rankability rule yields only **186** non-watchlist eligible early entries, therefore its maximal distinct coverage with this snapshot is **226 rows**. A request for 400 or 800 rows cannot be fulfilled without changing eligibility rules or adding unverified material. At 200, 226, and the nominal 400/800 caps, the top-20 set is identical. The v1 and v2 top-20 sets are identical (20/20), although ordering changes.

| v2 rank | slug | v1 rank | v2 implied USD |
|---:|---|---:|---:|
| 1 | steakhouse-financial | 1 | 652,363,296 |
| 2 | gauntlet | 2 | 388,531,755 |
| 3 | veda | 3 | 373,544,805 |
| 4 | usdd | 4 | 231,371,300 |
| 5 | upshift | 5 | 134,015,133 |
| 6 | nonce-capital | 6 | 78,336,839 |
| 7 | onre | 7 | 60,130,582 |
| 8 | rockawayx | 11 | 59,354,830 |
| 9 | bittensor-dtao | 8 | 56,414,103 |
| 10 | opentrade | 10 | 55,527,676 |
| 11 | symbiotic | 9 | 55,106,874 |
| 12 | plume-vaults | 12 | 52,766,736 |
| 13 | hyperithm | 14 | 51,922,736 |
| 14 | k3-capital | 15 | 47,533,852 |
| 15 | hive-protocol | 13 | 44,235,571 |
| 16 | lagoon | 19 | 38,044,637 |
| 17 | lightning-network | 16 | 37,915,501 |
| 18 | clearstar | 20 | 36,790,433 |
| 19 | r25 | 17 | 34,718,200 |
| 20 | b14g | 18 | 34,366,057 |

These are values from the **heuristic**, not externally validated valuations.

## Important correctness gaps

1. The original source calls a protocol pre-token only when `mcap_usd`, `gecko_id`, and `symbol` are all null. This is an index heuristic, not proof that the protocol has no token, or that it is not a wrapper/derivative of another protocol's token. Check the top candidates independently.
2. The snapshot has no fees, revenue, circulating supply, dilution, protocol legal eligibility, or verifiable reward campaigns. Exact ROI, airdrop probability, real transaction fees and protocol-specific reward steps **cannot** be inferred from these ten fields. Do not present simulated farm costs as observed amounts.
3. `main.ts` requires three images in `screenshots/`, absent from the current public repository. A working executable and screenshot/code consistency cannot be claimed yet.
4. The make.fun rules currently list **nine** transcript gate checks, not seven. For entries received from 2026-11-17 (UTC), a matching run record is also required. Use genuine recorded sessions only; do not reconstruct them after the fact.
5. The winner payout involves a linked Solana wallet. Do not publish secrets. Make sure the wallet keypair has an independently secured backup before any claim; no SOL transfer is needed for model development.

## Next checks
- Verify the developer's Node version is at least 22.18, run `node main.ts --input <snapshot.json> --output <dir>`, and check generated board and dossier.
- Create the actual offline dashboard screenshots from the generated dashboard. There is no rule requiring a 300–350 KB target; check the official maximum size instead.
- Run the exact current make.fun kit checks and bundle the genuine agent transcript with matching run metadata.
- Submit a development entry after the dossier, screenshots, and transcript checks all pass; use the received score to guide one more iteration.

The workload estimates in Muse's email (Nov 19–25 ≤30 min/day, after Nov 26 1–2 h/day) are **assumptions**, not agreed commitments. If thesis work is urgent during Nov 19–25, prioritize ranking validation rather than UI work.
