// Qamar Square decision tray for the play screen. Owner: Lane C. Pure string builders.
// The same loop for every decision: open the device, pick, preview, Confirm Choice, result, Continue.
// Layout: head (crisis + Science) / main (crew line + choices or task) / foot (preview slot + primary action).
// The foot always sits at the bottom of the tray so the primary action never jumps.
import { CREW, UI, RES, STEPS, RECOVERY, reasonText, resultText, noteTexts } from '../data/content.js';
import { esc } from './hud.js';
import { icon } from './icons.js';
import { levelOf, LEVELS, endsLevel } from '../game/rules.js';

/** Label of the Continue button for the result being rendered ("Next Level" at a level boundary). */
let continueLabel = UI.continue;

const signed = (n) => (n > 0 ? `+${n}` : `−${Math.abs(n)}`);

function talk(step, mood, text, live) {
  const who = CREW[step.who];
  return `
    <div class="talk" data-mood="${esc(mood)}">
      <span class="portrait" data-who="${esc(step.who)}">
        <img src="./assets/crew/${esc(step.who)}-${esc(mood)}.webp" alt="" width="56" height="56" decoding="async" />
      </span>
      <p class="bubble"${live ? ' data-live' : ''}><strong class="who">${esc(who.name)}</strong> ${esc(text)}</p>
    </div>`;
}

function chips(opt) {
  const out = Object.entries(opt.delta ?? {})
    .filter(([key, n]) => RES[key] && n)
    .map(([key, n]) => `<span class="chip" data-res="${esc(key)}">${icon(RES[key].icon)} ${esc(RES[key].label)} ${esc(signed(n))}</span>`);
  if (opt.turns) out.push(`<span class="chip">${icon('turn')} ${esc(UI.turnChip(opt.turns))}</span>`);
  if (!out.length) out.push(`<span class="chip">${esc(UI.freeChip)}</span>`);
  return `<span class="chips">${out.join('')}</span>`;
}

function optionButton(state, step, opt, view, primary) {
  const copy = step.options[opt.id] ?? { label: opt.id, icon: 'info' };
  const picked = view.selected === opt.id;
  const why = opt.available ? '' : reasonText(state.step, opt.id, opt.reason);
  return `
    <button type="button" class="opt" data-action="select" data-id="${esc(opt.id)}"
      aria-pressed="${picked}"${opt.available ? '' : ' aria-disabled="true"'}${primary ? ' data-primary' : ''}>
      <span class="opt-ico">${icon(copy.icon)}</span>
      <span class="opt-body">
        <span class="opt-label">${esc(copy.label)}</span>
        ${why ? `<span class="opt-why">${icon('lock')} ${esc(why)}</span>` : chips(opt)}
      </span>
      <span class="opt-mark">${picked ? `${icon('check')}<span>${esc(UI.picked)}</span>` : opt.available ? '' : `<span>${esc(UI.locked)}</span>`}</span>
    </button>`;
}

/** Preview built only from the option the rules returned: current value -> opt.after value. */
function preview(state, step, opt) {
  const rows = Object.keys(opt.delta ?? {})
    .filter((key) => RES[key] && opt.after && opt.after[key] !== state.res[key])
    .map((key) => `<li>${icon(RES[key].icon)} ${esc(RES[key].label)} <b>${esc(state.res[key])} <span aria-hidden="true">→</span><span class="sr-only"> to </span> ${esc(opt.after[key])}</b></li>`);
  if (opt.turns) rows.push(`<li>${icon('turn')} ${esc(UI.turnChip(opt.turns))}</li>`);
  if (!rows.length) rows.push(`<li>${esc(UI.previewFree)}</li>`);
  const hint = step.options[opt.id]?.hint;
  return `
    <div class="slot preview" data-live>
      <p class="preview-title">${esc(UI.previewTitle)}</p>
      <ul class="preview-list">${rows.join('')}</ul>
      ${hint ? `<p class="preview-hint">${esc(hint)}</p>` : ''}
    </div>`;
}

