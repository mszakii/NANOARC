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
      panelOver: (() => { const p = document.querySelector('.card.panel, .card'); const t = tray?.getBoundingClientRect(); if (!p || !t) return null; const b = p.getBoundingClientRect(); return Math.max(0, Math.round(b.bottom - t.bottom), Math.round(t.top - b.top)); })(),
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
  valveClosed: `${HELPERS}
    await c('[data-action="start"]'); await c('[data-action="launch"]');
    await c('[data-action="open"]'); await c('[data-action="select"][data-id="save_power"]');
    await c('[data-action="confirm"]'); await c('[data-action="continue"]');
    await w(1600);
    fit();`,
  valveResult: `${HELPERS}
    await c('[data-action="start"]'); await c('[data-action="launch"]');
    await c('[data-action="open"]'); await c('[data-action="select"][data-id="save_power"]');
    await c('[data-action="confirm"]'); await c('[data-action="continue"]');
    await c('[data-action="open"]'); await c('[data-action="select"][data-id="adjust"]');
    await c('[data-action="confirm"]'); await w(900);
    fit();`,
  greenhouse: `${HELPERS}
    await c('[data-action="start"]'); await c('[data-action="launch"]');
    await c('[data-action="open"]'); await c('[data-action="select"][data-id="lights_on"]');
    fit();`,
};

