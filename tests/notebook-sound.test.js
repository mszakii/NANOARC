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

test('sound starts muted and never throws without Web Audio', () => {
  assert.equal(soundOn(), false);
  assert.equal(play('click'), false, 'muted');
  assert.equal(typeof globalThis.AudioContext, 'undefined');
  assert.equal(soundAvailable(), false);
  assert.doesNotThrow(() => setSound(true));
  assert.equal(soundOn(), true);
  for (const name of SOUND_NAMES) assert.equal(play(name), false, `${name} is skipped without audio`);
  assert.equal(play('music'), false);
  assert.deepEqual(sfxLog, []);
  setSound(false);
  assert.deepEqual([...SOUND_NAMES].sort(), ['click', 'drop', 'relay', 'valve']);
});
