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

## Standing workflow (lead session)

- Own the approved build through completion. Use `specs/tasks.md` and `docs/BUILD_STATUS.md` to find the next in-scope task. After each milestone passes, continue to the next task without asking for confirmation. Send brief progress updates and keep working after each one.
- While parallel lanes run, do independent prep (review the contract and acceptance checks). When they finish, inspect their work and integrate.
- Failed builds and tests are work to resolve: diagnose, fix in-scope regressions, rerun the affected checks. Use the placeholder crew names and approved fallbacks for unavailable optional assets.
- Verify in the browser: a no-purchase run through all four crises to sunrise and "Signal sent. Waiting for confirmation.", both Water Training repair paths, the ISS comparison, laptop and mobile checks. Run `npm test` and `npm run build` after integration. Record which device checks were real, emulated or pending.
- If one task is blocked, continue independent work. Ask the user only when progress needs their input, access or a required approval. If time runs out, leave the best verified playable build and record the exact next action in `docs/BUILD_STATUS.md`.
- Finish when the judging build is verified as far as the environment allows. Update `docs/BUILD_STATUS.md` and report the run commands or preview, the checks run, and anything pending.
