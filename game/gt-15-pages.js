/* Galactic Trader Deluxe. Part 15: the rest of the locations. Shipyard, fuel dock, cantina, alley, property booth, parlour, odd jobs board, launch pad and ship. */

/* ---------- shipyard ---------- */
PAGES.yard = function () {
  var p = plan(), h = '<div class="panel"><h2 class="hd">' + esc(NP.SIGNS[p.id].yard) + '</h2><div class="dim" style="font-size:12px;margin-bottom:6px">Upgrades are only sold on some worlds. A bigger tank arrives empty, so you will need to fill it.</div>';
  ['cargo', 'speed', 'fuel'].forEach(function (k) {
    var u = GT.UPGRADES[k], lv = S.ship.lv[k], avail = GT.upgradeAvail(S, k), maxed = lv >= GT.CFG.UPGRADE_MAX, cost = GT.upgradeCost(S, k);
    var lab = p.upgrades.indexOf(k) < 0 ? 'Not sold here' : maxed ? 'Maxed out' : fmt(cost) + 'c';
    h += '<div class="up-row"><div><span class="nm" style="font:24px var(--display);letter-spacing:.05em">' + u.name + '</span> <span class="dim">Level ' + lv + ' of ' + GT.CFG.UPGRADE_MAX + '</span><div class="dim" style="font-size:13px">' + u.label + '</div>' + bar(lv / GT.CFG.UPGRADE_MAX) + '</div>' + btn(lab, 'up-' + k, avail && cost <= S.credits, 'green') + '</div>';
  });
  var sh = GT.SHIPS.filter(function (x) { return x.id === S.shipId; })[0];
  h += '<div class="row" style="margin-top:10px;align-items:center"><div style="width:200px;background:#0a0620;border:4px solid var(--ink);border-radius:12px">' + UI.shipSVG(sh.id, sh.hue) + '</div><div class="dim" style="flex:1;font-size:13px">Your ' + esc(sh.name) + ': cargo ' + S.ship.cargoMax + ', warp ' + GT.effSpeed(S).toFixed(1) + ', tank ' + S.ship.fuelMax + ' PC.</div></div>';
  return frame('yard', 'yard', h + receipt() + '</div>');
};

/* ---------- fuel dock ---------- */
PAGES.fuel = function () {
  var p = plan(), fp = GT.fuelPrice(S, S.loc), room = S.ship.fuelMax - S.ship.fuel, h = '<div class="panel"><h2 class="hd">' + esc(NP.SIGNS[p.id].fuel) + '</h2>';
  h += '<div class="row"><div><div class="dim">Price per PC</div><div style="font:44px var(--display);letter-spacing:.05em" class="num">' + fp + 'c</div>' + (GT.depotCut(S) ? '<div class="good" style="font-size:12px">Your depots take ' + Math.round(GT.depotCut(S) * 100) + '% off.</div>' : '') + '</div>';
  h += '<div style="flex:1;min-width:200px"><div class="dim">Tank</div><div class="num" style="font:30px var(--display);letter-spacing:.05em">' + S.ship.fuel + ' / ' + S.ship.fuelMax + ' PC</div>' + bar(S.ship.fuel / S.ship.fuelMax, 'f') + '</div></div>';
  h += '<div class="acts" style="margin-top:12px">' + btn('Refuel +10', 'ref10', room > 0 && S.credits >= fp, 'green') + btn('Fill the tank', 'refall', room > 0 && S.credits >= fp, 'green') + '</div>';
  h += '<div class="dim" style="font-size:12px;margin-top:8px">You carry ' + fmt(S.credits) + 'c. A full tank would cost ' + fmt(room * fp) + 'c.</div>';
  return frame('fuel', 'fuel', h + receipt() + '</div>');
};

/* ---------- cantina: seek an encounter ---------- */
function storyCard(done, key, doneLabel, idleLabel, act) {
  var h = '<div class="acts" style="margin-top:10px">' + btn(done ? doneLabel : idleLabel, act, !done && !S.pending, 'pink big') + '</div>';
  if (ui.last && ui.last.key === key && ui.last.loc === S.loc && ui.last.turn === S.turn) h += '<div class="le ' + ui.last.kind + '" style="margin-top:10px;font-size:15px">' + ui.last.text + '</div>';
  else if (done) h += receipt();
  return h;
}
PAGES.cantina = function () {
  var p = plan(), w = NP.who(p.id), h = '<div class="panel"><h2 class="hd">' + esc(NP.SIGNS[p.id].cantina) + '</h2><p style="margin:0">A booth in the corner is occupied by <b>' + esc(w.name) + '</b>, ' + esc(w.job) + '. You may buy them a drink and see what happens. Once per visit.</p>';
  return frame('cantina', 'cantina', h + storyCard(S.visit.encountered, 'encounter', 'You already talked to them', 'Seek an Encounter', 'encounter') + '</div>');
};

