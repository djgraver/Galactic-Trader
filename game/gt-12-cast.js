/* Galactic Trader Deluxe. Part 12: the supporting cast and what they say. Cast rows are [name, job, species, hair, signature greeting]. */
var NP = { cache: {} };
NP.CAST = {
  meridoa: {
    market: ['Aunt Petunia Gourdwhistle', 'Shopkeeper', 0, 4, 'Fresh-picked, hand-squeezed and only slightly sentient!'],
    bank: ['Mr. Hoe', 'Head Teller', 0, 5, 'Welcome to the Bank of Beans. We hold your money close and your gourds closer.'],
    yard: ['Rusty Furrow', 'Shipwright', 0, 7, 'Tractor parts, warp parts. Same thing, really.'],
    office: ['Agent Daisy Chain', 'Land Agent', 0, 1, 'A little plot of land and a big plot of lies!']
  },
  karthosu: {
    market: ['Hakim Gravel', 'Relic Dealer', 5, 0, 'Everything here is authentic, or at least extremely old.'],
    bank: ['Osiris Wrapp', 'Teller', 3, 0, 'Welcome to the Tomb & Trust. Your money will be preserved for eternity. Fees apply in the afterlife.'],
    yard: ['Ptah Spanner', 'Pharaoh-Mechanic', 0, 6, 'I built pyramids. Your engine is small potatoes.'],
    office: ['Sphinxy', 'Tomb Realtor', 5, 2, 'Riddle me this: do you want a tomb with a view?']
  },
  ferrox: {
    market: ['Big Brenda Slagheap', 'Ore Merchant', 0, 3, 'Metal, mud and mercy! Mostly metal!'],
    bank: ['Hardhat Hal', 'Credit Union Boss', 0, 7, 'First Credit Union of the Deep. Please wipe your boots on the money.'],
    yard: ['Nub', 'Spanner\'s Apprentice', 2, 7, 'Spanner\'s out. I\'m Nub. I\'m about forty percent qualified.'],
    fuel: ['Pump Boss Gus', 'Pump Boss', 0, 0, 'Fill her up, or don\'t. I get paid either way.'],
    office: ['Claim Agent Slate', 'Claims Officer', 10, 0, 'Claims staked, grudges filed.']
  },
  kryndor: {
    market: ['Mei-Lin Quicksale', 'Store Manager', 0, 8, 'Welcome to Spire Mart, level 412! Please validate your parking and your existence.'],
    bank: ['Wilhelmina Compound', 'Chief Banker', 0, 6, 'Compound Interest & Co. We turn small sums into slightly larger sums!'],
    yard: ['Axel Bolt', 'Master Shipwright', 4, 0, 'Shipwrights since the dawn of Tuesday.'],
    fuel: ['Pump-Bot 9000', 'Fuel Unit', 4, 0, 'BEEP. FUEL. BEEP. YOUR WALLET. BEEP.'],
    office: ['Chad Sky-Lease', 'Penthouse Agent', 0, 1, 'Bro, this penthouse has a view of another penthouse.']
  },
  nihil: {
    market: ['Honest Abe', 'Fence', 0, 5, 'Nothing here fell off a truck. It fell off several.'],
    bank: ['Vault-Keeper Null', 'Vault-Keeper', 2, 0, 'Welcome to Null Bank. Your balance is exactly what we say it is.'],
    yard: ['Zero-G Zed', 'Upside-Down Mechanic', 0, 3, 'I fix things upside down. It isn\'t better. It\'s just more fun.'],
    fuel: ['Gasper', 'Fuel Jockey', 1, 0, 'Fuel is cheap. Air is not.'],
    parlour: ['Madame Thin Hour', 'Croupier', 3, 6, 'Sit. Wager. Wonder. Leave poorer and wiser, or just poorer.'],
    office: ['Fivefingers', 'Ness\'s Cousin', 6, 0, 'Slightly more honest than my cousin. Five fingers, five scams.']
  },
  quellin: {
    market: ['Dr. Pippa Beaker', 'Procurement Officer', 1, 9, 'Welcome to Procurement! Everything is a sample and everything is for sale.'],
    bank: ['Professor Ledgerwood', 'Bursar', 0, 1, 'The Bursar\'s Office: where grants go to retire.'],
    yard: ['Gizmo', 'Lab Technician', 4, 0, 'I can add more speed! Maybe! I need a volunteer!'],
    office: ['Phil from Grants', 'Grants Officer', 0, 9, 'Phil here! Land is just a grant waiting to happen!']
  },
  halcyra: {
    market: ['Skybazaar Sal', 'Skybazaar Owner', 0, 2, 'Fresh from the wind! Everything floats, including the prices!'],
    bank: ['Nimbus', 'Cloud-Teller', 3, 0, 'Your funds are held in high-pressure storage. Please don\'t breathe on them.'],
    yard: ['Gale Wind-Wright', 'Wind-Wright', 0, 4, 'Faster? Sure! Just don\'t ask me to stop.'],
    fuel: ['Fumes McGee', 'Gas-Tender', 5, 0, 'Cheapest gas in the sky. The only gas in the sky.'],
    office: ['Cirrus', 'Platform Agent', 0, 10, 'Heavenly views, cloud-based foundations!']
  }
};
/* v4: the people who run each world's stock exchange */
NP.CAST.meridoa.exchange = ['Farmer Fortescue Bean', 'Grain Broker', 0, 7, 'Wheat is up! Or down! Or it is wheat. Buy some, whatever it is.'];
NP.CAST.karthosu.exchange = ['Ra-Ra the Bourse Keeper', 'Relic Trader', 5, 2, 'Shares in the past, bought and sold with great confidence about the future.'];
NP.CAST.ferrox.exchange = ['Ticker Tess', 'Futures Caller', 0, 3, 'Ore up, ore down! Shout your order over the drills!'];
NP.CAST.kryndor.exchange = ['Gordon Margin', 'Floor Trader', 0, 8, 'Welcome to the Spire Exchange. Greed is good, and so is the coffee. The coffee is better.'];
NP.CAST.nihil.exchange = ['The Whisperer', 'Floor Boss', 7, 0, 'Prices are whispered here. If you cannot hear them, you cannot afford them.'];
NP.CAST.quellin.exchange = ['Dr. Ima Speculate', 'Grant Speculator', 1, 9, 'We model the market with great rigour and are wrong with great precision.'];
NP.CAST.halcyra.exchange = ['Stratus Bull', 'Cloud Broker', 0, 4, 'Shares float up here, and sometimes they stay floating.'];
NP.SIGNS = {
  meridoa: { market: 'GOURD & GONE', bank: 'BANK OF BEANS', yard: 'HITCH & HAMMER', fuel: 'PUMP-A-PICKLE', cantina: 'THE MUDDY BOOT', office: 'DAISY REALTY', exchange: 'HARVEST EXCHANGE', jobs: 'ODD JOBS' },
  karthosu: { market: 'DUST & TRUST', bank: 'TOMB & TRUST', yard: 'CHARIOT REPAIR', fuel: 'NO FUEL (SORRY)', cantina: 'THE SAND TRAP', office: 'SPHINXY REALTY', exchange: 'RELIC BOURSE', jobs: 'ODD JOBS' },
  ferrox: { market: 'SLAG HEAP MART', bank: 'CREDIT UNION OF THE DEEP', yard: 'SPANNER & SON', fuel: 'GUS\'S GAS', cantina: 'THE DRILL BIT', office: 'CLAIMS DEPT', exchange: 'ORE FUTURES', jobs: 'ODD JOBS' },
  kryndor: { market: 'SPIRE MART', bank: 'COMPOUND & CO', yard: 'BOLT SHIPYARD', fuel: 'FUEL-O-MATIC', cantina: 'LEVEL 413 LOUNGE', office: 'SKY-LEASE', exchange: 'SPIRE STOCK EXCHANGE', jobs: 'ODD JOBS' },
  nihil: { market: 'NO QUESTIONS MARKET', bank: 'NULL BANK', yard: 'UPSIDE-DOWN REPAIRS', fuel: 'AIR & GAS', cantina: 'THE LONG DARK', office: 'FIVEFINGERS BROKER', parlour: 'THIN HOURS', exchange: 'THE FLOOR (NO QUESTIONS)', jobs: 'ODD JOBS' },
  quellin: { market: 'PROCUREMENT LAB', bank: 'THE BURSAR', yard: 'GIZMO LABS', fuel: 'NO TANKS HERE', cantina: 'THE CAFETERIA', office: 'GRANTS OFFICE', exchange: 'BOARD OF SPECULATION', jobs: 'ODD JOBS' },
  halcyra: { market: 'SKYBAZAAR', bank: 'CLOUD & CO BANK', yard: 'WIND-WRIGHTS', fuel: 'FUMES & SON', cantina: 'THE STORM EYE', office: 'CIRRUS REALTY', exchange: 'CIRRUS BOURSE', jobs: 'ODD JOBS' }
};
NP.QUIP = {
  market: 'Smells of cabbage and overcharging.', bank: 'Smells of money and mild regret.', yard: 'A shed of spanners and spare opinions.', fuel: 'Fumes with ambition.',
  cantina: 'Sticky floors. Honest people, probably one.', alley: 'It is dark in there. Something is breathing.', jobs: 'Odd jobs. Very, very odd.', exchange: 'Numbers go up. Numbers go down. People scream. It is the circle of finance.', pad: 'Your ship. Still a ship, for now.',
  office: 'A glass office full of big promises and small print.', parlour: 'The lights flicker. Probably a bad omen.', closed: 'A sign says CLOSED. A smaller sign says "forever".', decor: 'Scenery. Nice, though.'
};
NP.LINES = {
  market: {
    greet: ['Welcome! Everything is for sale except my dignity, and that is on layaway.', 'Step right up! Touch nothing you cannot afford, which is everything.', 'A customer! Quick, hide the good stuff and show the overpriced stuff!', 'Prices are firm, except when they are not, and they are never not.'],
    buy: ['{qty} {item}? Excellent choice! I would say that about anything, but still.', 'Sold! You drive a hard bargain. Not hard enough, but hard.', '{qty} {item}, in a bag I am also charging you for.', 'Pleasure doing business! Please do not check the weight.', '{item}! My second favourite word. The first is "cash".'],
    sell: ['Hm, {qty} {item}. I have seen worse. Not today, but I have.', 'I will take it, I will take it! Do not look at what I am paying, it embarrasses us both.', 'Ooh, {item}! Slightly used, slightly damp, now slightly mine.', 'Thank you for the {item}. The cheque is in the mail. The mail is also me.', 'A fine {item} haul. I would pay more, but physically cannot.'],
    broke: ['Credit? Ha. Ha. No.', 'Your wallet just made a very sad noise.', 'Come back with more coins or fewer expectations.'],
    bye: ['Come again! Or do not! I will be here regardless, tragically.', 'Mind the door. It bites.', 'Safe travels! Not my problem if they are not!']
  },
  bank: {
    greet: ['Please enjoy our complimentary anxiety.', 'Take a ticket. We have no tickets. Just stand there.', 'All deposits are insured by a very confident man named Dave.'],
    deposit: ['Your {amt}c is safe with us! Mostly. Probably. It is in a drawer.', 'Deposited! It will earn interest at a rate we describe as "present".', '{amt}c, tucked into the vault. The vault is a shoebox. A secure shoebox.'],
    withdraw: ['{amt}c out. Please count it. Then count it again. Then cry a little.', 'Withdrawing {amt}c! The money will miss us.', 'There you go, {amt}c. Try not to spend it on anything fun.'],
    loan: ['A thousand credits, on a handshake and a deeply worrying contract.', 'Sign here, here, here, and in blood. Kidding! The blue pen is fine. Mostly.', 'Another loan! We love your optimism.'],
    repay: ['Excellent! We love getting our money back.', '{amt}c repaid. The vault gives a happy little burp.', 'Every credit you repay makes a teller smile somewhere.'],
    no: ['Computer says no.', 'Yes... no.', 'That would require money you do not have, which is a recurring theme.']
  },
  yard: {
    greet: ['Ship is looking... fine. Ignore that noise it is making.', 'What can I bolt onto your hull today? Besides my hopes.', 'Bring her in! Gently! Not like last time!'],
    upgrade: ['Done! I only used a little duct tape. The good kind.', 'Installed! If it hums, that is normal. If it screams, that is also normal.', 'That will hold! Probably! Do not test it!'],
    closed: ['Closed! Come back never!', 'Sorry, we are out of all of it.', 'Gone to lunch. It has been a long lunch.']
  },
  fuel: {
    greet: ['Fuel! The wet stuff for the go-fast bits!', 'Do not smoke. Do not spark. Do not breathe near the nozzle.', 'Fill her up and she will love you for about a week.'],
    refuel: ['Glug glug glug... done! Mind the spill, it is flammable.', 'Topped up! That will be some money.', 'And she is full! Who is a thirsty ship? You are!'],
    closed: ['No pumps here. Just a very sad hose.', 'No fuel on this rock. Try hoping.']
  },
  office: {
    greet: ['Real estate! The only business where the floor is optional.', 'Location, location, and a bit of fraud!', 'Come in, come in. Do not read the small print, it is tiny and rude.'],
    bought: ['Congratulations, you are a real estate mogul! The mogul bit is unlicensed.', 'Pleasure! The paperwork is in triplicate and also on fire. Normal.', 'You own it now! Whatever "it" turns out to be!'],
    none: ['Nothing on offer today. Come back when my boss has a new scheme.', 'No listings. The last one escaped.']
  },
  cantina: { greet: ['Pull up a stool. It is slightly sticky, but loyal.', 'Buy a round and see who turns up.', 'Quiet night. The best sort of night to have an adventure.'] },
  alley: { greet: ['It is dark. Something is breathing, and it is probably fine.', 'You peek into the alley. The alley peeks back.'] },
  exchange: {
    greet: ['Welcome to the Exchange! Shout "buy" or "sell". Shouting "help" costs extra.', 'Numbers go up, numbers go down, and we take a small cut of both.', 'Stocks! Real shares of real companies! Some of them even exist!', 'Past performance is no guarantee of future performance. Or past performance, honestly.'],
    buy: ['Bought! You are now a part-owner of {item}. Please do not visit their offices.', '{qty} shares of {item}! The ticker gave a small, smug beep.', 'A fine purchase. I would say it is a sure thing, but legally I am not allowed to say that, or to know what a sure thing is.'],
    sell: ['Sold {qty} of {item}. Always take your profit. Or your loss. Someone has to.', 'Gone! The market giveth, and the market taketh a one percent fee.', 'Out of {item} you go. The ticker applauds, sarcastically.'],
    no: ['The ticker says no. The ticker is a ticker. It has no feelings.', 'Computer says you cannot afford that.']
  },
  jobs: { greet: ['Odd jobs, odd pay. Do not ask.', 'Foreman Gruff nods at the board. "Quick work, quick coin. Do not break anything."'] }
};
NP.say = function (role, kind, vars) {
  var pool = (NP.LINES[role] || {})[kind] || ['...'], s = GT.pick(pool);
  vars = vars || {}; return s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
};
/* v5: who is masculine or feminine (everyone else rolls at random from their name) */
NP.GEN = { 'Aunt Petunia Gourdwhistle': 'f', 'Mr. Hoe': 'm', 'Rusty Furrow': 'm', 'Agent Daisy Chain': 'f', 'Hakim Gravel': 'm', 'Osiris Wrapp': 'm', 'Ptah Spanner': 'm', 'Sphinxy': 'f',
  'Big Brenda Slagheap': 'f', 'Hardhat Hal': 'm', 'Pump Boss Gus': 'm', 'Mei-Lin Quicksale': 'f', 'Wilhelmina Compound': 'f', 'Chad Sky-Lease': 'm', 'Honest Abe': 'm', 'Zero-G Zed': 'm', 'Madame Thin Hour': 'f',
  'Dr. Pippa Beaker': 'f', 'Professor Ledgerwood': 'm', 'Phil from Grants': 'm', 'Skybazaar Sal': 'f', 'Gale Wind-Wright': 'f', 'Fumes McGee': 'm', 'Cirrus': 'f', 'Farmer Fortescue Bean': 'm', 'Ra-Ra the Bourse Keeper': 'm',
  'Ticker Tess': 'f', 'Gordon Margin': 'm', 'Dr. Ima Speculate': 'f', 'Foreman Gruff': 'm', 'Zara Vex': 'f', 'Mox Tallow': 'm', 'Old Brannock': 'm', 'Nimbus': 'f', 'Gasper': 'm' };
