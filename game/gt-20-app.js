/* Galactic Trader Deluxe. Part 20: actions, hotspots, events and boot. */
function syncBar() { var s = $('bSound'); if (s) s.textContent = SFX.on ? 'SND' : 'MUTE'; }
function settle() {
  if (G && G.over && !ui.endShown) { ui.endShown = true; SFX.play(G.over.won ? 'win' : 'lose'); endModal(); }
  else if (S && !S.over && S.pending && $('modal').hidden && $('mg').hidden && $('flight').hidden && $('pass').hidden) compModal();
}
function sfxFor(kind) { SFX.play(kind === 'gain' ? 'win' : kind === 'loss' ? 'bad' : 'pop'); }
function lastEntry(top) { var n = newLogs(top); return n.length ? n[n.length - 1] : null; }

/* walk the captain to a door, then open the place */
var HS_PAGE = { market: 'market', bank: 'bank', yard: 'yard', fuel: 'fuel', cantina: 'cantina', alley: 'alley', office: 'office', parlour: 'parlour', jobs: 'jobs', pad: 'pad' };
function walkTo(kind, done) {
  var pl = $('player'), d = SC.door && SC.door[kind], from = ui.px && ui.px.x != null ? ui.px : (SC.door && SC.door.pad);
  if (!pl || !d || !from || reduced()) { if (d) ui.px = { x: d.x, y: d.y, s: d.s }; ui.walking = false; done(); return; }
  var dist = Math.hypot(d.x - from.x, d.y - from.y), dur = Math.max(0.3, Math.min(1.1, dist / 170)); ui.px = { x: d.x, y: d.y, s: d.s }; ui.walking = true;
  pl.style.transitionDuration = dur + 's'; pl.classList.add('walking'); pl.style.transform = 'translate(' + d.x + 'px,' + d.y + 'px) scale(' + Math.max(0.3, Math.min(1, d.s)).toFixed(2) + ')';
  setTimeout(function () { ui.walking = false; done(); }, dur * 1000 + 80);
}
function hotspot(el) {
  if (ui.walking || !S || S.over) return; var kind = el.dataset.hs;
  if (el.classList.contains('closed')) { var role = kind === 'yard' ? 'yard' : 'fuel'; var c = castOf(role), pid = plan().id; toast((c ? c.name + ': ' : '') + '"' + NP.say(role, 'closed') + '"'); SFX.play('bad'); return; }
  setSentence('Walking to ' + el.dataset.label.replace(/^(Go to|Poke around|Check|Visit|Enter) (the )?/i, '') + '...'); SFX.play('click');
  walkTo(kind, function () { go(HS_PAGE[kind]); });
}

/* a jump: the engine does the work, then the warp screen replays what happened */
function doJump(to, towed) {
  var from = S.loc, top = S.log[0], jumper = S, ok = towed ? GT.tow(S) : GT.jump(S, to); if (!ok) return;
  $('toast').hidden = true;
  var entries = newLogs(top); ui.dep = ui.wd = ui.rep = 0; ui.dest = null; ui.more = 0; ui.px = null; ui.page = 'hub'; ui.last = null; ui.lastPage = null; render();
  FL.run(from, S.loc, entries, function () { afterJump(jumper); });
}
/* the jump is over: close the turn, then show the end screen, the next captain, or the same captain's next visit */
function resetTurnUI() { ui.dest = null; ui.qty = {}; ui.dep = ui.wd = ui.rep = 0; ui.more = 0; ui.px = null; ui.page = 'hub'; ui.last = null; ui.lastPage = null; ui.scroll = {}; ui.say = {}; }
function afterJump(p) {
  var next = function () {
    var over = GT.endTurn(G);
    if (over) { render(); settle(); return; }
    S = GT.active(G); resetTurnUI();
    if (G.multi) { passScreen(); render(); } else { render(); settle(); }
  };
  if (G.multi && p.over) {
    if (p.over.won) notice('<h2 class="win">' + esc(p.name) + ' reaches ' + fmt(G.target) + 'c!</h2><p>The race is not over yet. The round finishes so everyone gets an equal number of turns, then the richest captain wins.</p>', next);
    else notice('<h2 class="lose">' + esc(p.name) + ' is ruined!</h2><p>' + esc(p.over.why) + ' ' + esc(p.name) + ' is out of the race. Everyone else carries on.</p>', next);
  } else next();
}

