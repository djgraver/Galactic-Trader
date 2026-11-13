/* Galactic Trader Deluxe. Part 11: character generator. A name goes in, a deeply unreasonable person comes out. */
var CH = {};
CH.OUT = '#1d0f33';
CH.hash = function (str) { var h = 2166136261 >>> 0; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; };
CH.SPECIES = [
  { id: 'human', label: 'Human-ish', skins: ['#ffd2a8', '#e8b07a', '#c98a5b', '#8d5a3b', '#f6c9b3', '#6b4128'], head: 'human', gendered: true },
  { id: 'zorp', label: 'Zorpian', skins: ['#8be04e', '#5fd0a0', '#b6e36a'], head: 'pear', antennae: true, gendered: true },
  { id: 'blorb', label: 'Blorbian', skins: ['#b57bff', '#ff8bd0', '#7bb6ff'], head: 'blob', stalk: true },
  { id: 'mothkin', label: 'Mothkin', skins: ['#e0cba8', '#cdbdf0', '#f6e6b8'], head: 'ellipse', fuzz: true, gendered: true },
  { id: 'bot', label: 'Tin-Robot', skins: ['#b9c4d6', '#e0b95c', '#9fd0c8'], head: 'box', rivets: true },
  { id: 'lizard', label: 'Lizardfolk', skins: ['#6fcf6f', '#d8b43a', '#4fb6a3'], head: 'ellipse', crest: true, gendered: true },
  { id: 'squid', label: 'Tentaclid', skins: ['#ff6fa8', '#5fb8e8', '#f08a4a'], head: 'dome', alien: 'squid' },
  { id: 'gray', label: 'Greylien', skins: ['#c8d0d8', '#9fc0a8', '#b8c0f0'], head: 'gray', alien: 'gray' },
  { id: 'cyclops', label: 'Monoclon', skins: ['#e0684a', '#6aa84a', '#d8a04a', '#8a6ad0'], head: 'cyclops', alien: 'cyclops' },
  { id: 'mantis', label: 'Mantoid', skins: ['#6aa84a', '#c8a02a', '#4a9ab8'], head: 'mantis', alien: 'mantis' },
  { id: 'stone', label: 'Gravelkin', skins: ['#a8a098', '#8a8078', '#b88a6a'], head: 'stone', alien: 'stone' }
];
/* which species a name can roll: about half are people, half are aliens */
CH.PICK = [0, 0, 0, 0, 0, 0, 0, 1, 3, 5, 0, 4, 2, 6, 7, 8, 9, 10];
CH.HAIRS = ['bald', 'tuft', 'afro', 'mohawk', 'pigtails', 'bowler', 'tophat', 'cap', 'captain', 'propeller', 'wizard',
  'long', 'bob', 'bun', 'ponytail', 'curls', 'swept', 'crew', 'slick', 'shaggy'];
/* what each kind of face can wear. Hair is picked from these lists unless the cast table names a style outright. */
CH.HAIRPOOL = {
  f: [11, 11, 12, 12, 13, 14, 15, 15, 4, 2, 1, 7, 8, 9, 10, 5],
  m: [16, 16, 17, 17, 18, 19, 19, 0, 0, 3, 2, 1, 5, 6, 7, 8, 9, 10],
  n: [0, 0, 0, 1, 3, 5, 6, 7, 8, 9, 10]
};
CH.BEARDS = ['none', 'stubble', 'mustache', 'goatee', 'beard', 'beard', 'stubble', 'none', 'mustache'];
CH.LIPS = ['#ff3d6e', '#e02a4a', '#ff6fb0', '#c42a8a', '#ff5a4f'];
CH.HAIRCOL = ['#2b1a12', '#6b3b1e', '#e0b040', '#d64a2a', '#3a3a8a', '#2a9d6b', '#e8e8f0', '#e04aa8'];
CH.SHIRT = ['#ff5a4f', '#3aa7ff', '#ffc531', '#7bd957', '#c25cff', '#ff8a2a', '#2ed3c4', '#ff6fb0'];
CH.ACC = ['none', 'monocle', 'eyepatch', 'bowtie', 'scarf', 'goggles', 'glasses', 'bandaid'];
CH.OUTFITS = ['jacket', 'hoodie', 'tee', 'hawaiian', 'suit'];

