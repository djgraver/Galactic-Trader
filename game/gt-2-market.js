/* Galactic Trader. Part 2: state, markets, tax and trading. No DOM access here. */
(function () {
  var rng = Math.random;
  GT.setRng = function (f) { rng = f; };
  GT.seeded = function (seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  GT.rand = function () { return rng(); };
  GT.R = function (a, b) { return a + rng() * (b - a); };
  GT.RI = function (a, b) { return Math.floor(a + rng() * (b - a + 1)); };
  GT.pick = function (arr) { return arr[Math.floor(rng() * arr.length)]; };
  GT.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  GT.gauss = function () { var u = 1 - rng(), v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  GT.esc = function (t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  GT.fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };
  var clamp = GT.clamp, R = GT.R;

  /* ---------- state ---------- */
  GT.newState = function (shipId, name) {
    var sh = GT.SHIPS.filter(function (x) { return x.id === shipId; })[0] || GT.SHIPS[0];
    var s = {
      name: (name || 'Nameless').slice(0, 20), shipId: sh.id,
      ship: { cargoMax: sh.cargo, speed: sh.speed, fuelMax: sh.fuel, fuel: Math.round(sh.fuel * GT.CFG.START_FUEL_FRAC), lv: { cargo: 0, speed: 0, fuel: 0 }, damage: [] },
      credits: GT.CFG.START_CREDITS, bank: 0, loan: 0, rep: 0, turn: 1, loc: 3, dest: null,
      cargo: GT.ITEMS.map(function () { return { qty: 0, avg: 0 }; }),
      markets: [], fuelMult: [], mods: [], owned: {}, comps: [], log: [], over: null,
      visit: { explored: false, encountered: false, offer: null, flags: {} }, pending: null, trendHidden: [],
      stats: { jumps: 0, bought: [], spent: [], sold: [], earned: [], tax: 0, taxSavedRep: 0, taxSavedFac: 0, brokerEdge: 0,
        eventGain: 0, eventLoss: 0, events: 0, explores: 0, encounters: 0, fuelBought: 0, fuelSpent: 0, interestEarned: 0, interestPaid: 0,
        feeIncome: 0, facilitiesBought: 0, upgradesSpent: 0, sabotage: 0, sabotageWon: 0, assists: 0, gambleNet: 0, gambleRounds: 0,
        peak: GT.CFG.START_CREDITS, repPeak: 0, repLow: 0, tows: 0 }
    };
    GT.ITEMS.forEach(function () { s.stats.bought.push(0); s.stats.spent.push(0); s.stats.sold.push(0); s.stats.earned.push(0); });
    GT.PLANETS.forEach(function (p) {
      s.fuelMult.push(1);
      s.markets.push(GT.ITEMS.map(function (it, i) {
        var target = it.depth * clamp(Math.pow(1 / p.mult[i], 2.5), 0.4, 3.5);
        return { target: target, stock: Math.round(target * R(0.85, 1.15)), shock: 1 };
      }));
    });
    GT.COMPETITORS.forEach(function (c, k) {
      var w = GT.CFG.START_CREDITS * R(0.9, 1.15);
      s.comps.push({ name: c.name, title: c.title, rate: c.rate, wealth: w, loc: (k * 2 + 1) % GT.PLANETS.length, cargo: 30, speed: 1.2, mood: 0 });
    });
    GT.refreshComps(s);
    GT.rollTrends(s);
    return s;
  };
  GT.log = function (s, text, kind, amount) { s.log.unshift({ turn: s.turn, text: text, kind: kind || 'info', amount: amount || 0 }); if (s.log.length > 600) s.log.length = 600; };
  GT.networth = function (s) { return s.credits + s.bank - s.loan; };
  GT.scale = function (s) { return clamp(GT.networth(s) * 0.05, 150, 6000); };
  GT.cargoUsed = function (s) { return s.cargo.reduce(function (a, c) { return a + c.qty; }, 0); };
  GT.cargoFree = function (s) { return s.ship.cargoMax - GT.cargoUsed(s); };
  GT.effSpeed = function (s) { var d = s.ship.damage.reduce(function (a, x) { return a + x.amt; }, 0); return Math.max(0.5, s.ship.speed - d); };
  GT.rollTrends = function (s) { s.trendHidden = GT.ITEMS.map(function () { return rng() < 0.25; }); };
  GT.refreshComps = function (s) {
    s.comps.forEach(function (c) {
      var f = Math.min(1, c.wealth / GT.CFG.WIN);
      c.cargo = Math.round(30 + 55 * f); c.speed = Math.round((1.2 + 1.2 * f) * 10) / 10;
    });
  };

  /* ---------- facilities ---------- */
  GT.facCount = function (s) { return Object.keys(s.owned).length; };
  GT.facOfType = function (s, id) { return Object.keys(s.owned).filter(function (k) { return s.owned[k].type === id; }).length; };
  GT.brokerEdge = function (s) { return Math.min(0.06, GT.facOfType(s, 'broker') * 0.015) + ((s.visit && s.visit.haggle) || 0); };
  GT.depotCut = function (s) { return Math.min(0.24, GT.facOfType(s, 'depot') * 0.06); };

  /* ---------- prices ---------- */
  GT.modMult = function (s, p, i) { var m = 1; s.mods.forEach(function (x) { if (x.p === p && x.i === i) m *= x.mult; }); return m; };
  GT.priceAt = function (s, p, i, stock) {
    var mk = s.markets[p][i], f = clamp(Math.pow(Math.max(stock, 0.5) / mk.target, -GT.CFG.ELASTICITY), 0.5, 2.0);
    return Math.max(1, GT.ITEMS[i].base * GT.PLANETS[p].mult[i] * f * mk.shock * GT.modMult(s, p, i));
  };
  GT.price = function (s, p, i) { return GT.priceAt(s, p, i, s.markets[p][i].stock); };
  GT.trend = function (s, p, i) { return GT.price(s, p, i) / GT.ITEMS[i].base - 1; };

  GT.taxInfo = function (s, p) {
    var base = GT.PLANETS[p].tax, here = s.owned[p] ? 0.12 : 0;
    var facCut = base * Math.min(0.6, GT.facCount(s) * 0.05 + here);
    var rep = clamp(s.rep, -50, 100), repCut = base * (rep >= 0 ? rep / 100 * 0.4 : rep / 50 * 0.25);
    return { base: base, facCut: facCut, repCut: repCut, rate: Math.max(0.005, base - facCut - repCut) };
  };

  /* ---------- trading. quote* never mutate; buy/sell apply a quote ---------- */
  GT.quoteBuy = function (s, i, qty) {
    var p = s.loc, stock = s.markets[p][i].stock, edge = GT.brokerEdge(s), sub = 0, n = Math.min(qty, Math.floor(stock));
    for (var k = 0; k < n; k++) sub += GT.priceAt(s, p, i, stock - k) * (1 - edge);
    var t = GT.taxInfo(s, p), tax = sub * t.rate;
    return { qty: n, sub: sub, tax: tax, total: sub + tax, avg: n ? sub / n : 0, t: t, edgeValue: sub * edge / (1 - edge) };
  };
  GT.quoteSell = function (s, i, qty) {
    var p = s.loc, stock = s.markets[p][i].stock, edge = GT.brokerEdge(s), sub = 0, n = Math.min(qty, s.cargo[i].qty);
    for (var k = 0; k < n; k++) sub += GT.priceAt(s, p, i, stock + k) * (1 + edge);
    var t = GT.taxInfo(s, p), tax = sub * t.rate;
    return { qty: n, sub: sub, tax: tax, total: sub - tax, avg: n ? sub / n : 0, t: t, edgeValue: sub * edge / (1 + edge) };
  };
  GT.maxBuy = function (s, i) {
    var p = s.loc, stock = s.markets[p][i].stock, edge = GT.brokerEdge(s), rate = GT.taxInfo(s, p).rate;
    var cap = Math.min(Math.floor(stock), GT.cargoFree(s)), sub = 0, n = 0;
    for (var k = 0; k < cap; k++) {
      var c = GT.priceAt(s, p, i, stock - k) * (1 - edge);
      if ((sub + c) * (1 + rate) > s.credits) break;
      sub += c; n++;
    }
    return n;
  };
  GT.canBuy = function (s, i, qty) { return qty > 0 && s.markets[s.loc][i].stock >= qty && GT.cargoFree(s) >= qty && GT.quoteBuy(s, i, qty).total <= s.credits; };
  GT.canSell = function (s, i, qty) { return qty > 0 && s.cargo[i].qty >= qty; };

  GT.buy = function (s, i, qty) {
    if (!GT.canBuy(s, i, qty)) return null;
    var q = GT.quoteBuy(s, i, qty), c = s.cargo[i], p = s.loc, st = s.stats, it = GT.ITEMS[i];
    c.avg = (c.avg * c.qty + q.sub) / (c.qty + q.qty); c.qty += q.qty;
    s.markets[p][i].stock -= q.qty; s.credits -= q.total;
    st.bought[i] += q.qty; st.spent[i] += q.total; st.tax += q.tax;
    st.taxSavedRep += q.sub * q.t.repCut; st.taxSavedFac += q.sub * q.t.facCut; st.brokerEdge += q.edgeValue;
    GT.log(s, 'Bought <b>' + q.qty + ' ' + it.name + '</b> at an average of ' + q.avg.toFixed(1) + 'c: ' + GT.fmt(q.sub) + 'c, plus ' + GT.fmt(q.tax) + 'c tax (' + (q.t.rate * 100).toFixed(1) + '% after ' + GT.discText(q.t) + '). ' + GT.savedText(q) + 'Overall <b>-' + GT.fmt(q.total) + 'c</b>.', 'loss', -q.total);
    return q;
  };
  GT.sell = function (s, i, qty) {
    if (!GT.canSell(s, i, qty)) return null;
    var q = GT.quoteSell(s, i, qty), c = s.cargo[i], p = s.loc, st = s.stats, it = GT.ITEMS[i];
    var paid = c.avg * q.qty, profit = q.total - paid;
    c.qty -= q.qty; if (c.qty === 0) c.avg = 0;
    s.markets[p][i].stock += q.qty; s.credits += q.total;
    st.sold[i] += q.qty; st.earned[i] += q.total; st.tax += q.tax;
    st.taxSavedRep += q.sub * q.t.repCut; st.taxSavedFac += q.sub * q.t.facCut; st.brokerEdge += q.edgeValue;
    GT.log(s, 'Sold <b>' + q.qty + ' ' + it.name + '</b> at an average of ' + q.avg.toFixed(1) + 'c: ' + GT.fmt(q.sub) + 'c, less ' + GT.fmt(q.tax) + 'c tax (' + (q.t.rate * 100).toFixed(1) + '% after ' + GT.discText(q.t) + '). ' + GT.savedText(q) + 'Overall <b>+' + GT.fmt(q.total) + 'c</b> (' + (profit >= 0 ? '+' : '') + GT.fmt(profit) + 'c against what you paid).', 'gain', q.total);
    return q;
  };
  GT.savedText = function (q) {
    var r = q.sub * q.t.repCut, f = q.sub * q.t.facCut, parts = [];
    if (r >= 1) parts.push('your reputation saved you ' + GT.fmt(r) + 'c'); else if (r <= -1) parts.push('your poor reputation cost you ' + GT.fmt(-r) + 'c');
    if (f >= 1) parts.push('your facilities saved you ' + GT.fmt(f) + 'c');
    return parts.length ? 'Discounts: ' + parts.join(' and ') + '. ' : '';
  };
  GT.discText = function (t) {
    var f = (t.facCut / t.base * 100), r = (t.repCut / t.base * 100);
    return GT.fmt(t.base * 1000) / 10 + '% base, ' + (f ? '-' + f.toFixed(0) + '% from facilities' : 'no facility discount') + ', ' + (r >= 0 ? '-' + r.toFixed(0) + '% from reputation' : '+' + (-r).toFixed(0) + '% reputation penalty');
  };

  /* ---------- fuel ---------- */
  GT.fuelPrice = function (s, p) { return Math.max(1, Math.round(GT.PLANETS[p].fuel * s.fuelMult[p] * (1 - GT.depotCut(s)))); };
  GT.canRefuel = function (s) { return GT.PLANETS[s.loc].fuelSold; };
  GT.refuel = function (s, qty) {
    var room = s.ship.fuelMax - s.ship.fuel, price = GT.fuelPrice(s, s.loc);
    var n = Math.min(qty, room, Math.floor(s.credits / price));
    if (!GT.canRefuel(s) || n <= 0) return 0;
    var cost = n * price; s.ship.fuel += n; s.credits -= cost; s.stats.fuelBought += n; s.stats.fuelSpent += cost;
    GT.log(s, 'Refuelled <b>' + n + ' PC</b> at ' + price + 'c each. <b>-' + GT.fmt(cost) + 'c</b>.', 'loss', -cost);
    return n;
  };

  /* ---------- per-jump market drift ---------- */
  var MODS = [
    { mult: 1.45, text: 'A shortage of {item} is driving prices up on {planet}.' },
    { mult: 0.66, text: 'A glut of {item} has {planet} dumping stock cheaply.' },
    { mult: 1.35, text: 'A festival on {planet} has everyone shopping for {item}.' },
    { mult: 0.72, text: 'A rumour of a quality scandal has {item} sliding on {planet}.' }
  ];
  GT.tickMarkets = function (s) {
    GT.PLANETS.forEach(function (pl, p) {
      GT.ITEMS.forEach(function (it, i) {
        var mk = s.markets[p][i];
        mk.stock += (mk.target - mk.stock) * GT.CFG.REVERT + GT.gauss() * 0.03 * mk.target;
        mk.stock = Math.max(1, Math.round(mk.stock));
        mk.shock = Math.exp(Math.log(mk.shock) * 0.8 + GT.gauss() * it.vol);
      });
      s.fuelMult[p] = clamp(Math.exp(Math.log(s.fuelMult[p]) * 0.85 + GT.gauss() * 0.06), 0.8, 1.3);
      if (rng() < 0.05 && !s.mods.some(function (x) { return x.p === p; })) {
        var m = GT.pick(MODS), i2 = GT.RI(0, GT.ITEMS.length - 1);
        s.mods.push({ p: p, i: i2, mult: m.mult, turns: GT.RI(4, 8), text: m.text.replace('{item}', GT.ITEMS[i2].name).replace('{planet}', pl.name) });
      }
    });
    s.mods.forEach(function (x) { x.turns--; });
    s.mods = s.mods.filter(function (x) { return x.turns > 0; });
  };
})();
