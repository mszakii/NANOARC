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
  '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--autoplay-policy=user-gesture-required', 'about:blank',
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

// JOURNEY=1 uses the default sizes; JOURNEY=360x800,375x664 measures those sizes instead.
// Phone heights with browser bars visible: about 360x692 (Chrome, Android) and 375x664 (Safari, iPhone).
if (process.env.JOURNEY) {
  const sizes = process.env.JOURNEY === '1' ? '1366x768,1920x1080,375x812' : process.env.JOURNEY;
  RUNS.splice(0, RUNS.length, ...sizes.split(',').map((size) => {
    const [w, h] = size.split('x').map(Number);
    return { name: `journey-${size}`, w, h, mobile: w < 700, scenario: 'journey' };
  }));
}

// Tour: screenshot each active device before it is opened, then make a choice and move on.
const TOUR = [
  ['greenhouse', 'save_power'], ['valve', 'adjust'], ['shelter', 'at_alert'], ['bag', null], ['bag-spot', null],
  ['oxygen', 'restart'], ['recycler', 'standard'], ['printer', 'print'], ['antenna', 'check_antenna'], ['antenna2', 'send'],
];
async function tour(run) {
  await send('Emulation.setDeviceMetricsOverride', { width: run.w, height: run.h, deviceScaleFactor: 1, mobile: run.mobile });
  await send('Emulation.setTouchEmulationEnabled', { enabled: run.mobile, maxTouchPoints: run.mobile ? 5 : 1 });
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
  if (process.env.NOAUDIO) {
    // Simulate a browser without Web Audio: the game must stay fully playable.
    await send('Page.addScriptToEvaluateOnNewDocument', { source: 'delete window.AudioContext; delete window.webkitAudioContext;' });
  }
  await send('Page.navigate', { url: base });
  await sleep(1200);
  const log = [];
  if (process.env.NOAUDIO) {
    await evaluate(`document.querySelector('[data-action="sound"]').click(); true`);
    log.push('no Web Audio: toggle reads "' + (await evaluate(`document.querySelector('[data-action="sound"]').textContent.trim()`)) + '"');
    await evaluate(`document.querySelector('[data-action="start"]').focus(); true`);
  }
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
// Touch: emulated phone taps (Input.dispatchTouchEvent) on Water Training, the ISS comparison and a recovery.
async function tap(selector) {
  const box = await evaluate(`(() => { const e = document.querySelector('${selector}'); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })()`);
  if (!box) throw new Error('tap target missing: ' + selector);
  const [x, y] = box;
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(450);
}
const read = (expr) => evaluate(expr);
async function touchRun() {
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await send('Page.navigate', { url: base });
  await sleep(1200);
  const water = `document.querySelector('[data-res="water"] .ctr-val')?.textContent.trim()`;
  const out = [];
  await tap('[data-action="training"]');
  for (const [mode, option, bottles, turns] of [['kit', 'kit', '2', 1], ['standard', 'standard', '1', 2]]) {
    await tap(`[data-action="practice"][data-id="${mode}"]`);
    const start = await read(water);
    await tap('.hot[data-device="recycler"]');
    await tap(`[data-action="select"][data-id="${option}"]`);
    const preview = await read(`document.querySelector('.preview')?.textContent.replace(/\s+/g, ' ').trim()`);
    await tap('[data-action="confirm"]');
    await sleep(turns * 1000 + 600);
    const result = await read(`document.querySelector('.result')?.textContent.replace(/\s+/g, ' ').trim()`);
    out.push(`training ${mode}: start ${start} bottles; preview "${preview}"; end ${await read(water)} bottles; "${result}"`);
    if (mode === 'kit') {
      await tap('[data-action="science"][data-id="iss"]');
      const iss = async () => read(`(() => { const d = document.querySelector('#science-dialog'); return { drops: d.querySelectorAll('.iss-drop').length, recovered: d.querySelectorAll('.iss-drop[data-recovered="true"]').length, text: d.querySelector('[role="status"] strong')?.textContent, source: [...d.querySelectorAll('.links a')].some((a) => a.href.includes('ntrs.nasa.gov')) }; })()`);
      const at70 = await iss();
      await tap('[data-iss-mode="85"]');
      const at85 = await iss();
      await tap('[data-science-close]');
      out.push(`ISS: 70% ${at70.recovered}/${at70.drops} "${at70.text}" source=${at70.source}; 85% ${at85.recovered}/${at85.drops} "${at85.text}"; water after close ${await read(water)}`);
      await tap('[data-action="training"]');
    }
  }
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(outDir, `${label}-touch-training-375x812.png`), Buffer.from(shot.data, 'base64'));
  console.log(out.join(String.fromCharCode(10)));
}
// Real mouse click (a trusted user gesture), used for audio and the Notebook.
async function clickReal(selector) {
  const box = await evaluate(`(() => { const e = document.querySelector('${selector}'); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })()`);
  if (!box) throw new Error('click target missing: ' + selector);
  const [x, y] = box;
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  await sleep(300);
}
async function shotTo(name) {
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(outDir, `${label}-${name}.png`), Buffer.from(shot.data, 'base64'));
}
async function pressEscape() {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await sleep(400);
}

