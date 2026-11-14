import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newPractice, newRun } from '../src/game/rules.js';
import { SCIENCE, NOTEBOOK } from '../src/data/content.js';
import { membraneHtml, membraneClick, membraneStage, resetMembrane } from '../src/ui/membrane.js';
import { play, setSound, soundOn, soundAvailable, sfxLog, SOUND_NAMES } from '../src/ui/sound.js';

/** A stand-in for a clicked experiment button. */
const press = (action, disabled = false) => ({
  closest: () => ({ dataset: { membrane: action }, getAttribute: (n) => (n === 'aria-disabled' && disabled ? 'true' : null) }),
});

test('notebook is a membrane lab example that cites the membrane distillation study', () => {
  const topic = SCIENCE.notebook;
  assert.equal(topic.experiment, 'membrane');
  assert.ok(topic.links.some((l) => l.href === 'https://doi.org/10.1016/j.seppur.2018.10.035'));
  assert.match(topic.body.join(' '), /Lab research example/);
  assert.match(topic.teaching, /not drinking water/);
  assert.equal(topic.title, 'Nanotechnology Lab: Test the Membrane');
  assert.match(topic.body.join(' '), /This research membrane contains tiny silica particles called nanoparticles\. Water vapor passes through the membrane and cools into drops\./);
  resetMembrane();
  const html = membraneHtml();
  for (const label of ['Silica', 'nanoparticles', 'Water vapor', 'Illustration, not to scale.', 'TEST SAMPLE']) assert.ok(html.includes(label), label);
  // The historical ISS comparison stays its own activity.
  assert.equal(SCIENCE.iss.compare, true);
  assert.equal(SCIENCE.notebook.compare, undefined);
});

test('Test the Membrane: start, condense, collect a labelled Test Sample, run again', () => {
  resetMembrane();
  let paints = 0;
  const repaint = () => { paints += 1; };
  assert.equal(membraneStage(), 'ready');
  assert.match(membraneHtml(), /Start the Test/);
  assert.equal(membraneClick(press('collect'), repaint), true, 'collect before the test is ignored but handled');
  assert.equal(membraneStage(), 'ready');
  membraneClick(press('start'), repaint);
  assert.equal(membraneStage(), 'running');
  assert.match(membraneHtml(), /aria-disabled="true"/);
  membraneClick(press('start'), repaint);
  assert.equal(membraneStage(), 'running', 'a second start press does nothing');
  resetMembrane(); // closing the Notebook mid-test cancels it
  assert.equal(membraneStage(), 'ready');
  assert.equal(paints, 1, 'only the real start repainted');
});

test('the experiment never changes mission state', async () => {
  const story = newRun([]);
  const practice = newPractice(true);
  const before = [structuredClone(story), structuredClone(practice)];
  resetMembrane();
  membraneClick(press('start'), () => {});
  await new Promise((r) => setTimeout(r, 2800));
  assert.equal(membraneStage(), 'done');
  membraneClick(press('collect'), () => {});
  assert.equal(membraneStage(), 'collected');
  assert.match(membraneHtml(), new RegExp(NOTEBOOK.cupLabel));
  assert.match(membraneHtml(), /not drinking water/);
  assert.deepEqual([story, practice], before);
  resetMembrane();
});

test('sound is on by default and never throws without Web Audio', () => {
  assert.equal(soundOn(), true, 'new players start with sound on');
  assert.equal(typeof globalThis.AudioContext, 'undefined');
  assert.equal(soundAvailable(), false);
  for (const name of SOUND_NAMES) assert.equal(play(name), false, `${name} is skipped without audio`);
  assert.equal(play('music'), false);
  assert.deepEqual(sfxLog, []);
  assert.doesNotThrow(() => setSound(false));
  assert.equal(soundOn(), false);
  assert.equal(play('click'), false, 'off');
  setSound(true);
  assert.deepEqual([...SOUND_NAMES].sort(), ['click', 'drop', 'relay', 'valve']);
});

test('a saved Off choice is respected on the next load, and choices are saved', async () => {
  const store = new Map([['qamar-square:sound-effects', 'off']]);
  globalThis.localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)) };
  try {
    const fresh = await import('../src/ui/sound.js?reload=saved-off');
    assert.equal(fresh.soundOn(), false, 'refresh keeps Off');
    fresh.setSound(true);
    assert.equal(store.get('qamar-square:sound-effects'), 'on');
    fresh.setSound(false);
    assert.equal(store.get('qamar-square:sound-effects'), 'off');
    globalThis.localStorage = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    const blocked = await import('../src/ui/sound.js?reload=blocked');
    assert.equal(blocked.soundOn(), true, 'blocked storage falls back to the default');
    assert.doesNotThrow(() => blocked.setSound(false));
  } finally {
    delete globalThis.localStorage;
  }
});
