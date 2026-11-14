// Qamar Square Notebook experiment: "Test the Membrane". Owner: lead.
// A lab research example (membrane distillation), shown with text and a simple SVG.
// It has its own tiny state and never touches mission state: the Test Sample is not drinking water.
import { NOTEBOOK } from '../data/content.js';
import { esc } from './hud.js';
import { icon } from './icons.js';
import { play } from './sound.js';

const RUN_MS = 2600;
const DROP_TIMES = [900, 1500, 2100];

/** 'ready' -> 'running' -> 'done' -> 'collected'. Reset each time the Notebook opens. */
let stage = 'ready';
let timers = [];

const reduceMotion = () => Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

function clearTimers() {
  for (const t of timers) clearTimeout(t);
  timers = [];
}

/** Called when the Notebook opens or closes: a fresh, idle experiment. */
export function resetMembrane() {
  clearTimers();
  stage = 'ready';
}

export function membraneStage() {
  return stage;
}

function figure() {
  // Vapor dots start on the warm side and cross the membrane while running.
  const vapor = [
    [96, 62], [112, 84], [92, 104], [118, 120], [104, 76], [86, 92],
  ].map(([x, y], i) => `<circle class="mb-vapor" style="--i:${i}" cx="${x}" cy="${y}" r="4"/>`).join('');
  const pores = Array.from({ length: 9 }, (_, i) => `<rect class="mb-pore" x="151" y="${40 + i * 11}" width="8" height="4" rx="2"/>`).join('');
  const drops = [0, 1, 2].map((i) => `<path class="mb-drop" style="--i:${i}" d="M${234 + i * 20} 132q-5 7 0 10q5-3 0-10z"/>`).join('');
  return `
    <svg class="mb-figure" viewBox="0 0 320 210" role="img" aria-labelledby="mb-fig-title">
      <title id="mb-fig-title">${esc(NOTEBOOK.figure[stage])}</title>
      <rect class="mb-tank mb-warm" x="16" y="30" width="126" height="112" rx="14"/>
      <path class="mb-water" d="M18 72q16-8 32 0t32 0t32 0t26 0V128a12 12 0 0 1-12 12H30a12 12 0 0 1-12-12z"/>
      <path class="mb-heat" d="M40 150q-6 8 0 16M66 150q-6 8 0 16M92 150q-6 8 0 16"/>
      <rect class="mb-membrane" x="146" y="30" width="18" height="112" rx="5"/>
      ${pores}
      <circle class="mb-lens" cx="155" cy="86" r="16"/>
      <rect class="mb-tank mb-cool" x="168" y="30" width="136" height="112" rx="14"/>
      <rect class="mb-plate" x="290" y="38" width="8" height="96" rx="4"/>
      <g class="mb-vapors">${vapor}</g>
      <g class="mb-drops">${drops}</g>
      <path class="mb-cup" d="M204 150h102l-7 50a6 6 0 0 1-6 5h-76a6 6 0 0 1-6-5z"/>
      <path class="mb-fill" d="M209 180h92l-2.7 19a4 4 0 0 1-4 3h-78.6a4 4 0 0 1-4-3z"/>
      <text class="mb-cup-label" x="255" y="170" text-anchor="middle">${esc(NOTEBOOK.cupLabel)}</text>
      <text class="mb-label" x="79" y="22" text-anchor="middle">${esc(NOTEBOOK.warmLabel)}</text>
      <text class="mb-label" x="155" y="160" text-anchor="middle">${esc(NOTEBOOK.membraneLabel)}</text>
      <text class="mb-label" x="236" y="22" text-anchor="middle">${esc(NOTEBOOK.coolLabel)}</text>
    </svg>`;
}

/**
 * Zoom-in beside the membrane: silica nanoparticles (dark dots) held in the membrane material,
 * water vapor (light bubbles) passing through the pores. Static, so it stays with reduced motion.
 */
