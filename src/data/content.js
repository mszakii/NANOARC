// Qamar Square: ALL player-facing copy and labels. Owner: Lane C.
// Short English for ages 7 to 9: concrete nouns, one thought per sentence.
// Numbers shown to the player always come from game state, never from this file,
// except fixed PRD costs that are part of a label.

/** The two crew members. The team has not named them yet: change the names here only. */
export const CREW = {
  girl: { name: 'Commander Noor' },
  boy: { name: 'Engineer Sami' },
};

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export const UI = {
  title: 'Qamar Square',
  tagline: 'Pack for the Moon. Make tough choices. Keep your crew safe until sunrise.',
  start: 'Start Mission',
  stageLabel: 'Moon base',
  trayLabel: 'Mission panel',

  loadoutTitle: 'Pack for the Moon',
  loadoutIntro: 'You have 10,000 Mission Credits. Pick what to pack. You can also pack nothing.',
  budgetLabel: 'Mission Credits',
  spentLabel: 'Spent',
  leftLabel: 'Left',
  credits: 'credits',
  packed: 'Packed',
  notPacked: 'Tap to pack',
  budgetOk: (left) => `You have ${left} credits left.`,
  budgetOver: (over) => `That is ${over} credits too many. Take one item out. Then you can launch.`,
  launch: 'Launch Mission',

  tapHint: 'You can also tap the marked device in the base.',
  choicesLabel: 'Your choices',
  picked: 'Picked',
  locked: 'Not ready',
  previewTitle: 'If you choose this:',
  previewFree: 'This uses nothing.',
  pickFirst: 'Pick a choice first.',
  confirm: 'Confirm Choice',
  continue: 'Continue',
  retry: 'Try This Crisis Again',
  restart: 'Restart Mission',
  science: 'Science Behind This',
  turnChip: (n) => plural(n, 'turn', 'turns'),
  freeChip: 'Free',

  restartTitle: 'Restart Mission?',
  restartBody: 'You will go back and pack again. This mission will be lost.',
  restartYes: 'Yes, Restart Mission',
  restartNo: 'Keep Playing',

  resultTalk: 'Here is what happened.',
  recoveryTalk: 'Oh no! We can fix this.',
  turnTalk: 'We are fixing the recycler.',

  bagLead: {
    early: 'The work lights are on. Now build the shelter.',
    at_alert: 'The alert is here! Build the shelter fast.',
  },
  bagTitle: 'Build the shelter',
  bagStep0: 'Pick up the supply bag.',
  bagStep1: 'Put the bag on the marked spot.',
  bagStep2: 'The bag is in place. The shelter is ready.',
  bagPick: 'Pick Up the Supply Bag',
  bagPlace: 'Put the Bag on the Marked Spot',
  bagWait: 'Place the supply bag first.',

  turnOf: (n, total) => `Turn ${n} of ${total}`,
  turnBottles: (n) => `${plural(n, 'bottle', 'bottles')} left`,
  turnWait: 'The repair is still running.',

  endEyebrow: 'Sunrise',
  endTitle: 'The crew is safe!',
  endBody: 'Your crew survived until sunrise. The solar panels are charging again.',
  endFinal: 'Signal sent. Waiting for confirmation.',
  endSupplies: 'What you had left',
  playAgain: 'Play Again',

  // Intro still (video slot: intro). Shown in place of the optional intro clip.
  introAlt: 'Commander Noor and Engineer Sami in their space suits',
  introLine: 'Night is falling on the Moon base. The crew needs a commander to keep them safe until sunrise.',

  // Water Training (practice mode).
  training: 'Water Training',
  trainingTitle: 'Water Training',
  trainingIntro: 'Practice the water crisis. You start with 3 bottles every time. Your story mission does not change.',
  trainKit: 'Train with Repair Kit',
  trainKitWhat: 'The kit fixes the recycler in 1 turn.',
  trainStandard: 'Train with Standard Tools',
  trainStandardWhat: 'Normal tools fix the recycler in 2 turns.',
  trainBoth: 'Try Both Repair Paths',
  trainDone: 'Training done! Try the other way and compare the bottles left.',
  backToStart: 'Back to Start',

  compareIss: 'Compare ISS Recovery',
  notebook: 'Open Notebook',
  soundOn: 'Sound Effects: On',
  soundOff: 'Sound Effects: Off',
  soundNone: 'Sound Effects: not available',

  summaryTitle: 'Your choices',

  errorTitle: 'Mission control is not ready',
  errorBody: 'The mission rules are still being built. Try again in a moment.',
};