function startGame() {
  var st = ui.setup, list = [], seen = {}, k;
  for (k = 0; k < st.n; k++) { var p = st.p[k], nm = (p.name || '').trim() || 'Captain ' + (k + 1); if (seen[nm.toLowerCase()]) nm = nm.slice(0, 17) + ' ' + (k + 1); seen[nm.toLowerCase()] = 1; list.push({ name: nm, shipId: p.ship, char: CH.fromName(nm, p.salt) }); }
  G = GT.newGame(list, { target: st.target }); S = GT.active(G); resetTurnUI(); ui.endShown = false; ui.afterNotice = null;
  Object.keys(ui).forEach(function (k2) { if (k2.indexOf('seen-') === 0) delete ui[k2]; });
  G.players.forEach(function (q) {
    var sh = GT.SHIPS.filter(function (x) { return x.id === q.shipId; })[0];
    GT.log(q, 'Welcome aboard, <b>' + esc(q.name) + '</b>, ' + esc(q.char.title) + '. You start at <b>' + GT.PLANETS[q.loc].name + '</b> with ' + fmt(q.credits) + 'c and a ' + esc(sh.name) + '. Reach ' + fmt(GT.CFG.WIN) + 'c to win.', 'info');
    GT.log(q, 'Tip: goods are cheap where they are made. Read each world\'s description, find a far world on the Launch Pad map, and sell where it is scarce.', 'info');
  });
  $('start').hidden = true; closeModal(); $('pass').hidden = true;
  if (G.multi) { passScreen(); render(); } else { render(); toast('Click a building to walk there and visit it.'); }
}

