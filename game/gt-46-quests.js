/* Galactic Trader 10. Part 46: quests. No DOM in here.
   1. The main story, "The Ninth Lane": seven chapters across the sector. Each chapter is a conversation with a choice, some choices need cargo, shares, fuel,
      reputation or a fast ship, and the choices you make change later chapters and the ending. The prize is a one-of-a-kind ship part.
   2. Contracts: small one-off jobs from the Odd Jobs board. Haul goods, carry a sealed parcel, hold some shares, survey a world, or run fuel to a stranded crew.
   3. Guild notices: one-time quests that open up as your reputation rises (or sinks, for the Syndicate). Each has a lasting reward.
   Arriving at a world checks every quest: deliveries are handed over, deadlines are enforced, and a story chapter set on that world opens a conversation (s.questPrompt). */
(function () {
  var clamp = GT.clamp, R = GT.R, fmt = GT.fmt;
  var P = function (id) { for (var i = 0; i < GT.PLANETS.length; i++) if (GT.PLANETS[i].id === id) return i; return -1; };
  var IT = function (id) { for (var i = 0; i < GT.ITEMS.length; i++) if (GT.ITEMS[i].id === id) return i; return -1; };
  /* need([ok, reason], ...) gives true, or the first reason that fails */
  var need = function () { for (var i = 0; i < arguments.length; i++) if (!arguments[i][0]) return arguments[i][1]; return true; };
  var amt = function (s, k, lo) { var q = GT.QUEST_PAY || 1; return Math.max(Math.round((lo || 50) * Math.sqrt(q) / 10) * 10, Math.round(GT.scale(s) * k * q / 10) * 10); };  /* v11: GT.QUEST_PAY scales every quest fee and reward */
  GT.CONTRACT_MAX = 3;

  /* ---------- state ---------- */
  function newQ() { return { main: { ch: 0, state: 'waiting', flags: {}, hist: [] }, active: [], done: [], repDone: {}, seq: 0, parcels: 0 }; }
  var baseNew = GT.newState;
  GT.newState = function (shipId, name, char) {
    var s = baseNew(shipId, name, char);
    s.quests = newQ(); s.questPrompt = null; s.perks = {}; s.ship.relics = [];
    s.stats.contracts = 0; s.stats.contractsFailed = 0; s.stats.questGain = 0; s.stats.chapters = 0; s.stats.repQuests = 0;
    return s;
  };
  GT.Q = function (s) { return s.quests || (s.quests = newQ()); };

  /* sealed parcels take up hold space */
  var baseUsed = GT.cargoUsed;
  GT.cargoUsed = function (s) { return baseUsed(s) + ((s.quests && s.quests.parcels) || 0); };

  /* ---------- helpers ---------- */
  GT.qHas = function (s, item, n) { return s.cargo[item].qty >= n; };
  GT.qTake = function (s, item, n) { var c = s.cargo[item]; c.qty -= n; if (c.qty <= 0) { c.qty = 0; c.avg = 0; } };
  function pay(s, n, why) { if (n <= 0) return ''; s.credits += n; s.stats.questGain += n; return ' <b>+' + fmt(n) + 'c</b>'; }
  function charge(s, n) { if (s.credits < n) return false; s.credits -= n; return true; }
  function rep(s, d) { if (!d) return ''; GT.addRep(s, d); return ' <span class="fx">(' + (d > 0 ? '+' : '') + d + ' reputation)</span>'; }
  function stockIx(tick) { for (var k = 0; k < GT.STOCKS.length; k++) if (GT.STOCKS[k].tick === tick) return k; return -1; }
  GT.qName = function (p) { return GT.PLANETS[p].name; };

  /* ======================= 1. THE NINTH LANE ======================= */
  /* Each chapter: where it happens (-1: wherever you are), who you meet, the scene, what you need, and the choices.
     A choice's req returns true or a short reason it is not available. act applies it and returns the text of what happens. */
  var GIVERS = {
    odile: { name: 'Captain Odile Marrow', job: 'Retired lane scout', seed: 'q-odile', over: { sp: 0, gen: 'f', hair: 0, acc: 2 } },
    quill: { name: 'Archivist Hesper Quill', job: 'Keeper of the Tomb Records', seed: 'q-quill', over: { sp: 5, gen: 'f', hair: 13, acc: 6 } },
    vane: { name: 'Madame Sorrel Vane', job: 'Vault-keeper, Parlour of Thin Hours', seed: 'q-vane', over: { sp: 3, gen: 'f', hair: 6, acc: 1 } },
    ama: { name: 'Dr. Ama Okonkwo-Reyes', job: 'Signal decoder, Quellin Reach', seed: 'q-ama', over: { sp: 0, gen: 'f', hair: 15, acc: 6 } },
    brakka: { name: 'Forewoman Brakka Dunmore', job: 'Hull foreman, Ferrox deep yards', seed: 'q-brakka', over: { sp: 5, gen: 'f', hair: 7, acc: 5 } },
    orro: { name: 'Captain Ilyx Orro', job: 'Your rival, and a sore loser', seed: 'rival', rival: 2 },
    ark: { name: 'The Ark', job: 'A Precursor ship, older than the stars around it', seed: 'q-ark', over: { sp: 4, acc: 0, hair: 0 } }
  };
  GT.QGIVERS = GIVERS;
  GT.MAIN = [
    { id: 'note', title: 'The Note in the Glass', where: -1, who: 'odile', minTurn: 4,
      goal: function () { return 'Visit any world from turn 4 on. Someone is looking for you.'; },
      scene: function (s) { return 'The barkeep slides you a drink you did not order. Under the glass is a note: <i>"Corner booth. Bring your curiosity."</i> In the booth sits an old scout with an eyepatch and a laugh like gravel. She unrolls a scrap of star-chart that glows faintly in the gloom. "The Ninth Lane," she says. "A hyperlane the Precursors hid before they vanished. At the end of it sits their Ark. I am too old to fly it and too stubborn to let it rot. The chart is in pieces. This is the first."'; },
      choices: [
        { id: 'oath', label: 'Promise to finish her map', note: 'She pays your expenses. +3 reputation.', act: function (s, Q) { Q.flags.oath = 1; var t = 'You shake her hand. Her grip is shockingly strong. "Then it is yours, captain. Bring me back the whole map before I die of boredom." She presses a purse of expenses into your palm.' + pay(s, amt(s, 0.6, 300)) + rep(s, 3); return t; } },
        { id: 'buy', label: 'Buy the fragment outright', note: function (s) { return 'Costs ' + fmt(amt(s, 0.8, 300)) + 'c. No promises.'; }, req: function (s) { return s.credits >= amt(s, 0.8, 300) || 'Not enough credits'; }, act: function (s, Q) { var c = amt(s, 0.8, 300); charge(s, c); Q.flags.bought = 1; return 'You count out the credits. She counts them twice, sniffs, and hands over the fragment. "Business is business. Good luck, merchant." <b>-' + fmt(c) + 'c</b>'; } },
        { id: 'steal', label: 'Pocket it while she naps', note: 'Free, but people will talk. -6 reputation.', act: function (s, Q) { Q.flags.thief = 1; return 'She nods off mid-story. You slip the fragment into your coat and leave a tip, which you tell yourself makes it fine. It does not.' + rep(s, -6); } }
      ] },
    { id: 'ink', title: 'Dust and Ink', where: P('karthosu'), who: 'quill',
      goal: function () { return 'Take the fragment to Karth-Osu. The archivist there can read Precursor glyphs. Her diggers are sick: <b>8 Medical</b> would help.'; },
      scene: function (s, Q) { return 'In a cool tomb lit by oil lamps, Archivist Hesper Quill turns the fragment over with tweezers. "Precursor glyphs, and a coordinate fragment. I can read it. But my diggers are coughing up dust and I have no medicine. Help them, and I help you."' + (Q.flags.thief ? ' She squints at you. "You have the look of someone who borrows things permanently."' : ''); },
      choices: [
        { id: 'meds', label: 'Hand over 8 Medical', note: 'From your hold. +4 reputation, and she pays a little for them.', req: function (s) { return GT.qHas(s, IT('medical'), 8) || 'You need 8 Medical in your hold'; }, act: function (s, Q) { GT.qTake(s, IT('medical'), 8); Q.flags.quill = 1; return 'The diggers cheer weakly from their cots. Quill reads the glyphs by lamplight until dawn. "The second piece is locked in a vault on Nihil Station," she says, and pays you for the medicine.' + pay(s, Math.round(8 * GT.ITEMS[IT('medical')].base * 1.2)) + rep(s, 4); } },
        { id: 'fee', label: 'Pay her translation fee', note: function (s) { return 'Costs ' + fmt(amt(s, 1.2, 400)) + 'c.'; }, req: function (s) { return s.credits >= amt(s, 1.2, 400) || 'Not enough credits'; }, act: function (s, Q) { var c = amt(s, 1.2, 400); charge(s, c); return 'Quill takes the credits without looking at them. "The second piece is in a vault on Nihil Station. Do not touch anything on your way out." <b>-' + fmt(c) + 'c</b>'; } },
        { id: 'forge', label: 'Copy the glyphs with a forged permit', note: 'Risky. Only for captains with a shady streak.', req: function (s, Q) { return (Q.flags.thief || s.rep <= 0) || 'Only a shady captain would try this'; }, act: function (s, Q) { if (GT.rand() < 0.6) { Q.flags.forged = 1; return 'The forged permit holds. You copy the glyphs onto your sleeve and slip out. A local scholar reads them for a sandwich: the next piece is on Nihil Station.'; } var f = amt(s, 0.8, 300); s.credits -= f; return 'A tomb guard reads your permit upside down and still spots the forgery. You pay a fine and Quill, sighing, reads the glyphs anyway to get rid of you: Nihil Station. <b>-' + fmt(f) + 'c</b>' + rep(s, -3); } }
      ] },
    { id: 'vault', title: 'The Vault of Thin Hours', where: P('nihil'), who: 'vane',
      goal: function () { return 'Go to Nihil Station and get the second fragment out of Madame Vane\'s vault. She favours <b>NULL shareholders (15+)</b>, captains with <b>20+ reputation</b>, and gamblers.'; },
      scene: function (s) { return 'Madame Sorrel Vane keeps her vault behind the Parlour of Thin Hours, among stacks of IOUs from people who no longer exist. "I have your fragment," she purrs. "I do not sell to strangers. I sell to shareholders, to people of good name, and to anyone who beats me at cards."'; },
      choices: [
        { id: 'shares', label: 'Show your NULL shares', note: 'Hold 15 or more shares of Null Dark Matter Inc.', req: function (s) { var k = stockIx('NULL'); return (k >= 0 && s.stocks[k].qty >= 15) || 'You need 15 NULL shares (buy them at any Exchange)'; }, act: function (s, Q) { Q.flags.share = 1; return 'Vane checks the register and smiles a shareholder\'s smile. "Family, then." The fragment is yours, gift-wrapped in an IOU.' + rep(s, 2); } },
        { id: 'name', label: 'Vouch with your good name', note: 'Needs 20 or more reputation.', req: function (s) { return s.rep >= 20 || 'You need at least 20 reputation'; }, act: function (s, Q) { return '"Your name precedes you," Vane says, "and for once it is not a warning." She hands over the fragment.'; } },
        { id: 'cards', label: 'Play her for it', note: function (s) { return 'Stake ' + fmt(amt(s, 1, 300)) + 'c. About an even chance.'; }, req: function (s) { return s.credits >= amt(s, 1, 300) || 'Not enough credits for the stake'; }, act: function (s, Q) { var st = amt(s, 1, 300); s.stats.gambleRounds++; if (GT.rand() < 0.55) { s.stats.gambleNet += st; Q.flags.cards = 1; return 'Three hands of Void Gin later Vane throws down her cards, laughing. "Take your fragment and my stake. Come back and lose some time."' + pay(s, st); } s.credits -= st; s.stats.gambleNet -= st; return 'You lose, gracefully. Vane, amused, gives you the fragment anyway: "You will need it more than I will. And I keep the stake." <b>-' + fmt(st) + 'c</b>'; } },
        { id: 'buy', label: 'Buy it', note: function (s) { return 'Costs ' + fmt(amt(s, 2, 600)) + 'c.'; }, req: function (s) { return s.credits >= amt(s, 2, 600) || 'Not enough credits'; }, act: function (s, Q) { var c = amt(s, 2, 600); charge(s, c); return 'Vane names a price that makes your accountant faint. You pay it. <b>-' + fmt(c) + 'c</b>'; } }
      ] },
    { id: 'cold', title: 'Cold Light', where: P('quellin'), who: 'ama',
      goal: function () { return 'Take both fragments to Quellin Reach. The decoder there runs on <b>4 Dark Matter</b> (or you can rent decoder time).'; },
      scene: function (s) { return 'Dr. Ama Okonkwo-Reyes clamps the fragments into a humming ring of white machinery. "The Precursors encoded the lane as a song in the gravity of seven worlds. Our decoder can sing it back. It just eats dark matter like breakfast cereal."'; },
      choices: [
        { id: 'share', label: 'Bring 4 Dark Matter and share the find', note: 'The Reach publishes the science. +5 reputation.', req: function (s) { return GT.qHas(s, IT('darkmatter'), 4) || 'You need 4 Dark Matter in your hold'; }, act: function (s, Q) { GT.qTake(s, IT('darkmatter'), 4); Q.flags.science = 1; return GT.relic(s, 'lanesense') + ' The decoder sings. Ama cries a little. The whole Reach toasts your name in cold champagne.' + rep(s, 5); } },
        { id: 'secret', label: 'Rent decoder time and keep it quiet', note: function (s) { return 'Costs ' + fmt(amt(s, 1.5, 500)) + 'c. Nobody else learns about the Ark.'; }, req: function (s) { return s.credits >= amt(s, 1.5, 500) || 'Not enough credits'; }, act: function (s, Q) { var c = amt(s, 1.5, 500); charge(s, c); Q.flags.secret = 1; return GT.relic(s, 'lanesense') + ' Ama runs the decoder after hours, for cash, with the blinds down. <b>-' + fmt(c) + 'c</b>'; } }
      ] },
    { id: 'iron', title: 'Iron for the Deep', where: P('ferrox'), who: 'brakka',
      goal: function () { return 'The Ninth Lane would shake an ordinary hull apart. Go to Ferrox and have a lane anchor fitted. Brakka\'s crews work for food: <b>10 Rations</b>.'; },
      scene: function (s, Q) { return 'Forewoman Brakka Dunmore walks round your ship twice and kicks a landing strut. "A lane anchor and armour plate, for a deep run? Aye, I can do that. My crew work for food, mind. Real food, not that paste."' + (Q.flags.science ? ' She taps a datapad. "The Reach already sent me the design. Fancy that."' : ''); },
      choices: [
        { id: 'food', label: 'Feed her crew 10 Rations', note: function (s) { return 'Plus ' + fmt(amt(s, 0.4, 150)) + 'c labour.'; }, req: function (s) { return need([GT.qHas(s, IT('rations'), 10), 'You need 10 Rations in your hold'], [s.credits >= amt(s, 0.4, 150), 'Not enough credits for the labour']); }, act: function (s, Q) { GT.qTake(s, IT('rations'), 10); var c = amt(s, 0.4, 150); charge(s, c); return GT.relic(s, 'anchor') + ' The crew eat, sing, and weld all night. <b>-' + fmt(c) + 'c</b>' + rep(s, 2); } },
        { id: 'science', label: 'Use the Reach\'s design', note: function (s) { return 'Only ' + fmt(amt(s, 0.6, 200)) + 'c. Needs the find to be shared.'; }, req: function (s, Q) { return need([Q.flags.science, 'Only if you shared the find with Quellin Reach'], [s.credits >= amt(s, 0.6, 200), 'Not enough credits']); }, act: function (s, Q) { var c = amt(s, 0.6, 200); charge(s, c); return GT.relic(s, 'anchor') + ' With the right drawings it is a quick job. Brakka charges you for the bolts. <b>-' + fmt(c) + 'c</b>'; } },
        { id: 'buy', label: 'Buy a finished anchor', note: function (s) { return 'Costs ' + fmt(amt(s, 1.8, 600)) + 'c.'; }, req: function (s) { return s.credits >= amt(s, 1.8, 600) || 'Not enough credits'; }, act: function (s, Q) { var c = amt(s, 1.8, 600); charge(s, c); return GT.relic(s, 'anchor') + ' Brakka rolls a finished anchor off the line. "Somebody ordered it and died. Long story." <b>-' + fmt(c) + 'c</b>'; } }
      ] },
    { id: 'race', title: 'Race to the Ninth Lane', where: P('halcyra'), who: 'orro',
      goal: function () { return 'Fly to Halcyra, where the Ninth Lane begins in the storms. The deep run burns <b>60 PC of fuel</b>, so arrive with a full tank (Halcyra sells cheap fuel).'; },
      scene: function (s, Q) { return 'At the edge of the storm a familiar ship hangs in the clouds: Captain Ilyx Orro, the Unlucky. ' + (Q.flags.thief ? '"Odile sold me a copy of the chart," she grins, "to spite a thief. Funny old world."' : Q.flags.secret ? '"You kept it quiet," she says, "but a decoder hums loud. I followed the noise."' : '"Everybody on the lanes knows about your treasure map," she says. "You told a scientist. Scientists talk."') + ' "Only one ship gets to the Ark first."'; },
      choices: [
        { id: 'race', label: 'Race her through the storm', note: 'Needs warp 1.8 or a Defence Grid of level 2. Burns 60 PC.', req: function (s) { return need([s.ship.fuel >= 60, 'You need 60 PC of fuel'], [GT.effSpeed(s) >= 1.8 || GT.shieldLevel(s) >= 2, 'You need warp 1.8, or a Defence Grid of level 2']); }, act: function (s, Q) { s.ship.fuel -= 60; Q.flags.raced = 1; return 'You dive into the storm at full warp. Lightning ' + (GT.shieldLevel(s) >= 2 ? 'splashes off your Defence Grid' : 'chases your tail') + ' and Orro falls behind, shaking her fist. The lane opens like a door.' + rep(s, 2); } },
        { id: 'split', label: 'Offer to split the Ark with her', note: 'Burns 60 PC. Half the treasure, but a rival who likes you. +4 reputation.', req: function (s) { return s.ship.fuel >= 60 || 'You need 60 PC of fuel'; }, act: function (s, Q) { s.ship.fuel -= 60; Q.flags.split = 1; if (s.comps[2]) s.comps[2].f = (s.comps[2].f || 0.94) * 0.9; return 'Orro blinks. Nobody has ever offered her half of anything. "Deal," she says, and you fly in together, tail to tail. (She will not race you quite so hard from now on.)' + rep(s, 4); } },
        { id: 'cut', label: 'Cut her fuel line in the night', note: 'Burns 60 PC. Dirty. -8 reputation.', req: function (s) { return s.ship.fuel >= 60 || 'You need 60 PC of fuel'; }, act: function (s, Q) { s.ship.fuel -= 60; Q.flags.cut = 1; if (s.comps[2]) s.comps[2].wealth *= 0.85; return 'A spanner, a snip, and Orro is going nowhere fast. You fly into the lane alone. Nobody saw. Everybody knows.' + rep(s, -8); } }
      ], chain: true },
    { id: 'ark', title: 'The Ark', where: P('halcyra'), who: 'ark',
      goal: function () { return 'Choose your prize from the Ark.'; },
      scene: function (s, Q) { return 'At the end of the Ninth Lane, in a pocket of perfectly still space, hangs the Ark: a ship the size of a moon, dark for a million years. It wakes as you dock. Corridors light up ahead of you. In the heart of it, three cradles hold three gifts, and a voice like a choir says: <i>"One."</i>' + (Q.flags.split ? ' Orro, beside you, nods: "You found it. You choose."' : ''); },
      choices: [
        { id: 'drive', label: 'The Precursor Drive', note: '+0.5 warp, for good. Faster ships dodge trouble and burn less fuel.', act: function (s, Q) { return GT.finale(s, Q, 'drive'); } },
        { id: 'hold', label: 'The Fold Hold', note: '+25 cargo space that is bigger on the inside.', act: function (s, Q) { return GT.finale(s, Q, 'hold'); } },
        { id: 'aegis', label: 'The Aegis Lattice', note: 'Defence Grid to the top level, and a +40 PC tank.', act: function (s, Q) { return GT.finale(s, Q, 'aegis'); } }
      ] }
  ];
  /* lasting ship parts from the story */
  GT.RELICS = {
    lanesense: { name: 'Lane Sense', blurb: '+0.2 warp from a decoder-tuned nav core', fx: function (s) { s.ship.speed = Math.round((s.ship.speed + 0.2) * 10) / 10; } },
    anchor: { name: 'Lane Anchor', blurb: 'armour plate: +1 Defence Grid level', fx: function (s) { s.ship.lv.shield = Math.min(3, (s.ship.lv.shield || 0) + 1); } },
    drive: { name: 'Precursor Drive', blurb: '+0.5 warp', fx: function (s) { s.ship.speed = Math.round((s.ship.speed + 0.5) * 10) / 10; } },
    hold: { name: 'Fold Hold', blurb: '+25 cargo', fx: function (s) { s.ship.cargoMax += 25; } },
    aegis: { name: 'Aegis Lattice', blurb: 'Defence Grid level 3 and +40 PC tank', fx: function (s) { s.ship.lv.shield = 3; s.ship.fuelMax += 40; } },
    charter: { name: 'Admiralty Plating', blurb: '+1 Defence Grid level', fx: function (s) { s.ship.lv.shield = Math.min(3, (s.ship.lv.shield || 0) + 1); } }
  };
  GT.relic = function (s, id) { var r = GT.RELICS[id]; r.fx(s); s.ship.relics = s.ship.relics || []; s.ship.relics.push(id); return '<b>New ship part: ' + r.name + '</b> (' + r.blurb + ').'; };
  GT.finale = function (s, Q, pick) {
    var gift = GT.relic(s, pick), cash = amt(s, Q.flags.split ? 2.5 : 5, 1500);
    var ep = Q.flags.oath ? 'Back on the lanes you send Odile Marrow the finished map. She writes back one word: <i>"Told you."</i> Then a second: <i>"Thanks."</i>' : Q.flags.thief ? 'Somewhere a retired scout with an eyepatch is telling everyone who will listen about the thief who stole her map. The story gets better every time.' : 'Odile Marrow reads about it in the news and orders a very large drink.';
    if (Q.flags.cut) ep += ' Orro limps home on a borrowed tug and swears revenge, loudly and often.';
    s.char && (s.char.honour = 'Lanefinder');
    return 'You choose. The cradle opens. ' + gift + ' The Ark\'s vaults also hold a fortune in Precursor bullion.' + pay(s, cash) + rep(s, Q.flags.cut ? 3 : 10) + ' ' + ep + ' <b>The Ninth Lane is complete. You are now known as Lanefinder.</b>';
  };

  GT.mainChapter = function (s) { var Q = GT.Q(s).main; return Q.state === 'done' ? null : GT.MAIN[Q.ch]; };
  GT.mainGoal = function (s) { var ch = GT.mainChapter(s); if (!ch) return null; var Q = GT.Q(s).main; return { ch: Q.ch, title: ch.title, where: ch.where, text: ch.goal(s, Q), state: Q.state }; };
  /* is the story waiting for you right here? */
  GT.mainHere = function (s) { var ch = GT.mainChapter(s); if (!ch || s.over) return false; return ch.where < 0 ? s.turn >= (ch.minTurn || 0) : ch.where === s.loc; };
  GT.choiceReq = function (s, c) { var Q = GT.Q(s).main; if (!c.req) return true; var r = c.req(s, Q); return r === true ? true : (r || 'Not available'); };
  GT.choiceNote = function (s, c) { return typeof c.note === 'function' ? c.note(s) : (c.note || ''); };
  GT.mainChoose = function (s, cid) {
    var Q = GT.Q(s).main, ch = GT.mainChapter(s); if (!ch || !GT.mainHere(s) || s.over) return null;
    var c = ch.choices.filter(function (x) { return x.id === cid; })[0]; if (!c || GT.choiceReq(s, c) !== true) return null;
    var text = c.act(s, Q);
    Q.hist.push({ ch: Q.ch, title: ch.title, pick: c.label, turn: s.turn });
    s.stats.chapters++; s.questPrompt = null;
    GT.log(s, '<b>The Ninth Lane, chapter ' + (Q.ch + 1) + ': ' + ch.title + '.</b> ' + text, 'gain');
    Q.ch++;
    if (Q.ch >= GT.MAIN.length) { Q.state = 'done'; s.stats.peak = Math.max(s.stats.peak, GT.networth(s)); GT.checkEnd(s); return { text: text, done: true }; }
    Q.state = 'active';
    var nx = GT.MAIN[Q.ch];
    if (ch.chain && GT.mainHere(s)) s.questPrompt = { kind: 'main', ch: Q.ch };
    else GT.log(s, '<b>Next in the Ninth Lane:</b> ' + nx.goal(s, Q), 'event');
    GT.checkEnd(s);
    return { text: text, next: nx };
  };

  /* ======================= 2. CONTRACTS ======================= */
  var CLIENTS = ['a nervous grocer', 'the Guild of Lamplighters', 'a retired admiral', 'a hospital ship', 'a travelling circus', 'a very small mayor', 'a moth-wing tailor', 'a monastery of quiet robots', 'a wedding planner in a hurry', 'a mining co-operative', 'an art collector who never blinks', 'the Sector Postal Service'];
  var PARCELS = [['a ticking parcel', 'a sealed parcel that ticks'], ['a DO NOT OPEN crate', 'a crate marked DO NOT OPEN (VERY SERIOUSLY)'], ['love letters', 'a box of love letters'], ['a glowing jar', 'a jar of something that glows'], ['a diplomatic bag', 'a diplomatic bag with three locks'], ['a very important cake', 'a cake. A very important cake'], ['a cat', 'a cat carrier (the cat is fine)'], ['tax returns', 'a stack of tax returns']];
  function dueFor(s, to, extra) { return s.turn + 2 + Math.ceil(GT.dist(s.loc, to) / 14) + (extra || GT.RI(3, 6)); }
  GT.makeContract = function (s, kind) {
    var here = s.loc, n = GT.PLANETS.length, others = []; for (var p = 0; p < n; p++) if (p !== here) others.push(p);
    var c = { id: 'c' + (++GT.Q(s).seq), kind: kind, from: here, client: GT.pick(CLIENTS), rep: 1 };
    if (kind === 'haul') {
      var opts = [];
      GT.ITEMS.forEach(function (it, i) { if (GT.roleOf(here, i) < 1) others.forEach(function (d) { if (GT.roleOf(d, i) === 1) opts.push([i, d]); }); });
      if (!opts.length) return null;
      var o = GT.pick(opts), it = GT.ITEMS[o[0]];
      c.item = o[0]; c.to = o[1]; c.qty = clamp(Math.round(GT.scale(s) * R(1.6, 3.2) / it.base), 4, Math.max(4, Math.round(s.ship.cargoMax * 0.4)));
      c.pay = Math.round(c.qty * it.base * GT.PLANETS[c.to].mult[c.item] * R(1.3, 1.5) / 5) * 5; c.due = dueFor(s, c.to);
      c.title = 'Haul ' + c.qty + ' ' + it.name + ' to ' + GT.qName(c.to);
      c.text = 'For ' + c.client + ' on ' + GT.qName(c.to) + '. They pay ' + fmt(c.pay) + 'c for the lot (about ' + fmt(c.pay / c.qty) + 'c each), well over the market.';
    } else if (kind === 'parcel') {
      c.to = GT.pick(others); c.units = GT.RI(1, 3); var pp = GT.pick(PARCELS); c.what = pp[1]; c.short = pp[0]; c.due = dueFor(s, c.to);
      c.pay = amt(s, R(0.6, 1.0) * (1 + GT.dist(here, c.to) / 70), 220);
      c.title = 'Courier ' + c.short + ' to ' + GT.qName(c.to);
      c.text = 'Carry ' + c.what + ' to ' + GT.qName(c.to) + ' for ' + c.client + '. Takes ' + c.units + ' unit' + (c.units > 1 ? 's' : '') + ' of hold space. Pays ' + fmt(c.pay) + 'c.';
    } else if (kind === 'shares') {
      var k = GT.RI(0, GT.STOCKS.length - 1), st = GT.STOCKS[k], px = s.stockMkt.px[k];
      c.stock = k; c.n = clamp(Math.round(GT.scale(s) * R(0.8, 1.6) / px), 3, 200); c.to = GT.pick(others); c.due = s.turn + GT.RI(8, 12);
      c.pay = amt(s, R(0.35, 0.5), 180); c.rep = 2;
      c.title = 'Hold ' + c.n + ' ' + st.tick + ' shares at ' + GT.qName(c.to);
      c.text = st.name + ' wants friendly faces at its meeting on ' + GT.qName(c.to) + '. Arrive holding at least ' + c.n + ' ' + st.tick + ' shares (about ' + fmt(c.n * px) + 'c today; you keep them). Pays ' + fmt(c.pay) + 'c.';
    } else if (kind === 'survey') {
      others.sort(function (a, b) { return GT.dist(here, b) - GT.dist(here, a); }); c.to = others[GT.RI(0, 2)]; c.due = dueFor(s, c.to, GT.RI(4, 7));
      c.pay = amt(s, R(0.25, 0.4) * (0.6 + GT.dist(here, c.to) / 45), 150);
      c.title = 'Survey ' + GT.qName(c.to);
      c.text = c.client.charAt(0).toUpperCase() + c.client.slice(1) + ' wants an up-to-date report on ' + GT.qName(c.to) + '. Just land there. Pays ' + fmt(c.pay) + 'c.';
    } else if (kind === 'fuel') {
      var dry = others.filter(function (p) { return !GT.PLANETS[p].fuelSold; }); if (!dry.length) return null;
      c.to = GT.pick(dry); c.pc = GT.RI(4, 7) * 5; c.due = dueFor(s, c.to);
      c.pay = Math.round(c.pc * 13 * R(2.6, 3.4) / 5) * 5;
      c.title = 'Run ' + c.pc + ' PC of fuel to ' + GT.qName(c.to);
      c.text = 'A crew is stranded on ' + GT.qName(c.to) + ', which has no fuel dock. Arrive with ' + c.pc + ' PC to spare (after the jump) and they pay ' + fmt(c.pay) + 'c.';
    }
    return c;
  };
  GT.contractOffers = function (s) {
    if (s.visit.contracts) return s.visit.contracts;
    var kinds = ['haul', 'haul', 'parcel', 'shares', 'survey', 'fuel', 'parcel', 'haul'], out = [], tries = 0, want = s.rep >= 30 ? 3 : 2;
    while (out.length < want && tries++ < 20) { var k = GT.pick(kinds); if (out.some(function (o) { return o.kind === k; })) continue; var c = GT.makeContract(s, k); if (c) out.push(c); }
    return (s.visit.contracts = out);
  };
  GT.canAccept = function (s, c) {
    if (!c || c.taken || s.over) return 'Not available';
    if (GT.Q(s).active.length >= GT.CONTRACT_MAX) return 'You can run ' + GT.CONTRACT_MAX + ' jobs at once';
    if (c.units && GT.cargoFree(s) < c.units) return 'Not enough hold space for the parcel';
    if (c.min !== undefined && s.rep < c.min) return 'Needs ' + c.min + ' reputation';
    if (c.max !== undefined && s.rep > c.max) return 'Only for captains with ' + c.max + ' reputation or less';
    return true;
  };
  GT.acceptContract = function (s, c) {
    if (GT.canAccept(s, c) !== true) return false;
    var Q = GT.Q(s); c.taken = true; c.at = s.turn;
    if (c.units) Q.parcels += c.units;
    if (c.kind === 'tour') c.seen = {}, c.seen[s.loc] = 1;
    Q.active.push(c);
    GT.log(s, '<b>Job accepted:</b> ' + c.title + '. ' + c.text + ' Due by turn ' + c.due + '.', 'event');
    return true;
  };
  GT.dropContract = function (s, id) {
    var Q = GT.Q(s), c = Q.active.filter(function (x) { return x.id === id; })[0]; if (!c) return false;
    finish(s, c, false, 'You call it off. The client is not impressed.');
    return true;
  };
  function finish(s, c, ok, text) {
    var Q = GT.Q(s); Q.active = Q.active.filter(function (x) { return x !== c; });
    if (c.units) Q.parcels = Math.max(0, Q.parcels - c.units);
    Q.done.unshift({ id: c.id, title: c.title, ok: ok, turn: s.turn, repq: c.repq || null });
    if (ok) { s.stats.contracts++; if (c.repq) { Q.repDone[c.repq] = true; s.stats.repQuests++; } }
    else { s.stats.contractsFailed++; if (c.repq && !c.retry) Q.repDone[c.repq] = 'failed'; }
    var r = ok ? (c.rep || 0) : -(c.repq ? 4 : 2);
    var money = ok ? pay(s, c.pay) : '';
    var extra = ok && c.reward ? ' ' + c.reward(s) : '';
    GT.log(s, '<b>' + (ok ? 'Job done' : 'Job failed') + ': ' + c.title + '.</b> ' + text + money + extra + rep(s, r), ok ? 'gain' : 'loss', ok ? c.pay : 0);
  }
  /* checks every job when you land: deliveries happen by themselves */
  GT.checkContracts = function (s, quiet) {
    var Q = GT.Q(s);
    Q.active.slice().forEach(function (c) {
      if (c.kind === 'tour') { c.seen[s.loc] = 1; if (Object.keys(c.seen).length >= GT.PLANETS.length) return finish(s, c, true, 'Seven worlds, seven welcomes. The whole sector knows your face.'); }
      else if (c.kind === 'envoy') {
        if (s.loc === c.legs[c.leg]) { c.leg++; if (c.leg >= c.legs.length) return finish(s, c, true, 'The last seal is broken, the treaty is signed and everybody pretends it was their idea.'); GT.log(s, '<b>' + c.title + ':</b> the first seal is signed on ' + GT.qName(s.loc) + '. Now on to ' + GT.qName(c.legs[c.leg]) + '.', 'event'); c.to = c.legs[c.leg]; }
      } else if (s.loc === c.to) {
        if (c.kind === 'haul') { if (GT.qHas(s, c.item, c.qty)) { GT.qTake(s, c.item, c.qty); return finish(s, c, true, 'You hand over ' + c.qty + ' ' + GT.ITEMS[c.item].name + ' to ' + c.client + '.'); } GT.log(s, '<b>' + c.title + ':</b> the client is here, but you only have ' + s.cargo[c.item].qty + ' of the ' + c.qty + ' ' + GT.ITEMS[c.item].name + '. You can buy more and the job will complete next time you land here, if there is time.', 'event'); }
        else if (c.kind === 'parcel') return finish(s, c, true, 'You hand over ' + c.what + '. Signature, stamp, done.');
        else if (c.kind === 'survey') return finish(s, c, true, 'You file a tidy report on ' + GT.qName(s.loc) + ', with photographs.');
        else if (c.kind === 'shares') { if (s.stocks[c.stock].qty >= c.n) return finish(s, c, true, 'You wave your ' + GT.STOCKS[c.stock].tick + ' certificates at the meeting and vote with the board.'); if (!quiet) GT.log(s, '<b>' + c.title + ':</b> you only hold ' + s.stocks[c.stock].qty + ' of the ' + c.n + ' shares. Buy more at an Exchange and land here again before turn ' + c.due + '.', 'event'); }
        else if (c.kind === 'fuel') { if (s.ship.fuel >= c.pc) { s.ship.fuel -= c.pc; return finish(s, c, true, 'You pump ' + c.pc + ' PC across to the stranded crew. They name a child after you. Probably.'); } if (!quiet) GT.log(s, '<b>' + c.title + ':</b> you need ' + c.pc + ' PC to spare and have only ' + s.ship.fuel + '.', 'event'); }
      }
    });
    /* deadlines */
    if (!quiet) Q.active.slice().forEach(function (c) { if (s.turn > c.due) finish(s, c, false, 'The deadline passed. ' + (c.units ? 'The parcel is collected from your hold by a disappointed courier.' : 'The client hires someone else.')); });
  };
  /* called when goods or shares change hands, so a held delivery can be completed on the spot if you are already at the client's world */
  GT.questTrade = function (s, i, n, why) {
    var Q = s.quests; if (!Q || !Q.active.length) return;
    if (Q.active.some(function (c) { return c.to === s.loc && (c.kind === 'haul' || c.kind === 'shares' || c.kind === 'fuel'); })) GT.checkContracts(s, true);
  };

  /* ======================= 3. GUILD NOTICES (reputation quests) ======================= */
  GT.REPQ = [
    { id: 'guild', min: 10, title: 'The Guild\'s First Test', who: 'The Free Traders\' Guild', blurb: 'Haul 15 Rations to Ferrox within 9 turns.', make: function (s, c) { c.kind = 'haul'; c.item = IT('rations'); c.qty = 15; c.to = P('ferrox'); c.due = s.turn + 9; c.pay = amt(s, 1, 300); c.rep = 3; c.reward = function (s) { s.perks.guild = 1; return '<b>The Guild Card is yours:</b> 10% off the base tax on every world, for good.'; }; } },
    { id: 'envoy', min: 25, title: 'The Envoy\'s Pouch', who: 'The Sector Council', blurb: 'Carry a sealed treaty to Kryndor Spire, then to Quellin Reach, within 14 turns.', make: function (s, c) { c.kind = 'envoy'; c.units = 1; c.legs = [P('kryndor'), P('quellin')]; if (s.loc === c.legs[0]) c.legs.reverse(); c.leg = 0; c.to = c.legs[0]; c.due = s.turn + 14; c.pay = amt(s, 1.6, 500); c.rep = 5; } },
    { id: 'admiralty', min: 50, title: 'The Admiralty Charter', who: 'The Lane Admiralty', blurb: 'Deliver 10 Circuitry to the Halcyra patrol within 10 turns.', make: function (s, c) { c.kind = 'haul'; c.item = IT('circuitry'); c.qty = 10; c.to = P('halcyra'); c.due = s.turn + 10; c.pay = amt(s, 1.5, 600); c.rep = 4; c.reward = function (s) { return GT.relic(s, 'charter'); }; } },
    { id: 'hero', min: 75, title: 'Hero of the Lanes', who: 'Every dockmaster in the sector', blurb: 'Land on all seven worlds within 16 turns.', make: function (s, c) { c.kind = 'tour'; c.to = -1; c.due = s.turn + 16; c.pay = amt(s, 3, 1500); c.rep = 5; c.reward = function (s) { s.perks.hero = 1; return '<b>A hero\'s welcome:</b> traders everywhere give you 2% better prices, for good.'; }; } },
    { id: 'syndicate', max: -10, title: 'A Favour for the Syndicate', who: 'Somebody in a very good coat', blurb: 'Carry a parcel nobody will describe to Nihil Station within 6 turns.', make: function (s, c) { c.kind = 'parcel'; c.units = 2; c.what = 'a parcel nobody will describe'; c.to = P('nihil'); if (s.loc === c.to) c.to = P('karthosu'); c.due = s.turn + 6; c.pay = amt(s, 2, 500); c.rep = -3; } },
    { id: 'score', max: -30, title: 'The Big Score', who: 'The Syndicate\'s accountant', blurb: 'Smuggle three crates of "farm equipment" to Karth-Osu within 7 turns.', make: function (s, c) { c.kind = 'parcel'; c.units = 4; c.what = 'three crates of "farm equipment"'; c.to = P('karthosu'); if (s.loc === c.to) c.to = P('nihil'); c.due = s.turn + 7; c.pay = amt(s, 3.5, 900); c.rep = -5; c.reward = function (s) { s.perks.syndicate = 1; return '<b>The Syndicate owes you one:</b> the back alley treats you like family.'; }; } }
  ];
  GT.repQuestState = function (s, q) {
    var Q = GT.Q(s);
    if (Q.repDone[q.id] === true) return 'done';
    if (Q.repDone[q.id] === 'failed') return 'failed';
    if (Q.active.some(function (c) { return c.repq === q.id; })) return 'active';
    if (q.min !== undefined && s.rep < q.min) return 'locked';
    if (q.max !== undefined && s.rep > q.max) return 'locked';
    return 'open';
  };
  GT.repContract = function (s, q) {
    var c = { id: 'r' + (++GT.Q(s).seq), repq: q.id, title: q.title, client: q.who, from: s.loc, min: q.min, max: q.max };
    q.make(s, c); c.text = q.blurb + ' Pays ' + fmt(c.pay) + 'c.';
    return c;
  };
  GT.acceptRepQuest = function (s, id) {
    var q = GT.REPQ.filter(function (x) { return x.id === id; })[0]; if (!q || GT.repQuestState(s, q) !== 'open') return false;
    return GT.acceptContract(s, GT.repContract(s, q));
  };
  /* perks from guild quests */
  GT.perkTax = function (s) { return s.perks && s.perks.guild ? 0.1 : 0; };
  GT.perkEdge = function (s) { return s.perks && s.perks.hero ? 0.02 : 0; };

  /* ======================= hooks ======================= */
  var baseArrive = GT.arrivalHooks;
  GT.arrivalHooks = function (s, to) {
    baseArrive(s, to);
    GT.questArrive(s);
  };
  GT.questArrive = function (s) {
    if (!s.quests || s.over) return;
    GT.checkContracts(s);
    var Q = s.quests.main;
    if (Q.state === 'waiting' && GT.mainHere(s)) Q.state = 'active';
    if (Q.state === 'active' && GT.mainHere(s)) s.questPrompt = { kind: 'main', ch: Q.ch };
    else if (s.questPrompt && s.questPrompt.kind === 'main') s.questPrompt = null;
  };
  /* staying in port still runs the clock on deadlines */
  var baseWait = GT.wait;
  GT.wait = function (s) { var ok = baseWait(s); if (ok && s.quests) { GT.checkContracts(s); if (GT.mainHere(s) && s.quests.main.state !== 'done') { s.quests.main.state = 'active'; s.questPrompt = { kind: 'main', ch: s.quests.main.ch }; } } return ok; };
})();
