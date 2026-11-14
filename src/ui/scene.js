// Qamar Square moon-base scene. Owner: Lane B.
// Contract: specs/plan.md §5.4. The scene is decorative SVG plus real <button> hotspots.
// updateScene only writes data-* attributes on the root; src/styles/scene.css does the rest.

export const DEVICE_FOR_STEP = {
  greenhouse: 'greenhouse',
  valve: 'valve',
  shelter: 'shelter',
  oxygen: 'oxygen',
  repair: 'recycler',
  plastic: 'printer',
  signal: 'antenna',
  antenna: 'antenna',
};

const STEP_ORDER = ['greenhouse', 'valve', 'shelter', 'oxygen', 'repair', 'plastic', 'signal', 'antenna', 'done'];

const ROOM_FOR_DEVICE = {
  greenhouse: 'greenhouse',
  valve: 'power',
  shelter: 'quarters',
  bag: 'quarters',
  'bag-spot': 'quarters',
  oxygen: 'life',
  recycler: 'water',
  printer: 'water',
  antenna: 'roof',
};

// Hotspot boxes in SVG units (viewBox 1200 x 900): [x, y, width, height].
const HOTSPOTS = [
  { id: 'antenna', label: 'Antenna', box: [318, 40, 164, 152] },
  { id: 'greenhouse', label: 'Greenhouse', box: [140, 222, 270, 240] },
  { id: 'bag', label: 'Supply bag', box: [584, 226, 160, 150] },
  { id: 'bag-spot', label: 'Bag spot', box: [790, 314, 148, 150] },
  { id: 'shelter', label: 'Shelter', box: [940, 240, 140, 224] },
  { id: 'valve', label: 'Heat valve', box: [142, 566, 128, 136] },
  { id: 'oxygen', label: 'Oxygen', box: [474, 540, 148, 226] },
  { id: 'recycler', label: 'Recycler', box: [780, 590, 150, 176] },
  { id: 'printer', label: '3D printer', box: [934, 590, 148, 176] },
];

// Free-play toys: they only bounce and never reach the game.
const TOYS = [
  { id: 'earth', label: 'Earth', box: [50, 30, 150, 150] },
  { id: 'rover', label: 'Moon rover', box: [975, 786, 150, 108] },
];

// Crew floor spots in SVG units [x, y]: y is the floor line under their feet.
// Each spot keeps the active device, its label chip and its click area clear.
const LEAD_SPOT = {
  greenhouse: [456, 452],
  quarters: [740, 452],
  power: [304, 752],
  life: [648, 752],
  water: [1046, 752],
  roof: [600, 182],
};
const WATER_SPOT_FOR = { recycler: [1046, 752], printer: [846, 752] };
const PARTNER_SPOT = [740, 452];
const PARTNER_ALT_SPOT = [456, 452];

const STARS = [
  [36, 44, 3], [232, 30, 2], [286, 96, 3], [22, 210, 2], [58, 330, 3], [30, 470, 2], [70, 560, 2],
  [540, 36, 3], [612, 92, 2], [680, 40, 2], [760, 70, 3], [850, 28, 2], [930, 64, 2], [1010, 34, 3],
  [1160, 40, 2], [1178, 190, 3], [1150, 300, 2], [1172, 430, 2], [1140, 560, 3], [1176, 680, 2],
  [240, 150, 2], [600, 150, 2], [46, 700, 2], [1130, 730, 2], [490, 70, 2], [1080, 150, 2],
];

const TAP_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3v12M6 10l6 6 6-6" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 21h14" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';

function room(name, x, y, w, h) {
  const f = y + h - 24; // floor band top
  return `
    <clipPath id="sc-clip-${name}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22"/></clipPath>
    <rect class="room-bg" x="${x}" y="${y}" width="${w}" height="${h}" rx="22"/>
    <ellipse class="room-glow" clip-path="url(#sc-clip-${name})" cx="${x + w / 2}" cy="${y}" rx="${w * 0.46}" ry="${h * 0.7}"/>
    <path class="room-floor" d="M${x} ${f}H${x + w}V${f + 2}a22 22 0 0 1-22 22H${x + 22}a22 22 0 0 1-22-22Z"/>
    <rect class="o room-edge room-edge--${name}" x="${x}" y="${y}" width="${w}" height="${h}" rx="22"/>`;
}

