// Qamar Square "Science Behind This" dialog. Owner: Lane C.
// One native <dialog>. Read-only: it never touches game state.
import { SCIENCE, SCIENCE_UI } from '../data/content.js';
import { esc } from './hud.js';
import { icon } from './icons.js';

let dlg = null;
let opener = null;

function ensureDialog() {
  if (dlg) return dlg;
  dlg = document.createElement('dialog');
  dlg.className = 'dlg dlg-science';
  dlg.id = 'science-dialog';
  dlg.setAttribute('aria-labelledby', 'science-heading');
  dlg.setAttribute('closedby', 'any');
  document.body.append(dlg);

  dlg.addEventListener('click', (event) => {
    const modeButton = event.target.closest('[data-iss-mode]');
    if (modeButton) {
      const mode = SCIENCE_UI.issModes.find((m) => m.pct === Number(modeButton.dataset.issMode));
      if (!mode) return;
      for (const button of dlg.querySelectorAll('[data-iss-mode]')) {
        button.setAttribute('aria-pressed', String(button === modeButton));
      }
      dlg.querySelector('#iss-content').innerHTML = comparisonBody(mode);
      return;
    }
    if (event.target === dlg || event.target.closest('[data-science-close]')) dlg.close();
  });
  dlg.addEventListener('close', () => {
    // Return focus to the button that opened the panel. The tray may have been
    // re-rendered meanwhile, so fall back to the current science button.
    const target = opener?.isConnected ? opener : document.querySelector('[data-action="science"]');
    opener = null;
    target?.focus();
  });
  return dlg;
}

function comparisonBody(mode) {
  return `
    <div class="iss-drops" role="img" aria-label="${esc(SCIENCE_UI.issTreated(mode.drops))} ${esc(SCIENCE_UI.issLeft(20 - mode.drops))}">
      ${Array.from({ length: 20 }, (_, i) => `<span class="iss-drop" data-recovered="${i < mode.drops}" aria-hidden="true">${icon('drop')}<b>${i < mode.drops ? '✓' : '−'}</b></span>`).join('')}
    </div>
    <div role="status">
      <p><strong>${esc(SCIENCE_UI.issTreated(mode.drops))}</strong></p>
      <p>${esc(SCIENCE_UI.issLeft(20 - mode.drops))}</p>
      <p>${esc(SCIENCE_UI.issWhy[mode.pct])}</p>
    </div>`;
}

function comparisonHtml() {
  return `
    <div class="iss-modes" role="group" aria-label="${esc(SCIENCE_UI.issSettings)}">
      ${SCIENCE_UI.issModes.map((mode, i) => `<button type="button" class="btn btn-quiet" data-iss-mode="${mode.pct}" aria-pressed="${i === 0}">${esc(mode.label)}</button>`).join('')}
    </div>
    <div id="iss-content">${comparisonBody(SCIENCE_UI.issModes[0])}</div>
    <p class="iss-legend">✓ ${esc(SCIENCE_UI.issLegendTreated)}<br>− ${esc(SCIENCE_UI.issLegendLeft)}</p>
    <p class="teaching">${esc(SCIENCE_UI.issNote)}</p>`;
}

function topicHtml(topic) {
  const facts = topic.facts
    ? `<h4>${esc(topic.factsTitle ?? '')}</h4>
       <dl class="facts">${topic.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`
    : '';
  const links = topic.links
    .map((l) => `<li><a href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${esc(l.label)} <span class="sr-only">${esc(SCIENCE_UI.newTab)}</span>${icon('external')}</a></li>`)
    .join('');
  return `
    <p class="eyebrow" id="science-heading">${icon('science')} ${esc(SCIENCE_UI.heading)}</p>
    <h3 class="dlg-title">${esc(topic.title)}</h3>
    ${topic.body.map((p) => `<p>${esc(p)}</p>`).join('')}
    ${topic.compare ? comparisonHtml() : ''}
    ${facts}
    <h4>${esc(SCIENCE_UI.sources)}</h4>
    <ul class="links">${links}</ul>
    <p class="teaching">${icon('info')} ${esc(SCIENCE_UI.teaching)}</p>
    <div class="dlg-actions">
      <button type="button" class="btn btn-primary" data-science-close>${esc(SCIENCE_UI.close)}</button>
    </div>`;
}

/** Fill and open the science dialog for one topic id (see SCIENCE in content.js). */
export function openScience(id) {
  const topic = SCIENCE[id];
  if (!topic) return;
  const d = ensureDialog();
  if (!d.open) opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  d.innerHTML = topicHtml(topic);
  if (!d.open) d.showModal();
  d.scrollTop = 0;
}
