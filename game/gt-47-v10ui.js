/* Galactic Trader 10. Part 47: the v10 screens. Quests (the story dialog, the quest log, the hub tracker, contracts and guild notices on the Odd Jobs board),
   the Defence Grid at the shipyard, a straightened market table, flat share quotes, and the end-of-game report: tabbed, one tab per captain, and shown when you abandon a game too. */
var V10 = { tab: 0, qtab: 'story' };

/* ---------- who you are talking to ---------- */
V10.giver = function (key) {
  var g = GT.QGIVERS[key]; if (!g) return null;
  if (g.rival !== undefined) { var r = NP.rival(g.rival); return r; }
  var id = 'q/' + key, t = NP.cache[id];
  if (!t) { t = CH.fromSeed(g.seed, g.over); t.name = g.name; t.job = g.job; t.role = 'captain'; NP.cache[id] = t; }
  return t;
};
V10.ARK = '<svg class="portrait" viewBox="-80 -112 160 262" role="img" aria-label="The Ark"><defs><radialGradient id="arkg" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#fff6c8"/><stop offset=".35" stop-color="#6fe3ff"/><stop offset="1" stop-color="#05060e"/></radialGradient></defs><rect x="-80" y="-112" width="160" height="262" fill="#05060e"/><circle cx="0" cy="10" r="90" fill="url(#arkg)" opacity=".55"/>' +
  [0, 1, 2, 3, 4, 5].map(function (k) { var a = k * Math.PI / 3; return '<ellipse cx="0" cy="10" rx="64" ry="18" fill="none" stroke="#9af0ff" stroke-width="2" opacity=".55" transform="rotate(' + (a * 57.3).toFixed(0) + ' 0 10)"/>'; }).join('') +
  '<circle cx="0" cy="10" r="22" fill="#fff6c8"/><circle cx="0" cy="10" r="12" fill="#ffe27a"/><path d="M-60,120 L0,80 L60,120Z" fill="#1c2434" stroke="#6fe3ff" stroke-width="2"/></svg>';
V10.portraitOf = function (key) { return key === 'ark' ? V10.ARK : UI.portrait(V10.giver(key)); };

/* ---------- the story dialog ---------- */
function questModal() {
  var Q = S.quests.main, ch = GT.MAIN[Q.ch]; if (!ch) return;
  var g = GT.QGIVERS[ch.who], h = '<div class="qdlg"><div class="qport"><div class="qpic">' + V10.portraitOf(ch.who) + '</div><div class="cn">' + esc(g.name) + '</div><div class="cj">' + esc(g.job) + '</div></div><div class="qbody">';
  h += '<div class="qkick">THE NINTH LANE &middot; CHAPTER ' + (Q.ch + 1) + ' OF ' + GT.MAIN.length + '</div><h2 class="qt">' + esc(ch.title) + '</h2><p class="qscene">' + ch.scene(S, Q) + '</p><div class="qch">';
  ch.choices.forEach(function (c) {
    var ok = GT.choiceReq(S, c), note = GT.choiceNote(S, c);
    h += '<button class="qc" data-act="qpick-' + c.id + '"' + (ok === true ? '' : ' disabled') + '><b>' + esc(c.label) + '</b>' + (note ? '<span>' + esc(note) + '</span>' : '') + (ok === true ? '' : '<i>' + esc(ok) + '</i>') + '</button>';
  });
  h += '</div><div class="row qfoot"><span class="dim">You can come back to this from the QUESTS button while you are docked here.</span><button class="btn blue" data-act="qlater">Not now</button></div></div></div>';
  openModal(h, true); PX.hydrate($('modal')); $('modal').classList.add('qmodal');
}
V10.snoozed = function () { return ui.qSnooze === S.turn + '/' + S.loc + '/' + S.seat; };
var baseSettle = settle;
settle = function () {
  baseSettle();
  if (S && !S.over && !(G && G.over) && S.questPrompt && !S.pending && $('modal').hidden && $('mg').hidden && $('flight').hidden && $('pass').hidden && !V10.snoozed()) { SFX.play('door'); questModal(); }
};
var baseClose = closeModal;
closeModal = function () { $('modal').classList.remove('qmodal'); baseClose(); };

