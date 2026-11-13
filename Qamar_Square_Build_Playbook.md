# Qamar Square — Build playbook and libraries

This playbook assumes a new project and four hours. Put the kit's root files and `docs/` into one project folder. Paste `Qamar_Square_Master_Prompt.md` into Claude Code from that folder. It starts Milestone A. Use the next milestone prompt after the previous result is playable. Codex or another repository-capable coding tool can resume from the same folder.

## 1. Four-hour build schedule

| Window | Scope | Gate |
|---|---|---|
| **A · 0:00–1:15** | Static project and first playable slice. Start, loadout, practice water crisis, results, historical ISS comparison. Use placeholder art and no required video. | Budget enforcement, preview without mutation, one commit per decision, two water paths, retry, two ISS views, local build and laptop/portrait check. |
| **B · 1:15–2:45** | Full story route on the same base. Connect Power & Food, Heat & Shelter, Oxygen, Water & Waste, and Sunrise & Signal. | No-purchase run reaches sunrise. Verify the greenhouse-to-oxygen dependency, heat retry, delayed shelter meal effect and both signal branches. |
| **C · 2:45–3:15** | Integrate final character and base art if ready. Refine readability and scene states. Add at most one ready optional clip if core checks pass. | Assets have clear usage rights and paths. Fallbacks preserve the mission. Re-test the first decision on phone after inserting art. |
| **D · 3:15–4:00** | Freeze features, build, verify, and rehearse. Test the judging link or local production build and record the demo. | Laptop, portrait phone, and complete story or the explicitly scoped playable fallback. Document what shipped and what was actually tested. |

For a six-person team, two people can work on implementation with distinct file ownership, two prepare art, one checks science and English, and one owns device QA and demo recording. Assign one integrator to shared rules and merges. A browser-capable coding tool or a team member can verify the UI. Keep repository ownership with one editor per shared file at a time.

### Milestone A prompt — First playable slice

```text
Implement Milestone A from the Qamar Square master prompt. Use the approved
PRD and ADR. Build the normal entry path from Start Mission through loadout
and the first water repair, then the training retry and ISS comparison.
Verify QS-01 to QS-04 and the applicable QS-09 interactions. Run npm test
and npm run build. Record observed browser/device results and pending
checks in docs/BUILD_STATUS.md. Stop at the verified first playable slice.
```

### Milestone B prompt — Connected story

```text
Resume the working Qamar Square project. Read the PRD, ADR, BUILD_STATUS
and existing diff. Route Start Mission to the full story. Keep the
water practice accessible through a separate Water Training action. Reuse the preview/confirm/result controls and the
rule functions. Connect power to the oxygen restart, implement the heat
recovery and both shelter timings, consume the scheduled meals and water
once, and end at Sunrise & Signal. Verify the base-supplies route, QS-05
through QS-07, QS-10 and QS-12. Re-run the Milestone A checks. Update status.
```

### Milestone C prompt — Asset and media integration

```text
Resume Qamar Square after the story gate. Integrate only ready approved
assets. Preserve the scene layout, resource rules and playable routes.
Apply the component and token guidance below. If a ready optional clip
fits this window, add it with captions, Skip and a local still/text
fallback. Recheck mobile portrait, focus, reduced motion and the
applicable QS-08/QS-11 behavior. Log each missing asset and its fallback.
```

### Milestone D prompt — Judging candidate

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

### Resume prompt — Switching models

```text
Resume Qamar Square in this repository at the first incomplete milestone.
Read docs/PRD.md, docs/ADR-001.md, and docs/BUILD_STATUS.md. Inspect Git
status and the current code, preserve edits, reproduce the last relevant
check, then finish the next scoped task. If the prior tool stopped
mid-edit, identify the partial behavior and complete the current gate.
Log the exact checks you run and hand off from the same project.
```

## 2. Tools library

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

Use this request for independent reviews when Claude or Gemini is available:

```text
Audit the attached Qamar Square science evidence against its primary
sources. For each claim, give the supporting page, section or event ID,
classify any number as historical, derived, or game balance, and give
a keep/revise/drop verdict with one exact English wording improvement.
Check ISS 70%/85% versus total water recovery, recovered versus drinking
water, DONKI observation location, and one-way signal travel versus
receipt. Mark anything you could not verify.
```

## 3. Design system

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

## 4. Skills library

| Playbook | Trigger | How to use it |
|---|---|---|
| **Turn evidence into gameplay** | Adding a science claim or number. | Check the primary source and scope. Mark it as historical evidence, a derived illustration, or a balance value. Connect the evidence to a visible choice or consequence and link the source. |
| **Review evidence with multiple models** | A claim is important to judging or wording is ambiguous. | Run the same audit request in the available models, compare source passages, and resolve discrepancies from the primary source. Ask for the exact English wording. |
| **Review the experience for both ages** | Updating a core screen or tutorial. | Walk through a hypothetical 8-year-old on a portrait phone and an 11-year-old on a laptop. Ask what they can see, choose and explain. Record plausible confusion as simulated design review. |
| **Verify a trade-off** | Adding or changing a rule. | Check two outcomes from the same checkpoint, preview without spending, one confirmation, and the downstream effect. Check that the base-supplies route stays possible. |
| **Check an optional asset** | Adding art, fonts or a video. | Verify source and permission, preview the asset at the target size, check a missing-file fallback and verify that core gameplay still continues. |
| **Check a code dependency** | A package, snippet or starter repo is proposed. | Check the specific version, license, official advisories and lockfile. Run the audit after installation. Add the dependency only if it solves an actual build need. |
| **Hand off and recover** | Switching coding tools or reaching a gate. | Update build status, preserve uncommitted work, record the last successful command, and give the next tool one scoped task. If a new feature breaks a gate, fix the scoped regression before adding features. |

## 5. Time pressure and judging rehearsal

If the full story is behind schedule, preserve a working water practice, its two repair outcomes, the ISS comparison and mobile readability. Stop adding art or media once the verification window starts. Present the playable scope accurately.

| Time | What to show |
|---|---|
| **0–12s** | Name Qamar Square and set the stakes. A junior commander must bring the crew to sunrise with limited supplies. |
| **12–33s** | Choose the water kit within 10,000 credits. Preview and confirm repair. Show two bottles remaining. |
| **33–50s** | Replay the standard repair from the same three-bottle checkpoint. Show one bottle remaining. |
| **50–68s** | Switch 70% to 85% in the ISS panel. Show 14 to 17 drops moving to further treatment. Explain the gypsum trade-off and point out the NASA source. |
| **68–90s** | If the story route ships, show how saving power changes the oxygen options, then sunrise and the signal awaiting confirmation. If the practice slice is the shipped scope, show the actual build on phone and explain the planned connected route. |