function act(a, el) {
  if (a.indexOf('pick-') === 0) { sp().ship = a.slice(5); Array.prototype.forEach.call(document.querySelectorAll('.ship'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.act === a)); }); refreshCap(); return; }
  if (a === 'reroll') { sp().salt++; refreshCap(); SFX.play('pop'); return; }
  if (a === 'randname') { sp().name = GT.pick(SILLY); $('in-name').value = sp().name; sp().salt = 0; refreshCap(); SFX.play('pop'); return; }
  if (a.indexOf('players-') === 0) { ui.setup.n = +a.slice(8); if (ui.setup.cur >= ui.setup.n) ui.setup.cur = ui.setup.n - 1; renderStart(); return; }
  if (a.indexOf('target-') === 0) { ui.setup.target = +a.slice(7); renderStart(); return; }
  if (a.indexOf('cap-') === 0) { ui.setup.cur = +a.slice(4); renderStart(); return; }
  if (a === 'launch') { startGame(); return; }
  if (a === 'pass-ok') { $('pass').hidden = true; render(); settle(); return; }
  if (a === 'notice-ok') { closeModal(); var nf = ui.afterNotice; ui.afterNotice = null; if (nf) nf(); return; }
  if (a.indexOf('endp-') === 0) { endModal(+a.slice(5)); return; }
  if (a === 'close') { closeModal(); return; }
  if (a === 'info') { openModal(infoHTML(), true); return; }
  if (a === 'sound') { SFX.on = !SFX.on; try { localStorage.setItem('gt-snd', SFX.on ? '1' : '0'); } catch (e) {} syncBar(); SFX.play('pop'); return; }
  if (a === 'new') { if (!S || (G && G.over) || el.dataset.sure) { S = null; G = null; closeModal(); $('pass').hidden = true; $('flight').hidden = true; renderStart(); } else openModal('<h2>Abandon this voyage?</h2><p>Your current game will be lost.</p><div class="row" style="justify-content:flex-end"><button class="btn blue" data-act="close">Keep playing</button><button class="btn pink" data-act="new" data-sure="1">Abandon</button></div>'); return; }
  if (!S) return;
  if (a === 'log') { logModal(); return; }
  if (a === 'more') { ui.more += 60; logModal(); return; }
  if (a === 'leave') { go('hub'); return; }
  if (a === 'go-ship') { go('ship'); return; }
  if (a.indexOf('comp-') === 0) { compAct(a.slice(5)); return; }
  if (S.over) return;
  var row = el && el.closest ? el.closest('.mk-row') : null, i = row ? +row.dataset.i : -1, q, top = S.log[0], nm;
  if (a === 'buy' || a === 'max') { q = GT.buy(S, i, a === 'max' ? GT.maxBuy(S, i) : qtyOf(i)); if (q) { speak('market', NP.say('market', 'buy', { qty: q.qty, item: GT.ITEMS[i].name })); SFX.play('buy'); } }
  else if (a === 'sell' || a === 'all') { q = GT.sell(S, i, a === 'all' ? S.cargo[i].qty : qtyOf(i)); if (q) { speak('market', NP.say('market', 'sell', { qty: q.qty, item: GT.ITEMS[i].name })); SFX.play('sell'); } }
  else if (a === 'deposit') { var n1 = ui.dep; if (GT.deposit(S, n1)) { speak('bank', NP.say('bank', 'deposit', { amt: fmt(n1) })); SFX.play('coin'); } ui.dep = 0; }
  else if (a === 'withdraw') { var n2 = ui.wd; if (GT.withdraw(S, n2)) { speak('bank', NP.say('bank', 'withdraw', { amt: fmt(n2) })); SFX.play('coin'); } ui.wd = 0; }
  else if (a === 'loan') { if (GT.takeLoan(S)) { speak('bank', NP.say('bank', 'loan')); SFX.play('coin'); } }
  else if (a === 'repay') { var n3 = Math.floor(Math.min(ui.rep, S.loan, S.credits)); if (GT.repay(S, ui.rep)) { speak('bank', NP.say('bank', 'repay', { amt: fmt(n3) })); SFX.play('coin'); } ui.rep = 0; }
  else if (a.indexOf('up-') === 0) { var k = a.slice(3), lv = S.ship.lv[k]; GT.upgrade(S, k); if (S.ship.lv[k] > lv) { speak('yard', NP.say('yard', 'upgrade')); SFX.play('win'); } }
  else if (a === 'ref10' || a === 'refall') { if (GT.refuel(S, a === 'ref10' ? 10 : 9999)) { speak('fuel', NP.say('fuel', 'refuel')); SFX.play('buy'); } }
  else if (a === 'encounter' || a === 'explore') {
    if (GT[a](S)) { var e = lastEntry(top); ui.last = { key: a, loc: S.loc, turn: S.turn, kind: e.kind, text: e.text }; sfxFor(e.kind); var role = a === 'encounter' ? 'cantina' : 'alley'; speak(role, GT.pick(a === 'encounter' ? ['Pull up a stool. I have a story, and it is mostly true.', '*slides into the booth*', 'You bought the round, so I will bore you for free.'] : ['You peer into the dark and something peers back.', 'You poke around. The alley pokes around you.', 'It smells. That is how you know it is working.'])); }
  }
  else if (a === 'facility') { if (GT.buyFacility(S)) { speak('office', NP.say('office', 'bought')); SFX.play('win'); } }
  else if (a === 'sit') { gambleModal(null); return; }
  else if (a.indexOf('gamble-') === 0) { var pr = a.split('-'), res = GT.gamble(S, +pr[1], +pr[2]); if (res) { SFX.play(res.net > 0 ? 'win' : res.net < 0 ? 'bad' : 'pop'); gambleModal(res); render(); settle(); } return; }
  else if (a === 'job-start') { if (GT.jobAvailable(S)) startJob(); return; }
  else if (a === 'jump') { doJump(ui.dest, false); return; }
  else if (a === 'tow') { doJump(GT.towTarget(S), true); return; }
  render(); settle();
}