/* ---------- back alley: explore ---------- */
PAGES.alley = function () {
  var h = '<div class="panel"><h2 class="hd">The Back Alley</h2><p style="margin:0">Bins, steam, a flickering sign, and the distinct feeling of being watched by someone with a lot of eyes. You can poke around once per visit.</p>';
  return frame('alley', 'alley', h + storyCard(S.visit.explored, 'explore', 'You already poked around', 'Explore the Alley', 'explore') + '</div>');
};

/* ---------- property booth: facilities ---------- */
PAGES.office = function () {
  var v = S.visit, own = S.owned[S.loc], h = '<div class="panel"><h2 class="hd">' + esc(NP.SIGNS[plan().id].office) + '</h2>';
  if (v.offer) {
    var f = GT.facDef(v.offer.type);
    h += '<div class="panel" style="background:var(--paper)"><div class="row"><h3 class="hd" style="font-size:28px">' + f.name + ' for sale!</h3><b class="num amber" style="font:34px var(--display)">' + fmt(v.offer.price) + 'c</b></div><p style="margin:4px 0 10px">' + f.blurb + ' ' + GT.facBenefitText(v.offer.type, v.offer.B) + '.</p>' + btn('Buy it', 'facility', v.offer.price <= S.credits, 'green big') + '<div class="dim" style="font-size:12px;margin-top:6px">The offer stands while you are docked, so sell cargo first if you are short. You have ' + fmt(S.credits) + 'c.</div></div>';
  } else if (own) h += '<div class="panel" style="background:var(--paper)"><b class="good" style="font-size:18px">You own the ' + GT.facDef(own.type).name + ' on this world.</b><p style="margin:4px 0 0" class="dim">It keeps your reputation up and collects fees from rivals.</p></div>';
  else h += '<p>No properties on offer today.</p>';
  var mine = Object.keys(S.owned).map(function (k) { return GT.PLANETS[+k].name + ': ' + GT.facDef(S.owned[k].type).name; });
  h += '<div class="dim" style="font-size:13px;margin-top:10px">Your holdings: ' + (mine.length ? esc(mine.join(' | ')) : 'none yet.') + '</div>';
  return frame('office', 'office', h + (S.log[0] && /facility|bought|Bought/.test(S.log[0].text) ? receipt() : '') + '</div>');
};

/* ---------- parlour of thin hours (the gambling planet) ---------- */
PAGES.parlour = function () {
  var h = '<div class="panel"><h2 class="hd">The Parlour of Thin Hours</h2><p style="margin:0">Smoke, low light and no printed rules. Four games. The odds are described only in words, and nobody will confirm any of them.</p><div class="acts" style="margin-top:12px">' + btn('Take a seat', 'sit', GT.canGamble(S), 'pink big') + '</div>' + receipt() + '</div>';
  return frame('parlour', 'parlour', h);
};
function gambleModal(last) {
  var h = '<div class="row"><h2>The Parlour of Thin Hours</h2><b class="num">' + fmt(S.credits) + 'c</b></div><p class="dim">' + esc(GT.GAME_LUCK_NOTE) + '</p>';
  if (last) h += '<div class="le ' + (last.net > 0 ? 'gain' : last.net < 0 ? 'loss' : 'event') + '"><b>' + (last.net > 0 ? '+' : last.net < 0 ? '-' : '') + fmt(Math.abs(last.net)) + 'c</b> &nbsp;' + esc(last.text) + '</div>';
  GT.GAMES.forEach(function (g, gi) {
    h += '<div class="panel" style="background:var(--paper)"><b style="font:22px var(--display);letter-spacing:.05em">' + esc(g.name) + '</b><p class="dim" style="font-size:13px;margin:4px 0 8px">' + esc(g.blurb) + '</p><div class="acts">';
    GT.STAKES.forEach(function (st) { h += '<button class="btn gold" data-act="gamble-' + gi + '-' + st + '"' + (st <= S.credits ? '' : ' disabled') + '>' + fmt(st) + 'c</button>'; });
    h += '</div></div>';
  });
  openModal(h + '<div class="row" style="justify-content:flex-end"><button class="btn" data-act="close">Leave the table</button></div>', true);
}

