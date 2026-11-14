import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newRun, newPractice, confirm, advance, retry, levelOf, endsLevel, LEVELS, AVATARS, options } from '../src/game/rules.js';
import { renderPanel } from '../src/ui/panel.js';
import { renderEnd, renderCrew } from '../src/ui/screens.js';

const step = (state, id) => confirm(state, id);

test('the chosen astronaut is stored in the run and survives every step and checkpoint', () => {
  assert.deepEqual(AVATARS, ['girl', 'boy']);
  for (const who of AVATARS) {
    let s = newRun([], who);
    assert.equal(s.avatar, who);
    s = advance(step(s, 'save_power'));
    s = step(s, 'leave');
    assert.equal(s.phase, 'recovery');
    s = retry(s);
    assert.equal(s.avatar, who, 'retry keeps the astronaut');
    assert.equal(s.step, 'valve');
  }
  assert.equal(newRun([], 'nobody').avatar, 'girl', 'unknown avatar falls back');
  assert.equal(newPractice(true, 'boy').avatar, 'boy');
});

test('five levels in a fixed order; Next Level only at level boundaries', () => {
  assert.equal(LEVELS, 5);
  const order = ['greenhouse', 'valve', 'shelter', 'oxygen', 'repair', 'plastic', 'signal', 'antenna'];
  assert.deepEqual(order.map(levelOf), [1, 2, 2, 3, 4, 4, 5, 5]);
  let s = newRun([], 'boy');
  const seen = [];
  for (const id of ['save_power', 'adjust', 'early', 'restart', 'standard', 'sort', 'send_now']) {
    s = step(s, id);
    seen.push(`${s.step}:${endsLevel(s)}`);
    s = advance(s);
  }
  assert.deepEqual(seen, [
    'greenhouse:true', 'valve:false', 'shelter:true', 'oxygen:true', 'repair:false', 'plastic:true', 'signal:false',
  ]);
  assert.equal(s.step, 'done');
  assert.equal(endsLevel(step(newPractice(true), 'kit')), false, 'training never shows Next Level');
});

test('panel shows Level X of 5, the chosen speaker and Next Level at a boundary', () => {
  const s = step(newRun([], 'boy'), 'save_power');
  const html = renderPanel(s, { open: true, seq: null, bagStage: 0 }, options(s));
  assert.match(html, /Level 1 of 5/);
  assert.match(html, /Engineer Sami/);
  assert.match(html, /boy-happy\.webp/);
  assert.match(html, /Next Level/);
  const within = step(advance(s), 'adjust');
  assert.match(renderPanel(within, { open: true, seq: null, bagStage: 0 }, []), /Level 2 of 5[\s\S]*Continue/);
});

test('resources carry over between levels in one run', () => {
  let s = newRun([], 'girl');
  for (const id of ['save_power', 'adjust', 'early']) s = advance(step(s, id));
  assert.deepEqual([levelOf(s.step), s.res.power, s.res.meals, s.res.warmth], [3, 3, 1, 2]);
  s = advance(step(s, 'restart'));
  assert.deepEqual([levelOf(s.step), s.res.power, s.res.water], [4, 0, 3]);
});

test('character screen and sunrise ending with the transmitter plan and the open question', () => {
  const crew = renderCrew({ avatar: null });
  assert.match(crew, /Choose Your Astronaut/);
  assert.match(crew, /aria-disabled="true"/);
  assert.match(renderCrew({ avatar: 'boy' }), /Confirm: Engineer Sami/);
  let s = newRun([], 'girl');
  for (const id of ['save_power', 'adjust', 'early', 'reserve', 'standard', 'print', 'check_antenna', 'send']) s = advance(step(s, id));
  const end = renderEnd(s);
  assert.match(end, /Transmitter plan/);
  assert.match(end, /held tight by the clip you printed/);
  assert.match(end, /Will the signal reach Earth\?/);
  assert.match(end, /Signal sent\. Waiting for confirmation\./);
});
