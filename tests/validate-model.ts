// Run with Node 22.18+: node tests/validate-model.ts /path/to/snapshot.json
// The sealed snapshot is provided externally and must never be committed.
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { buildBoard, buildRadar, boardIssue, dataScript, MODEL, parseSnapshot } from '../lib/model.ts';

const path = process.argv[2];
if (!path) {
  process.stderr.write('Usage: node tests/validate-model.ts /path/to/snapshot.json\n');
  process.exit(2);
}
function must(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}
const snapshot = parseSnapshot(readFileSync(path, 'utf8'));
const { board, radar } = buildRadar(snapshot);
must(boardIssue(board, snapshot) === null, 'board violates the core gate rules');
must(board.length >= 100, 'fewer than 100 board rows');
must(new Set(board.map(r => r.slug)).size === board.length, 'duplicate slug');
must(board.every(r => r.farm_steps.length >= 3 && r.farm_steps.length <= 12), 'invalid plan length');
must(board.every(r => r.farm_steps.every(s => s.length >= 20 && s.length <= 600)), 'invalid step size');
must(radar.rows.every((r,i) => JSON.stringify(r.farm_steps) === JSON.stringify(board[i]!.farm_steps)), 'dashboard plan differs from board');
const m = radar.model;
const app = readFileSync(new URL('../dashboard/app.js', import.meta.url), 'utf8');
const browserFormula = app.match(/^  function impliedOf\(row, model\) \{[\s\S]*?^  \}/m);
must(browserFormula, 'cannot locate the dashboard valuation function');
const browserImplied = runInNewContext(`(${browserFormula[0]})`) as (row: typeof radar.rows[number], model: typeof m) => number;
for (const row of radar.rows) {
  must(browserImplied(row, m) === row.implied_value_usd, `dashboard valuation differs for ${row.slug}`);
  if (row.chains[0]) {
    const duplicate = { ...row, chains: [...row.chains, ` ${row.chains[0].toUpperCase()} `] };
    must(browserImplied(duplicate, m) === row.implied_value_usd, `duplicate chain changes dashboard valuation for ${row.slug}`);
  }
}
must(m.comparison_count !== undefined && m.comparison_count >= 20, 'too few traded comparables');
must(m.cv_median_abs_log_error !== undefined && m.baseline_median_abs_log_error !== undefined, 'calibration missing');
must(m.cv_median_abs_log_error < m.baseline_median_abs_log_error, 'fit is not better than starter baseline on held-out data');
must(Buffer.byteLength(dataScript(radar)) < 4_194_304, 'dashboard data exceeds 4 MiB');
const originalTop = new Set(buildBoard(snapshot, MODEL).slice(0,20).map(r => r.slug));
const topOverlap = board.slice(0,20).filter(r => originalTop.has(r.slug)).length;
console.log(JSON.stringify({
  snapshot_date: snapshot.as_of,
  input_protocols: snapshot.protocols.length,
  watchlist_covered: snapshot.watchlist.filter(slug => board.some(row => row.slug === slug)).length,
  rows: board.length,
  calibration_tokens: m.comparison_count,
  base_fit_cv_median_abs_log_error: m.cv_median_abs_log_error,
  bare_tvl_baseline_cv_median_abs_log_error: m.baseline_median_abs_log_error,
  top20_overlap: topOverlap,
  top20_with_protocol_evidence: board.slice(0, 20).filter(row => row.token_evidence).length,
  top20_slugs: board.slice(0, 20).map(row => row.slug),
  dashboard_bytes: Buffer.byteLength(dataScript(radar)),
  result: 'PASS: pure-data model and board checks'
},null,2));