CH.build = function (r, over) {
  var pick = function (a) { return a[Math.floor(r() * a.length)]; }, t = {};
  t.sp = over && over.sp != null ? over.sp : CH.PICK[Math.floor(r() * CH.PICK.length)];
  var sp = CH.SPECIES[t.sp % CH.SPECIES.length]; t.sp = t.sp % CH.SPECIES.length;
  /* masculine or feminine faces for the people-shaped species, neutral for the rest */
  t.gen = sp.gendered ? (over && over.gen ? over.gen : (r() < 0.5 ? 'm' : 'f')) : 'n';
  t.skin = pick(sp.skins); t.skin2 = CH.shade(t.skin, -0.18);
  t.eyes = Math.floor(r() * 4); t.nose = Math.floor(r() * 4); t.mouth = Math.floor(r() * 5);
  t.fshape = Math.floor(r() * 3); t.brow = Math.floor(r() * 3);
  var hp = CH.HAIRPOOL[t.gen];
  t.hair = over && over.hair != null ? over.hair : (over && over.hairPick != null ? hp[over.hairPick % hp.length] : pick(hp));
  t.hairCol = pick(CH.HAIRCOL); t.hatCol = pick(CH.SHIRT);
  t.beard = t.gen === 'm' ? Math.floor(r() * CH.BEARDS.length) : 0; t.lip = pick(CH.LIPS); t.ring = r() < 0.4 ? 1 : 0;
  t.shirt = pick(CH.SHIRT); t.outfit = Math.floor(r() * CH.OUTFITS.length); t.acc = Math.floor(r() * CH.ACC.length);
  t.shoe = pick(['#ff5a4f', '#ffc531', '#3aa7ff', '#2b1a12', '#c25cff']);
  t.size = 0.92 + r() * 0.2; t.pupil = [Math.round((r() - 0.5) * 6), Math.round((r() - 0.5) * 5)];
  if (over) for (var k in over) if (k !== 'hairPick') t[k] = over[k];
  if (t.gen !== 'n' && !sp.gendered) t.gen = 'n';
  return t;
};
CH.shade = function (hex, amt) { return UI.shade(hex, amt); };

CH.ADJ = ['Moist', 'Reluctant', 'Dubious', 'Magnificent', 'Slightly Haunted', 'Unlicensed', 'Gourmet', 'Feral', 'Pocket-Sized', 'Notorious', 'Tragic', 'Overqualified', 'Sticky', 'Interdimensional', 'Bargain-Bin', 'Dramatic', 'Suspicious', 'Humble', 'Explosive', 'Fancy', 'Lukewarm', 'Legendary', 'Accidental', 'Part-Time', 'Sentient', 'Gullible', 'Radiant', 'Soggy', 'Unstoppable', 'Moderately Famous'];
CH.NOUN = ['Opportunist', 'Cargo Wrangler', 'Haggler', 'Spice Goblin', 'Coin Gremlin', 'Warp Tourist', 'Bargain Pirate', 'Invoice Wizard', 'Pocket Tycoon', 'Comet Surfer', 'Receipt Collector', 'Fuel Philosopher', 'Tax Dodger', 'Moon Salesman', 'Crate Whisperer', 'Space Hobo', 'Margin Hunter', 'Barter Bard', 'Nebula Nomad', 'Void Merchant', 'Ledger Knight', 'Credit Chaser', 'Galactic Gadabout', 'Cargo Cultist', 'Star Peddler', 'Dock Rat', 'Trade Tornado', 'Lunar Landlord', 'Stowaway Baron', 'Rocket Hobbyist'];
CH.CATCH = ['Everything is negotiable, including this sentence.', 'Buy low, sell high, panic medium.', 'I have a good feeling about this invoice.', 'Never trust a discount with a smile.', 'Cargo today, legend tomorrow.', 'My other ship is also in debt.', 'Time is money, and I\'m running late on both.', 'If it hums, I\'ll sell it.', 'That\'s not a bug, it\'s a surcharge.', 'I came, I saw, I overpaid.', 'Fortune favours the bold and the well-insured.', 'Don\'t panic. Haggle.', 'Today\'s forecast: profit, with a chance of pirates.', 'I\'ve seen things. Mostly overpriced.', 'Tax is just a suggestion. A loud suggestion.', 'Trust me, I\'m a licensed amateur.', 'Nothing ventured, nothing lost, nothing eaten.', 'Space is big. My ambition is bigger. My hold is medium.', 'I didn\'t choose the trade life. It ordered me by mistake.', 'Haggling is just arguing with a calculator.'];
CH.A = ['a flock of very opinionated geese', 'three retired accountants', 'a travelling puppet show', 'a feral vending machine', 'their disappointed aunt', 'a moderately competent robot', 'a mildly cursed accordion', 'a lighthouse keeper with a grudge'];
CH.B = ['a moon with no gravity and worse Wi-Fi', 'a space station shaped like a croissant', 'a farm that sold exclusively mist', 'a planet that is mostly a car park', 'a cargo ship named Gerald', 'the wrong side of a nebula', 'an asteroid that smelled of soup', 'a very small planet with a very large mayor'];
CH.C = ['haggle in six languages and sulk in twelve', 'fix any engine with a sandwich', 'count change faster than light', 'sell sand to a desert-shaped robot', 'sleep through explosions', 'juggle invoices', 'read minds, but only the boring ones', 'win staring contests against moons'];
CH.D = ['selling the family goat', 'that thing with the goose', 'eating the evidence', 'the tax audit of \'89', 'trusting a talking crate', 'trying to haggle with a black hole', 'answering the phone in the first place', 'buying a ship with a "surprise" in the engine'];
CH.SMELL = ['warm toast', 'old coins', 'a thunderstorm in a jar', 'regret and cinnamon', 'a freshly opened spaceship', 'wet dog (not theirs)', 'ozone and ambition', 'crayons'];

