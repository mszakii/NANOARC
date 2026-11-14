// Qamar Square sound effects. Short, non-musical, synthesized with Web Audio: no files, no music,
// no melodies, no loops. Starts muted. Every sound repeats a result that is already on screen,
// so the game is complete with sound off. If audio is unavailable, play() quietly does nothing.

let enabled = false;
let ctx = null;
let master = null;
let noise = null;
let broken = false;
const lastPlayed = new Map();
const MIN_GAP_MS = 90; // the same sound cannot fire twice within this window

/** Names of sounds actually started, for QA (duplicate-sound checks). Capped. */
export const sfxLog = [];
globalThis.__qsSfx = sfxLog;

function audio() {
  if (broken) return null;
  if (ctx) return ctx;
  try {
    const AC = globalThis.AudioContext;
    if (typeof AC !== 'function') {
      broken = true;
      return null;
    }
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
    // One shared second of white noise for clicks and ticks.
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    return ctx;
  } catch {
    broken = true;
    ctx = null;
    return null;
  }
}

/** Filtered noise burst: clicks, ratchet ticks, relay contacts. */
function burst(c, t, { dur = 0.02, freq = 3000, q = 4, gain = 0.15 } = {}) {
  const src = c.createBufferSource();
  src.buffer = noise;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = q;
  const env = c.createGain();
  env.gain.setValueAtTime(gain, t);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(env).connect(master);
  src.start(t, Math.random() * 0.5, dur + 0.01);
}

/** Single gliding tone: a water "plip" or a low mechanical thunk. Never a sequence of pitches. */
function glide(c, t, { from, to, dur, gain = 0.12, type = 'sine' }) {
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(gain, t + 0.006);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(env).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

const SOUNDS = {
  /** Quiet UI click. */
  click(c, t) {
    burst(c, t, { dur: 0.018, freq: 3200, q: 5, gain: 0.09 });
  },
  /** Heat valve turning: a short ratchet, then a soft seat thunk. */
  valve(c, t) {
    for (let i = 0; i < 6; i += 1) burst(c, t + i * 0.065, { dur: 0.016, freq: 1700 + i * 60, q: 7, gain: 0.16 });
    glide(c, t + 0.41, { from: 150, to: 85, dur: 0.12, gain: 0.08, type: 'triangle' });
  },
  /** One water droplet. */
  drop(c, t) {
    glide(c, t, { from: 1300, to: 480, dur: 0.085, gain: 0.13 });
    burst(c, t, { dur: 0.01, freq: 5000, q: 2, gain: 0.03 });
  },
  /** Antenna relay: two contact clicks as the transmitter keys up. */
  relay(c, t) {
    burst(c, t, { dur: 0.012, freq: 4200, q: 3, gain: 0.22 });
    burst(c, t + 0.05, { dur: 0.012, freq: 3300, q: 3, gain: 0.18 });
    burst(c, t + 0.05, { dur: 0.09, freq: 180, q: 1.5, gain: 0.04 });
  },
};

export const SOUND_NAMES = Object.freeze(Object.keys(SOUNDS));

export function soundOn() {
  return enabled;
}

/** True unless the browser has no Web Audio or it failed to start. */
export function soundAvailable() {
  return !broken && typeof globalThis.AudioContext === 'function';
}

/** Turn sound effects on or off. Call from a user gesture so the browser allows audio. */
export function setSound(on) {
  enabled = Boolean(on);
  if (enabled) {
    const c = audio();
    if (c?.state === 'suspended') c.resume().catch(() => {});
  } else if (ctx?.state === 'running') {
    ctx.suspend().catch(() => {});
  }
  return enabled;
}

/**
 * Play one named effect if sound is on. Returns true when a sound started.
 * Never throws: missing audio leaves gameplay untouched.
 */
export function play(name) {
  if (!enabled || !Object.hasOwn(SOUNDS, name)) return false;
  const now = globalThis.performance?.now?.() ?? Date.now();
  if (now - (lastPlayed.get(name) ?? -Infinity) < MIN_GAP_MS) return false;
  lastPlayed.set(name, now);
  const c = audio();
  if (!c) return false;
  try {
    SOUNDS[name](c, c.currentTime + 0.01);
    sfxLog.push(name);
    if (sfxLog.length > 200) sfxLog.shift();
    return true;
  } catch {
    return false;
  }
}
