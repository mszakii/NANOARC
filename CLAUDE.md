# Qamar Square

A 3-hour NASA Space Apps build: a 2D moon-base game for ages 7–12. Vanilla JS + Vite, no runtime dependencies.

Before you change anything:

1. Read `specs/constitution.md` (10 rules, they win over everything).
2. Read `specs/plan.md` §4 (file ownership) and §5 (the frozen contract).
3. Find your task in `specs/tasks.md`. Only the lead edits that file.

Rules that bite most often:

- Touch only your lane's files. Need a change elsewhere? Report it, do not edit.
- Game numbers and labels come from `docs/PRD.md`. Science copy and links come from `docs/Science_Evidence.md`.
- `src/game/` is pure: no DOM, no timers.
- No new dependencies. No network calls at runtime. No deprecated APIs.
- Every interactive thing is a real `<button>`, 44 px or larger, keyboard reachable.
- The project path has `~` and spaces. Quote paths. Run npm from the project root.

Commands: `npm run dev` · `npm test` · `npm run build` · `npm run preview`
