/* Galactic Trader 11. Part 52: v11 rules. Loaded after gt-46-quests.js. No DOM in here.
   - Quest and odd job money cut back: in v10 a captain doing every job and quest could win the quick race in a dozen turns.
     Odd jobs now pay 0.3 / 0.7 / 1.2 times the stage scale (v10: 0.6 / 1.5 / 3.0); quest and contract fees and rewards are 35% of v10; hauling contracts pay 1.1 to 1.25 times the market (v10: 1.3 to 1.5).
   - Quest slots: the three contract slots are only for contracts. The Ninth Lane never used one, and guild notices now have a slot of their own, so a captain can run three contracts, the story and a guild quest together.
   - Play on: when the race is decided (by you, another captain or a computer rival) the result is recorded and you can keep trading. After that, only ruin ends a captain's game. */
(function () {
  GT.JOB_PAY = [0, 0.3, 0.7, 1.2];
  GT.QUEST_PAY = 0.35;
  GT.HAUL_PREMIUM = [1.1, 1.25];

  /* ---------- quest and contract money ---------- */
  var baseMake = GT.makeContract;
  GT.makeContract = function (s, kind) {
    var c = baseMake(s, kind); if (!c) return c;
    if (c.kind === 'haul') {
      var it = GT.ITEMS[c.item], old = c.pay;
      c.pay = Math.round(c.qty * it.base * GT.PLANETS[c.to].mult[c.item] * GT.R(GT.HAUL_PREMIUM[0], GT.HAUL_PREMIUM[1]) / 5) * 5;
      c.text = c.text.replace(GT.fmt(old) + 'c for the lot (about ' + GT.fmt(old / c.qty), GT.fmt(c.pay) + 'c for the lot (about ' + GT.fmt(c.pay / c.qty)).replace('well over the market', 'over the market');
    } else {
      var old2 = c.pay;
      c.text = c.text.split(GT.fmt(old2) + 'c').join(GT.fmt(c.pay) + 'c');
    }
    return c;
  };
  /* the story and guild quests pay through amt() in gt-46, which reads GT.QUEST_PAY */

  /* ---------- quest slots ---------- */
  GT.CONTRACT_MAX = 3;
  GT.contractsActive = function (s) { return GT.Q(s).active.filter(function (c) { return !c.repq; }); };
  GT.guildActive = function (s) { return GT.Q(s).active.filter(function (c) { return c.repq; })[0] || null; };
  GT.canAccept = function (s, c) {
    if (!c || c.taken || s.over) return 'Not available';
    if (c.repq) { if (GT.guildActive(s)) return 'You already have a guild quest on the go'; }
    else if (GT.contractsActive(s).length >= GT.CONTRACT_MAX) return 'You can run ' + GT.CONTRACT_MAX + ' contracts at once';
    if (c.units && GT.cargoFree(s) < c.units) return 'Not enough hold space for the parcel';
    if (c.min !== undefined && s.rep < c.min) return 'Needs ' + c.min + ' reputation';
    if (c.max !== undefined && s.rep > c.max) return 'Only for captains with ' + c.max + ' reputation or less';
    return true;
  };

  /* ---------- play on ---------- */
  var baseCheck = GT.checkEnd;
  GT.checkEnd = function (s) {
    var G = s.game;
    if (G && G.result) { if (!s.over && s.credits <= 0 && GT.cargoUsed(s) === 0) s.over = { won: false, ruined: true, turn: s.turn, why: 'You have ' + GT.fmt(s.credits) + ' credits and an empty hold. There is nothing left to trade with.' }; return s.over; }
    return baseCheck(s);
  };
  var baseRound = GT.endRound;
  GT.endRound = function (G) {
    if (!G.result) return baseRound(G);
    /* the race is decided already: rivals can no longer end it, and only ruin of every captain stops play */
    var keep = GT.rivalAtTarget; GT.rivalAtTarget = function () { return null; };
    try { return baseRound(G); } finally { GT.rivalAtTarget = keep; }
  };
  /* can anyone carry on? (a ruined captain cannot) */
  GT.canPlayOn = function (G) { return !!G && !!G.over && !G.over.abandoned && G.players.some(function (p) { return !p.over || p.over.won || p.over.rival; }); };
  GT.playOn = function (G) {
    if (!GT.canPlayOn(G)) return false;
    var o = G.over, win = o.winner >= 0 ? G.players[o.winner] : null;
    G.result = { won: o.won, winner: o.winner, rival: o.rival || null, round: G.round, why: o.why || null, worth: win ? GT.networth(win) : 0, name: win ? win.name : o.rival || null };
    G.players.forEach(function (p) {
      var line = win ? (p === win ? '<b>You won the race</b> with ' + GT.fmt(GT.networth(p)) + ' credits. You play on: from here only the money counts.' : '<b>' + p.name + ' won the race</b> with ' + GT.fmt(G.result.worth) + ' credits. You play on.') : o.rival ? '<b>' + o.rival + ' won the race.</b> You play on anyway: from here only the money counts.' : '<b>The race is over.</b> You play on.';
      if (!p.over || p.over.won || p.over.rival) { p.overRecord = p.over; p.over = null; GT.log(p, line, 'event'); }
    });
    G.over = null; G.round++; GT.startRound(G);
    return true;
  };
  /* a captain who crosses the line in the middle of a visit (selling, a quest reward) ends the race at once in a solo game */
  GT.endNow = function (G) { if (G.over || G.multi) return false; var s = G.players[0]; if (!s.over) return false; return GT.endTurn(G); };
})();
