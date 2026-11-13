// Rule checks. Owner: Lane A. Run with `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BUDGET,
  ITEMS,
  advance,
  canLaunch,
  confirm,
  loadoutTotal,
  newPractice,
  newRun,
  options,
  retry,
} from '../src/game/rules.js';

// --- helpers ---------------------------------------------------------------

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) deepFreeze(value[key]);
  }
  return value;
}

const opt = (state, id) => options(state).find((o) => o.id === id);

/** Confirm one option on a frozen state; fails if nothing was applied. */
function choose(state, id) {
  deepFreeze(state);
  const preview = opt(state, id);
  assert.ok(preview, `option ${id} exists at step ${state.step}`);
  assert.equal(preview.available, true, `option ${id} is available at step ${state.step}`);
  const next = confirm(state, id);
  assert.notEqual(next, state, `confirm ${state.step}:${id} applied`);
  assert.deepEqual(next.res, preview.after, `preview equals commit for ${state.step}:${id}`);
  assert.deepEqual(next.last.delta, preview.delta);
  return next;
}

/** Confirm then Continue. */
function play(state, ...ids) {
  let s = state;
  for (const id of ids) {
    s = choose(s, id);
    assert.equal(s.phase, 'result');
    s = advance(deepFreeze(s));
    assert.equal(s.phase, 'choose');
  }
  return s;
}

// --- QS-01 -----------------------------------------------------------------

test('QS-01 both major items exceed the budget', () => {
  assert.equal(BUDGET, 10000);
  assert.equal(loadoutTotal(['battery', 'kit']), 10400);
  assert.equal(canLaunch(['battery', 'kit']).ok, false);
  assert.equal(canLaunch(['kit', 'mealPack']).ok, true);
  assert.equal(canLaunch([]).ok, true);
});

test('QS-01 budget totals and remaining credits', () => {
  assert.deepEqual(ITEMS, { battery: { cost: 5000 }, kit: { cost: 5400 }, mealPack: { cost: 300 } });
  assert.deepEqual(canLaunch(['battery', 'kit']), { ok: false, total: 10400, remaining: -400 });
  assert.deepEqual(canLaunch(['battery', 'kit', 'mealPack']), { ok: false, total: 10700, remaining: -700 });
  assert.deepEqual(canLaunch(['battery', 'mealPack']), { ok: true, total: 5300, remaining: 4700 });
  assert.deepEqual(canLaunch(['kit', 'mealPack']), { ok: true, total: 5700, remaining: 4300 });
  assert.deepEqual(canLaunch([]), { ok: true, total: 0, remaining: 10000 });
  // Becomes valid again when one major item is removed.
  assert.equal(canLaunch(['battery']).ok, true);
  assert.equal(canLaunch(['kit']).ok, true);
});

// --- start state -----------------------------------------------------------

test('newRun matches the contract shape and PRD launch values', () => {
  const s = newRun([]);
  assert.equal(s.mode, 'story');
  assert.equal(s.step, 'greenhouse');
  assert.equal(s.phase, 'choose');
  assert.deepEqual(s.loadout, { battery: false, kit: false, mealPack: false });
  assert.deepEqual(s.res, { power: 4, water: 4, meals: 2, readyMeals: 0, warmth: 1, oxygen: 2, reserve: 1 });
  assert.deepEqual(s.flags, {
    lights: false, crop: 0, valve: false, shelter: null, generator: false,
    recycler: false, clip: false, cable: false, sent: false, sunrise: false,
  });
  assert.deepEqual(s.history, []);
  assert.equal(s.last, null);
  assert.ok(s.checkpoint);
  assert.equal(s.checkpoint.checkpoint, null);
  assert.deepEqual(s.checkpoint.res, s.res);
});

test('loadout bonuses: battery adds 3 power, meal pack adds 1 ready meal', () => {
  assert.equal(newRun(['battery']).res.power, 7);
  assert.equal(newRun(['battery']).loadout.battery, true);
  assert.equal(newRun(['mealPack']).res.readyMeals, 1);
  assert.equal(newRun(['mealPack']).res.meals, 2);
  assert.equal(newRun(['kit']).loadout.kit, true);
  assert.equal(newRun(['kit']).res.power, 4);
});