/* ---------- the quest log ---------- */
function questLog() {
  var Q = S.quests, t = V10.qtab, h = '<div class="row"><h2>Quests</h2><button class="btn" data-act="close">Close</button></div><div class="tabs">';
  [['story', 'The Ninth Lane'], ['jobs', 'Jobs (' + (GT.contractsActive ? GT.contractsActive(S).length : Q.active.length) + '/' + GT.CONTRACT_MAX + (GT.guildActive && GT.guildActive(S) ? ' + guild' : '') + ')'], ['guild', 'Guild notices'], ['done', 'Finished (' + Q.done.length + ')']].forEach(function (x) { h += '<button class="tab' + (t === x[0] ? ' on' : '') + '" data-act="qtab-' + x[0] + '">' + x[1] + '</button>'; });
  h += '</div><div class="tabbody">';
  if (t === 'story') {
    var M = Q.main, goal = GT.mainGoal(S);
    h += '<p class="dim" style="margin:0 0 8px">A hidden hyperlane, a Precursor Ark, and a prize no shipyard sells. Seven chapters across the sector. Your choices change what happens.</p><ol class="qchap">';
    GT.MAIN.forEach(function (c, k) {
      var past = M.hist.filter(function (x) { return x.ch === k; })[0], cur = M.state !== 'done' && k === M.ch;
      h += '<li class="' + (past ? 'past' : cur ? 'cur' : 'future') + '"><b>' + (past || cur ? esc(c.title) : '???') + '</b>' + (past ? ' <span class="dim">turn ' + past.turn + ': ' + esc(past.pick) + '</span>' : '') + (cur ? '<div class="qgoal">' + c.goal(S, M) + (c.where >= 0 ? ' <span class="amber">(' + esc(GT.PLANETS[c.where].name) + ')</span>' : '') + (GT.mainHere(S) ? '<div><button class="btn pink" data-act="qtalk">Talk now</button></div>' : '') + '</div>' : '') + '</li>';
    });
    h += '</ol>' + (S.ship.relics && S.ship.relics.length ? '<p><b>Ship parts earned:</b> ' + S.ship.relics.map(function (r) { return esc(GT.RELICS[r].name); }).join(', ') + '</p>' : '');
  } else if (t === 'jobs') {
    if (!Q.active.length) h += '<p class="dim">No jobs on the go. Contracts are posted on every world\'s Odd Jobs board.</p>';
    Q.active.forEach(function (c) { h += V10.jobCard(c, true); });
  } else if (t === 'guild') {
    h += '<p class="dim" style="margin:0 0 8px">One-time quests that open up as your reputation grows (or sinks). Accept them on any Odd Jobs board. Your reputation is <b>' + S.rep + '</b> (' + repLabel(S.rep) + ').</p>';
    GT.REPQ.forEach(function (q) { h += V10.repCard(q, false); });
  } else {
    if (!Q.done.length) h += '<p class="dim">Nothing finished yet.</p>';
    h += '<ul class="qdone">' + Q.done.slice(0, 40).map(function (d) { return '<li class="' + (d.ok ? 'good' : 'bad') + '">' + (d.ok ? '&#10003; ' : '&#10007; ') + esc(d.title) + ' <span class="dim">turn ' + d.turn + '</span></li>'; }).join('') + '</ul>';
  }
  openModal(h + '</div>', true);
}
V10.where = function (c) { return c.to >= 0 ? GT.PLANETS[c.to].name : 'all seven worlds'; };
V10.jobCard = function (c, mine) {
  var left = c.due - S.turn, kindName = { haul: 'Haul', parcel: 'Courier', shares: 'Shareholder', survey: 'Survey', fuel: 'Fuel run', envoy: 'Envoy', tour: 'Grand tour' }[c.kind] || 'Job';
  var prog = '';
  if (mine) {
    if (c.kind === 'haul') prog = 'In your hold: <b>' + Math.min(S.cargo[c.item].qty, c.qty) + ' / ' + c.qty + '</b> ' + GT.ITEMS[c.item].name;
    else if (c.kind === 'shares') prog = 'You hold <b>' + Math.min(S.stocks[c.stock].qty, c.n) + ' / ' + c.n + '</b> ' + GT.STOCKS[c.stock].tick;
    else if (c.kind === 'fuel') prog = 'Fuel: <b>' + S.ship.fuel + '</b> PC (deliver ' + c.pc + ' after landing)';
    else if (c.kind === 'tour') prog = 'Visited <b>' + Object.keys(c.seen).length + ' / 7</b>';
    else if (c.kind === 'envoy') prog = 'Next seal: <b>' + esc(GT.PLANETS[c.legs[c.leg]].name) + '</b>';
    else if (c.kind === 'parcel') prog = 'Parcel aboard (' + c.units + ' hold space)';
  }
  var h = '<div class="qjob' + (c.repq ? ' rq' : '') + '"><div class="row"><b class="qk">' + kindName + '</b><b class="qj">' + esc(c.title) + '</b><span class="tax">' + fmt(c.pay) + 'c</span></div><div class="qtx">' + esc(c.text) + '</div>';
  h += '<div class="row qmeta"><span class="dim">To <b>' + esc(V10.where(c)) + '</b> &middot; due turn ' + c.due + (mine ? ' (' + (left >= 0 ? left + ' left' : 'late') + ')' : ' (' + (c.due - S.turn) + ' turns)') + '</span>' + (prog ? '<span>' + prog + '</span>' : '');
  if (mine) h += '<button class="btn" data-act="qdrop-' + c.id + '" data-label="Give up this job (-2 reputation)">Give up</button>';
  else { var ok = GT.canAccept(S, c); h += (ok === true ? '' : '<span class="bad">' + esc(ok) + '</span>') + btn('Accept', 'qtake-' + c.id, ok === true, 'green'); }
  return h + '</div></div>';
};
V10.repCard = function (q, board) {
  var st = GT.repQuestState(S, q), lock = st === 'locked', need = q.min !== undefined ? 'Needs ' + q.min + '+ reputation' : 'Needs ' + q.max + ' or lower reputation';
  var h = '<div class="qjob rq ' + st + '"><div class="row"><b class="qk">' + (q.max !== undefined ? 'Syndicate' : 'Guild') + '</b><b class="qj">' + esc(q.title) + '</b><span class="tax">' + ({ locked: '&#128274; ' + need, open: 'Open', active: 'In progress', done: '&#10003; Done', failed: 'Failed' }[st]) + '</span></div><div class="qtx"><b>' + esc(q.who) + ':</b> ' + esc(q.blurb) + '</div>';
  if (board && st === 'open') { var gq = GT.guildActive ? GT.guildActive(S) : null; h += '<div class="row qmeta"><span class="dim">' + (gq ? 'Finish <b>' + esc(gq.title) + '</b> first: one guild quest at a time.' : 'A one-time job with a lasting reward. It has its own slot and does not use a contract slot.') + '</span>' + btn('Accept', 'qrep-' + q.id, !gq, 'green') + '</div>'; }
  return h + '</div>';
};

