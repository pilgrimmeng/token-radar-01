// The token radar's model: one snapshot of the protocol universe in, one ranked board out.
//
// The board covers every slug in the snapshot's watchlist (the floor, never a ceiling) and may add
// pre-token protocols below the watchlist floor: the early rows the radar exists to find. A protocol is
// pre-token when its index entry records no token (no market cap, no CoinGecko id, no symbol); the
// snapshot's live-token protocols are kept apart and shown as the market's own values, never mixed into
// the ranked board.
//
// Implied value follows only from the snapshot's own figures:
//
//   base       = tvl_usd x BASE_MULTIPLE
//   growth     = clamp(change_7d, -60, 120) per cent
//   growthMult = 1 + (growth / 100) x GROWTH_WEIGHT
//   maturity   = 0.6 + min(age_days, 1095) / 1095 x 0.4   (age_days unknown: 365)
//   implied    = max(1, round(base x growthMult x maturity))
//
// The constants are the house model's, stated in the dashboard and changeable in the model sandbox. No
// protocol name is ever special-cased: the same function scores every row.

/** The snapshot's protocol entry: exactly the ten fields the sealed input carries. */
export interface SnapshotProtocol {
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  gecko_id: string | null;
  symbol: string | null;
}

/** The whole snapshot document. */
export interface Snapshot {
  as_of: string;
  source: string;
  floor_usd: number;
  protocols: SnapshotProtocol[];
  watchlist: string[];
}

/** The model's constants, as the dashboard states them and the sandbox may change them. */
export interface ModelConstants {
  base_multiple: number;
  growth_weight: number;
  growth_floor: number;
  growth_cap: number;
  maturity_floor: number;
  maturity_range: number;
  maturity_days: number;
  unknown_age_days: number;
  chain_bonus_per_extra?: number;
  fitted_intercept?: number;
  fitted_slope?: number;
  fitted_categories?: Record<string, number>;
  comparison_count?: number;
  cv_median_abs_log_error?: number;
  baseline_median_abs_log_error?: number;
}

export const MODEL: ModelConstants = {
  base_multiple: 0.25,
  growth_weight: 0.5,
  growth_floor: -60,
  growth_cap: 120,
  maturity_floor: 0.6,
  maturity_range: 0.4,
  maturity_days: 1095,
  unknown_age_days: 365,
};

/** The model's version label: the dashboard names it and the rules quote it. */
export const MODEL_VERSION = 'radar-2-calibrated';

/** How many pre-token protocols below the watchlist floor the early radar carries, by TVL. */
export const EARLY_ROWS = 160;

/** How many live-token protocols the Live token view carries, by market cap. */
export const LIVE_ROWS = 24;

/** A farm step: the action, what it costs, and how long it takes. */
export interface FarmStep {
  text: string;
  cost: string;
  time: string;
}

/** One row of board.json: the ranked board's row. */
export interface BoardRow {
  rank: number;
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  gecko_id: string | null;
  symbol: string | null;
  token_status: 'pre-token';
  age_days: number | null;
  implied_value_usd: number;
  model: {
    base_multiple: number;
    growth_pct: number;
    growth_multiplier: number;
    maturity_multiplier: number;
    age_days: number | null;
  };
  farm_steps: string[];
}

/** The dashboard's compact view of one row, with farm plans generated in the page. */
export interface RadarRow {
  rank: number;
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  age_days: number | null;
  implied_value_usd: number;
  growth_multiplier: number;
  maturity_multiplier: number;
  farm_steps: string[];
}

/** A live-token protocol: it already trades, so the board shows the market's own value, not a model's. */
export interface LiveRow {
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  mcap_usd: number | null;
  change_7d: number | null;
}

/** Everything the dashboard needs: the board, the live set, and the model it runs. */
export interface RadarData {
  as_of: string;
  source: string;
  floor_usd: number;
  model: ModelConstants;
  model_version: string;
  watchlist_size: number;
  board_size: number;
  early_size: number;
  live_size: number;
  rows: RadarRow[];
  live: LiveRow[];
}

