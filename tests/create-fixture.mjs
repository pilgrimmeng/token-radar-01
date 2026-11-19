// Deterministic synthetic fixture for CI only; not shipped as contestant data.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
const file = resolve(process.argv[2] ?? '/tmp/token-radar-smoke-snapshot.json');
const categories = ['Lending', 'Dexs', 'RWA', 'Risk Curators', 'Liquid Staking', 'Bridge', 'Derivatives'];
const protocols = [];
const watchlist = [];
for (let i=0;i<120;i++) {
  const tvl_usd=1_000_001 + i*8_000_000;
  const mcap_usd=Math.exp(8.14+0.462*Math.log(tvl_usd)+(i%5-2)*0.12);
  protocols.push({slug:'traded-'+i,name:'Traded '+i,category:categories[i%categories.length],chains:['Ethereum'],tvl_usd,change_7d:0,mcap_usd,listed_at:'2025-01-01',gecko_id:'token-'+i,symbol:'TOK'+i});
}
for (let i=0;i<40;i++){
  const slug='watch-'+i; watchlist.push(slug);
  protocols.push({slug,name:'Watch '+i,category:categories[i%categories.length],chains:['Ethereum','Base'],tvl_usd:50_000_000+i*4_000_000,change_7d:i%17-8,mcap_usd:null,listed_at:'2025-08-01',gecko_id:null,symbol:null});
}
for(let i=0;i<170;i++)protocols.push({slug:'early-'+i,name:'Early '+i,category:categories[i%categories.length],chains:['Base'],tvl_usd:2_000_000+i*200_000,change_7d:0,mcap_usd:null,listed_at:null,gecko_id:null,symbol:null});
mkdirSync(dirname(file),{recursive:true});
writeFileSync(file,JSON.stringify({as_of:'2026-11-14',source:'synthetic CI fixture',floor_usd:50_000_000,protocols,watchlist}));
console.log(file);