// --- QS-02 -----------------------------------------------------------------

test('QS-02 options never changes the state', () => {
  let s = newRun(['mealPack']);
  const walk = ['save_power', 'adjust', 'at_alert', 'reserve', 'standard', 'print', 'check_antenna', 'send'];
  for (const id of walk) {
    deepFreeze(s);
    const before = structuredClone(s);
    const first = options(s);
    const second = options(s);
    assert.deepEqual(s, before);
    assert.deepEqual(first, second);
    assert.ok(first.length >= 2);
    for (const o of first) {
      assert.equal(typeof o.available, 'boolean');
      assert.ok('reason' in o && 'delta' in o && 'after' in o);
      assert.notEqual(o.after, s.res, 'after is a copy, not the live resources');
    }
    s = play(s, id);
  }
  assert.equal(s.step, 'done');
  assert.deepEqual(options(deepFreeze(s)), []);
});

test('QS-02 confirming twice applies the change once', () => {
  const s0 = deepFreeze(newRun([]));
  const s1 = deepFreeze(confirm(s0, 'lights_on'));
  assert.notEqual(s1, s0);
  assert.equal(s0.res.power, 4, 'input state untouched');
  assert.equal(s1.res.power, 2);
  assert.equal(s1.phase, 'result');
  const s2 = confirm(s1, 'lights_on');
  assert.equal(s2, s1, 'second confirm returns the same reference');
  assert.equal(confirm(s1, 'save_power'), s1, 'a different option after confirm is also ignored');
  assert.equal(s2.res.power, 2);
  assert.equal(s2.history.length, 1);
  assert.deepEqual(s2.history, [{ step: 'greenhouse', option: 'lights_on' }]);
});

test('confirm ignores unknown and unavailable options; advance ignores non-result phases', () => {
  const s0 = deepFreeze(newRun([]));
  assert.equal(confirm(s0, 'nope'), s0);
  assert.equal(confirm(s0, 'restart'), s0, 'an option from another step is unknown here');
  assert.equal(confirm(s0, 'toString'), s0);
  assert.equal(advance(s0), s0, 'advance needs phase result');
  const practice = deepFreeze(newPractice(false));
  assert.equal(confirm(practice, 'kit'), practice, 'unavailable option is a no-op');
});

test('last carries step, option, delta, before, after, sequence, notes', () => {
  const s1 = confirm(deepFreeze(newRun([])), 'lights_on');
  assert.deepEqual(s1.last, {
    step: 'greenhouse',
    option: 'lights_on',
    delta: { power: -2 },
    before: { power: 4, water: 4, meals: 2, readyMeals: 0, warmth: 1, oxygen: 2, reserve: 1 },
    after: { power: 2, water: 4, meals: 2, readyMeals: 0, warmth: 1, oxygen: 2, reserve: 1 },
    sequence: null,
    notes: [],
  });
  assert.equal(s1.flags.lights, true);
  assert.equal(s1.flags.crop, 1);

  const saved = confirm(deepFreeze(newRun([])), 'save_power');
  assert.deepEqual(saved.last.delta, {});
  assert.equal(saved.flags.lights, false);
  assert.equal(saved.flags.crop, 0);
  assert.equal(saved.res.power, 4);
});

// --- QS-03 -----------------------------------------------------------------

test('QS-03 practice standard repair: 3 bottles -> 1 after 2 turns', () => {
  const p = deepFreeze(newPractice(false));
  assert.equal(p.mode, 'practice');
  assert.equal(p.step, 'repair');
  assert.equal(p.phase, 'choose');
  assert.equal(p.res.water, 3);
  assert.ok(p.checkpoint);

  const standard = opt(p, 'standard');
  assert.equal(standard.available, true);
  assert.equal(standard.turns, 2);
  assert.deepEqual(standard.delta, { water: -2 });
  assert.equal(standard.after.water, 1);

  const kit = opt(p, 'kit');
  assert.equal(kit.available, false);
  assert.deepEqual(kit.reason, { need: 'kit' });
  assert.equal(kit.turns, 1);

  const done = choose(p, 'standard');
  assert.equal(done.res.water, 1);
  assert.equal(done.flags.recycler, true);
  assert.equal(done.last.sequence.length, 2);
  assert.deepEqual(done.last.sequence.map((r) => r.water), [2, 1]);
  assert.deepEqual(done.last.sequence[1], done.res);
  assert.equal(advance(done).step, 'done');
});