/** Why the snapshot is not one this model can score. */
export class SnapshotError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SnapshotError';
  }
}

const DAY_MS = 86_400_000;

/** A finite number, else `fallback`. */
function finite(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** A whole day count from `from` to `to`, clamped at zero; null when either date is absent or bad. */
export function ageDays(asOf: string, listedAt: string | null): number | null {
  if (listedAt === null) return null;
  const a = Date.parse(`${asOf}T00:00:00Z`);
  const b = Date.parse(`${listedAt}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.max(0, Math.floor((a - b) / DAY_MS));
}

/** The three multipliers and the implied value one protocol gets under `model`. */
export function impliedValue(protocol: SnapshotProtocol, asOf: string, model: ModelConstants): { implied: number; growthPct: number; growthMult: number; maturityMult: number; age: number | null } {
  const age = ageDays(asOf, protocol.listed_at);
  const rawGrowth = finite(protocol.change_7d, 0);
  const growthPct = Math.min(model.growth_cap, Math.max(model.growth_floor, rawGrowth));
  const growthMult = 1 + (growthPct / 100) * model.growth_weight;
  const ageForModel = age ?? model.unknown_age_days;
  const maturityMult = model.maturity_floor + (Math.min(Math.max(ageForModel, 0), model.maturity_days) / model.maturity_days) * model.maturity_range;
  const offset = model.fitted_categories?.[protocol.category ?? ''] ?? 0;
  const base = model.fitted_intercept === undefined || model.fitted_slope === undefined
    ? protocol.tvl_usd * model.base_multiple
    : Math.exp(model.fitted_intercept + model.fitted_slope * Math.log(Math.max(1, protocol.tvl_usd)) + offset);
  const chains = Math.min(4, Math.max(0, protocol.chains.length - 1));
  const chainMult = 1 + chains * (model.chain_bonus_per_extra ?? 0);
  const implied = Math.max(1, Math.round(base * growthMult * maturityMult * chainMult));
  return { implied, growthPct, growthMult, maturityMult, age };
}

/**
 * Calibrate launch-value proxies against the sealed snapshot's already-trading tokens.
 * The entire operation is deterministic, requires no network, and contains no protocol-name exception.
 * A traded token is a comparison, NOT a prediction of whether a tokenless protocol will launch.
 */
export function calibrateModel(snapshot: Snapshot): ModelConstants {
  type Comp = { category: string; tvl: number; cap: number };
  const seen = new Set<string>();
  const comps: Comp[] = [];
  for (const p of snapshot.protocols) {
    if (p.category === 'CEX' || !p.gecko_id || seen.has(p.gecko_id)) continue;
    if (!(p.tvl_usd > 1_000_000) || !((p.mcap_usd ?? 0) > 100_000)) continue;
    seen.add(p.gecko_id);
    comps.push({ category: p.category ?? '', tvl: p.tvl_usd, cap: p.mcap_usd! });
  }
  if (comps.length < 20) return { ...MODEL };

  type Fit = { intercept: number; slope: number; offsets: Record<string, number> };
  function fit(rows: Comp[]): Fit {
    const xx = rows.map(r => Math.log(r.tvl));
    const yy = rows.map(r => Math.log(r.cap));
    const xm = xx.reduce((a,b) => a+b,0) / rows.length;
    const ym = yy.reduce((a,b) => a+b,0) / rows.length;
    let cov = 0, variance = 0;
    for (let i = 0; i < rows.length; i++) {
      cov += (xx[i]! - xm) * (yy[i]! - ym);
      variance += (xx[i]! - xm) ** 2;
    }
    const slope = Math.min(1.1, Math.max(0.25, cov / Math.max(1e-9, variance)));
    const intercept = yy.reduce((s,y,i) => s + y - slope * xx[i]!,0) / rows.length;
    const groups = new Map<string, number[]>();
    for (const r of rows) {
      const key = r.category;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(Math.log(r.cap) - intercept - slope * Math.log(r.tvl));
    }
    const offsets: Record<string, number> = {};
    for (const [key, values] of groups) {
      if (values.length < 4) continue; // insufficient category evidence
      const mean = values.reduce((a,b) => a+b,0) / values.length;
      const shrunk = mean * values.length / (values.length + 12);
      offsets[key] = Math.max(-Math.log(2), Math.min(Math.log(2), shrunk));
    }
    return { intercept, slope, offsets };
  }
  function predict(r: Comp, f: Fit): number {
    return f.intercept + f.slope * Math.log(r.tvl) + (f.offsets[r.category] ?? 0);
  }
  const fittedErrors: number[] = [], baseErrors: number[] = [];
  for (let fold = 0; fold < 5; fold++) {
    const train = comps.filter((_,i) => i % 5 !== fold);
    const holdout = comps.filter((_,i) => i % 5 === fold);
    const f = fit(train);
    for (const r of holdout) {
      fittedErrors.push(Math.abs(Math.log(r.cap) - predict(r,f)));
      baseErrors.push(Math.abs(Math.log(r.cap) - Math.log(r.tvl * 0.25)));
    }
  }
  function median(v: number[]): number {
    const a = v.slice().sort((x,y) => x-y);
    return a.length % 2 ? a[(a.length-1)/2]! : (a[a.length/2-1]! + a[a.length/2]!) / 2;
  }
  const trained = fit(comps);
  return {
    ...MODEL,
    growth_weight: 0.15,
    maturity_floor: 0.8,
    maturity_range: 0.2,
    chain_bonus_per_extra: 0.03,
    fitted_intercept: trained.intercept,
    fitted_slope: trained.slope,
    fitted_categories: trained.offsets,
    comparison_count: comps.length,
    cv_median_abs_log_error: Math.round(median(fittedErrors) * 1000) / 1000,
    baseline_median_abs_log_error: Math.round(median(baseErrors) * 1000) / 1000,
  };
}

/** DefiLlama's version-marker rule: a name ending in a release is a pool of another protocol. */
const VERSIONED = /\s(V\d+(\.\d+)?|v\d+(\.\d+)?|\d+\.\d+)$/;

/** Whether a protocol records no token at all. */
export function isPreToken(p: SnapshotProtocol): boolean {
  return p.mcap_usd === null && p.gecko_id === null && p.symbol === null;
}

/** Whether a protocol is one the board may rank: pre-token, not an exchange, not a versioned pool. */
export function isRankable(p: SnapshotProtocol): boolean {
  return isPreToken(p) && p.category !== 'CEX' && !VERSIONED.test(p.name);
}

/** The snapshot's protocol by slug. */
function bySlug(protocols: SnapshotProtocol[]): Map<string, SnapshotProtocol> {
  return new Map(protocols.map((p) => [p.slug, p]));
}

/** The headline sentence's figures: how many watchlist slugs, how many rows, how many live protocols. */
export interface BoardSummary {
  watchlist_size: number;
  board_size: number;
  early_size: number;
  live_size: number;
}

/** The protocols the board ranks, strongest first, with ranks 1..n. */
export function buildBoard(snapshot: Snapshot, model: ModelConstants = calibrateModel(snapshot)): BoardRow[] {
  const index = bySlug(snapshot.protocols);
  const chosen = new Map<string, SnapshotProtocol>();
  // The watchlist is the floor: every slug, even one the snapshot no longer carries (it cannot, but the
  // board's coverage is the gate's row and is never gambled on a missing record).
  for (const slug of snapshot.watchlist) {
    const p = index.get(slug);
    if (p !== undefined) chosen.set(slug, p);
  }
  // The early radar: pre-token protocols below the watchlist floor, by TVL, capped. Never a replacement
  // for a watchlist row: a chosen protocol stays chosen.
  const early = snapshot.protocols
    .filter((p) => !chosen.has(p.slug) && isRankable(p) && p.tvl_usd < snapshot.floor_usd)
    .sort((a, b) => b.tvl_usd - a.tvl_usd || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0))
    .slice(0, EARLY_ROWS);
  for (const p of early) chosen.set(p.slug, p);

  const scored = [...chosen.values()].map((p) => {
    const { implied, growthPct, growthMult, maturityMult, age } = impliedValue(p, snapshot.as_of, model);
    return { p, implied, growthPct, growthMult, maturityMult, age };
  });
  scored.sort((a, b) => b.implied - a.implied || (a.p.slug < b.p.slug ? -1 : a.p.slug > b.p.slug ? 1 : 0));
  return scored.map((s, i) => ({
    rank: i + 1,
    slug: s.p.slug,
    name: s.p.name,
    category: s.p.category,
    chains: s.p.chains,
    tvl_usd: s.p.tvl_usd,
    change_7d: s.p.change_7d,
    mcap_usd: s.p.mcap_usd,
    listed_at: s.p.listed_at,
    gecko_id: s.p.gecko_id,
    symbol: s.p.symbol,
    token_status: 'pre-token',
    age_days: s.age,
    implied_value_usd: s.implied,
    model: {
      base_multiple: model.base_multiple,
      growth_pct: s.growthPct,
      growth_multiplier: round4(s.growthMult),
      maturity_multiplier: round4(s.maturityMult),
      age_days: s.age,
    },
    farm_steps: farmSteps(s.p, s.age).map(stepText),
  }));
}

const round4 = (n: number): number => Math.round(n * 1e4) / 1e4;

/** A step as one string: its action, then its cost and time, within the gate's 20..600 characters. */
export function stepText(step: FarmStep): string {
  let s = `${step.text} Cost: ${step.cost}. Time: ${step.time}.`;
  if (s.length > 600) s = `${s.slice(0, 596)}...`;
  if (s.length < 20) s = `${s} Hold the position and check the protocol's own page.`;
  return s;
}

/** The first chain a protocol names, or a neutral phrase. */
function chainOf(p: SnapshotProtocol): string {
  return p.chains.length > 0 ? p.chains[0]! : 'its main chain';
}

/** How much capital one farm position needs, from the protocol's own TVL. */
function capitalFor(p: SnapshotProtocol): number {
  if (p.tvl_usd >= 5_000_000_000) return 250;
  if (p.tvl_usd >= 1_000_000_000) return 150;
  if (p.tvl_usd >= 100_000_000) return 100;
  return 50;
}

/** How long to hold, from the protocol's age: younger protocols get a longer qualifying window. */
function holdDaysFor(age: number | null): number {
  if (age === null) return 30;
  if (age < 180) return 60;
  if (age < 365) return 45;
  return 30;
}

/** The category's one action, in the words a farmer can follow. */
function actionFor(p: SnapshotProtocol, capital: number, chain: string): string {
  const c = (p.category ?? '').toLowerCase();
  const name = p.name;
  if (c.includes('lend') || c.includes('cdp') || c.includes('collateral')) return `Supply $${capital} of USDC to ${name} on ${chain} and keep the position open.`;
  if (c.includes('dex') || c.includes('yield') || c.includes('leveraged farm')) return `Provide $${capital} of liquidity to ${name}'s main pool on ${chain} and keep the position open.`;
  if (c.includes('bridge')) return `Bridge $${capital} of USDC to ${chain} through ${name} and use the bridged funds in its app.`;
  if (c.includes('staking') || c.includes('restak')) return `Stake $${capital} of the chain's staking asset through ${name} and keep the receipt.`;
  if (c.includes('perpetual') || c.includes('derivative')) return `Deposit $${capital} of USDC as margin on ${name} and open one small hedge.`;
  if (c.includes('prediction')) return `Fund $${capital} and place one market position on ${name}.`;
  if (c.includes('curator') || c.includes('allocator')) return `Deposit $${capital} into a ${name} vault on ${chain} and keep the shares.`;
  if (c.includes('stable')) return `Mint or deposit $${capital} of the stable asset through ${name} on ${chain}.`;
  if (c.includes('rwa')) return `Mint $${capital} of the protocol's yield asset on ${chain} and hold it.`;
  if (c.includes('insurance')) return `Buy $${capital} of cover from ${name} on ${chain} and keep the policy.`;
  return `Deposit $${capital} of USDC into ${name} on ${chain} and keep the position open.`;
}

/**
 * A protocol's farm plan: six steps, each an action with a cost and a time. The plan is derived from
 * the protocol's own record (category, chains, TVL, age), never from a hand-written list of names.
 */
export function farmSteps(p: SnapshotProtocol, age: number | null): FarmStep[] {
  const chain = chainOf(p);
  const name = p.name;
  const capital = capitalFor(p);
  const hold = holdDaysFor(age);
  const c = (p.category ?? '').toLowerCase();
  const isMainnet = /ethereum|bitcoin/i.test(chain);
  const isSolana = /solana/i.test(chain);
  const gas = isSolana ? '$0.05–$1' : isMainnet ? '$5–$30' : '$0.20–$5';
  const setup = isMainnet ? '15–30 minutes' : '10–20 minutes';
  let activity = '', follow = '', unwind = '';
  if (/lend|collateral|cdp|borrow/i.test(c)) {
    activity = `If ${name} supports permissionless deposits on ${chain}, supply up to $${capital} of a supported low-volatility asset; do not borrow or leverage solely to collect possible points.`;
    follow = `Check ${name}'s official position page for collateral factors, withdrawal limits and whether supplying—not borrowing—is recorded as activity.`;
    unwind = 'Review utilization, reserve liquidity and any withdrawal queue before redeeming the supplied position.';
  } else if (/dex|liquidity manager|yield aggregator|leveraged farm/i.test(c)) {
    activity = `On ${name}'s verified ${chain} interface, compare a small swap with a basic two-asset liquidity position; use up to $${capital} only if the market is liquid.`;
    follow = 'Record quoted swap impact, pool fees and impermanent-loss exposure; do not open leveraged farms merely to generate activity.';
    unwind = 'Close the liquidity position, compare both token balances with the starting value and account for slippage before another cycle.';
  } else if (/bridge/i.test(c)) {
    activity = `If ${name} is an active bridge, quote a transfer of at most $${capital} from a supported origin to ${chain}; verify both endpoints, minimum and route fee before confirming.`;
    follow = 'Wait for the destination receipt and verify it independently; do not invent repeat transfers or cycle funds for volume.';
    unwind = 'Keep the funds on the destination chain unless there is a legitimate reason to return; account for the return bridge fee.';
  } else if (/rwa|asset|onchain capital allocator|curator|vault/i.test(c)) {
    activity = `Check whether ${name}'s ${chain} vault is publicly accessible, has minimum deposits or requires KYC; if eligible, consider at most $${capital} only after reading its terms.`;
    follow = 'Review redemption windows, administrator/custody risks, minimum positions and whether any points program has actually been announced.';
    unwind = 'Follow the documented redemption schedule; a queue, lockup or permission check can prevent immediate withdrawal.';
  } else if (/staking|restaking|validator|restak/i.test(c)) {
    activity = `If ${name} takes native staking assets on ${chain}, compare a small delegated stake with holding the asset outside the protocol before committing up to $${capital}.`;
    follow = 'Check validator fees, slashing risk, receipt-token liquidity and the unbonding delay; staking is not proof of a future token distribution.';
    unwind = 'Request unbonding through the verified interface, wait through the chain-defined period and reconcile the final amount.';
  } else if (/perpetual|derivative|options|prediction/i.test(c)) {
    activity = `Inspect ${name}'s ${chain} collateral and order requirements; only use a risk-limited action with a predefined maximum loss, not artificial trading volume.`;
    follow = 'Track commissions, funding, liquidation thresholds and open exposure; if exposure cannot be capped, mark the protocol as skip.';
    unwind = 'Close open exposure before withdrawing available collateral, allowing for settlement time and commissions.';
  } else if (/stablecoin|basis trading|synthetic|cdp/i.test(c)) {
    activity = `Review ${name}'s mint/redeem conditions, collateral quality and peg mechanism on ${chain}; only make a small deposit if redemptions are genuinely available.`;
    follow = 'Check minting spreads, custody, reserve disclosures and depeg history before leaving any position open.';
    unwind = 'Redeem through the official mechanism, including any delay or spread; avoid secondary swaps if the exit is illiquid.';
  } else {
    activity = `Find ${name}'s verified product documentation for ${chain} and identify a real user action; do not assume every protocol supports deposits or airdrop points.`;
    follow = 'If there is no accessible onchain action, use a read-only watchlist and mark this candidate skip rather than suggesting a fake transaction.';
    unwind = 'If funds were deposited, follow the product documentation for recovery, settlement or withdrawal.';
  }
  return [
    { text: `Verify the official domain, contract or app linked by ${name}'s own documentation and confirm ${chain} support; ignore unsolicited airdrop links.`, cost: '$0 for review', time: '10–15 minutes' },
    { text: `Set a personal risk cap for ${name}; reserve up to $${capital} of capital separately from gas. Confirm that any yield, points or future token is not guaranteed.`, cost: `$${capital} maximum at risk, not a nonrefundable fee`, time: '5 minutes' },
    { text: activity, cost: `scenario gas allowance ${gas} per transaction; live quote required`, time: setup },
    { text: follow, cost: '$0 to read; extra transactions have separate costs', time: '10–20 minutes' },
    { text: `Monitor ${name} for ${hold} days only if the original activity has economic value without an airdrop; keep transaction links and check changes once a week.`, cost: `up to $${capital} remains exposed; opportunity cost is not estimated`, time: `${hold} calendar days, 5 minutes weekly` },
    { text: unwind, cost: `estimate another ${gas} in gas plus any protocol spread`, time: '15 minutes to multiple days, depending on protocol' },
    { text: `Record ${name}'s actual fees, net cash result and any official eligibility announcement; do not represent speculative points as earned rewards.`, cost: '$0 for record-keeping', time: '10 minutes' }
  ];
}

/** The live-token protocols, by market cap, for the dashboard's Live token view. */
export function liveRows(snapshot: Snapshot): LiveRow[] {
  return snapshot.protocols
    .filter((p) => !isPreToken(p) && p.category !== 'CEX')
    .sort((a, b) => (b.mcap_usd ?? 0) - (a.mcap_usd ?? 0) || b.tvl_usd - a.tvl_usd)
    .slice(0, LIVE_ROWS)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      category: p.category,
      chains: p.chains,
      tvl_usd: p.tvl_usd,
      mcap_usd: p.mcap_usd,
      change_7d: p.change_7d,
    }));
}