// Notebook: Test the Membrane in Water Training, at one size, with or without reduced motion.
async function notebookRun({ w, h, reduce }) {
  const tag = `${w}x${h}${reduce ? '-reduce' : ''}`;
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 700 });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reduce ? 'reduce' : 'no-preference' }] });
  await send('Page.navigate', { url: base });
  await sleep(1200);
  const water = `document.querySelector('[data-res="water"] .ctr-val')?.textContent.trim()`;
  const stageOf = `document.querySelector('.membrane')?.dataset.stage`;
  await clickReal('[data-action="training"]');
  await clickReal('[data-action="practice"][data-id="kit"]');
  await clickReal('[data-action="open"]');
  await clickReal('[data-action="select"][data-id="kit"]');
  await clickReal('[data-action="confirm"]');
  await sleep(1600);
  const out = [`${tag}: water before ${await evaluate(water)}`];
  await clickReal('[data-action="science"][data-id="notebook"]');
  out.push('opened: stage ' + (await evaluate(stageOf)) + ', link ' + (await evaluate(`[...document.querySelectorAll('#science-dialog .links a')].map((a) => a.href).join()`)));
  await evaluate(`document.querySelector('.membrane').scrollIntoView({ block: 'center' }); true`);
  if (!reduce) await shotTo(`notebook-ready-${tag}`);
  await evaluate(`document.querySelector('[data-membrane="start"]').focus(); true`);
  await key('Enter');
  out.push('after Enter: stage ' + (await evaluate(stageOf)));
  await key('Enter'); // repeated input while testing must do nothing
  if (!reduce) {
    await sleep(700);
    await shotTo(`notebook-running-${tag}`);
    await sleep(2200);
  }
  out.push('then: stage ' + (await evaluate(stageOf)) + ', focus on ' + (await evaluate(`document.activeElement?.dataset.membrane ?? document.activeElement?.tagName`)));
  await key('Enter');
  out.push('collect: stage ' + (await evaluate(stageOf)) + ' | ' + (await evaluate(`document.querySelector('.mb-status').textContent + ' | ' + (document.querySelector('.mb-badge')?.textContent ?? '').split(/\s+/).join(' ').trim()`)));
  await evaluate(`document.querySelector('.membrane').scrollIntoView({ block: 'center' }); true`);
  await shotTo(`notebook-collected-${tag}`);
  await pressEscape();
  out.push(`closed: dialog open=${await evaluate(`document.querySelector('#science-dialog').open`)}, focus ${await evaluate(`document.activeElement?.dataset.id`)}, water after ${await evaluate(water)}`);
  console.log(out.join(String.fromCharCode(10)));
}

