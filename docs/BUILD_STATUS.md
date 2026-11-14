# Qamar Square — Build status

**Updated:** 14 November 2026 (Africa/Cairo).
**Milestone:** Notebook experiment (Test the Membrane) and muted-by-default sound effects added on top of the UI pass, verified in this environment. Physical-phone checks remain Ahmed's (see `docs/MANUAL_CHECKS.md`).
**Latest working revision:** `9bb1e42` (sound) on top of `ab3d252` (Notebook), plus the status commit after them. Earlier UI pass: `1590f9c`, `7d45ff1`, `85e9fb2`, `105cf54`. All commits are local; nothing was pushed.
**Integration history:** the scene, scene CSS, ten crew WebPs, crop script and scene preview were committed in `8396e18`; integration in `e51c098`; favicon and reduced-motion record in `8b4fa53`; phone checklist in `3050d01`. No earlier work was discarded.

## Notebook and sound (14 Nov)

**Before this batch:** Water & Waste had an **Open Notebook** button that opened a text-only dialog with the Khumalo et al. link. A `still` field was declared but never rendered; there was no interaction. There was no audio.

| Commit | What changed |
|---|---|
| `ab3d252` | **Test the Membrane** (`src/ui/membrane.js`): inside the Notebook, the player presses **Start the Test**, sees vapor dots cross the membrane's tiny holes and drops form on the cool side, then **Collect the Test Sample** into a cup labelled **TEST SAMPLE**. Three numbered steps, a live status line, a simple SVG and text (no video needed). Framed as a *lab research example* of membrane distillation, links the Khumalo et al. (2019) study, says it is not drinking water and not to scale. Its own state, reset on open and close; it cannot reach mission state. The ISS 70%/85% comparison stays in **Compare ISS Recovery**. Also adds `src/ui/sound.js` and 4 unit tests (31 total). |
| `9bb1e42` | **Sound effects**: synthesized with Web Audio, no files, no music, melodies or loops. UI click, heat-valve ratchet, water drop (one per repair turn, and condensation in the Notebook), antenna relay on Send. Starts muted; **Sound Effects: Off / On** button (`aria-pressed`) in the tray header (under the panel on phones; at the bottom of start, packing and ending). A sound plays only from an action that changed the game, once, with a 90 ms per-sound throttle; re-renders play nothing. No Web Audio → label reads "Sound Effects: not available" and the game is unchanged. **Fix found during audio testing:** a fast triple click on Confirm also pressed Continue in the same place; the main tray button now ignores a second activation within 300 ms. |

### Checks actually run (production preview, headless Chrome via CDP — emulated)

| Check | Result |
|---|---|
| `npm test` | **31/31 pass** (adds Notebook citation and framing, stage logic incl. repeated Start, no mission-state change after a full experiment, sound muted/no-throw without Web Audio) |
| `npm run build` | Pass |
| Notebook, 1366×768 and 375×812, keyboard Enter | ready → running (second Enter ignored) → done (focus moves to Collect) → collected; status and badge text correct; DOI link present; Esc closes, focus returns to **Open Notebook**; **drinking water 2 before and after** |
| Notebook, 375×812 reduced motion | Start shows the condensed result at once; collect and close work; water unchanged |
| Audio, 1366×768 and 375×812, real mouse events | Starts **Off**; muted clicks log nothing; turning On (user gesture) plays one click; Confirm clicked **3× fast → one `valve` sound, one warmth change**; Science open/close → no sound; standard repair → `drop`, `drop`; Send Now → `relay`; Off again → silent; story ends on the final line |
| No Web Audio (AudioContext removed before load), keyboard only | Toggle reads "Sound Effects: not available"; full story to **"Signal sent. Waiting for confirmation."** |
| Keyboard-only story | Ends on the final line; Shift+Tab ×4 reaches the marked device, Enter opens its choices |
| Touch (emulated), Water Training + ISS | Kit 3 → 2 in 1 turn; standard 3 → 1 in 2 turns; ISS 14/20 and 17/20 with NASA source; water unchanged |
| Fit journey | 1366×768 and 1920×1080 fit at every step; 375×812 panel visible at every step except Water & Waste preview (7 px) |