function snowflake(x, y) {
  return `<path d="M${x} ${y - 12}v24M${x - 10} ${y - 6}l20 12M${x - 10} ${y + 6}l20-12"/>`;
}

function check(x, y, s = 1) {
  return `<path class="tick" d="M${x - 8 * s} ${y}l${6 * s} ${6 * s}l${10 * s}-${12 * s}"/>`;
}

function art() {
  const stars = STARS.map(([x, y, r], i) => `<circle class="star${i % 4 === 0 ? ' star--twinkle' : ''}" cx="${x}" cy="${y}" r="${r}"/>`).join('');

  const lamps = [190, 275, 360]
    .map(
      (x) => `
      <path class="beam" d="M${x - 14} 260L${x - 46} 400H${x + 46}L${x + 14} 260Z"/>
      <path class="o lamp" d="M${x - 22} 244h44l-8 18h-28z"/>`,
    )
    .join('');

  const sprouts = [190, 275, 360]
    .map(
      (x) => `
      <g class="crop crop--seed">
        <path class="stem" d="M${x} 402v-14"/>
        <path class="o-thin leaf" d="M${x} 390q-12-12-18 0q10 8 18 0Z"/>
        <path class="o-thin leaf" d="M${x} 390q12-12 18 0q-10 8-18 0Z"/>
      </g>
      <g class="crop crop--grown">
        <path class="stem" d="M${x} 402V340"/>
        <path class="o-thin leaf" d="M${x} 384q-28-16-32 6q20 12 32-6Z"/>
        <path class="o-thin leaf" d="M${x} 368q28-16 32 6q-20 12-32-6Z"/>
        <path class="o-thin leaf" d="M${x} 352q-24-18-28 2q16 12 28-2Z"/>
        <path class="o-thin leaf" d="M${x} 342q-14-22 0-32q14 10 0 32Z"/>
      </g>`,
    )
    .join('');

  // Cells are listed bottom first so :nth-child(-n + power) lights from the bottom up.
  const cells = Array.from({ length: 7 }, (_, i) => {
    const y = 722 - i * 30;
    return `<g class="cell"><rect x="350" y="${y}" width="66" height="22" rx="7"/><path class="bolt" d="M386 ${y + 2}l-10 10h7l-4 8l11-11h-7z"/></g>`;
  }).join('');

  const bottles = Array.from({ length: 5 }, (_, i) => {
    const x = 808 + i * 50;
    return `<g class="bottle">
      <rect class="bottle-cap" x="${x + 8}" y="503" width="14" height="11" rx="3"/>
      <path class="bottle-body" d="M${x + 6} 514h18q6 6 6 14v22q0 6-6 6h-18q-6 0-6-6v-22q0-8 6-14z"/>
      <path class="bottle-wave" d="M${x + 4} 534q6-5 11 0t11 0"/>
    </g>`;
  }).join('');

  const panels = [730, 845, 960]
    .map(
      (x) => `
      <g class="panel">
        <path class="mast" d="M${x + 52} 176v12"/>
        <path class="o panel-face" d="M${x} 176l14-52h92l-14 52z"/>
        <path class="panel-grid" d="M${x + 37} 124l-14 52M${x + 68} 124l-14 52M${x + 7} 150h92"/>
        <path class="o-thin charge" d="M${x + 58} 78l-13 17h10l-6 15l17-19h-10z"/>
      </g>`,
    )
    .join('');

  const frost = [[468, 420], [610, 252], [1046, 232], [312, 528], [652, 528], [1050, 596]].map(([x, y]) => snowflake(x, y)).join('');

  const sunRays = Array.from({ length: 8 }, (_, i) => `<path transform="rotate(${i * 45} 1135 95)" d="M1135 30v-16"/>`).join('');

  return `
<svg class="scene__art" viewBox="0 0 1200 900" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="sc-night" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" class="st-space"/><stop offset="1" class="st-space-2"/>
    </linearGradient>
    <linearGradient id="sc-dawn" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" class="st-dawn-0"/><stop offset="0.5" class="st-dawn-1"/><stop offset="1" class="st-dawn-2"/>
    </linearGradient>
    <radialGradient id="sc-lamp" cx="0.5" cy="0" r="1">
      <stop offset="0" class="st-glow" stop-opacity="0.6"/><stop offset="1" class="st-glow" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect class="sky-night" width="1200" height="900" fill="url(#sc-night)"/>
  <rect class="sky-dawn" width="1200" height="900" fill="url(#sc-dawn)"/>
  <g class="stars">${stars}</g>

  <g class="sun">
    <g class="sun-rays">${sunRays}</g>
    <circle class="o sun-disc" cx="1135" cy="95" r="44"/>
  </g>

  <g class="dev" data-dev="earth">
    <circle class="o earth-sea" cx="125" cy="105" r="56"/>
    <path class="earth-land" d="M92 76q18-14 34-4q8 12-6 20q-4 14-18 10q-16-8-10-26ZM132 118q20-8 30 6q2 16-12 24q-16 2-20-12q-4-10 2-18Z"/>
    <path class="earth-cloud" d="M84 112q14-8 26 0M128 84q14-8 28 0M104 142q12-6 22 0"/>
    <path class="earth-shade" d="M125 49a56 56 0 0 1 0 112a70 70 0 0 0 0-112Z"/>
  </g>

  <g class="signal">
    <path class="wave wave--1" d="M362 70q-20 26 0 52"/>
    <path class="wave wave--2" d="M362 70q-20 26 0 52"/>
    <path class="wave wave--3" d="M362 70q-20 26 0 52"/>
  </g>

  <path class="moon" d="M0 800Q200 778 420 792T800 790T1200 796V900H0Z"/>
  <ellipse class="crater" cx="70" cy="850" rx="46" ry="11"/>
  <ellipse class="crater" cx="330" cy="868" rx="60" ry="12"/>
  <ellipse class="crater" cx="640" cy="846" rx="38" ry="9"/>
  <ellipse class="crater" cx="860" cy="872" rx="52" ry="11"/>
  <ellipse class="crater" cx="1160" cy="842" rx="30" ry="8"/>

  <g class="heat-arrow">
    <path class="o heat-arrow__shape" d="M98 622H54V602L10 640L54 678V658H98Z"/>
    <path class="heat-arrow__waves" d="M40 640q7-8 14 0t14 0t14 0"/>
  </g>

  <rect class="o foot" x="170" y="784" width="110" height="26" rx="9"/>
  <rect class="o foot" x="545" y="784" width="110" height="26" rx="9"/>
  <rect class="o foot" x="860" y="784" width="110" height="26" rx="9"/>
  <rect class="o shell" x="100" y="192" width="1000" height="600" rx="40"/>
  <rect class="o roof" x="86" y="176" width="1028" height="34" rx="17"/>
  <rect class="o vent" x="92" y="612" width="22" height="56" rx="7"/>

  <g class="rooms">
    ${room('greenhouse', 118, 216, 380, 256)}
    ${room('quarters', 518, 216, 564, 256)}
    ${room('power', 118, 492, 320, 280)}
    ${room('life', 458, 492, 300, 280)}
    ${room('water', 778, 492, 304, 280)}
  </g>

  <!-- Greenhouse -->
  <g class="porthole">
    <circle class="o porthole-glass" cx="452" cy="262" r="28"/>
    <circle class="star" cx="443" cy="254" r="3"/><circle class="star" cx="462" cy="272" r="2"/>
  </g>
  <g class="dev" data-dev="greenhouse">
    ${lamps}
    <rect class="o metal" x="150" y="226" width="250" height="18" rx="9"/>
    <rect class="soil" x="160" y="396" width="230" height="16" rx="8"/>
    ${sprouts}
    <rect class="o planter" x="150" y="404" width="250" height="44" rx="12"/>
    <path class="planter-drop" d="M275 414c7 9 9 12 9 17a9 9 0 0 1-18 0c0-5 2-8 9-17z"/>
  </g>

  <!-- Crew Quarters -->
  <g class="beacon">
    <path class="beacon-rays" d="M724 236l-16 8M752 252v16M780 236l16 8"/>
    <rect class="o metal" x="728" y="216" width="48" height="12" rx="4"/>
    <path class="o beacon-dome" d="M734 228a18 18 0 0 0 36 0Z"/>
    <path class="beacon-mark" d="M752 231v6"/>
  </g>
  <g class="bunk">
    <rect class="o wood" x="536" y="424" width="200" height="24" rx="8"/>
    <rect class="o blanket" x="544" y="398" width="184" height="30" rx="13"/>
    <rect class="o pillow" x="550" y="386" width="54" height="26" rx="11"/>
    <path class="blanket-fold" d="M620 400v26"/>
  </g>
  <rect class="o wood" x="530" y="330" width="180" height="12" rx="6"/>
  <g class="bag-static">
    <path class="bag-handle" d="M560 288q16-20 32 0"/>
    <rect class="o bag-b" x="548" y="286" width="56" height="44" rx="13"/>
    <path class="bag-seam" d="M556 304h40"/>
  </g>
  <g class="dev" data-dev="shelter">
    <path class="shelter-wall" d="M812 448V318q0-78 127-78q127 0 127 78V448"/>
    <path class="shelter-seams" d="M812 448V318q0-78 127-78q127 0 127 78V448"/>
    <path class="o shelter-arch" d="M812 448V318q0-78 127-78q127 0 127 78V448"/>
    <g class="shield">
      <path class="o shield-plate" d="M1004 296l30 12v24q0 26-30 38q-30-12-30-38v-24z"/>
      ${check(1003, 334, 1.3)}
      <path class="shield-open" d="M1004 318v18M1004 346v1"/>
    </g>
  </g>
  <g class="dev" data-dev="bag-spot">
    <ellipse class="spot" cx="866" cy="436" rx="50" ry="12"/>
    <path class="spot-arrow" d="M866 372v30M853 391l13 13l13-13"/>
  </g>
  <g class="bag-move">
    <g class="dev" data-dev="bag">
      <path class="bag-handle" d="M648 284q16-22 32 0"/>
      <rect class="o bag-a" x="632" y="282" width="64" height="48" rx="14"/>
      <path class="bag-mark" d="M664 292l11 5v8q0 10-11 15q-11-5-11-15v-8z"/>
    </g>
  </g>

  <!-- Power Room -->
  <path class="pipe-edge" d="M112 640H250V498"/>
  <path class="pipe" d="M112 640H250V498"/>
  <g class="dev" data-dev="valve">
    <circle class="o valve-body" cx="200" cy="640" r="46"/>
    <g class="valve-wheel">
      <circle class="o wheel" cx="200" cy="640" r="31"/>
      <path class="wheel-spokes" d="M200 609V671M169 640H231"/>
      <circle class="o knob" cx="200" cy="609" r="10"/>
    </g>
    <circle class="hub" cx="200" cy="640" r="8"/>
    <g class="valve-tag">
      <circle class="o tag-plate" cx="246" cy="590" r="17"/>
      ${check(245, 590)}
      <path class="tag-open" d="M238 586q4-5 8 0t8 0M238 595q4-5 8 0t8 0"/>
    </g>
  </g>
  <g class="battery">
    <rect class="o metal" x="366" y="506" width="34" height="18" rx="5"/>
    <rect class="o battery-body" x="340" y="520" width="86" height="232" rx="16"/>
    <g class="cells">${cells}</g>
  </g>

  <!-- Life Support -->
  <g class="dev" data-dev="oxygen">
    <g class="o2-bubbles">
      <circle cx="548" cy="532" r="7"/><circle cx="534" cy="516" r="5"/><circle cx="562" cy="508" r="6"/>
    </g>
    <rect class="o metal" x="522" y="548" width="52" height="32" rx="10"/>
    <rect class="o machine" x="484" y="574" width="128" height="174" rx="24"/>
    <text class="lbl" x="500" y="606">O₂</text>
    <circle class="o fan-window" cx="548" cy="668" r="46"/>
    <g class="fan">
      <path d="M548 668q-12-34 12-40q16 20-12 40Z"/>
      <path transform="rotate(120 548 668)" d="M548 668q-12-34 12-40q16 20-12 40Z"/>
      <path transform="rotate(240 548 668)" d="M548 668q-12-34 12-40q16 20-12 40Z"/>
    </g>
    <circle class="hub" cx="548" cy="668" r="8"/>
    <g class="gen-status">
      <circle class="o status-plate" cx="588" cy="598" r="15"/>
      ${check(587, 598, 0.9)}
      <path class="status-stop" d="M588 590v9M588 605v1"/>
    </g>
  </g>
  <g class="reserve">
    <rect class="o metal" x="698" y="566" width="22" height="20" rx="5"/>
    <rect class="o tank" x="678" y="584" width="62" height="152" rx="31"/>
    <rect class="tank-fill" x="687" y="593" width="44" height="134" rx="22"/>
    ${check(708, 662, 1.1)}
    <path class="tank-empty" d="M698 650l22 22M720 650l-22 22"/>
    <rect class="o metal" x="668" y="734" width="82" height="14" rx="6"/>
  </g>

  <!-- Water Workshop -->
  <rect class="o wood" x="796" y="556" width="270" height="12" rx="6"/>
  <g class="bottles">${bottles}</g>
  <g class="dev" data-dev="recycler">
    <path class="o metal" d="M820 610h60l-12 24h-36z"/>
    <rect class="o machine machine--water" x="800" y="632" width="100" height="116" rx="22"/>
    <circle class="o fan-window" cx="850" cy="692" r="31"/>
    <path class="drop" d="M850 672c11 14 15 20 15 27a15 15 0 0 1-30 0c0-7 4-13 15-27z"/>
    <path class="crack" d="M811 692l8 12l-8 10l8 12"/>
    <ellipse class="puddle" cx="808" cy="751" rx="24" ry="6"/>
    <g class="badge badge--warn">
      <path class="o" d="M808 604l23 40h-46z"/>
      <path class="badge-mark" d="M808 619v11M808 636v1"/>
    </g>
    <g class="badge badge--ok">
      <circle class="o" cx="808" cy="626" r="17"/>
      ${check(807, 626)}
    </g>
  </g>
  <g class="dev" data-dev="printer">
    <circle class="o spool" cx="1012" cy="614" r="21"/>
    <circle class="hub" cx="1012" cy="614" r="6"/>
    <path class="frame-edge" d="M966 742V642H1058V742"/>
    <path class="frame" d="M966 742V642H1058V742"/>
    <rect class="o head" x="996" y="642" width="32" height="26" rx="7"/>
    <path class="o nozzle" d="M1005 668h14l-7 13z"/>
    <path class="print-layers" d="M996 716h32M1000 708h24M1004 700h16"/>
    <rect class="o bed" x="978" y="720" width="68" height="10" rx="4"/>
    <rect class="o metal" x="952" y="736" width="120" height="14" rx="6"/>
    <g class="badge badge--printed">
      <circle class="o" cx="1062" cy="630" r="15"/>
      ${check(1061, 630, 0.9)}
    </g>
  </g>

  <!-- Roof -->
  <g class="panels">${panels}</g>
  <g class="dev" data-dev="antenna">
    <path class="cable cable--loose" d="M406 150q44-10 56 12q10 20-10 22q-18 0-10-14"/>
    <circle class="cable-end" cx="442" cy="170" r="5"/>
    <path class="cable cable--tidy" d="M406 150V170H470"/>
    <path class="mast" d="M400 164V108"/>
    <g transform="rotate(-34 400 100)">
      <path class="mast mast--thin" d="M400 100V66"/>
      <circle class="o feed" cx="400" cy="64" r="7"/>
      <path class="o dish" d="M350 98a50 30 0 0 0 100 0z"/>
    </g>
    <rect class="o metal" x="374" y="160" width="52" height="20" rx="7"/>
    <g class="clip">
      <rect class="o clip-body" x="396" y="140" width="24" height="16" rx="6"/>
      <path class="clip-mark" d="M402 148h12"/>
    </g>
  </g>

  <g class="dev" data-dev="rover">
    <path class="mast mast--thin" d="M1082 826v-22"/>
    <circle class="o feed" cx="1082" cy="802" r="6"/>
    <rect class="o rover-body" x="996" y="822" width="108" height="34" rx="14"/>
    <rect class="o rover-window" x="1008" y="808" width="44" height="26" rx="10"/>
    <circle class="o wheel" cx="1014" cy="864" r="14"/>
    <circle class="o wheel" cx="1050" cy="864" r="14"/>
    <circle class="o wheel" cx="1086" cy="864" r="14"/>
  </g>

  <g class="frost">${frost}</g>
</svg>`;
}

