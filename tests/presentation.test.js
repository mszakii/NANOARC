import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newRun, newPractice, confirm, advance, options } from '../src/game/rules.js';
import { renderEnd } from '../src/ui/screens.js';
import { renderPanel } from '../src/ui/panel.js';

function finish(items, choices) {
  let state = newRun(items);
  for (const id of choices) {
    const next = confirm(state, id);
    assert.notEqual(next, state, `${state.step}:${id} must be available`);
    state = advance(next);
  }
  assert.equal(state.step, 'done');
  return state;
}

test('ending reports the no-purchase decisions and leaves Earth confirmation pending', () => {
  const state = finish([], ['lights_on', 'adjust', 'early', 'reserve', 'standard', 'sort', 'check_antenna', 'secure_cable', 'send']);
  const before = structuredClone(state);
  const html = renderEnd(state);
  assert.match(html, /kept the greenhouse lights on/);
  assert.match(html, /used the emergency oxygen/);
  assert.match(html, /built the shelter early/);
  assert.match(html, /standard repair took 2 turns and 2 bottles/);
  assert.match(html, /sorted the plastic/);
  assert.doesNotMatch(html, /repair kit fixed|printed clip held|ready meal saved/);
  assert.match(html, /Signal sent\. Waiting for confirmation\./);
  assert.deepEqual(state, before, 'rendering must not change mission state');
});

test('a different run replaces the ending summary with its own decisions', () => {
  const state = finish(['kit', 'mealPack'], ['save_power', 'adjust', 'at_alert', 'restart', 'kit', 'print', 'check_antenna', 'send']);
  const html = renderEnd(state);
  assert.match(html, /saved power at the greenhouse/);
  assert.match(html, /ready meal saved time and warmth/);
  assert.match(html, /repair kit fixed the water in 1 turn/);
  assert.match(html, /printed clip held/);
  assert.doesNotMatch(html, /kept the greenhouse lights on|used the emergency oxygen|standard repair took|sorted the plastic/);
  assert.equal(state.res.water, 2);
});

test('both training results offer another practice instead of advancing the story', () => {
  for (const [withKit, id, bottles, turns] of [[true, 'kit', 2, 1], [false, 'standard', 1, 2]]) {
    const practice = newPractice(withKit);
    assert.equal(practice.res.water, 3);
    const result = confirm(practice, id);
    assert.equal(result.res.water, bottles);
    assert.equal(result.last.sequence.length, turns);
    const html = renderPanel(result, { open: true, seq: null }, options(result));
    assert.match(html, /Try Both Repair Paths/);
    assert.doesNotMatch(html, /data-action="continue"/);
    assert.equal(newPractice(withKit).res.water, 3);
  }
});
