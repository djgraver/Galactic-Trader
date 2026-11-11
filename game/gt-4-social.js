/* Galactic Trader. Part 4: facilities, rival traders, exploring, encounters and the parlour. */
(function () {
  var clamp = GT.clamp, R = GT.R, fmt = GT.fmt;

  /* ---------- facilities: price is about 20 times the benefit it brings per jump ---------- */
  GT.facDef = function (id) { return GT.FACILITIES.filter(function (f) { return f.id === id; })[0]; };
  GT.facBenefit = function (s, id, p) {
    var f = GT.facDef(id), S = clamp(GT.networth(s), 2500, 150000);
    if (f.kind === 'trade') return f.pct * S * 0.6;
    if (f.kind === 'fuel') return f.pct * (150 + S * 0.006);
    return f.feePct * S * GT.PLANETS[p].fac[id];
  };
  GT.facBenefitText = function (id, B) {
    var f = GT.facDef(id);
    if (f.kind === 'trade') return '+' + (f.pct * 100).toFixed(1) + '% better prices on all trades and a lower tax bill (worth about ' + fmt(B) + 'c per jump)';
    if (f.kind === 'fuel') return '-' + (f.pct * 100).toFixed(0) + '% on fuel at every dock and a lower tax bill (worth about ' + fmt(B) + 'c per jump)';
    return 'about ' + fmt(B) + 'c in rival fees for every jump you are away, collected when you return';
  };
  GT.makeOffer = function (s, p) {
    var pl = GT.PLANETS[p], tot = 0, ids = GT.FACILITIES.map(function (f) { tot += pl.fac[f.id]; return f.id; }), r = GT.rand() * tot, id = ids[0];
    for (var k = 0; k < ids.length; k++) { r -= pl.fac[ids[k]]; if (r <= 0) { id = ids[k]; break; } }
    var B = GT.facBenefit(s, id, p), price = Math.max(200, Math.round(GT.CFG.FAC_PRICE_MULT * B / 10) * 10);
    s.visit.offer = { type: id, B: B, price: price };
    GT.log(s, 'A local agent offers you a <b>' + GT.facDef(id).name + '</b> on ' + pl.name + ' for <b>' + fmt(price) + 'c</b>: ' + GT.facBenefitText(id, B) + '. The offer stands while you are docked here.', 'info');
  };
  GT.buyFacility = function (s) {
    var o = s.visit.offer, p = s.loc;
    if (!o || o.price > s.credits || s.owned[p]) return false;
    s.credits -= o.price; s.owned[p] = { type: o.type, since: s.turn, fee: GT.facDef(o.type).kind === 'fee' ? o.B : 0 };
    s.stats.facilitiesBought++; GT.addRep(s, 4);
    GT.log(s, 'You bought the <b>' + GT.facDef(o.type).name + '</b> on ' + GT.PLANETS[p].name + '. <b>-' + fmt(o.price) + 'c</b>. Word gets around (+4 reputation).', 'loss', -o.price);
    s.visit.offer = null; return true;
  };
  GT.collectFees = function (s, p) {
    var o = s.owned[p]; if (!o || !o.fee) { if (o) o.since = s.turn; return; }
    var turns = Math.min(GT.CFG.FEE_CAP_TURNS, s.turn - o.since); o.since = s.turn;
    if (turns <= 0) return;
    var inc = Math.round(o.fee * turns * R(0.8, 1.2) / 5) * 5; s.credits += inc; s.stats.feeIncome += inc;
    GT.log(s, 'Your <b>' + GT.facDef(o.type).name + '</b> here has earned rival-trader fees over ' + turns + ' jumps: <b>+' + fmt(inc) + 'c</b>.', 'gain', inc);
  };

  /* ---------- rival traders ---------- */
  /* Rubber-banded rivals. Each rival has its own organic growth (c.rate) and a personality c.f: the share of the leading captain's fortune it tries to hold.
     A rival that falls behind its target pulls hard toward it, one that runs ahead is throttled, so the race stays close. A rival that reaches the target first wins. */
  GT.RIVAL_FOLLOW = [0.78, 0.85, 0.91, 0.96];
  GT.RIVAL_WARN = [0.70, 0.85, 0.95];
  GT.tickComps = function (s, nwOverride) {
    var nw = typeof nwOverride === 'number' ? nwOverride : GT.networth(s), WIN = GT.CFG.WIN, who = s.game ? s.game.players : [s];
    s.comps.forEach(function (c, ci) {
      var f = c.f !== undefined ? c.f : (c.f = GT.RIVAL_FOLLOW[ci % GT.RIVAL_FOLLOW.length]);
      var rate = c.rate * R(0.35, 1.65), w = c.wealth * (1 + rate);
      var aim = Math.max(GT.CFG.START_CREDITS, nw) * f * Math.exp(GT.gauss() * 0.035);
      if (w < aim) w += (aim - w) * 0.4; else if (w > aim * 1.04) w = c.wealth * (1 + rate * 0.3);
      if (GT.rand() < 0.06) w *= R(0.92, 0.97);
      c.wealth = Math.min(w, WIN * 1.25);
      c.warned = c.warned || 0;
      while (c.warned < GT.RIVAL_WARN.length && c.wealth >= WIN * GT.RIVAL_WARN[c.warned]) {
        var pct = Math.round(GT.RIVAL_WARN[c.warned] * 100);
        who.forEach(function (q) { GT.log(q, '<b>' + c.name + '</b> is closing in on the fortune target! Rivals say they are past ' + pct + '% of ' + fmt(WIN) + ' credits.', c.warned > 0 ? 'loss' : 'event'); });
        c.warned++;
      }
      var to = GT.RI(0, GT.PLANETS.length - 2); c.loc = to >= c.loc ? to + 1 : to;
    });
    GT.refreshComps(s);
  };
  GT.canAssist = function (s) { return s.credits >= 150 && GT.compAssistCost(s) <= s.credits; };
  GT.compAssistCost = function (s) { return Math.max(150, Math.round(GT.scale(s) * 0.8 / 10) * 10); };

  GT.compAction = function (s, act, perf) {
    var pe = s.pending; if (!pe || pe.type !== 'comp') return false;
    var c = s.comps[pe.ci], st = s.stats, luck = GT.luck(s), S = GT.scale(s), nm = '<b>' + c.name + '</b>';
    s.pending = null;
    if (act === 'assist' && !GT.canAssist(s)) { GT.log(s, 'You reach for your credit chit, find it far too light to help ' + nm + ', and quietly decide to ignore them instead.', 'info'); act = 'ignore'; }
    if (act === 'sabotage') {
      st.sabotage++;
      var win = GT.rand() < (perf === undefined ? 0.30 + luck * 0.4 : 0.18 + 0.27 * perf + luck * 0.3) + GT.speedEdge(s);
      if (win) {
        var hit = c.wealth * R(0.04, 0.09); c.wealth -= hit; st.sabotageWon++; GT.addRep(s, 4);
        GT.log(s, 'You slip into ' + nm + '\'s hold and quietly dump a third of their fuel mix. By morning they have lost about <b>' + fmt(hit) + 'c</b> in delays and repairs, and nobody saw you. <span class="fx">(+4 reputation)</span>', 'event');
      } else if (GT.rand() < 0.35 - luck * 0.2) {
        var fine = Math.round(S * R(0.5, 1.2) / 5) * 5; s.credits -= fine; st.eventLoss += fine; GT.addRep(s, -8);
        GT.log(s, 'Your sabotage goes badly wrong. ' + nm + '\'s crew catch you with a spanner in the fuel line, and dock security fine you <b>-' + fmt(fine) + 'c</b>. <span class="fx">(-8 reputation)</span>', 'loss', -fine);
      } else {
        GT.addRep(s, -2);
        GT.log(s, 'You try to sabotage ' + nm + ' and fumble it. Nothing breaks, and nobody notices, but you feel foolish. <span class="fx">(-2 reputation)</span>', 'event');
      }
    } else if (act === 'assist') {
      st.assists++;
      var cost = GT.compAssistCost(s), fuelHelp = GT.rand() < 0.4 && s.ship.fuel > 40, r = GT.rand();
      var what = fuelHelp ? 15 + ' PC of fuel' : fmt(cost) + 'c';
      if (fuelHelp) s.ship.fuel -= 15; else s.credits -= cost;
      var pay = 0.2 + luck * 0.3, thanks = 0.6 + luck * 0.1;
      if (r < pay) {
        var back = Math.round(cost * R(1.8, 2.8) / 5) * 5; s.credits += back; st.eventGain += back; GT.addRep(s, 3);
        GT.log(s, 'You give ' + nm + ' ' + what + ' to get them off the dock. Within the hour a courier hands you a chit: they repaid <b>+' + fmt(back) + 'c</b>, "with interest, friend". <span class="fx">(+3 reputation)</span>', 'gain', back - (fuelHelp ? 0 : cost));
        if (!fuelHelp) st.eventLoss += cost;
      } else if (r < pay + thanks) {
        if (!fuelHelp) st.eventLoss += cost;
        var up = GT.rand() < 0.5; if (up) GT.addRep(s, 2);
        GT.log(s, 'You give ' + nm + ' ' + what + '. They grip your hand. "Thank you. I won\'t forget this." <b>' + (fuelHelp ? '-15 PC' : '-' + fmt(cost) + 'c') + '</b>' + (up ? ' <span class="fx">(+2 reputation)</span>' : ''), fuelHelp ? 'event' : 'loss', fuelHelp ? 0 : -cost);
      } else {
        if (!fuelHelp) st.eventLoss += cost;
        GT.log(s, 'You give ' + nm + ' ' + what + ' and they pocket it without a word, and snub you at the door. <b>' + (fuelHelp ? '-15 PC' : '-' + fmt(cost) + 'c') + '</b>', fuelHelp ? 'event' : 'loss', fuelHelp ? 0 : -cost);
      }
      c.wealth += fuelHelp ? 0 : cost * 0.5;
    } else {
      var snark = GT.rand() < 0.35, line = GT.pick(GT.SNARK || ['Nice ship. Did it come with the dents?']);
      if (snark) {
        var lose = GT.rand() < 0.4; if (lose) GT.addRep(s, -1);
        GT.log(s, 'You ignore ' + nm + '. They call after you: "' + line + '"' + (lose ? ' <span class="fx">(-1 reputation)</span>' : ''), 'event');
      } else GT.log(s, 'You ignore ' + nm + ' and they ignore you right back.', 'info');
    }
    GT.refreshComps(s);
    return true;
  };

  /* ---------- exploring and seeking encounters (once each per visit) ---------- */
  GT.NOTHING_X = ['You wander for an hour and find nothing but dust and sore feet.', 'You poke around the back streets. Nothing happens, though a stray dog follows you for a while.', 'A quiet walk. You see nothing worth writing down.', 'You search for anything unusual and find only the usual.'];
  GT.NOTHING_E = ['{who} is nowhere to be found. You leave a message and nobody replies.', 'You wait around for {who}, who never shows. You drink something questionable instead.', '{who} is busy, or hiding. Either way, no meeting today.'];
  function seek(s, kind, chance) {
    var key = kind === 'x' ? 'explored' : 'encountered', pl = GT.PLANETS[s.loc];
    if (s.visit[key] || s.over || s.pending) return false;
    s.visit[key] = true;
    var pool = kind === 'x' ? (GT.EXPLORE || {})[pl.id] : ((GT.ENCOUNTER || {})[pl.id] || {}).list, who = ((GT.ENCOUNTER || {})[pl.id] || {}).who || 'a stranger';
    if (kind === 'x') s.stats.explores++; else s.stats.encounters++;
    if (GT.rand() < (chance !== undefined ? chance : (kind === 'x' ? GT.CFG.EXPLORE : GT.CFG.ENCOUNTER)) && pool && pool.length) {
      if (kind === 'x' && GT.smuggleMaybe && GT.smuggleMaybe(s, pl)) return true;
      var ev = GT.pickEntry(pool, s), fx = GT.applyEffect(s, ev);
      s.stats.events++;
      GT.log(s, (kind === 'x' ? '<b>Exploring ' + pl.name + ':</b> ' : '<b>' + who + ':</b> ') + ev.t + fx.detail, fx.kind, fx.money);
    } else {
      GT.log(s, (kind === 'x' ? '<b>Exploring ' + pl.name + ':</b> ' + GT.pick(GT.NOTHING_X) : '<b>' + who + ':</b> ' + GT.pick(GT.NOTHING_E).replace('{who}', who)), 'info');
    }
    return true;
  }
  GT.explore = function (s, chance) { return seek(s, 'x', chance); };
  GT.encounter = function (s, chance) { return seek(s, 'e', chance); };

  /* ---------- the Parlour of Thin Hours (Nihil Station). Odds are never shown as numbers. ---------- */
  /* outcomes: [multiplier, probability, text]. The first two outcomes trade probability with the parlour's mood. */
  GT.GAMES = [
    { id: 'ledger', name: 'The Tidal Ledger', shift: 0.04, blurb: 'You pay the Ledger in a currency it will not name. It nods, or it does not. A high chance of a small return, a slim chance of being forgotten entirely.',
      out: [[0, 0.22, 'The Ledger turns a page and your name is no longer on it.'], [0.7, 0.20, 'The Ledger sighs and returns most of what it owes.'], [1.2, 0.50, 'The Ledger hums and pays a little over what you laid down.'], [2, 0.08, 'The Ledger rings twice. You are paid double.']] },
    { id: 'moth', name: 'Quiet Moth of Ssur', shift: 0.02, blurb: 'A pale moth lands on one of the lamps. Which lamp it prefers depends on the hour, the moon, and your sleeve. Mostly you lose, but sometimes you win a great deal.',
      out: [[0, 0.67, 'The moth ignores your lamp and drifts away through the smoke.'], [1.5, 0.17, 'The moth circles your lamp twice. A modest bonus.'], [3, 0.10, 'The moth settles and does not leave. Triple.'], [6, 0.06, 'The moth glows. The Parlour goes silent. Sixfold.']] },
    { id: 'orchard', name: 'The Glass Orchard', shift: 0.04, blurb: 'You pick a pane of glass and the Orchard decides if it ripens. A low chance of doubling, a high chance of a 20% return, and an odd chance of bruised fruit.',
      out: [[0, 0.21, 'The glass shatters. The Orchard apologises in nine languages.'], [0.5, 0.16, 'Bruised fruit. Half your stake comes back, wrapped in leaves.'], [1.2, 0.52, 'The fruit ripens a little. A fifth more than you laid down.'], [2, 0.11, 'The whole tree blushes gold. You double your stake.']] },
    { id: 'seven', name: 'Resonance of Seven', shift: 0.005, blurb: 'Seven bells, each tuned to a different regret. You will almost never hear all of them agree. Nearly always a total loss, and rarely a fortune.',
      out: [[0, 0.92, 'The bells jangle and fall silent.'], [8, 0.065, 'Four bells chime together. Eight times your stake.'], [25, 0.015, 'All seven bells ring as one. The floor shakes. Twenty-five times your stake.']] }
  ];
  GT.STAKES = [50, 250, 1000, 5000];
  GT.GAME_LUCK_NOTE = 'The Parlour\'s mood drifts between rounds. Nobody knows which way.';
  GT.canGamble = function (s) { return GT.PLANETS[s.loc].gambling && !s.over && !s.pending; };
  GT.gamble = function (s, gi, stake) {
    if (!GT.canGamble(s) || stake > s.credits || stake <= 0) return null;
    var g = GT.GAMES[gi], mood = s.gamble ? s.gamble.mood : 0, d = g.shift * (mood === 1 ? -1 : mood === 2 ? 1 : 0) + GT.luck(s) * g.shift;
    var p = g.out.map(function (o) { return o[1]; });
    var mv = clamp(d, -p[1] + 0.001, p[0] - 0.001); p[0] -= mv; p[1] += mv;
    var r = GT.rand(), k = 0; for (; k < p.length - 1; k++) { r -= p[k]; if (r <= 0) break; }
    var o = g.out[k], ret = Math.round(stake * o[0]), net = ret - stake;
    s.credits += net; s.stats.gambleNet += net; s.stats.gambleRounds++;
    s.gamble = { mood: GT.RI(0, 2) };
    GT.log(s, '<b>' + g.name + ':</b> you wager ' + fmt(stake) + 'c. ' + o[2] + ' <b>' + (net >= 0 ? '+' : '-') + fmt(Math.abs(net)) + 'c</b>' + (net === 0 ? '' : '.'), net > 0 ? 'gain' : net < 0 ? 'loss' : 'event', net);
    return { text: o[2], net: net, ret: ret };
  };
})();
