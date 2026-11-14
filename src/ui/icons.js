// Qamar Square icon set. Local inline SVG, one 24px grid, 2px rounded ink strokes,
// one palette accent fill per icon (class "a"; a few use a second accent, class "b").
// Icons are always decorative: every use sits next to a visible text label.

const P = {
  // Resources
  power: '<rect x="7" y="5" width="10" height="16" rx="2.5"/><path d="M10 3h4"/><path class="a" d="M13 8l-3.5 5h3l-1.5 5 4.5-6h-3z"/>',
  water: '<path class="a" d="M10 3h4v3l2 3v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9l2-3z"/><path d="M8 13.5q2-1.6 4 0t4 0"/>',
  meals: '<rect class="a" x="3" y="9" width="18" height="11" rx="3"/><path d="M3 13.5h18M9 9V7.5a3 3 0 0 1 6 0V9"/>',
  readyMeal: '<path class="a" d="M6 4h12l-1.2 16.2a1 1 0 0 1-1 .8H8.2a1 1 0 0 1-1-.8z"/><path d="M6.3 8h11.4M10 13h4"/>',
  warmth: '<path d="M10 13.6V5a2 2 0 0 1 4 0v8.6a4 4 0 1 1-4 0z"/><circle class="a" cx="12" cy="17" r="2"/><path d="M12 15V9"/>',
  oxygen: '<circle class="a" cx="9" cy="14" r="6"/><circle cx="17.5" cy="6.5" r="3"/><circle cx="19" cy="15" r="1.5"/>',
  reserve: '<rect class="a" x="7" y="7" width="10" height="14" rx="4"/><path d="M10 7V4h4v3M7 12h10"/>',
  generator: '<circle cx="12" cy="12" r="9"/><path class="a" d="M12 12c0-4 1-6 3.5-6.5 1 2.5-1 5-3.5 6.5zM12 12c3.5 2 4.5 4 3 6.2-2.6-.4-3.6-3.3-3-6.2zM12 12c-3.5 2-5.8 1.6-6.5-.8 2-1.7 4.8-1 6.5.8z"/><circle cx="12" cy="12" r="1.2"/>',
  // Choices and equipment
  lamp: '<path d="M12 2v3"/><path class="a" d="M6 12l2-7h8l2 7z"/><path d="M12 15.5v2.5M7.5 14.5 6 16M16.5 14.5 18 16"/>',
  moon: '<path class="a" d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10z"/>',
  wrench: '<path class="a" d="M14.5 3.5a4.5 4.5 0 0 0-4.2 6.1l-6.6 6.6a2 2 0 0 0 2.8 2.8l6.6-6.6a4.5 4.5 0 0 0 6.1-4.2l-2.6 2.6-2.8-.7-.7-2.8z"/>',
  cold: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 6l2.5-1.5M9.5 19.5 12 18l2.5 1.5"/>',
  shelter: '<path class="a" d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  alert: '<path class="a" d="M12 3.5 21.5 20h-19z"/><path d="M12 10v4.5M12 17.5h.01"/>',
  kit: '<rect class="a" x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V5h6v3M3 13h18M11 13v2h2v-2"/>',
  printer: '<rect x="4" y="3" width="16" height="18" rx="2"/><path class="a" d="M10 7h4l-1 3h-2z"/><path class="b" d="M9 17v-3h6v3z"/><path d="M7 17h10"/>',
  recycle: '<path d="M20 12a8 8 0 0 1-13.6 5.7M4 12a8 8 0 0 1 13.6-5.7"/><path d="M5 21v-4h4M19 3v4h-4"/>',
  antenna: '<path class="a" d="M4 10a8 8 0 0 0 10 10z"/><path d="M9 15l6-6M15 3.5a5.5 5.5 0 0 1 5.5 5.5M15 7a2 2 0 0 1 2 2M6 21h6"/>',
  search: '<circle class="a" cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/>',
  cable: '<path d="M10 14l4-4M8.5 11.5l-2 2a3 3 0 0 0 4.2 4.2l2-2M15.5 12.5l2-2a3 3 0 0 0-4.2-4.2l-2 2"/>',
  bag: '<path class="a" d="M5 9h14l-1 11.2a1 1 0 0 1-1 .8H7a1 1 0 0 1-1-.8z"/><path d="M9 9V7a3 3 0 0 1 6 0v2"/>',
  pin: '<path class="a" d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  // Interface
  science: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path class="a" d="M7.6 15h8.8l1.7 3.2a1 1 0 0 1-.9 1.5H6.8a1 1 0 0 1-.9-1.5z"/>',
  turn: '<path d="M7 3h10M7 21h10M8 3c0 5 8 6 8 9s-8 4-8 9M16 3c0 5-8 6-8 9s8 4 8 9"/><path class="a" d="M10 19h4l-2-2z"/>',
  check: '<circle class="a" cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16 9.5"/>',
  lock: '<rect class="a" x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3M12 15v2"/>',
  restart: '<path d="M4 12a8 8 0 1 0 2.6-5.9"/><path d="M4 3v5h5"/>',
  rocket: '<path class="a" d="M12 2.5c3 2 5 6 5 10.5l-2 3H9l-2-3C7 8.5 9 4.5 12 2.5z"/><circle cx="12" cy="9.5" r="2"/><path d="M7 13l-3 4 3.5 1M17 13l3 4-3.5 1"/><path class="b" d="M10 19.5l2 2.5 2-2.5z"/>',
  sun: '<circle class="a" cx="12" cy="12" r="4.5"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  sunrise: '<path class="a" d="M7 18a5 5 0 0 1 10 0z"/><path d="M3 18h18M12 6v3M5 11l1.6 1.6M19 11l-1.6 1.6M8 21h8"/>',
  star: '<path class="a" d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  coin: '<circle class="a" cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/>',
  tap: '<path class="a" d="M9 11V5a1.5 1.5 0 0 1 3 0v5.5V8.5a1.5 1.5 0 0 1 3 0V11v-.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-4.8-2.4L4 15.4a1.5 1.5 0 0 1 2.3-1.9L9 16z"/>',
  info: '<circle class="a" cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  drop: '<path class="a" d="M12 3s6 6.8 6 11a6 6 0 0 1-12 0c0-4.2 6-11 6-11z"/>',
  play: '<path class="a" d="M8 5.5v13l10-6.5z"/>',
  stop: '<rect class="a" x="6.5" y="6.5" width="11" height="11" rx="2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  sound: '<path class="a" d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  mute: '<path class="a" d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  notebook: '<rect class="a" x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v18M12 8h4M12 12h4"/>',
};

/** Names in this set, for tests and fallbacks. */
export const ICON_NAMES = Object.freeze(Object.keys(P));

/**
 * Inline SVG icon. Always aria-hidden: pair it with visible text.
 * @param {string} name  one of ICON_NAMES (unknown names fall back to "info")
 * @param {string} [cls] extra class
 */
export function icon(name, cls = '') {
  const key = Object.hasOwn(P, name) ? name : 'info';
  return `<svg class="ico${cls ? ` ${cls}` : ''}" data-icon="${key}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${P[key]}</svg>`;
}
