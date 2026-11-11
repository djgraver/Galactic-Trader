/* Galactic Trader 4. Part 33: passengers. Every ship has a few berths (a Cutlass Runner one, a Behemoth Barge four) and the Passenger Cabins upgrade adds more.
   You set the fare. People turn up in numbers that grow with your reputation and with advertising on the world you are flying to, and each one only buys a ticket
   if the price feels fair to them. Passengers board when you jump and pay when you arrive. A rough trip costs you reputation and a refund. No DOM in here. */
(function () {
  var clamp = GT.clamp, R = GT.R, fmt = GT.fmt;
  GT.PAX = { BASE: 2.2, AD_MULT: 1.8, AD_TURNS: 6, FUSS: 0.3, DEST: { Megacity: 1.35, Science: 1.0, 'Gas Giant': 1.1, Agrarian: 0.9, Mining: 0.8, Ruin: 0.9, 'Void Station': 1.0 } };

  var baseNew = GT.newState;
  GT.newState = function (shipId, name, char) {
    var s = baseNew(shipId, name, char), sh = GT.SHIPS.filter(function (x) { return x.id === s.shipId; })[0];
    s.ship.paxMax = sh.pax || 1; s.ship.lv.cabin = 0; s.fareMult = null; s.ads = {}; s.crew = null;
    var st = s.stats; st.paxCarried = 0; st.paxIncome = 0; st.paxAdSpend = 0; st.paxTrips = 0; st.paxRefunds = 0;
    return s;
  };

  /* the going rate for this trip, which grows with distance and with how big your business is */
  GT.fairFare = function (s, dest) { return Math.max(20, Math.round(GT.dist(s.loc, dest) * (0.8 + GT.scale(s) / 600) / 5) * 5); };
  GT.fare = function (s, dest) { return s.fareMult == null ? 0 : Math.max(1, Math.round(GT.fairFare(s, dest) * s.fareMult)); };
  GT.setFare = function (s, credits, dest) {
    credits = Math.floor(credits); if (!(credits > 0)) { s.fareMult = null; return null; }
    var fair = GT.fairFare(s, dest); s.fareMult = clamp(credits / fair, 0.1, 6); return GT.fare(s, dest);
  };
  GT.adActive = function (s, dest) { return (s.ads[dest] || 0) > s.turn ? s.ads[dest] - s.turn : 0; };
  GT.adCost = function (s, dest) { return Math.max(50, Math.round(GT.scale(s) * 0.3 / 5) * 5); };
  GT.canAdvertise = function (s, dest) { return !s.over && !s.pending && dest !== s.loc && dest >= 0 && s.credits >= GT.adCost(s, dest); };
  GT.advertise = function (s, dest) {
    if (!GT.canAdvertise(s, dest)) return false;
    var c = GT.adCost(s, dest), p = GT.PLANETS[dest];
    s.credits -= c; s.stats.paxAdSpend += c; s.ads[dest] = s.turn + GT.PAX.AD_TURNS;
    GT.log(s, 'You pay <b>' + fmt(c) + 'c</b> for a poster and jingle campaign about your ship on <b>' + p.name + '</b>. Expect more passengers heading that way for the next ' + GT.PAX.AD_TURNS + ' jumps.', 'loss', -c);
    return true;
  };
  GT.repDemand = function (s) { return clamp(0.55 + (clamp(s.rep, -50, 100) + 20) / 100, 0.35, 1.8); };
  /* average number of people who turn up wanting a seat to dest */
  GT.paxDemand = function (s, dest) {
    var t = GT.PLANETS[dest].type, d = GT.PAX.DEST[t] || 1;
    return GT.PAX.BASE * d * GT.repDemand(s) * (GT.adActive(s, dest) ? GT.PAX.AD_MULT : 1);
  };
  /* chance a would-be passenger buys a ticket at this price: they judge it against a fair price with some personal fuss */
  function normCdf(z) { var t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp(-z * z / 2), p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; }
  GT.paxAccept = function (ratio) { return ratio <= 0 ? 1 : 1 - normCdf(Math.log(ratio) / GT.PAX.FUSS); };
  /* about how many will board, for the trip plan */
  GT.paxExpected = function (s, dest) {
    if (s.fareMult == null) return 0;
    var lam = GT.paxDemand(s, dest) * GT.paxAccept(s.fareMult), cap = s.ship.paxMax, e = 0, p = Math.exp(-lam), c = p;
    for (var n = 0; n <= 14; n++) { e += Math.min(n, cap) * c; p *= lam / (n + 1); c = p; }
    return e;
  };
  function poisson(lam) { var L = Math.exp(-lam), k = 0, p = 1; do { k++; p *= GT.rand(); } while (p > L && k < 20); return k - 1; }

  GT.PAX_FOLK = ['a nervous botanist', 'a retired pirate with a very small hat', 'two students on a gap year', 'a travelling cheese inspector', 'a mime who keeps pretending the airlock is stuck',
    'a salesman who sells things he does not own', 'a grandmother with eleven suitcases', 'a poet between worlds', 'a bounty hunter in disguise as a plant', 'a stage magician and his rabbit, which is also a magician',
    'a lost tourist with a very optimistic map', 'a diplomat carrying a sealed box and a grudge', 'a tax lawyer who is, for once, off duty', 'a family of four and a very quiet fifth', 'a ship\'s cat that someone paid for'];
  GT.PAX_MOOD_GOOD = ['They rave about the flight to everyone at the dock.', 'One of them leaves a tip and a drawing of your ship.', 'They hand out your card to a very rich cousin.'];
  GT.PAX_MOOD_BAD = ['They climb out pale and swear they will walk next time.', 'One writes a stern review on a very public noticeboard.', 'They demand a refund, a blanket and an apology, in that order.'];

  /* called by GT.jump as you leave: who is on the manifest for this trip */
  GT.paxBoard = function (s, dest) {
    if (s.fareMult == null || !s.ship.paxMax) return null;
    var fair = GT.fairFare(s, dest), fare = GT.fare(s, dest), ratio = fare / fair, turnUp = poisson(GT.paxDemand(s, dest)), want = 0, k;
    for (k = 0; k < turnUp; k++) if (GT.rand() < GT.paxAccept(ratio)) want++;
    var n = Math.min(want, s.ship.paxMax); if (!n) { GT.log(s, 'Nobody wants a seat at <b>' + fmt(fare) + 'c</b> a head' + (turnUp ? ' (' + turnUp + ' looked and walked off)' : ' (the dock is quiet)') + '. The berths fly empty.', 'info'); return null; }
    var who = []; for (k = 0; k < n; k++) who.push(GT.pick(GT.PAX_FOLK));
    var vip = 0; for (k = 0; k < n; k++) if (GT.rand() < 0.06) vip++;
    return { n: n, fare: fare, vip: vip, who: who, dest: dest };
  };
  /* called by GT.jump when the ship lands: ev is the road event that happened (or null) */
  GT.paxArrive = function (s, crew, ev, B) {
    var pay = crew.n * crew.fare + crew.vip * crew.fare * 2, tip = 0, refund = 0, st = s.stats, text, kind = 'gain';
    if (ev && ev.g < 0) { refund = Math.round(pay * 0.3); pay -= refund; GT.addRep(s, -1); st.paxRefunds += refund; kind = 'event'; text = GT.pick(GT.PAX_MOOD_BAD) + ' <span class="fx">(refund ' + fmt(refund) + 'c, -1 reputation)</span>'; }
    else if (ev && ev.g > 0 || GT.rand() < 0.2) { tip = Math.round(pay * 0.12); pay += tip; text = GT.pick(GT.PAX_MOOD_GOOD) + ' <span class="fx">(tip ' + fmt(tip) + 'c)</span>'; if (GT.rand() < 0.5) GT.addRep(s, 1); }
    else text = 'A smooth flight. Nobody complains, which is the highest praise.';
    s.credits += pay; st.paxIncome += pay; st.paxCarried += crew.n; st.paxTrips++;
    var names = crew.who.slice(0, 3).join(', ') + (crew.who.length > 3 ? ' and ' + (crew.who.length - 3) + ' more' : '');
    GT.log(s, '<b>Passengers (' + crew.n + ' on board to ' + B.name + '):</b> ' + names + (crew.vip ? ', one of them a VIP who pays triple' : '') + '. ' + text + ' <b>+' + fmt(pay) + 'c</b> in fares.', kind, pay);
  };
})();