function percentBox([x, y, w, h]) {
  const pct = (n, of) => `${Math.round((n / of) * 10000) / 100}%`;
  return `left:${pct(x + w / 2, 1200)};top:${pct(y + h / 2, 900)};width:${pct(w, 1200)};height:${pct(h, 900)}`;
}

function hotspotMarkup() {
  const devices = HOTSPOTS.map(
    (h) => `
    <button type="button" class="hot" data-device="${h.id}" tabindex="-1" aria-label="${h.label}" style="${percentBox(h.box)}">
      <span class="hot__ring" aria-hidden="true"></span>
      <span class="hot__cue" aria-hidden="true">${TAP_ICON}Tap</span>
      <span class="hot__chip" aria-hidden="true"><svg class="hot__done" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 12.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>${h.label}</span>
    </button>`,
  ).join('');
  const toys = TOYS.map(
    (t) => `<button type="button" class="hot hot--toy" data-toy="${t.id}" tabindex="-1" aria-label="${t.label}" style="${percentBox(t.box)}"></button>`,
  ).join('');
  return devices + toys;
}

/** The one mounted scene: { root, buttons, groups, crew, delta }. */
let scene = null;
let activeId = null;
/** The last committed decision already reacted to, so each confirm animates once. */
let lastSeen = null;

