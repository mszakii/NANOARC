# Qamar Square — Plan (3-hour build)

Read `specs/constitution.md` first. Game rules and numbers live in `docs/PRD.md` §3–§6. Science copy and links live in `docs/Science_Evidence.md`.

## 1. What we are building

An English, single-player 2D browser game for ages 7–12. The player packs with 10,000 Mission Credits, then keeps a moon-base crew safe through four connected crises until sunrise, and sends a signal. Last line: **"Signal sent. Waiting for confirmation."**

One data-driven step engine serves both the story and Water Training. Out of scope: video, notebook clip, Knowledge Meal, brine content, persistence, deployment.

## 2. Stack

Vanilla JS modules + HTML + CSS + inline SVG. Vite 8.3.8 (only dev dependency), Node 24, `node --test`. `base: './'` so `dist/` runs from any static host. Scripts: `npm run dev`, `npm test`, `npm run build`, `npm run preview`. System fonts only.

## 3. The Toca-style concept, concretely

- **One cutaway moon base** (SVG, viewBox 1200×900). Roof with antenna and solar panels under a starry sky with Earth. Upper floor: Greenhouse | Crew Quarters (shelter corner + supply bags). Lower floor: Power Room (battery + heat valve) | Life Support (oxygen generator + reserve tank) | Water Workshop (recycler + 3D printer).
- **Touch the thing.** Chunky rounded devices are real `<button>` hotspots positioned in % over the SVG. The active device wiggles and glows. A labelled "Go to …" shortcut in the tray does the same thing.
- **The crew lives in the base.** Both astronauts stand in the active room and slide to the next one. A talking portrait (happy / worried / surprised / determined) speaks one short line per beat.
- **The base reacts.** Greenhouse lamps and sprout stage, heat-loss arrow size, generator spinning, bottles draining one turn at a time, clip on the antenna cable, then the whole base relighting at sunrise.
- **Free-play touches.** Non-active objects (bunk, window, plant, rover, Earth) give a harmless bounce when tapped. View-only, never touches state.
- **Phone "camera".** On narrow screens the scene zooms to the active room (one CSS transform) with the tray underneath. Laptop shows the whole base beside the tray.
- **Shelter bag** is tap bag → tap marked spot. No drag-and-drop.

## 4. File ownership

| Lane | Files |
|---|---|
| Lead | `package.json`, `vite.config.js`, `index.html`, `src/styles/tokens.css`, `specs/*`, `CLAUDE.md`, `README.md`, `docs/BUILD_STATUS.md` |
| A · Engine | `src/game/rules.js`, `tests/rules.test.js` |
| B · Scene | `src/ui/scene.js`, `src/styles/scene.css`, `tools/crop_crew.py`, `public/assets/crew/*.webp` |
| C · Shell | `src/main.js`, `src/ui/hud.js`, `src/ui/panel.js`, `src/ui/screens.js`, `src/ui/science.js`, `src/data/content.js`, `src/styles/ui.css` |

Never edit a file outside your lane. If you need a change there, report it to the lead.

## 5. Contract (frozen)

### 5.1 State

Plain JSON. Clone with `structuredClone`. Never mutate a state you were given.

```js
{
  mode: 'story' | 'practice',
  step: 'greenhouse' | 'valve' | 'shelter' | 'oxygen' | 'repair' | 'plastic' | 'signal' | 'antenna' | 'done',
  phase: 'choose' | 'result' | 'recovery',
  loadout: { battery: bool, kit: bool, mealPack: bool },
  res: { power, water, meals, readyMeals, warmth, oxygen, reserve },
  flags: { lights: false, crop: 0, valve: false, shelter: null /* 'early' | 'alert' */, generator: false,
           recycler: false, clip: false, cable: false, sent: false, sunrise: false },
  history: [{ step, option }],          // confirmed decisions, in order
  last: null | { step, option, delta, before, after, sequence, notes },
  checkpoint: null | snapshot           // state at crisis entry, without its own checkpoint
}
```

Start values (story): power 4 (+3 with battery), water 4, meals 2, readyMeals 0 (+1 with mealPack), warmth 1, oxygen 2, reserve 1.

### 5.2 Rules API — `src/game/rules.js` (pure, no DOM)

