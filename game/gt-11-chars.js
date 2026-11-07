/* Galactic Trader Deluxe. Part 11: character generator. A name goes in, a deeply unreasonable person comes out. */
var CH = {};
CH.OUT = '#1d0f33';
CH.hash = function (str) { var h = 2166136261 >>> 0; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; };
CH.SPECIES = [
  { id: 'human', label: 'Human-ish', skins: ['#ffd2a8', '#e8b07a', '#c98a5b', '#8d5a3b', '#f6c9b3'], head: 'ellipse' },
  { id: 'zorp', label: 'Zorpian', skins: ['#8be04e', '#5fd0a0', '#b6e36a'], head: 'pear', antennae: true },
  { id: 'blorb', label: 'Blorbian', skins: ['#b57bff', '#ff8bd0', '#7bb6ff'], head: 'blob', stalk: true },
  { id: 'mothkin', label: 'Mothkin', skins: ['#e0cba8', '#cdbdf0', '#f6e6b8'], head: 'ellipse', fuzz: true },
  { id: 'bot', label: 'Tin-Robot', skins: ['#b9c4d6', '#e0b95c', '#9fd0c8'], head: 'box', rivets: true },
  { id: 'lizard', label: 'Lizardfolk', skins: ['#6fcf6f', '#d8b43a', '#4fb6a3'], head: 'ellipse', crest: true }
];
CH.HAIRS = ['bald', 'tuft', 'afro', 'mohawk', 'pigtails', 'bowler', 'tophat', 'cap', 'captain', 'propeller', 'wizard'];
CH.HAIRCOL = ['#2b1a12', '#6b3b1e', '#e0b040', '#d64a2a', '#3a3a8a', '#2a9d6b', '#e8e8f0', '#e04aa8'];
CH.SHIRT = ['#ff5a4f', '#3aa7ff', '#ffc531', '#7bd957', '#c25cff', '#ff8a2a', '#2ed3c4', '#ff6fb0'];
CH.ACC = ['none', 'monocle', 'eyepatch', 'bowtie', 'scarf', 'goggles', 'glasses', 'bandaid'];
CH.OUTFITS = ['jacket', 'hoodie', 'tee', 'hawaiian', 'suit'];

