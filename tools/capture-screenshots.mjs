// Capture REAL screenshots of the generated, offline dashboard.
// Usage: node tools/capture-screenshots.mjs out
// Run after node main.ts --prepare --input ... --output out
import { existsSync, mkdirSync, readFileSync, statSync, mkdtempSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const out = resolve(process.argv[2] ?? 'out');
const page = resolve(out, 'dashboard/index.html');
const boardFile = resolve(out, 'board.json');
if (!existsSync(page) || !existsSync(boardFile)) {
  throw new Error('Run node main.ts --prepare --input <snapshot.json> --output out first');
}
const board = JSON.parse(readFileSync(boardFile, 'utf8')).rows;
if (!Array.isArray(board) || board.length < 100) throw new Error('Missing usable board');
const counts = new Map();
for (const r of board) counts.set(r.category || 'Other', (counts.get(r.category || 'Other') || 0) + 1);
const category = [...counts].sort((a,b) => b[1]-a[1])[0]?.[0] || 'Other';
const chromeBins = [process.env.CHROME_BIN, 'google-chrome', 'chromium', 'chromium-browser', '/usr/bin/chromium'].filter(Boolean);
const chrome = chromeBins.find(bin => {
  const r = spawnSync(bin, ['--version'], {encoding: 'utf8', timeout: 5000});
  return r.status === 0;
});
if (!chrome) throw new Error('Install Chrome/Chromium or set CHROME_BIN');
const base = pathToFileURL(page).href;
const dir = resolve('screenshots');
mkdirSync(dir, {recursive:true});
const screens = [
  ['01-board.png', base],
  ['02-detail.png', base + '#'+new URLSearchParams({p: board[0].slug})],
  ['03-filter.png', base + '#'+new URLSearchParams({category})],
];
const hashes = [];
for (const [file,url] of screens) {
  const userDir = mkdtempSync(join(tmpdir(), 'radar-chrome-'));
  const cmd = [
    '--user-data-dir=' + userDir,
    '--headless=new','--disable-gpu','--hide-scrollbars','--allow-file-access-from-files',
    '--window-size=1440,900','--virtual-time-budget=1800',
    '--screenshot=' + resolve(dir,file),url
  ];
  if (process.getuid?.() === 0) cmd.unshift('--no-sandbox');
  const domCmd = cmd.filter(arg => !arg.startsWith('--screenshot='));
  domCmd.unshift('--dump-dom');
  const dom = spawnSync(chrome, domCmd, {encoding:'utf8',timeout:30000});
  if (dom.status !== 0 || !dom.stdout.includes('Pre-token rows scored')) throw new Error('Page did not render live board: '+file+' HTML '+String(dom.stdout).slice(0,1200)+' STDERR '+String(dom.stderr).slice(-1200));
  const run = spawnSync(chrome,cmd,{encoding:'utf8',timeout:30000});
  if (run.status !== 0) throw new Error('Capture failed: '+file+' '+String(run.stderr).slice(0,700));
  const size=statSync(resolve(dir,file)).size;
  if (size > 524288 || size === 0) throw new Error(file+' invalid image size '+size+' bytes (cap 512 KiB)');
  hashes.push(createHash('sha256').update(readFileSync(resolve(dir,file))).digest('hex'));
  rmSync(userDir,{recursive:true,force:true});
  console.log(file+' '+size+' bytes; '+url);
}
if (new Set(hashes).size !== screens.length) throw new Error('Browser captured identical images for different states; screenshots are invalid');
console.log('Captured three offline browser views. Add screenshots/ to git and rerun main.ts WITHOUT --prepare.');
