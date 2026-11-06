/* Galactic Trader. Part 9b: popups, the start screen, actions and boot. */
function openModal(html, wide) { var m = $('modal'); m.innerHTML = '<div class="sheet' + (wide ? ' wide' : '') + '" role="dialog" aria-modal="true">' + html + '</div>'; m.hidden = false; var b = m.querySelector('button'); if (b) b.focus({ preventScroll: true }); }
function closeModal() { $('modal').hidden = true; $('modal').innerHTML = ''; }

var INFO = '<h2>How to play Galactic Trader</h2>' +
  '<h4>The goal</h4><p>Build your fortune to <b>150,000 credits</b>. Your wealth is your credits plus your bank deposit, minus any loan. You lose if you have <b>zero or fewer credits and an empty hold</b>. Both are checked only when a planet jump finishes, so a bad day is not final until you jump.</p>' +
  '<h4>Resources</h4><ul><li><b>Credits (c):</b> the cash you carry. The bank holds the rest.</li><li><b>Fuel (PC):</b> every jump burns fuel. Faster engines burn less. Only about half the worlds sell fuel.</li><li><b>Cargo:</b> seven goods: Rations, Metals, Medical, Spices, Circuitry, Dark Matter and Artifacts. Your hold has a fixed size.</li><li><b>Reputation:</b> grows when you buy facilities, sabotage rivals successfully, and help them. It cuts your tax and tilts luck toward good outcomes. It falls when you are caught or fail.</li></ul>' +
  '<h4>Trading</h4><ul><li>Each world makes some goods cheaply, so their price is low there. Buy where a good is abundant and sell on the far side of the map, where it is scarce.</li><li>Prices follow supply and demand. Buying drains stock and raises the price. Selling floods the market and lowers it. Markets slowly recover, and random shortages and gluts also move them.</li><li>The trend shows today\'s price against the item\'s base price. About one item in four has no report, shown as a question mark.</li><li>Every trade is taxed. Facilities and reputation reduce the rate. Prices and stock on other worlds cannot be seen, but each description hints at what is plentiful.</li></ul>' +
  '<h4>Travel, events and encounters</h4><ul><li>Select a world on the map and press Jump. Roughly 3 trips in 10 meet an event: a windfall, a pirate, a breakdown, and many more.</li><li>On each visit you may <b>Explore</b> once (about a 1 in 4 chance of something happening) and <b>Seek Encounter</b> once (about 3 in 10). Each world has its own characters.</li><li>Some worlds sell ship upgrades: more cargo, a faster engine, a bigger tank. A bigger tank starts empty.</li><li>Stuck without the fuel for any jump? A tug will drag you to a fuel dock, for a fee.</li></ul>' +
  '<h4>Facilities</h4><p>About 1 trip in 5 brings an offer to buy a facility on the world you reach. It stands while you are docked, so sell cargo first if you need the money. Brokers improve your trades, depots cut fuel costs, and factories, warehouses and hotels collect fees from rivals, which you receive when you next visit. A facility costs about 20 times the benefit it brings per jump, and owning one raises your reputation.</p>' +
  '<h4>Bank</h4><p>Deposits earn 3% and loans cost 5%. Interest is added every 4 jumps. You can take a loan of 1,000c at a time. Withdraw before you jump if you want cash on hand.</p>' +
  '<h4>Rivals</h4><p>Four rival traders roam the map and compete on the leaderboard. When you share a world with one, you may get to <b>Sabotage</b>, <b>Assist</b> or <b>Ignore</b> them. Sabotage is risky, and being caught costs you. Assisting costs money or fuel and may be repaid generously, thanked, or snubbed.</p>' +
  '<h4>Gambling</h4><p>One world runs a strange parlour. Nobody explains the rules, and the odds are described only in words. The house keeps an edge in the long run.</p>' +
  '<div class="row" style="justify-content:flex-end"><button class="btn" data-act="close">Got it</button></div>';

function compModal() {
  var pe = S.pending, c = S.comps[pe.ci], att = c.wealth > GT.networth(S) * 1.3 ? 'They look you over with open scorn.' : c.wealth < GT.networth(S) * 0.7 ? 'They watch you with careful, hungry respect.' : 'They give you a polite and professional nod.';
  openModal('<h2>A rival at the dock</h2><p><b>' + esc(c.name) + '</b>, ' + esc(c.title) + ', is currently docked here. They are ' + pe.mood + '. ' + att + '</p>' +
    '<p class="dim">Their ship: cargo ' + c.cargo + ', warp ' + c.speed.toFixed(1) + '. What do you do?</p>' +
    '<div class="acts"><button class="btn" data-act="comp-sabotage">Sabotage</button><button class="btn alt" data-act="comp-assist">Assist (about ' + fmt(GT.compAssistCost(S)) + 'c or some fuel)</button><button class="btn alt" data-act="comp-ignore">Ignore</button></div>' +
    '<p class="dim" style="font-size:12px">Sabotage has a low chance to work and a low chance of backfiring. If you cannot afford to assist, you will ignore them instead.</p>');
}