/** HUD counters. `key` matches `state.res`. */
export const RES = {
  power: { label: 'Power', short: 'Power', icon: 'power', one: 'power unit', many: 'power units' },
  water: { label: 'Drinking Water', short: 'Water', icon: 'water', one: 'bottle', many: 'bottles' },
  meals: { label: 'Crew Meals', short: 'Meals', icon: 'meals', one: 'meal', many: 'meals' },
  readyMeals: { label: 'Ready-to-Eat Meal', icon: 'readyMeal', one: 'ready meal', many: 'ready meals' },
  warmth: { label: 'Warmth', short: 'Warmth', icon: 'warmth', of: 2 },
  oxygen: { label: 'Cabin Oxygen', short: 'Oxygen', icon: 'oxygen' },
  reserve: { label: 'Emergency Reserve', short: 'Reserve', icon: 'reserve' },
};

export const HUD = {
  label: 'Mission supplies',
  becomes: 'will become',
  of: 'of',
  readyNote: (n) => `${n} ready-to-eat`,
  generator: 'Generator Status',
  generatorShort: 'Generator',
  generatorIcon: 'generator',
  running: 'Running',
  stopped: 'Stopped',
  runningMark: 'play',
  stoppedMark: 'stop',
};

export const ITEMS_COPY = {
  battery: {
    name: 'Spare Battery',
    icon: 'power',
    does: 'Adds 3 power units at launch.',
    when: 'Helps when lights and machines need power.',
  },
  kit: {
    name: 'Water Repair Kit',
    icon: 'kit',
    does: 'Fixes the water recycler in 1 turn, not 2.',
    when: 'Helps in the water crisis. It saves 1 bottle.',
  },
  mealPack: {
    name: 'Extra Crew Meal Pack',
    icon: 'readyMeal',
    does: 'Adds 1 ready-to-eat meal.',
    when: 'Helps if the crew must eat fast in the shelter.',
  },
};
export const ITEM_ORDER = ['battery', 'kit', 'mealPack'];

/**
 * One entry per step. `say(state)` is the short situation line.
 * `options[id]` holds the exact PRD label, an icon and a plain hint for the preview.
 */
