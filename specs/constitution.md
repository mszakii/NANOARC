# Qamar Square — Constitution

Ten rules. They win over every other document. If a task cannot be done without breaking one, stop and tell the lead.

Precedence when sources disagree: this file → `docs/PRD.md` (numbers, copy rules, QS checks) → `specs/plan.md` → `docs/ADR-001.md` → playbook / master prompt (their 4-hour schedule is superseded).

1. **Loop before polish.** Start → Sunrise is playable before any polish task starts. Every gate ends with a passing `npm test` and `npm run build`.
2. **PRD numbers are law.** Balance, costs, labels and QS-01…QS-12 come from `docs/PRD.md`. Out of scope for this build: QS-08 (video) and QS-11 (Knowledge Meal).
3. **Rules are pure.** `src/game/` has no DOM, no timers, no randomness. Preview and confirm come from the same function. Confirm applies once; a second confirm is a no-op.
4. **Zero runtime dependencies.** One dev dependency: `vite@8.3.8` (exact pin). No framework, CDN, web font or network call at runtime.
5. **Current platform only.** ES modules, native `<dialog>`, CSS nesting / `:has()` / container queries, `structuredClone`, View Transitions behind a feature check. No deprecated APIs (`keyCode`, `execCommand`, unload handlers, vendor-prefix hacks).
6. **Toy-first.** One open cutaway base. Every decision starts by touching a thing in the scene, and every confirm changes something visible in the scene plus one short sentence. No timers, scores, streaks or punishment: an unsafe result is a friendly recovery and retry.
7. **Original work.** Toca Boca is a reference for the *concept* only (open dollhouse, direct touch, playful reactions). No assets, characters, names, UI layout or sounds from it. Art is the team's character sheets plus our own SVG.
8. **Real buttons.** Every interactive thing is a `<button>` at least 44 px, works by tap, mouse and keyboard with visible focus. State is never colour-only. `prefers-reduced-motion` is honoured.
9. **Science honesty.** Historical values (70 % / 85 %, 14 / 17 of 20 drops, DONKI 2024-05-11 STEREO-A, ≈1.3 s) carry a source link and the word "historical"; game units are labelled teaching values. Science panels never change mission state.
10. **Cut, don't slip.** One owner per file. The contract in `specs/plan.md` changes only through the lead. Feature freeze at 2:35. Follow the cut order. Report only checks actually run.
