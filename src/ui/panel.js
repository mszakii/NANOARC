// Qamar Square decision tray for the play screen. Owner: Lane C. Pure string builders.
// The same loop for every decision: open the device, pick, preview, Confirm Choice, result, Continue.
import { CREW, UI, RES, STEPS, RECOVERY, reasonText, resultText, noteTexts } from '../data/content.js';
import { esc } from './hud.js';

const signed = (n) => (n > 0 ? `+${n}` : `−${Math.abs(n)}`);

function talk(step, mood, text, live) {
  const who = CREW[step.who];
  return `
    <div class="talk">
      <span class="portrait" data-who="${esc(step.who)}">
        <img src="./assets/crew/${esc(step.who)}-${esc(mood)}.webp" alt="" width="64" height="64" decoding="async" />
      </span>
      <div class="bubble">
        <strong class="who">${esc(who.name)}</strong>
        <p${live ? ' data-live' : ''}>${esc(text)}</p>
      </div>
    </div>`;
}

function chips(opt) {
  const out = Object.entries(opt.delta ?? {})
    .filter(([key, n]) => RES[key] && n)
    .map(([key, n]) => `<span class="chip"><span aria-hidden="true">${RES[key].icon}</span> ${esc(RES[key].label)} ${esc(signed(n))}</span>`);
  if (opt.turns) out.push(`<span class="chip"><span aria-hidden="true">⏳</span> ${esc(UI.turnChip(opt.turns))}</span>`);
  if (!out.length) out.push(`<span class="chip">${esc(UI.freeChip)}</span>`);
  return `<span class="chips">${out.join('')}</span>`;
}

function optionButton(state, step, opt, view, primary) {
  const copy = step.options[opt.id] ?? { label: opt.id, icon: '❔' };
  const picked = view.selected === opt.id;
  const why = opt.available ? '' : reasonText(state.step, opt.id, opt.reason);
  return `
    <button type="button" class="opt" data-action="select" data-id="${esc(opt.id)}"
      aria-pressed="${picked}"${opt.available ? '' : ' aria-disabled="true"'}${primary ? ' data-primary' : ''}>
      <span class="opt-ico" aria-hidden="true">${copy.icon}</span>
      <span class="opt-body">
        <span class="opt-label">${esc(copy.label)}</span>
        ${chips(opt)}
        ${why ? `<span class="opt-why"><span aria-hidden="true">🔒</span> ${esc(why)}</span>` : ''}
      </span>
      <span class="opt-mark">${picked ? `<span aria-hidden="true">✓</span> ${esc(UI.picked)}` : opt.available ? '' : esc(UI.locked)}</span>
    </button>`;
}

/** Preview built only from the option the rules returned: current value -> opt.after value. */
function preview(state, step, opt) {
  const rows = Object.keys(opt.delta ?? {})
    .filter((key) => RES[key] && opt.after && opt.after[key] !== state.res[key])
    .map((key) => `<li><span aria-hidden="true">${RES[key].icon}</span> ${esc(RES[key].label)} <b>${esc(state.res[key])} <span aria-hidden="true">→</span><span class="sr-only"> to </span> ${esc(opt.after[key])}</b></li>`);
  if (opt.turns) rows.push(`<li><span aria-hidden="true">⏳</span> ${esc(UI.turnChip(opt.turns))}</li>`);
  if (!rows.length) rows.push(`<li>${esc(UI.previewFree)}</li>`);
  const hint = step.options[opt.id]?.hint;
  return `
    <div class="preview" data-live>
      <p class="preview-title">${esc(UI.previewTitle)}</p>
      <ul class="preview-list">${rows.join('')}</ul>
      ${hint ? `<p class="preview-hint">${esc(hint)}</p>` : ''}
    </div>`;
}

function choosePhase(state, step, view, opts) {
  if (!view.open) {
    return `
      ${talk(step, step.mood, step.say(state), true)}
      <button type="button" class="btn btn-primary btn-big" data-action="open" data-primary><span aria-hidden="true">👆</span> ${esc(step.open)}</button>
      <p class="hint">${esc(UI.tapHint)}</p>`;
  }
  const selected = opts.find((o) => o.id === view.selected && o.available) ?? null;
  const firstFree = opts.find((o) => o.available) ?? opts[0];
  return `
    ${talk(step, step.mood, step.say(state), false)}
    <div class="opts" role="group" aria-label="${esc(UI.choicesLabel)}">
      ${opts.map((o) => optionButton(state, step, o, view, !selected && o === firstFree)).join('')}
    </div>
    ${selected ? preview(state, step, selected) : `<p class="hint" id="pick-first">${esc(UI.pickFirst)}</p>`}
    <button type="button" class="btn btn-primary btn-big" data-action="confirm"
      ${selected ? 'data-primary' : 'aria-disabled="true" aria-describedby="pick-first"'}>${esc(UI.confirm)}</button>`;
}