// Walk a whole run and measure every decision: open, preview, result.
SCENARIOS.journey = `${HELPERS}
  const out = [];
  const measure = (label) => { const f = fit(); out.push({ label, over: f.panelOver, trayOver: f.trayScroll[0] - f.trayScroll[1], doc: f.docScroll[1] - innerHeight, primaryVisible: f.primaryVisible }); };
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
  { name: 'valve-closed-1366x768', w: 1366, h: 768, mobile: false, scenario: 'valveClosed' },
  { name: 'valve-result-1366x768', w: 1366, h: 768, mobile: false, scenario: 'valveResult' },
  { name: 'valve-closed-375x812', w: 375, h: 812, mobile: true, scenario: 'valveClosed' },
];

if (process.env.JOURNEY) RUNS.splice(0, RUNS.length,
  { name: 'journey-1366x768', w: 1366, h: 768, mobile: false, scenario: 'journey' },
  { name: 'journey-1920x1080', w: 1920, h: 1080, mobile: false, scenario: 'journey' },
  { name: 'journey-375x812', w: 375, h: 812, mobile: true, scenario: 'journey' });

// Tour: screenshot each active device before it is opened, then make a choice and move on.
const TOUR = [
  ['greenhouse', 'save_power'], ['valve', 'adjust'], ['shelter', 'at_alert'], ['bag', null], ['bag-spot', null],
  ['oxygen', 'restart'], ['recycler', 'standard'], ['printer', 'print'], ['antenna', 'check_antenna'], ['antenna2', 'send'],
];
async function tour(run) {
  await send('Emulation.setDeviceMetricsOverride', { width: run.w, height: run.h, deviceScaleFactor: 1, mobile: run.mobile });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: run.reduce ? 'reduce' : 'no-preference' }] });
  await send('Page.navigate', { url: base });
  await sleep(1200);
  await evaluate(`${HELPERS} await c('[data-action="start"]'); await c('[data-action="launch"]'); true;`);
  for (const [name, id] of TOUR) {
    await sleep(1300);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(outDir, `${label}-tour-${run.w}x${run.h}-${name}.png`), Buffer.from(shot.data, 'base64'));
    if (name === 'bag') { await evaluate(`${HELPERS} await c('[data-action="bag"]'); true;`); continue; }
    if (name === 'bag-spot') { await evaluate(`${HELPERS} await c('[data-action="bag-spot"]'); await c('[data-action="continue"]'); true;`); continue; }
    await evaluate(`${HELPERS}
      if (document.querySelector('[data-action="open"]')) await c('[data-action="open"]');
      await c('[data-action="select"][data-id="${id}"]'); await c('[data-action="confirm"]');
      if ('${name}' !== 'valve' && '${name}' !== 'shelter') { await w(2300); if (document.querySelector('[data-action="continue"]')) await c('[data-action="continue"]'); }
      if ('${name}' === 'valve') { await w(900); await c('[data-action="continue"]'); }
      true;`);
  }
  await sleep(1500);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(outDir, `${label}-tour-${run.w}x${run.h}-end.png`), Buffer.from(shot.data, 'base64'));
  console.log('tour done', run.w, run.h);
}
// Keyboard: real key events only (Enter / Tab / Shift+Tab). Reports each focused control.
async function key(k, shift = false) {
  const codes = { Enter: [13, String.fromCharCode(13)], Tab: [9, ''] };
  const [vk, text] = codes[k];
  const base = { key: k, code: k, windowsVirtualKeyCode: vk, modifiers: shift ? 8 : 0 };
  await send('Input.dispatchKeyEvent', { type: 'keyDown', ...base, ...(text ? { text } : {}) });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
  await sleep(380);
}
const focused = () => evaluate(`(() => { const a = document.activeElement; return {
  id: a?.dataset?.action ? a.dataset.action + (a.dataset.id ? ':' + a.dataset.id : '') : a?.dataset?.device ? 'hot:' + a.dataset.device : a?.tagName,
  visible: a?.matches?.(':focus-visible') ?? false,
  ring: a ? getComputedStyle(a).outlineStyle + '/' + getComputedStyle(a).boxShadow.slice(0, 40) : '',
  step: document.querySelector('.card.panel')?.dataset.step ?? document.querySelector('.final-line') ? 'end' : '' }; })()`);
async function keyboardRun(run) {
  await send('Emulation.setDeviceMetricsOverride', { width: run.w, height: run.h, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await send('Page.navigate', { url: base });
  await sleep(1200);
  const log = [];
  let hotspotChecked = false;
  for (let i = 0; i < 70; i += 1) {
    const f = await focused();
    // At the first device step, reach the marked device by Shift+Tab and activate it with Enter.
    if (!hotspotChecked && f.id === 'open') {
      for (let t = 0; t < 8; t += 1) {
        await key('Tab', true);
        const g = await focused();
        if (g.id?.startsWith('hot:')) {
          const shot = await send('Page.captureScreenshot', { format: 'png' });
          writeFileSync(join(outDir, `${label}-keyboard-hotspot-focus-${run.w}x${run.h}.png`), Buffer.from(shot.data, 'base64'));
          await key('Enter');
          const opened = await evaluate(`[...document.querySelectorAll('[data-action="select"]')].map((b) => b.dataset.id).join(',')`);
          log.push(`Shift+Tab x${t + 1} -> ${g.id} focus-visible=${g.visible} ring=${g.ring}; Enter opened [${opened}]`);
          break;
        }
      }
      hotspotChecked = true;
      continue;
    }
    const final = await evaluate(`document.querySelector('.final-line')?.textContent.trim() ?? ''`);
    if (final) { log.push('END: ' + final); break; }
    log.push(f.id + (f.visible ? '' : ' (no focus-visible)'));
    await key('Enter');
  }
  console.log(log.join(String.fromCharCode(10)));
}
// Motion check: the same valve decision with and without reduced motion.
async function motionCheck(reduce) {
  await send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reduce ? 'reduce' : 'no-preference' }] });
  await send('Page.navigate', { url: base });
  await sleep(1200);
  const snap = `(() => {
    const cs = (q) => getComputedStyle(document.querySelector(q));
    const anims = document.getAnimations().filter((a) => a.playState === 'running');
    return {
      valveRotate: cs('.valve-wheel').rotate, arrowScale: cs('.heat-arrow').scale,
      delta: document.querySelector('.scene__note--delta').textContent + ' @' + cs('.scene__note--delta').opacity,
      hudWarmth: document.querySelector('[data-res="warmth"] .ctr-val').textContent.trim(),
      continueReady: document.querySelector('[data-action="continue"]')?.getAttribute('aria-disabled') !== 'true',
      running: anims.map((a) => (a.animationName ?? a.transitionProperty ?? 'waapi') + ':' + Math.round(a.effect?.getTiming?.().duration ?? 0)).slice(0, 12),
    }; })()`;
  await evaluate(`${HELPERS}
    await c('[data-action="start"]'); await c('[data-action="launch"]');
    await c('[data-action="open"]'); await c('[data-action="select"][data-id="save_power"]');
    await c('[data-action="confirm"]'); await c('[data-action="continue"]');
    await c('[data-action="open"]'); await c('[data-action="select"][data-id="adjust"]');
    await c('[data-action="confirm"]'); true;`);
  await sleep(60);
  const early = await evaluate(snap);
  await sleep(1400);
  const settled = await evaluate(snap);
  console.log(JSON.stringify({ reduce, after60ms: early, after1460ms: settled }));
}
if (process.env.MOTION) {
  try {
    await send('Page.enable');
    await send('Runtime.enable');
    await motionCheck(false);
    await motionCheck(true);
  } finally {
    ws.close();
    chrome.kill();
  }
  process.exit(0);
}

if (process.env.KEYS) {
  try {
    await send('Page.enable');
    await send('Runtime.enable');
    await keyboardRun({ w: 1366, h: 768 });
  } finally {
    ws.close();
    chrome.kill();
  }
  process.exit(0);
}

if (process.env.TOUR) {
  try {
    await send('Page.enable');
    await send('Runtime.enable');
    for (const size of process.env.TOUR.split(',')) {
      const [w, h] = size.split('x').map(Number);
      await tour({ w, h, mobile: w < 700, reduce: Boolean(process.env.REDUCE) });
    }
  } finally {
    ws.close();
    chrome.kill();
  }
  process.exit(0);
}

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