/* ---------- the hub tracker ---------- */
V10.tracker = function () {
  if (!S.quests) return '';
  var g = GT.mainGoal(S), Q = S.quests, h = '<div class="panel qtrack"><div class="row"><h3 class="hd">Quests</h3><button class="btn gold" data-act="quests">Open</button></div>';
  if (g && g.state !== 'waiting') h += '<div class="qline main"><b>' + esc(g.title) + '</b> ' + (GT.mainHere(S) ? '<button class="btn pink" data-act="qtalk">Talk</button>' : '<span class="dim">' + (g.where >= 0 ? '&rarr; ' + esc(GT.PLANETS[g.where].name) : '') + '</span>') + '</div>';
  else if (g) h += '<div class="qline dim">Someone in a cantina is asking about you...</div>';
  else h += '<div class="qline good">The Ninth Lane: complete.</div>';
  Q.active.slice(0, 3).forEach(function (c) { var left = c.due - S.turn; h += '<div class="qline"><span>' + esc(c.title) + '</span><span class="' + (left <= 1 ? 'bad' : 'dim') + '">' + (left >= 0 ? left + 't' : 'late') + '</span></div>'; });
  if (!Q.active.length) h += '<div class="qline dim">No jobs. Try the Odd Jobs board.</div>';
  return h + '</div>';
};
var baseHub = PAGES.hub;
PAGES.hub = function () { return baseHub().replace('<div class="panel lg">', V10.tracker() + '<div class="panel lg">'); };

