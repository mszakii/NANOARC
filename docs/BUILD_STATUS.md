# Qamar Square — Build status

**Milestone** — T4 integration in progress (paused: usage limit reached)
**Latest working revision** — `a7a39b5` T3 shell, plus uncommitted copy additions in `src/data/content.js` and the Scene lane's work in `src/ui/scene.js` / `src/styles/scene.css` / `scene-preview.html`.

## Done
- T0 scaffold, T1 rules engine (`npm test` 24/24), T3 shell.
- Shell lane reported (browser pane, emulated, not re-checked by the lead): full no-purchase run to "Signal sent. Waiting for confirmation." by mouse and keyboard; 10,400 blocked; valve recovery + retry; double Confirm spends once; meal-pack shelter; check-antenna → secure-cable → send; no horizontal scroll at 360/375 px.
- `npm run build` green at `a7a39b5`.

## Not done — exact next actions
1. **Scene lane (T2):** confirm it finished; `npm run build`; review `scene.js` / `scene.css`; commit.
2. **T6 Water Training:** copy is ready in `content.js` (`UI.training*`, `trainBoth`, `backToStart`, repair `say` for practice). Still to wire: a Water Training button in `renderStart` → a `training` screen with two buttons → `rules.newPractice(withKit)`; in practice, replace Continue after the repair with Try Both Repair Paths / Compare ISS Recovery / Back to Start.
3. **T5 ISS comparison:** copy is ready (`SCIENCE.iss`, `SCIENCE_UI.iss*`). Still to wire: in `science.js`, when `topic.compare` is set, render 70% / 85% toggle buttons and a 20-drop grid (14 / 17 → Further Treatment); add a Compare ISS Recovery button to the repair tray (`panel.js`) that calls `openScience('iss')`.
4. **End-card summary:** `summaryLines(state)` exists in `content.js`; render it in `renderEnd` under `UI.summaryTitle`.
5. Verify the production build (`npm run build`, `npm run preview`) on desktop and the mobile preset; record results here; commit.

## Video slots (fallback = still + text, gameplay never waits)
| Clip | Where it goes | Current fallback |
|---|---|---|
| Intro | Start screen, above **Start Mission** (`renderStart` in `src/ui/screens.js`) | To build: crew portraits + `UI.introLine` |
| Notebook | Water & Waste repair step, **Open Notebook** button → science dialog topic `notebook` (`still: 'notebook'` in `content.js`) | Text + source link ready; still image to wire |
| Knowledge Meal | After the end card | Optional, not built |

Put clips in `public/assets/video/` with English captions (`.vtt`).
