// Qamar Square opening storyboard: a fullscreen video shown before the start screen.
// Skip is always available (button, Escape). If the video cannot play, the game goes straight on.
// English captions are burned into the video. Browsers may block autoplay with sound: then a big
// Play button waits for a tap.
import { UI } from '../data/content.js';
import { esc } from './hud.js';
import { icon } from './icons.js';

const SRC = './assets/video/opening-storyboard.mp4';
const POSTER = './assets/video/opening-poster.jpg';

/**
 * Show the opening over the whole page. Calls `onDone` once, when it ends, is skipped or fails.
 * `?intro=0` in the address skips it (for testing and for sharing a link straight to the game).
 * @param {HTMLElement} host   element to mount into (usually document.body)
 * @param {HTMLElement} page   the game root: made inert while the opening plays
 * @param {() => void} onDone
 */
export function showIntro(host, page, onDone) {
  const params = new URLSearchParams(globalThis.location?.search ?? '');
  if (params.get('intro') === '0') {
    onDone();
    return;
  }

  const root = document.createElement('div');
  root.className = 'intro';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', UI.introLabel);
  root.innerHTML = `
    <video class="intro-video" playsinline preload="auto" poster="${esc(POSTER)}" src="${esc(SRC)}"></video>
    <button type="button" class="btn intro-skip" data-intro="skip">${esc(UI.introSkip)} ${icon('arrow')}</button>
    <div class="intro-gate" hidden>
      <button type="button" class="btn btn-primary btn-big intro-play" data-intro="play">${icon('play')} ${esc(UI.introPlay)}</button>
    </div>`;

  const video = root.querySelector('video');
  const gate = root.querySelector('.intro-gate');
  const skip = root.querySelector('.intro-skip');
  let finished = false;

  page.inert = true;
  host.append(root);

  function finish() {
    if (finished) return;
    finished = true;
    document.removeEventListener('keydown', onKey, true);
    try {
      video.pause();
    } catch {
      // Nothing to stop.
    }
    root.remove();
    page.inert = false;
    onDone();
  }

  function onKey(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      finish();
    }
  }

  function showGate() {
    gate.hidden = false;
    gate.querySelector('button').focus();
  }

  async function start() {
    gate.hidden = true;
    try {
      await video.play();
      skip.focus();
    } catch {
      showGate(); // autoplay with sound was blocked: wait for a tap
    }
  }

  root.addEventListener('click', (event) => {
    const action = event.target.closest('[data-intro]')?.dataset.intro;
    if (action === 'skip') finish();
    if (action === 'play') start();
  });
  video.addEventListener('ended', finish);
  video.addEventListener('error', finish); // missing or unsupported file: never block the game
  document.addEventListener('keydown', onKey, true);

  skip.focus();
  // With reduced motion, wait for a tap instead of starting a long video on its own.
  if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) showGate();
  else start();
}