test('QS-03 practice kit repair: 3 bottles -> 2 after 1 turn', () => {
  const p = deepFreeze(newPractice(true));
  assert.equal(p.res.water, 3);
  const kit = opt(p, 'kit');
  assert.equal(kit.available, true);
  assert.equal(kit.reason, null);
  assert.equal(kit.turns, 1);
  assert.deepEqual(kit.delta, { water: -1 });
  assert.equal(kit.after.water, 2);
  assert.equal(opt(p, 'standard').available, true, 'standard stays available with the kit');

  const done = choose(p, 'kit');
  assert.equal(done.res.water, 2);
  assert.equal(done.flags.recycler, true);
  assert.equal(done.last.sequence.length, 1);
  assert.deepEqual(done.last.sequence.map((r) => r.water), [2]);

  // Try Both Repair Paths: back to the fixed 3-bottle checkpoint, any number of times.
  const finished = advance(deepFreeze(done));
  assert.equal(finished.step, 'done');
  const again = deepFreeze(retry(deepFreeze(finished)));
  assert.equal(again.step, 'repair');
  assert.equal(again.phase, 'choose');
  assert.equal(again.res.water, 3);
  assert.equal(again.flags.recycler, false);
  assert.equal(choose(again, 'standard').res.water, 1);
  assert.equal(retry(choose(again, 'standard')).res.water, 3);
});

// --- QS-05 -----------------------------------------------------------------

test('QS-05 the greenhouse choice flips restart availability', () => {
  const saved = play(newRun([]), 'save_power', 'adjust', 'early');
  assert.equal(saved.step, 'oxygen');
  assert.equal(saved.res.power, 3);
  assert.equal(opt(saved, 'restart').available, true);
  assert.equal(opt(saved, 'restart').reason, null);
  assert.equal(opt(saved, 'reserve').available, true);

  const lit = play(newRun([]), 'lights_on', 'adjust', 'early');
  assert.equal(lit.step, 'oxygen');
  assert.equal(lit.res.power, 1);
  const restart = opt(lit, 'restart');
  assert.equal(restart.available, false);
  assert.deepEqual(restart.reason, { need: 'power', amount: 3 });
  assert.deepEqual(restart.after, lit.res, 'an unavailable option projects no change');
  assert.equal(confirm(deepFreeze(lit), 'restart'), lit);
  assert.equal(opt(lit, 'reserve').available, true);

  const used = choose(lit, 'reserve');
  assert.equal(used.res.reserve, 0);
  assert.equal(used.res.oxygen, 2);
  assert.equal(used.res.power, 1);
  assert.equal(used.flags.generator, false);
  assert.deepEqual(used.last.delta, { reserve: -1 });
});

test('saved_power_enabled_restart appears only when it is true', () => {
  // True: no battery, saved power, early shelter -> 3 power, would have been 1.
  const base = choose(play(newRun([]), 'save_power', 'adjust', 'early'), 'restart');
  assert.deepEqual(base.last.notes, ['saved_power_enabled_restart']);

  // Saved power but the battery would have covered the restart anyway (6 - 2 = 4).
  const battery = play(newRun(['battery']), 'save_power', 'adjust', 'early');
  assert.equal(battery.res.power, 6);
  assert.deepEqual(choose(battery, 'restart').last.notes, []);

  // Lights on with the battery: restart is possible, but nothing was saved.
  const lit = play(newRun(['battery']), 'lights_on', 'adjust', 'early');
  assert.equal(lit.res.power, 4);
  const restarted = choose(lit, 'restart');
  assert.deepEqual(restarted.last.notes, []);
  assert.equal(restarted.res.power, 1);

  // Saved power, delayed shelter: 4 power, 4 - 2 = 2 < 3, so the saving mattered.
  const delayed = play(newRun([]), 'save_power', 'adjust', 'at_alert');
  assert.equal(delayed.res.power, 4);
  assert.deepEqual(choose(delayed, 'restart').last.notes, ['saved_power_enabled_restart']);

  // The reserve route never carries the note.
  const reserve = choose(play(newRun([]), 'save_power', 'adjust', 'early'), 'reserve');
  assert.deepEqual(reserve.last.notes, []);
});