/** `holdFocus` keeps keyboard focus on the waiting button when nothing else is the primary action. */
function continueButton(ready, waitText, holdFocus = false) {
  return `
    ${ready ? '' : `<p class="hint" id="wait-why">${esc(waitText)}</p>`}
    <button type="button" class="btn btn-primary btn-big" data-action="continue"${ready || holdFocus ? ' data-primary' : ''}
      ${ready ? '' : 'aria-disabled="true" aria-describedby="wait-why"'}>${esc(UI.continue)} <span aria-hidden="true">→</span></button>`;
}

function resultBody(state, live) {
  const notes = noteTexts(state.last, state.res);
  return `
    <div class="result"${live ? ' data-live' : ''}>
      <p><span aria-hidden="true">✅</span> ${esc(resultText(state.last, state.res))}</p>
      ${notes.map((n) => `<p class="note"><span aria-hidden="true">⭐</span> ${esc(n)}</p>`).join('')}
    </div>`;
}

function resultPhase(state, step, view) {
  const last = state.last;
  // (a) Shelter: tap the supply bag, then the marked spot, before Continue.
  if (state.step === 'shelter') {
    const stage = view.bagStage;
    if (stage < 2) {
      const lead = UI.bagLead[last.option] ?? UI.bagTitle;
      return `
        ${talk(step, 'determined', lead, false)}
        <div class="task" data-live>
          <p class="task-title"><span aria-hidden="true">🎒</span> ${esc(UI.bagTitle)}</p>
          <ol class="task-steps">
            <li class="${stage === 0 ? 'is-now' : 'is-done'}"><span aria-hidden="true">${stage === 0 ? '👉' : '✓'}</span> ${esc(UI.bagStep0)}</li>
            <li class="${stage === 1 ? 'is-now' : ''}"><span aria-hidden="true">${stage === 1 ? '👉' : '○'}</span> ${esc(UI.bagStep1)}</li>
          </ol>
        </div>
        <button type="button" class="btn btn-big btn-toy" data-action="${stage === 0 ? 'bag' : 'bag-spot'}" data-primary>
          <span aria-hidden="true">${stage === 0 ? '🎒' : '📍'}</span> ${esc(stage === 0 ? UI.bagPick : UI.bagPlace)}</button>
        ${continueButton(false, UI.bagWait)}`;
    }
    return `
      ${talk(step, 'happy', UI.bagStep2, false)}
      ${resultBody(state, true)}
      ${continueButton(true)}`;
  }
  // (b) Repair: one turn at a time while view.seq is a number.
  if (last.sequence?.length && view.seq !== null) {
    const total = last.sequence.length;
    const snap = last.sequence[view.seq] ?? state.res;
    return `
      ${talk(step, 'determined', UI.turnTalk, false)}
      <div class="task turn" data-live>
        <p class="task-title"><span aria-hidden="true">⏳</span> ${esc(UI.turnOf(view.seq + 1, total))}</p>
        <p class="turn-count"><span aria-hidden="true">${RES.water.icon}</span> ${esc(UI.turnBottles(snap.water))}</p>
      </div>
      ${continueButton(false, UI.turnWait, true)}`;
  }
  return `
    ${talk(step, 'happy', UI.resultTalk, false)}
    ${resultBody(state, true)}
    ${state.mode === 'practice' ? `
      <p>${esc(UI.trainDone)}</p>
      <button type="button" class="btn btn-primary btn-big" data-action="training" data-primary>${esc(UI.trainBoth)}</button>` : continueButton(true)}`;
}

function recoveryPhase(state, step) {
  const text = RECOVERY[state.step] ?? RECOVERY.fallback;
  return `
    ${talk(step, 'worried', UI.recoveryTalk, false)}
    <div class="recovery" data-live>
      <p><span aria-hidden="true">⚠️</span> ${esc(text)}</p>
    </div>
    <button type="button" class="btn btn-primary btn-big" data-action="retry" data-primary><span aria-hidden="true">↺</span> ${esc(UI.retry)}</button>`;
}

/**
 * @param {object} state  rules state (step is not 'done')
 * @param {object} view
 * @param {Array} opts    rules options(state)
 */
export function renderPanel(state, view, opts) {
  const step = STEPS[state.step];
  if (!step) return '';
  let body;
  if (state.phase === 'recovery') body = recoveryPhase(state, step);
  else if (state.phase === 'result' && state.last) body = resultPhase(state, step, view);
  else body = choosePhase(state, step, view, opts);
  return `
    <section class="card panel" aria-labelledby="crisis-name" data-step="${esc(state.step)}" data-phase="${esc(state.phase)}">
      <header class="panel-head">
        <p class="eyebrow">${esc(step.eyebrow)}</p>
        <h2 id="crisis-name" class="card-title">${esc(step.crisis)}</h2>
      </header>
      ${body}
      ${state.step === 'repair' ? `
        <button type="button" class="btn btn-quiet" data-action="science" data-id="iss">${esc(UI.compareIss)}</button>
        <button type="button" class="btn btn-quiet" data-action="science" data-id="notebook">${esc(UI.notebook)}</button>` : ''}
      <button type="button" class="btn btn-quiet btn-small" data-action="science" data-id="${esc(step.science)}"><span aria-hidden="true">🔬</span> ${esc(UI.science)}</button>
    </section>`;
}
