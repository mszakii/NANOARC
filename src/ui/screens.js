// Qamar Square start, loadout and end cards. Owner: Lane C. Pure string builders.
import { UI, ITEMS_COPY, ITEM_ORDER } from '../data/content.js';
import { esc } from './hud.js';

const fmt = (n) => Number(n).toLocaleString('en-US');

export function renderStart(view) {
  return `
    <section class="card hero" aria-labelledby="hero-title">
      <p class="hero-moon" aria-hidden="true">🌙</p>
      <h1 id="hero-title" class="hero-title">${esc(UI.title)}</h1>
      <p class="hero-line">${esc(UI.tagline)}</p>
      ${errorHtml(view)}
      <button type="button" class="btn btn-primary btn-big" data-action="start" data-primary>🚀 ${esc(UI.start)}</button>
    </section>`;
}

function errorHtml(view) {
  return view.error
    ? `<p class="warn" role="alert"><span aria-hidden="true">⚠️</span> <strong>${esc(UI.errorTitle)}.</strong> ${esc(UI.errorBody)}</p>`
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
          <span class="item-ico" aria-hidden="true">${c.icon}</span>
          <span class="item-body">
            <span class="item-name">${esc(c.name)}</span>
            <span class="item-cost">${fmt(items[id].cost)} ${esc(UI.credits)}</span>
            <span class="item-does">${esc(c.does)}</span>
            <span class="item-when">${esc(c.when)}</span>
          </span>
          <span class="item-state"><span aria-hidden="true">${on ? '✓' : '+'}</span> ${esc(on ? UI.packed : UI.notPacked)}</span>
        </button>
      </li>`;
  }).join('');

  const over = !check.ok;
  const message = over ? UI.budgetOver(fmt(-check.remaining)) : UI.budgetOk(fmt(check.remaining));
  return `
    <section class="card loadout" aria-labelledby="loadout-title">
      <h1 id="loadout-title" class="card-title">🎒 ${esc(UI.loadoutTitle)}</h1>
      <p class="lead">${esc(UI.loadoutIntro)}</p>
      <ul class="items">${cards}</ul>
      <div class="budget${over ? ' is-over' : ''}">
        <p class="budget-row">
          <span>${esc(UI.budgetLabel)}: <b>${fmt(budget)}</b></span>
          <span>${esc(UI.spentLabel)}: <b>${fmt(check.total)}</b></span>
          <span>${esc(UI.leftLabel)}: <b>${fmt(check.remaining)}</b></span>
        </p>
        <p class="budget-msg${over ? ' warn' : ''}" id="budget-msg" data-live><span aria-hidden="true">${over ? '⚠️' : '🪙'}</span> ${esc(message)}</p>
      </div>
      ${errorHtml(view)}
      <button type="button" class="btn btn-primary btn-big" data-action="launch" data-primary
        aria-describedby="budget-msg"${over ? ' aria-disabled="true"' : ''}>🚀 ${esc(UI.launch)}</button>
    </section>`;
}

export function renderEnd() {
  return `
    <section class="card end" aria-labelledby="end-title">
      <p class="eyebrow">🌅 ${esc(UI.endEyebrow)}</p>
      <h1 id="end-title" class="card-title">${esc(UI.endTitle)}</h1>
      <p class="lead">${esc(UI.endBody)}</p>
      <p class="final-line" data-live><span aria-hidden="true">📡</span> ${esc(UI.endFinal)}</p>
      <button type="button" class="btn btn-primary btn-big" data-action="play-again" data-primary>${esc(UI.playAgain)}</button>
    </section>`;
}