export const STEPS = {
  greenhouse: {
    eyebrow: 'Crisis 1 of 4',
    crisis: 'Power & Food',
    open: 'Open the Greenhouse',
    who: 'girl',
    mood: 'determined',
    science: 'plants',
    say: (s) => `The Moon night is long. The greenhouse lights use power. You have ${plural(s.res.power, 'power unit', 'power units')}.`,
    options: {
      lights_on: { label: 'Keep Greenhouse Lights On', icon: 'lamp', hint: 'The plants keep growing.' },
      save_power: { label: 'Save Power', icon: 'moon', hint: 'The lights go off. The plants wait.' },
    },
  },
  valve: {
    eyebrow: 'Crisis 2 of 4',
    crisis: 'Heat & Shelter',
    open: 'Open the Heat Control Valve',
    who: 'boy',
    mood: 'worried',
    science: 'heat',
    say: () => 'Brr! Heat is leaking out of the cabin. The heat valve can slow the leak.',
    options: {
      adjust: { label: 'Adjust Heat Control Valve', icon: 'wrench', hint: 'Less heat leaks out.' },
      leave: { label: 'Leave It As Is', icon: 'cold', hint: 'The heat keeps leaking out.' },
    },
  },
  shelter: {
    eyebrow: 'Crisis 2 of 4',
    crisis: 'Heat & Shelter',
    open: 'Go to the Shelter Corner',
    who: 'girl',
    mood: 'surprised',
    science: 'shelter',
    say: () => 'The Sun may send fast particles. The crew needs a shelter made of supply bags.',
    options: {
      early: { label: 'Prepare Shelter Early', icon: 'shelter', hint: 'Work lights use power. The crew eats a meal after.' },
      at_alert: { label: 'Prepare at the Alert', icon: 'alert', hint: 'You keep your power. The crew eats in a hurry.' },
    },
  },
  oxygen: {
    eyebrow: 'Crisis 3 of 4',
    crisis: 'Oxygen',
    open: 'Open the Oxygen Generator',
    who: 'boy',
    mood: 'worried',
    science: 'oxygen',
    say: (s) => `The oxygen generator has stopped. The crew needs air. You have ${plural(s.res.power, 'power unit', 'power units')}.`,
    options: {
      restart: { label: 'Restart Generator', icon: 'generator', hint: 'The generator makes new oxygen. You keep the reserve.' },
      reserve: { label: 'Use Emergency Oxygen', icon: 'reserve', hint: 'The reserve tank is used up. You keep your power.' },
    },
  },
  repair: {
    eyebrow: 'Crisis 4 of 4',
    crisis: 'Water & Waste',
    open: 'Open the Water Recycler',
    who: 'girl',
    mood: 'worried',
    science: 'water',
    say: (s) =>
      s.mode === 'practice'
        ? `Training time! The water recycler is broken. You have ${plural(s.res.water, 'bottle', 'bottles')}. Each repair turn uses 1 bottle.`
        : `The crew drank 1 bottle. Now the water recycler is broken. You have ${plural(s.res.water, 'bottle', 'bottles')}. Each repair turn uses 1 bottle.`,
    options: {
      standard: { label: 'Standard Repair', icon: 'wrench', hint: 'A slow fix with the normal tools.' },
      kit: { label: 'Use Repair Kit', icon: 'kit', hint: 'A fast fix with the kit you packed.' },
    },
  },
  plastic: {
    eyebrow: 'Crisis 4 of 4',
    crisis: 'Water & Waste',
    open: 'Open the 3D Printer',
    who: 'boy',
    mood: 'determined',
    science: 'plastic',
    say: () => 'There is used plastic in the bin. The 3D printer can turn it into a cable clip.',
    options: {
      print: { label: 'Print Cable Clip', icon: 'printer', hint: 'The clip holds the antenna cable. The crew eats a meal after.' },
      sort: { label: 'Sort and Store Plastic', icon: 'recycle', hint: 'You keep your power. The crew eats a meal after.' },
    },
  },
  signal: {
    eyebrow: 'Sunrise',
    crisis: 'Sunrise & Signal',
    open: 'Open the Antenna',
    who: 'girl',
    mood: 'happy',
    science: 'signal',
    say: () => 'Sunrise! The solar panels are charging. It is time to send a signal to Earth.',
    options: {
      send_now: { label: 'Send Now', icon: 'antenna', hint: 'The signal goes out right away.' },
      check_antenna: { label: 'Check Antenna First', icon: 'search', hint: 'The crew looks at the antenna and its cable.' },
    },
  },
  antenna: {
    eyebrow: 'Sunrise',
    crisis: 'Sunrise & Signal',
    open: 'Open the Antenna',
    who: 'boy',
    mood: 'determined',
    science: 'signal',
    say: (s) => {
      if (s.flags.clip) return 'The printed clip holds the cable. The antenna is ready.';
      if (s.flags.cable) return 'The cable is tight now. The antenna is ready.';
      return 'The antenna cable is loose. The crew can secure it.';
    },
    options: {
      secure_cable: { label: 'Secure Cable', icon: 'cable', hint: 'The crew ties the cable down.' },
      send: { label: 'Send Signal', icon: 'antenna', hint: 'The signal goes out to Earth.' },
    },
  },
};