/** A board row's compact form for data.js, with the farm plan generated in the page. */
export function radarRow(row: BoardRow): RadarRow {
  return {
    rank: row.rank,
    slug: row.slug,
    name: row.name,
    category: row.category,
    chains: row.chains,
    tvl_usd: row.tvl_usd,
    change_7d: row.change_7d,
    mcap_usd: row.mcap_usd,
    listed_at: row.listed_at,
    age_days: row.age_days,
    implied_value_usd: row.implied_value_usd,
    growth_multiplier: row.model.growth_multiplier,
    maturity_multiplier: row.model.maturity_multiplier,
    farm_steps: row.farm_steps,
  };
}

/** Everything the dashboard renders, from the snapshot. */
export function buildRadar(snapshot: Snapshot, model: ModelConstants = calibrateModel(snapshot)): { board: BoardRow[]; radar: RadarData } {
  const board = buildBoard(snapshot, model);
  const live = liveRows(snapshot);
  const early = board.filter((r) => !snapshot.watchlist.includes(r.slug)).length;
  const radar: RadarData = {
    as_of: snapshot.as_of,
    source: snapshot.source,
    floor_usd: snapshot.floor_usd,
    model,
    model_version: MODEL_VERSION,
    watchlist_size: snapshot.watchlist.length,
    board_size: board.length,
    early_size: early,
    live_size: live.length,
    rows: board.map(radarRow),
    live,
  };
  return { board, radar };
}

