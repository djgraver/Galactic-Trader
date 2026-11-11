/* Galactic Trader 4. Part 32: the stock exchange. Every world lists one company, tied to the goods that world makes. A share price follows how the company's home market is doing,
   plus drift, noise, news, and the push of your own trading. Shares count toward net worth (they are much like a bank deposit, with risk) and, in large enough lots,
   cut the tax on the company's home world. All shares can be traded at any Exchange. No DOM in here. */
(function () {
  var clamp = GT.clamp, R = GT.R, fmt = GT.fmt;
  /* item: the main good the company lives on. p0: opening share price. */
  GT.STOCKS = [
    { pid: 0, tick: 'GGF', name: 'Gourd & Gone Farms', item: 0, p0: 28, blurb: 'Sells food to everyone, which is a sound business model.' },
    { pid: 1, tick: 'SPX', name: 'Sphinxy Relics Ltd', item: 6, p0: 140, blurb: 'Tomb-grade antiques, riddle-based customer service.' },
    { pid: 2, tick: 'SLAG', name: 'Slag Heap Mining', item: 1, p0: 52, blurb: 'Digs a hole, sells the hole\'s contents, repeats.' },
    { pid: 3, tick: 'SCW', name: 'Spire Circuit Works', item: 4, p0: 120, blurb: 'Logic cores on level 412. Beep boop, dividend.' },
    { pid: 4, tick: 'NULL', name: 'Null Dark Matter Inc', item: 5, p0: 150, blurb: 'Bottles the stuff. Does not ask where it goes.' },
    { pid: 5, tick: 'QBL', name: 'Quellin Biolabs', item: 2, p0: 90, blurb: 'Meds, grafts and a suspicious number of grant forms.' },
    { pid: 6, tick: 'CCS', name: 'Cirrus Cloud-Spice Co', item: 3, p0: 80, blurb: 'Flavour harvested from the clouds. Fluffy margins.' }
  ];
  /* tax cut tiers: shares held on a world's own stock, and the share of that world's base tax that is waived */
  GT.STOCK_TIERS = [{ n: 10, cut: 0.10 }, { n: 25, cut: 0.20 }, { n: 50, cut: 0.30 }, { n: 100, cut: 0.40 }];
  GT.STK = { DRIFT: 1.0055, DIV: 0.0025, IMPACT: 0.0002, NOISE: 0.03, HIST: 16 };

  GT.newStockMkt = function () {
    return { tick: 0, px: [], base: [], ema: [], noise: [], imp: [], drift: 1, hist: [], day0: [] };
  };
  function initMkt(m) {
    GT.STOCKS.forEach(function (c, k) {
      var p = Math.max(2, Math.round(c.p0 * R(0.92, 1.08)));
      m.px.push(p); m.base.push(c.p0); m.ema.push(1); m.noise.push(0); m.imp.push(1); m.hist.push([p]); m.day0.push(p);
    });
    return m;
  }
  var baseNew = GT.newState;
  GT.newState = function (shipId, name, char) {
    var s = baseNew(shipId, name, char);
    s.stocks = GT.STOCKS.map(function () { return { qty: 0, avg: 0 }; });
    s.stockMkt = initMkt(GT.newStockMkt());
    var st = s.stats; st.stockBought = 0; st.stockSold = 0; st.stockSpent = 0; st.stockEarned = 0; st.stockFees = 0; st.stockDiv = 0; st.stockRealized = 0;
    return s;
  };

  /* how the company's home market looks right now: 1 means normal */
  GT.stockSignal = function (s, k) {
    var c = GT.STOCKS[k], p = c.pid, main = 0, avg = 0, n = GT.ITEMS.length;
    GT.ITEMS.forEach(function (it, i) { var r = GT.price(s, p, i) / (it.base * GT.PLANETS[p].mult[i]); if (i === c.item) main = r; avg += r / n; });
    return 0.7 * main + 0.3 * avg;
  };
  GT.stockPrice = function (s, k) { return s.stockMkt.px[k]; };
  function reprice(m, k) { m.px[k] = Math.max(2, Math.round(m.base[k] * m.drift * Math.pow(m.ema[k], 0.9) * Math.exp(m.noise[k]) * m.imp[k])); }
  var NEWS_UP = ['{n} announces a record quarter. The CEO was seen smiling, which is unusual.', 'Analysts upgrade {n}: "It has a logo and a pulse."', 'A big contract lands at {n}. Shares jump.', '{n} discovers a new vein of profit, mostly under the sofa.'];
  var NEWS_DN = ['{n} recalls a product. Possibly all of them.', 'A scandal at {n}: the canteen has been serving the stock options.', 'Analysts downgrade {n}: "Has a logo, pulse unconfirmed."', 'A strike at {n} ends when everyone forgets what it was about. Shares slump.'];
  GT.tickStocks = function (s) {
    var m = s.stockMkt; if (!m) return; m.tick++; m.drift *= GT.STK.DRIFT;
    GT.STOCKS.forEach(function (c, k) {
      var sig = GT.stockSignal(s, k);
      m.ema[k] += (sig - m.ema[k]) * 0.5;
      m.noise[k] = m.noise[k] * 0.6 + GT.gauss() * GT.STK.NOISE;
      m.imp[k] = 1 + (m.imp[k] - 1) * 0.8;
      var before = m.px[k];
      if (GT.rand() < 0.035) {
        var up = GT.rand() < 0.5, sz = R(0.07, 0.14) * (up ? 1 : -1); m.noise[k] += sz;
        var line = GT.pick(up ? NEWS_UP : NEWS_DN).replace('{n}', '<b>' + c.name + '</b>');
        (s.game ? s.game.players : [s]).forEach(function (q) { if (q.stocks && q.stocks[k].qty > 0) GT.log(q, 'Stock news: ' + line + ' <span class="fx">(' + c.tick + ' ' + (up ? 'up' : 'down') + ' sharply)</span>', up ? 'gain' : 'loss'); });
      }
      reprice(m, k);
      m.hist[k].push(m.px[k]); if (m.hist[k].length > GT.STK.HIST) m.hist[k].shift();
    });
  };
  /* hang the stock tick on the world tick (one per jump solo, one per round when shared) */
  var baseTick = GT.tickMarkets;
  GT.tickMarkets = function (s) { baseTick(s); GT.tickStocks(s); };

  GT.stockValue = function (s) { var v = 0, m = s.stockMkt; if (!m || !s.stocks) return 0; s.stocks.forEach(function (h, k) { v += h.qty * m.px[k]; }); return v; };
  GT.stockShares = function (s) { return s.stocks ? s.stocks.reduce(function (a, h) { return a + h.qty; }, 0) : 0; };
  /* the share of a world's base tax that your holdings in its company waive */
  GT.stockTierFor = function (n) { var t = null; GT.STOCK_TIERS.forEach(function (x) { if (n >= x.n) t = x; }); return t; };
  GT.stockTaxCut = function (s, p) {
    if (!s.stocks) return 0; var k = -1; GT.STOCKS.forEach(function (c, i) { if (c.pid === p) k = i; });
    var t = k >= 0 ? GT.stockTierFor(s.stocks[k].qty) : null; return t ? t.cut : 0;
  };
  GT.stockNextTier = function (n) { var t = null; GT.STOCK_TIERS.forEach(function (x) { if (!t && n < x.n) t = x; }); return t; };

  /* quotes walk up (buying) or down (selling) a ladder, so a large order moves the price against you. A 1% fee applies each way. */
  GT.quoteStockBuy = function (s, k, qty) {
    var px = s.stockMkt.px[k], sub = 0; qty = Math.max(0, Math.floor(qty));
    for (var i = 0; i < qty; i++) sub += px * (1 + i * GT.STK.IMPACT);
    var fee = sub * GT.CFG.STOCK_FEE; return { qty: qty, sub: sub, fee: fee, total: sub + fee, avg: qty ? sub / qty : 0 };
  };
  GT.quoteStockSell = function (s, k, qty) {
    var px = s.stockMkt.px[k], sub = 0; qty = Math.max(0, Math.min(Math.floor(qty), s.stocks[k].qty));
    for (var i = 0; i < qty; i++) sub += px * Math.max(0.3, 1 - i * GT.STK.IMPACT);
    var fee = sub * GT.CFG.STOCK_FEE; return { qty: qty, sub: sub, fee: fee, total: sub - fee, avg: qty ? sub / qty : 0 };
  };
  GT.maxStockBuy = function (s, k) {
    var lo = 0, hi = Math.floor(s.credits / Math.max(1, s.stockMkt.px[k]));
    while (lo < hi) { var mid = Math.ceil((lo + hi) / 2); if (GT.quoteStockBuy(s, k, mid).total <= s.credits) lo = mid; else hi = mid - 1; }
    return lo;
  };
  GT.canStockBuy = function (s, k, qty) { return !s.over && !s.pending && qty > 0 && GT.quoteStockBuy(s, k, qty).total <= s.credits; };
  GT.canStockSell = function (s, k, qty) { return !s.over && !s.pending && qty > 0 && s.stocks[k].qty >= qty; };
  GT.buyStock = function (s, k, qty) {
    if (!GT.canStockBuy(s, k, qty)) return null;
    var q = GT.quoteStockBuy(s, k, qty), h = s.stocks[k], m = s.stockMkt, c = GT.STOCKS[k], st = s.stats;
    h.avg = (h.avg * h.qty + q.sub) / (h.qty + q.qty); h.qty += q.qty; s.credits -= q.total;
    st.stockBought += q.qty; st.stockSpent += q.total; st.stockFees += q.fee;
    m.imp[k] *= 1 + q.qty * GT.STK.IMPACT; reprice(m, k);
    GT.log(s, 'Bought <b>' + q.qty + ' ' + c.tick + '</b> shares (' + c.name + ') at an average of ' + q.avg.toFixed(1) + 'c: ' + fmt(q.sub) + 'c plus ' + fmt(q.fee) + 'c fee. <b>-' + fmt(q.total) + 'c</b>.' + GT.stockTierText(s, k), 'loss', -q.total);
    return q;
  };
  GT.sellStock = function (s, k, qty) {
    if (!GT.canStockSell(s, k, qty)) return null;
    var q = GT.quoteStockSell(s, k, qty), h = s.stocks[k], m = s.stockMkt, c = GT.STOCKS[k], st = s.stats, paid = h.avg * q.qty, gain = q.total - paid;
    h.qty -= q.qty; if (!h.qty) h.avg = 0; s.credits += q.total;
    st.stockSold += q.qty; st.stockEarned += q.total; st.stockFees += q.fee; st.stockRealized += gain;
    m.imp[k] *= Math.max(0.5, 1 - q.qty * GT.STK.IMPACT); reprice(m, k);
    GT.log(s, 'Sold <b>' + q.qty + ' ' + c.tick + '</b> shares (' + c.name + ') at an average of ' + q.avg.toFixed(1) + 'c: ' + fmt(q.sub) + 'c less ' + fmt(q.fee) + 'c fee. <b>+' + fmt(q.total) + 'c</b> (' + (gain >= 0 ? '+' : '-') + fmt(Math.abs(gain)) + 'c against what you paid).', 'gain', q.total);
    return q;
  };
  GT.stockTierText = function (s, k) {
    var c = GT.STOCKS[k], n = s.stocks[k].qty, t = GT.stockTierFor(n);
    return t ? ' Your ' + n + ' shares cut tax on ' + GT.PLANETS[c.pid].name + ' by ' + Math.round(t.cut * 100) + '%.' : '';
  };
  /* every jump the shares pay a small dividend */
  GT.stockDividends = function (s) {
    var v = GT.stockValue(s); if (v <= 0) return 0;
    var d = Math.round(v * GT.STK.DIV); if (d < 1) return 0;
    s.credits += d; s.stats.stockDiv += d;
    GT.log(s, 'Your shares pay a dividend: <b>+' + fmt(d) + 'c</b>.', 'gain', d);
    return d;
  };
})();
