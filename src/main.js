// Qamar Square shell. Owner: Lane C. See specs/plan.md §5.6.
// One store (state + view), one dispatch(action), one render(). Events are delegated on data-action.
import './styles/tokens.css';
import './styles/scene.css';
import './styles/ui.css';
import './styles/fit.css';
import * as rules from './game/rules.js';
import { mountScene, updateScene, DEVICE_FOR_STEP } from './ui/scene.js';
import { UI, STEPS } from './data/content.js';
import { esc, renderHud } from './ui/hud.js';
import { renderPanel } from './ui/panel.js';
import { renderStart, renderLoadout, renderEnd } from './ui/screens.js';
import { openScience } from './ui/science.js';
import { icon } from './ui/icons.js';
import { play, setSound, soundOn, soundAvailable } from './ui/sound.js';

const TURN_MS = 900;
const STEP_ORDER = ['greenhouse', 'valve', 'shelter', 'oxygen', 'repair', 'plastic', 'signal', 'antenna', 'done'];

/** Rules state. null before launch. */
let state = null;
/** View state. The scene reads screen, open, selected, bagStage and seq. */
const view = { screen: 'start', open: false, selected: null, bagStage: 0, seq: null, picks: [], error: false };
let seqTimer = null;

// ---------- Shell DOM (built once) ----------
const app = document.querySelector('#app');
app.innerHTML = `
  <main class="game" data-screen="start">
    <section class="stage" aria-label="${esc(UI.stageLabel)}"><div class="stage-scene" id="scene"></div></section>
    <section class="tray" aria-label="${esc(UI.trayLabel)}"><div class="tray-body" id="tray"></div></section>
  </main>
  <p class="sr-only" id="live" aria-live="polite"></p>
  <dialog class="dlg" id="restart-dialog" aria-labelledby="restart-title">
    <h2 class="dlg-title" id="restart-title">${esc(UI.restartTitle)}</h2>
    <p>${esc(UI.restartBody)}</p>
    <div class="dlg-actions">
      <button type="button" class="btn btn-quiet" data-action="restart-no" autofocus>${esc(UI.restartNo)}</button>
      <button type="button" class="btn btn-primary" data-action="restart-yes">${esc(UI.restartYes)}</button>
    </div>
  </dialog>
  <dialog class="dlg dlg-tools" id="tools-dialog" aria-labelledby="tools-title" closedby="any">
    <h2 class="dlg-title" id="tools-title">${esc(UI.menuTitle)}</h2>
    <div class="tools-body" id="tools-body"></div>
    <div class="dlg-actions">
      <button type="button" class="btn btn-primary" data-action="tools-close">${esc(UI.menuClose)}</button>
    </div>
  </dialog>`;

const game = app.querySelector('.game');
const tray = app.querySelector('#tray');
const live = app.querySelector('#live');
const restartDialog = app.querySelector('#restart-dialog');
const toolsDialog = app.querySelector('#tools-dialog');
const toolsBody = app.querySelector('#tools-body');

/** Secondary tools for phones: sound and restart (or back to start in training). */
function toolsHtml() {
  const practice = state?.mode === 'practice';
  return `
    ${soundButton()}
    <button type="button" class="btn btn-quiet" data-action="${practice ? 'back-start' : 'restart-ask'}">${icon('restart')} ${esc(practice ? UI.backToStart : UI.restart)}</button>`;
}

mountScene(app.querySelector('#scene'), { onDevice });

// ---------- Helpers ----------
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function stopSequence() {
  if (seqTimer !== null) {
    clearTimeout(seqTimer);
    seqTimer = null;
  }
  view.seq = null;
}

