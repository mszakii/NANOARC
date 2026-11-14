# Qamar Square

> Pack for the Moon. Make tough choices. Keep your crew safe until sunrise.

A 2D browser game for junior mission commanders aged 7–12, built for the NASA Space Apps challenge. The player packs with 10,000 Mission Credits, then keeps a moon-base crew safe through four connected crises (Power & Food, Heat & Shelter, Oxygen, Water & Waste) until sunrise.

## Run it

Needs Node.js 24 or newer.

```bash
npm install
```

```bash
npm run dev
```

```bash
npm test
```

```bash
npm run build
```

```bash
npm run preview
```

`npm run build` writes a static site to `dist/`. It has no server, account, database or API key, and runs from any static host or subfolder.

The start screen also offers **Water Training**: try standard tools and the repair kit from the same 3-bottle checkpoint. **Compare ISS Recovery** opens a historical 20-drop illustration without changing mission supplies. The ending summarises the decisions made in that run and leaves signal confirmation pending.

See `docs/BUILD_STATUS.md` for completed checks, `docs/MANUAL_CHECKS.md` for the remaining physical-phone checklist, and `docs/DEMO.md` for a short judging route. Reduced-motion runtime and emulated touch have passed. Videos are optional; the intro and notebook have text fallbacks.

## How the project is organised

| Path | What is in it |
|---|---|
| `specs/constitution.md` | The ten rules every change must follow. |
| `specs/plan.md` | Architecture, the frozen contract between modules, timeline and cut order. |
| `specs/tasks.md` | The task tracker (one owner per task and per file). |
| `docs/PRD.md` | Approved game rules, numbers and acceptance checks QS-01…QS-12. |
| `docs/Science_Evidence.md` | Science claims, how the game uses them, and NASA source links. |
| `src/game/rules.js` | The pure rules engine. No DOM. Covered by `tests/rules.test.js`. |
| `src/ui/scene.js` | The moon-base scene (SVG + real buttons). |
| `src/main.js`, `src/ui/*`, `src/data/content.js` | The shell: screens, HUD, decision tray, science panel, all copy. |
| `tools/crop_crew.py` | One-off script that cuts crew sprites from the character sheets. |

## Science and game values

Historical figures (ISS 70 % / 85 % urine-processor recovery, the 11 May 2024 solar particle event seen by STEREO-A, the ≈1.3-second Earth–Moon signal delay) come from NASA sources linked inside the game. Power units, bottles, meals, turns and credits are teaching values for game balance.