// --- QS-06 -----------------------------------------------------------------

test('QS-06 leaving the valve opens recovery; retry restores the pre-crisis state', () => {
  const atValve = play(newRun([]), 'lights_on');
  assert.equal(atValve.step, 'valve');
  assert.equal(atValve.res.power, 2);
  assert.equal(atValve.res.warmth, 1);

  const leave = opt(atValve, 'leave');
  assert.equal(leave.available, true);
  assert.equal(leave.after.warmth, 0);
  assert.deepEqual(leave.delta, { warmth: -1 });
  assert.equal(opt(atValve, 'adjust').after.warmth, 2);
  assert.deepEqual(opt(atValve, 'adjust').delta, { warmth: 1 });

  const cold = deepFreeze(confirm(deepFreeze(atValve), 'leave'));
  assert.equal(cold.phase, 'recovery');
  assert.equal(cold.step, 'valve');
  assert.equal(cold.res.warmth, 0);
  assert.deepEqual(cold.last.notes, ['too_cold']);
  assert.equal(cold.flags.valve, false);
  assert.equal(advance(cold), cold, 'recovery cannot be continued');
  assert.equal(confirm(cold, 'adjust'), cold, 'recovery cannot be confirmed over');

  const back = deepFreeze(retry(cold));
  assert.notEqual(back, cold);
  assert.equal(back.step, 'valve');
  assert.equal(back.phase, 'choose');
  assert.equal(back.res.power, 2);
  assert.equal(back.res.warmth, 1);
  assert.deepEqual(back.res, atValve.res);
  assert.deepEqual(back.flags, atValve.flags);
  assert.deepEqual(back.history, [{ step: 'greenhouse', option: 'lights_on' }]);
  assert.ok(back.checkpoint, 'checkpoint is kept');
  assert.equal(back.checkpoint.checkpoint, null);

  // Retry works repeatedly.
  const coldAgain = deepFreeze(confirm(back, 'leave'));
  assert.equal(coldAgain.phase, 'recovery');
  const backAgain = deepFreeze(retry(coldAgain));
  assert.deepEqual(backAgain, back);

  // Adjusting then continues the mission.
  const warm = choose(backAgain, 'adjust');
  assert.equal(warm.phase, 'result');
  assert.equal(warm.res.warmth, 2);
  assert.equal(warm.flags.valve, true);
  const next = advance(warm);
  assert.equal(next.step, 'shelter');
  assert.equal(next.phase, 'choose');
  assert.equal(next.res.power, 2);
});

// --- QS-07 -----------------------------------------------------------------

