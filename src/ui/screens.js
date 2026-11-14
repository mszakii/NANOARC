// Qamar Square start, loadout and end cards. Owner: Lane C. Pure string builders.
import { UI, ITEMS_COPY, ITEM_ORDER, summaryLines, CREW } from '../data/content.js';
import { esc } from './hud.js';
import { icon } from './icons.js';

const fmt = (n) => Number(n).toLocaleString('en-US');

export function renderStart(view) {
  if (view.training) return renderTraining();
  return `
    <section class="card hero" aria-labelledby="hero-title">
      <p class="hero-moon">${icon('moon')}</p>
      <h1 id="hero-title" class="hero-title">${esc(UI.title)}</h1>
      <p class="hero-line">${esc(UI.tagline)}</p>
      <p>${esc(UI.introLine)}</p>
      ${errorHtml(view)}
      <button type="button" class="btn btn-primary btn-big" data-action="start" data-primary>${icon('rocket')} ${esc(UI.start)}</button>
      <button type="button" class="btn btn-quiet btn-big" data-action="training">${icon('water')} ${esc(UI.training)}</button>
      <p class="credits">${esc(UI.creditsLine)}</p>
    </section>`;
}

function renderTraining() {
  return `
    <section class="card" aria-labelledby="training-title">
      <h1 id="training-title" class="card-title">${esc(UI.trainingTitle)}</h1>
      <p class="lead">${esc(UI.trainingIntro)}</p>
      <button type="button" class="btn btn-primary btn-big" data-action="practice" data-id="kit" data-primary>${esc(UI.trainKit)}</button>
      <p>${esc(UI.trainKitWhat)}</p>
      <button type="button" class="btn btn-primary btn-big" data-action="practice" data-id="standard">${esc(UI.trainStandard)}</button>
      <p>${esc(UI.trainStandardWhat)}</p>
      <button type="button" class="btn btn-quiet" data-action="back-start">${esc(UI.backToStart)}</button>
    </section>`;
}

function errorHtml(view) {
  return view.error
    ? `<p class="warn" role="alert">${icon('alert')} <strong>${esc(UI.errorTitle)}.</strong> ${esc(UI.errorBody)}</p>`
    : '';
}

/**
 * @param {object} view
 * @param {object} p
 * @param {Record<string,{cost:number}>} p.items  rules ITEMS
 * @param {number} p.budget
 * @param {{ok:boolean,total:number,remaining:number}} p.check  rules canLaunch(picks)
 */
export function renderLoadout(view, { items, budget, check }) {
  const cards = ITEM_ORDER.filter((id) => items[id]).map((id) => {
    const c = ITEMS_COPY[id];
    const on = view.picks.includes(id);
    return `
      <li>
        <button type="button" class="item" data-action="toggle-item" data-id="${esc(id)}" aria-pressed="${on}">
          <span class="item-ico">${icon(c.icon)}</span>
          <span class="item-body">
            <span class="item-name">${esc(c.name)}</span>
            <span class="item-cost">${fmt(items[id].cost)} ${esc(UI.credits)}</span>
            <span class="item-does">${esc(c.does)}</span>
            <span class="item-when">${esc(c.when)}</span>
          </span>
          <span class="item-state">${icon(on ? 'check' : 'plus')} ${esc(on ? UI.packed : UI.notPacked)}</span>
        </button>
      </li>`;
  }).join('');

  const over = !check.ok;
  const message = over ? UI.budgetOver(fmt(-check.remaining)) : UI.budgetOk(fmt(check.remaining));
  return `
    <section class="card loadout" aria-labelledby="loadout-title">
      <h1 id="loadout-title" class="card-title">${icon('bag')} ${esc(UI.loadoutTitle)}</h1>
      <p class="lead">${esc(UI.loadoutIntro)}</p>
      <ul class="items">${cards}</ul>
      <div class="budget${over ? ' is-over' : ''}">
        <p class="budget-row">
          <span>${esc(UI.budgetLabel)}: <b>${fmt(budget)}</b></span>
          <span>${esc(UI.spentLabel)}: <b>${fmt(check.total)}</b></span>
          <span>${esc(UI.leftLabel)}: <b>${fmt(check.remaining)}</b></span>
        </p>
        <p class="budget-msg${over ? ' warn' : ''}" id="budget-msg" data-live>${icon(over ? 'alert' : 'coin')} ${esc(message)}</p>
      </div>
      ${errorHtml(view)}
      <button type="button" class="btn btn-primary btn-big" data-action="launch" data-primary
        aria-describedby="budget-msg"${over ? ' aria-disabled="true"' : ''}>${icon('rocket')} ${esc(UI.launch)}</button>
    </section>`;
}