/* ---------- the Odd Jobs board: the arcade job, plus contracts and guild notices ---------- */
var baseJobs = PAGES.jobs;
PAGES.jobs = function () {
  var h = baseJobs(), offers = GT.contractOffers(S), Q = S.quests;
  var x = '<div class="panel qboard"><div class="qcol"><div class="row"><h2 class="hd">Contracts</h2><span class="dim">' + (GT.contractsActive ? GT.contractsActive(S).length : Q.active.length) + ' of ' + GT.CONTRACT_MAX + ' contracts on the go</span></div>';
  if (!offers.some(function (c) { return !c.taken; })) x += '<p class="dim">No more contracts posted today. New ones go up whenever you land.</p>';
  offers.forEach(function (c) { if (!c.taken) x += V10.jobCard(c, false); });
  var open = GT.REPQ.filter(function (q) { var st = GT.repQuestState(S, q); return st !== 'done' && st !== 'failed'; });
  x += '</div><div class="qcol"><h3 class="hd">Guild notices</h3>';
  open.forEach(function (q) { x += V10.repCard(q, true); });
  x += '</div></div>';
  /* the board sits under the arcade job, inside the page's main column */
  var at = h.lastIndexOf('</div></div></div>');
  return at > 0 ? h.slice(0, at) + x + h.slice(at) : h + x;
};

/* ---------- the shipyard: the Defence Grid ---------- */
var baseYard = PAGES.yard;
PAGES.yard = function () {
  var h = baseYard(), k = 'shield', u = GT.UPGRADES[k], lv = S.ship.lv.shield || 0, p = plan(), avail = GT.upgradeAvail(S, k), maxed = lv >= u.max, cost = GT.upgradeCost(S, k);
  var lab = p.upgrades.indexOf(k) < 0 ? 'Not sold here' : maxed ? 'Maxed out' : fmt(cost) + 'c';
  var row = '<div class="up-row shieldrow"><div><span class="nm" style="font:10px var(--display)">' + u.name + '</span> <span class="dim">Level ' + lv + ' of ' + u.max + (lv ? ': ' + GT.SHIELD_NAMES[lv] : '') + '</span><div class="dim" style="font-size:13px">Turns aside ' + Math.round(GT.SHIELD[Math.min(u.max, lv + (maxed ? 0 : 1))] * 100) + '% of pirates, hazards and other trouble on the lanes' + (maxed ? '' : ' after the upgrade') + (lv ? ' (now ' + Math.round(GT.SHIELD[lv] * 100) + '%)' : '') + '</div>' + bar(lv / u.max) + '</div>' + btn(lab, 'up-shield', avail && cost <= S.credits, 'green') + '</div>';
  return h.replace('<div class="row" style="margin-top:4px;align-items:center">', row + '<div class="row yardship" style="margin-top:4px;align-items:center">');
};