// Audio: muted at start, on after a real click, one sound per confirmed action, none on re-render.
async function audioRun() {
  const phone = Boolean(process.env.PHONE);
  await send('Emulation.setDeviceMetricsOverride', { width: phone ? 375 : 1366, height: phone ? 812 : 768, deviceScaleFactor: 1, mobile: phone });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await send('Page.navigate', { url: base });
  await sleep(1200);
  const log = () => evaluate(`JSON.stringify(globalThis.__qsSfx)`);
  const label = () => evaluate(`(() => { document.querySelector('#tools-body').innerHTML ||= ''; const b = [...document.querySelectorAll('[data-action="sound"]')][0]; return b ? b.textContent.trim() + ' (aria-pressed=' + b.getAttribute('aria-pressed') + ')' : '(Menu: ' + (globalThis.__qsSfxState ? 'see menu' : '') + ')'; })()`);
  const out = [];
  // Desktop: the Sound button is in the tray header. Phones: it lives in the Menu dialog.
  const toggleSound = async () => {
    if (!phone) return clickReal('[data-action="sound"]');
    await clickReal('[data-action="tools"]');
    await clickReal('#tools-body [data-action="sound"]');
    await clickReal('[data-action="tools-close"]');
  };
  await evaluate(`localStorage.clear(); location.reload(); true`);
  await sleep(1200);
  out.push('new player: ' + (await label()) + ', engine before any gesture: ' + (await evaluate(`globalThis.__qsSfxState()`)));
  await clickReal('[data-action="start"]');
  await sleep(300);
  out.push('first gesture (Start Mission): log ' + (await log()) + ', engine ' + (await evaluate(`globalThis.__qsSfxState()`)));
  await clickReal('[data-action="launch"]');
  await clickReal('[data-action="open"]');
  await clickReal('[data-action="select"][data-id="save_power"]');
  await clickReal('[data-action="confirm"]');
  await clickReal('[data-action="continue"]');
  await clickReal('[data-action="open"]');
  await clickReal('[data-action="select"][data-id="adjust"]');
  await evaluate(`globalThis.__qsSfx.length = 0; true`);
  const box = await evaluate(`(() => { const r = document.querySelector('[data-action="confirm"]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })()`);
  for (let i = 0; i < 3; i += 1) {
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: box[0], y: box[1], button: 'left', clickCount: i + 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: box[0], y: box[1], button: 'left', clickCount: i + 1 });
  }
  await sleep(500);
  out.push('Confirm clicked 3x fast: ' + (await log()) + ', warmth ' + (await evaluate(`document.querySelector('[data-res="warmth"] .ctr-val').textContent.trim()`)));
  await evaluate(`globalThis.__qsSfx.length = 0; true`);
  await clickReal('[data-action="science"][data-id="heat"]');
  await pressEscape();
  out.push('opening/closing Science (re-render, no state change): ' + (await log()));
  await clickReal('[data-action="continue"]');
  await clickReal('[data-action="open"]');
  await clickReal('[data-action="select"][data-id="early"]');
  await clickReal('[data-action="confirm"]');
  await clickReal('[data-action="bag"]');
  await clickReal('[data-action="bag-spot"]');
  await clickReal('[data-action="continue"]');
  await clickReal('[data-action="open"]');
  await clickReal('[data-action="select"][data-id="restart"]');
  await clickReal('[data-action="confirm"]');
  await clickReal('[data-action="continue"]');
  await clickReal('[data-action="open"]');
  await clickReal('[data-action="select"][data-id="standard"]');
  await evaluate(`globalThis.__qsSfx.length = 0; true`);
  await clickReal('[data-action="confirm"]');
  await sleep(2400);
  out.push('standard repair (2 turns): ' + (await log()));
  await clickReal('[data-action="continue"]');
  await clickReal('[data-action="open"]');
  await clickReal('[data-action="select"][data-id="sort"]');
  await clickReal('[data-action="confirm"]');
  await clickReal('[data-action="continue"]');
  await clickReal('[data-action="open"]');
  await clickReal('[data-action="select"][data-id="send_now"]');
  await evaluate(`globalThis.__qsSfx.length = 0; true`);
  await clickReal('[data-action="confirm"]');
  out.push('Send Now: ' + (await log()));
  out.push('audio context: ' + (await evaluate(`typeof AudioContext`)));
  await toggleSound();
  await evaluate(`globalThis.__qsSfx.length = 0; true`);
  await clickReal('[data-action="continue"]');
  out.push('muted again: ' + (await label()) + ', Continue logged ' + (await log()) + ', engine ' + (await evaluate(`globalThis.__qsSfxState()`)));
  out.push('final: ' + (await evaluate(`document.querySelector('.final-line')?.textContent.trim()`)));
  // Refresh respects the saved Off choice; the first gesture then plays nothing.
  await send('Page.reload', {});
  await sleep(1200);
  await evaluate(`globalThis.__qsSfx.length = 0; true`);
  out.push('after refresh: ' + (await label()) + ', saved ' + (await evaluate(`localStorage.getItem('qamar-square:sound-effects')`)));
  await clickReal('[data-action="start"]');
  out.push('Start Mission with saved Off: log ' + (await log()) + ', engine ' + (await evaluate(`globalThis.__qsSfxState()`)));
  await evaluate(`localStorage.clear(); true`);
  console.log(out.join(String.fromCharCode(10)));
}