/** Why an option is unavailable. Looked up as `step:option:need`, then by `need`. */
const REASONS = {
  'greenhouse:lights_on:power': (r) => `You need ${plural(r.amount ?? 2, 'power unit', 'power units')} to keep the lights on.`,
  'shelter:early:power': (r) => `You need ${plural(r.amount ?? 1, 'power unit', 'power units')} for the work lights.`,
  'oxygen:restart:power': (r) => `You need ${plural(r.amount ?? 3, 'power unit', 'power units')} to restart the generator.`,
  'oxygen:reserve:reserve': () => 'The emergency reserve tank is empty.',
  'repair:standard:water': (r) => `You need ${plural(r.amount ?? 3, 'bottle', 'bottles')} for the standard repair.`,
  'repair:kit:kit': () => 'You did not pack the Water Repair Kit.',
  'repair:kit:water': (r) => `You need ${plural(r.amount ?? 2, 'bottle', 'bottles')} to use the repair kit.`,
  'plastic:print:power': (r) => `You need ${plural(r.amount ?? 1, 'power unit', 'power units')} to run the 3D printer.`,
  'antenna:send:cable': () => 'The cable is loose. Secure the cable first.',
  'antenna:secure_cable:cable': () => 'The cable is already secure.',
  power: (r) => (r.amount ? `You need ${plural(r.amount, 'power unit', 'power units')} for this.` : 'You need more power for this.'),
  water: (r) => (r.amount ? `You need ${plural(r.amount, 'bottle', 'bottles')} for this.` : 'You need more bottles for this.'),
  reserve: () => 'The emergency reserve tank is empty.',
  kit: () => 'You did not pack the Water Repair Kit.',
  cable: () => 'The cable needs care first.',
};

export function reasonText(step, optionId, reason) {
  if (step === 'antenna' && optionId === 'secure_cable') return REASONS['antenna:secure_cable:cable']();
  const need = reason?.need;
  const fn = REASONS[`${step}:${optionId}:${need}`] ?? REASONS[need];
  return fn ? fn(reason ?? {}) : 'This choice is not ready right now.';
}

const mealsLeft = (a) => {
  const n = a.meals + a.readyMeals;
  return n === 0 ? 'That was the last meal. Sunrise is close.' : `You have ${plural(n, 'meal', 'meals')} left.`;
};

/** Result sentences. `a` is the resource snapshot after the decision. */
const RESULTS = {
  'greenhouse:lights_on': (a) => `The lights stay on. The plants grow a little. You have ${plural(a.power, 'power unit', 'power units')} left.`,
  'greenhouse:save_power': (a) => `The lights are off. The plants wait. You still have ${plural(a.power, 'power unit', 'power units')}.`,
  'valve:adjust': (a) => `You set the valve. Less heat leaks out. Warmth is now ${a.warmth} of 2.`,
  'valve:leave': () => 'The cabin got too cold. Try the heat valve again.',
  'shelter:early': (a) => `The shelter was ready early. You have ${plural(a.power, 'power unit', 'power units')} left. The crew ate a meal.`,
  'shelter:at_alert': (a) => `The crew built the shelter at the alert. You still have ${plural(a.power, 'power unit', 'power units')}.`,
  'oxygen:restart': (a) => `The generator is running again. Cabin oxygen is ${a.oxygen}. You have ${plural(a.power, 'power unit', 'power units')} left.`,
  'oxygen:reserve': (a) => `The crew used the emergency oxygen. Cabin oxygen is ${a.oxygen}. The generator is still stopped.`,
  'repair:standard': (a, last) => `The recycler works again. The repair took ${plural(last.sequence?.length ?? 2, 'turn', 'turns')}. You have ${plural(a.water, 'bottle', 'bottles')} left.`,
  'repair:kit': (a, last) => `The kit fixed the recycler in ${plural(last.sequence?.length ?? 1, 'turn', 'turns')}. You have ${plural(a.water, 'bottle', 'bottles')} left.`,
  'plastic:print': (a) => `The printer made a cable clip. The crew ate a meal. ${mealsLeft(a)}`,
  'plastic:sort': (a) => `The plastic is sorted and stored. You kept your power. The crew ate a meal. ${mealsLeft(a)}`,
  'signal:send_now': () => 'The signal is on its way. It takes about 1.3 seconds to reach Earth.',
  'signal:check_antenna': () => 'The crew walks to the antenna to look at the cable.',
  'antenna:secure_cable': () => 'The crew tied the cable down. The antenna is ready.',
  'antenna:send': () => 'The signal is on its way. It takes about 1.3 seconds to reach Earth.',
};