/* ---------- the market table: one grid for the header and every row, so the headings sit over their columns ---------- */
PAGES.market = function () {
  var p = plan(), t = GT.taxInfo(S, S.loc), sg = NP.SIGNS[p.id].market, h = '<div class="panel mk10"><div class="row"><h2 class="hd">' + esc(sg) + '</h2><span class="tax" title="' + esc(GT.discText(t)) + '">Planet tax ' + (t.rate * 100).toFixed(1) + '% <span style="font-size:13px">(base ' + (t.base * 100).toFixed(1) + '%)</span></span></div>';
  h += '<div class="dim" style="font-size:12px;margin-bottom:6px" title="' + esc(GT.discText(t)) + '">Goods are cheap where they are made and dear where they are not. A world that imports something always pays a fair price, and sometimes a fortune. Point at the tax tag for the discount breakdown.</div>';
  h += '<div class="mkt"><div class="mk-row mk-head"><span></span><span>Goods</span><span class="r">Price</span><span class="r">Stock</span><span class="r">Trend</span><span class="c">Buy</span><span class="c">Qty</span><span class="c">Sell</span></div>';
  GT.ITEMS.forEach(function (it, i) {
    var q = qtyOf(i), held = S.cargo[i].qty, stock = S.markets[S.loc][i].stock, mx = GT.maxBuy(S, i), role = GT.roleOf(S.loc, i);
    var tag = role > 0 ? '<i class="mtag imp" title="This world imports it: it always pays well here">pays well</i>' : role < 0 ? '<i class="mtag prod" title="This world makes it: cheap here">made here</i>' : '';
    h += '<div class="mk-row" data-i="' + i + '" data-label="Look at ' + esc(it.name) + ': ' + esc(it.blurb) + '">' + UI.itemIcon(i) + '<span class="nm">' + it.name + tag + '<span class="held">' + (held ? 'You hold ' + held + ' (avg paid ' + S.cargo[i].avg.toFixed(1) + 'c)' : it.blurb) + '</span></span>';
    h += '<span class="num r"><b>' + fmt(GT.price(S, S.loc, i)) + 'c</b></span><span class="num dim r" title="Units for sale">' + stock + '</span><span class="r tr">' + trendHTML(i) + '</span>';
    h += '<span class="c bb">' + btn('Buy', 'buy', GT.canBuy(S, i, q)) + btn('Max', 'max', mx > 0, 'gold') + '</span><span class="c"><input class="qty" type="number" min="1" step="1" value="' + q + '" aria-label="Quantity of ' + it.name + '"></span><span class="c bb">' + btn('Sell', 'sell', GT.canSell(S, i, q), 'green') + btn('All', 'all', held > 0, 'green') + '</span></div>';
  });
  return frame('market', 'market', h + '</div>' + receipt() + '</div>');
};

/* ---------- the exchange: say what the fees are now ---------- */
var baseXch = PAGES.exchange;
PAGES.exchange = function () {
  return baseXch().replace(/Fee <b>[^<]*<\/b> each way/, 'No fee to buy, <b>' + (GT.CFG.STOCK_FEE_SELL * 100).toFixed(1) + '%</b> to sell').replace('Shares count toward net worth like a deposit, but prices can fall.', 'Your own trades never move a share price. Prices follow trade in each company\'s goods (every crate of them bought anywhere is a sale for the company), shortages and gluts on the lanes, and company news. Shares count toward net worth, grow over time, and can fall.');
};

/* ---------- the ship page: show the Defence Grid and any story parts ---------- */
var baseShip = PAGES.ship;
PAGES.ship = function () {
  var h = baseShip(), lv = GT.shieldLevel(S), rel = (S.ship.relics || []).map(function (r) { return '<li><b>' + esc(GT.RELICS[r].name) + '</b> <span class="dim">' + esc(GT.RELICS[r].blurb) + '</span></li>'; }).join('');
  var x = '<div class="panel defp"><h3 class="hd">Defence &amp; parts</h3><div>Defence Grid <b>level ' + lv + '</b>' + (lv ? ' (' + esc(GT.SHIELD_NAMES[lv]) + ')' : '') + bar(lv / 3) + '<div class="dim" style="font-size:13px">' + (lv ? 'Turns aside ' + Math.round(GT.SHIELD[lv] * 100) + '% of the trouble on the lanes. Stopped ' + (S.stats.shielded || 0) + ' so far.' : 'None fitted. Shipyards sell one.') + '</div></div>' + (rel ? '<ul class="relics">' + rel + '</ul>' : '') + '</div>';
  return h.replace('<div class="panel spdp">', x + '<div class="panel spdp">');
};

