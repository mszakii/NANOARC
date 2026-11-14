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
const MASTER_GAIN = 0.9;

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
    master = masterBus(ctx);
    noise = makeNoise(ctx);
    return ctx;
  } catch {
    broken = true;
    ctx = null;
    return null;
  }
}

/** Master gain into a gentle limiter, so overlapping effects never clip. */
function masterBus(c) {
  const gain = c.createGain();
  gain.gain.value = MASTER_GAIN;
  const limiter = c.createDynamicsCompressor();
  limiter.threshold.value = -6;
  limiter.knee.value = 3;
  limiter.ratio.value = 12;
  limiter.attack.value = 0.002;
  limiter.release.value = 0.1;
  gain.connect(limiter).connect(c.destination);
  return gain;
}

/** One shared second of white noise for clicks and ticks. */
function makeNoise(c) {
  const buf = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buf;
}

/** Filtered noise burst: clicks, ratchet ticks, relay contacts. Wide filters keep the energy audible. */
function burst(c, t, { dur = 0.02, freq = 3000, q = 0.8, gain = 0.6, type = 'bandpass' } = {}, out = master, buf = noise) {
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(gain, t + 0.002);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(env).connect(out);
  src.start(t, Math.random() * 0.5, dur + 0.02);
}

/** Single gliding tone: a water "plip", a tick body or a low thunk. Never a sequence of pitches. */
function glide(c, t, { from, to, dur, gain = 0.3, type = 'sine' }, out = master) {
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(gain, t + 0.004);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(env).connect(out);
  osc.start(t);
  osc.stop(t + dur + 0.03);
}

// Levels are set by measurement (measureSound): peaks about -14 to -6 dBFS, the click the quietest.
const SOUNDS = {
  /** Quiet UI click: a short tick, like a soft switch. */
  click(c, t) {
    burst(c, t, { dur: 0.03, freq: 2500, q: 0.7, gain: 1 });
    glide(c, t, { from: 1900, to: 1100, dur: 0.035, gain: 0.28, type: 'triangle' });
  },
  /** Heat valve turning: a ratchet of six ticks, then a low seat thunk. */
  valve(c, t) {
    for (let i = 0; i < 6; i += 1) {
      const at = t + i * 0.07;
      burst(c, at, { dur: 0.03, freq: 1500 + i * 80, q: 1.1, gain: 0.55 });
      glide(c, at, { from: 900, to: 600, dur: 0.03, gain: 0.12, type: 'square' });
    }
    glide(c, t + 0.44, { from: 170, to: 80, dur: 0.16, gain: 0.45, type: 'triangle' });
    burst(c, t + 0.44, { dur: 0.06, freq: 400, q: 0.7, gain: 0.5, type: 'lowpass' });
  },
  /** One water droplet: a quick falling "plip". */
  drop(c, t) {
    glide(c, t, { from: 1500, to: 420, dur: 0.12, gain: 0.85 });
    glide(c, t + 0.015, { from: 2600, to: 1200, dur: 0.05, gain: 0.08 });
  },
  /** Antenna relay: two hard contact clicks as the transmitter keys up, with a short hum. */
  relay(c, t) {
    burst(c, t, { dur: 0.025, freq: 3500, q: 0.9, gain: 1 });
    glide(c, t, { from: 2400, to: 1800, dur: 0.02, gain: 0.15, type: 'square' });
    burst(c, t + 0.06, { dur: 0.025, freq: 2800, q: 0.9, gain: 0.9 });
    glide(c, t + 0.06, { from: 2000, to: 1500, dur: 0.02, gain: 0.13, type: 'square' });
    glide(c, t + 0.06, { from: 120, to: 115, dur: 0.18, gain: 0.18, type: 'sawtooth' });
  },
};

/** Audio engine state for QA and diagnostics: 'off' before first use, else the AudioContext state. */
export function soundState() {
  if (broken) return 'unavailable';
  return ctx ? ctx.state : 'off';
}
globalThis.__qsSfxState = soundState;

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

/**
 * QA helper: render one effect offline through the same synth code and master gain,
 * and report its loudness. Browser only (needs OfflineAudioContext). Does not play anything.
 * @returns {Promise<{ name: string, ms: number, peak: number, peakDb: number, rmsDb: number } | null>}
 */
export async function measureSound(name) {
  const OAC = globalThis.OfflineAudioContext;
  if (typeof OAC !== 'function' || !Object.hasOwn(SOUNDS, name)) return null;
  const rate = 48000;
  const off = new OAC(1, rate, rate);
  const savedMaster = master;
  const savedNoise = noise;
  try {
    master = masterBus(off);
    noise = makeNoise(off);
    SOUNDS[name](off, 0.01);
  } finally {
    master = savedMaster;
    noise = savedNoise;
  }
  const data = (await off.startRendering()).getChannelData(0);
  let peak = 0;
  let sum = 0;
  let last = 0;
  for (let i = 0; i < data.length; i += 1) {
    const v = Math.abs(data[i]);
    if (v > peak) peak = v;
    if (v > 0.001) last = i;
    sum += data[i] * data[i];
  }
  const active = Math.max(1, last);
  const db = (x) => Math.round(20 * Math.log10(Math.max(x, 1e-9)) * 10) / 10;
  return { name, ms: Math.round((active / rate) * 1000), peak: Math.round(peak * 1000) / 1000, peakDb: db(peak), rmsDb: db(Math.sqrt(sum / active)) };
}