test('QS-07 base-supplies walkthrough reaches sunrise and sends the signal', () => {
  let s = newRun([]);
  assert.deepEqual(s.res, { power: 4, water: 4, meals: 2, readyMeals: 0, warmth: 1, oxygen: 2, reserve: 1 });

  s = play(s, 'save_power');
  assert.equal(s.step, 'valve');
  assert.equal(s.res.power, 4);

  s = play(s, 'adjust');
  assert.equal(s.step, 'shelter');
  assert.equal(s.res.warmth, 2);

  s = choose(s, 'early');
  assert.deepEqual(s.last.delta, { power: -1, meals: -1 });
  assert.equal(s.flags.shelter, 'early');
  s = advance(s);
  assert.equal(s.step, 'oxygen');
  assert.equal(s.res.power, 3);
  assert.equal(s.res.warmth, 2);
  assert.equal(s.res.meals, 1);

  s = choose(s, 'restart');
  assert.equal(s.res.power, 0);
  assert.equal(s.res.oxygen, 2);
  assert.equal(s.res.reserve, 1);
  assert.equal(s.flags.generator, true);
  assert.deepEqual(s.last.delta, { power: -3 });
  assert.equal(s.res.water, 4, 'water is still 4 before entering the repair');

  s = advance(s);
  assert.equal(s.step, 'repair');
  assert.equal(s.res.water, 3, 'the crew uses 1 bottle on entering the final crisis');
  assert.equal(s.checkpoint.res.water, 3, 'checkpoint is taken after the entry cost');
  assert.equal(opt(s, 'kit').available, false);
  assert.deepEqual(opt(s, 'kit').reason, { need: 'kit' });

  s = choose(s, 'standard');
  assert.deepEqual(s.last.sequence.map((r) => r.water), [2, 1]);
  assert.equal(s.res.water, 1);
  assert.equal(s.flags.recycler, true);

  s = advance(s);
  assert.equal(s.step, 'plastic');
  assert.equal(opt(s, 'print').available, false);
  assert.deepEqual(opt(s, 'print').reason, { need: 'power', amount: 1 });

  s = choose(s, 'sort');
  assert.equal(s.res.meals, 0);
  assert.equal(s.res.power, 0);
  assert.equal(s.flags.clip, false);
  assert.equal(s.flags.sunrise, false);

  s = advance(s);
  assert.equal(s.step, 'signal');
  assert.equal(s.flags.sunrise, true);
  assert.deepEqual(s.res, { power: 0, water: 1, meals: 0, readyMeals: 0, warmth: 2, oxygen: 2, reserve: 1 });

  s = choose(s, 'send_now');
  assert.equal(s.flags.sent, true);
  s = advance(s);
  assert.equal(s.step, 'done');
  assert.deepEqual(options(s), []);
  assert.equal(advance(s), s);
  assert.equal(confirm(s, 'send_now'), s);
  assert.deepEqual(s.history, [
    { step: 'greenhouse', option: 'save_power' },
    { step: 'valve', option: 'adjust' },
    { step: 'shelter', option: 'early' },
    { step: 'oxygen', option: 'restart' },
    { step: 'repair', option: 'standard' },
    { step: 'plastic', option: 'sort' },
    { step: 'signal', option: 'send_now' },
  ]);
  // No resource ever went below zero.
  for (const value of Object.values(s.res)) assert.ok(value >= 0);
});

// --- QS-10 -----------------------------------------------------------------

test('QS-10 send now ends at sent / done', () => {
  const atSignal = play(newRun([]), 'save_power', 'adjust', 'early', 'restart', 'standard', 'sort');
  assert.equal(atSignal.step, 'signal');
  assert.equal(atSignal.res.power, 0, 'zero stored power is valid at sunrise');
  assert.deepEqual(options(atSignal).map((o) => [o.id, o.available]), [['send_now', true], ['check_antenna', true]]);
  const sent = choose(atSignal, 'send_now');
  assert.equal(sent.flags.sent, true);
  assert.equal(advance(sent).step, 'done');
});

test('QS-10 check antenna without the clip needs the cable secured before sending', () => {
  const atSignal = play(newRun([]), 'save_power', 'adjust', 'early', 'restart', 'standard', 'sort');
  const checked = choose(atSignal, 'check_antenna');
  assert.equal(checked.flags.sent, false);
  const atAntenna = advance(checked);
  assert.equal(atAntenna.step, 'antenna');
  assert.equal(atAntenna.phase, 'choose');

  assert.equal(opt(atAntenna, 'secure_cable').available, true);
  const send = opt(atAntenna, 'send');
  assert.equal(send.available, false);
  assert.deepEqual(send.reason, { need: 'cable' });
  assert.equal(confirm(deepFreeze(atAntenna), 'send'), atAntenna);

  const secured = choose(atAntenna, 'secure_cable');
  assert.equal(secured.flags.cable, true);
  assert.equal(secured.flags.sent, false);
  const again = advance(secured);
  assert.equal(again.step, 'antenna');
  assert.equal(opt(again, 'secure_cable').available, false);
  assert.equal(opt(again, 'send').available, true);

  const sent = choose(again, 'send');
  assert.equal(sent.flags.sent, true);
  assert.deepEqual(sent.res, atSignal.res, 'the signal branch costs no resources');
  assert.equal(advance(sent).step, 'done');
});