/** The foot: an optional status slot above one primary button. */
function foot(slot, button) {
  return `<div class="panel-foot">${slot}${button}</div>`;
}

function hintSlot(id, text) {
  return `<p class="slot slot-hint" id="${id}">${esc(text)}</p>`;
}

function choosePhase(state, step, view, opts) {
  if (!view.open) {
    return {
      main: talk(step, step.mood, step.say(state), true),
      foot: foot(
        `<p class="slot slot-hint" id="tap-hint"><span class="cue-touch">${esc(UI.tapThe(step.target))}</span><span class="cue-mouse">${esc(UI.clickThe(step.target))}</span></p>`,
        `<button type="button" class="btn btn-primary btn-big" data-action="open" data-primary>${icon('tap')} ${esc(step.open)}</button>`,
      ),
    };
  }
  const selected = opts.find((o) => o.id === view.selected && o.available) ?? null;
  const firstFree = opts.find((o) => o.available) ?? opts[0];
  return {
    main: `
      ${talk(step, step.mood, step.say(state), false)}
      <div class="opts" role="group" aria-label="${esc(UI.choicesLabel)}">
        ${opts.map((o) => optionButton(state, step, o, view, !selected && o === firstFree)).join('')}
      </div>`,
    foot: foot(
      selected ? preview(state, step, selected) : hintSlot('pick-first', UI.pickFirst),
      `<button type="button" class="btn btn-primary btn-big" data-action="confirm"
        ${selected ? 'data-primary' : 'aria-disabled="true" aria-describedby="pick-first"'}>${icon('check')} ${esc(UI.confirm)}</button>`,
    ),
  };
}

/** `holdFocus` keeps keyboard focus on the waiting button when nothing else is the primary action. */
function continueFoot(ready, waitText, holdFocus = false) {
  return foot(
    ready ? '' : hintSlot('wait-why', waitText),
    `<button type="button" class="btn btn-primary btn-big" data-action="continue"${ready || holdFocus ? ' data-primary' : ''}
      ${ready ? '' : 'aria-disabled="true" aria-describedby="wait-why"'}>${esc(continueLabel)} ${icon('arrow')}</button>`,
  );
}

function resultBody(state, live) {
  const notes = noteTexts(state.last, state.res);
  return `
    <div class="result"${live ? ' data-live' : ''}>
      <p>${icon('check')} <span>${esc(resultText(state.last, state.res))}</span></p>
      ${notes.map((n) => `<p class="note">${icon('star')} <span>${esc(n)}</span></p>`).join('')}
    </div>`;
}

function resultPhase(state, step, view) {
  const last = state.last;
  // (a) Shelter: tap the supply bag, then the marked spot, before Continue.
  if (state.step === 'shelter') {
    const stage = view.bagStage;
    if (stage < 2) {
      const lead = UI.bagLead[last.option] ?? UI.bagTitle;
      // The bag action takes the main button's place; Continue appears there once the bag is placed.
      return {
        main: `
          ${talk(step, 'determined', lead, false)}
          <div class="task" data-live>
            <p class="task-title">${icon('bag')} ${esc(UI.bagTitle)}</p>
            <ol class="task-steps">
              <li class="${stage === 0 ? 'is-now' : 'is-done'}">${icon(stage === 0 ? 'tap' : 'check')} ${esc(UI.bagStep0)}</li>
              <li class="${stage === 1 ? 'is-now' : ''}">${icon(stage === 1 ? 'tap' : 'pin')} ${esc(UI.bagStep1)}</li>
            </ol>
          </div>`,
        foot: foot(
          hintSlot('bag-why', UI.bagWait),
          `<button type="button" class="btn btn-big btn-primary" data-action="${stage === 0 ? 'bag' : 'bag-spot'}" data-primary>
            ${icon(stage === 0 ? 'bag' : 'pin')} ${esc(stage === 0 ? UI.bagPick : UI.bagPlace)}</button>`,
        ),
      };
    }
    return { main: `${talk(step, 'happy', UI.bagStep2, false)}${resultBody(state, true)}`, foot: continueFoot(true) };
  }
  // (b) Repair: one turn at a time while view.seq is a number.
  if (last.sequence?.length && view.seq !== null) {
    const total = last.sequence.length;
    const snap = last.sequence[view.seq] ?? state.res;
    return {
      main: `
        ${talk(step, 'determined', UI.turnTalk, false)}
        <div class="task turn" data-live>
          <p class="task-title">${icon('turn')} ${esc(UI.turnOf(view.seq + 1, total))}</p>
          <p class="turn-count">${icon(RES.water.icon)} ${esc(UI.turnBottles(snap.water))}</p>
        </div>`,
      foot: continueFoot(false, UI.turnWait, true),
    };
  }
  if (state.mode === 'practice') {
    return {
      main: `${talk(step, 'happy', UI.resultTalk, false)}${resultBody(state, true)}`,
      foot: foot(
        hintSlot('train-done', UI.trainDone),
        `<button type="button" class="btn btn-primary btn-big" data-action="training" data-primary>${icon('restart')} ${esc(UI.trainBoth)}</button>`,
      ),
    };
  }
  return { main: `${talk(step, 'happy', UI.resultTalk, false)}${resultBody(state, true)}`, foot: continueFoot(true) };
}