const idx = (step) => STEP_ORDER.indexOf(step);
const reduceMotion = () => Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

/** Which devices are finished, for the check-mark state. Story only; training only repairs. */
function doneDevices(state) {
  if (!state) return new Set();
  const at = idx(state.step);
  const f = state.flags;
  const done = new Set();
  if (f.recycler) done.add('recycler');
  if (state.mode === 'practice') return done;
  if (at > idx('greenhouse')) done.add('greenhouse');
  if (f.valve && at > idx('valve')) done.add('valve');
  if (f.shelter && at > idx('shelter')) done.add('shelter');
  if (at > idx('oxygen')) done.add('oxygen');
  if (at > idx('plastic')) done.add('printer');
  if (f.sent) done.add('antenna');
  return done;
}

const pctX = (x) => `${Math.round((x / 1200) * 10000) / 100}%`;
const pctY = (y) => `${Math.round((y / 900) * 10000) / 100}%`;

/** Speaker beside the active device, partner waiting in another room; together on the roof at sunrise. */
function crewSpots(state, v, active, room) {
  if (!state || (v.screen !== 'play' && v.screen !== 'end')) return { girl: [709, 452], boy: [771, 452] };
  if (room === 'roof') return { girl: [572, 182], boy: [636, 182] };
  const device = active ?? DEVICE_FOR_STEP[state.step];
  const lead = room === 'water' ? WATER_SPOT_FOR[device] ?? LEAD_SPOT.water : LEAD_SPOT[room] ?? PARTNER_SPOT;
  const partner = room === 'quarters' ? PARTNER_ALT_SPOT : PARTNER_SPOT;
  return v.speaker === 'boy' ? { girl: partner, boy: lead } : { girl: lead, boy: partner };
}