const NOTES = {
  ready_meal_served: (a) => `The crew ate the ready meal right away. No cooking turn was needed. Warmth stays at ${a.warmth} of 2.`,
  meal_prep_turn: (a) => `Cooking a meal took one more turn. Warmth fell to ${a.warmth} of 2.`,
  saved_power_enabled_restart: () => 'Your saved power made the restart possible.',
  clip_installed: () => 'The crew put the clip on the antenna cable.',
  too_cold: () => '',
};

export function resultText(last, res) {
  const a = last.after ?? res;
  const fn = RESULTS[`${last.step}:${last.option}`];
  return fn ? fn(a, last) : 'Done.';
}

export function noteTexts(last, res) {
  const a = last.after ?? res;
  return (last.notes ?? []).map((code) => NOTES[code]?.(a) ?? '').filter(Boolean);
}

/** End-card sentences built from the decisions the player actually confirmed. */
export function summaryLines(state) {
  const did = (step, option) => state.history.some((h) => h.step === step && h.option === option);
  const lines = [];
  if (did('greenhouse', 'save_power') && did('oxygen', 'restart')) lines.push('You saved power at the greenhouse. That power restarted the oxygen generator later.');
  else if (did('greenhouse', 'lights_on')) lines.push('You kept the greenhouse lights on. The plants grew a little.');
  else if (did('greenhouse', 'save_power')) lines.push('You saved power at the greenhouse.');
  if (did('oxygen', 'reserve')) lines.push('You used the emergency oxygen. You kept your power.');
  if (did('shelter', 'early')) lines.push('You built the shelter early. It cost 1 power unit.');
  if (did('shelter', 'at_alert')) lines.push(state.loadout.mealPack ? 'You built the shelter at the alert. The ready meal saved time and warmth.' : 'You built the shelter at the alert. Cooking took an extra turn.');
  if (did('repair', 'kit')) lines.push('Your repair kit fixed the water in 1 turn. It saved 1 bottle.');
  if (did('repair', 'standard')) lines.push('The standard repair took 2 turns and 2 bottles.');
  if (did('plastic', 'print')) lines.push('Your printed clip held the antenna cable.');
  if (did('plastic', 'sort')) lines.push('You sorted the plastic and kept your power.');
  return lines;
}

export const RECOVERY = {
  valve: 'The cabin got too cold. Try the heat valve again.',
  oxygen: 'The cabin air got too thin. Try the oxygen crisis again.',
  repair: 'The crew ran low on water. Try the repair again.',
  fallback: 'That did not keep the crew safe. Try this crisis again.',
};

