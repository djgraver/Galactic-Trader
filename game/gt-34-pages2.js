/* Galactic Trader 4. Part 34: the v4 shop pages. The bank (savings and loans kept apart), the stock exchange, and the back alley with its smuggling offers.
   Actions come in through ACTX (see actExt in gt-20-app.js), quantity boxes through INPX. */

/* ---------- bank: two separate counters ---------- */
function pct(x) { return (Math.round(x * 10000) / 100) + '%'; }
PAGES.bank = function () {
  var sg = NP.SIGNS[plan().id].bank, C = GT.CFG, nextSav = Math.round(S.bank * C.DEPOSIT_RATE), nextLoan = S.loan > 0 ? Math.max(1, Math.round(S.loan * C.LOAN_RATE)) : 0;
  var room = Math.max(0, C.LOAN_CAP - S.loan), h = '<div class="bank2">';
  h += '<section class="panel sav"><h2 class="hd">Savings account</h2><div class="bal good num">' + fmt(S.bank) + 'c</div>';
  h += '<div class="dim bl">Pays <b>' + pct(C.DEPOSIT_RATE) + '</b> every jump. Next interest: <b class="good">+' + fmt(nextSav) + 'c</b></div>';
  h += '<div class="bk-row"><input class="val" id="in-dep" type="number" min="0" step="1" value="' + ui.dep + '" aria-label="Deposit amount">' + btn('Deposit', 'deposit', ui.dep > 0 && ui.dep <= S.credits, 'green') + btn('Deposit All', 'dep-all', S.credits > 0, 'green') + '</div>';
  h += '<div class="bk-row"><input class="val" id="in-wd" type="number" min="0" step="1" value="' + ui.wd + '" aria-label="Withdraw amount">' + btn('Withdraw', 'withdraw', ui.wd > 0 && ui.wd <= S.bank, 'blue') + btn('Withdraw All', 'wd-all', S.bank > 0, 'blue') + '</div>';
  h += '<div class="dim bl">In your pocket: <b class="num">' + fmt(S.credits) + 'c</b>. Deposits count toward your net worth and are safe from rivals.</div></section>';
  h += '<section class="panel loan"><h2 class="hd">Loans</h2><div class="bal num ' + (S.loan ? 'bad' : '') + '">' + fmt(S.loan) + 'c</div>';
  h += '<div class="dim bl">Costs <b>' + pct(C.LOAN_RATE) + '</b> every jump. ' + (S.loan ? 'Next interest: <b class="bad">+' + fmt(nextLoan) + 'c</b> added to the debt.' : 'You owe nothing. Lucky you.') + '</div>';
  h += '<div class="bk-row">' + btn('Take Loan ' + fmt(C.LOAN_STEP) + 'c', 'loan', GT.canLoan(S), 'pink') + '<span class="dim">Room under the cap: <b class="num">' + fmt(room) + 'c</b> of ' + fmt(C.LOAN_CAP) + 'c</span></div>';
  h += '<div class="bk-row"><input class="val" id="in-rep" type="number" min="0" step="1" value="' + ui.rep + '" aria-label="Repay amount">' + btn('Repay', 'repay', ui.rep > 0 && S.loan > 0 && S.credits > 0, 'gold') + btn('Repay All', 'rep-all', S.loan > 0 && S.credits > 0, 'gold') + '</div>';
  h += '<div class="dim bl">Loans come in fixed ' + fmt(C.LOAN_STEP) + 'c chunks. The debt grows every jump, so pay it off when you can.</div></section></div>';
  return frame('bank', 'bank', '<div class="panel bankwrap"><h2 class="hd">' + esc(sg) + '</h2>' + h + receipt() + '</div>');
};
ACTX.push(function (a) {
  if (a === 'dep-all') { var n = Math.floor(S.credits); if (GT.deposit(S, n)) { speak('bank', NP.say('bank', 'deposit', { amt: fmt(n) })); SFX.play('coin'); } ui.dep = 0; return true; }
  if (a === 'wd-all') { var n2 = Math.floor(S.bank); if (GT.withdraw(S, n2)) { speak('bank', NP.say('bank', 'withdraw', { amt: fmt(n2) })); SFX.play('coin'); } ui.wd = 0; return true; }
  if (a === 'rep-all') { var n3 = Math.floor(Math.min(S.loan, S.credits)); if (GT.repay(S, n3)) { speak('bank', NP.say('bank', 'repay', { amt: fmt(n3) })); SFX.play('coin'); } ui.rep = 0; return true; }
  return false;
});

