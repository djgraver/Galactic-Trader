/* Galactic Trader 11. Part 54: the v11 interface.
   Play on after the race, SHIP and PLANETS pop-ups, the renamed top bar, a lighter status strip. */
var V11 = { ppSel: null };

/* ---------- top bar ---------- */
syncBar = function () { var s = $('bSound'); if (s) { s.textContent = SFX.on ? 'SOUND' : 'MUTED'; s.classList.toggle('off', !SFX.on); } };

/* ---------- the status strip: warp, turn and worth live in the SHIP pop-up now ---------- */
hud = function () {
  turnbar();
  var used = GT.cargoUsed(S), h = '';
  h += '<span class="who-mini">' + face(S.char) + '<b>' + esc(S.name) + '</b></span>';
  h += '<span class="chip" title="Credits in your pocket">' + UI.icon('coin') + '<b class="num">' + fmt(S.credits) + 'c</b></span>';
  h += '<span class="chip bankchip" title="Money on deposit' + (S.loan ? ', and what you owe' : '') + '">Bank <b class="num good">' + fmt(S.bank) + 'c</b>' + (S.loan ? ' <b class="num bad">owe ' + fmt(S.loan) + 'c</b>' : '') + '</span>';
  h += '<span class="chip" title="Fuel">' + UI.icon('fuel') + bar(S.ship.fuel / S.ship.fuelMax, 'f') + '<b class="num">' + S.ship.fuel + '/' + S.ship.fuelMax + ' PC</b></span>';
  h += '<span class="chip" title="Cargo hold">' + UI.icon('crate') + bar(used / S.ship.cargoMax, '') + '<b class="num">' + used + '/' + S.ship.cargoMax + '</b></span>';
  h += '<span class="chip" title="Reputation cuts your tax and tilts luck">' + UI.icon('star') + '<b class="num">' + S.rep + '</b> <span class="dim">' + repLabel(S.rep) + '</span></span>';
  if (GT.wageDue && GT.wageDue(S)) h += '<span class="chip wagechip ' + (GT.onStrike(S) ? 'strike' : '') + '" title="Pay the crew at the Spaceport">' + (GT.onStrike(S) ? 'CREW ON STRIKE' : 'Wages due') + ' <b class="num">' + fmt(GT.wageDue(S)) + 'c</b></span>';
  if (G && G.result) h += '<span class="chip playon" title="The race is decided; you are playing on">PLAYING ON</span>';
  $('stats').innerHTML = h;
};

/* ---------- play on ---------- */
V11.raceLine = function (G0) {
  var r = G0 && G0.result; if (!r) return '';
  if (r.winner >= 0) return esc(r.name) + ' won the race in ' + (G0.multi ? 'round ' : 'turn ') + (G0.multi ? r.round : (G0.players[r.winner].overRecord || {}).turn || r.round) + ' with ' + fmt(r.worth) + 'c.';
  if (r.rival) return esc(r.rival) + ' (a rival trader) won the race.';
  return 'The race is over.';
};
/* a captain can finish mid-visit (a story chapter's reward): close the turn there and then, as a jump would */
V11.ending = false;
var v11Settle = settle;
settle = function () {
  if (G && !G.over && S && S.over && !V11.ending && $('flight').hidden && $('mg').hidden && $('pass').hidden && $('modal').hidden) {
    V11.ending = true;
    try { afterJump(S); } finally { V11.ending = false; }
    return;
  }
  v11Settle();
};
/* closing whatever card announced it is the moment to finish */
var v11Close = closeModal;
closeModal = function () { v11Close(); if (G && !G.over && S && S.over && !V11.ending) setTimeout(function () { if ($('modal').hidden) settle(); }, 0); };