function recoveryPhase(state, step) {
  const text = RECOVERY[state.step] ?? RECOVERY.fallback;
  return {
    main: `
      ${talk(step, 'worried', UI.recoveryTalk, false)}
      <div class="recovery" data-live><p>${icon('alert')} <span>${esc(text)}</span></p></div>`,
    foot: foot('', `<button type="button" class="btn btn-primary btn-big" data-action="retry" data-primary>${icon('restart')} ${esc(UI.retry)}</button>`),
  };
}

/**
 * @param {object} state  rules state (step is not 'done')
 * @param {object} view
 * @param {Array} opts    rules options(state)
 */
export function renderPanel(state, view, opts) {
  if (!STEPS[state.step]) return '';
  // The player's chosen astronaut speaks and acts in every level.
  const step = { ...STEPS[state.step], who: state.avatar ?? STEPS[state.step].who };
  continueLabel = endsLevel(state) ? UI.nextLevel : UI.continue;
  const eyebrow = state.mode === 'practice' ? UI.training : UI.levelOf(levelOf(state.step), LEVELS);
  let body;
  if (state.phase === 'recovery') body = recoveryPhase(state, step);
  else if (state.phase === 'result' && state.last) body = resultPhase(state, step, view);
  else body = choosePhase(state, step, view, opts);
  // Water extras sit beside the situation and the result, not between the choices and Confirm.
  const choosing = state.phase === 'choose' && view.open;
  const extras = state.step === 'repair' && !choosing
    ? `<div class="extras">
        <button type="button" class="btn btn-quiet btn-small" data-action="science" data-id="iss">${icon('drop')} ${esc(UI.compareIss)}</button>
        <button type="button" class="btn btn-quiet btn-small" data-action="science" data-id="notebook">${icon('notebook')} ${esc(UI.notebook)}</button>
      </div>`
    : '';
  return `
    <section class="card panel" aria-labelledby="crisis-name" data-step="${esc(state.step)}" data-phase="${esc(state.phase)}">
      <header class="panel-head">
        <div class="panel-name">
          <p class="eyebrow">${esc(eyebrow)}</p>
          <h2 id="crisis-name" class="card-title">${esc(step.crisis)}</h2>
        </div>
        <div class="panel-tools">
          <button type="button" class="btn btn-quiet btn-small btn-science" data-action="science" data-id="${esc(step.science)}" aria-label="${esc(UI.science)}">${icon('science')} <span class="lbl-wide">${esc(UI.science)}</span><span class="lbl-narrow">${esc(UI.scienceShort)}</span></button>
          <button type="button" class="btn btn-quiet btn-small btn-menu" data-action="tools" aria-haspopup="dialog">${icon('menu')} <span>${esc(UI.menu)}</span></button>
        </div>
      </header>
      <div class="panel-main">${body.main}${extras}</div>
      ${body.foot}
    </section>`;
}