function gambleModal(last) {
  var h = '<div class="row"><h2>The Parlour of Thin Hours</h2><b class="num">' + fmt(S.credits) + 'c</b></div><p class="dim">Smoke, low light and no printed rules. ' + esc(GT.GAME_LUCK_NOTE) + '</p>';
  if (last) h += '<div class="card" style="border-color:' + (last.net > 0 ? 'var(--good)' : last.net < 0 ? 'var(--bad)' : 'var(--line)') + '"><b class="' + (last.net > 0 ? 'good' : last.net < 0 ? 'bad' : '') + '">' + (last.net > 0 ? '+' : last.net < 0 ? '-' : '') + fmt(Math.abs(last.net)) + 'c</b> &nbsp;' + esc(last.text) + '</div>';
  GT.GAMES.forEach(function (g, gi) {
    h += '<div class="card"><b>' + esc(g.name) + '</b><p class="dim" style="font-size:12px;margin:4px 0 8px">' + esc(g.blurb) + '</p><div class="acts">';
    GT.STAKES.forEach(function (st) { h += '<button class="btn alt" data-act="gamble-' + gi + '-' + st + '"' + (st <= S.credits ? '' : ' disabled') + '>Wager ' + fmt(st) + 'c</button>'; });
    h += '</div></div>';
  });
  openModal(h + '<div class="row" style="justify-content:flex-end"><button class="btn" data-act="close">Leave the table</button></div>', true);
}

function endModal() {
  var o = S.over, st = S.stats, h = '<h2 class="' + (o.won ? 'win' : 'lose') + '">' + (o.won ? 'You made your fortune' : 'You are ruined') + '</h2><p>' + esc(S.name) + ', after <b>' + st.jumps + ' jumps</b> (turn ' + o.turn + '). ' + esc(o.why) + '</p>';
  var tb = 0, ts = 0, sp = 0, er = 0;
  h += '<h4>Goods traded</h4><div style="overflow-x:auto"><table><tr><th>Item</th><th class="r">Bought</th><th class="r">Spent</th><th class="r">Sold</th><th class="r">Earned</th></tr>';
  GT.ITEMS.forEach(function (it, i) { tb += st.bought[i]; ts += st.sold[i]; sp += st.spent[i]; er += st.earned[i]; h += '<tr><td>' + it.name + '</td><td class="r">' + st.bought[i] + '</td><td class="r">' + fmt(st.spent[i]) + 'c</td><td class="r">' + st.sold[i] + '</td><td class="r">' + fmt(st.earned[i]) + 'c</td></tr>'; });
  h += '<tr><td><b>Total</b></td><td class="r"><b>' + tb + '</b></td><td class="r"><b>' + fmt(sp) + 'c</b></td><td class="r"><b>' + ts + '</b></td><td class="r"><b>' + fmt(er) + 'c</b></td></tr></table></div>';
  function r(a, b, cls) { return '<div class="row"><span class="dim">' + a + '</span><b class="num ' + (cls || '') + '">' + b + '</b></div>'; }
  h += '<div class="cols2"><div><h4>Money</h4>' + r('Final net worth', fmt(GT.networth(S)) + 'c') + r('Peak net worth', fmt(st.peak) + 'c') + r('Tax paid', fmt(st.tax) + 'c') + r('Tax discount from reputation', fmt(st.taxSavedRep) + 'c', 'good') + r('Tax discount from facilities', fmt(st.taxSavedFac) + 'c', 'good') + r('Broker price edge', fmt(st.brokerEdge) + 'c', 'good') + r('Gained from events', fmt(st.eventGain) + 'c', 'good') + r('Lost to events', fmt(st.eventLoss) + 'c', 'bad') + r('Bank interest earned', fmt(st.interestEarned) + 'c', 'good') + r('Loan interest paid', fmt(st.interestPaid) + 'c', 'bad') + r('Rival fees collected', fmt(st.feeIncome) + 'c', 'good') + r('Gambling net', (st.gambleNet >= 0 ? '+' : '-') + fmt(Math.abs(st.gambleNet)) + 'c', st.gambleNet >= 0 ? 'good' : 'bad') + '</div>' +
    '<div><h4>Journey</h4>' + r('Jumps made', st.jumps) + r('Events met on the road', st.events) + r('Worlds explored', st.explores) + r('Encounters sought', st.encounters) + r('Fuel bought', st.fuelBought + ' PC for ' + fmt(st.fuelSpent) + 'c') + r('Tows needed', st.tows) + r('Facilities bought', st.facilitiesBought + ' (' + GT.facCount(S) + ' kept)') + r('Spent on ship upgrades', fmt(st.upgradesSpent) + 'c') + r('Sabotage attempts', st.sabotage + ' (' + st.sabotageWon + ' worked)') + r('Rivals assisted', st.assists) + r('Reputation', S.rep + ' now, peak ' + st.repPeak + ', low ' + st.repLow) + r('Gambling rounds', st.gambleRounds) + '</div></div>';
  openModal(h + '<div class="row" style="justify-content:flex-end"><button class="btn alt" data-act="close">View the log</button><button class="btn" data-act="new">Play again</button></div>', true);
}