NP.row = function (pid, role) { return (NP.CAST[pid] || {})[role] || null; };
NP.char = function (pid, role) {
  var key = pid + '/' + role; if (NP.cache[key]) return NP.cache[key];
  var row = NP.row(pid, role), over = row ? { sp: row[2], hair: row[3] } : {}; if (row && NP.GEN[row[0]]) over.gen = NP.GEN[row[0]]; var t = CH.fromSeed(key, over);
  t.name = row ? row[0] : role; t.job = row ? row[1] : role; t.hello = row ? row[4] : '';
  return (NP.cache[key] = t);
};
/* The encounter character on each planet is the one named in the story data. */
NP.who = function (pid) { var w = GT.ENCOUNTER[pid].who.split(', '); return { name: w[0], job: w.slice(1).join(', ') }; };
NP.who2 = function (pid) {
  var key = pid + '/cantina'; if (NP.cache[key]) return NP.cache[key];
  var w = NP.who(pid), t = CH.fromSeed(key, { sp: { meridoa: 0, karthosu: 5, ferrox: 0, kryndor: 0, nihil: 0, quellin: 0, halcyra: 0 }[pid], hair: { meridoa: 10, karthosu: 0, ferrox: 7, kryndor: 8, nihil: 3, quellin: 1, halcyra: 7 }[pid] });
  t.name = w.name; t.job = w.job; return (NP.cache[key] = t);
};
NP.rival = function (ci) { var c = GT.COMPETITORS[ci], t = NP.cache['rival' + ci]; if (!t) { t = CH.fromSeed('rival' + c.name, { sp: [0, 4, 8, 5][ci], hair: [18, 8, 0, 3][ci], gen: ['f', 'n', 'n', 'm'][ci] }); t.name = c.name; t.title = c.title; NP.cache['rival' + ci] = t; } return t; };
