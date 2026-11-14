# Qamar Square — Build status

**Updated:** 14 November 2026 (Africa/Cairo).
**Milestone:** integration implemented; reduced-motion runtime and final production game flows verified. Follow-up portrait/touch checks are in progress.
**Current QA baseline:** `e51c098`. Working tree was clean at the start of the follow-up. All commits remain local.
**Starting revision:** `8396e18` (following `be806fa`). The scene, scene CSS, ten crew WebPs, crop script and scene preview were already committed in `8396e18`. The working tree was clean before integration. No previous work was discarded. This status ships in the local integration commit; nothing was pushed.

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

### Automated

- `npm test`: **27/27 passing** (24 existing rule tests plus 3 presentation integration tests).
- `npm run build`: passed, Vite 8.3.8; output in `dist/`.
- `git diff --check`: passed.
- Crew assets: ten existing WebPs total 176,640 bytes (under 400 KB).
- NASA historical source checked at <https://ntrs.nasa.gov/citations/20110023178>: initial 85% urine recovery, gypsum failure and reduction to 70%. No current total-station recovery rate is implied.

### Browser checks — automated browser, not physical devices

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

## Remaining verification gaps

Computer Use refused to bind the native Brave window because it could not determine the current browser URL confidently enough to enforce policy. Computer Use was then stopped for the turn. The in-app viewport capability supports resizing but does not expose touch or reduced-motion emulation. No alternate browser automation mechanism was used to bypass that stop.

1. **Real touch / phone:** run the preview on the LAN using the command below, then verify device taps, preview/confirm, heat recovery/retry, both training paths and ISS controls on a physical phone. A 360 px viewport and other browser engines also remain unchecked in this session.
2. **Reduced motion runtime:** now passed in follow-up batch 1 above. A physical phone's system preference remains part of the hardware checklist, not an implementation blocker.
3. **Optional toy polish:** the existing scene uses a full-base phone view plus tray shortcuts; a zooming phone camera was not added. Sound, video, Knowledge Meals and deployment remain outside this integration.

## Run

```powershell
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
npm test
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

For a physical phone on the same trusted LAN, stop the localhost preview first if it occupies port 4173, then run:

```powershell
npm run preview -- --host 0.0.0.0 --port 4173 --strictPort
```

Open `http://<computer-LAN-IP>:4173/` on the phone. The localhost preview was used during this session; LAN exposure was not enabled.

See `docs/DEMO.md` for the short judging route. Optional clips can later go in `public/assets/video/` with English `.vtt` captions; gameplay already works without them.