/* ---------- start screen ---------- */
function renderStart() {
  var mx = { cargo: 75, speed: 2.2, fuel: 190 }, h = '<div class="in"><div><div class="title">Galactic Trader</div><p class="tag2">Seven worlds. Seven goods. Four rivals who would love to see you fail. Buy low, haul far, sell high, and reach 150,000 credits before the dark swallows your last coin.</p></div>';
  h += '<div class="ships" role="group" aria-label="Choose your ship">';
  GT.SHIPS.forEach(function (sh) {
    function m(l, v, k) { return '<span>' + l + '</span><span class="bar"><i style="width:' + Math.round(v / mx[k] * 100) + '%"></i></span><span>' + (k === 'speed' ? v.toFixed(1) : v) + '</span>'; }
    h += '<button class="ship" data-act="pick-' + sh.id + '" aria-pressed="' + (ui.ship === sh.id) + '"><div style="background:#04060f;border-radius:6px">' + UI.shipSVG(sh.id, sh.hue) + '</div><div class="sn">' + esc(sh.name) + '</div><div class="mini">' + m('Cargo', sh.cargo, 'cargo') + m('Speed', sh.speed, 'speed') + m('Fuel', sh.fuel, 'fuel') + '</div><div class="sd">' + esc(sh.desc) + '</div></button>';
  });
  h += '</div><div class="launch"><label>Captain name<input id="in-name" type="text" maxlength="20" placeholder="Captain" value="' + esc(ui.name) + '" autocomplete="off"></label><button class="btn" data-act="launch">Launch</button></div></div>';
  $('start').innerHTML = h; $('start').hidden = false;
}

/* ---------- actions ---------- */
function rowI(el) { var r = el.closest('.mrow'); return r ? +r.dataset.i : -1; }
function afterAction(jumped) {
  if (jumped) { ui.dep = 0; ui.wd = 0; ui.rep = 0; ui.dest = null; ui.more = 0; }
  render(); $('c4').scrollTop = 0;
  if (S.over) endModal(); else if (S.pending && $('modal').hidden) compModal();
}
function setTheme(t) { document.documentElement.setAttribute('data-theme', t); $('btnTheme').textContent = t === 'dark' ? 'Theme: Dark' : 'Theme: Light'; try { localStorage.setItem('gt-theme', t); } catch (e) {} }

