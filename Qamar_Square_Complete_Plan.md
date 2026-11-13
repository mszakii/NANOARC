# Qamar Square — Complete Project and Build Plan

**Status** — Planning complete. Implementation starts with the water practice milestone.  
**Audience** — The Qamar Square team and the coding tool working in the project.  
**Build target** — Four-hour NASA Space Apps judging prototype for laptop and mobile.  
**Project source** — The uploaded Qamar Square chat and the decisions approved in the eight planning stages. The approved product and architecture rules are consolidated below.

## 1. Project definition

**Qamar Square** is an English-language, single-player 2D browser game for ages **7–12**. The player is a junior mission commander. They equip the crew with **10,000 Mission Credits**, then manage a single lunar base through four connected crises. The crew succeeds by surviving until sunrise. The final scene sends a signal and leaves Earth receipt open for the next chapter.

> Pack for the Moon. Make tough choices. Keep your crew safe until sunrise.

The player should be able to explain what their decision gained, what it cost, and how an earlier decision affected a later crisis. Use the same game for both age groups. Ages **7–9** set the baseline for readable English, clear icons and direct controls. Ages **10–12** get decisions with delayed consequences and optional science detail.

| Priority | Delivery |
|---|---|
| **P0 · First playable build** | Loadout → water practice → visible results with and without the kit → historical ISS comparison. |
| **P1 · Judging route** | Pre-launch → Power & Food → Heat & Shelter → Oxygen → Water & Waste → Sunrise & Signal. |
| **P2 · Polish** | Final art, optional intro or notebook clip, a summary drawn from the player's decisions, and an optional post-mission Knowledge Meal. |

## 2. Problem discovery and review plan

The working hypothesis is that a child can recognize equipment and still miss the connection between its upfront cost, the resource it saves, and the option they give up. Review that connection through hypothetical player scenarios.

| Scenario | What to review |
|---|---|
| **Age 8, portrait phone** | Can the player identify the active device, distinguish preview from confirmation, and explain why a faster repair leaves an extra bottle? |
| **Age 11, laptop** | Can the player explain why power saved at the greenhouse changed the available oxygen choices, and why the ISS team accepted a lower recovery rate? |
| **Operations review** | Can the player continue when a video is unavailable, recover from an unsafe choice, and avoid a second deduction when confirming twice? |
| **Science review** | Are drinking-water bottles, recovered-water drops, and signal transmission and receipt labeled clearly? |

Review the equipment benefit, the immediate outcome, and a new trade-off in that order. Useful prompts include **“Why did you have more water left?”** and **“What do you gain now? What might be harder later?”** Check mechanics on the laptop and phone during implementation. Report the scenarios as simulated design review and team testing as QA. Learning impact with real children remains unmeasured.

## 3. Research and evidence

The challenge asks for an interactive outpost in which children experience competing demands such as life support, shielding, power and food production. The water practice demonstrates a verified historical engineering trade-off. The full route links power to oxygen and includes shelter and communications. [NASA Space Apps challenge brief](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/)

Use historical values as evidence, arithmetic illustrations as visual representations, and resource values as game balance. The four-hour game ships with local copies of the few display fields it uses. Show a source link inside each science panel.