var v11End = endModal;
endModal = function (seat) {
  v11End(seat);
  var m = $('modal'), win = G && G.over;
  if (!win) return;
  var h2 = m.querySelector('h2');
  if (G.result && h2) h2.insertAdjacentHTML('afterend', '<p class="raceline">Race result: <b>' + V11.raceLine(G) + '</b> You played on after it.</p>');
  var look = m.querySelector('[data-act="close"]');
  if (look && !win.abandoned && GT.canPlayOn(G)) {
    look.outerHTML = '<button class="btn blue" data-act="playon" data-label="Keep trading after the race">Play on</button>';
    var note = '<p class="dim playnote">Your result is logged as it stands. <b>Play on</b> keeps the same captains, ships and sector going with no finish line; NEW/QUIT shows the final report whenever you stop.</p>';
    var row = m.querySelector('.sheet > .row:last-child');
    if (row) row.insertAdjacentHTML('beforebegin', note);
    /* the report is long: offer the choice at the top as well */
    var tabs = m.querySelector('.endtabs'), stand = m.querySelector('table.stand'), at = stand || tabs;
    if (at) at.insertAdjacentHTML('beforebegin', '<div class="row endtop"><button class="btn blue" data-act="playon">Play on</button><button class="btn pink" data-act="new">Play again</button><span class="dim">or read your report below</span></div>');
    var b = m.querySelector('[data-act="playon"]'); if (b) b.focus({ preventScroll: true });
  }
};
V11.playOn = function () {
  if (!GT.playOn(G)) return;
  ui.endShown = false; closeModal(); S = GT.active(G); resetTurnUI();
  SFX.play('pop');
  if (G.multi) { passScreen(); render(); } else { render(); toast('Playing on. The race is logged; from here only the money counts.'); settle(); }
};

/* the voyage at a glance: shown in the SHIP pop-up */
V11.voyage = function () {
  var nw = GT.networth(S), es = GT.effSpeed(S), h = '<div class="voyage">';
  h += '<span><span class="dim">' + (G.multi ? 'Round' : 'Turn') + '</span> <b class="num">' + (G.multi ? G.round : S.turn) + '</b></span>';
  h += '<span><span class="dim">Warp</span> <b class="num">' + es.toFixed(1) + '</b></span>';
  h += '<span class="vw"><span class="dim">Worth</span> <b class="num">' + fmt(nw) + 'c</b>' + (G.result ? '' : bar(nw / GT.CFG.WIN, 'w') + '<span class="dim">of ' + fmt(GT.CFG.WIN) + 'c to win</span>') + '</span>';
  h += G.result ? '<span class="vr amber">' + V11.raceLine(G) + ' Playing on.</span>' : '<span class="dim">Peak ' + fmt(S.stats.peak) + 'c</span>';
  return h + '</div>';
};

/* ---------- SHIP: a pop-up over whatever you were doing ---------- */
V11.shipModal = function () {
  var h = PAGES.ship().replace(/<button class="btn big blue" data-act="leave">Back to the street<\/button>/, '<button class="btn" data-act="close">Close</button>');
  h = h.replace('<div class="hangar"', V11.voyage() + '<div class="hangar"');
  openModal(h, true); $('modal').classList.add('popmodal', 'shipmodal'); PX.hydrate($('modal'));
};