function act(a, el) {
  if (a.indexOf('pick-') === 0) { ui.ship = a.slice(5); Array.prototype.forEach.call(document.querySelectorAll('.ship'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.act === a)); }); return; }
  if (a === 'launch') {
    var nm = ($('in-name').value || '').trim() || 'Captain'; ui.name = nm; S = GT.newState(ui.ship, nm); ui.dest = null; ui.qty = {}; ui.dep = ui.wd = ui.rep = 0; ui.more = 0; ui.tab = 'c1'; ui.cache = ui.cache || {};
    GT.log(S, 'Welcome aboard, <b>' + esc(nm) + '</b>. You start at <b>Kryndor Spire</b> with ' + fmt(S.credits) + 'c and a ' + GT.SHIPS.filter(function (x) { return x.id === S.shipId; })[0].name + '. Reach ' + fmt(GT.CFG.WIN) + 'c to win.', 'info');
    GT.log(S, 'Tip: goods are cheap where they are made. Look at each world\'s description, pick a far world on the star map, and sell what you carry where it is scarce.', 'info');
    $('start').hidden = true; closeModal(); render(); return;
  }
  if (a === 'close') { closeModal(); return; }
  if (a === 'info') { openModal(INFO, true); return; }
  if (a === 'theme') { setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); return; }
  if (a === 'new') { if (!S || S.over || el.dataset.sure) { S = null; closeModal(); renderStart(); } else openModal('<h2>Abandon this voyage?</h2><p>Your current game will be lost.</p><div class="row" style="justify-content:flex-end"><button class="btn alt" data-act="close">Keep playing</button><button class="btn" data-act="new" data-sure="1">Abandon</button></div>'); return; }
  if (a === 'tab') { ui.tab = el.dataset.tab; render(); return; }
  if (!S) return;
  if (a === 'more') { ui.more += 60; render(); return; }
  if (S.over) return;
  var i = rowI(el), jumped = false, q;
  if (a === 'buy') GT.buy(S, i, qtyOf(i));
  else if (a === 'max') GT.buy(S, i, GT.maxBuy(S, i));
  else if (a === 'sell') GT.sell(S, i, qtyOf(i));
  else if (a === 'all') GT.sell(S, i, S.cargo[i].qty);
  else if (a === 'ref10') GT.refuel(S, 10);
  else if (a === 'refall') GT.refuel(S, 9999);
  else if (a === 'explore') GT.explore(S);
  else if (a === 'encounter') GT.encounter(S);
  else if (a.indexOf('up-') === 0) GT.upgrade(S, a.slice(3));
  else if (a === 'deposit') { GT.deposit(S, ui.dep); ui.dep = 0; }
  else if (a === 'withdraw') { GT.withdraw(S, ui.wd); ui.wd = 0; }
  else if (a === 'loan') GT.takeLoan(S);
  else if (a === 'repay') { GT.repay(S, ui.rep); ui.rep = 0; }
  else if (a === 'facility') GT.buyFacility(S);
  else if (a === 'jump') { jumped = GT.jump(S, ui.dest); }
  else if (a === 'tow') { jumped = GT.tow(S); }
  else if (a === 'gamble') { gambleModal(null); return; }
  else if (a.indexOf('gamble-') === 0) { var pr = a.split('-'); var res = GT.gamble(S, +pr[1], +pr[2]); gambleModal(res); render(); return; }
  else if (a.indexOf('comp-') === 0) { GT.compAction(S, a.slice(5)); closeModal(); }
  afterAction(jumped);
}

document.addEventListener('click', function (e) {
  var pl = e.target.closest('.pl');
  if (pl && S && !S.over) { var i = +pl.dataset.i; ui.dest = i === S.loc || ui.dest === i ? null : i; render(); return; }
  var el = e.target.closest('[data-act]'); if (el && !el.disabled) act(el.dataset.act, el);
});
document.addEventListener('keydown', function (e) {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('pl') && S && !S.over) { e.preventDefault(); var i = +e.target.dataset.i; ui.dest = i === S.loc || ui.dest === i ? null : i; render(); }
  if (e.key === 'Escape' && !$('modal').hidden && !(S && S.pending)) closeModal();
});
function setDis(sel, ok) { var b = document.querySelector(sel); if (b) b.disabled = !ok || !!(S && S.over); }
document.addEventListener('input', function (e) {
  var t = e.target; if (!S) return;
  var v = Math.max(0, Math.floor(+t.value || 0));
  if (t.classList.contains('qty')) {
    var row = t.closest('.mrow'), i = +row.dataset.i; ui.qty[i] = Math.max(1, v);
    row.querySelector('[data-act="buy"]').disabled = !GT.canBuy(S, i, ui.qty[i]) || !!S.over; row.querySelector('[data-act="sell"]').disabled = !GT.canSell(S, i, ui.qty[i]) || !!S.over;
  } else if (t.id === 'in-dep') { ui.dep = v; setDis('[data-act="deposit"]', v > 0 && v <= S.credits); }
  else if (t.id === 'in-wd') { ui.wd = v; setDis('[data-act="withdraw"]', v > 0 && v <= S.bank); }
  else if (t.id === 'in-rep') { ui.rep = v; setDis('[data-act="repay"]', v > 0 && S.loan > 0 && S.credits > 0); }
  else if (t.id === 'in-name') ui.name = t.value;
});

/* ---------- boot ---------- */
(function () {
  var t = null; try { t = localStorage.getItem('gt-theme'); } catch (e) {}
  if (t !== 'dark' && t !== 'light') t = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  setTheme(t); renderStart();
})();