/* ---------- odd jobs: the action mini-games live here ---------- */
GT.JOB_BLURB = {
  pests: 'Whack the garden pests before they eat the pumpkins. Do not whack the farmer\'s cat. He will know.', tomb: 'Run the tomb corridor. Dodge the spikes, scarabs and boulders, and grab the gems.', ore: 'Left for ORE, right for JUNK. The belt gets faster, and so does the foreman.',
  traffic: 'Fly your delivery drone across eight lanes of angry skybuses. Make as many drops as you can.', debris: 'Blast the floating junk before it blasts you. Three hull points. Do not be clever.', catch: 'Slide the beaker under the good particles. Avoid the red ones. Some of them flicker. That is science.',
  cloud: 'Hold to climb, let go to dive. Thread the storm rings and keep your wings dry.'
};
PAGES.jobs = function () {
  var j = GT.job(S), S0 = GT.scale(S), done = !GT.jobAvailable(S), top = Math.round(S0 * GT.JOB_PAY[3] / 5) * 5, h = '<div class="panel"><h2 class="hd">Odd Jobs Board</h2>';
  h += '<div class="panel" style="background:var(--paper)"><div class="row"><b style="font:34px var(--display);letter-spacing:.05em;color:var(--pink)">' + esc(j.name) + '</b><span class="tax">Gold pays about ' + fmt(top) + 'c</span></div><div class="dim" style="font-size:13px">at ' + esc(j.where) + '</div><p style="margin:8px 0">' + esc(GT.JOB_BLURB[j.id]) + '</p>';
  h += '<div class="dim" style="font-size:12px">Ratings: Flop pays nothing, Bronze a little, Silver decent, Gold the most plus a point of reputation. One job per visit, so make it count.</div><div class="acts" style="margin-top:10px">' + btn(done ? 'Job done for today' : 'Take the job', 'job-start', !done, 'pink big') + '</div></div>' + (done ? receipt() : '') + '</div>';
  return frame('jobs', 'jobs', h);
};

/* ---------- launch pad: star map, trip plan and standings ---------- */
PAGES.pad = function () {
  var d = ui.dest, P = GT.PLANETS, h = '<div class="pad-pages"><div class="row"><h2 class="hd" style="margin:0">Launch Pad</h2><button class="btn big blue" data-act="leave">Back to the street</button></div><div class="padgrid"><div><div class="mapwrap">' + UI.mapSVG(S, d) + '</div><div class="dim" style="font-size:12px;margin-top:4px">Click a world to plan a jump. Red diamonds are rival traders.</div></div><div class="padcol">';
  h += '<div class="panel"><h3 class="hd">Trip plan</h3>';
  if (d === null || d === S.loc) h += '<p class="dim" style="margin:0">Select a destination on the map.</p>';
  else {
    var p = P[d], cost = GT.jumpCost(S, d), ok = S.ship.fuel >= cost, rivals = S.comps.filter(function (c) { return c.loc === d; });
    h += '<div class="row"><b style="font:26px var(--display);letter-spacing:.05em;color:' + p.color + '">' + esc(p.name) + '</b><span class="dim">' + p.type + '</span></div><p class="dim" style="font-size:13px;margin:2px 0 6px">' + esc(p.desc) + '</p>';
    h += '<p style="margin:0 0 6px">Distance <b class="num">' + GT.dist(S.loc, d).toFixed(0) + '</b> &middot; Fuel cost <b class="num ' + (ok ? '' : 'bad') + '">' + cost + ' PC</b> <span class="dim">(you have ' + S.ship.fuel + ')</span></p>';
    if (rivals.length) h += '<p class="dim" style="font-size:12px;margin:0 0 6px">Rivals docked there: ' + rivals.map(function (c) { return esc(c.name); }).join(', ') + '.</p>';
    if (!ok) h += '<p class="bad" style="margin:0 0 6px"><b>Warning:</b> not enough fuel for this jump. ' + (P[S.loc].fuelSold ? 'Visit the Fuel Dock first.' : 'There is no fuel dock here.') + '</p>';
    h += btn('Jump', 'jump', GT.canJump(S, d), 'pink big');
  }
  if (GT.stranded(S) && !S.over) { var tt = P[GT.towTarget(S)]; h += '<p class="bad" style="margin:10px 0 6px"><b>Stranded:</b> not enough fuel for any jump.</p>' + btn('Call a tow to ' + esc(tt.name) + ' (' + GT.CFG.TOW_COST + 'c)', 'tow', !S.pending, 'gold'); }
  h += '</div>';
  var rows = S.comps.map(function (c) { return { name: c.name + ' ' + c.title, cargo: c.cargo, speed: c.speed, w: c.wealth, me: false }; });
  rows.push({ name: S.name + ' (you)', cargo: S.ship.cargoMax, speed: GT.effSpeed(S), w: GT.networth(S), me: true }); rows.sort(function (a, b) { return b.w - a.w; });
  h += '<div class="panel"><h3 class="hd">Leaderboard</h3><div style="overflow-x:auto"><table><tr><th>#</th><th>Trader</th><th class="r">Cargo</th><th class="r">Speed</th><th class="r">Wealth</th></tr>';
  rows.forEach(function (r, i) { h += '<tr class="' + (r.me ? 'me' : '') + '"><td>' + (i + 1) + '</td><td>' + esc(r.name) + '</td><td class="r">' + r.cargo + '</td><td class="r">' + r.speed.toFixed(1) + '</td><td class="r">' + fmt(r.w) + 'c</td></tr>'; });
  return h + '</table></div><div class="dim" style="font-size:12px;margin-top:4px">Wealth is credits plus bank minus loans. Reach ' + fmt(GT.CFG.WIN) + 'c to win.</div></div></div></div></div>';
};

