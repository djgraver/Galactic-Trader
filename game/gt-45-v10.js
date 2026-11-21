/* Galactic Trader 10. Part 45: the v10 economy and ship rules. Loaded after gt-36-v7.js. No DOM in here.
   - Shares: your own buying and selling no longer moves the price, there is no fee to buy (a small one to sell), and prices follow the trade in each
     company's goods (anyone buying them anywhere is a sale for the company), the shortages and gluts on the lanes, and frequent company news. Bigger growth and dividends.
   - Market: a little livelier, but predictable. A world that imports an item always pays a fair bit for it and now and then a great deal (a demand spike).
     A world that makes an item stays cheap for it, and sometimes dumps it very cheaply. Spikes and dumps are reported as rumours.
   - Property costs a bit more and pays back roughly twice as fast. Crew wages are higher. Odd jobs pay more.
   - The Defence Grid: a three-level ship system sold at shipyards that stops bad things happening on the lanes. */
(function () {
  var clamp = GT.clamp, R = GT.R, fmt = GT.fmt, C = GT.CFG;

  /* ================= numbers ================= */
  GT.JOB_PAY = [0, 0.6, 1.5, 3.0];                /* odd jobs pay half as much again as v9 */
  C.VOL_MULT = 1.6;                               /* a slightly livelier market (v7: 1.5) */
  GT.WAGE.RATE = [0.9, 1.4]; GT.WAGE.FLOOR = 250;  /* the crew want about twice what they asked for in v9 */
  C.FAC_PRICE_MULT = 17;                          /* property costs about a fifth more (v9: 14) */
  GT.FAC_RETURN = 2.4;                            /* ...and returns 2.4 times as much */
  C.FEE_CAP_TURNS = 20;
  C.ENCOUNTER = 1;                                /* the cantina is a room full of people now, so somebody always wants to talk */                           /* fees pile up for longer before the books are closed */
  GT.facDef('broker').pct = 0.035; GT.facDef('depot').pct = 0.14;
  ['factory', 'warehouse', 'hotel'].forEach(function (id) { GT.facDef(id).feePct *= GT.FAC_RETURN; });

  /* ================= property ================= */
  GT.brokerEdge = function (s) { return Math.min(0.14, GT.facOfType(s, 'broker') * GT.facDef('broker').pct) + ((s.visit && s.visit.haggle) || 0) + (GT.perkEdge ? GT.perkEdge(s) : 0); };
  GT.depotCut = function (s) { return Math.min(0.5, GT.facOfType(s, 'depot') * GT.facDef('depot').pct); };
  /* the benefit figure is now the bigger v10 return; the price is worked out from the old, smaller one, so it only rises by FAC_PRICE_MULT 14 -> 17 */
  var baseBenefit = GT.facBenefit;
  GT.facBenefit = function (s, id, p) {
    var f = GT.facDef(id), S = clamp(GT.networth(s), 2500, 150000);
    if (f.kind === 'trade') return f.pct * S * 0.6;
    if (f.kind === 'fuel') return f.pct * (150 + S * 0.006);
    return f.feePct * S * GT.PLANETS[p].fac[id];
  };
  GT.facPrice = function (s, id, p) { return Math.max(250, Math.round(C.FAC_PRICE_MULT * GT.facBenefit(s, id, p) / GT.FAC_RETURN / 10) * 10); };
  GT.makeOffer = function (s, p) {
    var pl = GT.PLANETS[p], tot = 0, ids = GT.FACILITIES.map(function (f) { tot += pl.fac[f.id]; return f.id; }), r = GT.rand() * tot, id = ids[0];
    for (var k = 0; k < ids.length; k++) { r -= pl.fac[ids[k]]; if (r <= 0) { id = ids[k]; break; } }
    var B = GT.facBenefit(s, id, p), price = GT.facPrice(s, id, p);
    s.visit.offer = { type: id, B: B, price: price };
    GT.log(s, 'A local agent offers you a <b>' + GT.facDef(id).name + '</b> on ' + pl.name + ' for <b>' + fmt(price) + 'c</b>: ' + GT.facBenefitText(id, B) + '. It should pay for itself in about ' + Math.max(3, Math.round(price / Math.max(1, B))) + ' jumps. The offer stands while you are docked here.', 'info');
  };
  /* owned fee buildings earn on what you are worth now, not only on what you were worth when you bought them */
  GT.collectFees = function (s, p) {
    var o = s.owned[p]; if (!o || !o.fee) { if (o) o.since = s.turn; return; }
    var turns = Math.min(C.FEE_CAP_TURNS, s.turn - o.since); o.since = s.turn;
    if (turns <= 0) return;
    var per = Math.max(o.fee, GT.facBenefit(s, o.type, p) * 0.75), inc = Math.round(per * turns * R(0.85, 1.15) / 5) * 5; s.credits += inc; s.stats.feeIncome += inc;
    GT.log(s, 'Your <b>' + GT.facDef(o.type).name + '</b> here has earned rival-trader fees over ' + turns + ' jumps: <b>+' + fmt(inc) + 'c</b>.', 'gain', inc);
  };
  /* owning property earns you a bigger tax break everywhere, and a big one at home */
  GT.taxInfo = function (s, p) {
    var base = GT.PLANETS[p].tax, here = s.owned[p] ? 0.2 : 0;
    var facCut = base * Math.min(0.75, GT.facCount(s) * 0.08 + here);
    var rep = clamp(s.rep, -50, 100), repCut = base * (rep >= 0 ? rep / 100 * 0.4 : rep / 50 * 0.25);
    var stockCut = base * (GT.stockTaxCut ? GT.stockTaxCut(s, p) : 0), perkCut = base * (GT.perkTax ? GT.perkTax(s) : 0);
    return { base: base, facCut: facCut, repCut: repCut, stockCut: stockCut + perkCut, rate: Math.max(0.005, base - facCut - repCut - stockCut - perkCut) };
  };

  /* ================= the market: livelier, but each world keeps its character ================= */
  /* role of item i on world p: 1 imports it (pays well), -1 makes it (sells cheap), 0 neither */
  GT.roleOf = function (p, i) { var m = GT.PLANETS[p].mult[i]; return m >= 1.15 ? 1 : m <= 0.75 ? -1 : 0; };
  GT.SPIKE = { CH: 0.03, LO: 1.3, HI: 1.6, FLOOR: 0.95, DUMP_CH: 0.045, DUMP: [0.58, 0.74], CEIL: 1.06 };
  var SPIKE_TXT = ['Word on the lanes: <b>{p}</b> is paying a fortune for <b>{i}</b> right now.', 'Dockside rumour: <b>{p}</b> has run dry of <b>{i}</b> and will pay almost anything.', 'A buyer on <b>{p}</b> is bidding sky-high for <b>{i}</b>. It will not last.'];
  var DUMP_TXT = ['Word on the lanes: <b>{p}</b> is drowning in <b>{i}</b> and selling it off cheap.', 'Dockside rumour: a warehouse on <b>{p}</b> is clearing out <b>{i}</b> at a steal.'];
  var baseTick = GT.tickMarkets;
  GT.tickMarkets = function (s) {
    var before = s.mods.length;
    baseTick(s);
    var who = s.game ? s.game.players : [s], news = [];
    GT.PLANETS.forEach(function (pl, p) {
      GT.ITEMS.forEach(function (it, i) {
        var mk = s.markets[p][i], r = GT.roleOf(p, i);
        if (r > 0) {
          if (mk.shock < GT.SPIKE.FLOOR) mk.shock = GT.SPIKE.FLOOR + (mk.shock - GT.SPIKE.FLOOR) * 0.3;
          if (GT.rand() < GT.SPIKE.CH && mk.shock < 1.25) { mk.shock *= R(GT.SPIKE.LO, GT.SPIKE.HI); news.push(GT.pick(SPIKE_TXT).replace('{p}', pl.name).replace('{i}', it.name)); }
        } else if (r < 0) {
          if (mk.shock > GT.SPIKE.CEIL) mk.shock = GT.SPIKE.CEIL + (mk.shock - GT.SPIKE.CEIL) * 0.3;
          if (GT.rand() < GT.SPIKE.DUMP_CH && mk.shock > 0.8) { mk.shock *= R(GT.SPIKE.DUMP[0], GT.SPIKE.DUMP[1]); news.push(GT.pick(DUMP_TXT).replace('{p}', pl.name).replace('{i}', it.name)); }
        }
      });
    });
    /* shortages and gluts, as before, but a shortage now lands where an item is imported and a glut where it is made, so the lanes keep their shape */
    s.mods.slice(before).forEach(function (m) {
      var r = GT.roleOf(m.p, m.i), up = m.mult > 1;
      if ((up && r < 0) || (!up && r > 0)) { var alt = GT.ITEMS.map(function (x, i) { return i; }).filter(function (i) { return GT.roleOf(m.p, i) === (up ? 1 : -1); }); if (alt.length) { m.i = GT.pick(alt); m.text = m.text.replace(/(shortage of |glut of |shopping for |scandal has )[A-Z][a-z]+( [A-Z][a-z]+)?/, '$1' + GT.ITEMS[m.i].name); } }
      if (GT.stockNews) GT.stockNews(s, m);
    });
    if (news.length) who.forEach(function (q) { news.forEach(function (t) { GT.log(q, t, 'info'); }); });
  };

  /* ================= shares ================= */
  GT.STK.IMPACT = 0; GT.STK.DRIFT = 1.016; GT.STK.DIV = 0.009; GT.STK.NOISE = 0.035; GT.STK.HIST = 20;
  C.STOCK_FEE = 0; C.STOCK_FEE_SELL = 0.005;
  /* how much trade in a company's goods it takes to move its price: about this many credits of goods bought in a jump adds 10% */
  GT.STK.FLOW_REF = 15000; GT.STK.FLOW_KEEP = 0.55; GT.STK.NEWS = 0.08;
  function mk0(m) { if (!m.flow) { m.flow = GT.STOCKS.map(function () { return 0; }); m.news = GT.STOCKS.map(function () { return 0; }); m.pend = GT.STOCKS.map(function () { return 0; }); } return m; }
  GT.stockFor = function (item) { var k = -1; GT.STOCKS.forEach(function (c, j) { if (c.item === item) k = j; }); return k; };
  /* every unit of a company's goods bought anywhere, by anyone, is a sale for that company. Selling them back into the home world's own market is a small loss of face. */
  GT.stockTrade = function (s, item, value, p, sold) {
    var m = s.stockMkt; if (!m) return; mk0(m); var k = GT.stockFor(item); if (k < 0) return;
    var home = GT.STOCKS[k].pid === p;
    m.pend[k] += (sold ? (home ? -0.4 : 0.15) : 1) * value / GT.STK.FLOW_REF * 0.1;
  };
  var baseBuy = GT.buy, baseSell = GT.sell;
  GT.buy = function (s, i, qty) { var q = baseBuy(s, i, qty); if (q) { GT.stockTrade(s, i, q.sub, s.loc, false); if (GT.questTrade) GT.questTrade(s, i, q.qty, 'buy'); } return q; };
  GT.sell = function (s, i, qty) { var q = baseSell(s, i, qty); if (q) { GT.stockTrade(s, i, q.sub, s.loc, true); if (GT.questTrade) GT.questTrade(s, i, q.qty, 'sell'); } return q; };

  function reprice(m, k) { m.px[k] = Math.max(2, Math.round(m.base[k] * m.drift * Math.pow(m.ema[k], 1.15) * Math.exp(m.noise[k] + m.flow[k] + m.news[k]))); }
  var NEWS_UP = ['{n} announces a record quarter. The CEO was seen smiling, which is unusual.', 'Analysts upgrade {n}: "It has a logo and a pulse."', 'A big contract lands at {n}. Shares jump.', '{n} discovers a new vein of profit, mostly under the sofa.', '{n} wins a sector-wide supply deal. The board celebrates with a second biscuit.', 'A famous captain is seen wearing a {n} cap. Sales double overnight.', '{n} opens a new plant and nobody is injured. Investors are thrilled.'];
  var NEWS_DN = ['{n} recalls a product. Possibly all of them.', 'A scandal at {n}: the canteen has been serving the stock options.', 'Analysts downgrade {n}: "Has a logo, pulse unconfirmed."', 'A strike at {n} ends when everyone forgets what it was about. Shares slump.', 'Auditors find a hole in the books of {n}. It is shaped like a yacht.', '{n} loses a lawsuit to a sentient fungus. Shares wilt.'];
  var MKT_UP = ['A boom across the lanes lifts every company. Brokers are buying each other drinks.', 'The Sector Bank cuts its rates. Every share on the board ticks up.'];
  var MKT_DN = ['A panic sweeps the exchanges after a rumour about the price of rumours. Everything dips.', 'Pirate activity spooks the markets. Every company slides a little.'];
  function tellHolders(s, k, line, up) { (s.game ? s.game.players : [s]).forEach(function (q) { if (q.stocks && (k < 0 ? GT.stockShares(q) > 0 : q.stocks[k].qty > 0)) GT.log(q, 'Stock news: ' + line, up ? 'gain' : 'loss'); }); }
  /* a shortage of a company's goods is good for the company, a glut is bad */
  GT.stockNews = function (s, mod) {
    var m = s.stockMkt; if (!m) return; mk0(m); var k = GT.stockFor(mod.i); if (k < 0) return; var c = GT.STOCKS[k], up = mod.mult > 1, sz = R(0.06, 0.12) * (up ? 1 : -1);
    m.news[k] += sz;
    tellHolders(s, k, (up ? 'Demand for ' + GT.ITEMS[mod.i].name + ' lifts <b>' + c.name + '</b>.' : 'A glut of ' + GT.ITEMS[mod.i].name + ' weighs on <b>' + c.name + '</b>.') + ' <span class="fx">(' + c.tick + ' ' + (up ? 'up' : 'down') + ')</span>', up);
  };
  GT.tickStocks = function (s) {
    var m = s.stockMkt; if (!m) return; mk0(m); m.tick++; m.drift *= GT.STK.DRIFT;
    var sector = 0;
    if (GT.rand() < 0.04) { var upS = GT.rand() < 0.6; sector = R(0.04, 0.08) * (upS ? 1 : -1); tellHolders(s, -1, GT.pick(upS ? MKT_UP : MKT_DN) + ' <span class="fx">(all shares ' + (upS ? 'up' : 'down') + ')</span>', upS); }
    GT.STOCKS.forEach(function (c, k) {
      var sig = GT.stockSignal(s, k);
      m.ema[k] += (sig - m.ema[k]) * 0.5;
      m.noise[k] = m.noise[k] * 0.6 + GT.gauss() * GT.STK.NOISE;
      /* rival traders keep a steady trickle of business going in every company */
      m.flow[k] = m.flow[k] * GT.STK.FLOW_KEEP + m.pend[k] + GT.gauss() * 0.012; m.pend[k] = 0;
      m.flow[k] = clamp(m.flow[k], -0.3, 0.3);
      m.news[k] = m.news[k] * 0.8 + sector;
      m.imp[k] = 1;
      if (GT.rand() < GT.STK.NEWS) {
        var up = GT.rand() < 0.55, sz = R(0.07, 0.15) * (up ? 1 : -1); m.news[k] += sz;
        tellHolders(s, k, GT.pick(up ? NEWS_UP : NEWS_DN).replace('{n}', '<b>' + c.name + '</b>') + ' <span class="fx">(' + c.tick + ' ' + (up ? 'up' : 'down') + ' sharply)</span>', up);
      }
      reprice(m, k);
      m.hist[k].push(m.px[k]); if (m.hist[k].length > GT.STK.HIST) m.hist[k].shift();
    });
  };
  /* the flat quote: what you see is what you pay. No ladder, no fee to buy, a half per cent to sell. */
  GT.quoteStockBuy = function (s, k, qty) { var px = s.stockMkt.px[k]; qty = Math.max(0, Math.floor(qty)); var sub = px * qty, fee = sub * C.STOCK_FEE; return { qty: qty, sub: sub, fee: fee, total: sub + fee, avg: qty ? px : 0 }; };
  GT.quoteStockSell = function (s, k, qty) { var px = s.stockMkt.px[k]; qty = Math.max(0, Math.min(Math.floor(qty), s.stocks[k].qty)); var sub = px * qty, fee = sub * C.STOCK_FEE_SELL; return { qty: qty, sub: sub, fee: fee, total: sub - fee, avg: qty ? px : 0 }; };
  GT.maxStockBuy = function (s, k) { return Math.floor(s.credits / Math.max(1, s.stockMkt.px[k] * (1 + C.STOCK_FEE))); };
  GT.buyStock = function (s, k, qty) {
    if (!GT.canStockBuy(s, k, qty)) return null;
    var q = GT.quoteStockBuy(s, k, qty), h = s.stocks[k], c = GT.STOCKS[k], st = s.stats;
    h.avg = (h.avg * h.qty + q.sub) / (h.qty + q.qty); h.qty += q.qty; s.credits -= q.total;
    st.stockBought += q.qty; st.stockSpent += q.total; st.stockFees += q.fee;
    GT.log(s, 'Bought <b>' + q.qty + ' ' + c.tick + '</b> shares (' + c.name + ') at ' + fmt(q.avg) + 'c each. <b>-' + fmt(q.total) + 'c</b>.' + GT.stockTierText(s, k), 'loss', -q.total);
    if (GT.questTrade) GT.questTrade(s, -1, 0, 'shares');
    return q;
  };
  GT.sellStock = function (s, k, qty) {
    if (!GT.canStockSell(s, k, qty)) return null;
    var q = GT.quoteStockSell(s, k, qty), h = s.stocks[k], c = GT.STOCKS[k], st = s.stats, paid = h.avg * q.qty, gain = q.total - paid;
    h.qty -= q.qty; if (!h.qty) h.avg = 0; s.credits += q.total;
    st.stockSold += q.qty; st.stockEarned += q.total; st.stockFees += q.fee; st.stockRealized += gain;
    GT.log(s, 'Sold <b>' + q.qty + ' ' + c.tick + '</b> shares (' + c.name + ') at ' + fmt(q.avg) + 'c each, less a ' + fmt(q.fee) + 'c fee. <b>+' + fmt(q.total) + 'c</b> (' + (gain >= 0 ? '+' : '-') + fmt(Math.abs(gain)) + 'c against what you paid).', 'gain', q.total);
    return q;
  };

  /* ================= the Defence Grid ================= */
  GT.UPGRADES.shield = { name: 'Defence Grid', unit: 'level', step: 1, base: 2400, grow: 1.85, label: 'stops bad things on the lanes', max: 3 };
  GT.SHIELD = [0, 0.45, 0.7, 0.9];          /* the chance each level turns a bad travel event aside */
  GT.SHIELD_NAMES = ['none', 'Point-defence turrets', 'Deflector shell', 'Full aegis lattice'];
  GT.PLANETS.forEach(function (p) { if (p.upgrades.length && p.upgrades.indexOf('shield') < 0) p.upgrades.push('shield'); });
  var baseNew = GT.newState;
  GT.newState = function (shipId, name, char) { var s = baseNew(shipId, name, char); s.ship.lv.shield = 0; s.stats.shielded = 0; return s; };
  GT.upMax = function (key) { return (GT.UPGRADES[key] && GT.UPGRADES[key].max) || C.UPGRADE_MAX; };
  GT.upgradeAvail = function (s, key) { return GT.PLANETS[s.loc].upgrades.indexOf(key) >= 0 && (s.ship.lv[key] || 0) < GT.upMax(key); };
  var baseUpgrade = GT.upgrade;
  GT.upgrade = function (s, key) {
    if (key !== 'shield') return baseUpgrade(s, key);
    if (!GT.upgradeAvail(s, key)) return false;
    var cost = GT.upgradeCost(s, key); if (cost > s.credits) return false;
    s.credits -= cost; s.stats.upgradesSpent += cost; s.ship.lv.shield++;
    GT.log(s, 'Fitted a <b>Defence Grid</b> level ' + s.ship.lv.shield + ' (' + GT.SHIELD_NAMES[s.ship.lv.shield] + '): it now turns aside about ' + Math.round(GT.SHIELD[s.ship.lv.shield] * 100) + '% of the trouble on the lanes. <b>-' + fmt(cost) + 'c</b>.', 'loss', -cost);
    return true;
  };
  GT.shieldLevel = function (s) { return Math.min(3, s.ship.lv.shield || 0); };
  var SHIELD_TXT = [
    'A pirate cutter opens fire. Your Defence Grid flares blue and the shots splash off like rain on a window. The pirates think better of it.',
    'Something nasty lunges out of the dark. The Defence Grid swats it aside before the alarm has finished its first beep.',
    'Proximity alarm! The turrets chatter, the deflector glows, and whatever it was becomes a pretty cloud of sparks.',
    'Trouble comes knocking on the hull. The Defence Grid answers the door, and trouble leaves.',
    'A swarm of rubble tumbles across your lane. The deflector shell shrugs it off with a sound like hail on a tin roof.',
    'Raiders hail you and demand a "toll". Your Defence Grid lights up the whole bridge. They decide the toll was optional.'
  ];
  var prevJump = GT.jump;
  GT.jump = function (s, to, towed, opts) {
    opts = opts || {};
    if (!towed && !Object.prototype.hasOwnProperty.call(opts, 'event') && !s.over && !s.pending && to !== s.loc) {
      var ev = GT.rand() < C.TRAVEL_EVENT && GT.TRAVEL ? GT.pickEntry(GT.TRAVEL, s) : null;
      if (ev && ev.g < 0 && GT.shieldLevel(s) > 0 && GT.rand() < GT.SHIELD[GT.shieldLevel(s)]) {
        s.stats.shielded = (s.stats.shielded || 0) + 1;
        ev = GT.mk(0, GT.pick(SHIELD_TXT)); ev.shield = true; opts.noEvade = true;
      }
      opts.event = ev;
    }
    var ok = prevJump(s, to, towed, opts);
    if (ok && opts.event) { for (var i = 0; i < s.log.length && i < 300; i++) if (s.log[i].text.indexOf(opts.event.t) >= 0) { s.log[i].travel = true; if (opts.event.shield) { s.log[i].shield = true; s.log[i].kind = 'event'; } break; } }
    return ok;
  };

  /* ================= what you can see of a world's prices: a quick summary for the nav map ================= */
  GT.demandNote = function (s, p) {
    var hi = [], lo = [];
    GT.ITEMS.forEach(function (it, i) { var r = GT.roleOf(p, i), sh = s.markets[p][i].shock; if (r > 0 && sh > 1.25) hi.push(it.name); if (r < 0 && sh < 0.8) lo.push(it.name); });
    return { hi: hi, lo: lo };
  };
})();
