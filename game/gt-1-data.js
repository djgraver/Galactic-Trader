/* Galactic Trader. Part 1: data tables. Parts are concatenated into one script by build.py. */
var GT = {};

GT.CFG = {
  WIN: 150000, START_CREDITS: 2500, START_FUEL_FRAC: 0.8,
  TRAVEL_EVENT: 0.30, EXPLORE: 0.25, ENCOUNTER: 0.30, FACILITY_OFFER: 0.20, COMP_EVENT: 0.20,
  DEPOSIT_RATE: 0.03, LOAN_RATE: 0.05, INTEREST_EVERY: 4, LOAN_STEP: 1000, LOAN_CAP: 10000,
  FUEL_K: 0.5, TOW_COST: 400, DAMAGE_TURNS: 6, FEE_CAP_TURNS: 12, LOG_SHOWN: 60,
  ELASTICITY: 0.35, REVERT: 0.2, UPGRADE_MAX: 6
};

/* depth = typical stock a neutral planet holds; thin markets for pricey goods stop dumping */
GT.ITEMS = [
  { id: 'rations',  name: 'Rations',     base: 24,  depth: 400, vol: 0.035, blurb: 'Vacuum-sealed meals. Everyone eats.' },
  { id: 'metals',   name: 'Metals',      base: 52,  depth: 260, vol: 0.040, blurb: 'Ingots and alloy plate for hulls and habitats.' },
  { id: 'medical',  name: 'Medical',     base: 95,  depth: 160,  vol: 0.045, blurb: 'Meds, grafts and sterile field kits.' },
  { id: 'spices',   name: 'Spices',      base: 160, depth: 100,  vol: 0.060, blurb: 'Flavour worth more than its weight in fuel.' },
  { id: 'circuitry',name: 'Circuitry',   base: 260, depth: 72,  vol: 0.055, blurb: 'Logic cores and gate arrays.' },
  { id: 'darkmatter',name:'Dark Matter', base: 460, depth: 40,  vol: 0.085, blurb: 'Contained in magnetic bottles. Do not shake.' },
  { id: 'artifacts',name: 'Artifacts',   base: 780, depth: 20,  vol: 0.100, blurb: 'Relics of dead empires. Provenance optional.' }
];

/* mult order: rations, metals, medical, spices, circuitry, darkmatter, artifacts. Below 0.8 means the planet produces it. */
GT.PLANETS = [
  { id: 'meridoa', name: 'Meridoa', say: 'meh-RID-oh-ah', type: 'Agrarian', x: 8, y: 38, color: '#7ed957', ring: false,
    tax: 0.03, fuel: 8, fuelSold: false, upgrades: ['cargo'], gambling: false,
    mult: [0.55, 1.25, 0.90, 0.70, 1.35, 1.20, 1.10],
    fac: { broker: 1, depot: 0.5, factory: 1, warehouse: 2, hotel: 1 },
    desc: 'Terraced fields roll to every horizon under a soft green sun. Grain barges outnumber people. Rations and spices are plentiful and cheap, while anything with a circuit in it is treated like magic.' },
  { id: 'karthosu', name: 'Karth-Osu', say: 'KARTH oh-SOO', type: 'Ruin', x: 22, y: 52, color: '#d9a35c', ring: false,
    tax: 0.065, fuel: 9, fuelSold: false, upgrades: [], gambling: false,
    mult: [1.30, 1.20, 1.40, 1.10, 1.30, 1.10, 0.50],
    fac: { broker: 0.5, depot: 0.3, factory: 0.5, warehouse: 1, hotel: 2 },
    desc: 'The bones of a vanished empire, half buried in ochre dust. Diggers sell relics from the tombs at fair prices. They have no clean water, no medicine and no patience for tourists.' },
  { id: 'ferrox', name: 'Ferrox', say: 'FEH-rox', type: 'Mining', x: 30, y: 12, color: '#d9603b', ring: false,
    tax: 0.04, fuel: 8, fuelSold: true, upgrades: ['cargo', 'fuel'], gambling: false,
    mult: [1.35, 0.55, 1.30, 1.20, 1.20, 1.00, 1.00],
    fac: { broker: 0.7, depot: 1.5, factory: 2, warehouse: 1.5, hotel: 0.5 },
    desc: 'A red, pitted rock chewed hollow by a thousand drills. Metals pour out of Ferrox by the megaton and sell for next to nothing. The miners pay well for food and doctors, and Ferrox has a working fuel dock.' },
  { id: 'kryndor', name: 'Kryndor Spire', say: 'KRIN-dor SPYR', type: 'Megacity', x: 50, y: 30, color: '#4fd2ff', ring: false,
    tax: 0.07, fuel: 11, fuelSold: true, upgrades: ['cargo', 'speed', 'fuel'], gambling: false,
    mult: [1.30, 1.10, 1.20, 1.35, 0.85, 1.25, 1.40],
    fac: { broker: 2, depot: 0.7, factory: 0.7, warehouse: 1, hotel: 2 },
    desc: 'One city that covers a whole moon, lit like a jewel box. Circuitry is cheap here. Spices, luxuries and relics sell at silly prices. The tax collectors are everywhere, and so is the best shipyard in the sector.' },
  { id: 'nihil', name: 'Nihil Station', say: 'NY-hill', type: 'Void Station', x: 58, y: 52, color: '#b07cff', ring: false,
    tax: 0.015, fuel: 14, fuelSold: true, upgrades: ['speed'], gambling: true,
    mult: [1.45, 1.20, 1.10, 0.90, 1.00, 0.65, 1.30],
    fac: { broker: 1.5, depot: 1, factory: 0.3, warehouse: 2, hotel: 2 },
    desc: 'A free port hanging in the dark between stars, with almost no tax and almost no questions. Dark matter is cheap here. Hungry crews trade fortunes at the Parlour of Thin Hours, where the games are strange and nobody explains them.' },
  { id: 'quellin', name: 'Quellin Reach', say: 'KWEL-in REECH', type: 'Science', x: 72, y: 14, color: '#ff7ad9', ring: false,
    tax: 0.04, fuel: 10, fuelSold: false, upgrades: ['speed'], gambling: false,
    mult: [1.15, 1.10, 0.60, 1.20, 0.65, 1.35, 1.20],
    fac: { broker: 0.7, depot: 0.7, factory: 1, warehouse: 0.7, hotel: 1 },
    desc: 'White domes and humming labs on a frozen pink moon. Medical supplies and circuitry are made here by the crate. The researchers pay anything for dark matter and for relics to puzzle over.' },
  { id: 'halcyra', name: 'Halcyra', say: 'hal-SY-rah', type: 'Gas Giant', x: 90, y: 38, color: '#ffc24d', ring: true,
    tax: 0.04, fuel: 6, fuelSold: true, upgrades: ['fuel'], gambling: false,
    mult: [1.40, 1.30, 1.25, 1.00, 1.20, 0.55, 1.20],
    fac: { broker: 0.7, depot: 2, factory: 1.5, warehouse: 1, hotel: 0.7 },
    desc: 'A golden ringed giant. Skimmer platforms drift in its upper clouds and bottle dark matter from the storms. Fuel is cheap, but food, metal and medicine all have to be hauled in from far away.' }
];

