/* Galactic Trader. Part 9a: rendering the four columns. */
var S = null;
var ui = { ship: 'wayfarer', name: '', qty: {}, dep: 0, wd: 0, rep: 0, dest: null, more: 0, tab: 'c1', cache: {} };
var $ = function (id) { return document.getElementById(id); };
var esc = GT.esc, fmt = GT.fmt;

function btn(label, act, ok, extra) { return '<button class="btn ' + (extra || '') + '" data-act="' + act + '"' + (ok && !(S && S.over) ? '' : ' disabled') + '>' + label + '</button>'; }
function bar(frac, cls) { return '<span class="bar"><i class="' + (cls || '') + '" style="width:' + Math.round(Math.max(0, Math.min(1, frac)) * 100) + '%"></i></span>'; }
function repLabel(r) { return r >= 75 ? 'Legend' : r >= 40 ? 'Respected' : r >= 10 ? 'Known' : r > -10 ? 'Unknown' : r > -30 ? 'Suspect' : 'Notorious'; }
function qtyOf(i) { return Math.max(1, ui.qty[i] || 1); }

function renderCol1() {
  var sh = GT.SHIPS.filter(function (x) { return x.id === S.shipId; })[0], es = GT.effSpeed(S), used = GT.cargoUsed(S), h = '';
  h += '<div class="sec"><div class="pname">' + esc(S.name) + '</div><div class="dim">Captain of the ' + esc(sh.name) + '</div><div class="shipart">' + UI.shipSVG(sh.id, sh.hue) + '</div></div>';
  h += '<div class="sec"><h3>Ship status</h3><div class="card"><div class="stat">';
  h += '<span>Credits</span><span class="big">' + fmt(S.credits) + 'c</span>';
  h += '<span>Reputation</span><span class="num"><b>' + S.rep + '</b> <span class="dim">' + repLabel(S.rep) + '</span></span>';
  h += '<span>Cargo hold</span><span class="num">' + used + ' / ' + S.ship.cargoMax + '</span>' + bar(used / S.ship.cargoMax);
  h += '<span>Fuel</span><span class="num">' + S.ship.fuel + ' / ' + S.ship.fuelMax + ' PC</span>' + bar(S.ship.fuel / S.ship.fuelMax, 'f');
  h += '<span>Engine speed</span><span class="num">Warp ' + es.toFixed(1) + (es < S.ship.speed ? ' <span class="bad">(damaged, base ' + S.ship.speed.toFixed(1) + ')</span>' : '') + '</span>';
  h += '</div></div></div>';
  h += '<div class="sec"><h3>Cargo hold</h3><div class="card"><div class="cargo"><span class="dim">Item</span><span class="dim r">Units</span><span class="dim r">Avg paid</span>';
  var any = false;
  S.cargo.forEach(function (c, i) { if (c.qty) { any = true; h += '<span>' + GT.ITEMS[i].name + '</span><span class="num">' + c.qty + '</span><span class="num">' + (c.avg ? c.avg.toFixed(1) + 'c' : 'free') + '</span>'; } });
  if (!any) h += '<span class="dim" style="grid-column:1/-1">The hold is empty.</span>';
  h += '</div></div></div>';
  h += '<div class="sec"><h3>Ship upgrades</h3><div class="card upg">';
  ['cargo', 'speed', 'fuel'].forEach(function (k) {
    var u = GT.UPGRADES[k], lv = S.ship.lv[k], avail = GT.upgradeAvail(S, k), maxed = lv >= GT.CFG.UPGRADE_MAX, cost = GT.upgradeCost(S, k);
    var lab = GT.PLANETS[S.loc].upgrades.indexOf(k) < 0 ? 'Not offered here' : maxed ? 'Maxed' : fmt(cost) + 'c';
    h += '<span><b>' + u.name + '</b> <span class="dim">Lv ' + lv + '/' + GT.CFG.UPGRADE_MAX + '</span><br><span class="dim">' + u.label + '</span></span>' + btn(lab, 'up-' + k, avail && cost <= S.credits, 'alt');
  });
  h += '</div></div>';
  h += '<div class="sec"><h3>Bank</h3><div class="card" style="display:flex;flex-direction:column;gap:8px">';
  h += '<div class="row"><span>Deposit <span class="dim">(' + (GT.CFG.DEPOSIT_RATE * 100) + '% interest)</span></span><b class="num">' + fmt(S.bank) + 'c</b></div>';
  h += '<div class="row"><span>Loan <span class="dim">(' + (GT.CFG.LOAN_RATE * 100) + '% interest)</span></span><b class="num ' + (S.loan ? 'bad' : '') + '">' + fmt(S.loan) + 'c</b></div>';
  h += '<div class="row"><input class="val" id="in-dep" type="number" min="0" step="1" value="' + ui.dep + '" aria-label="Deposit amount">' + btn('Deposit', 'deposit', ui.dep > 0 && ui.dep <= S.credits) + '</div>';
  h += '<div class="row"><input class="val" id="in-wd" type="number" min="0" step="1" value="' + ui.wd + '" aria-label="Withdraw amount">' + btn('Withdraw', 'withdraw', ui.wd > 0 && ui.wd <= S.bank) + '</div>';
  h += '<div class="row"><span class="dim">Fixed amount</span>' + btn('Take Loan ' + fmt(GT.CFG.LOAN_STEP) + 'c', 'loan', GT.canLoan(S)) + '</div>';
  h += '<div class="row"><input class="val" id="in-rep" type="number" min="0" step="1" value="' + ui.rep + '" aria-label="Repay amount">' + btn('Repay Loan', 'repay', ui.rep > 0 && S.loan > 0 && S.credits > 0) + '</div>';
  h += '<div class="dim" style="font-size:11px">Interest is added every ' + GT.CFG.INTEREST_EVERY + ' jumps. Loans are capped at ' + fmt(GT.CFG.LOAN_CAP) + 'c.</div></div></div>';
  return h;
}