```js
export const BUDGET = 10000;
export const ITEMS = { battery: { cost: 5000 }, kit: { cost: 5400 }, mealPack: { cost: 300 } };
export function loadoutTotal(ids)            // ids: string[] of ITEMS keys -> number
export function canLaunch(ids)               // -> { ok, total, remaining }
export function newRun(ids, avatar = 'girl') // -> state at step 'greenhouse', phase 'choose', checkpoint captured; state.avatar
export function newPractice(withKit)         // -> mode 'practice', step 'repair', phase 'choose', water 3, checkpoint captured
export function options(state)               // -> Option[] for state.step ([] when step is 'done'); never mutates
export function confirm(state, optionId)     // -> new state; returns the SAME reference if phase !== 'choose',
                                             //    the option is unknown, or it is unavailable
export function advance(state)               // -> next step (phase 'choose'); same reference unless phase === 'result'
export function retry(state)                 // -> clone of checkpoint (phase 'choose', same checkpoint kept)
```

`Option = { id, available, reason, delta, turns, after }`
- `reason`: `null` or `{ need: 'power' | 'kit' | 'reserve' | 'water' | 'cable', amount?: number }`
- `delta`: signed changes of `res` keys, e.g. `{ power: -2 }`. Same shape as `last.delta`.
- `turns`: number (repair only, else `undefined`).
- `after`: the full projected `res` if confirmed. This is the preview.

`last.sequence`: array of `res` snapshots, one per repair turn (standard: 2 entries, kit: 1). `null` for other steps.
`last.notes`: string codes: `'ready_meal_served'`, `'meal_prep_turn'`, `'saved_power_enabled_restart'`, `'clip_installed'`, `'too_cold'`.

### 5.3 Steps and effects

| Step | Option | Available when | Effect |
|---|---|---|---|
| greenhouse | `lights_on` | power ≥ 2 | power −2, `lights = true`, `crop + 1` |
| greenhouse | `save_power` | always | `lights = false` |
| valve | `adjust` | always | warmth = 2, `valve = true` |
| valve | `leave` | always | warmth = 0, note `too_cold`, **phase → 'recovery'** |
| shelter | `early` | power ≥ 1 | power −1, one standard meal −1, `shelter = 'early'` |
| shelter | `at_alert` | always | readyMeals > 0 → readyMeals −1, note `ready_meal_served`. Else meals −1, warmth −1, note `meal_prep_turn`. `shelter = 'alert'` |
| oxygen | `restart` | power ≥ 3 | power −3, `generator = true`, oxygen stays 2 (+1 made, −1 used). Note `saved_power_enabled_restart` when history has `greenhouse:save_power` and power before − 2 < 3 |
| oxygen | `reserve` | reserve ≥ 1 | reserve −1, oxygen stays 2, generator stays off |
| repair | `standard` | water ≥ 3 | 2 turns, water −2, `recycler = true`, sequence of 2 |
| repair | `kit` | `loadout.kit` and water ≥ 2 | 1 turn, water −1, `recycler = true`, sequence of 1 |
| plastic | `print` | power ≥ 1 | power −1, `clip = true`, note `clip_installed`, one meal −1 |
| plastic | `sort` | always | one meal −1 |
| signal | `send_now` | always | `sent = true` |
| signal | `check_antenna` | always | goes to step `antenna` |
| antenna | `secure_cable` | not clip and not cable | `cable = true`, stays on `antenna` |
| antenna | `send` | clip or cable | `sent = true` |

Meal rule: a scheduled meal uses a standard meal if one is in stock, otherwise the ready meal. Exception: `at_alert` prefers the ready meal.

`advance` order: greenhouse → valve → shelter → oxygen → repair → plastic → signal → (antenna) → done.
- Entering `repair` in story mode: water −1 first, then capture checkpoint.
- Entering `signal`: `sunrise = true`.
- `signal` + `check_antenna` → `antenna`. `antenna` + `secure_cable` → `antenna` again. Any step with `sent` → `done`.
- Practice mode: `repair` → `done`.
- Checkpoints are captured on entering greenhouse (in `newRun`), valve, oxygen and repair.

### 5.4 Scene API — `src/ui/scene.js`

