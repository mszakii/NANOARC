// Qamar Square HUD: pictorial counters with a text label and number. Owner: Lane C.
// Pure string builders. State is never colour-only: every counter has a label and a number.
import { RES, HUD } from '../data/content.js';

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** Escape dynamic text before it goes into an HTML string. */
export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
}

function pips(kind, cur, proj, slots = 0) {
  const next = proj ?? cur;
  const n = Math.min(Math.max(cur, next, slots), 10);
  let out = '';
  for (let i = 0; i < n; i += 1) {
    let cls = 'pip-empty';
    if (i < Math.min(cur, next)) cls = 'pip-on';
    else if (i < cur) cls = 'pip-going';
    else if (i < next) cls = 'pip-coming';
    out += `<i class="pip ${cls}"></i>`;
  }
  return `<span class="pips pips-${kind}" aria-hidden="true">${out}</span>`;
}

function counter({ key, icon, label, cur, proj, suffix = '', note = '', slots = 0, isKey = false }) {
  const changed = proj != null && proj !== cur;
  const value = changed
    ? `${esc(cur)} <span class="ctr-arrow" aria-hidden="true">→</span><span class="sr-only"> ${esc(HUD.becomes)} </span> <b class="ctr-next">${esc(proj)}</b>`
    : esc(cur);
  return `
    <li class="ctr${changed ? ' is-preview' : ''}${isKey ? ' is-key' : ''}" data-res="${esc(key)}">
      <span class="ctr-ico" aria-hidden="true">${icon}</span>
      <span class="ctr-val">${value}${suffix && !changed ? ` <small>${esc(suffix)}</small>` : ''}</span>
      <span class="ctr-label">${esc(label)}</span>
      ${pips(key, cur, changed ? proj : null, slots)}
      ${note ? `<span class="ctr-note">${esc(note)}</span>` : ''}
    </li>`;
}

/**
 * @param {object} p
 * @param {object} p.res        resources to show now
 * @param {object|null} p.projected  resources after the previewed option, or null
 * @param {boolean} p.generatorOn
 * @param {string[]} [p.keys]   resource keys that matter for the current decision
 */
export function renderHud({ res, projected = null, generatorOn, keys = [] }) {
  const p = projected;
  const isKey = (k) => keys.includes(k);
  const mealsCur = res.meals + res.readyMeals;
  const mealsProj = p ? p.meals + p.readyMeals : null;
  const readyShown = p ? p.readyMeals : res.readyMeals;

  const items = [
    counter({ key: 'power', icon: RES.power.icon, label: RES.power.label, cur: res.power, proj: p?.power, isKey: isKey('power') }),
    counter({ key: 'water', icon: RES.water.icon, label: RES.water.label, cur: res.water, proj: p?.water, isKey: isKey('water') }),
    counter({
      key: 'meals', icon: RES.meals.icon, label: RES.meals.label, cur: mealsCur, proj: mealsProj,
      note: res.readyMeals || readyShown ? HUD.readyNote(readyShown) : '',
      isKey: isKey('meals') || isKey('readyMeals'),
    }),
    counter({
      key: 'warmth', icon: RES.warmth.icon, label: RES.warmth.label, cur: res.warmth, proj: p?.warmth,
      suffix: `${HUD.of} ${RES.warmth.of}`, slots: RES.warmth.of, isKey: isKey('warmth'),
    }),
    counter({ key: 'oxygen', icon: RES.oxygen.icon, label: RES.oxygen.label, cur: res.oxygen, proj: p?.oxygen, isKey: isKey('oxygen') }),
    counter({ key: 'reserve', icon: RES.reserve.icon, label: RES.reserve.label, cur: res.reserve, proj: p?.reserve, isKey: isKey('reserve') }),
    `
    <li class="ctr ctr-gen${isKey('generator') ? ' is-key' : ''}" data-res="generator" data-on="${generatorOn ? 'true' : 'false'}">
      <span class="ctr-ico" aria-hidden="true">${HUD.generatorIcon}</span>
      <span class="ctr-val ctr-val-text"><span aria-hidden="true">${generatorOn ? HUD.runningMark : HUD.stoppedMark}</span> ${esc(generatorOn ? HUD.running : HUD.stopped)}</span>
      <span class="ctr-label">${esc(HUD.generator)}</span>
    </li>`,
  ];
  return `<ul class="hud" aria-label="${esc(HUD.label)}">${items.join('')}</ul>`;
}