// Phone Menu: keyboard open, sound toggle inside, Restart from the menu, focus return.
async function menuRun() {
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 664, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: base });
  await sleep(1200);
  const q = (expr) => evaluate(expr);
  const out = [];
  await evaluate(`${HELPERS} await c('[data-action="start"]'); await c('[data-action="launch"]'); true;`);
  out.push('tray header hidden: ' + (await q(`getComputedStyle(document.querySelector('.tray-top')).display`)) + ', Menu visible: ' + (await q(`getComputedStyle(document.querySelector('[data-action="tools"]')).display`)) + ', Science label: "' + (await q(`document.querySelector('.btn-science').innerText.trim()`)) + '" name "' + (await q(`document.querySelector('.btn-science').getAttribute('aria-label')`)) + '"');
  await q(`document.querySelector('[data-action="tools"]').focus(); true`);
  await key('Enter');
  out.push('Enter on Menu -> dialog open ' + (await q(`document.querySelector('#tools-dialog').open`)) + ', focus "' + (await q(`document.activeElement.textContent.trim()`)) + '"');
  await key('Enter');
  out.push('Enter on sound -> "' + (await q(`document.activeElement.textContent.trim()`)) + '" aria-pressed ' + (await q(`document.activeElement.getAttribute('aria-pressed')`)));
  await key('Enter');
  out.push('Enter again -> "' + (await q(`document.activeElement.textContent.trim()`)) + '"');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await sleep(400);
  out.push('Escape -> open ' + (await q(`document.querySelector('#tools-dialog').open`)) + ', focus on ' + (await q(`document.activeElement.dataset.action`)));
  await key('Enter');
  await q(`document.querySelector('#tools-body [data-action="restart-ask"]').focus(); true`);
  await key('Enter');
  out.push('Restart from menu -> tools open ' + (await q(`document.querySelector('#tools-dialog').open`)) + ', restart dialog open ' + (await q(`document.querySelector('#restart-dialog').open`)));
  console.log(out.join(String.fromCharCode(10)));
}
if (process.env.MENU) {
  try {
    await send('Page.enable');
    await send('Runtime.enable');
    await menuRun();
  } finally {
    ws.close();
    chrome.kill();
  }
  process.exit(0);
}

// Shelter target: hotspot vs tray shortcut open the same choices (mouse, touch, keyboard); cue wording per input.
async function toShelter() {
  await evaluate(`${HELPERS}
    await c('[data-action="start"]'); await c('[data-action="launch"]');
    for (const id of ['save_power', 'adjust']) {
      await c('[data-action="open"]'); await c('[data-action="select"][data-id="' + id + '"]');
      await c('[data-action="confirm"]'); await c('[data-action="continue"]');
    }
    true;`);
  await sleep(500);
}
const choices = () => evaluate(`[...document.querySelectorAll('[data-action="select"]')].map((b) => b.dataset.id).join(',')`);
const cueText = () => evaluate(`(() => { const h = document.querySelector('.hot.is-active'); const spans = [...h.querySelectorAll('.hot__cue > span')].filter((s) => getComputedStyle(s).display !== 'none' && getComputedStyle(h.querySelector('.hot__cue')).display !== 'none'); const hint = [...document.querySelectorAll('#tap-hint > span')].filter((s) => getComputedStyle(s).display !== 'none'); return { device: h.dataset.device, bubble: spans.map((s) => s.textContent).join(' ') || '(none)', arrow: getComputedStyle(h.querySelector('.hot__arrow')).display, tray: hint.map((s) => s.textContent).join(' ') }; })()`);