const DELTA_LABEL = { power: 'Power', water: 'Water', warmth: 'Warmth', oxygen: 'Oxygen', reserve: 'Reserve', meals: 'Meals', readyMeals: 'Ready meal' };
const DELTA_ORDER = ['warmth', 'power', 'water', 'reserve', 'oxygen', 'meals', 'readyMeals'];

/** One short line for the change the player just made, e.g. "Warmth 1 → 2". */
function deltaText(last) {
  if (!last?.before || !last?.after) return '';
  const key = DELTA_ORDER.find((k) => last.after[k] !== last.before[k]);
  return key ? `${DELTA_LABEL[key]} ${last.before[key]} → ${last.after[key]}` : '';
}

function play(el, frames, options) {
  if (!el || typeof el.animate !== 'function' || reduceMotion()) return;
  el.animate(frames, options);
}

/** Short reactions tied to what the player just confirmed. The outcome is already drawn by data-*. */
function react(state, v) {
  const last = state?.last;
  if (!last || last === lastSeen || state.phase === 'choose') return;
  lastSeen = last;
  const device = scene.groups.get(DEVICE_FOR_STEP[last.step]);
  const lead = scene.crew[v.speaker === 'boy' ? 'boy' : 'girl'];
  if (state.phase === 'recovery') {
    play(lead, [{ translate: '-50% -100%' }, { translate: 'calc(-50% - 4px) -100%' }, { translate: 'calc(-50% + 4px) -100%' }, { translate: '-50% -100%' }], { duration: 360, iterations: 2 });
    return;
  }
  play(device, [{ scale: '1' }, { scale: '1.08' }, { scale: '1' }], { duration: 520, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
  play(lead, [{ translate: '-50% -100%' }, { translate: '-50% -112%' }, { translate: '-50% -100%' }], { duration: 480, delay: 160, easing: 'ease-out' });
}

function bounce(el) {
  if (!el || typeof el.animate !== 'function') return;
  if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  el.animate(
    [{ translate: '0 0', scale: '1' }, { translate: '0 -9px', scale: '1.06' }, { translate: '0 0', scale: '1' }],
    { duration: 380, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  );
}

/**
 * Build the SVG base and its hotspot buttons inside `root`. Call once.
 * @param {HTMLElement} root
 * @param {{ onDevice: (id: string) => void }} handlers
 */
export function mountScene(root, { onDevice } = {}) {
  root.classList.add('scene');
  root.innerHTML = `
    <div class="scene__stage">
      ${art()}
      <img class="scene__crew scene__crew--girl" src="./assets/crew/girl-body.webp" alt="" width="147" height="320" decoding="async" draggable="false" />
      <img class="scene__crew scene__crew--boy" src="./assets/crew/boy-body.webp" alt="" width="147" height="320" decoding="async" draggable="false" />
      <div class="scene__notes" aria-hidden="true">
        <span class="scene__note scene__note--cold">Brr! Too cold</span>
        <span class="scene__note scene__note--alert">Storm alert!</span>
        <span class="scene__note scene__note--charge">Panels charging</span>
        <span class="scene__note scene__note--signal">about 1.3 s</span>
        <span class="scene__note scene__note--delta"></span>
      </div>
      <div class="scene__hotspots">${hotspotMarkup()}</div>
    </div>`;

  const buttons = new Map();
  const groups = new Map();
  for (const btn of root.querySelectorAll('.hot')) buttons.set(btn.dataset.device ?? btn.dataset.toy, btn);
  for (const g of root.querySelectorAll('[data-dev]')) groups.set(g.dataset.dev, g);
  scene = { root, buttons, groups, crew: {
    girl: root.querySelector('.scene__crew--girl'),
    boy: root.querySelector('.scene__crew--boy'),
  }, delta: root.querySelector('.scene__note--delta') };
  activeId = null;
  lastSeen = null;

  root.querySelector('.scene__hotspots').addEventListener('click', (event) => {
    const btn = event.target.closest('.hot');
    if (!btn) return;
    const id = btn.dataset.device;
    if (id && id === activeId) {
      onDevice?.(id);
      return;
    }
    bounce(groups.get(id ?? btn.dataset.toy));
  });

  updateScene(null, { screen: 'start', open: false, selected: null, bagStage: 0, seq: null });
}

function clamp(n, lo, hi) {
  const v = Number.isFinite(n) ? Math.round(n) : lo;
  return Math.min(hi, Math.max(lo, v));
}

function setActive(id) {
  if (id === activeId) return;
  for (const key of [activeId, id]) {
    if (!key) continue;
    const on = key === id;
    const btn = scene.buttons.get(key);
    const spot = HOTSPOTS.find((h) => h.id === key);
    btn?.classList.toggle('is-active', on);
    btn?.setAttribute('tabindex', on ? '0' : '-1');
    if (btn && spot) btn.setAttribute('aria-label', on ? `${spot.label}. Tap to use it.` : spot.label);
    scene.groups.get(key)?.classList.toggle('is-active', on);
  }
  activeId = id;
}

/**
 * Reflect the game state in the scene. `state` may be null on the start and loadout screens.
 * Cheap and idempotent: it only writes attributes whose value changed.
 * @param {object|null} state
 * @param {{ screen: string, open?: boolean, selected: string|null, bagStage: 0|1|2, seq: number|null }} view
 */
export function updateScene(state, view) {
  if (!scene) return;
  const v = view ?? {};
  const playing = Boolean(state) && v.screen === 'play';
  const step = state?.step ?? null;
  const flags = state?.flags ?? {};
  const res = state?.res ?? {};
  const bagStep = step === 'shelter' && state.phase === 'result';

  let active = null;
  if (playing) {
    if (bagStep && (v.bagStage ?? 0) < 2) active = v.bagStage === 1 ? 'bag-spot' : 'bag';
    else active = DEVICE_FOR_STEP[step] ?? null;
  }

  // The bag stays where the player put it once the shelter step is behind us.
  let bag = 0;
  if (step === 'shelter') bag = clamp(v.bagStage ?? 0, 0, 2);
  else if (flags.shelter) bag = 2;

  const stepIndex = STEP_ORDER.indexOf(step);
  const beforeOxygen = !state || state.mode === 'practice' || stepIndex < STEP_ORDER.indexOf('oxygen');
  const generator = flags.generator ? 'on' : beforeOxygen ? 'idle' : 'off';
  const recycler = flags.recycler ? 'ok' : step === 'repair' ? 'broken' : 'idle';

  let water = res.water ?? 4;
  if (typeof v.seq === 'number') water = state?.last?.sequence?.[v.seq]?.water ?? water;

  let crewRoom = 'quarters';
  if (state && (v.screen === 'play' || v.screen === 'end')) {
    crewRoom = step === 'done' ? 'roof' : ROOM_FOR_DEVICE[active ?? DEVICE_FOR_STEP[step]] ?? 'quarters';
  }

  const data = {
    screen: v.screen ?? 'start',
    active: active ?? 'none',
    open: v.open ? 1 : 0,
    room: crewRoom,
    lights: flags.lights ? 1 : 0,
    crop: clamp(flags.crop ?? 0, 0, 3),
    warmth: clamp(res.warmth ?? 1, 0, 2),
    valve: flags.valve ? 1 : 0,
    power: clamp(res.power ?? 4, 0, 7),
    alert: step === 'shelter' ? 1 : 0,
    bag,
    shelter: bag === 2 ? 'protected' : 'open',
    generator,
    reserve: (res.reserve ?? 1) > 0 ? 1 : 0,
    recycler,
    water: clamp(water, 0, 5),
    clip: flags.clip ? 1 : 0,
    cable: flags.clip || flags.cable ? 'tidy' : 'loose',
    sunrise: flags.sunrise ? 1 : 0,
    sent: flags.sent ? 1 : 0,
  };

  data.phase = state?.phase ?? 'none';
  const showDelta = playing && state.phase === 'result' && typeof v.seq !== 'number' && Boolean(state.last);
  const delta = showDelta ? deltaText(state.last) : '';
  data.delta = delta ? 1 : 0;

  const { dataset } = scene.root;
  for (const [key, value] of Object.entries(data)) {
    const text = String(value);
    if (dataset[key] !== text) dataset[key] = text;
  }
  setActive(active);

  // Crew spots, as inline custom properties the CSS transitions between.
  const spots = crewSpots(state, v, active, crewRoom);
  for (const who of ['girl', 'boy']) {
    const [x, y] = spots[who];
    const el = scene.crew[who];
    if (!el) continue;
    el.style.setProperty('--crew-x', pctX(x));
    el.style.setProperty('--crew-y', pctY(y));
    el.dataset.lead = String(playing && (v.speaker === 'boy') === (who === 'boy'));
  }

  // Finished devices keep a check mark; active and finished never share a look.
  const done = doneDevices(state);
  for (const [id, btn] of scene.buttons) {
    if (!btn.dataset.device) continue;
    btn.classList.toggle('is-done', done.has(id) && id !== active);
  }

  // The change the player just made, pinned above the device they used.
  if (scene.delta) {
    const spot = HOTSPOTS.find((h) => h.id === DEVICE_FOR_STEP[state?.last?.step]);
    if (delta && spot) {
      const [x, y, w] = spot.box;
      scene.delta.textContent = delta;
      scene.delta.style.left = pctX(x + w / 2);
      scene.delta.style.top = pctY(Math.max(y, 60));
    }
  }

  if (playing) react(state, v);
}