/* ---------- PLANETS: the star map and every world's notes, without leaving the market ---------- */
V11.planetHTML = function (i) {
  var p = GT.PLANETS[i], here = i === S.loc, cost = GT.jumpCost(S, i), h = '';
  h += '<div class="pphead"><span class="ppdot" style="background:' + p.color + '"></span><div><h3 class="hd" style="color:' + p.color + '">' + esc(p.name) + '</h3><div class="dim">' + esc(p.type) + ' &middot; say <i>' + esc(p.say) + '</i></div></div></div>';
  h += '<p class="ppdesc">' + esc(p.desc) + '</p>';
  var facts = [];
  facts.push(['Tax', (GT.taxInfo(S, i).rate * 100).toFixed(1) + '%']);
  facts.push(['Fuel', p.fuelSold ? 'sold here' : '<span class="bad">none</span>']);
  facts.push(['Shipyard', p.upgrades.length ? p.upgrades.map(function (u) { return GT.UPGRADES[u] ? GT.UPGRADES[u].name : u; }).join(', ') : '<span class="dim">none</span>']);
  facts.push(['Parlour', p.gambling ? 'open' : '<span class="dim">none</span>']);
  facts.push(here ? ['Trip', '<span class="cyan">you are here</span>'] : ['Trip', 'distance <b class="num">' + GT.dist(S.loc, i).toFixed(0) + '</b>, fuel <b class="num ' + (S.ship.fuel >= cost ? '' : 'bad') + '">' + cost + ' PC</b>']);
  h += '<div class="ppfacts">' + facts.map(function (f) { return '<div><span class="dim">' + f[0] + '</span><b>' + f[1] + '</b></div>'; }).join('') + '</div>';
  /* goods: what the world buys dear and sells cheap, straight from its description */
  var dn = GT.demandNote(S, i), rows = '';
  GT.ITEMS.forEach(function (it, k) {
    var r = GT.roleOf(i, k), hot = dn.hi.indexOf(it.name) >= 0, glut = dn.lo.indexOf(it.name) >= 0;
    rows += '<div class="ppgood ' + (r > 0 ? 'hi' : r < 0 ? 'lo' : '') + '">' + UI.itemIcon(k) + '<span class="gn">' + esc(it.name) + '</span><span class="gr">' + (r > 0 ? 'Pays well' : r < 0 ? 'Made here' : 'Fair price') + (hot ? ' <b class="amber">&#9650; rumoured high now</b>' : glut ? ' <b class="cyan">&#9660; glut now</b>' : '') + '</span></div>';
  });
  h += '<h4>Goods</h4><div class="ppgoods">' + rows + '</div>';
  /* anything of yours tied to this world */
  var notes = [], M = S.quests && S.quests.main;
  if (M && M.state !== 'done' && GT.MAIN[M.ch] && GT.MAIN[M.ch].where === i) notes.push('The next chapter of <b>The Ninth Lane</b> happens here.');
  (S.quests ? S.quests.active : []).forEach(function (c) { if (c.to === i) notes.push('Contract: ' + esc(c.title) + '.'); });
  if (S.owned[i]) notes.push('You own a <b>' + esc(GT.facDef(S.owned[i].type).name) + '</b> here.');
  var rv = S.comps.filter(function (c) { return c.loc === i; }); if (rv.length) notes.push('Rivals docked: ' + rv.map(function (c) { return esc(c.name); }).join(', ') + '.');
  if (G.multi) G.players.forEach(function (q) { if (q !== S && q.loc === i) notes.push('Captain ' + esc(q.name) + ' is here.'); });
  if (notes.length) h += '<h4>Your business here</h4><ul class="ppnotes">' + notes.map(function (n) { return '<li>' + n + '</li>'; }).join('') + '</ul>';
  return h;
};
V11.planetsModal = function () {
  if (V11.ppSel == null || V11.ppSel < 0 || V11.ppSel >= GT.PLANETS.length) V11.ppSel = ui.dest != null ? ui.dest : S.loc;
  var i = V11.ppSel, h = '<div class="row"><h2>Planets</h2><button class="btn" data-act="close">Close</button></div><div class="ppgrid"><div class="ppL"><div class="mapwrap ppmap">' + UI.mapSVG(S, i === S.loc ? null : i) + '</div>';
  h += '<div class="pplist">' + GT.PLANETS.map(function (p, k) { return '<button class="ppbtn' + (k === i ? ' on' : '') + (k === S.loc ? ' here' : '') + '" data-act="pp-' + k + '"><span class="ppdot" style="background:' + p.color + '"></span>' + esc(p.name) + '</button>'; }).join('') + '</div>';
  h += '<div class="dim pphint">Click a world, or use the arrow keys. Cyan is where you are; gold is the world you are reading.</div></div><div class="ppR panel">' + V11.planetHTML(i);
  if (i !== S.loc && !S.over) h += '<div class="row pprow">' + (ui.dest === i ? '<span class="amber">Course plotted. Jump from the Spaceport.</span>' : '<button class="btn pink" data-act="pp-dest">Plot a course here</button>') + '</div>';
  h += '</div></div>';
  var m = $('modal'), keep = !m.hidden && m.classList.contains('ppmodal');
  openModal(h, true); m.classList.add('popmodal', 'ppmodal'); PX.hydrate(m);
  if (keep) { var b = m.querySelector('.ppbtn.on'); if (b) b.focus({ preventScroll: true }); }
};
V11.ppPick = function (k) { V11.ppSel = (k + GT.PLANETS.length) % GT.PLANETS.length; SFX.play('click'); V11.planetsModal(); };
document.addEventListener('click', function (e) {
  var pl = e.target.closest && e.target.closest('#modal .ppmap .pl'); if (!pl) return;
  e.stopPropagation(); V11.ppPick(+pl.dataset.i);
}, true);
document.addEventListener('keydown', function (e) {
  var m = $('modal'); if (m.hidden || !m.classList.contains('ppmodal')) return;
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('pl')) { e.preventDefault(); e.stopImmediatePropagation(); V11.ppPick(+e.target.dataset.i); return; }
  var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
  if (d && !(e.target.tagName === 'INPUT')) { e.preventDefault(); e.stopImmediatePropagation(); V11.ppPick(V11.ppSel + d); }
}, true);
/* the pop-up classes go when the sheet closes */
var v11Close2 = closeModal;
closeModal = function () { $('modal').classList.remove('popmodal', 'shipmodal', 'ppmodal'); v11Close2(); };