/* ---------- actions ---------- */
ACTX.push(function (a, el) {
  if (a === 'qtalk') { closeModal(); if (GT.mainHere(S)) { S.questPrompt = { kind: 'main', ch: S.quests.main.ch }; ui.qSnooze = null; questModal(); } return true; }
  if (a === 'qlater') { ui.qSnooze = S.turn + '/' + S.loc + '/' + S.seat; closeModal(); return true; }
  if (a.indexOf('qpick-') === 0) {
    var r = GT.mainChoose(S, a.slice(6)); closeModal();
    if (r) { SFX.play('win'); var e = S.log.filter(function (x) { return /The Ninth Lane, chapter/.test(x.text); })[0]; notice('<div class="qres"><div class="qkick">THE NINTH LANE</div><div class="le gain" style="font-size:16px">' + (e ? e.text : r.text) + '</div>' + (r.next && !S.questPrompt ? '<p class="qnext"><b>Next:</b> ' + r.next.goal(S, S.quests.main) + '</p>' : '') + '</div>', function () { render(); settle(); }); }
    return true;
  }
  if (a.indexOf('qtake-') === 0) { var id = a.slice(6), c = (S.visit.contracts || []).filter(function (x) { return x.id === id; })[0]; if (GT.acceptContract(S, c)) { SFX.play('coin'); speak('jobs', 'Signed, stamped, and probably legal. Off you go.'); } return true; }
  if (a.indexOf('qrep-') === 0) { if (GT.acceptRepQuest(S, a.slice(5))) { SFX.play('win'); speak('jobs', 'The guild has its eye on you. Do not make it blink.'); } return true; }
  if (a.indexOf('qdrop-') === 0) { GT.dropContract(S, a.slice(6)); SFX.play('bad'); if (!$('modal').hidden) questLog(); return true; }
  if (a.indexOf('qtab-') === 0) { V10.qtab = a.slice(5); questLog(); return true; }
  if (a === 'quests') { questLog(); return true; }
  return false;
});