/** Show the repair turns one at a time: view.seq = 0, 1, ... then null. */
function startSequence() {
  stopSequence();
  const total = state?.last?.sequence?.length ?? 0;
  if (!total || reducedMotion()) return;
  view.seq = 0;
  const tick = () => {
    seqTimer = null;
    if (view.seq === null) return;
    if (view.seq + 1 < total) {
      view.seq += 1;
      seqTimer = setTimeout(tick, TURN_MS);
      play('drop'); // one droplet per repair turn, in step with the bottle count
    } else {
      view.seq = null;
    }
    render();
  };
  seqTimer = setTimeout(tick, TURN_MS);
}

function resetView(screen) {
  stopSequence();
  view.screen = screen;
  view.open = false;
  view.selected = null;
  view.bagStage = 0;
  view.error = false;
  view.training = false;
}

function currentOptions() {
  if (!state || state.step === 'done') return [];
  return rules.options(state);
}

function canContinue() {
  if (state?.mode === 'practice') return false;
  if (!state || state.phase !== 'result') return false;
  if (state.step === 'shelter' && view.bagStage < 2) return false;
  return view.seq === null;
}

/** The scene reports taps on the active device, the bag and the marked spot. */
function onDevice(id) {
  if (id === 'bag' || id === 'bag-spot') dispatch({ type: id });
  else if (state && id === DEVICE_FOR_STEP[state.step]) dispatch({ type: 'open' });
}

// The main tray button keeps one place across phases (Open, Confirm, Continue, Retry), so a fast
// double click would land on the next phase's button. Ignore a second one within this window.
const FOOT_ACTIONS = new Set(['open', 'confirm', 'continue', 'retry', 'bag', 'bag-spot']);
const FOOT_GUARD_MS = 300;
let lastFootAt = -Infinity;

