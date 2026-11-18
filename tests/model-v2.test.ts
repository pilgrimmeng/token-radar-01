import assert from 'node:assert/strict';
import test from 'node:test';
import { MODEL, impliedValue, isPreToken, buildBoard } from '../lib/model.ts';

const protocol = (overrides: Record<string, unknown> = {}) => ({
  slug: 'test-project', name: 'Test Project', category: 'Lending',
  chains: ['Ethereum'], tvl_usd: 100_000_000, change_7d: 10,
  mcap_usd: null, listed_at: '2025-11-14', gecko_id: null, symbol: null,
  ...overrides,
});

test('duplicated chain names do not create a bonus', () => {
  const a = impliedValue(protocol(), '2026-11-14', MODEL);
  const b = impliedValue(protocol({chains:['Ethereum','ethereum',' Ethereum ']}), '2026-11-14', MODEL);
  assert.equal(a.chainMult, 1);
  assert.equal(b.chainMult, 1);
  assert.equal(a.implied, b.implied);
});

test('multichain bonus is capped at 20%', () => {
  const single = impliedValue(protocol(), '2026-11-14', MODEL);
  const many = impliedValue(protocol({chains: Array.from({length:30},(_,i)=>'chain'+i)}), '2026-11-14', MODEL);
  assert.equal(many.chainMult, 1.2);
  assert.ok(Math.abs(many.implied / single.implied - 1.2) < 0.000001);
});

test('seven-day spikes are clipped rather than dominating the score', () => {
  const capped = impliedValue(protocol({change_7d:120}), '2026-11-14', MODEL);
  const spike = impliedValue(protocol({change_7d:4448}), '2026-11-14', MODEL);
  assert.equal(spike.implied,capped.implied);
});

test('token fields are metadata checks, not proof of token absence', () => {
  assert.equal(isPreToken(protocol()),true);
  assert.equal(isPreToken(protocol({symbol:'TEST'})),false);
});

test('watchlist remains fully included and ranked', () => {
  const snapshot = {as_of:'2026-11-14',source:'fixture',floor_usd:50_000_000,
    watchlist:['test-project'],protocols:[protocol(), protocol({slug:'small',name:'Small',tvl_usd:12_000_000})]};
  const board = buildBoard(snapshot, MODEL);
  assert.equal(board.length,2);
  assert.ok(board.some(p=>p.slug==='test-project'));
  assert.ok(board[0].implied_value_usd >= board[1].implied_value_usd);
  assert.ok(board.every(p=>p.model.chain_multiplier>=1 && p.model.chain_multiplier<=1.2));
});
