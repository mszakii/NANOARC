// Qamar Square rules engine. Owner: Lane A.
// Implements specs/plan.md §5.1–§5.3 with the balance numbers of docs/PRD.md §3–§6.
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

/** The player's astronaut. Chosen before packing and kept for the whole run (and every checkpoint). */
export const AVATARS = ['girl', 'boy'];

/** Five levels, one cabinet each (Heat & Shelter and Water & Waste have two steps). */
export const LEVELS = 5;
const LEVEL_OF_STEP = { greenhouse: 1, valve: 2, shelter: 2, oxygen: 3, repair: 4, plastic: 4, signal: 5, antenna: 5, done: 5 };

/** Level number (1–5) for a step. */
export function levelOf(step) {
  return LEVEL_OF_STEP[step] ?? 1;
}

/**
 * True when Continue from this result leaves the current level (shown as "Next Level").
 * Pure: compares the level now with the level after advance().
 */
export function endsLevel(state) {
  if (!state || state.mode !== 'story' || state.phase !== 'result') return false;
  const next = advance(state);
  return next !== state && next.step !== 'done' && levelOf(next.step) !== levelOf(state.step);
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

const STORY_ORDER = ['greenhouse', 'valve', 'shelter', 'oxygen', 'repair', 'plastic', 'signal'];
const CHECKPOINT_STEPS = ['greenhouse', 'valve', 'oxygen', 'repair'];
const RES_KEYS = ['power', 'water', 'meals', 'readyMeals', 'warmth', 'oxygen', 'reserve'];

const needPower = (amount) => (s) => (s.res.power >= amount ? undefined : { need: 'power', amount });

/** A scheduled meal: a standard meal if one is in stock, otherwise the ready meal. */
function serveMeal(res) {
  if (res.meals > 0) res.meals -= 1;
  else if (res.readyMeals > 0) res.readyMeals -= 1;
}

function repairTurns(d, turns) {
  d.sequence = [];
  for (let i = 0; i < turns; i += 1) {
    d.res.water -= 1;
    d.sequence.push(structuredClone(d.res));
  }
  d.flags.recycler = true;
}

// Each rule: gate(state) -> undefined when available, otherwise the reason (object or null).
//            apply(draft, state) mutates the draft { res, flags, notes, sequence } only.
const RULES = {
  greenhouse: {
    lights_on: {
      gate: needPower(2),
      apply(d) {
        d.res.power -= 2;
        d.flags.lights = true;
        d.flags.crop += 1;
      },
    },
    save_power: {
      apply(d) {
        d.flags.lights = false;
      },
    },
  },
  valve: {
    adjust: {
      apply(d) {
        d.res.warmth = 2;
        d.flags.valve = true;
      },
    },
    leave: {
      apply(d) {
        d.res.warmth = 0;
      },
    },
  },
  shelter: {
    early: {
      gate: needPower(1),
      apply(d) {
        d.res.power -= 1;
        serveMeal(d.res);
        d.flags.shelter = 'early';
      },
    },
    at_alert: {
      apply(d) {
        if (d.res.readyMeals > 0) {
          d.res.readyMeals -= 1;
          d.notes.push('ready_meal_served');
        } else {
          if (d.res.meals > 0) d.res.meals -= 1;
          d.res.warmth = Math.max(0, d.res.warmth - 1);
          d.notes.push('meal_prep_turn');
        }
        d.flags.shelter = 'alert';
      },
    },
  },
  oxygen: {
    restart: {
      gate: needPower(3),
      apply(d, s) {
        d.res.power -= 3;
        d.flags.generator = true; // +1 oxygen made, −1 used: cabin oxygen stays where it was
        const savedPower = s.history.some((h) => h.step === 'greenhouse' && h.option === 'save_power');
        if (savedPower && s.res.power - 2 < 3) d.notes.push('saved_power_enabled_restart');
      },
    },
    reserve: {
      gate: (s) => (s.res.reserve >= 1 ? undefined : { need: 'reserve', amount: 1 }),
      apply(d) {
        d.res.reserve -= 1; // +1 oxygen from the reserve, −1 used: cabin oxygen stays where it was
      },
    },
  },
  repair: {
    standard: {
      turns: 2,
      gate: (s) => (s.res.water >= 3 ? undefined : { need: 'water', amount: 3 }),
      apply(d) {
        repairTurns(d, 2);
      },
    },
    kit: {
      turns: 1,
      gate: (s) => {
        if (!s.loadout.kit) return { need: 'kit' };
        return s.res.water >= 2 ? undefined : { need: 'water', amount: 2 };
      },
      apply(d) {
        repairTurns(d, 1);
      },
    },
  },
  plastic: {
    print: {
      gate: needPower(1),
      apply(d) {
        d.res.power -= 1;
        d.flags.clip = true;
        d.notes.push('clip_installed');
        serveMeal(d.res);
      },
    },
    sort: {
      apply(d) {
        serveMeal(d.res);
      },
    },
  },
  signal: {
    send_now: {
      apply(d) {
        d.flags.sent = true;
      },
    },
    check_antenna: {
      apply() {}, // advance() moves to the 'antenna' step
    },
  },
  antenna: {
    secure_cable: {
      gate: (s) => (!s.flags.clip && !s.flags.cable ? undefined : null), // nothing left to secure
      apply(d) {
        d.flags.cable = true;
      },
    },
    send: {
      gate: (s) => (s.flags.clip || s.flags.cable ? undefined : { need: 'cable' }),
      apply(d) {
        d.flags.sent = true;
      },
    },
  },
};

function diff(before, after) {
  const delta = {};
  for (const key of RES_KEYS) {
    const change = after[key] - before[key];
    if (change !== 0) delta[key] = change;
  }
  return delta;
}

/**
 * The single source of truth for preview and commit.
 * Returns null for an unknown option, otherwise the full projected outcome.
 */
function evaluate(state, optionId) {
  const stepRules = RULES[state.step];
  if (!stepRules || !Object.hasOwn(stepRules, optionId)) return null;
  const rule = stepRules[optionId];
  const blocked = rule.gate ? rule.gate(state) : undefined;
  const available = blocked === undefined;

  const draft = {
    res: structuredClone(state.res),
    flags: structuredClone(state.flags),
    notes: [],
    sequence: null,
  };
  rule.apply(draft, state);

  const recovery = draft.res.warmth <= 0 || draft.res.oxygen <= 0;
  if (draft.res.warmth <= 0 && !draft.notes.includes('too_cold')) draft.notes.push('too_cold');

  return {
    id: optionId,
    available,
    reason: available ? null : blocked,
    delta: diff(state.res, draft.res),
    turns: rule.turns,
    res: draft.res,
    flags: draft.flags,
    notes: draft.notes,
    sequence: draft.sequence,
    recovery,
  };
}

function snapshot(state) {
  const copy = structuredClone(state);
  copy.checkpoint = null;
  return copy;
}

function baseState(mode, step, loadout, avatar = 'girl') {
  const state = {
    mode,
    avatar: AVATARS.includes(avatar) ? avatar : 'girl',
    step,
    phase: 'choose',
    loadout,
    res: {
      power: 4 + (loadout.battery ? 3 : 0),
      water: 4,
      meals: 2,
      readyMeals: loadout.mealPack ? 1 : 0,
      warmth: 1,
      oxygen: 2,
      reserve: 1,
    },
    flags: {
      lights: false,
      crop: 0,
      valve: false,
      shelter: null,
      generator: false,
      recycler: false,
      clip: false,
      cable: false,
      sent: false,
      sunrise: false,
    },
    history: [],
    last: null,
    checkpoint: null,
  };
  return state;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** @param {string[]} ids @returns {object} state at step 'greenhouse', phase 'choose', checkpoint captured */
export function newRun(ids, avatar = 'girl') {
  const picked = Array.isArray(ids) ? ids : [];
  const state = baseState('story', 'greenhouse', {
    battery: picked.includes('battery'),
    kit: picked.includes('kit'),
    mealPack: picked.includes('mealPack'),
  }, avatar);
  state.checkpoint = snapshot(state);
  return state;
}

/** @param {boolean} withKit @returns {object} practice state: step 'repair', water 3 */
export function newPractice(withKit, avatar = 'girl') {
  const state = baseState('practice', 'repair', { battery: false, kit: Boolean(withKit), mealPack: false }, avatar);
  state.res.water = 3;
  state.checkpoint = snapshot(state);
  return state;
}

/** @returns {Array<{id:string, available:boolean, reason:null|{need:string, amount?:number}, delta:object, turns?:number, after:object}>} */
export function options(state) {
  const stepRules = RULES[state.step];
  if (!stepRules) return [];
  return Object.keys(stepRules).map((id) => {
    const out = evaluate(state, id);
    const option = {
      id,
      available: out.available,
      reason: out.reason,
      delta: out.delta,
      // An unavailable option cannot be confirmed, so its projection is the unchanged resources.
      after: out.available ? out.res : structuredClone(state.res),
    };
    if (out.turns !== undefined) option.turns = out.turns;
    return option;
  });
}

/** Applies a decision once. Returns the same reference when nothing may change. */
export function confirm(state, optionId) {
  if (state.phase !== 'choose') return state;
  const out = evaluate(state, optionId);
  if (!out || !out.available) return state;

  const next = structuredClone(state);
  next.res = out.res;
  next.flags = out.flags;
  next.history.push({ step: state.step, option: optionId });
  next.last = {
    step: state.step,
    option: optionId,
    delta: out.delta,
    before: structuredClone(state.res),
    after: structuredClone(out.res),
    sequence: out.sequence,
    notes: out.notes,
  };
  next.phase = out.recovery ? 'recovery' : 'result';
  return next;
}

/** Moves from a result to the next step. Returns the same reference unless phase === 'result'. */
export function advance(state) {
  if (state.phase !== 'result') return state;

  let step;
  if (state.flags.sent || state.step === 'done') step = 'done';
  else if (state.mode === 'practice') step = 'done';
  else if (state.step === 'signal' || state.step === 'antenna') step = 'antenna';
  else step = STORY_ORDER[STORY_ORDER.indexOf(state.step) + 1] ?? 'done';

  const next = structuredClone(state);
  next.step = step;
  next.phase = 'choose';
  if (step === 'repair') next.res.water = Math.max(0, next.res.water - 1); // used once, before the checkpoint
  if (step === 'signal') next.flags.sunrise = true;
  if (CHECKPOINT_STEPS.includes(step)) next.checkpoint = snapshot(next);
  return next;
}

/** Restores the crisis checkpoint. */
export function retry(state) {
  if (!state.checkpoint) return state;
  const next = structuredClone(state.checkpoint);
  next.phase = 'choose';
  next.checkpoint = structuredClone(state.checkpoint);
  return next;
}