/** Choose the astronaut who leads the run (before packing). */
export function renderCrew(view) {
  const picked = view.avatar ?? null;
  const cards = ['girl', 'boy'].map((who) => {
    const on = picked === who;
    return `
      <li>
        <button type="button" class="crew-card" data-action="pick-crew" data-id="${who}" aria-pressed="${on}"${!picked && who === 'girl' ? ' data-primary' : ''}>
          <span class="crew-face portrait" data-who="${who}"><img src="./assets/crew/${who}-happy.webp" alt="" width="96" height="96" decoding="async" /></span>
          <span class="crew-name">${esc(CREW[who].name)}</span>
          <span class="crew-role">${esc(UI.crewRole[who])}</span>
          <span class="item-state">${icon(on ? 'check' : 'plus')} ${esc(on ? UI.crewPicked : UI.crewPick(CREW[who].name))}</span>
        </button>
      </li>`;
  }).join('');
  return `
    <section class="card crew-select" aria-labelledby="crew-title">
      <h1 id="crew-title" class="card-title">${esc(UI.crewTitle)}</h1>
      <p class="lead">${esc(UI.crewIntro)}</p>
      <ul class="crew-cards">${cards}</ul>
      <button type="button" class="btn btn-primary btn-big" data-action="confirm-crew"${picked ? ' data-primary' : ' aria-disabled="true"'}>
        ${icon('rocket')} ${esc(picked ? UI.crewConfirm(CREW[picked].name) : UI.crewConfirmNone)}</button>
    </section>`;
}

/** Sunrise reveal: how the signal travels, built from what this run actually did. */
function transmitterPlan(state) {
  const f = state.flags;
  const cable = f.clip ? UI.planCableClip : f.cable ? UI.planCableSecured : UI.planCableNow;
  const rows = [
    ['sun', UI.planPower, true],
    ['cable', cable, true],
    ['antenna', UI.planSend, true],
    ['info', UI.planReply, false],
  ];
  return `
    <section class="plan" aria-labelledby="plan-title">
      <h2 id="plan-title" class="tray-sub">${icon('antenna')} ${esc(UI.planTitle)}</h2>
      <p>${esc(UI.planIntro)}</p>
      <ol class="plan-steps">${rows.map(([ico, text, done]) => `<li class="${done ? 'is-done' : 'is-open'}">${icon(ico)} <span>${esc(text)}</span></li>`).join('')}</ol>
      <p class="plan-question">${esc(UI.planQuestion)}</p>
    </section>`;
}

export function renderEnd(state) {
  return `
    <section class="card end" aria-labelledby="end-title">
      <p class="eyebrow">${icon('sunrise')} ${esc(UI.endEyebrow)}</p>
      <h1 id="end-title" class="card-title">${esc(UI.endTitle)}</h1>
      <p class="lead">${esc(UI.endBody)}</p>
      <h2 class="tray-sub">${esc(UI.summaryTitle)}</h2>
      <ul class="decision-summary">${summaryLines(state).map((line) => `<li>${esc(line)}</li>`).join('')}</ul>
      ${transmitterPlan(state)}
      <p class="final-line" data-live>${icon('antenna')} ${esc(UI.endFinal)}</p>
      <button type="button" class="btn btn-primary btn-big" data-action="play-again" data-primary>${esc(UI.playAgain)}</button>
      <p class="credits">${esc(UI.creditsLine)}</p>
    </section>`;
}