async function shelterRun() {
  const out = [];
  for (const [mode, w, h, touch] of [['mouse', 1366, 768, false], ['touch', 375, 664, true]]) {
    for (const via of ['hotspot', 'shortcut']) {
      await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: touch });
      await send('Emulation.setTouchEmulationEnabled', { enabled: touch, maxTouchPoints: touch ? 5 : 1 });
      await send('Page.navigate', { url: base });
      await sleep(1200);
      await toShelter();
      const cue = await cueText();
      if (via === 'hotspot') {
        if (touch) await tap('.hot[data-device="shelter"]');
        else await clickReal('.hot[data-device="shelter"]');
      } else if (touch) await tap('[data-action="open"]');
      else await clickReal('[data-action="open"]');
      out.push(`${mode} ${w}x${h} via ${via}: cue ${JSON.stringify(cue)} -> choices [${await choices()}]`);
      if (via === 'hotspot') await shotTo(`shelter-${mode}-${w}x${h}-opened`);
    }
  }
  // Keyboard: Shift+Tab to the shelter hotspot, check the cue says Press Enter, then Enter.
  await send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setTouchEmulationEnabled', { enabled: false, maxTouchPoints: 1 });
  await send('Page.navigate', { url: base });
  await sleep(1200);
  await toShelter();
  await evaluate(`document.querySelector('[data-action="open"]').focus(); true`);
  for (let i = 0; i < 10; i += 1) {
    await key('Tab', true);
    const id = await evaluate(`document.activeElement?.dataset?.device ?? ''`);
    if (id === 'shelter') break;
  }
  const focused = await cueText();
  await shotTo('shelter-keyboard-focus-1366x768');
  await key('Enter');
  out.push(`keyboard: focused ${focused.device}, cue ${JSON.stringify(focused.bubble)} -> Enter opened [${await choices()}]`);
  console.log(out.join(String.fromCharCode(10)));
}
if (process.env.SHELTER) {
  try {
    await send('Page.enable');
    await send('Runtime.enable');
    await shelterRun();
  } finally {
    ws.close();
    chrome.kill();
  }
  process.exit(0);
}

// Report screenshots: Shelter (closed, marked) and Water & Waste preview at phone sizes, touch emulated.
async function reportShots() {
  const sizes = (process.env.SHOTS === '1' ? '375x812,360x692' : process.env.SHOTS).split(',');
  for (const size of sizes) {
    const [w, h] = size.split('x').map(Number);
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: true });
    await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await send('Page.navigate', { url: base });
    await sleep(1200);
    await evaluate(`${HELPERS}
      await c('[data-action="start"]'); await c('[data-action="launch"]');
      for (const id of ['save_power', 'adjust']) {
        await c('[data-action="open"]'); await c('[data-action="select"][data-id="' + id + '"]');
        await c('[data-action="confirm"]'); await c('[data-action="continue"]');
      }
      true;`);
    await sleep(600);
    await shotTo(`shelter-${size}`);
    await evaluate(`${HELPERS}
      await c('[data-action="open"]'); await c('[data-action="select"][data-id="early"]'); await c('[data-action="confirm"]');
      await c('[data-action="bag"]'); await c('[data-action="bag-spot"]'); await c('[data-action="continue"]');
      await c('[data-action="open"]'); await c('[data-action="select"][data-id="restart"]'); await c('[data-action="confirm"]'); await c('[data-action="continue"]');
      await w(400);
      true;`);
    await shotTo(`water-waste-open-${size}`);
    await evaluate(`${HELPERS} await c('[data-action="open"]'); await c('[data-action="select"][data-id="standard"]'); true;`);
    await sleep(500);
    const fit = await evaluate(`(() => { const t = document.querySelector('.tray'); return [t.scrollHeight, t.clientHeight, document.documentElement.scrollHeight, innerHeight]; })()`);
    await shotTo(`water-waste-preview-${size}`);
    console.log(size, 'Water & Waste preview tray', fit[0], '/', fit[1], 'page', fit[2], '/', fit[3]);
  }
}
if (process.env.SHOTS) {
  try {
    await send('Page.enable');
    await send('Runtime.enable');
    await reportShots();
  } finally {
    ws.close();
    chrome.kill();
  }
  process.exit(0);
}

if (process.env.NOTEBOOK || process.env.AUDIO) {
  try {
    await send('Page.enable');
    await send('Runtime.enable');
    if (process.env.NOTEBOOK) {
      await notebookRun({ w: 1366, h: 768, reduce: false });
      await notebookRun({ w: 375, h: 812, reduce: false });
      await notebookRun({ w: 375, h: 812, reduce: true });
    }
    if (process.env.AUDIO) await audioRun();
  } finally {
    ws.close();
    chrome.kill();
  }
  process.exit(0);
}

if (process.env.TOUCH) {
  try {
    await send('Page.enable');
    await send('Runtime.enable');
    await touchRun();
  } finally {
    ws.close();
    chrome.kill();
  }
  process.exit(0);
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
