import assert from 'node:assert/strict';
import test from 'node:test';
import { buildRadar, boardIssue, calibrateModel, impliedValue, MODEL, type Snapshot, type SnapshotProtocol } from '../lib/model.ts';

function sample(): Snapshot {
  const categories = ['Lending', 'Dexs', 'RWA', 'Risk Curators', 'Liquid Staking', 'Bridge', 'Derivatives'];
  const protocols: SnapshotProtocol[] = [];
  for (let i=0; i<120; i++) {
    const tvl = 1_000_001 + i * 8_000_000;
    const cap = Math.exp(8.14 + 0.462 * Math.log(tvl) + (i % 5 - 2) * 0.12);
    protocols.push({slug:'traded-'+i,name:'Traded '+i,category:categories[i % categories.length]!,chains:['Ethereum'],tvl_usd:tvl,change_7d:0,mcap_usd:cap,listed_at:'2025-01-01',gecko_id:'token-'+i,symbol:'TOK'+i});
  }
  const watchlist: string[] = [];
  for(let i=0; i<40; i++) {
    const slug='watch-'+i; watchlist.push(slug);
    protocols.push({slug,name:'Watch '+i,category:categories[i % categories.length]!,chains:['Ethereum','Base'],tvl_usd:50_000_000+i*4_000_000,change_7d:(i%17)-8,mcap_usd:null,listed_at:'2025-08-01',gecko_id:null,symbol:null});
  }
  for(let i=0; i<170; i++) protocols.push({slug:'early-'+i,name:'Early '+i,category:categories[i % categories.length]!,chains:['Base'],tvl_usd:2_000_000 + i*200_000,change_7d:0,mcap_usd:null,listed_at:null,gecko_id:null,symbol:null});
  return {as_of:'2026-11-14',source:'synthetic offline CI fixture',floor_usd:50_000_000,protocols,watchlist};
}

test('fitted radar is deterministic, covers watchlist and has matching plans',() => {
  const input=sample(), first=buildRadar(input), second=buildRadar(input);
  assert.equal(boardIssue(first.board,input),null);
  assert.equal(first.board.length,200);
  assert.deepEqual(first.board,second.board);
  assert.equal(new Set(first.board.map(r=>r.slug)).size,200);
  assert.ok(input.watchlist.every(slug => first.board.some(r=>r.slug===slug)));
  assert.deepEqual(first.radar.rows.map(r=>r.farm_steps),first.board.map(r=>r.farm_steps));
  for(const r of first.board) {
    assert.ok(r.farm_steps.length>=3 && r.farm_steps.length<=12);
    assert.ok(r.farm_steps.every(t=>t.length>=20 && t.length<=600));
    assert.equal(r.implied_value_usd,impliedValue(input.protocols.find(p=>p.slug===r.slug)!,input.as_of,first.radar.model).implied);
  }
});

test('fit uses traded comparables and improves holdout error on known synthetic curve',() => {
  const m=calibrateModel(sample());
  assert.equal(m.comparison_count,120);
  assert.ok((m.cv_median_abs_log_error??99) < (m.baseline_median_abs_log_error??0));
  assert.ok(Math.abs((m.fitted_slope??0)-0.462)<0.12);
  assert.equal(MODEL.base_multiple,0.25); // the benchmark is immutable
});

test('chain normalization preserves the score for equivalent chain names', () => {
  const input = sample();
  const protocol = input.protocols.find(p => p.slug === input.watchlist[0])!;
  const model = calibrateModel(input);
  const expected = impliedValue(protocol, input.as_of, model);
  assert.deepEqual(impliedValue({ ...protocol, chains: ['Ethereum', 'Base', ' ethereum ', 'BASE', ''] }, input.as_of, model), expected);
});

test('known and unverified routes use the same evidence and steps in board and dashboard', () => {
  const input = sample();
  input.protocols.find(p => p.slug === input.watchlist[0])!.slug = 'hive-protocol';
  input.watchlist[0] = 'hive-protocol';
  const { board, radar } = buildRadar(input);
  const hive = board.find(row => row.slug === 'hive-protocol')!;
  const detail = radar.rows.find(row => row.slug === hive.slug)!;
  assert.match(hive.token_status, /B² Hive BTC staking.*B2 rewards/);
  assert.equal(detail.token_status, hive.token_status);
  assert.deepEqual(detail.token_evidence, hive.token_evidence);
  assert.deepEqual(detail.farm_steps, hive.farm_steps);
  assert.match(hive.farm_steps.join(' '), /BTC-specific fees.*unverified/);
  assert.match(board.find(row => row.slug === 'watch-1')!.farm_steps.join(' '), /Costs and timing are unverified/);
  assert.ok(board.every(row => row.farm_steps.every(step => !/\$\d|\d+ calendar days/.test(step))));
});