test('QS-10 with the printed clip, send is available immediately', () => {
  // Reserve route keeps 3 power, so printing the clip is affordable.
  const atPlastic = play(newRun([]), 'save_power', 'adjust', 'early', 'reserve', 'standard');
  assert.equal(atPlastic.res.power, 3);
  const printed = choose(atPlastic, 'print');
  assert.equal(printed.res.power, 2);
  assert.equal(printed.res.meals, 0);
  assert.equal(printed.flags.clip, true);
  assert.deepEqual(printed.last.notes, ['clip_installed']);
  assert.deepEqual(printed.last.delta, { power: -1, meals: -1 });

  const atAntenna = play(advance(printed), 'check_antenna');
  assert.equal(atAntenna.step, 'antenna');
  assert.equal(opt(atAntenna, 'send').available, true);
  assert.equal(opt(atAntenna, 'secure_cable').available, false);
  const sent = choose(atAntenna, 'send');
  assert.equal(sent.flags.sent, true);
  assert.equal(sent.flags.cable, false);
  assert.equal(advance(sent).step, 'done');
});

// --- QS-12 -----------------------------------------------------------------

test('QS-12 delayed shelter with the meal pack serves it and keeps warmth 2', () => {
  const atShelter = play(newRun(['mealPack']), 'save_power', 'adjust');
  assert.deepEqual(atShelter.res, { power: 4, water: 4, meals: 2, readyMeals: 1, warmth: 2, oxygen: 2, reserve: 1 });
  const preview = opt(atShelter, 'at_alert');
  assert.deepEqual(preview.delta, { readyMeals: -1 });
  assert.equal(preview.after.warmth, 2);

  const done = choose(atShelter, 'at_alert');
  assert.equal(done.res.warmth, 2);
  assert.equal(done.res.readyMeals, 0);
  assert.equal(done.res.meals, 2);
  assert.equal(done.res.power, 4);
  assert.equal(done.flags.shelter, 'alert');
  assert.deepEqual(done.last.notes, ['ready_meal_served']);
});

test('QS-12 delayed shelter without the meal pack uses a standard meal and reaches warmth 1', () => {
  const atShelter = play(newRun([]), 'save_power', 'adjust');
  const preview = opt(atShelter, 'at_alert');
  assert.deepEqual(preview.delta, { meals: -1, warmth: -1 });

  const done = choose(atShelter, 'at_alert');
  assert.equal(done.res.warmth, 1);
  assert.equal(done.res.meals, 1);
  assert.equal(done.res.readyMeals, 0);
  assert.equal(done.res.power, 4);
  assert.equal(done.phase, 'result', 'warmth 1 is safe');
  assert.equal(done.flags.shelter, 'alert');
  assert.deepEqual(done.last.notes, ['meal_prep_turn']);
});

test('early shelter uses a standard meal even when the meal pack is packed', () => {
  const done = choose(play(newRun(['mealPack']), 'save_power', 'adjust'), 'early');
  assert.equal(done.res.meals, 1);
  assert.equal(done.res.readyMeals, 1);
  assert.equal(done.res.warmth, 2);
  assert.equal(done.res.power, 3);
  assert.deepEqual(done.last.notes, []);

  // The later scheduled meal still takes the standard meal first, then the ready meal stays spare.
  const end = play(advance(done), 'restart', 'standard', 'sort');
  assert.equal(end.res.meals, 0);
  assert.equal(end.res.readyMeals, 1);
});

// --- extras ----------------------------------------------------------------

