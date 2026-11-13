# Qamar Square — Product Requirements Document

**Status** — Approved for implementation after Stage 6  
**Audience** — Product, design, science and development team  
**Source of record** — Qamar Square conversation export and decisions approved in Stages 1–6. See ADR 001 for the approved Stage 7 architecture.  
**Build target** — Four-hour judging prototype, English-language, 2D, single-player browser game for mobile and laptop.

## 1. Product goal and scope

The player is a junior mission commander. They pack for the Moon with 10,000 Mission Credits, then make decisions across four connected crises on one lunar base map. The crew succeeds by surviving to sunrise. The player sends a signal. The story ends while the crew awaits confirmation from Earth.

A player should be able to explain one thing their choice gained and one thing it cost. For ages 7–9, the primary cues are short English sentences, visible equipment and immediate changes in resource icons. For ages 10–12, the same rules expose how an earlier choice affects a later crisis. Review both experiences with hypothetical player scenarios and verify the interaction on a laptop and phone. Report those checks as simulated design review and team QA.

| Priority | Required outcome |
|---|---|
| P0 · First playable slice | Start → loadout → practice water crisis → visible repair result → historical ISS comparison. Verify both repair paths and both input modes before expanding. |
| P1 · Full judging route | Pre-launch → Power & Food → Heat & Shelter → Oxygen → Water & Waste → Sunrise & Signal. Include the optional science panels for water and shelter. |
| P2 · Media and polish | Optional intro, notebook flashback, a result sentence driven by actual decisions, and one post-mission Knowledge Meal. Use available assets. |

## 2. Shared player interaction and mission state

- Open the highlighted device, select an option, preview its impact, select **Confirm Choice**, see the resource and scene changes, then select **Continue**. Use the same interaction for all crisis decisions. Include a text and icon cue for the active device.
- Preview uses the current resources and shows the result before the player commits. Re-selecting or closing the preview leaves the mission unchanged. Show the reason beside an unavailable option, such as **“You need 3 power units to restart the generator.”**
- Confirmation validates against current state and applies the decision and all of its consequences once. During the result animation, repeated taps and key presses cannot spend resources again. The animation presents the applied result.
- Keep one continuous story state for budget, confirmed equipment, resource balances, device and objective flags, and committed decisions that affect later events. Each confirmed decision shows only consequences that apply to the current run.
- At the start of each crisis, capture the state needed for a retry. **Try This Crisis Again** restores the snapshot, including equipment availability, resources, flags and relevant decision history. Preserve decisions committed before the snapshot. **Restart Mission** asks for confirmation and returns to a fresh loadout.
- A valid choice cannot spend more than is available. A result that reaches an unsafe condition opens a recovery screen with a specific explanation and retry. Story checkpoints preserve purchased equipment. The practice comparison can switch repair scenarios from a clean, fixed snapshot.
- Mobile portrait places the base above the decision card and offers a labeled active-device shortcut. Keep the relevant counter next to the choice. Laptop displays the base and decision panel together. Core actions work by tap, click and keyboard, with visible focus. Warnings and resource states have text or symbols in addition to color.
- A visible route continues when an optional video is skipped, unavailable or fails. All core decisions and required science data are available once the game has loaded. Checkpoints exist in memory during the page session. Reload opens a fresh run with **Start Mission**.

## 3. Loadout and balance defaults

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

## 4. Mission requirements

### Mission 1 — Power & Food

- **Keep Greenhouse Lights On** costs 2 power units and advances the crop indicator by one stage.
- **Save Power** spends 0 and pauses crop progress. Neither path yields a harvest during this mission. The crew relies on packed meals until sunrise.
- Show the lights and crop indicator changing and carry the remaining power into Heat & Shelter and Oxygen.

### Mission 2 — Heat & Shelter

- **Adjust Heat Control Valve** changes warmth from 1 to 2 and reduces the visible heat-loss arrow. **Leave It As Is** lets warmth fall from 1 to 0 and opens recovery. Show the expected warmth in both previews.
- **Prepare Shelter Early** spends 1 power unit to run work lights during setup and keeps warmth at 2. **Prepare at the Alert** saves that power. With a standard meal, the crew spends an extra meal-prep turn during the alert sequence and warmth falls by 1. A packed ready-to-eat meal is served in its place automatically and avoids that extra turn and warmth loss. Preview the applicable costs and explain the meal-pack benefit when it applies. These effects are scenario rules.
- The player selects a supply bag and then its marked position. Both paths reach the protected shelter if their costs are met. Both show the selected cost before confirmation. Use 1 meal after shelter completion, once. On the delayed route use the ready-to-eat pack if available. On the early route use a standard meal.
- Show the archived 11 May 2024 DONKI solar energetic particle event in the science panel. Identify STEREO-A as the observing spacecraft. Mark the game alert timing and warmth effects as scenario rules. The shelter concept is inspired by Orion's use of storage bags.

### Mission 3 — Oxygen

- Show **Cabin Oxygen** and **Generator Status** as distinct indicators. The crisis starts with the generator stopped.
- **Restart Generator** costs 3 power units. The generator adds 1 cabin oxygen unit during this turn and the crew uses 1, leaving cabin oxygen at 2. Retain the reserve charge.
- **Use Emergency Oxygen** spends the one reserve charge and leaves the generator stopped. The reserve adds 1 cabin oxygen unit and the crew uses 1, leaving cabin oxygen at 2. Preserve the remaining power.
- If the greenhouse choice preserved the power needed for a restart, tell the player at that moment. Check that the restart would have been unavailable under the other greenhouse choice with the same later spending. Explain in the science panel that a real generator uses water and electricity. The demo abstracts its water feed and tracks crew drinking water as a separate resource.

