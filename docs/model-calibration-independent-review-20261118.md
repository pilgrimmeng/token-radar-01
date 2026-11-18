# Independent review: calibrated radar v2 (2026-11-18)

**Status:** GPT analytical review, not competition acceptance. Method: independently reproduced the current `lib/model.ts` fitting, selection and scoring equations in Python against the externally provided 2026-11-14 DefiLlama `snapshot.json`. The sealed snapshot itself is **not committed**. This is **not** a native Node 22.18+ run, official kit check, or external validation of future token valuations.

**Source under review:** `work/calibrated-radar-v2-20261118`, `lib/model.ts` (calibration based on traded-token comparables, 5-fold holdouts by `i % 5`; a full predicted board includes growth, age and chain multipliers). Linked work: #1, #2, #3 and PR #5.

## Recomputed data and results

| Metric | Independently recomputed |
| --- | ---: |
| Snapshot date | 2026-11-14 |
| Protocol records | 758 |
| Required watchlist | 40 / 40 included |
| Extra ranked early protocols | 160 |
| Total ranked board | 200 |
| Eligible extra early protocols before the 160-row cap | 186 |
| Calibrated traded-token comparables (unique `gecko_id`, positive mcap, TVL > $1M) | 115 |
| Distinct comparable categories | 33 |
| Categories with at least 4 comparable tokens (eligible for fitted offset) | 10 |
| Pooled log-market-cap vs log-TVL slope | 0.461901 |
| Pooled log-intercept | 8.136169 |

Five-fold holdout error, matching the **current `calibrateModel()` check** (base regression prediction *only*, omitting growth/age/chain factors):

| Candidate | Median absolute log error | Equivalent multiplicative factor |
| --- | ---: | ---: |
| Fitted category-aware regression base | 1.2309 | 3.424× |
| Bare starter reference: `tvl_usd * 0.25` | 1.5742 | 4.827× |

Independent **full-formula** holdout replay (fit on each fold's training set, then apply each held-out protocol's actual growth, maturity and capped chain multipliers as production scoring does):

| Candidate | Median absolute log error | Equivalent factor |
| --- | ---: | ---: |
| Calibrated full score | 1.2326 | 3.430× |
| Original starter full score | 1.5676 | 4.795× |

The calibrated full score has lower absolute log error for **71/115** comparables; the medians are better but far from precise valuation. The current implementation reports the base-regression error, **not** this full-formula holdout error. As expected on this snapshot the two numbers are close, but the label/test should match the actual scoring formula.

**Rank effect:** the starter, conservative chain-bonus version and calibrated version all select the **same 20 slugs** in their respective top 20 (20/20 overlap). Order and implied dollar amounts change. Example: `steakhouse-financial` is about **$543.6M** under the original starter formula versus **$78.6M** under calibrated v2. Do not describe the new output as empirically established token-launch value.

## Critical generalization and evidence caveats

1. **Category extrapolation.** The watchlist contains **12 Risk Curators** records and **3 Onchain Capital Allocator** records. The traded-token comparables contain only **1 Risk Curators** example and **2 Onchain Capital Allocator** examples. Neither category receives a category-specific fitted offset under the `n >= 4` rule: these **15/40 watched entries** use a pooled model largely trained on other categories. The dashboard must not imply they are category-calibrated at the same evidence level as high-sample categories.
2. **No launch-outcome evaluation.** Cross-validation predicts **current caps of already-traded tokens** from contemporaneous TVL, not future launches or potential token price; the result is a relative pricing proxy only.
3. **Baseline comparison.** The code's reported baseline is bare `TVL * 0.25`, not the original starter's full growth/maturity adjusted score. The latter also improves under fitted v2, but naming the reference precisely avoids overstating gains.
4. **Not every category benefits.** Full-score held-out median abs-log errors for `Yield` were about **1.391 calibrated** versus **0.999 starter** (8 comparables). Conversely, `RWA` improved **0.401 vs 0.705** (9 comparables). A single global median hides such category variation.
5. **Token identity != missing fields.** All 40 watchlist rows have `mcap_usd`, `gecko_id`, `symbol` empty in the snapshot. That describes the index's fields, not real-world token issuance or eligibility; see Muse's eight disputed top-20 protocols in #1.
6. **Chain counting.** Current calibrated scorer uses raw `protocol.chains.length`, not unique chains. The checked snapshot has no duplicate chain arrays, so this is a latent edge-case defect rather than a demonstrated difference here. Deduplicate in the scorer and dashboard together, with regression tests.

## Recommendations to Codex (do not merge until addressed)

- [ ] Add a native Node regression test reproducing the **full** 5-fold score evaluation and comparing with the **full** starter formula. Label the published diagnostic accurately.
- [ ] Surface comparable count per category, and explicitly mark categories with fewer than four observed comparables as **pooled estimate / low category evidence**.
- [ ] Guard against duplicate chain names in both scoring and client-side recomputation; test zero, one, duplicated, and many chains.
- [ ] Check whether `Risk Curators` and allocator protocols need a category-specific **model validity warning** rather than an arbitrarily invented category multiplier.
- [ ] Maintain the 40/40 mandatory watchlist, while treating issued-token/receipt-token/parent-product status in #1 as a separate evidence layer. Do not hide known discrepancies just to pass the gate.
- [ ] For reproducible real-snapshot validation, link Node version, command output, commit SHA and comparison tables in #2. Current Python parity numbers are independent review evidence only.

**No private snapshot records, keys, raw credential material, or fabricated protocol fee/airdrop claims appear in this report.**
