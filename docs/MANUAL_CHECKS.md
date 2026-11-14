# What Ahmed should test

These are the remaining **physical-phone** checks. Desktop automated tests, production browser flows, reduced-motion runtime, 360/375 px portrait layouts and Chrome Mobile touch emulation have passed. No physical phone was available to the agent. Use your intended judging phone/browser; record its model, OS, browser and pass/fail.

## Open the final build on the phone

From PowerShell on the computer:

```powershell
Set-Location -LiteralPath 'D:\~\NASA Space Apps Qamar Square'
npm run build
npm run preview -- --host 0.0.0.0 --port 4174 --strictPort
```

Port 4174 avoids the existing localhost preview on 4173. Keep the computer running. Put the phone on the same LAN and open `http://<computer-LAN-IP>:4174/`. To find the computer's active LAN IPv4 address:

```powershell
Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway } | Select-Object InterfaceAlias, @{Name='IPv4';Expression={$_.IPv4Address.IPAddress}}
```

## Physical-device checklist

| Check | Exact steps | Expected result |
|---|---|---|
| Portrait and scrolling | Hold the phone in portrait. Open Start, then Start Mission. Swipe the packing list, launch without purchases, open the greenhouse and swipe the choices. | Base above the tray; no sideways page scrolling. Labels, resource preview and Confirm are readable and reachable. Vertical swipes scroll without making a choice. |
| Touch choice and recovery | Choose Save Power → Confirm → Continue. Open the heat valve, choose Leave It As Is → Confirm. Tap Try This Crisis Again. | Save Power keeps power 4. Cold result shows warmth 0 and a friendly retry. Retry restores power 4 and warmth 1, with choices available again. |
| Full story and summary | Adjust valve → Confirm → Continue. Prepare Shelter Early → Confirm. Tap supply bag, then marked spot, then Continue. Restart Generator → Confirm → Continue. Standard Repair → Confirm → Continue. Sort and Store Plastic → Confirm → Continue. At sunrise, open antenna, choose Check Antenna First → Confirm → Continue, then Secure Cable → Confirm → Continue, then Send Signal → Confirm → Continue. | Bag placement works without dragging. Standard repair uses two bottles from 3, leaving 1. Crew reaches sunrise. Final supplies: power 0, water 1, meals 0, warmth 2, cabin oxygen 2, reserve 1. Summary mentions saved power/restart, early shelter, standard repair and sorting. Final line is “Signal sent. Waiting for confirmation.” Earth receipt remains unresolved. |
| Both training repairs | Reload the page to return to Start. Tap Water Training → Train with Repair Kit. Open recycler, choose Use Repair Kit, inspect preview and Confirm. Tap Try Both Repair Paths → Train with Standard Tools. Open recycler, choose Standard Repair, inspect preview and Confirm. | Each case starts with 3 bottles. Kit: 1 turn, 2 bottles left. Standard: 2 turns, 1 bottle left. Training offers another practice and Back to Start, never a story victory. |
| ISS comparison and close | From either training result, note the drinking-water count. Open Compare ISS Recovery. Tap historical 70%, then historical 85%. Swipe upward until Sources and Close are visible; tap Close. | Exactly 20 illustrative drops; 14 or 17 marked recovered and routed to Further Treatment. Historical labels and NASA links are visible. Close returns to the same repair result with the same drinking-water count. |
| Phone Reduce Motion | In the phone's system accessibility settings, enable Reduce Motion/remove animations. Reload the game and repeat the story route or both training repairs. Check device glow cues, toy taps, bag placement, generator, sunrise and sent signal. Restore your usual setting afterward. | No ongoing wiggle/spin/bobbing or travelling signal. State changes and feedback still appear. Repair result is available without timed progression while reporting the same 1/2 turn costs. All taps, retry, comparison and final waiting line still work. |

If any check fails, note the exact screen/action, expected result, observed result and device/browser. Screenshots or a short recording will help reproduce it. These checks do not require video assets, an account or deployment.