test('water entry cost is applied once and a repair retry returns to 3 bottles with the same loadout', () => {
  const atRepair = play(newRun(['kit', 'mealPack']), 'save_power', 'adjust', 'at_alert', 'restart');
  assert.equal(atRepair.step, 'repair');
  assert.equal(atRepair.res.water, 3);
  assert.equal(opt(atRepair, 'kit').available, true);

  const fixed = choose(atRepair, 'kit');
  assert.equal(fixed.res.water, 2);
  assert.equal(fixed.last.sequence.length, 1);

  const back = deepFreeze(retry(deepFreeze(fixed)));
  assert.equal(back.step, 'repair');
  assert.equal(back.phase, 'choose');
  assert.equal(back.res.water, 3, 'the entry bottle is not charged again');
  assert.equal(back.flags.recycler, false);
  assert.deepEqual(back.loadout, { battery: false, kit: true, mealPack: true });
  assert.deepEqual(back.res, atRepair.res);
  assert.deepEqual(back.history, atRepair.history);

  // Retrying later in the same crisis (plastic step) also lands on the 3-bottle checkpoint.
  const atPlastic = play(back, 'standard');
  assert.equal(atPlastic.step, 'plastic');
  assert.equal(atPlastic.res.water, 1);
  const backAgain = retry(deepFreeze(atPlastic));
  assert.equal(backAgain.step, 'repair');
  assert.equal(backAgain.res.water, 3);
  assert.equal(backAgain.loadout.kit, true);
  assert.equal(retry(deepFreeze(backAgain)).res.water, 3);
});

test('print is unavailable at 0 power and costs 1 power otherwise', () => {
  const broke = play(newRun([]), 'save_power', 'adjust', 'early', 'restart', 'standard');
  assert.equal(broke.step, 'plastic');
  assert.equal(broke.res.power, 0);
  const print = opt(broke, 'print');
  assert.equal(print.available, false);
  assert.deepEqual(print.reason, { need: 'power', amount: 1 });
  assert.equal(confirm(deepFreeze(broke), 'print'), broke);
  assert.equal(opt(broke, 'sort').available, true);

  const rich = play(newRun(['battery']), 'lights_on', 'adjust', 'early', 'restart', 'standard');
  assert.equal(rich.res.power, 1);
  assert.equal(opt(rich, 'print').available, true);
  assert.equal(choose(rich, 'print').res.power, 0);
});

test('power gates: lights need 2, early shelter needs 1', () => {
  const low = newRun([]);
  low.res.power = 1;
  assert.deepEqual(opt(low, 'lights_on').reason, { need: 'power', amount: 2 });
  assert.equal(opt(low, 'save_power').available, true);

  const shelter = play(newRun([]), 'save_power', 'adjust');
  const empty = structuredClone(shelter);
  empty.res.power = 0;
  assert.deepEqual(opt(empty, 'early').reason, { need: 'power', amount: 1 });
  assert.equal(opt(empty, 'at_alert').available, true);
});

test('checkpoints are captured on entering greenhouse, valve, oxygen and repair only', () => {
  const s0 = newRun([]);
  assert.equal(s0.checkpoint.step, 'greenhouse');
  const valve = play(s0, 'save_power');
  assert.equal(valve.checkpoint.step, 'valve');
  const shelter = play(valve, 'adjust');
  assert.equal(shelter.checkpoint.step, 'valve');
  const oxygen = play(shelter, 'early');
  assert.equal(oxygen.checkpoint.step, 'oxygen');
  assert.equal(oxygen.checkpoint.res.power, 3);
  const repair = play(oxygen, 'restart');
  assert.equal(repair.checkpoint.step, 'repair');
  const plastic = play(repair, 'standard');
  assert.equal(plastic.checkpoint.step, 'repair');
  const signal = play(plastic, 'sort');
  assert.equal(signal.checkpoint.step, 'repair');

  // Oxygen retry keeps the decisions committed before the snapshot.
  const used = choose(oxygen, 'reserve');
  const back = retry(deepFreeze(used));
  assert.equal(back.step, 'oxygen');
  assert.equal(back.res.reserve, 1);
  assert.equal(back.history.length, 3);
});