/* The name decides everything. Same name, same captain. The reroll button nudges the salt. */
CH.fromName = function (name, salt) {
  name = (name || '').trim() || 'Captain'; salt = salt || 0;
  var low = name.toLowerCase(), letters = low.replace(/[^a-z]/g, '') || 'x', vowels = (letters.match(/[aeiou]/g) || []).length;
  var h = CH.hash(low + '#' + salt), r = GT.seeded(h), first = letters.charCodeAt(0) - 97, sum = 0;
  for (var i = 0; i < letters.length; i++) sum += letters.charCodeAt(i) - 96;
  var t = CH.build(r, { sp: CH.PICK[(first + salt * 7) % CH.PICK.length], hairPick: letters.length + salt });
  t.name = name; t.salt = salt;
  var ratio = vowels / letters.length, grade = ratio < 0.25 ? 'Crunchy' : ratio < 0.35 ? 'Moderately Shiny' : ratio < 0.45 ? 'Pleasantly Squishy' : 'Dangerously Melodic';
  t.title = CH.ADJ[(h >>> 3) % CH.ADJ.length] + ' ' + CH.NOUN[(h >>> 11) % CH.NOUN.length];
  t.catch = CH.CATCH[(h >>> 7) % CH.CATCH.length];
  t.story = 'Raised by ' + CH.A[(h >>> 5) % 8] + ' on ' + CH.B[(h >>> 9) % 8] + ', ' + name + ' learned to ' + CH.C[(h >>> 13) % 8] + '. Their only regret is ' + CH.D[(h >>> 17) % 8] + '.';
  t.hidden = { letters: letters.length, vowels: vowels };
  t.fate = [['Lucky number', sum % 97 + 3], ['Species', CH.SPECIES[t.sp].label], ['Smells faintly of', CH.SMELL[(h >>> 19) % 8]], ['Destiny grade', grade]];
  return t;
};
CH.fromSeed = function (seed, over) { var t = CH.build(GT.seeded(CH.hash(seed)), over); t.name = seed; return t; };

/* ---------- drawing: CH.head lives in gt-11b-faces.js ---------- */