/* ---------- ship and captain ---------- */
PAGES.ship = function () {
  var sh = GT.SHIPS.filter(function (x) { return x.id === S.shipId; })[0], c = S.char, h = '<div class="pad-pages"><div class="row"><h2 class="hd" style="margin:0">Captain and Ship</h2><button class="btn big blue" data-act="leave">Back to the street</button></div><div class="padgrid"><div class="panel">';
  h += '<div class="row" style="align-items:flex-start;flex-wrap:nowrap"><div style="width:130px;flex:none">' + CH.portrait(c) + '</div><div style="min-width:0"><div style="font:30px var(--display);letter-spacing:.05em;color:var(--pink)">' + esc(S.name) + '</div><div class="amber" style="font:19px var(--display);letter-spacing:.06em">' + esc(c.title) + '</div><p style="margin:4px 0;font-style:italic">&ldquo;' + esc(c.catch) + '&rdquo;</p></div></div>';
  h += '<p style="font-size:13px;margin:8px 0">' + esc(c.story) + '</p><div class="fate">' + c.fate.map(function (r) { return '<span>' + r[0] + '</span><span>' + esc(String(r[1])) + '</span>'; }).join('') + '</div></div>';
  h += '<div class="padcol"><div class="panel"><h3 class="hd">' + esc(sh.name) + '</h3><div style="background:#0a0620;border:4px solid var(--ink);border-radius:12px">' + UI.shipSVG(sh.id, sh.hue) + '</div><div class="dim" style="font-size:13px;margin-top:6px">' + esc(sh.desc) + '</div><div class="row" style="margin-top:6px"><span>Cargo ' + S.ship.cargoMax + '</span><span>Warp ' + GT.effSpeed(S).toFixed(1) + '</span><span>Tank ' + S.ship.fuelMax + ' PC</span><span>Rep ' + S.rep + ' (' + repLabel(S.rep) + ')</span></div></div></div></div>';
  h += '<div class="panel"><h3 class="hd">Cargo hold</h3><div class="pocket">';
  S.cargo.forEach(function (c2, i) { h += '<div class="slot ' + (c2.qty ? '' : 'empty') + '">' + UI.itemIcon(i) + '<div style="font:15px var(--display);letter-spacing:.05em">' + GT.ITEMS[i].name + '</div><b class="num">' + c2.qty + '</b>' + (c2.qty ? '<div class="dim" style="font-size:11px">avg ' + c2.avg.toFixed(1) + 'c</div>' : '') + '</div>'; });
  return h + '</div></div></div>';
};
