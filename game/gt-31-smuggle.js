/* Galactic Trader 4. Part 31: smuggling. The Back Alley sometimes puts a hooded fixer in front of you. A run has a stake (fronted by you), a headline payout and a risk.
   About 4 runs in 10 go badly, which is far more than the road or the alley usually manages (see gt-sim-features.js). Reputation tilts the odds like it does for other events.
   The UI reads s.visit.smuggle (the offer), then calls GT.smuggleAccept(s) or GT.smuggleRefuse(s). No DOM in here. */
(function () {
  var clamp = GT.clamp, R = GT.R, fmt = GT.fmt;
  GT.SMUGGLE_RISK = { low: 0.30, medium: 0.40, high: 0.52 };
  GT.SMUGGLE_HINT = { low: 'The fixer swears it is easy. The fixer swears a lot.', medium: 'Worth a look, if you are lucky and well liked.', high: 'Big money, big trouble. Mostly trouble.' };

  /* stakeF and payF are multiples of the stage scale GT.scale(s). up is the permanent enhancement a lucky run can leave behind. */
  GT.SMUGGLE = [
    { id: 'fungus', title: 'The Singing Fungus', cargo: 'crates of singing fungus', risk: 'low', stakeF: 0.4, payF: 0.9, up: 'cargo',
      text: 'A hooded fixer steps out of the steam. "Sixteen crates of fungus, harmless, mostly illegal for the singing. Get them past the dock scanners and I will make it worth your while."',
      win: 'The scanners hear nothing but a cough and your crates hum a hymn all the way to the buyer. Paid in full.', big: 'A choir of collectors outbids itself over the fungus. The fixer weeps, and pays you extra to be quiet about it.', caught: 'The crates break into song at the checkpoint. A very musical inspector fines you for noise, contraband and bad harmony.', damage: 'The fungus spores bloom in your air filters. Your engine coughs, your hold smells of choirs, and the buyer refuses the damaged lot.', lost: 'A rival gang hears the singing and snatches the lot from under your nose, along with a few of your own crates.' },
    { id: 'eggs', title: 'Eggs of Unclear Origin', cargo: 'a crate of warm, humming eggs', risk: 'medium', stakeF: 0.5, payF: 1.2, up: 'speed',
      text: 'The fixer whispers, "Do not ask what is inside. Do not count them. Keep them warm and deliver them by the next dusk."',
      win: 'You keep the eggs warm, and nothing hatches. The buyer cries happy tears and hands you the credit chit.', big: 'Something hatches at the drop and licks your hand. The buyer adores it, and pays a premium for the "nanny fee".', caught: 'An egg hatches at the checkpoint. The thing that comes out is not on any manifest. The fine is considerable.', damage: 'The eggs hatch in your engine room and eat a coil. They are very sorry about it, in whatever language they speak.', lost: 'You wake to an empty crate and one slippery trail leading out the airlock. The buyer wants your stake in lieu.' },
    { id: 'darkbox', title: 'A Box That Hums', cargo: 'a lead box that hums at night', risk: 'high', stakeF: 0.8, payF: 2.2, up: 'speed',
      text: 'A figure in a long coat sets a box on the table. It is warm, and the cat at the next table has left. "Dark matter, uncut. Do not open it. Do not shake it. Do not think about it."',
      win: 'The box hums politely all the way to the buyer. It is paid for in credits, a nod and an unsettling smile.', big: 'The buyer opens the box a crack, laughs, and doubles the fee. You never find out why.', caught: 'Customs open the box. The report is eleven pages. The fine is considerable and the stain on your reputation is worse.', damage: 'The box hums a little too hard. Every dial on your bridge spins and the engines limp for a few jumps.', lost: 'The box gets heavier, then lighter, then gone. The buyer wants both it and your stake back.' },
    { id: 'relics', title: 'Stolen Relics', cargo: 'a sack of "ancient" relics', risk: 'medium', stakeF: 0.6, payF: 1.3, up: 'cargo',
      text: 'The fixer taps a sack with a hooked finger. "Genuine relics, perhaps, or the best fakes on four worlds. The buyer does not mind which. The museum does."',
      win: 'The buyer sniffs the relics, shrugs and pays. Nobody asks where the museum went.', big: 'A collector decides your relics are "unquestionably authentic" and pays three times the going rate for his own delusion.', caught: 'The museum has a very good lawyer, and a very good drone. You pay a heavy fine, and your name hits the gossip sheets.', damage: 'The relics were cursed after all. Something nasty wedges itself in the engine coil and sulks there for days.', lost: 'You are shaken down by a rival smuggler who wants the sack. He takes the sack, your stake and part of your hold for the inconvenience.' },
    { id: 'rum', title: 'Moonshine Run', cargo: 'barrels of nine-day moonshine', risk: 'low', stakeF: 0.3, payF: 0.8, up: 'fuel',
      text: '"Moonshine," the fixer says, as if proud. "Ten barrels, aged nine days. Twelve, if you count the wait. Take it to the cantina on the far side."',
      win: 'The cantina owner takes a sip, weeps, and pays on the spot. The barrels run dry before the bar does.', big: 'The whole cantina cheers and the owner passes a hat. You walk out with a hat full of credits.', caught: 'The excise officer sips the moonshine, coughs for a minute, and fines you for it. Then he asks for another barrel.', damage: 'A barrel bursts in the hold. The fumes eat a seal, and your engine runs on the fumes, badly.', lost: 'Some of your hold gets "taxed" by a dockside gang. They leave you smelling like a distillery.' },
    { id: 'cogs', title: 'Hot Engine Parts', cargo: 'crates of engine coils with the serial numbers filed off', risk: 'medium', stakeF: 0.5, payF: 1.1, up: 'speed',
      text: '"Coils, brand new, serial numbers worn off by accident." The fixer winks with both eyes. "Somebody\'s missing them. Not my fault. Not yours, until you get caught."',
      win: 'The mechanic at the drop takes the coils and asks no questions. Which is what you paid for.', big: 'A racing crew snaps up every last coil and tips you for the speed. You keep a spare and a grin.', caught: 'The shipyard inspector runs a quick scan and finds nothing but trouble. A heavy fine and a stern speech follow.', damage: 'The coils were not quite stable. One of them overloads in your hold and takes your own warp coils with it.', lost: 'The stake is gone, and so are the coils. The mechanic swears he never saw you.' },
    { id: 'spiceskin', title: 'Banned Spices', cargo: 'sacks of banned flavour', risk: 'low', stakeF: 0.4, payF: 1.0, up: 'cargo',
      text: 'The fixer slides a sack across the bar. It smells like a festival and a fire at once. "Banned on six worlds for flavour. Sell it on the seventh."',
      win: 'A chef with no questions buys the lot, and the dock smells wonderful for an hour.', big: 'A culinary guild goes into a bidding war over your sacks. Somebody cries. You collect.', caught: 'The sack sneezes. A dozen dock guards sneeze with it. The fine is for contraband, and for the chaos.', damage: 'The spice gets into your air recyclers. The crew sneeze for three days and the engine sneezes with them.', lost: 'You find a smaller, lighter sack and a note that says "Sorry. Hungry." The buyer does not accept notes.' },
    { id: 'pirate', title: 'A Pirate Favour', cargo: 'a sealed pouch for a pirate captain', risk: 'high', stakeF: 0, payF: 1.7, up: 'cargo',
      text: 'A scarred courier lowers her voice. "No stake, no cargo, only a pouch. Carry it to the captain at the end of the pier. If it gets damaged, so do you."',
      win: 'The pirate captain checks the seal, nods, and pays on the spot, with a grin that has far too many teeth.', big: 'The pouch contained a map. The captain is delighted with you and pays an astonishing "courtesy fee".', caught: 'A patrol boards you mid-route. The pouch is found and you pay for something you never opened.', damage: 'The pirate captain\'s rival fires a warning shot. It is a good shot. The engine takes a wound.', lost: 'You hand over the pouch and the captain\'s crew help themselves to some of your own cargo for "customs".' },
    { id: 'blueprint', title: 'Stolen Blueprints', cargo: 'a tube of stolen shipyard blueprints', risk: 'medium', stakeF: 0.4, payF: 1.2, up: 'speed',
      text: '"Tolerances for a prototype engine," the fixer says, tapping the tube. "Tuck it in your sleeve and hand it to a man who smells of machine oil."',
      win: 'The man smells of machine oil, and of satisfaction. He pays in untraceable chits.', big: 'The blueprints include a tuning note nobody else has seen. The buyer pays double, and also tunes your engine.', caught: 'The shipyard security caught your scent a jump back. They fine you heavily and loudly, so everyone knows.', damage: 'The blueprint was a decoy, and a booby-trapped one. A small bang, a large smell, a sulking engine.', lost: 'The tube is empty when you reach the drop. The buyer is not amused. Neither is your stake, which is now gone.' },
    { id: 'furs', title: 'Endangered Fluff', cargo: 'bales of very illegal, very soft fluff', risk: 'medium', stakeF: 0.5, payF: 1.1, up: 'fuel',
      text: '"Fluff," whispers the fixer, "from the extremely protected, extremely adorable moss-bears of a moon I will not name. They shed. It is not a crime. The selling is."',
      win: 'The buyer coos at the fluff, pays and promises to knit something illegal.', big: 'A fashion house is so smitten that it wins an unseemly auction. The fluff is gone, and the money is very much not.', caught: 'A ranger on holiday takes a very serious interest in your cargo. The fine is for the fluff, and the lecture is free.', damage: 'The fluff clogs the intakes. The engine takes a while to get over it, and so do your sinuses.', lost: 'Customs take the fluff, your stake, and (you suspect) a little from your own hold for the cuddles.' },
    { id: 'ghostdata', title: 'A Chit of Ghost Data', cargo: 'a data chit full of other people\'s secrets', risk: 'high', stakeF: 0.7, payF: 2.0, up: 'any',
      text: '"A chit," says the fixer, "of secrets. Many, many secrets. Some of them are yours. Deliver it to the lady in green and do not let her read it first."',
      win: 'The lady in green reads, smiles, pays and vanishes. You think she was reading your own secrets, but she is gone.', big: 'The chit contained something very interesting about a very rich man. The lady is thrilled, and generous.', caught: 'The data trail leads straight to you. Dock security fines you hard, and your reputation goes with it.', damage: 'The chit carries a virus. Your navigation computer sulks, sparks and slows the ship to a crawl for a few jumps.', lost: 'A rival shows up with a better offer and a heavier hand. The chit is gone, and your stake with it.' },
    { id: 'cadaver', title: 'The Quiet Passenger', cargo: 'a very still passenger in a very long crate', risk: 'high', stakeF: 0.5, payF: 1.8, up: 'cargo',
      text: 'The fixer indicates a long crate, tastefully draped. "A passenger. Very quiet. Very low-maintenance. Needs cold storage and no questions."',
      win: 'The crate is collected by a very polite undertaker who pays in cash and asks nothing at all.', big: 'The passenger turns out to be the guest of honour at a very exclusive funeral. The fee is generous, and so is the dessert.', caught: 'A coroner has a few questions. You answer them at length, and a fine arrives with the bill for the coroner\'s time.', damage: 'The passenger was not as dead as hoped. The scuffle takes a toll on the engine room.', lost: 'You wake to find the crate empty and the airlock open. The buyer wants his money back.' },
    { id: 'scrap', title: 'Radioactive Scrap', cargo: 'a heap of cheerfully glowing scrap', risk: 'medium', stakeF: 0.4, payF: 1.0, up: 'fuel',
      text: '"Scrap," says the fixer, "which glows a little. Technically it is not scrap. Technically it is a lot of things. Sell it to the recycler and wash your hands."',
      win: 'The recycler waves a counter at your haul, nods, and pays. Everything on the dock glows a little greener.', big: 'The recycler finds a vein of something precious in the heap and pays you for it. You wash your hands twice.', caught: 'A hazmat crew arrives, covers everything in foam, and fines you for it. The foam is free, but the fine is not.', damage: 'The scrap leaks into your coolant. The engine groans, the crew glow, and the repair bill is on you.', lost: 'You are hit by a scavenger crew. They take the scrap, the stake and a quarter of your good cargo.' },
    { id: 'wine', title: 'Vintage Void Wine', cargo: 'cases of vintage void wine', risk: 'low', stakeF: 0.5, payF: 1.0, up: 'fuel',
      text: '"A vintage so old," the fixer sighs, "that the vineyard has been a black hole since before you were born. A few cases survived. Do not drink the evidence."',
      win: 'The sommelier of a certain very exclusive club pays handsomely and swears you tasted nothing.', big: 'A crime lord with a palate is so moved that he tips you the price of the whole case.', caught: 'Customs take a case, a sip and a very long time to decide how much to fine you. The sip was the problem.', damage: 'A case goes off in your hold. The void-wine burns through a bulkhead and a few of the finer engine parts.', lost: 'Half the wine goes missing, and so does half your stake. The crew look suspiciously cheerful.' },
    { id: 'cat', title: 'The Very Large Cat', cargo: 'a very large, very expensive cat', risk: 'low', stakeF: 0, payF: 0.7, up: 'any',
      text: '"A cat," the fixer says. "A very large cat. A very rich lady\'s cat, which has been, in the loosest sense, rescued. Get it to her sister by dawn."',
      win: 'The sister weeps with joy and pays for the cat\'s safe return, and for your silence about the paperwork.', big: 'The cat adores you. The sister is so glad she pays you triple and sends you home with a cushion.', caught: 'The original owner has very good lawyers and a very bad temper. The cat watches while you are fined.', damage: 'The cat declines the trip and demonstrates with its claws. The engine room will never be the same.', lost: 'The cat is gone. So is a share of your hold. You are not sure how, and you suspect the cat.' }
  ];

  /* Names for the permanent boost a lucky run can leave behind */
  GT.SMUGGLE_UPS = {
    cargo: { text: 'A false floor in the stash leaves your hold a little roomier: <b>+4 cargo space</b>.', apply: function (s) { s.ship.cargoMax += 4; } },
    speed: { text: 'A grateful mechanic tweaks your coils on the way out: <b>+0.1 warp</b> for good.', apply: function (s) { s.ship.speed = Math.round((s.ship.speed + 0.1) * 10) / 10; } },
    fuel: { text: 'The crew find a spare tank bracket and weld it in: <b>+10 PC fuel capacity</b>.', apply: function (s) { s.ship.fuelMax += 10; } },
    pax: { text: 'A spare cabin turns up behind a panel. You hang a hammock: <b>+1 passenger berth</b>.', apply: function (s) { s.ship.paxMax = (s.ship.paxMax || 0) + 1; } }
  };

  var baseNew = GT.newState;
  GT.newState = function (shipId, name, char) {
    var s = baseNew(shipId, name, char);
    s.visit.smuggle = null;
    s.stats.smuggleRuns = 0; s.stats.smuggleWins = 0; s.stats.smuggleCaught = 0; s.stats.smuggleNet = 0;
    return s;
  };

  /* chance of something going wrong on this offer, after reputation */
  GT.smuggleBadChance = function (s, risk) { return clamp(GT.SMUGGLE_RISK[risk] * (1 - GT.luck(s) * 0.4), 0.12, 0.8); };

  GT.smuggleMake = function (s, cargo) {
    var S = GT.scale(s), c = cargo || GT.pick(GT.SMUGGLE);
    var stake = Math.round(S * c.stakeF * R(0.85, 1.15) / 5) * 5, pay = Math.round(S * c.payF * R(0.85, 1.15) / 5) * 5;
    return { id: c.id, title: c.title, cargo: c.cargo, text: c.text, stake: stake, pay: pay, risk: c.risk, hint: GT.SMUGGLE_HINT[c.risk] };
  };

  /* called from the alley when an event fires. Returns true when it made an offer instead of a plain event. */
  GT.smuggleMaybe = function (s, pl) {
    if (s.visit.smuggle || GT.rand() >= GT.CFG.SMUGGLE_SHARE) return false;
    var c = null, k;
    for (k = 0; k < 5; k++) { c = GT.pick(GT.SMUGGLE); if (c.stakeF * GT.scale(s) * 0.85 <= s.credits * 0.8) break; }
    var o = GT.smuggleMake(s, c); s.visit.smuggle = o;
    GT.log(s, '<b>Exploring ' + pl.name + ':</b> a hooded fixer beckons you into a doorway and offers you a smuggling run: <b>' + o.title + '</b>. ' + o.text + ' <span class="fx">(stake ' + fmt(o.stake) + 'c, payout about ' + fmt(o.pay) + 'c, risk ' + o.risk + ')</span>', 'event');
    return true;
  };

  GT.smuggleRefuse = function (s) {
    var o = s.visit.smuggle; if (!o) return false;
    s.visit.smuggle = null;
    GT.log(s, 'You decline the fixer\'s offer (<b>' + o.title + '</b>). The fixer shrugs and melts back into the steam. Maybe next time.', 'info');
    return true;
  };

  GT.smuggleCanAccept = function (s) { var o = s.visit.smuggle; return !!(o && !s.over && !s.pending && s.credits >= o.stake); };

  /* Runs the job. kinds: win, bonus (big payout), upgrade (small payout and a permanent boost), neutral, caught, damage, lost. */
  GT.smuggleAccept = function (s) {
    var o = s.visit.smuggle;
    if (!o || s.over || s.pending) return { ok: false, kind: 'neutral', text: 'There is no offer on the table.', money: 0 };
    if (s.credits < o.stake) return { ok: false, kind: 'neutral', text: 'You cannot cover the ' + fmt(o.stake) + 'c stake.', money: 0 };
    var c = GT.SMUGGLE.filter(function (x) { return x.id === o.id; })[0], S = GT.scale(s), st = s.stats, kind, text = '', net = 0, extra = '', r;
    s.visit.smuggle = null; st.smuggleRuns++;
    s.credits -= o.stake;
    var bad = GT.rand() < GT.smuggleBadChance(s, o.risk);
    if (!bad) {
      r = GT.rand();
      if (r < 0.72) kind = 'win'; else if (r < 0.89) kind = 'bonus'; else if (r < 0.95) kind = 'upgrade'; else kind = 'neutral';
      var back = kind === 'win' ? o.pay : kind === 'bonus' ? Math.round(o.pay * 2.1) : kind === 'upgrade' ? Math.round(o.pay * 0.4) : 0;
      s.credits += o.stake + back; net = back; st.smuggleWins += kind === 'neutral' ? 0 : 1;
      if (kind === 'win') text = c.win; else if (kind === 'bonus') text = c.big; else if (kind === 'neutral') text = 'The buyer does not show. After an hour you give up and take the cargo home, stake intact and nothing gained.';
      else { var uk = c.up === 'any' ? GT.pick(['cargo', 'speed', 'fuel', 'pax']) : c.up, u = GT.SMUGGLE_UPS[uk]; u.apply(s); text = c.win; extra = ' ' + u.text; }
    } else {
      r = GT.rand();
      if (r < 0.38) kind = 'caught'; else if (r < 0.68) kind = 'damage'; else kind = 'lost';
      net = -o.stake;
      if (kind === 'caught') {
        var fine = Math.min(Math.max(0, s.credits), Math.round(S * R(0.4, 1.0) / 5) * 5); s.credits -= fine; net -= fine; GT.addRep(s, -6); st.smuggleCaught++;
        text = c.caught; extra = ' <span class="fx">(fine ' + fmt(fine) + 'c; -6 reputation)</span>';
      } else if (kind === 'damage') {
        var dm = Math.round(R(0.3, 0.5) * 10) / 10, fl = GT.RI(8, 16), before = s.ship.fuel; s.ship.damage.push({ amt: dm, turns: 6 }); s.ship.fuel = clamp(s.ship.fuel - fl, 0, s.ship.fuelMax);
        text = c.damage; extra = ' <span class="fx">(engine damaged: -' + dm.toFixed(1) + ' warp for 6 jumps; ' + (s.ship.fuel - before) + ' PC fuel)</span>';
      } else {
        var used = GT.cargoUsed(s), n = used ? Math.max(1, Math.ceil(used * R(0.05, 0.12))) : 0, lostTxt = [];
        for (var q = 0; q < n; q++) { var pool = []; s.cargo.forEach(function (cc, i) { if (cc.qty > 0) pool.push(i); }); if (!pool.length) break; var pi = GT.pick(pool); s.cargo[pi].qty--; if (!s.cargo[pi].qty) s.cargo[pi].avg = 0; lostTxt.push(pi); }
        text = c.lost; extra = n ? ' <span class="fx">(' + lostTxt.length + ' units of your own cargo went too)</span>' : '';
      }
    }
    st.smuggleNet += net;
    var tag = { win: 'Smuggling run done', bonus: 'Smuggling jackpot', upgrade: 'Smuggling run done', neutral: 'Smuggling run called off', caught: 'Smuggling run busted', damage: 'Smuggling run goes wrong', lost: 'Smuggling run robbed' }[kind];
    var line = '<b>' + tag + ' (' + o.title + '):</b> ' + text + extra + ' <b>' + (net >= 0 ? '+' : '-') + fmt(Math.abs(net)) + 'c</b> net' + (o.stake ? ' after the ' + fmt(o.stake) + 'c stake.' : '.');
    GT.log(s, line, net > 0 ? 'gain' : net < 0 ? 'loss' : 'event', net);
    return { ok: true, kind: kind, text: text + extra, money: net, stake: o.stake };
  };
})();
