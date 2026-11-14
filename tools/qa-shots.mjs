// QA screenshots of real decision screens via headless Chrome (CDP over Node's built-in WebSocket).
// Usage: node tools/qa-shots.mjs <baseUrl> <outDir> <label>
// Dev tool only. Drives the game through its normal buttons; never touches game internals.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [base = 'http://localhost:4173/', outDir = 'docs/qa', label = 'shot'] = process.argv.slice(2);
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9333;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(outDir, { recursive: true });

const profile = mkdtempSync(join(tmpdir(), 'qs-chrome-'));
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' });

async function connect() {
  for (let i = 0; i < 50; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' });
      if (res.ok) return (await res.json()).webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error('Chrome did not start');
}

const ws = new WebSocket(await connect());
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    id += 1;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, replMode: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? 'eval failed');
  return r.result.value;
}

// Page helpers injected as a string: click by selector, wait for re-render.
const HELPERS = `
  const w = (ms = 350) => new Promise((r) => setTimeout(r, ms));
  const c = async (s) => { const e = document.querySelector(s); if (!e) throw new Error('missing ' + s); e.click(); await w(); };
  const fit = () => {
    const tray = document.querySelector('.tray');
    const primary = document.querySelector('.tray [data-primary]');
    const r = primary?.getBoundingClientRect();
    return {
      viewport: [innerWidth, innerHeight],
      docScroll: [document.documentElement.scrollWidth, document.documentElement.scrollHeight],
      trayScroll: tray ? [tray.scrollHeight, tray.clientHeight] : null,
      primaryVisible: r ? r.top >= 0 && r.bottom <= innerHeight : null,
      primary: primary?.textContent.trim().replace(/\\s+/g, ' '),
    };
  };`;

const SCENARIOS = {
  valve: `${HELPERS}
    await c('[data-action="start"]'); await c('[data-action="launch"]');
    await c('[data-action="open"]'); await c('[data-action="select"][data-id="save_power"]');
    await c('[data-action="confirm"]'); await c('[data-action="continue"]');
    await w(600);
    const closed = fit();
    await c('[data-action="open"]'); await c('[data-action="select"][data-id="adjust"]');
    ({ closed, open: fit() });`,
  greenhouse: `${HELPERS}
    await c('[data-action="start"]'); await c('[data-action="launch"]');
    await c('[data-action="open"]'); await c('[data-action="select"][data-id="lights_on"]');
    fit();`,
};

// Walk a whole run and measure every decision: open, preview, result.
SCENARIOS.journey = `${HELPERS}
  const out = [];
  const measure = (label) => { const f = fit(); out.push({ label, over: f.trayScroll[0] - f.trayScroll[1], doc: f.docScroll[1] - innerHeight, primaryVisible: f.primaryVisible }); };
  await c('[data-action="start"]'); await c('[data-action="launch"]');
  const plan = ['save_power', 'adjust', 'early', 'restart', 'standard', 'print', 'check_antenna', 'send'];
  for (const id of plan) {
    const step = document.querySelector('.card.panel')?.dataset.step;
    if (document.querySelector('[data-action="open"]')) { await c('[data-action="open"]'); measure(step + ':open'); }
    await c('[data-action="select"][data-id="' + id + '"]'); measure(step + ':' + id);
    await c('[data-action="confirm"]');
    if (step === 'shelter') { measure('shelter:bag'); await c('[data-action="bag"]'); await c('[data-action="bag-spot"]'); }
    await w(2200);
    if (!document.querySelector('[data-action="continue"]')) { measure('end'); break; }
    measure(step + ':result');
    await c('[data-action="continue"]');
  }
  out;`;

const RUNS = [
  { name: 'valve-1366x768', w: 1366, h: 768, mobile: false, scenario: 'valve' },
  { name: 'valve-1920x1080', w: 1920, h: 1080, mobile: false, scenario: 'valve' },
  { name: 'greenhouse-375x812', w: 375, h: 812, mobile: true, scenario: 'greenhouse' },
  { name: 'valve-375x812', w: 375, h: 812, mobile: true, scenario: 'valve' },
];

if (process.env.JOURNEY) RUNS.splice(0, RUNS.length,
  { name: 'journey-1366x768', w: 1366, h: 768, mobile: false, scenario: 'journey' },
  { name: 'journey-1920x1080', w: 1920, h: 1080, mobile: false, scenario: 'journey' },
  { name: 'journey-375x812', w: 375, h: 812, mobile: true, scenario: 'journey' });

const report = {};
try {
  await send('Page.enable');
  await send('Runtime.enable');
  for (const run of RUNS) {
    await send('Emulation.setDeviceMetricsOverride', { width: run.w, height: run.h, deviceScaleFactor: 1, mobile: run.mobile });
    await send('Emulation.setTouchEmulationEnabled', { enabled: run.mobile, maxTouchPoints: run.mobile ? 5 : 1 });
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
    await send('Page.navigate', { url: base });
    await sleep(1200);
    report[run.name] = await evaluate(SCENARIOS[run.scenario]);
    await sleep(900);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const file = join(outDir, `${label}-${run.name}.png`);
    writeFileSync(file, Buffer.from(shot.data, 'base64'));
    console.log(file, JSON.stringify(report[run.name]));
  }
} finally {
  ws.close();
  chrome.kill();
}