function startJob() {
  var j = GT.job(S);
  MG.run(j.id, function (res) {
    if (res.quit) { render(); return; }
    var top = S.log[0], r = GT.jobFinish(S, res.rating, res.score); speak('jobs', res.rating === 3 ? 'Gold! Foreman Gruff almost smiles. It looks painful.' : res.rating === 0 ? 'Well. You turned up. That counts for something. Not money, though.' : 'Fine work. Here is your pay, and a pat on the back I will not give.');
    toast(r.money ? 'Job done: +' + fmt(r.money) + 'c' + (r.rep ? ' and +1 reputation' : '') : 'Job done, no pay.'); sfxFor(r.money ? 'gain' : 'info'); render(); settle();
  });
}
function compAct(kind) {
  closeModal();
  var finish = function (perf) {
    var top = S.log[0]; GT.compAction(S, kind, perf); var e = lastEntry(top); render();
    if (e) openModal('<h2>' + (kind === 'sabotage' ? 'Sabotage!' : kind === 'assist' ? 'A helping hand' : 'You move along') + '</h2><div class="le ' + e.kind + '" style="font-size:15px">' + e.text + '</div><div class="row" style="justify-content:flex-end"><button class="btn pink" data-act="close">Onward</button></div>');
    sfxFor(e ? e.kind : 'info'); settle();
  };
  if (kind === 'sabotage') MG.run('sneak', function (res) { finish(res.quit ? 0 : res.perf); }, { startLabel: 'Sneak in!' });
  else finish();
}

/* ---------- events ---------- */
document.addEventListener('click', function (e) {
  if (e.target.closest('#mg') || e.target.closest('#flight')) return;
  var pl = e.target.closest('#stage .pl');
  if (pl && S && !S.over) { var i = +pl.dataset.i; ui.dest = i === S.loc || ui.dest === i ? null : i; SFX.play('click'); render(); return; }
  var hs = e.target.closest('#stage .hs'); if (hs && S) { hotspot(hs); return; }
  var el = e.target.closest('[data-act]'); if (el && !el.disabled) { SFX.play('click'); act(el.dataset.act, el); }
});
document.addEventListener('contextmenu', function (e) { var hs = e.target.closest('#stage .hs'); if (hs && S) { e.preventDefault(); toast(hs.classList.contains('closed') ? NP.QUIP.closed : NP.QUIP[hs.dataset.hs] || 'Nothing special.'); } });
document.addEventListener('mouseover', function (e) { var t = e.target.closest ? e.target.closest('[data-label]') : null; if (t && ($('stage').contains(t) || t.closest('#bar'))) setSentence(t.dataset.label); });
document.addEventListener('mouseout', function (e) { var t = e.target.closest ? e.target.closest('[data-label]') : null; if (t && S) { var nx = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest('[data-label]') : null; if (!nx) setSentence(ui.defSentence || ''); } });
document.addEventListener('keydown', function (e) {
  if (!$('mg').hidden || !$('flight').hidden) return;
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('hs') && S) { e.preventDefault(); hotspot(e.target); return; }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('pl') && S && !S.over) { e.preventDefault(); var i = +e.target.dataset.i; ui.dest = i === S.loc || ui.dest === i ? null : i; render(); return; }
  if (e.key === 'Escape') { if (!$('pass').hidden) return; if (!$('modal').hidden) { if (!(S && S.pending)) closeModal(); } else if (S && ui.page !== 'hub' && $('start').hidden) go('hub'); }
});
function setDis(sel, ok) { var b = document.querySelector(sel); if (b) b.disabled = !ok || !!(S && S.over); }
document.addEventListener('input', function (e) {
  var t = e.target; if (t.id === 'in-name') { sp().name = t.value; sp().salt = 0; refreshCap(); return; } if (!S) return;
  var v = Math.max(0, Math.floor(+t.value || 0));
  if (t.classList.contains('qty')) { var row = t.closest('.mk-row'), i = +row.dataset.i; ui.qty[i] = Math.max(1, v); row.querySelector('[data-act="buy"]').disabled = !GT.canBuy(S, i, ui.qty[i]) || !!S.over; row.querySelector('[data-act="sell"]').disabled = !GT.canSell(S, i, ui.qty[i]) || !!S.over; }
  else if (t.id === 'in-dep') { ui.dep = v; setDis('[data-act="deposit"]', v > 0 && v <= S.credits); }
  else if (t.id === 'in-wd') { ui.wd = v; setDis('[data-act="withdraw"]', v > 0 && v <= S.bank); }
  else if (t.id === 'in-rep') { ui.rep = v; setDis('[data-act="repay"]', v > 0 && S.loan > 0 && S.credits > 0); }
});

/* ---------- boot ---------- */
(function () {
  try { var sd = localStorage.getItem('gt-snd'); if (sd === '0') SFX.on = false; } catch (e) {}
  syncBar(); setupInit(); renderStart();
})();