GT.SHIPS = [
  { id: 'wayfarer', name: 'Wayfarer', cargo: 45, speed: 1.4, fuel: 100, hue: '#4fd2ff',
    desc: 'A sturdy all-rounder with a patched hull and a loyal crew of two. It does nothing brilliantly and nothing badly.' },
  { id: 'barge', name: 'Behemoth Barge', cargo: 75, speed: 0.9, fuel: 130, hue: '#ffc24d',
    desc: 'A flying warehouse. It crawls between worlds but hauls more cargo than anything else on the lanes.' },
  { id: 'stargazer', name: 'Stargazer', cargo: 34, speed: 1.6, fuel: 190, hue: '#b07cff',
    desc: 'A long-range survey hull with a huge tank. You can skip the fuel docks and go where the margins are.' },
  { id: 'cutlass', name: 'Cutlass Runner', cargo: 38, speed: 2.0, fuel: 95, hue: '#d9603b',
    desc: 'A smuggler\'s fast hull, with a hold that has some very good false floors. It is quick, quiet and thirsty.' }
];

GT.UPGRADES = {
  cargo: { name: 'Cargo Bay', unit: 'units', step: 8, base: 1200, grow: 1.8, label: '+8 cargo' },
  speed: { name: 'Warp Engine', unit: 'warp', step: 0.2, base: 1400, grow: 1.8, label: '+0.2 warp' },
  fuel:  { name: 'Fuel Tank', unit: 'PC', step: 25, base: 900, grow: 1.7, label: '+25 PC tank (empty)' }
};

/* kind: trade = price edge; fuel = cheaper fuel; fee = income from rivals, collected when you visit */
GT.FACILITIES = [
  { id: 'broker', name: 'Trade Broker', kind: 'trade', pct: 0.015, blurb: 'Better quotes on every trade you make, and a lighter tax bill.' },
  { id: 'depot', name: 'Fuel Depot', kind: 'fuel', pct: 0.06, blurb: 'Cheaper fuel at every refuelling dock you use, and a lighter tax bill.' },
  { id: 'factory', name: 'Factory', kind: 'fee', feePct: 0.0045, blurb: 'Rival traders buy parts here. You collect a fee when you next visit.' },
  { id: 'warehouse', name: 'Warehouse', kind: 'fee', feePct: 0.0040, blurb: 'Rivals rent storage space. Fees pile up until you visit.' },
  { id: 'hotel', name: 'Hotel', kind: 'fee', feePct: 0.0050, blurb: 'Rival crews sleep here. You collect the bills when you visit.' }
];

GT.COMPETITORS = [
  { name: 'Zara Vex', title: 'the Silk-Handed', rate: 0.046 },
  { name: 'Old Brannock', title: 'of the Long Haul', rate: 0.041 },
  { name: 'Captain Ilyx Orro', title: 'the Unlucky', rate: 0.050 },
  { name: 'Mox Tallow', title: 'who Never Blinks', rate: 0.044 }
];

GT.MOODS = [
  'in a foul mood, picking at a ration tin', 'whistling cheerfully and counting coin', 'looking tired and a little desperate',
  'smug, with a fresh stack of credit chits', 'jumpy, glancing at every shadow', 'strangely calm, polishing a boarding hook',
  'half asleep over a cold drink', 'bragging loudly to anyone who will listen'
];