/* ---------- stock exchange ---------- */
SC.RK.exchange = function (B, th) {
  var i, x, y, up = [0, 4, 3, 6, 5, 9, 8, 13, 11, 16];
  /* a big board with a rising line, left */
  B.rect(6, 8, 78, 40, PX.K); B.rect(8, 10, 74, 36, PX.B);
  for (i = 0; i < 6; i++) B.line(8, 14 + i * 6, 81, 14 + i * 6, PX.E + PX.B + 0 === 0 ? PX.B : PX.LB);
  for (i = 0; i < up.length - 1; i++) B.line(12 + i * 7, 42 - up[i], 19 + i * 7, 42 - up[i + 1], PX.LG);
  B.ell(75, 42 - up[9], 2, 2, PX.Y); B.rect(6, 8, 78, 1, PX.W);
  /* a ticker tape across the bottom */
  B.rect(0, 46, 320, 8, PX.K);
  for (i = 0; i < 26; i++) { var c = [PX.LG, PX.LR, PX.Y, PX.LC][(i * 7) % 4]; B.rect(i * 13 + 2, 48, 9, 4, c); }
  /* the bull, right */
  B.ell(280, 34, 22, 11, PX.N); B.ell(280, 31, 20, 8, PX.R); B.ell(298, 28, 9, 8, PX.N); B.ell(304, 31, 4, 3, PX.LR);
  B.poly([294, 22, 290, 14, 298, 20], PX.W); B.poly([306, 22, 312, 14, 306, 21], PX.W); B.px(301, 26, PX.Y); B.px(302, 26, PX.K);
  B.rect(262, 40, 4, 8, PX.N); B.rect(270, 41, 4, 7, PX.N); B.rect(288, 41, 4, 7, PX.N); B.rect(296, 40, 4, 8, PX.N); B.line(258, 30, 252, 38, PX.N);
  B.ell(150, 52, 1, 1, PX.Y);
};