function zoom() {
  const pores = [40, 82, 124, 166];
  const silica = [
    [86, 26], [104, 34], [94, 58], [112, 66], [84, 100], [106, 104], [96, 138], [114, 146], [88, 178], [106, 186],
    [100, 18], [92, 116], [110, 122], [98, 160],
  ];
  const vapor = [[52, 46], [64, 90], [100, pores[1] + 6], [100, pores[2] + 6], [140, 50], [154, 132], [48, 150]];
  return `
    <figure class="mb-zoom">
      <svg viewBox="0 0 320 210" role="img" aria-labelledby="mb-zoom-title">
        <title id="mb-zoom-title">${esc(NOTEBOOK.zoomAlt)}</title>
        <defs><clipPath id="mb-lens"><circle cx="100" cy="104" r="94"/></clipPath></defs>
        <g clip-path="url(#mb-lens)">
          <rect x="0" y="0" width="80" height="210" class="mbz-warm"/>
          <rect x="120" y="0" width="100" height="210" class="mbz-cool"/>
          <rect x="78" y="0" width="44" height="210" class="mbz-material"/>
          ${pores.map((y) => `<rect x="78" y="${y}" width="44" height="13" rx="6" class="mbz-pore"/>`).join('')}
          ${silica.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.2" class="mbz-silica"/>`).join('')}
          ${vapor.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="5.5" class="mbz-vapor" style="--i:${i}"/>`).join('')}
          <path class="mbz-flow" d="M30 118h38M132 70h38M132 166h38"/>
          <path class="mbz-flow-head" d="M64 113l6 5-6 5M166 65l6 5-6 5M166 161l6 5-6 5"/>
        </g>
        <circle cx="100" cy="104" r="94" class="mbz-ring"/>
        <path class="mbz-leader" d="M110 66L214 54"/>
        <circle cx="110" cy="66" r="6.5" class="mbz-mark"/>
        <text x="218" y="50" class="mbz-label">${esc(NOTEBOOK.silicaLabel.split(' ')[0])}</text>
        <text x="218" y="64" class="mbz-label">${esc(NOTEBOOK.silicaLabel.split(' ').slice(1).join(' '))}</text>
        <path class="mbz-leader" d="M154 132L214 142"/>
        <circle cx="154" cy="132" r="8" class="mbz-mark"/>
        <text x="218" y="146" class="mbz-label">${esc(NOTEBOOK.vaporLabel)}</text>
      </svg>
      <figcaption>${esc(NOTEBOOK.zoomTitle)}. <em>${esc(NOTEBOOK.zoomNote)}</em></figcaption>
    </figure>`;
}

/** The experiment block inside the Notebook dialog. */
export function membraneHtml() {
  const button = {
    ready: `<button type="button" class="btn btn-primary" data-membrane="start" data-mb-primary>${icon('play')} ${esc(NOTEBOOK.start)}</button>`,
    running: `<button type="button" class="btn btn-primary" aria-disabled="true" data-mb-primary>${icon('turn')} ${esc(NOTEBOOK.running)}</button>`,
    done: `<button type="button" class="btn btn-primary" data-membrane="collect" data-mb-primary>${icon('drop')} ${esc(NOTEBOOK.collect)}</button>`,
    collected: `<button type="button" class="btn btn-quiet" data-membrane="again" data-mb-primary>${icon('restart')} ${esc(NOTEBOOK.again)}</button>`,
  }[stage];
  const badge = stage === 'collected'
    ? `<p class="mb-badge">${icon('check')} <span><strong>${esc(NOTEBOOK.cupLabel)}</strong> ${esc(NOTEBOOK.badge)}</span></p>`
    : '';
  return `
    <section class="membrane" data-stage="${stage}" aria-labelledby="mb-title">
      <h4 id="mb-title">${icon('science')} ${esc(NOTEBOOK.title)}</h4>
      <div class="mb-figures">
        ${figure()}
        ${zoom()}
      </div>
      <ol class="mb-steps">
        ${NOTEBOOK.steps.map((s, i) => `<li class="${i < NOTEBOOK.stepIndex[stage] ? 'is-done' : i === NOTEBOOK.stepIndex[stage] ? 'is-now' : ''}">${esc(s)}</li>`).join('')}
      </ol>
      <p class="mb-status" role="status">${esc(NOTEBOOK.status[stage])}</p>
      ${badge}
      <div class="mb-actions">${button}</div>
    </section>`;
}

/**
 * Handle a click inside the experiment. `rerender` repaints the block and refocuses its primary button.
 * Returns true when the click belonged to the experiment.
 */
export function membraneClick(target, rerender) {
  const btn = target.closest('[data-membrane]');
  if (!btn || btn.getAttribute('aria-disabled') === 'true') return Boolean(btn);
  const action = btn.dataset.membrane;
  if (action === 'start' && stage === 'ready') {
    play('click');
    if (reduceMotion()) {
      stage = 'done';
      play('drop');
    } else {
      stage = 'running';
      for (const t of DROP_TIMES) timers.push(setTimeout(() => play('drop'), t));
      timers.push(setTimeout(() => {
        timers = [];
        stage = 'done';
        rerender();
      }, RUN_MS));
    }
  } else if (action === 'collect' && stage === 'done') {
    play('drop');
    stage = 'collected';
  } else if (action === 'again' && stage === 'collected') {
    play('click');
    resetMembrane();
  } else {
    return true;
  }
  rerender();
  return true;
}
