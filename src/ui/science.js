// Qamar Square "Science Behind This" dialog. Owner: Lane C.
// One native <dialog>. Read-only: it never touches game state.
import { SCIENCE, SCIENCE_UI } from '../data/content.js';
import { esc } from './hud.js';

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

function topicHtml(topic) {
  const facts = topic.facts
    ? `<h4>${esc(topic.factsTitle ?? '')}</h4>
       <dl class="facts">${topic.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`
    : '';
  const links = topic.links
    .map((l) => `<li><a href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${esc(l.label)} <span class="sr-only">${esc(SCIENCE_UI.newTab)}</span><span aria-hidden="true">↗</span></a></li>`)
    .join('');
  return `
    <p class="eyebrow" id="science-heading">🔬 ${esc(SCIENCE_UI.heading)}</p>
    <h3 class="dlg-title">${esc(topic.title)}</h3>
    ${topic.body.map((p) => `<p>${esc(p)}</p>`).join('')}
    ${facts}
    <h4>${esc(SCIENCE_UI.sources)}</h4>
    <ul class="links">${links}</ul>
    <p class="teaching">ℹ️ ${esc(SCIENCE_UI.teaching)}</p>
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