function trendHTML(i) {
  if (S.trendHidden[i]) return '<span class="dim" title="No price report for this item today">?</span>';
  var t = GT.trend(S, S.loc, i) * 100;
  return '<span class="' + (t >= 0 ? 'up' : 'dn') + '" title="Price against the item\'s base price of ' + GT.ITEMS[i].base + 'c">' + (t >= 0 ? '▲ +' : '▼ ') + Math.round(t) + '%</span>';
}

function renderCol2() {
  var p = GT.PLANETS[S.loc], h = '', t = GT.taxInfo(S, S.loc), v = S.visit;
  h += '<div class="planetart"><canvas id="pc" role="img" aria-label="' + esc(p.name) + ', a ' + p.type.toLowerCase() + ' world"></canvas><div class="tag"><div class="pname">' + esc(p.name) + '</div><div class="say">' + esc(p.say) + ' &middot; ' + p.type + '</div></div></div>';
  h += '<div class="acts">';
  if (p.fuelSold) {
    var fp = GT.fuelPrice(S, S.loc), room = S.ship.fuelMax - S.ship.fuel;
    h += btn('Refuel +10', 'ref10', room > 0 && S.credits >= fp) + btn('Fill tank', 'refall', room > 0 && S.credits >= fp);
  } else h += '<span class="dim" style="align-self:center">No fuel dock here.</span>';
  h += btn(v.explored ? 'Explored' : 'Explore', 'explore', !v.explored && !S.pending) + btn(v.encountered ? 'Met someone' : 'Seek Encounter', 'encounter', !v.encountered && !S.pending);
  if (p.gambling) h += btn('Parlour of Thin Hours', 'gamble', GT.canGamble(S), 'alt');
  h += '</div>';
  if (p.fuelSold) h += '<div class="dim" style="font-size:12px">Fuel here: <b class="num">' + GT.fuelPrice(S, S.loc) + 'c</b> per PC' + (GT.depotCut(S) ? ' (depot discount applied)' : '') + '.</div>';
  h += '<div class="dim" style="font-size:12px">' + esc(p.desc) + '</div>';
  if (v.offer) {
    var f = GT.facDef(v.offer.type);
    h += '<div class="card offer"><div class="row"><b>Offer: ' + f.name + '</b><b class="num amber">' + fmt(v.offer.price) + 'c</b></div><div class="dim" style="font-size:12px;margin:4px 0 8px">' + f.blurb + ' ' + GT.facBenefitText(v.offer.type, v.offer.B) + '.</div>' + btn('Buy facility', 'facility', v.offer.price <= S.credits) + '</div>';
  } else if (S.owned[S.loc]) {
    var o = S.owned[S.loc]; h += '<div class="card" style="border-color:var(--good)"><b class="good">You own the ' + GT.facDef(o.type).name + ' here.</b></div>';
  }
  h += '<div class="sec"><div class="row"><h3>Market</h3><span class="num" style="font-size:12px" title="' + esc(GT.discText(t)) + '">Planet tax <b>' + (t.rate * 100).toFixed(1) + '%</b> <span class="dim">(base ' + (t.base * 100).toFixed(1) + '%)</span></span></div><div class="market">';
  GT.ITEMS.forEach(function (it, i) {
    var q = qtyOf(i), held = S.cargo[i].qty, stock = S.markets[S.loc][i].stock, mx = GT.maxBuy(S, i);
    h += '<div class="mrow" data-i="' + i + '"><span class="nm" title="' + esc(it.blurb) + '">' + it.name + (held ? ' <span class="dim">(' + held + ')</span>' : '') + '</span>';
    h += '<span class="num"><b>' + fmt(GT.price(S, S.loc, i)) + 'c</b></span><span class="num dim" title="Units for sale">' + stock + ' in stock</span>' + trendHTML(i);
    h += '<div class="ctl">' + btn('Buy', 'buy', GT.canBuy(S, i, q)) + btn('Max', 'max', mx > 0) + '<input class="qty" type="number" min="1" step="1" value="' + q + '" aria-label="Quantity of ' + it.name + '">' + btn('Sell', 'sell', GT.canSell(S, i, q)) + btn('All', 'all', held > 0) + '</div></div>';
  });
  return h + '</div></div>';
}