```js
export const DEVICE_FOR_STEP = { greenhouse: 'greenhouse', valve: 'valve', shelter: 'shelter', oxygen: 'oxygen',
                                 repair: 'recycler', plastic: 'printer', signal: 'antenna', antenna: 'antenna' };
export function mountScene(root, { onDevice })   // build SVG + hotspot buttons inside root, once
export function updateScene(state, view)         // state may be null (start / loadout screens)
```

- `onDevice(id)` fires for device ids (`greenhouse, valve, shelter, oxygen, recycler, printer, antenna`) and for `bag` and `bag-spot`. Toy bounces are handled inside the scene.
- `view = { screen: 'start' | 'loadout' | 'play' | 'end', open: boolean, selected: optionId | null, bagStage: 0 | 1 | 2, seq: number | null }`
  - `open`: the player has opened the active device (its options are showing). The active device wiggles while `open` is false.
  - `bagStage`: 0 bag on shelf, 1 bag picked up, 2 bag placed at the shelter spot. The bag step runs while `step === 'shelter'` and `phase === 'result'`: at stage 0 the `bag` hotspot is active, at stage 1 the `bag-spot` hotspot is active.
- Only the active hotspot calls `onDevice` and is in the tab order. Every other hotspot is `tabindex="-1"` and only bounces.
  - `seq`: index into `state.last.sequence` being shown during the repair result, `null` when not animating.
- The scene derives everything else (active device, crew room, mood, lamps, arrows, sunrise) from `state`.

### 5.5 Crew assets — `public/assets/crew/`

`girl-happy.webp`, `girl-surprised.webp`, `girl-worried.webp`, `girl-determined.webp`, `girl-body.webp` and the same five for `boy-`. Portraits are square with a transparent background outside the round helmet. Reference them as `./assets/crew/<name>.webp`.

### 5.6 Shell — `src/main.js`

Holds `state` and `view`, one `dispatch(action)`, one `render()`, event delegation on `data-action`. Drives the repair sequence with a cancellable timer (cancel on retry and restart). Imports `tokens.css`, `scene.css`, `ui.css`.

Layout: laptop shows the scene beside the tray. Portrait phone shows the scene on top and the tray underneath. No horizontal scroll at 360 px.

## 6. Timeline and gates

| Clock | Work | Gate |
|---|---|---|
| 0:00–0:15 | T0 | Dev server shows a page, `npm test` runs, contract committed |
| 0:15–1:10 | T1, T2, T3 in parallel | Each lane demo-able alone |
| 1:10–1:40 | T4 | **Gate 1:** no-purchase run reaches "Signal sent. Waiting for confirmation." in the browser |
| 1:40–2:35 | T5, T6, T7 in parallel | Merged only if Gate 1 still passes |
| 2:35–3:00 | T8 | **Gate 2:** production build verified on laptop and phone viewport |

## 7. Cut order (drop from the top when behind)

1. Synth sounds (stretch)
2. Free-play bounces
3. Phone camera zoom (the shortcut button remains)
4. Water Training mode
5. Science cards other than ISS and DONKI
6. Full-body crew sprites (portraits + simple SVG suit remain)

Never cut: story loop, preview / confirm-once, heat recovery + retry, ISS 70 / 85 comparison, phone readability.

## 8. Risks

- Keying the cream paper background off the full-body sprites may look rough. Fallback: round helmet portraits on a simple SVG suit. Timebox 15 minutes.
- Integration drift between lanes. The contract above is frozen and lanes code against it.
- The project path contains `~` and spaces. Always quote paths and run npm from the project root.

## 9. Verification

1. `npm test` — rule suite green (QS-01, 02, 03, 05, 06, 07, 10, 12).
2. `npm run build` then `npm run preview`, open in a browser.
3. Laptop 1366×768, keyboard only: base-supplies run to the final line (QS-07, QS-09).
4. Phone 375×812, touch: loadout → first decision readable without horizontal scroll (QS-09).
5. Manual branches: both major items blocked (QS-01), double-press Confirm (QS-02), leave valve → recovery → retry (QS-06), greenhouse choice flips restart availability (QS-05), delayed shelter with / without meal pack (QS-12), both signal branches with / without clip (QS-10), ISS 70 / 85 with unchanged water (QS-04), Water Training both paths (QS-03).
6. Record in `docs/BUILD_STATUS.md` exactly which checks ran in emulation. The real-phone check is the team's, via `npm run preview -- --host`.