/** Notebook experiment "Test the Membrane". Short labels for ages 7 to 12. */
export const NOTEBOOK = {
  title: 'Test the Membrane',
  warmLabel: 'Warm used water',
  membraneLabel: 'Membrane',
  coolLabel: 'Cool side',
  cupLabel: 'TEST SAMPLE',
  start: 'Start the Test',
  running: 'Testing…',
  collect: 'Collect the Test Sample',
  again: 'Run the Test Again',
  steps: ['Warm the used water.', 'Watch vapor pass through the membrane.', 'Collect the drops in the cup.'],
  stepIndex: { ready: 0, running: 1, done: 2, collected: 3 },
  status: {
    ready: 'Press Start the Test to warm the used water.',
    running: 'Vapor rises from the warm water. Only vapor fits through the tiny holes.',
    done: 'On the cool side, the vapor turns back into drops. They drip into the cup.',
    collected: 'You collected a Test Sample for the lab.',
  },
  badge: 'goes to the lab. It is not drinking water. The crew’s bottles did not change.',
  figure: {
    ready: 'Warm used water on the left, a membrane in the middle, a cool side and an empty Test Sample cup on the right.',
    running: 'Vapor dots move from the warm water through the membrane to the cool side.',
    done: 'Drops form on the cool side and fill the Test Sample cup.',
    collected: 'The Test Sample cup is full and collected.',
  },
};

/** Science Behind This. One topic per step. Source links come from docs/Science_Evidence.md. */
export const SCIENCE_UI = {
  heading: 'Science Behind This',
  teaching: 'The units and turns in this game are teaching values. They are made up to keep the game simple. They are not real measurements.',
  sources: 'Sources',
  newTab: '(opens in a new tab)',
  issModes: [
    { pct: 70, drops: 14, label: '70% historical recovery' },
    { pct: 85, drops: 17, label: '85% historical recovery' },
  ],
  issSettings: 'Historical urine-processor recovery settings',
  issTreated: (n) => `${n} of 20 drops go to Further Treatment.`,
  issLeft: (n) => `${n} drops stay behind as brine.`,
  issWhy: {
    70: 'Less water recovered, but a lower risk of mineral buildup.',
    85: 'More water recovered, but minerals built up and stopped the machine.',
  },
  issLegendTreated: 'Recovered water → Further Treatment',
  issLegendLeft: 'Left behind',
  issNote: 'Illustration only. Your crew’s drinking water does not change.',
  stillCaption: 'Notebook still',
  close: 'Close',
};

