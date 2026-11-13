// Qamar Square rules engine. Owner: Lane A.
// CONTRACT STUB — implement exactly as specified in specs/plan.md §5.1–§5.3.
// Pure functions only: no DOM, no timers, no randomness. Never mutate a state you were given.

export const BUDGET = 10000;

export const ITEMS = {
  battery: { cost: 5000 },
  kit: { cost: 5400 },
  mealPack: { cost: 300 },
};

/** @param {string[]} ids keys of ITEMS @returns {number} */
export function loadoutTotal(ids) {
  return ids.reduce((sum, id) => sum + (ITEMS[id]?.cost ?? 0), 0);
}

/** @param {string[]} ids @returns {{ ok: boolean, total: number, remaining: number }} */
export function canLaunch(ids) {
  const total = loadoutTotal(ids);
  return { ok: total <= BUDGET, total, remaining: BUDGET - total };
}

/** @param {string[]} ids @returns {object} state at step 'greenhouse', phase 'choose', checkpoint captured */
export function newRun(ids) {
  throw new Error('rules.newRun: not implemented yet (Lane A, T1)');
}

/** @param {boolean} withKit @returns {object} practice state: step 'repair', water 3 */
export function newPractice(withKit) {
  throw new Error('rules.newPractice: not implemented yet (Lane A, T1)');
}

/** @returns {Array<{id:string, available:boolean, reason:null|{need:string, amount?:number}, delta:object, turns?:number, after:object}>} */
export function options(state) {
  throw new Error('rules.options: not implemented yet (Lane A, T1)');
}

/** Applies a decision once. Returns the same reference when nothing may change. */
export function confirm(state, optionId) {
  throw new Error('rules.confirm: not implemented yet (Lane A, T1)');
}

/** Moves from a result to the next step. Returns the same reference unless phase === 'result'. */
export function advance(state) {
  throw new Error('rules.advance: not implemented yet (Lane A, T1)');
}

/** Restores the crisis checkpoint. */
export function retry(state) {
  throw new Error('rules.retry: not implemented yet (Lane A, T1)');
}
