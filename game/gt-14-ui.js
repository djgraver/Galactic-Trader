/* Galactic Trader Deluxe. Part 14: UI core. State, helpers, sound, HUD, the router, and the hub, market and bank pages. */
var S = null, G = null;
/* extension points the v4 parts register into (see actExt in gt-20-app.js): action handlers (a, el) and input handlers (el, value). Return true when handled. */
var ACTX = [], INPX = [];
var ui = { setup: null, page: 'hub', qty: {}, dep: 0, wd: 0, rep: 0, dest: null, more: 0, say: {}, px: null, SEATCOL: [PX.LC, PX.LG, PX.Y, PX.LM], walking: false, busy: false, last: null, scroll: {}, sentence: '' };
var $ = function (id) { return document.getElementById(id); };
var esc = GT.esc, fmt = GT.fmt;
function reduced() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
function plan() { return GT.PLANETS[S.loc]; }
/* what warp speed buys, used everywhere speed is shown */
function speedFacts(sp) { var fake = { ship: { speed: sp, damage: [] } }; return { fuel: Math.round(GT.fuelRatio(fake) * 100), dodge: Math.round(GT.evadeChance(fake) * 100) }; }
function speedBlurb(sp) { var f = speedFacts(sp); return 'Burns ' + f.fuel + '% fuel &middot; dodges ' + f.dodge + '% of road hazards'; }
function speedHTML(s) {
  var es = GT.effSpeed(s), f = speedFacts(es), rank = s.game && s.game.multi ? s.game.order.indexOf(s.seat) + 1 : 0, h = '<ul class="speedlist">';
  h += '<li><b>Fuel economy:</b> at warp ' + es.toFixed(1) + ' you burn <b>' + f.fuel + '%</b> of the baseline fuel per jump (100% is warp 1.0).</li>';
  h += '<li><b>Dodging hazards:</b> <b>' + f.dodge + '%</b> chance to outrun each bad event on the road. Barges crawl straight into trouble; fast hulls slip past.</li>';
  h += '<li><b>Turn order:</b> ' + (rank ? 'in a shared game the fastest ship moves first each round. You are number <b>' + rank + '</b> this round.' : 'in a shared game, the fastest ship moves first each round and gets the first pick of the markets.') + '</li>';
  h += '<li><b>Getaway:</b> a quick ship makes cleaner escapes when sabotaging a rival (+' + Math.round(GT.speedEdge(s) * 100) + '% success).</li></ul>';
  return h + '<div class="dim" style="font-size:12px">Engine damage cuts warp for a few jumps. The Warp Engine upgrade adds +0.2.</div>';
}
function btn(label, act, ok, cls, extra) { return '<button class="btn ' + (cls || '') + '" data-act="' + act + '"' + (extra || '') + (ok && !(S && S.over) ? '' : ' disabled') + '>' + label + '</button>'; }
function bar(frac, cls) { return '<span class="bar"><i class="' + (cls || '') + '" style="width:' + Math.round(Math.max(0, Math.min(1, frac)) * 100) + '%"></i></span>'; }
function repLabel(r) { return r >= 75 ? 'Legend' : r >= 40 ? 'Respected' : r >= 10 ? 'Known' : r > -10 ? 'Unknown' : r > -30 ? 'Suspect' : 'Notorious'; }
function qtyOf(i) { return Math.max(1, ui.qty[i] || 1); }
function face(t) { return PX.svg('<svg viewBox="-60 -104 120 128"><g transform="scale(' + t.size.toFixed(2) + ')">' + CH.head(t) + '</g></svg>', 18, 19, 'face', 2, 44); }
function logHTML(n, skip) { var h = ''; S.log.slice(skip || 0, (skip || 0) + n).forEach(function (e) { h += '<div class="le ' + e.kind + '"><span class="tn">[Turn ' + e.turn + ']</span> ' + e.text + '</div>'; }); return h; }
function newLogs(top) { var out = []; for (var i = 0; i < S.log.length && S.log[i] !== top; i++) out.push(S.log[i]); return out.reverse(); }
function plainText(html) { var d = document.createElement('div'); d.innerHTML = html; return d.textContent || ''; }
function toast(msg) { var t = $('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(function () { t.hidden = true; }, 2600); }
function setSentence(t) { ui.sentence = t; var el = $('sentence'); if (el) el.textContent = t; }

/* ---------- sound: tiny synthesised blips, no files ---------- */
var SFX = {
  ctx: null, on: true,
  SND: {
    click: [[700, .05, 'square', .035]], coin: [[988, .07, 'square', .05], [1319, .16, 'square', .05, 0, .07]], buy: [[392, .07, 'square', .05], [523, .07, 'square', .05, 0, .07], [659, .12, 'square', .05, 0, .14]],
    sell: [[659, .07, 'square', .05], [784, .07, 'square', .05, 0, .07], [1047, .14, 'square', .05, 0, .14]], bad: [[220, .18, 'sawtooth', .06, .5], [150, .25, 'sawtooth', .06, .5, .12]], pop: [[440, .08, 'triangle', .08, 2.2]],
    whack: [[180, .1, 'square', .08, .4]], win: [[523, .1, 'square', .06], [659, .1, 'square', .06, 0, .1], [784, .1, 'square', .06, 0, .2], [1047, .3, 'square', .06, 0, .3]], lose: [[392, .15, 'sawtooth', .05], [330, .15, 'sawtooth', .05, 0, .15], [262, .35, 'sawtooth', .05, 0, .3]],
    warp: [[90, 1.6, 'sawtooth', .05, 6]], door: [[300, .06, 'square', .04], [420, .08, 'square', .04, 0, .06]], blip: [[880, .04, 'square', .03]], tick: [[1200, .03, 'square', .03]], zap: [[900, .12, 'sawtooth', .04, .25]], boom: [[120, .3, 'sawtooth', .08, .3]]
  },
  tone: function (n) {
    if (!SFX.on) return; try { if (!SFX.ctx) { var A = window.AudioContext || window.webkitAudioContext; if (A) SFX.ctx = new A(); } var c = SFX.ctx; if (!c) return; if (c.state === 'suspended') c.resume();
      var t = c.currentTime + (n[5] || 0), o = c.createOscillator(), g = c.createGain(); o.type = n[2] || 'square'; o.frequency.setValueAtTime(n[0], t);
      if (n[4]) o.frequency.exponentialRampToValueAtTime(Math.max(30, n[0] * n[4]), t + n[1]);
      g.gain.setValueAtTime(n[3] || .05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + n[1]); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + n[1] + .03); } catch (e) {}
  },
  play: function (name) { var s = SFX.SND[name]; if (s) s.forEach(SFX.tone); }
};

/* ---------- speech: each location has its own bubble ---------- */
function speak(role, text) { ui.say[role] = text; }
function castOf(role) {
  var pid = plan().id;
  if (role === 'cantina') return NP.who2(pid);
  if (role === 'jobs') { var k = 'foreman/' + pid; if (!NP.cache[k]) { var t = CH.fromSeed(k, { sp: 4, hair: 7 }); t.name = 'Foreman Gruff'; t.job = 'Odd Jobs Boss'; NP.cache[k] = t; } return NP.cache[k]; }
  if (role === 'alley') return null;
  return NP.char(pid, role);
}
function greet(role) {
  var c = castOf(role), first = !ui['seen-' + S.loc + role]; ui['seen-' + S.loc + role] = true;
  speak(role, c && c.hello && first && role !== 'cantina' && role !== 'jobs' ? c.hello : NP.say(role, 'greet'));
}

/* ---------- the stat strip under every screen ---------- */
function hud() {
  turnbar();
  var es = GT.effSpeed(S), used = GT.cargoUsed(S), nw = GT.networth(S), h = '';
  h += '<span class="who-mini">' + face(S.char) + '<b>' + esc(S.name) + '</b></span>';
  h += '<span class="chip" title="Credits in your pocket">' + UI.icon('coin') + '<b class="num">' + fmt(S.credits) + 'c</b></span>';
  h += '<span class="chip" title="Deposit minus loan">Bank <b class="num ' + (S.loan ? 'bad' : '') + '">' + fmt(S.bank) + 'c' + (S.loan ? ' / owe ' + fmt(S.loan) + 'c' : '') + '</b></span>';
  h += '<span class="chip" title="Fuel">' + UI.icon('fuel') + bar(S.ship.fuel / S.ship.fuelMax, 'f') + '<b class="num">' + S.ship.fuel + '/' + S.ship.fuelMax + ' PC</b></span>';
  h += '<span class="chip" title="Cargo hold">' + UI.icon('crate') + bar(used / S.ship.cargoMax, '') + '<b class="num">' + used + '/' + S.ship.cargoMax + '</b></span>';
  h += '<span class="chip" title="' + esc(plainText(speedBlurb(es))) + '. Faster ships also move first in multiplayer.">Warp <b class="num">' + es.toFixed(1) + '</b></span>';
  h += '<span class="chip" title="Reputation cuts your tax and tilts luck">' + UI.icon('star') + '<b class="num">' + S.rep + '</b> <span class="dim">' + repLabel(S.rep) + '</span></span>';
  h += '<span class="chip" title="Jumps so far">' + (G.multi ? 'Round' : 'Turn') + ' <b class="num">' + (G.multi ? G.round : S.turn) + '</b></span>';
  h += '<span class="chip" title="Credits plus bank minus loan. Win at ' + fmt(GT.CFG.WIN) + 'c">Worth <b class="num">' + fmt(nw) + 'c</b>' + bar(nw / GT.CFG.WIN, 'w') + '<span class="dim">' + fmt(GT.CFG.WIN) + 'c</span></span>';
  $('stats').innerHTML = h;
}
function turnbar() {
  var el = $('turnbar'); if (!el) return; if (!G || !G.multi) { el.hidden = true; return; }
  var h = '<span class="tb-r">ROUND ' + G.round + '</span>';
  G.order.forEach(function (k, i) { var p = G.players[k], cls = p === S ? 'now' : i < G.cur ? 'done' : ''; h += '<span class="tb-p ' + cls + '" title="' + esc(p.name) + ': worth ' + fmt(GT.networth(p)) + 'c, warp ' + GT.effSpeed(p).toFixed(1) + '"><i>' + (i + 1) + '</i> ' + esc(p.name) + '</span>'; });
  G.players.forEach(function (p) { if (p.over && !p.over.won) h += '<span class="tb-p out" title="Ruined">' + esc(p.name) + ' (out)</span>'; });
  el.innerHTML = h; el.hidden = false;
}
var PAGE_NAMES = { hub: '', market: 'the Market', bank: 'the Bank', yard: 'the Shipyard', fuel: 'the Fuel Dock', cantina: 'the Cantina', alley: 'the Back Alley', office: 'Real Estate', parlour: 'the Parlour of Thin Hours', jobs: 'the Odd Jobs Board', exchange: 'the Stock Exchange', pad: 'the Spaceport', ship: 'Your Ship' };

/* ---------- router ---------- */
var PAGES = {};
function go(page) { ui.page = page; if (page !== 'hub') { var r = { market: 'market', bank: 'bank', yard: 'yard', fuel: 'fuel', cantina: 'cantina', alley: 'alley', office: 'office', parlour: 'parlour', exchange: 'exchange', jobs: 'jobs' }[page]; if (r) greet(r); } SFX.play(page === 'hub' ? 'door' : 'door'); render(); }
function render() {
  if (!S) return;
  var st = $('stage'), old = st.firstElementChild, pg = ui.page, sc = function (e) { return e && (e.querySelector(':scope > .in') || e); }; if (old && ui.lastPage) ui.scroll[ui.lastPage] = sc(old).scrollTop;
  st.innerHTML = (PAGES[pg] || PAGES.hub)();
  var nu = sc(st.firstElementChild); if (nu && ui.scroll[pg] && ui.lastPage === pg) nu.scrollTop = ui.scroll[pg];
  ui.lastPage = pg; hud();
  var p = plan(); $('where').textContent = pg === 'hub' ? p.name + ' · ' + p.type : p.name + (PAGE_NAMES[pg] ? ' · ' + PAGE_NAMES[pg].replace(/^the /, '') : '');
  setSentence(pg === 'hub' ? 'Where to, ' + S.name + '?' : ({ pad: 'Pick a world and press Jump.', ship: 'Looking good, for a heap.' }[pg] || 'Talking to ' + (castOf(pg === 'jobs' ? 'jobs' : pg) || { name: 'nobody in particular' }).name + '.'));
  ui.defSentence = $('sentence').textContent; syncBar();
}
function leave() { go('hub'); }

/* ---------- hub: the street, with the flight log beside it ---------- */
PAGES.hub = function () {
  var p = plan(), t = GT.taxInfo(S, S.loc), night = SC.night();
  var h = '<div class="hub"><div class="scenebox">' + SC.hub(S) + '</div><div class="logbox">';
  h += '<div class="panel pinfo"><div class="row"><h3 class="hd" style="color:' + p.color + '">' + esc(p.name) + '</h3><span class="tax" title="' + esc(GT.discText(t)) + '">Tax ' + (t.rate * 100).toFixed(1) + '%</span></div><div class="dim" style="font-size:12px">' + p.type + ' &middot; say it: ' + esc(p.say) + ' &middot; ' + (night ? 'night' : 'day') + '</div><p style="margin:6px 0 0;font-size:13px">' + esc(p.desc) + '</p></div>';
  h += '<div class="panel lg"><div class="row"><h3 class="hd">Flight log</h3><button class="btn gold" data-act="log">Full log</button></div><div class="log">' + logHTML(14) + '</div></div></div></div>';
  return h;
};

/* ---------- frame shared by every shop page ---------- */
function frame(kind, role, body) {
  var pid = plan().id, c = castOf(role), h = '<div class="loc">' + SC.backdrop(kind, pid) + '<div class="in"><div class="cast">';
  if (c) h += '<div class="card">' + UI.portrait(c) + '<div class="cn">' + esc(c.name) + '</div><div class="cj">' + esc(c.job || c.title || '') + '</div></div>';
  else h += '<div class="card">' + PX.svg('<svg viewBox="0 0 160 160"><rect width="160" height="160" rx="12" fill="#0c0618"/><ellipse cx="58" cy="76" rx="9" ry="13" fill="#ffe14a"/><ellipse cx="102" cy="76" rx="9" ry="13" fill="#ffe14a"/><circle cx="60" cy="79" r="3.5" fill="#000"/><circle cx="104" cy="79" r="3.5" fill="#000"/><path d="M50,112 Q80,128 110,112" fill="none" stroke="#ffe14a" stroke-width="4" stroke-linecap="round"/></svg>', 40, 40, 'portrait', 2, 40) + '<div class="cn">???</div><div class="cj">Something in the dark</div></div>';
  h += '<div class="talk"><button class="btn big blue" data-act="leave" data-label="Walk back to the street">Back to the street</button></div></div>';
  h += '<div class="main"><div class="bubble"><span class="nm">' + esc(c ? c.name : 'Narrator') + '</span><span id="say">' + esc(ui.say[role] || '') + '</span></div>' + body + '</div></div></div>';
  return h;
}
function receipt() { var e = S.log[0]; return e ? '<div class="le ' + e.kind + '" style="margin-top:8px"><span class="tn">[Turn ' + e.turn + ']</span> ' + e.text + '</div>' : ''; }

/* ---------- market ---------- */
function trendHTML(i) {
  if (S.trendHidden[i]) return '<span class="dim" title="No price report for this item today">?</span>';
  var t = GT.trend(S, S.loc, i) * 100;
  return '<span class="' + (t >= 0 ? 'up' : 'dn') + '" title="Price against the item\'s base price of ' + GT.ITEMS[i].base + 'c">' + (t >= 0 ? '&#9650; +' : '&#9660; ') + Math.round(t) + '%</span>';
}
PAGES.market = function () {
  var p = plan(), t = GT.taxInfo(S, S.loc), sg = NP.SIGNS[p.id].market, h = '<div class="panel"><div class="row"><h2 class="hd">' + esc(sg) + '</h2><span class="tax" title="' + esc(GT.discText(t)) + '">Planet tax ' + (t.rate * 100).toFixed(1) + '% <span style="font-size:13px">(base ' + (t.base * 100).toFixed(1) + '%)</span></span></div>';
  h += '<div class="dim" style="font-size:12px;margin-bottom:6px" title="' + esc(GT.discText(t)) + '">Goods are cheap where they are made, so buy on one side of the map and sell on the other. Point at the tax tag for the discount breakdown.</div>';
  h += '<div class="mk-row mk-head"><span></span><span>Goods</span><span>Price</span><span>Stock</span><span>Trend</span><span></span></div>';
  GT.ITEMS.forEach(function (it, i) {
    var q = qtyOf(i), held = S.cargo[i].qty, stock = S.markets[S.loc][i].stock, mx = GT.maxBuy(S, i);
    h += '<div class="mk-row" data-i="' + i + '" data-label="Look at ' + esc(it.name) + ': ' + esc(it.blurb) + '">' + UI.itemIcon(i) + '<span class="nm">' + it.name + '<span class="held">' + (held ? 'You hold ' + held + ' (avg paid ' + S.cargo[i].avg.toFixed(1) + 'c)' : it.blurb) + '</span></span>';
    h += '<span class="num"><b>' + fmt(GT.price(S, S.loc, i)) + 'c</b></span><span class="num dim" title="Units for sale">' + stock + ' left</span>' + trendHTML(i);
    h += '<div class="ctl">' + btn('Buy', 'buy', GT.canBuy(S, i, q)) + btn('Max', 'max', mx > 0, 'gold') + '<input class="qty" type="number" min="1" step="1" value="' + q + '" aria-label="Quantity of ' + it.name + '">' + btn('Sell', 'sell', GT.canSell(S, i, q), 'green') + btn('All', 'all', held > 0, 'green') + '</div></div>';
  });
  return frame('market', 'market', h + receipt() + '</div>');
};

/* ---------- bank ---------- */
PAGES.bank = function () {
  var left = GT.CFG.INTEREST_EVERY - (S.stats.jumps % GT.CFG.INTEREST_EVERY), sg = NP.SIGNS[plan().id].bank;
  var h = '<div class="panel"><h2 class="hd">' + esc(sg) + '</h2><div class="grid2">';
  h += '<div class="panel" style="background:var(--paper)"><div class="dim">Your deposit <span style="font-size:12px">(' + (GT.CFG.DEPOSIT_RATE * 100) + '% interest)</span></div><div style="font:18px var(--display);color:var(--good)" class="num">' + fmt(S.bank) + 'c</div></div>';
  h += '<div class="panel" style="background:var(--paper)"><div class="dim">Your loan <span style="font-size:12px">(' + (GT.CFG.LOAN_RATE * 100) + '% interest)</span></div><div style="font:18px var(--display)" class="num ' + (S.loan ? 'bad' : '') + '">' + fmt(S.loan) + 'c</div></div></div>';
  h += '<div class="dim" style="font-size:12px;margin:8px 0">Interest is added every ' + GT.CFG.INTEREST_EVERY + ' jumps (next in ' + left + '). Loans come in fixed ' + fmt(GT.CFG.LOAN_STEP) + 'c chunks, up to ' + fmt(GT.CFG.LOAN_CAP) + 'c. You carry ' + fmt(S.credits) + 'c.</div>';
  h += '<div class="up-row"><div class="row" style="justify-content:flex-start"><input class="val" id="in-dep" type="number" min="0" step="1" value="' + ui.dep + '" aria-label="Deposit amount"></div>' + btn('Deposit', 'deposit', ui.dep > 0 && ui.dep <= S.credits, 'green') + '</div>';
  h += '<div class="up-row"><div class="row" style="justify-content:flex-start"><input class="val" id="in-wd" type="number" min="0" step="1" value="' + ui.wd + '" aria-label="Withdraw amount"></div>' + btn('Withdraw', 'withdraw', ui.wd > 0 && ui.wd <= S.bank, 'blue') + '</div>';
  h += '<div class="up-row"><span class="dim">Take a fixed loan of ' + fmt(GT.CFG.LOAN_STEP) + 'c</span>' + btn('Take Loan ' + fmt(GT.CFG.LOAN_STEP) + 'c', 'loan', GT.canLoan(S), 'pink') + '</div>';
  h += '<div class="up-row"><div class="row" style="justify-content:flex-start"><input class="val" id="in-rep" type="number" min="0" step="1" value="' + ui.rep + '" aria-label="Repay amount"></div>' + btn('Repay Loan', 'repay', ui.rep > 0 && S.loan > 0 && S.credits > 0, 'gold') + '</div>';
  return frame('bank', 'bank', h + receipt() + '</div>');
};