export const SCIENCE = {
  plants: {
    title: 'Growing plants in space',
    body: [
      'Plants in space cannot use sunlight the way they do on Earth. NASA grows them in special boxes with lamps, water and plant food.',
      'Lamps need electricity. In our game the crew must choose between light for the plants and power for later.',
    ],
    links: [{ label: 'NASA Plant Biology Program', href: 'https://science.nasa.gov/biological-physical/focus-areas/plant-biology/hardware/' }],
  },
  heat: {
    title: 'Keeping warm on the Moon',
    body: [
      'The Moon gets very cold at night. NASA studied a heat control idea for the Moon that lets less heat escape when it gets colder outside.',
      'In our game the valve makes the heat-loss arrow smaller. The warmth levels are game rules.',
    ],
    links: [{ label: 'NASA lunar thermal control poster', href: 'https://ntrs.nasa.gov/citations/20240004746' }],
  },
  shelter: {
    title: 'Shelter from solar particles',
    body: [
      'On May 11, 2024, a spacecraft detected fast-moving particles from the Sun. In our mission, a solar particle alert means the crew needs shelter.',
      'On the Orion spacecraft, the crew can stack storage bags to add more shielding. Our shelter uses the same idea. The alert timing and the warmth effects are scenario rules for this game.',
    ],
    factsTitle: 'Historical event from NASA DONKI',
    facts: [
      ['Event category', 'Solar Energetic Particle (SEP)'],
      ['Observed at', '2024-05-11 04:07 UTC'],
      ['Observing spacecraft', 'STEREO-A'],
      ['NASA activity ID', '2024-05-11T04:07:00-SEP-001'],
    ],
    links: [
      { label: 'NASA DONKI event record', href: 'https://ccmc.gsfc.nasa.gov/DONKI/events/30717/1/' },
      { label: 'NASA DONKI notification', href: 'https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/Alert/30728/1' },
      { label: 'NASA Artemis II Reference Guide', href: 'https://www.nasa.gov/wp-content/uploads/2026/01/a2-reference-guide-012825.pdf' },
    ],
  },
  oxygen: {
    title: 'Making oxygen',
    body: [
      'On the International Space Station, a machine uses electricity to split water. That makes oxygen for the crew. A tank can also supply oxygen.',
      'A real generator needs water and electricity. Our game leaves out its water feed. Drinking water is counted on its own.',
    ],
    links: [{ label: 'NASA ISS reference, chapter 19', href: 'https://www.nasa.gov/wp-content/uploads/2018/04/iss-operating_an_outpost-tagged.pdf' }],
  },
  water: {
    title: 'Recycling water on the space station',
    body: [
      'Historical record: the space station recycles water. Its machine first recovered 85% of the water. Later the team set it to 70%.',
      'The station team lowered water recovery after mineral buildup stopped the machine. The lower setting recovered less water and helped reduce buildup. The recovered water went through another treatment step.',
    ],
    links: [
      { label: 'NASA historical report', href: 'https://ntrs.nasa.gov/citations/20110023178' },
      { label: 'NASA water treatment overview', href: 'https://www.nasa.gov/missions/station/nasa-achieves-water-recovery-milestone-on-international-space-station/' },
    ],
  },
  iss: {
    title: 'Compare ISS Recovery',
    compare: true,
    body: [
      'Historical record: the space station’s urine processor first recovered 85% of the water. Mineral buildup (gypsum) then stopped the machine. The team lowered recovery to 70% to reduce the risk of buildup.',
      'Pick a setting. Each drop stands for a share of the water. Recovered water goes on to Further Treatment before anyone drinks it.',
    ],
    links: [
      { label: 'NASA historical report (UPA recovery and precipitation)', href: 'https://ntrs.nasa.gov/citations/20110023178' },
      { label: 'NASA water treatment overview', href: 'https://www.nasa.gov/missions/station/nasa-achieves-water-recovery-milestone-on-international-space-station/' },
    ],
  },
  notebook: {
    title: 'Notebook: Test the Membrane',
    // Video slot: notebook. The experiment below (text + simple drawing) stands in for the optional clip.
    experiment: 'membrane',
    body: [
      'Lab research example. Scientists on Earth tested a way to clean used water, like the urine a space station recycles. It is called membrane distillation.',
      'A membrane is a thin sheet full of tiny holes, much thinner than a hair. Making materials with holes this small is part of nanotechnology. Warm water gives off vapor. The vapor passes through the holes. Most of the dirty stuff stays behind.',
    ],
    links: [{ label: 'Khumalo et al. (2019), laboratory membrane distillation study', href: 'https://doi.org/10.1016/j.seppur.2018.10.035' }],
    teaching: 'Lab research example, not to scale. The Test Sample is not drinking water. It does not change the crew’s bottles. The station’s own recycling is in Compare ISS Recovery.',
  },
  plastic: {
    title: 'Printing with old plastic',
    body: [
      'NASA put a machine called the Refabricator on the space station. It was a test that turned used plastic into new material for 3D printing.',
      'In our game the printer makes a cable clip. The clip and its power cost are scenario choices.',
    ],
    links: [{ label: 'NASA Refabricator', href: 'https://www.nasa.gov/image-article/refabricator-recycle-reuse-plastic-installed-space-station/' }],
  },
  signal: {
    title: 'Calling Earth',
    body: [
      'Radio signals are very fast, but the Moon is far away. NASA estimates that a signal needs about 1.3 seconds to travel one way between the Moon and Earth.',
      'Checking the antenna does not change that time. In our story the crew sends the signal and waits for an answer.',
    ],
    links: [{ label: 'NASA communications reference', href: 'https://ntrs.nasa.gov/citations/20240007214' }],
  },
};