CH.build = function (r, over) {
  var pick = function (a) { return a[Math.floor(r() * a.length)]; }, t = {};
  t.sp = over && over.sp != null ? over.sp : Math.floor(r() * CH.SPECIES.length);
  var sp = CH.SPECIES[t.sp % CH.SPECIES.length]; t.sp = t.sp % CH.SPECIES.length;
  t.skin = pick(sp.skins); t.skin2 = CH.shade(t.skin, -0.18);
  t.eyes = Math.floor(r() * 4); t.nose = Math.floor(r() * 4); t.mouth = Math.floor(r() * 5);
  t.hair = over && over.hair != null ? over.hair : Math.floor(r() * CH.HAIRS.length);
  t.hairCol = pick(CH.HAIRCOL); t.hatCol = pick(CH.SHIRT);
  t.shirt = pick(CH.SHIRT); t.outfit = Math.floor(r() * CH.OUTFITS.length); t.acc = Math.floor(r() * CH.ACC.length);
  t.shoe = pick(['#ff5a4f', '#ffc531', '#3aa7ff', '#2b1a12', '#c25cff']);
  t.size = 0.92 + r() * 0.2; t.pupil = [Math.round((r() - 0.5) * 6), Math.round((r() - 0.5) * 5)];
  if (over) for (var k in over) t[k] = over[k];
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
  var t = CH.build(r, { sp: (first + salt) % CH.SPECIES.length, hair: (letters.length + salt) % CH.HAIRS.length });
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

/* ---------- drawing ---------- */
CH.head = function (t) {
  var sp = CH.SPECIES[t.sp], O = CH.OUT, sw = 'stroke="' + O + '" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"', h = '';
  var skin = t.skin, sk2 = t.skin2, hc = t.hairCol, hat = CH.HAIRS[t.hair], bot = sp.id === 'bot';
  if (sp.stalk) h += '<path d="M0,-44 Q-6,-72 10,-84" fill="none" ' + sw + ' stroke-width="9"/><path d="M0,-44 Q-6,-72 10,-84" fill="none" stroke="' + skin + '" stroke-width="4" stroke-linecap="round"/><circle cx="10" cy="-88" r="11" fill="#fff" ' + sw + '/><circle cx="12" cy="-87" r="4.5" fill="' + O + '"/>';
  if (sp.antennae) h += '<path d="M-14,-46 Q-24,-78 -36,-84 M14,-46 Q24,-78 36,-84" fill="none" ' + sw + '/><circle cx="-36" cy="-85" r="6" fill="#ffe14a" ' + sw + '/><circle cx="36" cy="-85" r="6" fill="#ffe14a" ' + sw + '/>';
  if (sp.fuzz) h += '<path d="M-10,-46 Q-30,-82 -50,-66 Q-36,-62 -34,-46Z M10,-46 Q30,-82 50,-66 Q36,-62 34,-46Z" fill="#fff8e0" ' + sw + '/>';
  if (sp.crest) h += '<path d="M-22,-42 L-14,-70 L-6,-46 L2,-74 L10,-46 L20,-68 L24,-40Z" fill="#e0572b" ' + sw + '/>';
  if (bot) h += '<line x1="0" y1="-46" x2="0" y2="-72" ' + sw + '/><circle cx="0" cy="-76" r="6" fill="#ff5a4f" ' + sw + '/>';
  var shape = { ellipse: '<ellipse cx="0" cy="0" rx="46" ry="50" fill="' + skin + '" ' + sw + '/>', pear: '<path d="M-36,-30 Q-38,-52 0,-52 Q38,-52 36,-30 Q58,30 0,52 Q-58,30 -36,-30Z" fill="' + skin + '" ' + sw + '/>', blob: '<path d="M-48,2 Q-54,-46 0,-50 Q54,-46 48,2 Q52,48 0,50 Q-52,48 -48,2Z" fill="' + skin + '" ' + sw + '/>', box: '<rect x="-44" y="-46" width="88" height="94" rx="14" fill="' + skin + '" ' + sw + '/>' }[sp.head];
  h += (sp.fuzz ? '' : '') + shape;
  if (sp.fuzz) h += '<path d="M-46,10 Q-60,24 -42,36 M46,10 Q60,24 42,36" fill="none" stroke="#fff8e0" stroke-width="9" stroke-linecap="round"/>';
  if (bot) h += '<circle cx="-36" cy="-36" r="3" fill="' + sk2 + '"/><circle cx="36" cy="-36" r="3" fill="' + sk2 + '"/><circle cx="-36" cy="40" r="3" fill="' + sk2 + '"/><circle cx="36" cy="40" r="3" fill="' + sk2 + '"/>';
  /* eyes */
  var px = t.pupil[0], py = t.pupil[1], eyes = '';
  var eye = function (x, y, r, big) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff" ' + sw + ' stroke-width="3.5"/>' + (sp.id === 'lizard' ? '<ellipse cx="' + (x + px * 0.4) + '" cy="' + y + '" rx="2.6" ry="' + (r * 0.7) + '" fill="' + O + '"/>' : '<circle cx="' + (x + px) + '" cy="' + (y + py) + '" r="' + (big ? 6.5 : 5) + '" fill="' + O + '"/><circle cx="' + (x + px + 1.8) + '" cy="' + (y + py - 2) + '" r="1.6" fill="#fff"/>'); };
  if (bot) eyes = '<rect x="-30" y="-20" width="24" height="18" rx="4" fill="#0e2a1a" ' + sw + ' stroke-width="3"/><rect x="6" y="-20" width="24" height="18" rx="4" fill="#0e2a1a" ' + sw + ' stroke-width="3"/><circle cx="' + (-18 + px) + '" cy="-11" r="4" fill="#58ff9a"/><circle cx="' + (18 + px) + '" cy="-11" r="4" fill="#58ff9a"/>';
  else if (t.eyes === 2) eyes = eye(0, -8, 20, true);
  else if (t.eyes === 3) eyes = eye(-18, -8, 15, true) + eye(18, -6, 10, false);
  else if (t.eyes === 1) eyes = eye(-18, -8, 13) + eye(18, -8, 13) + '<path d="M-33,-10 Q-18,-26 -3,-10Z M3,-10 Q18,-26 33,-10Z" fill="' + sk2 + '" ' + sw + ' stroke-width="3"/>';
  else eyes = eye(-18, -8, 13) + eye(18, -8, 13);
  h += eyes;
  /* nose */
  h += ['<circle cx="0" cy="8" r="8" fill="' + sk2 + '" ' + sw + ' stroke-width="3"/>', '<path d="M-3,-2 Q14,14 -2,22 Q-10,20 -8,14Z" fill="' + sk2 + '" ' + sw + ' stroke-width="3"/>', '<ellipse cx="0" cy="10" rx="4.5" ry="3.5" fill="' + sk2 + '" ' + sw + ' stroke-width="3"/>', '<ellipse cx="0" cy="12" rx="13" ry="9" fill="' + sk2 + '" ' + sw + ' stroke-width="3"/><circle cx="-4" cy="12" r="2" fill="' + O + '"/><circle cx="4" cy="12" r="2" fill="' + O + '"/>'][t.nose];
  /* mouth */
  h += [
    '<path d="M-20,26 Q0,46 20,26Z" fill="#fff" ' + sw + ' stroke-width="3.5"/><path d="M-12,30 L12,30" stroke="' + O + '" stroke-width="2"/>',
    '<path d="M-15,34 Q0,22 15,34" fill="none" ' + sw + '/>',
    '<ellipse cx="0" cy="32" rx="11" ry="9" fill="#5a1a2a" ' + sw + ' stroke-width="3.5"/><ellipse cx="0" cy="36" rx="6" ry="3.5" fill="#ff7a8a"/>',
    '<path d="M-14,28 Q0,38 14,28" fill="none" ' + sw + '/><rect x="-6" y="28" width="6" height="9" rx="1.5" fill="#fff" ' + sw + ' stroke-width="2.5"/><rect x="0" y="28" width="6" height="9" rx="1.5" fill="#fff" ' + sw + ' stroke-width="2.5"/>',
    '<path d="M-14,28 Q0,40 14,28" fill="none" ' + sw + '/><path d="M-26,24 Q-12,16 0,24 Q12,16 26,24 Q14,34 0,28 Q-14,34 -26,24Z" fill="' + hc + '" ' + sw + ' stroke-width="3"/>'
  ][t.mouth];
  /* accessory on the face */
  var a = CH.ACC[t.acc];
  if (a === 'monocle') h += '<circle cx="18" cy="-8" r="16" fill="rgba(180,230,255,.35)" ' + sw + ' stroke="#d8a21a" stroke-width="3.5"/><path d="M30,0 Q40,30 30,56" fill="none" stroke="#d8a21a" stroke-width="2"/>';
  if (a === 'eyepatch') h += '<path d="M-46,-18 L30,-26" stroke="' + O + '" stroke-width="4"/><ellipse cx="-18" cy="-8" rx="17" ry="14" fill="#15101f" ' + sw + ' stroke-width="3"/>';
  if (a === 'glasses') h += '<rect x="-36" y="-22" width="30" height="26" rx="8" fill="rgba(180,230,255,.3)" ' + sw + ' stroke-width="3.5"/><rect x="6" y="-22" width="30" height="26" rx="8" fill="rgba(180,230,255,.3)" ' + sw + ' stroke-width="3.5"/><line x1="-6" y1="-10" x2="6" y2="-10" stroke="' + O + '" stroke-width="3.5"/>';
  if (a === 'bandaid') h += '<rect x="14" y="14" width="22" height="9" rx="4" transform="rotate(-24 25 18)" fill="#ffd6a5" ' + sw + ' stroke-width="2.5"/>';
  /* hair and hats sit on top */
  var top = '';
  if (hat === 'tuft') top = '<path d="M-6,-50 Q-18,-76 -4,-70 Q0,-86 10,-70 Q24,-78 10,-50Z" fill="' + hc + '" ' + sw + '/>';
  else if (hat === 'afro') top = '<circle cx="0" cy="-40" r="46" fill="' + hc + '" ' + sw + '/><ellipse cx="0" cy="-30" rx="40" ry="22" fill="' + skin + '"/>' + '<path d="M-42,-24 Q0,-10 42,-24" fill="none" stroke="' + O + '" stroke-width="3"/>';
  else if (hat === 'mohawk') top = '<path d="M-10,-48 L-14,-80 L-4,-62 L2,-90 L10,-62 L18,-82 L14,-48Z" fill="' + hc + '" ' + sw + '/>';
  else if (hat === 'pigtails') top = '<path d="M-40,-30 Q0,-64 40,-30 Q0,-48 -40,-30Z" fill="' + hc + '" ' + sw + '/><circle cx="-54" cy="-18" r="14" fill="' + hc + '" ' + sw + '/><circle cx="54" cy="-18" r="14" fill="' + hc + '" ' + sw + '/>';
  else if (hat === 'bowler') top = '<ellipse cx="0" cy="-42" rx="50" ry="9" fill="#2a2038" ' + sw + '/><path d="M-30,-44 Q-30,-84 0,-84 Q30,-84 30,-44Z" fill="#2a2038" ' + sw + '/><rect x="-30" y="-56" width="60" height="9" fill="' + t.hatCol + '"/>';
  else if (hat === 'tophat') top = '<ellipse cx="0" cy="-44" rx="50" ry="9" fill="#2a2038" ' + sw + '/><rect x="-28" y="-100" width="56" height="58" rx="4" fill="#2a2038" ' + sw + '/><rect x="-28" y="-62" width="56" height="12" fill="' + t.hatCol + '"/>';
  else if (hat === 'cap') top = '<path d="M-44,-34 Q-40,-78 0,-78 Q40,-78 44,-34Z" fill="' + t.hatCol + '" ' + sw + '/><path d="M-4,-38 Q40,-34 62,-26 Q40,-44 -4,-48Z" fill="' + t.hatCol + '" ' + sw + '/>';
  else if (hat === 'captain') top = '<path d="M-48,-36 Q-40,-86 0,-84 Q40,-86 48,-36 Q0,-26 -48,-36Z" fill="#f4f1ff" ' + sw + '/><path d="M-50,-34 Q0,-20 50,-34 L48,-42 Q0,-30 -48,-42Z" fill="#1d3a8a" ' + sw + ' stroke-width="3"/><circle cx="0" cy="-60" r="9" fill="#ffc531" ' + sw + ' stroke-width="3"/>';
  else if (hat === 'propeller') top = '<path d="M-36,-36 Q0,-82 36,-36Z" fill="' + t.hatCol + '" ' + sw + '/><line x1="0" y1="-64" x2="0" y2="-78" ' + sw + '/><path d="M-26,-82 Q0,-92 26,-82 Q0,-76 -26,-82Z" fill="#ffc531" ' + sw + ' stroke-width="3"/>';
  else if (hat === 'wizard') top = '<ellipse cx="0" cy="-42" rx="50" ry="9" fill="#5a3bb0" ' + sw + '/><path d="M-32,-44 L8,-110 Q18,-90 32,-44Z" fill="#5a3bb0" ' + sw + '/><circle cx="2" cy="-72" r="5" fill="#ffe14a"/><circle cx="12" cy="-58" r="3.5" fill="#ffe14a"/>';
  if (a === 'goggles') top += '<rect x="-40" y="-52" width="80" height="12" rx="6" fill="#6a4a2a" ' + sw + ' stroke-width="3"/><circle cx="-18" cy="-46" r="11" fill="#9fe6ff" ' + sw + ' stroke-width="3"/><circle cx="18" cy="-46" r="11" fill="#9fe6ff" ' + sw + ' stroke-width="3"/>';
  return h + top;
};

CH.torso = function (t) {
  var sw = 'stroke="' + CH.OUT + '" stroke-width="4" stroke-linejoin="round"', c = t.shirt, c2 = CH.shade(c, -0.25), o = CH.OUTFITS[t.outfit], a = CH.ACC[t.acc], s = '';
  if (o === 'hoodie') s += '<path d="M-34,66 Q0,40 34,66 L40,80 L-40,80Z" fill="' + c2 + '" ' + sw + '/>';
  s += '<path d="M-62,150 Q-64,76 -22,66 L22,66 Q64,76 62,150Z" fill="' + c + '" ' + sw + '/>';
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
