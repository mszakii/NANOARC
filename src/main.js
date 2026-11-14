// Qamar Square shell. Owner: Lane C. See specs/plan.md §5.6.
// One store (state + view), one dispatch(action), one render(). Events are delegated on data-action.
import './styles/tokens.css';
import './styles/scene.css';
import './styles/ui.css';
import * as rules from './game/rules.js';
import { mountScene, updateScene, DEVICE_FOR_STEP } from './ui/scene.js';
import { UI } from './data/content.js';
import { esc, renderHud } from './ui/hud.js';
import { renderPanel } from './ui/panel.js';
import { renderStart, renderLoadout, renderEnd } from './ui/screens.js';
import { openScience } from './ui/science.js';

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
  </dialog>`;

const game = app.querySelector('.game');
const tray = app.querySelector('#tray');
const live = app.querySelector('#live');
const restartDialog = app.querySelector('#restart-dialog');

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

// ---------- Store ----------
function dispatch(action) {
  let focus = null; // CSS selector inside the tray, or null for the primary action
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
        else focus = `[data-action="select"][data-id="${opt.id}"]`;
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

      case 'restart-ask':
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

      default:
        return;
    }
  } catch (error) {
    console.error('[Qamar Square]', error);
    view.error = true;
  }
  render(focus);
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
      <p class="brand"><span aria-hidden="true">🌙</span> ${esc(state.mode === 'practice' ? UI.training : UI.title)}</p>
      <button type="button" class="btn btn-quiet btn-small" data-action="${state.mode === 'practice' ? 'back-start' : 'restart-ask'}"><span aria-hidden="true">↺</span> ${esc(state.mode === 'practice' ? UI.backToStart : UI.restart)}</button>
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
    updateScene(state, view);
  } catch (error) {
    console.error('[Qamar Square] scene', error);
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
