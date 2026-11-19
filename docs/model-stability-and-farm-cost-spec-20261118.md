# Model stability and participation-cost specification (GPT review, 2026-11-18)

**Scope:** methodology for Codex to implement and test; **not** evidence that the analyses or browser/competition checks have run. Exact revision to the calibrated model is left to #2. The 2026-11-14 input snapshot is a **single cross-section**, not a time series. Do not claim true walk-forward, future airdrop probabilities or verified profitability from this data alone.

## A. Honest out-of-sample calibration

1. Extract comparable **already-traded tokens** with valid contemporaneous market cap / TVL and unique token identity. Deduplicate by `gecko_id`; report comparable counts per category. The 2026-11-14 snapshot has 115 usable comparables; 12/40 watchlist entries are Risk Curators and 3/40 are Onchain Capital Allocator, categories with only 1 and 2 traded comparable projects respectively.
2. Hold out tokens **by identity**, never rows from the same token in both train and test. Use a deterministic split based on a stable hash of `gecko_id`, not input order; a five-fold split is feasible. In each fold, fit all intercept/slope and category offsets on training tokens **only**, then evaluate the **full production score** (including growth, age and unique-chain multipliers) for the held-out tokens.
3. Compare **identical folds and metrics**: starter full formula, bounded conservative chain-bonus full formula, calibrated full formula. Report median absolute log error, error quantiles, percentage improved, and category-level errors with denominators. Do not use fitted-token training error as a holdout score.
4. This evaluates prediction of observed caps for *traded* tokens at the snapshot date, not pre-token launch probabilities. If only this snapshot exists, **no genuine walk-forward/backtest is possible**. Disclose this precisely.

## B. Rank sensitivity across 200 refits

Use **200 deterministic, seeded, category-stratified bootstrap refits** of the same 115 comparable token identities, keeping category proportions where possible; each replicate samples token examples with replacement **for fitting**, but preserves the original number of **unique** observed category token IDs for category-support claims. Do **not** bootstrap by repeating rows through a deduplication function that would discard repeated samples and invalidate the bootstrap.

For each replicate:

- Fit the calibration on bootstrap comparables; keep category eligibility at >=4 **distinct underlying tokens in the unresampled data**. For low-support categories use the pooled fit instead of falsely increasing sample size through repeated draws.
- Score an **unchanged, fixed candidate universe** from the real snapshot with the full production model, keep all 40 mandatory watchlist slugs, and rank by the same deterministic tie-breaker as production.
- Store `rank_p05`, `rank_median`, `rank_p95`, `value_p05`, `value_median`, `value_p95`, fraction of replicates in top-20, and optional Kendall rank concordance between replicate ranks and the base ranking. Preserve the exact bootstrap seed, comparable IDs/categories, and input-snapshot digest in a separate **non-secret** run summary.
- Label these **model-refit sensitivity bands**, **not** 90% prediction intervals or real-world token market value confidence intervals. Such bands do not account for incomplete token status, dataset selection, changed market conditions or the speculative nature of launches.

**Tests:** same seed => identical results; no sample ID leaks; no NaN or negative implied values; duplicated chain names do not change scores; 40 mandatory watchlist included; per-row percentile bounds ordered; top-20 frequency between 0 and 1. A 200-refit display should not silently imply that a top-20 interval is comparable across changing candidate pools.

## C. Participation economics without fictional rewards

Separate (i) **verified, route-specific user cash cost**, (ii) **labor / execution time**, (iii) **capital at risk and lock period**, and (iv) **unconfirmed token/point reward**, which must be an unknown rather than assumed income.

For each *named and sourced* product/entry route use fields: `route`, `source_url`, `verified_as_of`, `eligible_jurisdictions/KYC`, `accepted_assets`, `entry_fee`, `gas_in`, `gas_out`, `bridge_fee`, `swap_spread_or_slippage`, `exit_fee`, `minimum`, `lock_and_settlement`, `active_minutes`, `capital_exposure`, `incentive_status`, `unknown_cost_components`. Do not invent monetary defaults or durations based on TVL/age.

- Compute `known_cash_cost_subtotal = sum(verified amounts)`, with missing fields explicitly listed; **do not label this the total cost** if key components are unknown.
- Only when **all required components** have defensible values, calculate `break_even_incentive_usd = total_cost - verified non-incentive net income` (floor at zero for a minimum reward threshold). Otherwise report **unknown**, perhaps show a clearly labeled scenario, never a promised yield or reward.
- `cost_per_active_hour = known_cash_cost_subtotal / verified_active_hours` is **cost/hour**, not **profit/hour**. Do not report an expected ROI or dollar earnings/hour without validated rewards and non-incentive income.
- Action plans can describe research/check/eligibility/monitor/exit steps without requesting users to transact. Use `not_applicable` where no token-farming pathway exists (e.g., Lightning channels), and flag routes that cannot be independently verified.

**Priorities:** verified 20 prominent protocols first; keep conservative/unknown status for most beyond top 20. Explicitly cite product-specific terms (fees, redemption, eligibility) rather than transferring a term from another vault or from parent B2 staking to BTC Hive staking.

## D. UI and acceptance

Add an expandable detail section showing: model version / comparable support by category, uncertainty band and definition, token identity status (protocol governance / receipt / issued reward token), product route and evidence links, known-cost subtotal vs unknown costs, and optional verified break-even threshold.

No source can be marked independently validated unless the exact page is cited. Changes must keep the backend/dashboard valuation formula identical. Link code tests + artifact screenshots to #2 and #3; leave native Codex transcript / run checks under #4. This document does not authorize competition submission or wallet actions.
