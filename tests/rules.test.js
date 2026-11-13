// Rule checks. Owner: Lane A. Run with `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BUDGET, canLaunch, loadoutTotal } from '../src/game/rules.js';

test('QS-01 both major items exceed the budget', () => {
  assert.equal(BUDGET, 10000);
  assert.equal(loadoutTotal(['battery', 'kit']), 10400);
  assert.equal(canLaunch(['battery', 'kit']).ok, false);
  assert.equal(canLaunch(['kit', 'mealPack']).ok, true);
  assert.equal(canLaunch([]).ok, true);
});