/** The snapshot out of a file's text, refused unless it is the shape the model scores. */
export function parseSnapshot(text: string): Snapshot {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new SnapshotError('snapshot.json is not JSON');
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new SnapshotError('snapshot.json is not a JSON object');
  const o = raw as Record<string, unknown>;
  if (typeof o.as_of !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(o.as_of)) throw new SnapshotError('snapshot.json has no as_of date');
  if (typeof o.source !== 'string') throw new SnapshotError('snapshot.json has no source');
  if (typeof o.floor_usd !== 'number' || !Number.isSafeInteger(o.floor_usd) || o.floor_usd <= 0) throw new SnapshotError('snapshot.json has no floor_usd');
  if (!Array.isArray(o.protocols)) throw new SnapshotError('snapshot.json has no protocols array');
  if (!Array.isArray(o.watchlist) || o.watchlist.some((s) => typeof s !== 'string')) throw new SnapshotError('snapshot.json has no watchlist of slugs');
  const protocols = o.protocols.map((v, i) => {
    if (typeof v !== 'object' || v === null || Array.isArray(v)) throw new SnapshotError(`snapshot.json's protocol ${i} is not an object`);
    const p = v as Record<string, unknown>;
    if (typeof p.slug !== 'string' || typeof p.name !== 'string' || typeof p.tvl_usd !== 'number' || !Number.isFinite(p.tvl_usd)) {
      throw new SnapshotError(`snapshot.json's protocol ${i} lacks a slug, a name or a TVL`);
    }
    return {
      slug: p.slug,
      name: p.name,
      category: typeof p.category === 'string' ? p.category : null,
      chains: Array.isArray(p.chains) ? p.chains.filter((c): c is string => typeof c === 'string') : [],
      tvl_usd: p.tvl_usd,
      change_7d: typeof p.change_7d === 'number' && Number.isFinite(p.change_7d) ? p.change_7d : null,
      mcap_usd: typeof p.mcap_usd === 'number' && Number.isFinite(p.mcap_usd) ? p.mcap_usd : null,
      listed_at: typeof p.listed_at === 'string' ? p.listed_at : null,
      gecko_id: typeof p.gecko_id === 'string' ? p.gecko_id : null,
      symbol: typeof p.symbol === 'string' ? p.symbol : null,
    };
  });
  return {
    as_of: o.as_of,
    source: o.source,
    floor_usd: o.floor_usd,
    protocols,
    watchlist: o.watchlist as string[],
  };
}

