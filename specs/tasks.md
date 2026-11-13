# Qamar Square — Tasks

Only the lead edits this file. Lanes report back; the lead ticks the box.
Status: `[ ]` open · `[~]` in progress · `[x]` done · `[-]` cut.

Lanes and their files are in `specs/plan.md` §4. The contract is in §5.

## Phase 0 — 0:00–0:15

- [x] **T0 · Lead · Bootstrap and contract.** `git init`, npm project, pin Vite 8.3.8, `npm audit`, folders, `index.html`, tokens, contract stubs for `rules.js` / `scene.js` / `main.js`, specs, `CLAUDE.md`.
  **Done when:** `npm run dev` serves, `npm test` runs, first commit.

## Phase 1 — 0:15–1:10 (parallel, depends on T0)

- [x] **T1 · Lane A · Rules engine and tests.** Implement `specs/plan.md` §5.1–§5.3 in `src/game/rules.js` and a `node --test` suite.
  **Done when:** tests cover QS-01, 02, 03, 05, 06, 07, 10, 12 and the PRD base-supplies walkthrough, all green.
- [~] **T2 · Lane B · Moon-base scene and crew sprites.** SVG base, hotspot buttons, device state styles driven by `data-*`, crop crew sprites to WebP, crew placement per active room.
  **Done when:** scene renders, every device state toggles from `updateScene`, crew assets total < 400 KB.
- [x] **T3 · Lane C · Shell.** `main.js` store, start + loadout screens, pictorial HUD, decision tray (select → preview → Confirm Choice → result → Continue), recovery card, end card, all copy in `content.js`.
  **Done when:** loadout blocks 10,400; the full story is drivable by keyboard and tap.

## Phase 2 — 1:10–1:40

- [ ] **T4 · Lead · Integrate.** Wire the lanes, fix seams, shelter bag tap-tap, repair turn sequence, restart confirm.
  **Gate 1:** a no-purchase run reaches "Signal sent. Waiting for confirmation." in the browser. Commit.

## Phase 3 — 1:40–2:35 (parallel, depends on T4)

- [ ] **T5 · Lane C · Science.** Native `<dialog>`: ISS 20-drop comparison (14 / 17 → Further Treatment), DONKI card, short cards for plants, heat, oxygen, plastic, signal, each with a source link. End card sentences built from `history`.
  **Done when:** QS-04 passes; focus returns to the tray on close.
- [ ] **T6 · Lane C · Water Training.** Entry on the start screen, "Try Both Repair Paths" from the fixed 3-bottle checkpoint.
  **Done when:** QS-03 passes in the browser; story state untouched.
- [ ] **T7 · Lane B · Toy feel.** Crew expressions per phase, device wiggle, sunrise relight, free-play bounces, phone camera zoom, reduced-motion pass.
  **Done when:** reviewed at 375×812 and 1366×768.

## Phase 4 — 2:35–3:00

- [ ] **T8 · Lead · Freeze and verify.** `npm test`, `npm run build`, `npm run preview`, QS matrix on laptop + phone viewport + keyboard-only, `README.md`, `docs/BUILD_STATUS.md`, 90-second demo script, final commit.
  **Gate 2:** production build verified.

## Stretch (only if T8 is green early)

- [ ] **S1** Tiny WebAudio blips with a mute button.