var XSTK = { qty: {} };
function xqty(k) { return Math.max(1, XSTK.qty[k] || 1); }
function spark(hist, up) {
  var w = 58, hh = 26, lo = Math.min.apply(null, hist), hi = Math.max.apply(null, hist), span = Math.max(1, hi - lo), pts = hist.map(function (v, i) { return (hist.length > 1 ? 2 + i * (w - 4) / (hist.length - 1) : w / 2).toFixed(1) + ',' + (hh - 3 - (v - lo) / span * (hh - 6)).toFixed(1); });
  return '<svg class="spark" viewBox="0 0 ' + w + ' ' + hh + '" width="' + w + '" height="' + hh + '" shape-rendering="crispEdges" aria-hidden="true"><rect width="' + w + '" height="' + hh + '" fill="#000"/><polyline points="' + pts.join(' ') + '" fill="none" stroke="' + (up ? '#55ff55' : '#ff5555') + '" stroke-width="2"/></svg>';
}
function xchRow(k) {
  var c = GT.STOCKS[k], m = S.stockMkt, px = m.px[k], hist = m.hist[k], prev = hist.length > 1 ? hist[hist.length - 2] : px, ch = prev ? (px - prev) / prev * 100 : 0, hd = S.stocks[k], val = hd.qty * px;
  var pl = hd.qty ? val - hd.avg * hd.qty : 0, tier = GT.stockTierFor(hd.qty), nx = GT.stockNextTier(hd.qty), pn = GT.PLANETS[c.pid].name, q = xqty(k), qb = GT.quoteStockBuy(S, k, q), qs = GT.quoteStockSell(S, k, q);
  var h = '<div class="xr" data-k="' + k + '" data-label="' + esc(c.name + ': ' + c.blurb) + '">';
  h += '<span class="xn"><b class="tk">' + c.tick + '</b><span class="dim nmx">' + esc(c.name) + '</span></span>';
  h += '<span class="xp"><b class="num">' + fmt(px) + 'c</b><span class="' + (ch >= 0 ? 'up' : 'dn') + '">' + (ch >= 0 ? '&#9650; +' : '&#9660; ') + ch.toFixed(1) + '%</span></span>';
  h += spark(hist, hist[hist.length - 1] >= hist[0]);
  h += '<span class="xh">' + (hd.qty ? '<b class="num">' + hd.qty + ' sh = ' + fmt(val) + 'c</b><span class="' + (pl >= 0 ? 'good' : 'bad') + '">' + (pl >= 0 ? '+' : '-') + fmt(Math.abs(pl)) + 'c <span class="dim">avg ' + hd.avg.toFixed(1) + '</span></span>' : '<span class="dim">none held</span>') + '</span>';
  h += '<span class="xt" title="Holding enough shares cuts the tax on ' + esc(pn) + '"><b>' + esc(pn) + '</b>' + (tier ? '<span class="good">tax -' + Math.round(tier.cut * 100) + '%' + (nx ? ' <span class="dim">next ' + nx.n + ' sh</span>' : ' (top tier)') + '</span>' : '<span class="dim">no cut, next ' + nx.n + ' sh</span>') + '</span>';
  h += '<div class="ctl">' + btn('Buy', 'sbuy', GT.canStockBuy(S, k, q), '', ' data-label="Buy ' + q + ' ' + c.tick + ' for ' + fmt(qb.total) + 'c (fee ' + fmt(qb.fee) + 'c)"') + btn('Max', 'smax', GT.maxStockBuy(S, k) > 0, 'gold') + '<input class="sqty" type="number" min="1" step="1" value="' + q + '" aria-label="Shares of ' + c.tick + '">' + btn('Sell', 'ssell', GT.canStockSell(S, k, q), 'green', ' data-label="Sell ' + q + ' ' + c.tick + ' for ' + fmt(qs.total) + 'c (fee ' + fmt(qs.fee) + 'c)"') + btn('All', 'sall', hd.qty > 0, 'green') + '</div></div>';
  return h;
}
PAGES.exchange = function () {
  var p = plan(), t = GT.taxInfo(S, S.loc), val = GT.stockValue(S), nw = GT.networth(S), share = nw > 0 ? val / nw * 100 : 0, div = Math.round(val * GT.STK.DIV);
  var h = '<div class="panel xch"><div class="row"><h2 class="hd">' + esc(NP.SIGNS[p.id].exchange) + '</h2><span class="tax" title="' + esc(GT.discText(t)) + '">Tax here ' + (t.rate * 100).toFixed(1) + '%</span></div>';
  h += '<div class="xsum"><span>Portfolio <b class="num">' + fmt(val) + 'c</b></span><span><b class="num">' + share.toFixed(0) + '%</b> of net worth</span><span>Dividend about <b class="good num">+' + fmt(div) + 'c</b> a jump</span><span>Fee <b>' + pct(GT.CFG.STOCK_FEE) + '</b> each way</span></div>';
  h += '<div class="xr xh0"><span>Company</span><span>Price</span><span>Trend</span><span>Your shares</span><span>Home world tax cut</span><span></span></div>';
  GT.STOCKS.forEach(function (c, k) { h += xchRow(k); });
  h += '<div class="dim xnote">Shares count toward net worth like a deposit, but prices can fall. They pay a small dividend each jump. Hold <b>' + GT.STOCK_TIERS.map(function (x) { return x.n; }).join(' / ') + '</b> shares of a world\'s own company to cut its tax by <b>' + GT.STOCK_TIERS.map(function (x) { return Math.round(x.cut * 100) + '%'; }).join(' / ') + '</b>.</div></div>';
  return frame('exchange', 'exchange', h).replace('<div class="loc">', '<div class="loc xchloc">');
};
function xk(el) { var r = el && el.closest ? el.closest('.xr') : null; return r ? +r.dataset.k : -1; }
ACTX.push(function (a, el) {
  if (a !== 'sbuy' && a !== 'smax' && a !== 'ssell' && a !== 'sall') return false;
  var k = xk(el); if (k < 0) return true; var c = GT.STOCKS[k], q;
  if (a === 'sbuy' || a === 'smax') { var n = a === 'smax' ? GT.maxStockBuy(S, k) : xqty(k); q = GT.buyStock(S, k, n); if (q) { speak('exchange', NP.say('exchange', 'buy', { qty: q.qty, item: c.name }) + ' (' + q.qty + ' ' + c.tick + ' for ' + fmt(q.total) + 'c incl. ' + fmt(q.fee) + 'c fee)'); SFX.play('buy'); } else { speak('exchange', NP.say('exchange', 'no')); SFX.play('bad'); } }
  else { var m = a === 'sall' ? S.stocks[k].qty : xqty(k); q = GT.sellStock(S, k, m); if (q) { speak('exchange', NP.say('exchange', 'sell', { qty: q.qty, item: c.name }) + ' (' + q.qty + ' ' + c.tick + ' for ' + fmt(q.total) + 'c after ' + fmt(q.fee) + 'c fee)'); SFX.play('sell'); } else { speak('exchange', NP.say('exchange', 'no')); SFX.play('bad'); } }
  return true;
});
INPX.push(function (t, v) {
  if (!t.classList.contains('sqty')) return false;
  var k = xk(t); if (k < 0) return true; XSTK.qty[k] = Math.max(1, v); var row = t.closest('.xr'), q = XSTK.qty[k];
  row.querySelector('[data-act="sbuy"]').disabled = !GT.canStockBuy(S, k, q) || !!S.over; row.querySelector('[data-act="ssell"]').disabled = !GT.canStockSell(S, k, q) || !!S.over;
  return true;
});