function renderCol3() {
  var h = '', d = ui.dest, P = GT.PLANETS;
  h += '<div class="sec"><h3>Star map</h3><div class="mapwrap">' + UI.mapSVG(S, d) + '</div><div class="dim" style="font-size:11px">Select a world to plan a jump. Red diamonds are rival traders.</div></div>';
  h += '<div class="sec"><h3>Trip plan</h3><div class="card trip">';
  if (d === null || d === S.loc) h += '<p class="dim">Select a destination on the map.</p>';
  else {
    var p = P[d], cost = GT.jumpCost(S, d), ok = S.ship.fuel >= cost, rivals = S.comps.filter(function (c) { return c.loc === d; });
    h += '<div class="row"><b style="font-size:15px;color:' + p.color + '">' + esc(p.name) + '</b><span class="dim">' + p.type + '</span></div>';
    h += '<p class="dim" style="font-size:12px">' + esc(p.desc) + '</p>';
    h += '<p>Distance <b class="num">' + GT.dist(S.loc, d).toFixed(0) + '</b> &middot; Fuel cost <b class="num ' + (ok ? '' : 'bad') + '">' + cost + ' PC</b> <span class="dim">(you have ' + S.ship.fuel + ')</span></p>';
    if (rivals.length) h += '<p class="dim" style="font-size:12px">Rivals docked there: ' + rivals.map(function (c) { return esc(c.name); }).join(', ') + '.</p>';
    if (!ok) h += '<p class="warn"><b>Warning:</b> you do not have enough fuel for this jump. ' + (P[S.loc].fuelSold ? 'Refuel here first.' : 'There is no fuel dock here.') + '</p>';
    h += btn('Jump', 'jump', GT.canJump(S, d), 'go');
  }
  if (GT.stranded(S) && !S.over) { var tt = P[GT.towTarget(S)]; h += '<p class="warn" style="margin-top:8px"><b>Stranded:</b> not enough fuel for any jump.</p>' + btn('Call a tow to ' + esc(tt.name) + ' (' + GT.CFG.TOW_COST + 'c)', 'tow', true, 'alt'); }
  h += '</div></div>';
  var rows = S.comps.map(function (c) { return { name: c.name + ' ' + c.title, cargo: c.cargo, speed: c.speed, w: c.wealth, me: false }; });
  rows.push({ name: S.name + ' (you)', cargo: S.ship.cargoMax, speed: GT.effSpeed(S), w: GT.networth(S), me: true });
  rows.sort(function (a, b) { return b.w - a.w; });
  h += '<div class="sec"><h3>Leaderboard</h3><div class="card" style="padding:6px;overflow-x:auto"><table><tr><th>#</th><th>Trader</th><th class="r">Cargo</th><th class="r">Speed</th><th class="r">Wealth</th></tr>';
  rows.forEach(function (r, i) { h += '<tr class="' + (r.me ? 'me' : '') + '"><td>' + (i + 1) + '</td><td>' + esc(r.name) + '</td><td class="r">' + r.cargo + '</td><td class="r">' + r.speed.toFixed(1) + '</td><td class="r">' + fmt(r.w) + 'c</td></tr>'; });
  return h + '</table></div><div class="dim" style="font-size:11px">Wealth is credits plus bank, minus loans. Reach ' + fmt(GT.CFG.WIN) + 'c to win.</div></div>';
}

function renderCol4() {
  var shown = GT.CFG.LOG_SHOWN + ui.more, h = '<div class="row"><h3>Flight log</h3><button class="tbtn" data-act="info" aria-label="How to play">? How to play</button></div><div class="log">';
  S.log.slice(0, shown).forEach(function (e) { h += '<div class="le ' + e.kind + '"><span class="tn">[Turn ' + e.turn + ']</span> ' + e.text + '</div>'; });
  if (S.log.length > shown) h += '<button class="btn alt" data-act="more">Show older entries (' + (S.log.length - shown) + ')</button>';
  return h + '</div>';
}

function paint(id, html) { var el = $(id), st = el.scrollTop; el.innerHTML = html; el.scrollTop = st; }
function render() {
  if (!S) return;
  paint('c1', renderCol1()); paint('c2', renderCol2()); paint('c3', renderCol3());
  var lg = $('c4'), st = lg.scrollTop; lg.innerHTML = renderCol4(); lg.scrollTop = st;
  var cv = $('pc'), p = GT.PLANETS[S.loc];
  if (cv) { if (!ui.cache[p.id]) { var off = document.createElement('canvas'); UI.drawPlanet(off, p); ui.cache[p.id] = off; } cv.width = ui.cache[p.id].width; cv.height = ui.cache[p.id].height; cv.style.aspectRatio = '480 / 270'; cv.getContext('2d').drawImage(ui.cache[p.id], 0, 0); }
  $('topstat').textContent = 'Turn ' + S.turn + '  |  Net worth ' + fmt(GT.networth(S)) + 'c of ' + fmt(GT.CFG.WIN) + 'c';
  ['c1', 'c2', 'c3', 'c4'].forEach(function (c) { $(c).classList.toggle('on', c === ui.tab); });
  Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (t) { t.classList.toggle('on', t.dataset.tab === ui.tab); });
}