// ---------- Store ----------
function dispatch(action) {
  if (FOOT_ACTIONS.has(action.type)) {
    const now = performance.now();
    if (now - lastFootAt < FOOT_GUARD_MS) return;
    lastFootAt = now;
  }
  let focus = null; // CSS selector inside the tray, or null for the primary action
  // Every branch that reaches render() changed something, so it earns one sound; no-ops return early.
  let sfx = 'click';
  try {
    switch (action.type) {
      case 'training':
        if (state && state.mode !== 'practice') return;
        state = null;
        resetView('start');
        view.training = true;
        break;

      case 'practice':
        if (view.screen !== 'start' || !view.training || !['kit', 'standard'].includes(action.id)) return;
        state = rules.newPractice(action.id === 'kit');
        resetView('play');
        break;

      case 'back-start':
        if (toolsDialog.open) toolsDialog.close();
        if (state && state.mode !== 'practice') return;
        state = null;
        resetView('start');
        break;

      case 'start':
        resetView('loadout');
        break;

      case 'toggle-item': {
        if (view.screen !== 'loadout' || !rules.ITEMS[action.id]) return;
        view.picks = view.picks.includes(action.id)
          ? view.picks.filter((id) => id !== action.id)
          : [...view.picks, action.id];
        focus = `[data-action="toggle-item"][data-id="${action.id}"]`;
        break;
      }

      case 'launch': {
        if (view.screen !== 'loadout' || !rules.canLaunch(view.picks).ok) return;
        state = rules.newRun([...view.picks]);
        resetView('play');
        break;
      }

      case 'open':
        if (!state || view.screen !== 'play' || state.phase !== 'choose' || view.open) return;
        view.open = true;
        break;

      case 'select': {
        if (!state || state.phase !== 'choose' || !view.open) return;
        const opt = currentOptions().find((o) => o.id === action.id);
        if (!opt) return;
        // Unavailable options stay focusable and explain themselves, but cannot be picked.
        if (opt.available) view.selected = opt.id;
        else {
          focus = `[data-action="select"][data-id="${opt.id}"]`;
          sfx = null;
        }
        break;
      }

      case 'confirm': {
        // Confirm applies once. Further presses are ignored while not in phase 'choose'.
        if (!state || state.phase !== 'choose' || !view.selected) return;
        const next = rules.confirm(state, view.selected);
        if (next === state) return;
        state = next;
        view.selected = null;
        view.bagStage = 0;
        if (state.phase === 'result') startSequence();
        sfx = soundForResult(state);
        break;
      }

      case 'bag':
        if (state?.step !== 'shelter' || state.phase !== 'result' || view.bagStage !== 0) return;
        view.bagStage = 1;
        break;

      case 'bag-spot':
        if (state?.step !== 'shelter' || state.phase !== 'result' || view.bagStage !== 1) return;
        view.bagStage = 2;
        break;

      case 'continue': {
        if (!canContinue()) return;
        const from = state.step;
        const next = rules.advance(state);
        if (next === state) return;
        state = next;
        stopSequence();
        view.selected = null;
        view.bagStage = 0;
        // Stay at the device when the next step uses the same one (signal -> antenna -> antenna).
        view.open = state.step !== 'done' && DEVICE_FOR_STEP[state.step] === DEVICE_FOR_STEP[from];
        if (state.step === 'done') view.screen = 'end';
        break;
      }

      case 'retry': {
        if (!state || state.phase !== 'recovery') return;
        stopSequence();
        state = rules.retry(state);
        view.open = false;
        view.selected = null;
        view.bagStage = 0;
        break;
      }

      case 'tools':
        toolsBody.innerHTML = toolsHtml();
        if (!toolsDialog.open) toolsDialog.showModal();
        toolsBody.querySelector('[data-action="sound"]')?.focus();
        return;

      case 'tools-close':
        toolsDialog.close();
        return;

      case 'restart-ask':
        if (toolsDialog.open) toolsDialog.close();
        if (!restartDialog.open) restartDialog.showModal();
        return;

      case 'restart-no':
        restartDialog.close();
        return;

      case 'restart-yes':
        restartDialog.close();
        state = null;
        view.picks = [];
        resetView('loadout');
        break;

      case 'play-again':
        state = null;
        view.picks = [];
        resetView('loadout');
        break;

      case 'science':
        openScience(action.id);
        return;

      case 'sound':
        // Turning sound on happens inside this click, so the browser allows audio to start.
        setSound(!soundOn());
        sfx = soundOn() ? 'click' : null;
        focus = '[data-action="sound"]';
        break;

      default:
        return;
    }
  } catch (error) {
    console.error('[Qamar Square]', error);
    view.error = true;
    sfx = null;
  }
  render(focus);
  if (sfx) play(sfx);
}

/** The sound that matches a confirmed result: valve ratchet, water drops, antenna relay, else a click. */
function soundForResult(s) {
  const last = s.last;
  if (!last) return 'click';
  if (last.step === 'valve' && last.option === 'adjust') return 'valve';
  if (last.step === 'repair') return 'drop';
  if (s.flags.sent) return 'relay';
  return 'click';
}

function soundButton() {
  const on = soundOn();
  const label = soundAvailable() || !on ? (on ? UI.soundOn : UI.soundOff) : UI.soundNone;
  return `<button type="button" class="btn btn-quiet btn-small btn-sound" data-action="sound" aria-pressed="${on}">${icon(on ? 'sound' : 'mute')} ${esc(label)}</button>`;
}