/** Why a board is not one the gate will take, or null: coverage, ranks, order, one shared implied value, and farm steps. */
export function boardIssue(board: BoardRow[], snapshot: Snapshot): string | null {
  const slugs = new Set(board.map((r) => r.slug));
  const missing = snapshot.watchlist.filter((s) => !slugs.has(s));
  if (missing.length > 0) return `the board misses ${missing.length} watchlist slug${missing.length === 1 ? '' : 's'}: ${missing.slice(0, 5).join(', ')}`;
  const ranks = board.map((r) => r.rank).sort((a, b) => a - b);
  for (let i = 0; i < ranks.length; i++) if (ranks[i] !== i + 1) return `rank ${i + 1} is ${ranks[i]}`;
  for (let i = 1; i < board.length; i++) if (board[i]!.implied_value_usd > board[i - 1]!.implied_value_usd) return `row ${i + 1} outranks row ${i} on implied value`;
  if (board.length >= 2 && board[0]!.implied_value_usd === board[board.length - 1]!.implied_value_usd) {
    return `all ${board.length} rows share the same implied value $${board[0]!.implied_value_usd}: a board that ranks nothing by value is not a ranking`;
  }
  for (const r of board) {
    const steps = r.farm_steps;
    if (steps.length < 3 || steps.length > 12) return `${r.slug} has ${steps.length} farm steps`;
    for (const s of steps) if (s.length < 20 || s.length > 600) return `${r.slug} has a farm step of ${s.length} characters`;
    if (!Number.isSafeInteger(r.implied_value_usd) || r.implied_value_usd <= 0) return `${r.slug} has implied value ${r.implied_value_usd}`;
  }
  return null;
}

/** A compact data.js: the dashboard's whole dataset as one script, no fetch and no network. */
export function dataScript(radar: RadarData): string {
  return `window.RADAR=${JSON.stringify(radar)};\n`;
}