Audio checks confirm which effects started (the page's `__qsSfx` log); headless Chrome has no speakers, so **how they sound was not heard** — Ahmed's phone check below.

### Fix: sound effects were inaudible (reported 14 Nov)

**Cause:** the effects did play, but far too quietly. Measured offline through the real synth chain (`measureSound()` in `src/ui/sound.js`, rendered with `OfflineAudioContext`): click peak **−40 dBFS**, relay −30, valve −28, drop −23. Narrow band-pass filters (Q 3–7) on the noise removed most of the energy, and low gains followed. The audio engine itself was fine.

**Fix:** wider filters, a short tonal body under each tick, master gain 0.9 into a limiter (threshold −6 dB) so overlaps cannot clip. New peaks: **click −15.3 dBFS** (still the quietest), drop −9.2, relay −6.7, valve −6.4; RMS −22 to −32 dB. Durations 41–576 ms, still no music or loops.

**Re-checked:** headless Chrome with `--autoplay-policy=user-gesture-required` (the normal browser rule): after a real click on **Sound Effects: Off**, the engine state is **running**, one click logs; Confirm ×3 → one `valve`; repair → two `drop`; Send Now → one `relay`; muting suspends the engine; story ends on the final line. Same at 375×812. `npm test` 31/31, `npm run build` pass.

To re-measure levels: run `npm run dev`, open the game, and in the browser console run `const m = await import('/src/ui/sound.js'); for (const n of m.SOUND_NAMES) console.log(await m.measureSound(n));`.

## UI pass (14 Nov) — fit, marker, icons, motion

| Commit | What changed |
|---|---|
| `1590f9c` | Decision screen fits the viewport: compact HUD, fixed decision foot (status slot + primary action keep their place), Science button in the panel head, water extras outside the choice state, short phone HUD labels (full labels stay for screen readers). One local inline-SVG icon set (`src/ui/icons.js`) replaces every emoji in start, packing, HUD, choices, previews, science, recovery and ending. New `src/styles/fit.css`. QA script `tools/qa-shots.mjs` and before screenshots in `docs/qa/`. |
| `7d45ff1` | Active device: wide glow replaced by a two-ring outline on the device, a **Tap** pointer with a tail anchored to it, and an ink label. Finished devices get a teal label with a check. The speaking crew member walks to a free spot beside the active device; the partner waits in another room; both go to the roof at sunrise. A short note (for example **Warmth 1 → 2**) pins the change above the device used. Phones show only active and finished labels; Restart moves under the panel on phones. Valve hotspot tightened to the valve. |
| `85e9fb2` | Motion tied to decisions: the speaker sways while a crisis is undecided, hops after a good result, shivers on recovery; the used device pops; valve turn and heat-arrow shrink unchanged. Device keyboard focus is a teal dashed outline (distinct from active and finished). Reduced motion shows end states at once (portrait-hop override fixed). |

Rules engine, frozen contracts, English copy meaning, NASA attribution and the video fallbacks are unchanged. One hint changed from "glowing spot" to "marked device" because the glow is gone.

### Checks actually run for the UI pass (production preview, Vite 8.3.8)

All browser checks below ran in **headless Chrome via CDP** (`tools/qa-shots.mjs`) against the production preview, plus JS inspection in the in-app Chromium. **Emulated**, not physical devices.

| Check | Command / method | Result |
|---|---|---|
| Unit and presentation tests | `npm test` | **27/27 pass** |
| Production build | `npm run build` | Pass |
| Fit at every decision, full run (19 measurements per size: open, preview, result for 8 steps + shelter bag + end) | `JOURNEY=1 node tools/qa-shots.mjs <preview> <dir> j` | **1366×768: panel fits at every step, no page or tray scroll. 1920×1080: same.** **375×812:** panel fully visible at every step except Water & Waste preview (7 px over); primary action visible at every step; HUD sticky. Before the pass, 1366×768 tray overflowed by 129 px and the phone page itself scrolled. |
| Before / after screenshots | default mode, `docs/qa/before-*.png`, `docs/qa/after-*.png` | Heat Valve decision at 1366×768, 1920×1080, 375×812; greenhouse decision at 375×812; plus after-only valve closed (pointer) and result (Warmth 1 → 2 note) shots |
| Keyboard only (real key events) | `KEYS=1 …` (CDP `Input.dispatchKeyEvent`, reduced motion) | No-purchase run by **Enter only**: lights on → adjust → early shelter → bag → spot → emergency oxygen → standard repair → print → Send Now → **"Signal sent. Waiting for confirmation."** Shift+Tab ×3 reached the marked greenhouse with `:focus-visible` (teal dashed outline); Enter on it opened `lights_on, save_power`, the same choices as the tray shortcut. Screenshot `docs/qa/after-keyboard-hotspot-focus-1366x768.png` |
| Marked device = shortcut (mouse) | in-app Chromium JS | Clicking the valve hotspot opened `adjust, leave`; active hotspot `tabindex=0`, label "Heat valve. Tap to use it.", no glow filter; greenhouse marked finished |
| Device tour | `TOUR=1366x768 …`, `TOUR=375x812 REDUCE=1 …` | Every active device (greenhouse, valve, shelter, bag, bag spot, oxygen, recycler, printer, antenna ×2, end) reviewed: ring, pointer and label clear of the crew |
| Motion vs reduced motion | `MOTION=1 …` | Normal: valve turns to 135° over 600 ms, arrow scales to 0.42, delta note visible, HUD "2 of 2" and Continue ready immediately. Reduced: identical end state at 60 ms, **no running animations**. |
| Reduced-motion full story | in-app Chromium (system preference already reduce) | Save power → adjust → early → restart → standard → sort → Send Now; repair result ready without timed turns; ending summary lists saved power/restart, early shelter, standard repair, sorting; final line correct |
| Touch (emulated phone, 375×812, `Input.dispatchTouchEvent`) | `TOUCH=1 …` | Water Training via taps on the recycler hotspot: **kit 3 → 2 in 1 turn; standard 3 → 1 in 2 turns**. Compare ISS Recovery: **14/20 at 70%, 17/20 at 85%** to Further Treatment, NASA NTRS link present, drinking water still 2 after Close |

Known limits: the in-app browser pane was not drawing frames during this session, so its own key presses and transition timings were not used; headless Chrome was used instead. No physical phone was available.

## Implemented

- Existing scene and rules connected to the shell, with working device hotspots, shelter bag pick/place, repair turns, sunrise and pending signal confirmation. No changes to the rules engine or frozen scene/rules contracts.
- Start-screen Water Training entry, equipment selection, `newPractice(withKit)`, repeat from a fresh 3-bottle checkpoint, and Back to Start. Practice uses the regular decision/preview/confirm UI and cannot advance into the story ending. Training is entered from Start, so it cannot replace an active story.
- Compare ISS Recovery in story and practice: 20 drops with 14 recovered at 70% and 17 at 85%, explicitly routed to Further Treatment. Historical labels, text counts, check/dash marks, NASA links, and an inventory disclaimer. Closing returns focus to the opener. The dialog has no access to mission state.
- Existing `summaryLines(state)` displayed in the ending and tested against two different completed runs. The final line remains **“Signal sent. Waiting for confirmation.”** Earth receipt remains unresolved.
- Intro text fallback and optional Open Notebook text/source dialog. Videos and Knowledge Meals remain deferred.
- Three regression tests cover ending summaries for contrasting runs and practice results that offer another practice rather than story continuation.

## Checks actually run

### Follow-up batch 1 — reduced-motion runtime (14 November 2026)

- Built production with `npm run build`; `npm test` passed **27/27** after the only code change in this batch.
- Fixed the browser-console 404 for the missing favicon by adding a local crescent SVG and a relative icon link. The JS/CSS bundle contents are unchanged. The production icon URL returns HTTP 200.
- Opened a separate Chrome Guest session and used DevTools Command Menu → **Emulate CSS prefers-reduced-motion: reduce**. Rendering panel confirmed that value. After undocking DevTools, the native game window became minimized; restore attempts were rejected by the native helper's input-freshness guard. No settings or console-paste protection was bypassed.
- Continued the runtime check in in-app Chromium on the same final production build. Its real `matchMedia('(prefers-reduced-motion: reduce)').matches` returned **true**; computed `--fast` and `--slow` both returned **1ms**. This browser already inherited the reduced-motion preference; no query-string simulation, JavaScript stub, or source override was used.
- At start, active greenhouse, after a toy tap, bag held, generator running, sunrise and signal sent: every scene element had computed `animation-name: none`; scene transition durations were 0–4 ms. Visually, there was no ongoing wiggle, spin, bobbing or travelling signal. Sunrise and final scene states remained visible.
- Completed the PRD no-purchase route: Save Power → leave valve/recovery → retry → Adjust → early shelter + bag placement → Restart Generator → Standard Repair → Sort → sunrise → Send Now. The repair result and Continue were available without the normal timed turn sequence. Final supplies: power 0, water 1, meals 0, warmth 2, cabin oxygen 2, reserve 1. Ended on **“Signal sent. Waiting for confirmation.”**
- Ending summary correctly listed saved power/restart, early shelter, standard repair and sorting. The failed heat attempt did not leak into the successful decisions.
- On production, repeated both Water Training paths: kit from 3 to 2 bottles in 1 turn; Try Both Repair Paths reset to 3; standard ended at 1 in 2 turns. Keyboard Enter controls and scene recycler hotspot worked.
- ISS comparison on production story and practice: 20 total drops, 14/17 recovered, NASA historical-report link present, full HUD unchanged after closing, focus returned to Compare ISS Recovery. No captured error/warning logs in the in-app browser at the story-ending checkpoint.
- Screenshot and computed-style evidence saved outside Git under the chat's `qamar-square-qa` artifact folder.

### Follow-up batch 2 — portrait and emulated touch (14 November 2026)

- Recovered the native game window by docking its existing DevTools back into it. No native input guard was bypassed. Enabled DevTools device toolbar at **375×812**, explicitly displayed device type **Mobile**, and used native coordinate taps and drags inside that emulated viewport. This is **emulated touch**, not a physical phone and not merely a resized pointer viewport. DevTools preview zoom was 50%; CSS viewport dimensions remained 375×812.
- Touch Start → no-purchase Launch → greenhouse hotspot → lights preview **4 → 2 power** → Confirm → result **2 power** → Continue all worked. Heat-valve hotspot → Leave It As Is → Confirm showed warmth 0 and friendly recovery; touch Retry restored warmth 1 and power 2.
- Touch Water Training → Repair Kit → recycler hotspot → swipe tray → kit preview **3 → 2** → Confirm produced **1 turn / 2 bottles**. Try Both Repair Paths → Standard Tools reset to **3 bottles**; touch Standard Repair → Confirm produced **2 turns / 1 bottle**.
- Touch Compare ISS Recovery showed **14 of 20**; tapping historical 85% changed it to **17 of 20**. Swiping the dialog revealed sources and Close; touch Close returned to the repair result with the same **2 drinking-water bottles**. Normal tray and dialog scrolling both worked.
- On the final production build in in-app Chromium, **360×800** gave document scroll width **360 px**, with no rendered buttons under 44×44 px at the first decision. At **375×812**, document width was **375 px**; the ISS dialog was about **337 px** wide with 317 px scroll width and no buttons under 44×44 px. Reviewed both layouts visually. These geometry checks are viewport/pointer checks separate from the native Chrome touch emulation above.
- Native Chrome reload displayed the new crescent favicon and no resource error; the earlier favicon 404 was gone. The only remaining native-console entry was Chrome's informational autofocus notice, not an application exception.
- Closed the task-created Chrome Guest window, which also removed its DevTools media/device overrides. Reset the in-app viewport override and left the production preview on Start. Existing user browser windows were left alone.
- No physical device was accessible. Exact hardware steps and expected results are in `docs/MANUAL_CHECKS.md`. No implementation blockers remain. Phone camera zoom is cut under `specs/plan.md` §7; tray shortcuts remain available. Videos, Knowledge Meals, sound and deployment remain deferred.
- Documentation-only batch: relevant checks are the completed browser matrix above and `git diff --check`; production code is identical to the batch-1 build that passed **27/27 tests** and `npm run build`.

### Automated

- `npm test`: **27/27 passing** (24 existing rule tests plus 3 presentation integration tests).
- `npm run build`: passed, Vite 8.3.8; output in `dist/`.
- `git diff --check`: passed.
- Crew assets: ten existing WebPs total 176,640 bytes (under 400 KB).
- NASA historical source checked at <https://ntrs.nasa.gov/citations/20110023178>: initial 85% urine recovery, gypsum failure and reduction to 70%. No current total-station recovery rate is implied.

### Baseline browser checks recorded in e51c098 — not physical devices

Used in-app Chromium. Development: `http://127.0.0.1:5173/`; production preview: `http://127.0.0.1:4173/`.

| Check | Actual result |
|---|---|
| Development full no-purchase story | Passed: lights on → adjust valve → early shelter → supply bag → marked spot → emergency oxygen → standard repair → sort plastic → sunrise → check antenna → secure cable → send. Reached the required final line. No captured browser warnings/errors at that checkpoint. |
| Production laptop, 1366×768 | Passed: full no-purchase story and ending summary. Keyboard Enter activation throughout; actual Tab traversal through shelter, oxygen, water/science and signal controls. Recovery/retry checked with keyboard. |
| Cold cabin recovery | Passed in development and production: leave valve gives warmth 0 and friendly recovery; retry restores pre-valve warmth 1 and power 2; adjusting allows continuation. |
| Training equipment cases | Passed in development browser: both start with 3 bottles; kit ends with 2 after 1 turn; standard ends with 1 after 2 turns. Try Both Repair Paths returns to equipment selection and a fresh checkpoint. Automated rendering/engine tests cover both results. |
| Historical ISS comparison | Passed in development practice and production story: exactly 20 drop elements; recovered counts switch 14 ↔ 17. Full HUD text unchanged before/after comparison. Escape/Close returns focus to Compare ISS Recovery. NASA source links present. |
| Notebook text fallback | Opened and closed in production; returned to the water-repair result. No video required. |
| Production mobile portrait, 375×812 | Passed with pointer clicks in a resized browser, **not touch emulation**. Full alternative run with kit + meal pack: save power → adjust → shelter at alert → generator restart → kit repair → print clip → antenna check → send. Summary reflects those choices; final water 2, warmth 2, power 0. |
| Mobile readability | At 375×812, document scroll width equals viewport width (375 px). Scene, HUD, choices and ISS dialog reviewed visually. The 20-drop dialog fits and scrolls vertically. Rendered visible buttons at the first story decision were at least 44×44 px. |
| Budget guard | Production UI: battery + kit totals 10,400 and launch has `aria-disabled="true"`; removing battery and adding the meal pack permits launch at 5,700. |
| Confirm once | Browser: Confirm removed after application. Existing rule test checks repeated confirm changes nothing. A rapid double-click UI test was not repeated in this session. |
| Signal branches | Browser: check-first without a clip requires securing cable; with a printed clip, Send works immediately. Secure Cable may remain visible as an unavailable option. Send Now is covered by the rule suite, not a new browser run. |
| Ending summaries | Production: no-purchase summary mentions lights, early shelter, reserve, standard repair and sorting. Alternative summary mentions saved power/restart, ready meal at alert, kit and printed clip. No stale choices from the prior run. |

### Physical-device checks

None performed. No physical phone or hardware touch testing is claimed. Laptop keyboard interactions above were automation-generated browser key events.

## Remaining manual checks and deferred work

- **Physical phone and its browser/system preference:** no hardware was available. See `docs/MANUAL_CHECKS.md` for exact story, training, science, portrait and Reduce Motion steps. Browser emulation does not establish Safari or hardware-touch compatibility.
- **Available environment checks:** complete. The earlier native Brave access limitation from the baseline session was resolved for this follow-up by using an isolated Chrome Guest window; there is no remaining browser-automation blocker for the completed checks.
- **Deferred:** video, Knowledge Meals, sound, deployment, and optional phone camera zoom. Existing intro/notebook text fallbacks remain. Frozen game and scene contracts, budget and resource rules are unchanged.

## Run

```powershell
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
npm test
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

For a physical phone on the same trusted LAN, use a separate port so the existing localhost preview can stay running:

```powershell
npm run preview -- --host 0.0.0.0 --port 4174 --strictPort
```

Open `http://<computer-LAN-IP>:4174/` on the phone. The localhost preview was used during this session; LAN exposure was not enabled. See `docs/MANUAL_CHECKS.md` for the exact checklist.

See `docs/DEMO.md` for the short judging route. Optional clips can later go in `public/assets/video/` with English `.vtt` captions; gameplay already works without them.