/* the Spaceport's standings stop talking about a finish line once the race is decided */
var v11Pad = PAGES.pad;
PAGES.pad = function () { var h = v11Pad(); return G && G.result ? h.replace(/<span class="dim">first to [^<]*wins<\/span>/, '<span class="dim">race decided, playing on</span>') : h; };

/* ---------- actions ---------- */
var v11Act = act;
act = function (a, el) {
  if (a === 'playon') { if (G && G.over) V11.playOn(); return; }
  if (S && G && (a === 'ship' || a === 'go-ship')) { V11.shipModal(); return; }
  if (S && G && a === 'planets') { V11.ppSel = null; V11.planetsModal(); return; }
  if (S && G && a.indexOf('pp-') === 0) {
    if (a === 'pp-dest') { ui.dest = V11.ppSel; closeModal(); render(); toast('Course plotted to ' + GT.PLANETS[ui.dest].name + '. Jump from the Spaceport.'); return; }
    V11.ppPick(+a.slice(3)); return;
  }
  return v11Act(a, el);
};

/* ---------- How to play: the v11 notes ---------- */
var v11Info = infoHTML;
infoHTML = function () {
  var x = '<h4>New in version 11</h4><p><b>Play on.</b> When the race ends, the result is logged and the report is shown as before, but <b>Play on</b> lets you keep trading with no finish line. <b>Contracts and quests.</b> You can run three contracts, the story and one guild quest at the same time: each has its own slot. <b>Odd jobs and sabotage</b> are played with the keyboard only (arrow keys or WASD, Space, and the letters shown); sabotage is one of three break-ins: a sneak past the guards, a lock to crack, or a vent crawl past security beams. The top bar: <b>SHIP</b> and <b>PLANETS</b> open over the screen you are on, so you can check the star map from the market and close it again.</p>';
  return v11Info().replace(/(<div class="row" style="justify-content:flex-end"><button class="btn" data-act="close">Got it<\/button><\/div>)$/, x + '$1');
};
