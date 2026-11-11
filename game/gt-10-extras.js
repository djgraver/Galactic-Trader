/* Galactic Trader Deluxe. Part 10: engine extras for odd jobs (mini-games) and the shared multiplayer game. Rewards are small and capped so the tuned economy stays intact. */
(function () {
  var baseNew = GT.newState;
  GT.newState = function (shipId, name, char) {
    var s = baseNew(shipId, name);
    s.char = char || null; s.visit.night = GT.rand() < 0.5;
    s.stats.jobs = 0; s.stats.jobGain = 0; s.stats.jobGold = 0; s.stats.evaded = 0;
    return s;
  };
  GT.RATINGS = ['Flop', 'Bronze', 'Silver', 'Gold'];
  /* Share of the stage scale paid out per rating. Simulated: a good player finishes about 10% sooner and a perfect one about 20% sooner, so trading stays the main event. */
  GT.JOB_PAY = [0, 0.08, 0.20, 0.40];
  GT.JOBS = {
    meridoa: { id: 'pests', name: 'Pest Panic', where: 'the Pumpkin Patch' },
    karthosu: { id: 'tomb', name: 'Tomb Dash', where: 'the Tomb Steps' },
    ferrox: { id: 'ore', name: 'Ore Sorter', where: 'the Conveyor Hall' },
    kryndor: { id: 'traffic', name: 'Skybus Scramble', where: 'the Skybus Lanes' },
    nihil: { id: 'debris', name: 'Junk Blaster', where: 'the Debris Deck' },
    quellin: { id: 'catch', name: 'Quantum Catch', where: 'Lab Four' },
    halcyra: { id: 'cloud', name: 'Cloud Skimmer', where: 'the Storm Deck' }
  };
  GT.job = function (s) { return GT.JOBS[GT.PLANETS[s.loc].id]; };
  GT.jobAvailable = function (s) { return !s.visit.flags.job && !s.over && !s.pending; };
  GT.jobFinish = function (s, rating, score) {
    s.visit.flags.job = true;
    var j = GT.job(s), S = GT.scale(s), money = Math.round(S * GT.JOB_PAY[rating] * GT.R(0.9, 1.1) / 5) * 5, rep = rating === 3 ? 1 : 0;
    s.credits += money; s.stats.jobs++; s.stats.jobGain += money; if (rating === 3) s.stats.jobGold++;
    if (rep) GT.addRep(s, rep);
    var verdict = ['They hand you a participation sticker.', 'A modest tip.', 'A decent payout.', 'A glorious payout and a round of applause.'][rating];
    GT.log(s, '<b>Odd jobs, ' + j.where + ' (' + j.name + '):</b> you scored ' + GT.fmt(score) + ', rated <b>' + GT.RATINGS[rating].toUpperCase() + '</b>. ' + verdict + (money ? ' <b>+' + GT.fmt(money) + 'c</b>' : '') + (rep ? ' <span class="fx">(+1 reputation)</span>' : ''), money > 0 ? 'gain' : 'info', money);
    return { money: money, rep: rep };
  };

  /* ---------- multiplayer: hot-seat, up to four captains sharing one galaxy ----------
     Markets, price events, fuel prices and the AI rivals are shared objects, so one captain's trades move the prices everyone else sees.
     Captains take turns in rounds. The fastest ship goes first each round. The galaxy ticks once per round after the last captain has jumped.
     The game ends at the end of the round in which anyone reaches the target. The richest finisher wins. Busted captains sit out. */
  GT.MAX_PLAYERS = 4;
  GT.TARGETS = [{ id: 'quick', name: 'Quick race', win: 50000, blurb: 'About 50 jumps each. A short evening.' }, { id: 'std', name: 'Full career', win: 150000, blurb: 'About 80 jumps each. The whole saga.' }];
  GT.newGame = function (list, opts) {
    opts = opts || {}; list = list.slice(0, GT.MAX_PLAYERS);
    GT.CFG.WIN = opts.target || 150000;
    var G = { players: [], round: 1, order: [], cur: 0, multi: list.length > 1, target: GT.CFG.WIN, over: null };
    list.forEach(function (p, k) {
      var s = GT.newState(p.shipId, p.name, p.char);
      if (k > 0) { var s0 = G.players[0]; s.markets = s0.markets; s.mods = s0.mods; s.fuelMult = s0.fuelMult; s.comps = s0.comps; s.stockMkt = s0.stockMkt; }
      s.multi = G.multi; s.seat = k;
      Object.defineProperty(s, 'game', { value: G, enumerable: false, writable: true });
      G.players.push(s);
    });
    /* More captains trade the same planets, so deepen every market to keep the economy as roomy per captain as in a solo game. */
    var k = opts.depth !== undefined ? opts.depth : GT.DEPTH_PER_EXTRA;
    G.depthMult = 1 + k * (list.length - 1);
    if (G.depthMult !== 1) G.players[0].markets.forEach(function (pm) { pm.forEach(function (mk) { mk.target *= G.depthMult; mk.stock = Math.round(mk.stock * G.depthMult); }); });
    GT.startRound(G);
    return G;
  };
  GT.DEPTH_PER_EXTRA = 0.6;
  /* Fastest ship first. Equal speeds keep seat order. */
  GT.startRound = function (G) {
    var alive = G.players.filter(function (p) { return !p.over; });
    alive.sort(function (a, b) { return (Math.round(GT.effSpeed(b) * 100) - Math.round(GT.effSpeed(a) * 100)) || (a.seat - b.seat); });
    G.order = alive.map(function (p) { return p.seat; }); G.cur = 0;
    G.players.forEach(function (p) { p.turnDone = false; });
    var s = GT.active(G); if (s) GT.beginTurn(s);
  };
  GT.active = function (G) { return G.players[G.order[G.cur]] || null; };
  GT.beginTurn = function (s) { if (s.arrivalPending) { s.arrivalPending = false; GT.arrivalHooks(s, s.loc); } };
  /* Call when the active captain has finished the jump, including the arrival card. Returns true when the whole game has ended. */
  GT.endTurn = function (G) {
    var s = GT.active(G); if (s) s.turnDone = true;
    G.cur++;
    if (G.cur >= G.order.length) return GT.endRound(G);
    GT.beginTurn(GT.active(G));
    return false;
  };
  GT.endRound = function (G) {
    var wins = G.players.filter(function (p) { return p.over && p.over.won; }), alive = G.players.filter(function (p) { return !p.over; });
    if (G.multi) {
      var top = G.players.reduce(function (m, p) { return Math.max(m, GT.networth(p)); }, 0);
      GT.tickMarkets(G.players[0]); GT.tickComps(G.players[0], top);
    }
    var rv = GT.rivalAtTarget(G.players[0]);
    if (wins.length) {
      wins.sort(function (a, b) { return GT.networth(b) - GT.networth(a); });
      G.over = { won: true, winner: wins[0].seat, round: G.round };
    } else if (rv) G.over = { won: false, winner: -1, rival: rv.name, round: G.round, why: GT.rivalWhy(rv) };
    else if (!alive.length) G.over = { won: false, winner: -1, round: G.round };
    if (G.over) return true;
    G.round++; GT.startRound(G);
    return false;
  };
  GT.standings = function (G) {
    return G.players.slice().sort(function (a, b) {
      var ba = a.over && !a.over.won ? 1 : 0, bb = b.over && !b.over.won ? 1 : 0;
      return (ba - bb) || (GT.networth(b) - GT.networth(a));
    });
  };
})();