CH.torso = function (t) {
  var sw = 'stroke="' + CH.OUT + '" stroke-width="4" stroke-linejoin="round"', c = t.shirt, c2 = CH.shade(c, -0.25), o = CH.OUTFITS[t.outfit], a = CH.ACC[t.acc], s = '';
  if (o === 'hoodie') s += '<path d="M-34,66 Q0,40 34,66 L40,80 L-40,80Z" fill="' + c2 + '" ' + sw + '/>';
  var w = t.gen === 'm' ? 68 : t.gen === 'f' ? 54 : 62;
  s += '<path d="M-' + w + ',150 Q-' + (w + 2) + ',76 -22,66 L22,66 Q' + (w + 2) + ',76 ' + w + ',150Z" fill="' + c + '" ' + sw + '/>';
  if (t.gen === 'f') s += '<path d="M-20,66 Q0,86 20,66" fill="' + t.skin + '" ' + sw + ' stroke-width="3"/>';
  if (o === 'jacket') s += '<path d="M-22,66 L0,110 L22,66 L10,64 L0,84 L-10,64Z" fill="#fff" ' + sw + ' stroke-width="3"/><path d="M0,84 L0,150" stroke="' + CH.OUT + '" stroke-width="3"/>';
  if (o === 'tee') s += '<path d="M0,96 l6,12 13,2 -10,9 3,13 -12,-7 -12,7 3,-13 -10,-9 13,-2z" fill="#ffe14a" ' + sw + ' stroke-width="2.5"/>';
  if (o === 'hawaiian') s += '<circle cx="-30" cy="104" r="6" fill="#fff"/><circle cx="26" cy="96" r="6" fill="#ffe14a"/><circle cx="-6" cy="124" r="6" fill="#ff8ab0"/><circle cx="34" cy="128" r="5" fill="#fff"/><path d="M-22,66 L-6,92 L0,66Z M22,66 L6,92 L0,66Z" fill="' + c2 + '" ' + sw + ' stroke-width="3"/>';
  if (o === 'suit') s += '<ellipse cx="0" cy="68" rx="30" ry="9" fill="#dfe6ff" ' + sw + ' stroke-width="3"/><rect x="-14" y="104" width="28" height="22" rx="5" fill="#2a2f4a" ' + sw + ' stroke-width="3"/><circle cx="-6" cy="115" r="3" fill="#58ff9a"/><circle cx="6" cy="115" r="3" fill="#ff5a4f"/>';
  if (a === 'bowtie') s += '<path d="M0,70 L-18,60 L-18,80Z M0,70 L18,60 L18,80Z" fill="#ff3d8b" ' + sw + ' stroke-width="3"/><circle cx="0" cy="70" r="4" fill="#ff3d8b" ' + sw + ' stroke-width="2.5"/>';
  if (a === 'scarf') s += '<path d="M-34,64 Q0,86 34,64 L38,80 Q0,100 -38,80Z" fill="#ffc531" ' + sw + '/><path d="M14,80 L26,120 L10,118Z" fill="#ffc531" ' + sw + ' stroke-width="3"/>';
  return s;
};

/* Portrait: head and shoulders, for dialogue boxes. */
CH.portrait = function (t, extra) {
  return '<svg class="portrait ' + (extra || '') + '" viewBox="-80 -112 160 262" role="img" aria-label="' + GT.esc(t.name || 'Character') + '"><g transform="scale(' + t.size.toFixed(2) + ' ' + t.size.toFixed(2) + ')">' + CH.torso(t) + CH.head(t) + '</g></svg>';
};

/* Full-body sprite for the street scenes. Returns a <g> that is about 100 wide and 175 tall with feet at y=175. */
CH.sprite = function (t, cls) {
  var sw = 'stroke="' + CH.OUT + '" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"', c = t.shirt, bot = CH.SPECIES[t.sp].id === 'bot';
  var leg = function (x, k) { return '<g class="leg ' + k + '"><path d="M' + x + ',118 L' + x + ',150" stroke="' + CH.OUT + '" stroke-width="13" stroke-linecap="round"/><path d="M' + x + ',118 L' + x + ',150" stroke="' + (bot ? '#8a94aa' : '#3b3f8a') + '" stroke-width="7" stroke-linecap="round"/><ellipse cx="' + (x + 6) + '" cy="156" rx="14" ry="8" fill="' + t.shoe + '" ' + sw + ' stroke-width="3.5"/></g>'; };
  return '<g class="sprite ' + (cls || '') + '"><ellipse cx="50" cy="166" rx="30" ry="6" fill="rgba(0,0,0,.28)"/>' + leg(40, 'l1') + leg(60, 'l2') +
    '<g transform="translate(50 49) scale(.5)">' + CH.torso(t) + '</g>' +
    '<path d="M24,96 L12,128 M76,96 L88,128" stroke="' + CH.OUT + '" stroke-width="12" stroke-linecap="round"/><path d="M24,96 L12,128 M76,96 L88,128" stroke="' + c + '" stroke-width="6" stroke-linecap="round"/>' +
    '<circle cx="12" cy="130" r="6" fill="' + t.skin + '" ' + sw + ' stroke-width="3"/><circle cx="88" cy="130" r="6" fill="' + t.skin + '" ' + sw + ' stroke-width="3"/>' +
    '<g class="bob" style="--hs:' + (0.62 * t.size).toFixed(2) + '" transform="translate(50 52) scale(' + (0.62 * t.size).toFixed(2) + ')">' + CH.head(t) + '</g></g>';
};