/* ---------- the end-of-game report: one tab per captain ---------- */
V10.report = function (P) {
  var st = P.stats, h = '', o = P.over, why = o ? o.why : (G.over && G.over.abandoned ? 'Voyage abandoned while still trading, worth ' + fmt(GT.networth(P)) + ' credits.' : 'Still trading when the race ended, worth ' + fmt(GT.networth(P)) + ' credits.');
  h += '<div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div style="width:110px;flex:none">' + UI.portrait(P.char) + '</div><p><b>' + esc(P.name) + '</b>, ' + esc(P.char.title) + (P.char.honour ? ', <b class="amber">' + esc(P.char.honour) + '</b>' : '') + ', after <b>' + st.jumps + ' jumps</b>. ' + esc(why) + '</p></div>';
  var tb = 0, ts = 0, sp = 0, er = 0;
  h += '<h4>Goods traded</h4><div style="overflow-x:auto"><table><tr><th>Item</th><th class="r">Bought</th><th class="r">Spent</th><th class="r">Sold</th><th class="r">Earned</th></tr>';
  GT.ITEMS.forEach(function (it, i) { tb += st.bought[i]; ts += st.sold[i]; sp += st.spent[i]; er += st.earned[i]; h += '<tr><td>' + it.name + '</td><td class="r">' + st.bought[i] + '</td><td class="r">' + fmt(st.spent[i]) + 'c</td><td class="r">' + st.sold[i] + '</td><td class="r">' + fmt(st.earned[i]) + 'c</td></tr>'; });
  h += '<tr><td><b>Total</b></td><td class="r"><b>' + tb + '</b></td><td class="r"><b>' + fmt(sp) + 'c</b></td><td class="r"><b>' + ts + '</b></td><td class="r"><b>' + fmt(er) + 'c</b></td></tr></table></div>';
  function r(a, b, cls) { return '<div class="row"><span class="dim">' + a + '</span><b class="num ' + (cls || '') + '">' + b + '</b></div>'; }
  var M = P.quests ? P.quests.main : null, chaps = M ? (M.state === 'done' ? GT.MAIN.length : M.hist.length) : 0;
  h += '<div class="cols2"><div><h4>Money</h4>' + r('Final net worth', fmt(GT.networth(P)) + 'c') + r('Peak net worth', fmt(st.peak) + 'c') + r('Tax paid', fmt(st.tax) + 'c') + r('Tax saved by reputation', fmt(st.taxSavedRep) + 'c', 'good') + r('Tax saved by property', fmt(st.taxSavedFac) + 'c', 'good') + r('Broker price edge', fmt(st.brokerEdge) + 'c', 'good') + r('Gained from events', fmt(st.eventGain) + 'c', 'good') + r('Lost to events', fmt(st.eventLoss) + 'c', 'bad') + r('Bank interest earned', fmt(st.interestEarned) + 'c', 'good') + r('Loan interest paid', fmt(st.interestPaid) + 'c', 'bad') + r('Property fees collected', fmt(st.feeIncome) + 'c', 'good') + r('Odd job earnings', fmt(st.jobGain) + 'c', 'good') + r('Quest earnings', fmt(st.questGain || 0) + 'c', 'good') + r('Wages paid', fmt(P.wage ? P.wage.total : 0) + 'c', 'bad') + r('Gambling net', (st.gambleNet >= 0 ? '+' : '-') + fmt(Math.abs(st.gambleNet)) + 'c', st.gambleNet >= 0 ? 'good' : 'bad') + '</div>' +
    '<div><h4>Journey</h4>' + r('Jumps made', st.jumps) + r('Days waited in port', st.waits || 0) + r('Events met on the road', st.events) + r('Trouble stopped by the Defence Grid', st.shielded || 0) + r('Hazards outrun', st.evaded || 0) + r('Story chapters', chaps + ' of ' + GT.MAIN.length) + r('Contracts done', (st.contracts || 0) + ' (' + (st.contractsFailed || 0) + ' failed)') + r('Guild quests done', st.repQuests || 0) + r('Worlds explored', st.explores) + r('Encounters sought', st.encounters) + r('Odd jobs done', st.jobs + ' (' + st.jobGold + ' Gold)') + r('Fuel bought', st.fuelBought + ' PC for ' + fmt(st.fuelSpent) + 'c') + r('Property bought', st.facilitiesBought + ' (' + GT.facCount(P) + ' kept)') + r('Spent on ship upgrades', fmt(st.upgradesSpent) + 'c') + r('Reputation', P.rep + ' now, peak ' + st.repPeak + ', low ' + st.repLow) + '</div></div>';
  return h + PORT.stats(P);
};
endModal = function (seat) {
  var G0 = G, win = G0.over || {}, abandoned = !!win.abandoned, players = G0.players;
  if (seat === undefined) seat = abandoned ? (S ? S.seat : 0) : (win.winner >= 0 ? win.winner : S.seat);
  V10.tab = seat;
  var top = win.winner >= 0 ? players[win.winner] : null, P = players[seat], o = P.over, h = '';
  if (abandoned) h += '<h2 class="lose">Voyage abandoned</h2><p class="dim" style="margin:0 0 6px">You stop the clock after ' + (G0.multi ? G0.round + ' rounds' : S.turn + ' turns') + '. Here is how ' + (G0.multi ? 'every captain' : 'you') + ' did.</p>';
  else if (G0.multi) h += '<h2 class="' + (top ? 'win' : 'lose') + '">' + (top ? esc(top.name) + ' wins the race!' : 'Everyone is ruined!') + '</h2><p class="dim" style="margin:0 0 6px">' + (top ? 'After ' + win.round + ' rounds, ' + esc(top.name) + ' finished richest and reached the target of ' + fmt(G0.target) + 'c.' : 'Nobody has a credit or a crate left. The cantinas are very quiet.') + '</p>';
  else h += '<h2 class="' + (o && o.won ? 'win' : 'lose') + '">' + (o && o.won ? 'You made your fortune!' : 'You are ruined!') + '</h2>' + (o ? '<p class="dim" style="margin:0 0 6px"><i>' + (o.won ? 'The ' + esc(P.char.title) + ' is now insufferable at parties.' : 'The ' + esc(P.char.title) + ' will be remembered, mostly as a warning.') + '</i></p>' : '');
  if (G0.multi) {
    h += '<table class="stand"><tr><th>#</th><th>Captain</th><th>Ship</th><th class="r">Jumps</th><th class="r">Worth</th></tr>';
    GT.standings(G0).forEach(function (p, k) { var sh = GT.SHIPS.filter(function (x) { return x.id === p.shipId; })[0]; h += '<tr class="' + (p.seat === seat ? 'me' : '') + '"><td>' + (k + 1) + '</td><td>' + esc(p.name) + (top && p === top ? ' &#9733;' : '') + (p.over && !p.over.won ? ' <span class="bad">ruined</span>' : '') + '</td><td>' + esc(sh.name) + '</td><td class="r">' + p.stats.jumps + '</td><td class="r">' + fmt(GT.networth(p)) + 'c</td></tr>'; });
    h += '</table>';
  }
  h += '<div class="tabs endtabs">' + players.map(function (p, k) { return '<button class="tab' + (k === seat ? ' on' : '') + '" data-act="endp-' + k + '">' + esc(p.name) + (top && p === top ? ' &#9733;' : '') + '</button>'; }).join('') + '</div><div class="tabbody">' + V10.report(P) + '</div>';
  var acts = abandoned ? '<button class="btn blue" data-act="unabandon">Back to the voyage</button><button class="btn pink" data-act="new">Start a new game</button>' : '<button class="btn blue" data-act="close">Look around</button><button class="btn pink" data-act="new">Play again</button>';
  openModal(h + '<div class="row" style="justify-content:flex-end">' + acts + '</div>', true); PX.hydrate($('modal'));
};
/* NEW during a game: the report first, then the start screen */
V10.abandon = function () {
  if (!G) return; G.over = { abandoned: true, winner: -1, round: G.round }; ui.endShown = true; V10.tab = S ? S.seat : 0; SFX.play('lose'); endModal(V10.tab);
};
ACTX.push(function (a) {
  if (a === 'unabandon') { if (G && G.over && G.over.abandoned) { G.over = null; ui.endShown = false; } closeModal(); return true; }
  return false;
});
/* 'new' and 'unabandon' are handled before the game-over guard in act(), so they work while the report is up */
var baseAct = act;
act = function (a, el) {
  if (a === 'new' && S && G && !G.over && el && el.dataset.sure) { V10.abandon(); return; }
  if (a === 'unabandon') { if (G && G.over && G.over.abandoned) { G.over = null; ui.endShown = false; } closeModal(); render(); return; }
  if (a.indexOf('endp-') === 0) { endModal(+a.slice(5)); return; }
  return baseAct(a, el);
};
/* Escape on the abandon report means "never mind" */
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && G && G.over && G.over.abandoned && !$('modal').hidden) { e.stopImmediatePropagation(); G.over = null; ui.endShown = false; closeModal(); render(); } }, true);
/* ---------- How to play: the v10 additions ---------- */
var baseInfo = infoHTML;
infoHTML = function () {
  var v10 = '<h4>Quests</h4><p><b>The Ninth Lane</b> is a seven-chapter story that starts in a cantina from turn 4. Each chapter happens on a named world and ends with a choice; some choices need cargo, shares, fuel, reputation or a fast ship, and what you pick changes later chapters. The prize is a ship part no shipyard sells. <b>Contracts</b> on every Odd Jobs board pay for hauling goods, carrying parcels, holding shares, surveying worlds and running fuel; you can hold three at once, and deliveries happen by themselves when you land. <b>Guild notices</b> open up as your reputation rises (or, for the Syndicate, sinks) and each gives a lasting reward. The QUESTS button shows everything.</p>' +
    '<h4>The Defence Grid</h4><p>Sold at shipyards in three levels. It turns aside about 45%, 70% or 90% of the trouble on the lanes: pirates, hazards, fines and the rest.</p>' +
    '<h4>Markets and shares</h4><p>A world that imports something (marked <b>pays well</b> in its market) always pays a fair price for it and now and then a fortune; rumours tell you when. Your own share trades never move a share price: prices follow trade in each company\'s goods, shortages and gluts, and company news. No fee to buy, half a per cent to sell.</p>';
  return baseInfo().replace(/(<div class="row" style="justify-content:flex-end"><button class="btn" data-act="close">Got it<\/button><\/div>)$/, v10 + '$1');
};