### Mission 4 — Water & Waste

- **Standard Repair** takes 2 turns and uses 2 bottles. **Use Repair Kit** is available when packed, takes 1 turn and uses 1 bottle. In each case, show the elapsed turn and bottle deduction in sequence. Mark the recycler repaired on successful completion. In the judging practice slice, begin at 3 bottles and use the confirmed loadout for the first repair. Standard repair ends at 1 bottle and kit repair at 2. The training comparison then offers both equipment scenarios from the fixed checkpoint.
- **Compare ISS Recovery** opens a teaching comparison. Label the modes **70% historical recovery** and **85% historical recovery**. Show 14 or 17 of 20 illustrative drops flowing to **Further Treatment**. Explain that lowering recovery reduced the risk of gypsum buildup in the historical case. This activity leaves the player's mission resources unchanged. Drinking water enters the tank only after the treatment step.
- In the practice slice, **Try Both Repair Paths** resets practice to the same 3-bottle checkpoint and offers the two training cases. In the story, checkpoint retry restores the actual packed equipment.
- After repair, offer **Print Cable Clip** for 1 power unit, or **Sort and Store Plastic** for 0. Printing uses compatible plastic and produces a clip the crew immediately uses to tidy the antenna cable. Sorting keeps the power. Both routes let the crew reach sunrise. The clip saves a cable-securing step if the player chooses to check the antenna in the epilogue. The clip does not resolve whether the signal will arrive.
- Use 1 packed meal after Water & Waste, once. An optional notebook still or flashback may show an experimental membrane result as a labeled test sample. Optional Brine Processor content requires a previously stored batch and shows recovered water going through further treatment. Keep both optional features outside the first playable slice.

### Sunrise & Signal

- After four completed crises and safe resources, reveal sunrise, show the panels beginning to charge, and let the crew celebrate.
- **Send Now** starts the transmission. **Check Antenna First** shows the antenna and cable state. If the printed clip is installed, offer **Send Signal** immediately. Otherwise, let the player select **Secure Cable**, then **Send Signal**. Signal controls are powered at sunrise, so entering with zero stored power is valid. Checking the antenna does not change signal travel time. Both choices reach the same story boundary.
- Indicate the signal's approximately 1.3-second one-way travel time on the animation or science card. End on **“Signal sent. Waiting for confirmation.”** The crew's survival is the chapter result. Earth receipt remains unresolved.

## 5. Optional video and rewards

- Intro — **Play Intro** leads to loadout on completion. **Skip Intro** enters loadout immediately. If the clip is unavailable, a still or one line of context leads to loadout.
- Notebook — open by choice during Water & Waste. Provide English captions, a visible skip action and a still/text fallback. Close or finish returns to the same decision and resource state.
- Knowledge Meals — open after the chapter result. Start with one short educational clip or equivalent still and text. A correct answer grants one learning badge for that item during the run. Reopening cannot award it twice. Crew meals and mission resources are unaffected.
- On-screen examples — **“Repair in 1 turn. Keep 2 bottles.”** · **“Keep the lights on. Use 2 power units.”** · **“The cabin got too cold. Try the heat valve again.”** Use actual state values in copy that shows counters.

## 6. Acceptance checks

These are implementation acceptance checks. The walkthrough below checks the approved balance on paper.

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

### Base-supplies walkthrough

Launch with **power 4 / water 4 / meals 2 / warmth 1 / cabin oxygen 2 / reserve 1**. Save greenhouse power. Adjust the valve, prepare the shelter early and use one meal. This leaves **power 3 / warmth 2 / meals 1**. Restart the generator and reach **power 0 / cabin oxygen 2 / reserve 1**. On entering the final crisis, the crew uses 1 water bottle. Standard repair reduces the remaining **3 → 2 → 1**. Sort the plastic, use the last meal and reach sunrise with **1 water bottle and 0 meals after the final meal was served**.

## 7. Science references

- [NASA NTRS — Historical ISS UPA recovery and precipitation](https://ntrs.nasa.gov/citations/20110023178)
- [NASA — ISS water treatment and the overall recovery milestone](https://www.nasa.gov/missions/station/nasa-achieves-water-recovery-milestone-on-international-space-station/)
- [NASA — Plant Biology Program and growth hardware](https://science.nasa.gov/biological-physical/focus-areas/plant-biology/hardware/)
- [NASA NTRS — Lunar thermal control concept](https://ntrs.nasa.gov/citations/20240004746)
- [NASA — Artemis II Reference Guide, Radiation Shelter](https://www.nasa.gov/wp-content/uploads/2026/01/a2-reference-guide-012825.pdf)
- [NASA DONKI — Archived SEP notification, 11 May 2024](https://ccmc.gsfc.nasa.gov/DONKI/events/30717/1/)
- [NASA — ISS oxygen generation and supply, chapter 19](https://www.nasa.gov/wp-content/uploads/2018/04/iss-operating_an_outpost-tagged.pdf)
- [NASA — Refabricator technology demonstration](https://www.nasa.gov/image-article/refabricator-recycle-reuse-plastic-installed-space-station/)
- [NASA NTRS — Earth–Moon radio signal delay](https://ntrs.nasa.gov/citations/20240007214)
- [Khumalo et al. — Laboratory membrane distillation study](https://doi.org/10.1016/j.seppur.2018.10.035)