/* ---------- back alley: explore, and the smuggler's offers ---------- */
var FIXER_SVG = '<svg viewBox="0 0 160 160"><rect width="160" height="160" fill="#2a1a4a"/><rect y="118" width="160" height="42" fill="#12082a"/><path d="M80,6 C122,6 142,48 146,156 L14,156 C18,48 38,6 80,6 Z" fill="#111" stroke="#000" stroke-width="5"/><path d="M80,18 C108,18 124,48 124,86 C124,112 104,132 80,132 C56,132 36,112 36,86 C36,48 52,18 80,18 Z" fill="#050208"/><ellipse cx="60" cy="78" rx="9" ry="6" fill="#ffe14a"/><ellipse cx="102" cy="78" rx="9" ry="6" fill="#ffe14a"/><circle cx="62" cy="78" r="3" fill="#000"/><circle cx="104" cy="78" r="3" fill="#000"/><path d="M52,104 Q82,126 112,102" fill="none" stroke="#ffe14a" stroke-width="5" stroke-linecap="round"/><rect x="92" y="104" width="7" height="9" fill="#ffd700"/><path d="M30,140 L130,140 L134,160 L26,160 Z" fill="#8a1c3a"/></svg>';
var FIXER_QUIPS = {
  win: ['Pleasure doing business. I never saw you. You never saw me.', '*pockets a very small cut* Come back when you want to be rich again.'],
  bonus: ['Ha! You are a natural. I am not even angry, I am proud.', 'Somebody tipped well! Do not tell the taxman. Do not tell anyone.'],
  upgrade: ['A little something extra, as a thank-you. Do not ask where it came from.'],
  neutral: ['Buyer no-show. It happens. Think of it as a very quiet holiday.'],
  caught: ['I told you to be quick. I said "quick". I said it several times.', 'You were never here, but they seem to know your name. Awkward.'],
  damage: ['Oof. Yes. That is the sound of a smuggling run going wrong.', 'It is only a little bit on fire. Mostly.'],
  lost: ['Robbed? In THIS alley? Shocking. I know nobody who would do that.'],
  walk: ['Suit yourself. The offer will not wait for you. Nothing does, in this alley.', 'Smart. Or boring. It is hard to tell from here.']
};
var RUN_TAG = { win: 'Run done', bonus: 'Jackpot!', upgrade: 'Run done, with a bonus', neutral: 'Buyer never showed', caught: 'Busted!', damage: 'Run went wrong', lost: 'Robbed!', walk: 'You walked away' };
function smugCard(o) {
  var bad = GT.smuggleBadChance(S, o.risk), tenth = Math.round(bad * 10), riskCls = { low: 'good', medium: 'amber', high: 'bad' }[o.risk];
  var h = '<div class="offer"><div class="row"><b class="ot">' + esc(o.title) + '</b><span class="tax ' + o.risk + '">Risk ' + o.risk + '</span></div>';
  h += '<p class="otx">' + esc(o.text) + '</p><div class="ofig"><span>You front <b class="num">' + fmt(o.stake) + 'c</b></span><span>Payout about <b class="good num">' + fmt(o.pay) + 'c</b></span><span>Trouble about <b class="' + riskCls + '">' + tenth + ' in 10</b></span></div>';
  h += '<div class="dim">' + esc(o.hint) + ' Cargo: ' + esc(o.cargo) + '.</div><div class="acts" style="margin-top:8px">' + btn('Take the job (stake ' + fmt(o.stake) + 'c)', 'smug-go', GT.smuggleCanAccept(S), 'pink big') + btn('Walk away', 'smug-no', !S.pending, 'blue big') + '</div>';
  if (!GT.smuggleCanAccept(S) && S.credits < o.stake) h += '<div class="bad" style="font-size:18px">You cannot cover the stake of ' + fmt(o.stake) + 'c. Sell some cargo first.</div>';
  return h + '</div>';
}
PAGES.alley = function () {
  var v = S.visit, o = v.smuggle, sm = ui.smug && ui.smug.loc === S.loc && ui.smug.turn === S.turn ? ui.smug : null, done = v.explored;
  var h = '<div class="panel alleywrap"><h2 class="hd">The Back Alley</h2><p style="margin:0 0 6px">Bins, steam, a flickering sign, and the distinct feeling of being watched by someone with a lot of eyes. You can poke around once per visit. Now and then a <b>hooded fixer</b> offers a <b>smuggling run</b>. Runs pay well, but they go wrong about <b>4 times in 10</b> (the road and the alley rarely manage that). A good reputation helps the odds.</p>';
  if (o) { ui.say.alley = o.text; h += smugCard(o); }
  else {
    h += '<div class="acts" style="margin:6px 0">' + btn(done ? 'You already poked around' : 'Explore the Alley', 'explore', !done && !S.pending, 'pink big') + '</div>';
    if (sm) {
      var cls = sm.kind === 'win' || sm.kind === 'bonus' || sm.kind === 'upgrade' ? 'gain' : sm.kind === 'walk' || sm.kind === 'neutral' ? 'event' : 'loss';
      h += '<div class="le ' + cls + ' smugres"><b>' + RUN_TAG[sm.kind] + (sm.title ? ' (' + esc(sm.title) + ')' : '') + '</b> ' + sm.text + (sm.kind !== 'walk' ? ' <b>' + (sm.net >= 0 ? '+' : '-') + fmt(Math.abs(sm.net)) + 'c net</b>' : '') + '</div>';
    } else if (ui.last && ui.last.key === 'explore' && ui.last.loc === S.loc && ui.last.turn === S.turn && !/smuggling run/.test(ui.last.text)) h += '<div class="le ' + ui.last.kind + '" style="font-size:19px">' + ui.last.text + '</div>';
    else if (done) h += receipt();
  }
  var f = frame('alley', 'alley', h + '</div>');
  return f.replace(/<div class="card">[\s\S]*?<div class="cn">\?\?\?<\/div><div class="cj">Something in the dark<\/div>/, '<div class="card">' + PX.svg(FIXER_SVG, 40, 40, 'portrait', 2, 40) + '<div class="cn">The Fixer</div><div class="cj">Hooded. Helpful. Not honest.</div>').replace('<span class="nm">Narrator</span>', '<span class="nm">The Fixer</span>');
};
ACTX.push(function (a) {
  if (a === 'smug-go') {
    var o = S.visit.smuggle, r = o ? GT.smuggleAccept(S) : null;
    if (r && r.ok) { ui.smug = { loc: S.loc, turn: S.turn, kind: r.kind, net: r.money, text: r.text, title: o.title }; speak('alley', GT.pick(FIXER_QUIPS[r.kind] || FIXER_QUIPS.win)); SFX.play(r.money > 0 ? 'win' : r.money < 0 ? 'bad' : 'pop'); }
    return true;
  }
  if (a === 'smug-no') { var o2 = S.visit.smuggle; if (GT.smuggleRefuse(S)) { ui.smug = { loc: S.loc, turn: S.turn, kind: 'walk', net: 0, text: 'You decline. The fixer shrugs and melts back into the steam.', title: o2 ? o2.title : '' }; speak('alley', GT.pick(FIXER_QUIPS.walk)); SFX.play('pop'); } return true; }
  return false;
});