// ---------- Render ----------
function playHtml() {
  const opts = state.phase === 'choose' ? currentOptions() : [];
  const picked = opts.find((o) => o.id === view.selected && o.available) ?? null;
  const snapshot = view.seq !== null ? state.last?.sequence?.[view.seq] : null;
  // The generator runs until the oxygen crisis begins. After that the flag decides.
  const beforeOxygen = STEP_ORDER.indexOf(state.step) < STEP_ORDER.indexOf('oxygen');
  const keys = [...new Set(opts.flatMap((o) => Object.keys(o.delta ?? {})))];
  if (state.step === 'oxygen') keys.push('generator', 'oxygen');
  return `
    <header class="tray-top">
      <p class="brand">${icon('moon')} ${esc(state.mode === 'practice' ? UI.training : UI.title)}</p>
      <div class="tray-tools">
        ${soundButton()}
        <button type="button" class="btn btn-quiet btn-small" data-action="${state.mode === 'practice' ? 'back-start' : 'restart-ask'}">${icon('restart')} ${esc(state.mode === 'practice' ? UI.backToStart : UI.restart)}</button>
      </div>
    </header>
    ${renderHud({
      res: snapshot ?? state.res,
      projected: picked?.after ?? null,
      generatorOn: state.mode === 'practice' || beforeOxygen || Boolean(state.flags.generator),
      keys,
    })}
    ${renderPanel(state, view, opts)}`;
}

function trayHtml() {
  if (view.screen === 'play') return playHtml();
  return `${screenHtml()}
    <header class="tray-top tray-top--plain">
      <p class="brand">${icon('moon')} ${esc(UI.title)}</p>
      <div class="tray-tools">${soundButton()}</div>
    </header>`;
}

function screenHtml() {
  switch (view.screen) {
    case 'loadout':
      return renderLoadout(view, { items: rules.ITEMS, budget: rules.BUDGET, check: rules.canLaunch(view.picks) });
    case 'play':
      return playHtml();
    case 'end':
      return `
        ${renderEnd(state)}
        <h2 class="tray-sub">${esc(UI.endSupplies)}</h2>
        ${renderHud({ res: state.res, generatorOn: Boolean(state.flags.generator) })}`;
    default:
      return renderStart(view);
  }
}

function render(focus = null) {
  game.dataset.screen = view.screen;
  game.dataset.step = state?.step ?? '';
  game.dataset.phase = state?.phase ?? '';

  let html;
  try {
    html = trayHtml();
  } catch (error) {
    console.error('[Qamar Square]', error);
    state = null;
    resetView('start');
    view.error = true;
    game.dataset.screen = 'start';
    html = renderStart(view);
  }
  tray.innerHTML = html;

  try {
    // The crew member who speaks in the tray is the one who walks to the device.
    view.speaker = STEPS[state?.step]?.who ?? 'girl';
    updateScene(state, view);
  } catch (error) {
    console.error('[Qamar Square] scene', error);
  }

  // The phone menu shows the same sound state as the tray.
  if (toolsDialog.open) {
    const refocus = toolsBody.contains(document.activeElement) ? document.activeElement.dataset.action : null;
    toolsBody.innerHTML = toolsHtml();
    if (refocus) toolsBody.querySelector(`[data-action="${refocus}"]`)?.focus();
  }

  live.textContent = tray.querySelector('[data-live]')?.textContent.replace(/\s+/g, ' ').trim() ?? '';

  // Keyboard flow: move focus to the primary action of the new tray content.
  if (!document.querySelector('dialog[open]')) {
    const target = (focus && tray.querySelector(focus)) || tray.querySelector('[data-primary]');
    target?.focus();
  }
}

// ---------- Events ----------
// The tray can re-render while the restart dialog is open, so restore focus by hand if it was lost.
toolsDialog.addEventListener('close', () => {
  if (document.querySelector('dialog[open]')) return;
  (tray.querySelector('[data-action="tools"]') ?? tray.querySelector('[data-primary]'))?.focus();
});

restartDialog.addEventListener('close', () => {
  if (document.activeElement && document.activeElement !== document.body) return;
  (tray.querySelector('[data-action="restart-ask"]') ?? tray.querySelector('[data-primary]'))?.focus();
});

app.addEventListener('click', (event) => {
  const el = event.target instanceof Element ? event.target.closest('[data-action]') : null;
  if (!el || !app.contains(el)) return;
  if (el.getAttribute('aria-disabled') === 'true' && el.dataset.action !== 'select') return;
  dispatch({ type: el.dataset.action, id: el.dataset.id });
});

render();