| Topic | Source-supported fact | In-game treatment |
|---|---|---|
| ISS urine processing | The ISS Urine Processor Assembly (UPA) initially recovered 85% of water by distillation. NASA reported a reduction to 70% after gypsum precipitation caused a failure. The recovered water still went through the Water Processor Assembly (WPA). | Compare the historical rates, with 17 and 14 illustrative drops out of 20 routed to Further Treatment. The illustration does not change crew inventory. The historical context matters because later pretreatment work addressed the cause of gypsum buildup. [NASA historical report](https://ntrs.nasa.gov/citations/20110023178) · [NASA follow-up](https://ntrs.nasa.gov/citations/20170008985) · [NASA treatment overview](https://www.nasa.gov/missions/station/nasa-achieves-water-recovery-milestone-on-international-space-station/) |
| Power and crops | NASA space plant-growth hardware uses artificial lighting, water and nutrients. | Show a crop-growth indicator and power trade-off. The game uses teaching units and makes packed food cover the chapter. [NASA Plant Biology Program](https://science.nasa.gov/biological-physical/focus-areas/plant-biology/hardware/) |
| Heat | NASA investigated a lunar thermal control concept that limits heat rejection as the environment cools. | Show a smaller heat-loss arrow when the control valve is adjusted. Warmth levels and turns are game rules. [NASA thermal-control poster](https://ntrs.nasa.gov/citations/20240004746) |
| Shelter and solar particles | Orion's shelter concept uses stowage bags to add shielding in less-protected areas. NASA DONKI records a solar energetic particle event observed by STEREO-A. | The player places a bag in the designated shelter position. The alert borrows an archived event. The base location, timing and shielding effect are scenario choices. [Artemis II Reference Guide](https://www.nasa.gov/wp-content/uploads/2026/01/a2-reference-guide-012825.pdf) · [DONKI event](https://ccmc.gsfc.nasa.gov/DONKI/events/30717/1/) |
| Oxygen | On the ISS, electrolysis uses electricity and water to produce oxygen. A tank can also supply oxygen. | Display cabin oxygen, generator status and the reserve separately. Restart power cost and oxygen counters are game balance. [NASA ISS reference, chapter 19](https://www.nasa.gov/wp-content/uploads/2018/04/iss-operating_an_outpost-tagged.pdf) |
| Plastic | The Refabricator was installed on the ISS as a demonstration that recycled plastic into 3D-printing feedstock. | The player can print a cable clip from compatible plastic or store the plastic and save power. The clip and its power cost are scenario choices. [NASA Refabricator](https://www.nasa.gov/image-article/refabricator-recycle-reuse-plastic-installed-space-station/) |
| Signal | NASA estimates one-way Earth–Moon radio delay at about 1.28 seconds. | Display about 1.3 seconds in the signal graphic or card. Leave confirmation pending. [NASA communications reference](https://ntrs.nasa.gov/citations/20240007214) |
| Optional water science | NASA's Brine Processor recovers more water from UPA brine. A separate lab study investigated direct contact membrane distillation of hydrolysed urine samples. | If built, show previously stored brine routed to further treatment. The optional notebook experiment produces a labeled test sample. [NASA water recovery overview](https://www.nasa.gov/missions/station/nasa-achieves-water-recovery-milestone-on-international-space-station/) · [Khumalo et al., 2019](https://doi.org/10.1016/j.seppur.2018.10.035) |

### Minimum display record for the shelter card

| Field | Value |
|---|---|
| Event category | Solar Energetic Particle (SEP) |
| Observed at | 2024-05-11 04:07 UTC |
| Observing spacecraft | STEREO-A |
| NASA activity ID | 2024-05-11T04:07:00-SEP-001 |
| Event record | https://ccmc.gsfc.nasa.gov/DONKI/events/30717/1/ |
| NASA notification | https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/Alert/30728/1 |

Suggested player copy: **“On May 11, 2024, a spacecraft detected fast-moving particles from the Sun. In our mission, a solar particle alert means the crew needs shelter.”**

### Suggested ISS card copy

**“The station's team lowered water recovery after mineral buildup stopped the machine. The lower setting recovered less water and helped reduce buildup. The recovered water went through another treatment step.”**

The 2023 NASA figure of **98%** refers to total station water recovery with the brine-processing demonstration. It is optional background for older players. Use it only with that scope and context.

### Independent model audit

The sources above were reviewed in the planning conversation. Claude and Gemini reviews are pending. Give the same question to each available reviewer and resolve differences by checking the original publication or event record.

```text
Audit the Qamar Square evidence against its primary sources. For each claim,
provide the supporting page, section or event ID. Classify each number as
historical data, a derived teaching visual, or a game balance value. Return
a keep/revise/drop verdict and one precise English wording improvement.
Check ISS 70%/85% versus total recovery, recovered versus drinking water,
DONKI observation location, and one-way signal travel versus receipt.
Mark any claim you could not verify.
```

## 4. Gameplay concept and review decisions

The single cutaway base shows decisions and their consequences in place. The player opens a device, previews a clear benefit and cost, confirms once, and sees the equipment and resource counter respond. Share this interaction across all four missions.

- **Loadout to water.** Packing the repair kit saves one repair turn and one bottle.
- **Greenhouse to oxygen.** Power saved in the first crisis can make a later generator restart available.
- **Shelter timing.** Preparing early spends work-light power. The delayed path can spend a meal-prep turn and lose warmth. A ready-to-eat meal can remove that cost.
- **Plastic to signal.** The printed cable clip costs power and saves a step if the player chooses to check the antenna.
- **Retry.** Restore the actual state at the start of the current story crisis. Use a separate fixed three-bottle practice case to compare the two repair paths.
- **Completion.** Celebrate survival first, then send the signal and end the chapter while awaiting confirmation. Keep replay voluntary and the optional learning badge outside crew supplies.

## 5. Identity and player journey

Use **Qamar Square** consistently. Keep character dialogue calm, direct and in English. The scene uses an original 2D cutaway, rounded equipment, warm indoor lighting, a dark space background, and the team's chosen astronaut characters. Let the device, icons and one short sentence explain each result. Use **Science Behind This** for optional technical context.

| Screen | Player action and feedback |
|---|---|
| **Start** | Read the mission goal and select **Start Mission**. If the intro is available, offer play or skip. |
| **Pre-Launch** | Select equipment, preview the remaining credits and choose **Launch Mission**. |
| **Power & Food** | Open the greenhouse and see the lights, crop progress and power change. |
| **Heat & Shelter** | Adjust the valve, choose when to prepare the shelter, and place a supply bag. |
| **Oxygen** | See cabin oxygen and generator status, then choose a restart or emergency oxygen. |
| **Water & Waste** | Repair the recycler, compare historical recovery, and decide whether to print a clip or store plastic. |
| **Sunrise & Signal** | Celebrate, then select **Send Now** or **Check Antenna First**. End on **“Signal sent. Waiting for confirmation.”** |
| **Knowledge Meal** | If available, open the optional post-mission activity and earn its badge once. |

On a laptop, place the choice panel beside the base. On a portrait phone, put the base above the decision card with a labeled shortcut to the active device. Keep the relevant resource beside the decision and support tap, mouse and keyboard. Use a still and a short text fallback for any shipped optional video.

**Entry-point progression.** In Milestone A, **Start Mission** leads through loadout into water practice. In Milestone B, **Start Mission** opens the full story and **Water Training** remains available as a separate practice entry.

## 6. Product requirements (PRD)

### Shared player interaction and mission state

- Open the highlighted device, select an option, preview its impact, select **Confirm Choice**, see the resource and scene changes, then select **Continue**. Use the same interaction for all crisis decisions. Include a text and icon cue for the active device.
- Preview uses the current resources and shows the result before the player commits. Re-selecting or closing the preview leaves the mission unchanged. Show the reason beside an unavailable option, such as **“You need 3 power units to restart the generator.”**
- Confirmation validates against current state and applies the decision and all of its consequences once. During the result animation, repeated taps and key presses cannot spend resources again. The animation presents the applied result.
- Keep one continuous story state for budget, confirmed equipment, resource balances, device and objective flags, and committed decisions that affect later events. Each confirmed decision shows only consequences that apply to the current run.
- At the start of each crisis, capture the state needed for a retry. **Try This Crisis Again** restores the snapshot, including equipment availability, resources, flags and relevant decision history. Preserve decisions committed before the snapshot. **Restart Mission** asks for confirmation and returns to a fresh loadout.
- A valid choice cannot spend more than is available. A result that reaches an unsafe condition opens a recovery screen with a specific explanation and retry. Story checkpoints preserve purchased equipment. The practice comparison can switch repair scenarios from a clean, fixed snapshot.
- Mobile portrait places the base above the decision card and offers a labeled active-device shortcut. Keep the relevant counter next to the choice. Laptop displays the base and decision panel together. Core actions work by tap, click and keyboard, with visible focus. Warnings and resource states have text or symbols in addition to color.
- A visible route continues when an optional video is skipped, unavailable or fails. All core decisions and required science data are available once the game has loaded. Checkpoints exist in memory during the page session. Reload opens a fresh run with **Start Mission**.

### Loadout and balance defaults

| Item | Cost | Availability and effect |
|---|---:|---|
| Spare Battery | 5,000 | Adds 3 shared power units at launch. Any remaining power carries forward. |
| Water Repair Kit | 5,400 | Enables a 1-turn repair in Mission 4. Standard equipment supports the 2-turn repair. |
| Extra Crew Meal Pack | 300 | Adds 1 ready-to-eat crew meal. It can replace the scheduled meal after shelter setup, saving the meal-prep turn on the delayed shelter route. |

Each card may be selected once. At 10,000 credits a player can afford either major item with the meal pack. The two major items together cost 10,400. The player can edit selections until **Launch Mission**. The confirmed total and equipment are fixed until a full restart. Base supplies alone must support a successful route.

| Story state at launch | Value and rule |
|---|---|
| Power | 4 units before loadout bonuses. May reach 0. Actions with a power cost require the full amount. |
| Drinking water | 4 bottles. The crew uses 1 bottle on entry to Mission 4, once per attempt, before the water-crisis checkpoint. The resulting canonical story checkpoint has 3 bottles. Repair requires 1 bottle per turn. At least 1 bottle must remain after repair. |
| Packed crew meals | 2, plus the optional extra meal. Use 1 after Shelter and 1 after Water & Waste. The post-shelter meal can come from the ready-to-eat pack. Each deduction requires a meal in stock. Zero after the final scheduled meal is valid. |
| Warmth | 1 of 2. At 0, the cabin is too cold and the Heat crisis enters recovery. |
| Cabin oxygen and reserve | 2 cabin units and 1 separate emergency reserve charge. At 0 cabin units, enter recovery. Track generator status separately. |

The quantities above, costs, turn counts, and safety thresholds are teaching values. A unit or turn has no physical duration or engineering unit attached.

### Mission requirements

#### Mission 1 — Power & Food

- **Keep Greenhouse Lights On** costs 2 power units and advances the crop indicator by one stage.
- **Save Power** spends 0 and pauses crop progress. Neither path yields a harvest during this mission. The crew relies on packed meals until sunrise.
- Show the lights and crop indicator changing and carry the remaining power into Heat & Shelter and Oxygen.

#### Mission 2 — Heat & Shelter

- **Adjust Heat Control Valve** changes warmth from 1 to 2 and reduces the visible heat-loss arrow. **Leave It As Is** lets warmth fall from 1 to 0 and opens recovery. Show the expected warmth in both previews.
- **Prepare Shelter Early** spends 1 power unit to run work lights during setup and keeps warmth at 2. **Prepare at the Alert** saves that power. With a standard meal, the crew spends an extra meal-prep turn during the alert sequence and warmth falls by 1. A packed ready-to-eat meal is served in its place automatically and avoids that extra turn and warmth loss. Preview the applicable costs and explain the meal-pack benefit when it applies. These effects are scenario rules.
- The player selects a supply bag and then its marked position. Both paths reach the protected shelter if their costs are met. Both show the selected cost before confirmation. Use 1 meal after shelter completion, once. On the delayed route use the ready-to-eat pack if available. On the early route use a standard meal.
- Show the archived 11 May 2024 DONKI solar energetic particle event in the science panel. Identify STEREO-A as the observing spacecraft. Mark the game alert timing and warmth effects as scenario rules. The shelter concept is inspired by Orion's use of storage bags.

#### Mission 3 — Oxygen

- Show **Cabin Oxygen** and **Generator Status** as distinct indicators. The crisis starts with the generator stopped.
- **Restart Generator** costs 3 power units. The generator adds 1 cabin oxygen unit during this turn and the crew uses 1, leaving cabin oxygen at 2. Retain the reserve charge.
- **Use Emergency Oxygen** spends the one reserve charge and leaves the generator stopped. The reserve adds 1 cabin oxygen unit and the crew uses 1, leaving cabin oxygen at 2. Preserve the remaining power.
- If the greenhouse choice preserved the power needed for a restart, tell the player at that moment. Check that the restart would have been unavailable under the other greenhouse choice with the same later spending. Explain in the science panel that a real generator uses water and electricity. The demo abstracts its water feed and tracks crew drinking water as a separate resource.

#### Mission 4 — Water & Waste

- **Standard Repair** takes 2 turns and uses 2 bottles. **Use Repair Kit** is available when packed, takes 1 turn and uses 1 bottle. In each case, show the elapsed turn and bottle deduction in sequence. Mark the recycler repaired on successful completion. In the judging practice slice, begin at 3 bottles and use the confirmed loadout for the first repair. Standard repair ends at 1 bottle and kit repair at 2. The training comparison then offers both equipment scenarios from the fixed checkpoint.
- **Compare ISS Recovery** opens a teaching comparison. Label the modes **70% historical recovery** and **85% historical recovery**. Show 14 or 17 of 20 illustrative drops flowing to **Further Treatment**. Explain that lowering recovery reduced the risk of gypsum buildup in the historical case. This activity leaves the player's mission resources unchanged. Drinking water enters the tank only after the treatment step.
- In the practice slice, **Try Both Repair Paths** resets practice to the same 3-bottle checkpoint and offers the two training cases. In the story, checkpoint retry restores the actual packed equipment.
- After repair, offer **Print Cable Clip** for 1 power unit, or **Sort and Store Plastic** for 0. Printing uses compatible plastic and produces a clip the crew immediately uses to tidy the antenna cable. Sorting keeps the power. Both routes let the crew reach sunrise. The clip saves a cable-securing step if the player chooses to check the antenna in the epilogue. The clip does not resolve whether the signal will arrive.
- Use 1 packed meal after Water & Waste, once. An optional notebook still or flashback may show an experimental membrane result as a labeled test sample. Optional Brine Processor content requires a previously stored batch and shows recovered water going through further treatment. Keep both optional features outside the first playable slice.

#### Sunrise & Signal

- After four completed crises and safe resources, reveal sunrise, show the panels beginning to charge, and let the crew celebrate.
- **Send Now** starts the transmission. **Check Antenna First** shows the antenna and cable state. If the printed clip is installed, offer **Send Signal** immediately. Otherwise, let the player select **Secure Cable**, then **Send Signal**. Signal controls are powered at sunrise, so entering with zero stored power is valid. Checking the antenna does not change signal travel time. Both choices reach the same story boundary.
- Indicate the signal's approximately 1.3-second one-way travel time on the animation or science card. End on **“Signal sent. Waiting for confirmation.”** The crew's survival is the chapter result. Earth receipt remains unresolved.

### Optional video and rewards

- Intro — **Play Intro** leads to loadout on completion. **Skip Intro** enters loadout immediately. If the clip is unavailable, a still or one line of context leads to loadout.
- Notebook — open by choice during Water & Waste. Provide English captions, a visible skip action and a still/text fallback. Close or finish returns to the same decision and resource state.
- Knowledge Meals — open after the chapter result. Start with one short educational clip or equivalent still and text. A correct answer grants one learning badge for that item during the run. Reopening cannot award it twice. Crew meals and mission resources are unaffected.
- On-screen examples — **“Repair in 1 turn. Keep 2 bottles.”** · **“Keep the lights on. Use 2 power units.”** · **“The cabin got too cold. Try the heat valve again.”** Use actual state values in copy that shows counters.

### Acceptance checks

Use these checks during implementation. The walkthrough below verifies the balance on paper.

| ID | Check | Expected outcome |
|---|---|---|
| QS-01 | Select both major loadout items | 10,400 exceeds the budget. Launch is blocked for that combination and works when the selection becomes valid. |
| QS-02 | Select and change a preview, then confirm twice quickly | No mutation during preview. One confirmed resource change and one result. |
| QS-03 | Run the water practice twice from 3 bottles | Standard repair ends at 1 bottle after 2 turns. Kit repair ends at 2 bottles after 1 turn. |
| QS-04 | Compare 70% and 85% historical ISS recovery | 14 and 17 of 20 drops go to treatment. The story and practice drinking-water balances stay the same while comparing. |
| QS-05 | Use the same loadout and shelter choice. Change the greenhouse decision | With no spare battery and early shelter setup, saving power leaves 3 and enables restart. Lighting the greenhouse leaves 1 and disables restart. The reserve route is available. |
| QS-06 | Leave the heat valve as-is, then retry | Warmth 0 opens recovery. Retry restores the pre-crisis state, including power and warmth. Adjusting the valve can continue the mission. |
| QS-07 | Complete a story run without purchases | The crew reaches sunrise using base supplies. End state shows survival and waiting for signal confirmation. |
| QS-08 | Skip a notebook clip or make it unavailable | The player sees or can open the short fallback explanation and can return to the same decision and balances. |
| QS-09 | Run core actions by laptop keyboard and mobile touch | Open a device, preview, confirm, see a resource result and retry. The active counter and primary action are readable on a portrait phone. |
| QS-10 | Select each signal branch | Check-first displays antenna state before send. The installed clip skips the cable-securing step. Both branches end at sent/waiting for confirmation. |
| QS-11 | Earn and reopen a Knowledge Meal, if built | One badge for that item per run. The crew-meal counter stays the same. |
| QS-12 | Choose delayed shelter with and without the meal pack | With the pack, serve it and retain warmth 2. With standard meals only, serve 1 and reach warmth 1. Power is unchanged in both cases. |

#### Base-supplies walkthrough

Launch with **power 4 / water 4 / meals 2 / warmth 1 / cabin oxygen 2 / reserve 1**. Save greenhouse power. Adjust the valve, prepare the shelter early and use one meal. This leaves **power 3 / warmth 2 / meals 1**. Restart the generator and reach **power 0 / cabin oxygen 2 / reserve 1**. On entering the final crisis, the crew uses 1 water bottle. Standard repair reduces the remaining **3 → 2 → 1**. Sort the plastic, use the last meal and reach sunrise with **1 water bottle and 0 meals after the final meal was served**.

## 7. Architecture and technical decisions (ADR 001)

Use **Node.js 24 LTS, npm, and Vite 8.3.8** pinned for the project, with semantic HTML, CSS, vanilla JavaScript modules and SVG overlays as needed. Build a static browser game with rules and data bundled locally. The project uses in-memory checkpoints for same-session retry. Reload opens a fresh run. Once core assets have loaded, play can continue during a connection drop. The install-time audit checks the actual dependency tree. If an advisory affects the pin at setup, document the applicable patched version in the ADR before installing.

### Game rules and state boundaries

1. **Mission content.** Define each crisis, allowed actions and science references with stable IDs. Keep teaching values such as power units and bottle costs distinct from historical figures. Reference the PRD for numbers and acceptance checks.
2. **Mission state.** Track the current mode and mission step, confirmed loadout, resources, device flags, and decisions with downstream effects. Keep candidate choices, open panels, animation status and media playback in view state. Route actions by stable IDs. Asset placement and labels cannot alter rules.
3. **Preview and confirm.** Calculate eligibility and the projected outcome from the current state without changing it. Confirm rechecks eligibility, applies the result once and enters the result phase. Ignore repeated activation once that step is committed. Resource animations present the committed outcome and do not apply a second change.
4. **Retry and restart.** Capture a checkpoint on crisis entry, after any PRD-defined entry cost. Restore the snapshot with its resources, flags and history. Close stale overlays and cancel pending visual transitions when retrying or restarting. The story water checkpoint preserves the actual loadout. Practice mode can reset to the fixed three-bottle case and switch between the two training loadouts without changing story state.
5. **Science and media.** Opening the ISS comparison, the shelter source panel, or the notebook leaves mission resources unchanged. The 70% and 85% views show 14 and 17 of 20 illustrative drops going to further treatment. The DONKI panel identifies the event and observing spacecraft, with the in-game alert treated as scenario timing. Exiting any overlay returns focus to a useful control in the current step.
6. **Assets and mobile.** Use a responsive base image or placeholder with HTML buttons for devices. Position overlays relative to the base. A text-labeled shortcut reaches the same action on mobile. Use local assets for critical UI and scene states. Optional video loads on demand and falls back to its still and text. Use short animations and honor reduced-motion settings.
7. **Connectivity.** Ship core mission data in the build. Once the core interface and required assets have loaded, it can continue through a connection drop. An initial visit or refresh while offline is outside this prototype's acceptance scope.

### Proposed repository layout

| Path | Contents |
|---|---|
| `src/game/` | Mission definitions, resource rules, state transitions and checkpoint behavior. |
| `src/ui/` | Scene rendering, controls, counters, decision and science panels, media and focus handling. |
| `src/data/` | Historical evidence and display copy shared across scenes. |
| `public/assets/` | Final or placeholder art, optional video and captions. |
| `tests/` | Rule checks runnable with `node --test`. |
| `docs/PRD.md` and `docs/ADR-001.md` | Approved product rules and this architecture decision. |
| `README.md` and `docs/BUILD_STATUS.md` | Run commands, current milestone, completed work, checks actually run and next action. |

Treat this layout as a starting point. Keep the rule and UI boundaries even if the first slice needs fewer files.

### Developer workflow and handoff

- Define `npm run dev` for local iteration, `npm test` for Node rule checks, `npm run build` for `dist/`, and `npm run preview` for a local check of that build. Serve `dist/` from a static HTTP(S) host for the judging link. A Vite development or preview process is for local testing.
- Start with the judging slice. Exercise budget limits, preview without mutation, duplicate confirmation, the 3→2 and 3→1 water paths, and a clean practice reset. Then check the first slice on laptop and mobile.
- Once the slice works, connect the story crises. Verify that greenhouse power changes the Oxygen choices, retry restores resources, and a no-purchase run reaches sunrise. Test the production build on both device types and exercise any optional media that ships.
- On each completed milestone, record the latest working commit, the commands and checks actually run, known issues, and the next scoped task in `docs/BUILD_STATUS.md`. The incoming coding model reads the PRD, ADR and build status, inspects the existing diff, reruns the relevant checks and resumes from that state. Keep the same decisions and assets when switching tools.
- Keep Vite as the only direct third-party development dependency for the first slice. At setup, review the resolved dependency tree and run `npm audit` against the lockfile. Review the specific version, license and published advisories for any added package or copied code. Keep the scope of package changes explicit. The audit can only be run once a lockfile exists.
- At the time of this ADR, published Vite 8.3.8 is outside the affected 8.3.0–8.3.6 range in GHSA-p4f5-76q4-ffq7. Recheck published advisories at install time. This is a source check for the proposed direct dependency. Dependency-tree audit and browser verification are implementation tasks.

### Technical references

- [Vite setup and supported Node versions](https://vite.dev/guide/)
- [Vite 8.3.8 release](https://github.com/vitejs/vite/releases/tag/v8.3.8)
- [Vite package and MIT license](https://www.npmjs.com/package/vite/v/8.3.8)
- [Vite published security advisories](https://github.com/vitejs/vite/security/advisories)
- [Vite 10 November 2026 advisory and patched versions](https://github.com/vitejs/vite/security/advisories/GHSA-p4f5-76q4-ffq7)
- [Vite static build and preview](https://vite.dev/guide/static-deploy.html)
- [Node.js release lines](https://nodejs.org/en/about/previous-releases)
- [Node.js built-in test runner](https://nodejs.org/api/test.html)

## 8. Build sequence and the three libraries

Extract the [build kit](https://chatgpt.com/library?file_id=libfile_3070a3c854248191a2f0ed12ab5ce265&account_id=personal) into the project folder and start with the [English master prompt](https://chatgpt.com/library?file_id=libfile_c3a65ba582ec819199b603303d185d0e&account_id=personal). Claude Code starts with Milestone A. Codex or another repository-capable coding tool can resume from the same project and `docs/BUILD_STATUS.md`. The milestone prompts below are ready to paste once their respective build step starts.

### Four-hour build schedule

| Window | Scope | Gate |
|---|---|---|
| **A · 0:00–1:15** | Static project and first playable slice. Start, loadout, practice water crisis, results, historical ISS comparison. Use placeholder art and no required video. | Budget enforcement, preview without mutation, one commit per decision, two water paths, retry, two ISS views, local build and laptop/portrait check. |
| **B · 1:15–2:45** | Full story route on the same base. Connect Power & Food, Heat & Shelter, Oxygen, Water & Waste, and Sunrise & Signal. | No-purchase run reaches sunrise. Verify the greenhouse-to-oxygen dependency, heat retry, delayed shelter meal effect and both signal branches. |
| **C · 2:45–3:15** | Integrate final character and base art if ready. Refine readability and scene states. Add at most one ready optional clip if core checks pass. | Assets have clear usage rights and paths. Fallbacks preserve the mission. Re-test the first decision on phone after inserting art. |
| **D · 3:15–4:00** | Freeze features, build, verify, and rehearse. Test the judging link or local production build and record the demo. | Laptop, portrait phone, and complete story or the explicitly scoped playable fallback. Document what shipped and what was actually tested. |

For a six-person team, two people can work on implementation with distinct file ownership, two prepare art, one checks science and English, and one owns device QA and demo recording. Assign one integrator to shared rules and merges. A browser-capable coding tool or a team member can verify the UI. Keep repository ownership with one editor per shared file at a time.

#### Milestone A prompt — First playable slice

```text
Implement Milestone A from the Qamar Square master prompt. Use the approved
PRD and ADR. Build the normal entry path from Start Mission through loadout
and the first water repair, then the training retry and ISS comparison.
Verify QS-01 to QS-04 and the applicable QS-09 interactions. Run npm test
and npm run build. Record observed browser/device results and pending
checks in docs/BUILD_STATUS.md. Stop at the verified first playable slice.
```

#### Milestone B prompt — Connected story

```text
Resume the working Qamar Square project. Read the PRD, ADR, BUILD_STATUS
and existing diff. Route Start Mission to the full story. Keep the
water practice accessible through a separate Water Training action. Reuse the preview/confirm/result controls and the
rule functions. Connect power to the oxygen restart, implement the heat
recovery and both shelter timings, consume the scheduled meals and water
once, and end at Sunrise & Signal. Verify the base-supplies route, QS-05
through QS-07, QS-10 and QS-12. Re-run the Milestone A checks. Update status.
```

#### Milestone C prompt — Asset and media integration

```text
Resume Qamar Square after the story gate. Integrate only ready approved
assets. Preserve the scene layout, resource rules and playable routes.
Apply the component and token guidance below. If a ready optional clip
fits this window, add it with captions, Skip and a local still/text
fallback. Recheck mobile portrait, focus, reduced motion and the
applicable QS-08/QS-11 behavior. Log each missing asset and its fallback.
```

#### Milestone D prompt — Judging candidate

```text
Run the Qamar Square production build and acceptance checks from the PRD.
Verify the water paths, one no-purchase success, a recovery and retry,
the final signal status, and any shipped video fallback. Check laptop
keyboard and phone portrait/touch. If a device or host is unavailable,
state exactly which check remains. Fix scoped regressions, update README
and BUILD_STATUS, and give the team the dist path, actual run commands,
the shipped scope, and a 90-second demo sequence. Use a judging URL
only if the team supplied and authorized a deployment target.
```

#### Resume prompt — Switching models

```text
Resume Qamar Square in this repository at the first incomplete milestone.
Read docs/PRD.md, docs/ADR-001.md, and docs/BUILD_STATUS.md. Inspect Git
status and the current code, preserve edits, reproduce the last relevant
check, then finish the next scoped task. If the prior tool stopped
mid-edit, identify the partial behavior and complete the current gate.
Log the exact checks you run and hand off from the same project.
```

### Tools library

| Tool | Use it for | Output and check |
|---|---|---|
| **Claude Code** | Start the project and implement the active milestone in the repository. | Working diff, run commands, observed test results and build status. [CLI reference](https://docs.anthropic.com/en/docs/claude-code/cli-usage) |
| **Codex** | Resume the same project if credits or availability change. Also useful for a scoped rule or UI review. | Same acceptance contract. Inspect existing code and preserve work in progress. [Codex CLI](https://developers.openai.com/codex/cli/) |
| **ChatGPT, Claude, Gemini** | Run an independent evidence and wording review when the model is available. Give each the same evidence table and ask for cited findings. | A claim, source, exact wording fix and keep/revise/drop verdict. Mark an unused model's review pending. |
| **Gemini CLI** | Optional coding backup if already configured and able to work in the same repository. | Use the resume prompt and the same milestone checks. [Gemini CLI](https://geminicli.com/docs/) |
| **Git** | Save verified milestone snapshots and compare edits during a handoff. | Working revision or current diff recorded in build status. |
| **Node.js 24 LTS, npm, Vite 8.3.8** | Install the pinned toolchain, run built-in Node tests, generate the static site. | `npm test`, `npm run build`, tracked lockfile and install-time dependency review. See the ADR for provenance and advisory references. |
| **Browser DevTools + physical phone** | Inspect keyboard/focus, portrait layouts, touch, optional video and the production build. | Record the browser, viewport or device, route and result. Label emulation and real-device checks separately. |
| **NASA NTRS and DONKI** | Verify data and attribution before adding player-facing content. | Local fields and a public source link as listed in `docs/Science_Evidence.md`. |

Keep model-specific tools interchangeable by using the same files and tests. A chat-only model can review a snippet or a claim. Repo edits and test runs need an environment that can access the project.

### Design system

Use the supplied original astronauts and base art when ready. Placeholder art uses the same device IDs and approximate positions so the art team can swap it after the slice works.

### Proposed visual defaults

| Token | Value or rule |
|---|---|
| Space background | Deep navy `#0B1730`. |
| Base rooms | Warm off-white `#FFF5E5` with ink text `#17233C`. |
| Accent and focus | Signal teal `#0D766E`, used with a distinct visible focus outline. |
| Warning | Amber surface `#FFE3A3` with dark text `#633A00`, plus warning icon and label. |
| Typography | **Atkinson Hyperlegible Next** if already available with documented usage rights, with a local system sans-serif fallback. Starting values are 16 px for body text, 18 px for primary actions and a 1.4 line height. [Font source](https://www.brailleinstitute.org/freefont/) |
| Touch and spacing | Aim for 44×44 CSS px core controls and an 8 px spacing base. Keep the active action and relevant resource visible on a 360 px portrait viewport. Check a narrow phone without horizontal scrolling. |
| Motion | Short scene feedback and a distinct sunrise transition. Show equivalent state changes when reduced motion is enabled. |

These are build defaults. Apply the team's approved asset colors if they provide clear readable labels and focus states.

### Reusable components

| Component | Behavior and states |
|---|---|
| **Base scene** | Responsive image or placeholder with semantic device buttons. Device states include inactive, active, focused and resolved. The mobile text shortcut opens the same control. |
| **Loadout card** | Displays item, cost and benefit. Supports selected, available and over-budget states with a text explanation. Show the proposed remaining balance before launch. |
| **Resource counter** | Icon, text label and current value. During preview, show projected value or the cost. Animate confirmed results without mutating game state. |
| **Decision card** | Situation, options, preview, **Confirm Choice**, result and **Continue**. Explain unavailable actions in place. Provide one clear primary action at a time. |
| **Recovery card** | Briefly names the resource that caused failure and offers **Try This Crisis Again**. Restored state shows the same resources and valid choices as at crisis entry. |
| **Science panel** | Plain-language claim, visual, source link and optional detail. ISS comparison uses **Recovered Water** and **Further Treatment**. The resource HUD uses **Drinking Water**. |
| **Media panel** | Local clip, English captions, Skip, and still/text fallback. Return focus to the current decision. |
| **Result and signal panel** | Celebrate sunrise, show the selected communication path, and end on waiting for confirmation. An optional Knowledge Meal opens only after the story result. |

### Skills library

| Playbook | Trigger | How to use it |
|---|---|---|
| **Turn evidence into gameplay** | Adding a science claim or number. | Check the primary source and scope. Mark it as historical evidence, a derived illustration, or a balance value. Connect the evidence to a visible choice or consequence and link the source. |
| **Review evidence with multiple models** | A claim is important to judging or wording is ambiguous. | Run the same audit request in the available models, compare source passages, and resolve discrepancies from the primary source. Ask for the exact English wording. |
| **Review the experience for both ages** | Updating a core screen or tutorial. | Walk through a hypothetical 8-year-old on a portrait phone and an 11-year-old on a laptop. Ask what they can see, choose and explain. Record plausible confusion as simulated design review. |
| **Verify a trade-off** | Adding or changing a rule. | Check two outcomes from the same checkpoint, preview without spending, one confirmation, and the downstream effect. Check that the base-supplies route stays possible. |
| **Check an optional asset** | Adding art, fonts or a video. | Verify source and permission, preview the asset at the target size, check a missing-file fallback and verify that core gameplay still continues. |
| **Check a code dependency** | A package, snippet or starter repo is proposed. | Check the specific version, license, official advisories and lockfile. Run the audit after installation. Add the dependency only if it solves an actual build need. |
| **Hand off and recover** | Switching coding tools or reaching a gate. | Update build status, preserve uncommitted work, record the last successful command, and give the next tool one scoped task. If a new feature breaks a gate, fix the scoped regression before adding features. |

### Time pressure and judging rehearsal

If the full story is behind schedule, preserve a working water practice, its two repair outcomes, the ISS comparison and mobile readability. Stop adding art or media once the verification window starts. Present the playable scope accurately.

| Time | What to show |
|---|---|
| **0–12s** | Name Qamar Square and set the stakes. A junior commander must bring the crew to sunrise with limited supplies. |
| **12–33s** | Choose the water kit within 10,000 credits. Preview and confirm repair. Show two bottles remaining. |
| **33–50s** | Replay the standard repair from the same three-bottle checkpoint. Show one bottle remaining. |
| **50–68s** | Switch 70% to 85% in the ISS panel. Show 14 to 17 drops moving to further treatment. Explain the gypsum trade-off and point out the NASA source. |
| **68–90s** | If the story route ships, show how saving power changes the oxygen options, then sunrise and the signal awaiting confirmation. If the practice slice is the shipped scope, show the actual build on phone and explain the planned connected route. |
