/* Galactic Trader 4. Part 35: the Spaceport (the star map page) and the Ship page.
   The spaceport shows the star map, the trip plan with passenger fares and advertising, the standings, and a view of your ship on its landing pad with flashing lights, a city
   behind it and very small people, so you can see how big a ship really is. The ship page shows the ship large with speech bubbles that point at its parts. */
var PORT = { cache: {} };

/* ---------- the landing pad picture: 280 x 100 pixels, shown at 2x ---------- */
PORT.person = function (B, x, y, shirt, skin, pants, hat) {            /* a person 7 pixels tall, feet at (x, y) */
  B.rect(x + 1, y - 7, 1, 2, skin); if (hat !== undefined) B.px(x + 1, y - 8, hat);
  B.rect(x, y - 5, 3, 3, shirt); B.rect(x, y - 2, 1, 2, pants); B.rect(x + 2, y - 2, 1, 2, pants);
};
PORT.crate = function (B, x, y, w, h) { B.rect(x, y - h, w, h, PX.N); B.rect(x, y - h, w, 1, PX.Y); B.rect(x, y - 1, w, 1, PX.R); if (w > 3) B.line(x + 1, y - h + 1, x + w - 2, y - 2, PX.R); };
PORT.building = function (B, th, kind, x, base, w, h, c0, c1, night, rnd) {
  var i, j, lit = function () { return night ? PX.E + PX.Y : th.g; };
  if (kind === 'ruin') { for (i = 0; i < 4; i++) { var sw = w - i * Math.floor(w / 5), sh = Math.floor(h / 4); B.rect(x + (w - sw) / 2, base - sh * (i + 1), sw, sh, i % 2 ? c1 : c0); } B.rect(x + w / 2 - 1, base - 6, 3, 6, PX.K); return; }
  if (kind === 'mine') { B.rect(x, base - h, w, h, c0); B.rect(x + w - 2, base - h, 2, h, c1); B.rect(x - 1, base - h, w + 2, 2, PX.R); for (i = 0; i < 3; i++) B.px(x + 1 + i * 2 + (rnd() < 0.5 ? 1 : 0), base - h - 3 - i * 3, PX.L); return; }
  if (kind === 'void') { B.rect(x + w / 2 - 1, base - h, 2, h, c1); B.ell(x + w / 2, base - h, w / 2 + 1, 3, c0); B.rect(x, base - h - 1, w, 1, th.t); if (night) B.px(x + w / 2, base - h, PX.E + PX.LM); return; }
  if (kind === 'lab') { B.rect(x, base - h * 0.55, w, h * 0.55, c0); B.ell(x + w / 2, base - h * 0.55, w / 2, h * 0.45, c0); B.rect(x + w - 3, base - h * 0.55, 3, h * 0.55, c1); B.line(x + w / 2, base - h - 4, x + w / 2, base - h + 2, PX.D); B.px(x + w / 2, base - h - 4, night ? PX.E + PX.LR : PX.LR); return; }
  if (kind === 'cloud') { B.line(x + w / 2, base - h * 0.5, x + w / 2, base, PX.D); B.ell(x + w / 2, base - h * 0.75, w / 2, h * 0.3, c0); B.ell(x + w / 2 + 2, base - h * 0.75, w / 3, h * 0.28, c1); B.rect(x + w / 2 - 2, base - h * 0.45, 4, 2, PX.N); return; }
  if (kind === 'farm') { B.rect(x, base - h * 0.6, w, h * 0.6, c0); B.poly([x - 1, base - h * 0.6, x + w / 2, base - h, x + w + 1, base - h * 0.6], th.r); B.rect(x + w - 3, base - h * 0.6, 3, h * 0.6, c1); B.rect(x + w / 2 - 1, base - 5, 3, 5, PX.N); return; }
  B.rect(x, base - h, w, h, c0); B.rect(x + w - 3, base - h, 3, h, c1); B.rect(x - 1, base - h - 1, w + 2, 2, th.r);
  for (j = 0; j < h - 5; j += 4) for (i = 2; i < w - 4; i += 4) if (rnd() < (night ? 0.55 : 0.8)) B.px(x + i, base - h + 3 + j, lit());
  if (kind === 'neon') { B.rect(x + w / 2 - 1, base - h - 6, 2, 6, PX.D); B.px(x + w / 2 - 1, base - h - 7, night ? PX.E + PX.LR : PX.LR); }
};
PORT.build = function (s) {
  var p = GT.PLANETS[s.loc], pid = p.id, th = SC.TH[pid], night = SC.night(s), rnd = GT.seeded(CH.hash('pad' + pid + (night ? 'n' : 'd'))), B = new PX.Buf(280, 100), i, x, a, kind = th.orn === 'farm' ? 'farm' : th.orn === 'ruin' ? 'ruin' : th.orn === 'mine' ? 'mine' : th.orn === 'void' ? 'void' : th.orn === 'lab' ? 'lab' : th.orn === 'cloud' ? 'cloud' : 'tower';
  var sky = night ? th.nsky : th.sky, HZ = 66;
  B.vgrad(0, 0, 280, HZ, sky);
  if (night) { for (i = 0; i < 70; i++) B.px(Math.floor(rnd() * 280), Math.floor(rnd() * 50), rnd() < 0.3 ? PX.W : PX.L); B.ell(238, 14, 6, 6, PX.L); B.ell(240, 13, 5, 5, PX.W); B.ell(236, 12, 2, 2, PX.L); }
  else { B.ell(238, 15, 10, 10, PX.dith(th.sun, PX.W, 5)); B.ell(238, 15, 6, 6, th.sun); B.ell(236, 13, 2, 2, PX.W); }
  /* far skyline: pale, dithered silhouettes with a few lit windows */
  for (x = -4; x < 284; x += 9 + Math.floor(rnd() * 9)) { var w = 8 + Math.floor(rnd() * 9), h = 14 + Math.floor(rnd() * 32); PORT.building(B, th, kind === 'cloud' ? 'cloud' : kind, x, HZ, w, h, PX.dith(th.far[0], th.far[1], 7), th.far[1], night, rnd); }
  /* the near buildings flank the pad */
  var sets = th.sets;
  [[-2, 20, 50], [18, 14, 34], [236, 20, 58], [258, 16, 40]].forEach(function (b, k) { var st = sets[k % sets.length]; PORT.building(B, th, kind, b[0], HZ + 2, b[1], b[2], st.a, st.b, night, rnd); });
  /* the ground and its pattern */
  B.rect(0, HZ, 280, 34, PX.dith(th.ground[0], th.ground[1], 5)); B.rect(0, HZ, 280, 1, th.ground[1]);
  var gt = th.gt;
  if (gt === 'dirt' || gt === 'cinder') for (i = 0; i < 160; i++) B.px(Math.floor(rnd() * 280), HZ + 2 + Math.floor(rnd() * 30), rnd() < 0.5 ? th.ground[1] : th.road[0]);
  else for (i = 0; i < 280; i += 14) B.line(i, HZ + 1, i - 40 + Math.floor((i - 140) * 0.3), 99, th.ground[1]);
  for (i = 0; i < 4; i++) B.line(0, HZ + 5 + i * i * 2, 279, HZ + 5 + i * i * 2, th.ground[1]);
  /* the pad: a big oval of concrete, a ring of painted dashes and its number */
  B.ell(140, 83, 86, 14, PX.D); B.ell(140, 81, 84, 13, PX.L); B.ell(140, 80, 80, 11, PX.dith(PX.L, PX.W, 6)); B.ring(140, 81, 84, 13, PX.W);
  for (a = 0; a < 6.283; a += 0.07) if (Math.floor(a / 0.07) % 3) B.px(140 + Math.cos(a) * 72, 81 + Math.sin(a) * 10.5, PX.Y);
  B.text(127, 88, 'PAD 7', PX.Y, 1);
  B.ell(140, 82, 44, 7, PX.dith(PX.L, PX.D, 7));          /* the ship's shadow */
  /* a fuelling gantry on the left, with a red beacon */
  B.line(50, 80, 54, 22, PX.D); B.line(62, 80, 58, 22, PX.D); for (i = 0; i < 7; i++) { var yy = 26 + i * 8; B.line(52 + (80 - yy) * 0.0, yy, 60, yy + 6, PX.D); B.line(60, yy, 52, yy + 6, PX.D); } B.rect(53, 20, 7, 3, PX.L);
  /* a ticket gate and a luggage trolley */
  B.rect(66, 82, 3, 8, PX.D); B.rect(88, 82, 3, 8, PX.D); B.rect(66, 80, 25, 2, PX.Y); B.rect(66, 80, 25, 1, PX.R);
  B.rect(206, 84, 10, 3, PX.D); PORT.crate(B, 207, 84, 4, 4); PORT.crate(B, 212, 84, 4, 3); PORT.crate(B, 209, 80, 4, 4);
  /* very small people: a boarding queue (one per berth, up to five), dock workers and a pilot */
  var skins = [PX.LR, PX.N, PX.W, PX.Y], shirts = [PX.LC, PX.LM, PX.LG, PX.Y, PX.LR, PX.W, PX.LB], q = Math.min(5, s.ship.paxMax);
  for (i = 0; i < q; i++) PORT.person(B, 70 + i * 4, 90, shirts[(i * 3 + 1) % shirts.length], skins[i % 4], PX.B, i === 1 ? PX.N : undefined);
  PORT.person(B, 198, 88, PX.LR, PX.N, PX.D, PX.Y); PORT.person(B, 218, 88, PX.Y, PX.LR, PX.D, PX.Y); PORT.person(B, 104, 95, PX.W, PX.N, PX.B); PORT.person(B, 176, 96, PX.LC, PX.LR, PX.B);
  PORT.person(B, 252, 96, PX.LM, PX.W, PX.D); PORT.person(B, 28, 96, PX.LG, PX.N, PX.D);
  /* the safety rail along the front, as if you stood at the viewing gallery */
  B.rect(0, 97, 280, 3, PX.K); for (i = 0; i < 280; i += 10) B.rect(i, 94, 2, 6, PX.K); B.rect(0, 94, 280, 1, PX.D);
  return B;
};
/* rim lights and beacons are HTML so they can flash. Positions are in picture pixels (0..280, 0..100). */
PORT.lights = function () {
  var out = '', i, a;
  for (i = 0; i < 12; i++) { a = i / 12 * 6.283; out += '<i class="pl2 ' + (i % 2 ? 'b' : 'a') + '" style="left:' + ((140 + Math.cos(a) * 84) / 280 * 100).toFixed(2) + '%;top:' + ((81 + Math.sin(a) * 13) / 100 * 100).toFixed(2) + '%"></i>'; }
  out += '<i class="pl2 beacon" style="left:' + (56.5 / 280 * 100).toFixed(2) + '%;top:' + (17 / 100 * 100) + '%"></i>';
  out += '<i class="pl2 beacon d" style="left:' + (141 / 280 * 100).toFixed(2) + '%;top:' + (32 / 100 * 100) + '%"></i>';
  return out;
};
PORT.view = function () {
  var key = S.loc + '|' + (SC.night(S) ? 'n' : 'd') + '|' + Math.min(5, S.ship.paxMax), u = PORT.cache[key];
  if (!u) u = PORT.cache[key] = PX.render(PORT.build(S), SC.night(S)).toDataURL();
  var sh = GT.SHIPS.filter(function (x) { return x.id === S.shipId; })[0];
  return '<div class="padview" aria-label="Your ship on its landing pad"><img class="pxi pbg" src="' + u + '" width="280" height="100" alt="">' + PX.svg(UI.shipSVG(sh.id, sh.hue), 90, 52, 'padship', 2, 40) + PORT.lights() + '<span class="pcap">' + esc(sh.name) + ' &middot; ' + esc(S.name) + '</span></div>';
};

/* ---------- passengers: fare, expected crowd, advertising ---------- */
PORT.paxInfo = function (d) {
  var fair = GT.fairFare(S, d), fare = GT.fare(S, d), ad = GT.adActive(S, d);
  if (S.fareMult == null) return '<span class="dim">Not selling tickets: the ' + S.ship.paxMax + ' berth' + (S.ship.paxMax > 1 ? 's' : '') + ' will fly empty. Set a fare to take passengers.</span>';
  var e = GT.paxExpected(S, d), ratio = S.fareMult, mood = ratio < 0.75 ? 'a bargain: lots of interest' : ratio < 1.2 ? 'about fair' : ratio < 1.8 ? 'pricey: fewer will pay' : 'extortion: almost nobody will pay';
  return 'Fare <b class="num">' + fmt(fare) + 'c</b> (fair price about ' + fmt(fair) + 'c, ' + mood + '). Expect about <b class="num">' + e.toFixed(1) + '</b> of ' + S.ship.paxMax + ' berths filled: roughly <b class="good num">+' + fmt(Math.round(e * fare)) + 'c</b>.' + (ad ? ' <span class="good">Ad running for ' + ad + ' more jump' + (ad > 1 ? 's' : '') + '.</span>' : '');
};
PORT.paxBlock = function (d) {
  var fare = GT.fare(S, d), cost = GT.adCost(S, d), ad = GT.adActive(S, d);
  var h = '<div class="pax"><div class="prow"><b class="pt">Passengers</b><span class="dim">Berths ' + S.ship.paxMax + ' &middot; reputation ' + S.rep + ' brings more</span></div>';
  h += '<div class="prow"><label>Fare <input class="val" id="in-fare" type="number" min="0" step="5" value="' + (S.fareMult == null ? '' : fare) + '" placeholder="off" aria-label="Fare per passenger"> c</label>' + btn('Cheap', 'fare-lo', !S.over, 'green') + btn('Fair', 'fare-mid', !S.over, 'gold') + btn('Pricey', 'fare-hi', !S.over, 'pink') + btn('Off', 'fare-off', S.fareMult != null, '') + '</div>';
  h += '<div class="pinfo2" id="paxinfo">' + PORT.paxInfo(d) + '</div>';
  h += '<div class="prow">' + btn('Advertise on ' + esc(GT.PLANETS[d].name) + ' (' + fmt(cost) + 'c)', 'advertise', GT.canAdvertise(S, d), 'blue') + '<span class="dim">' + (ad ? 'Poster campaign live: x' + GT.PAX.AD_MULT + ' interest, ' + ad + ' jump' + (ad > 1 ? 's' : '') + ' left.' : 'Posters on the destination bring about ' + GT.PAX.AD_MULT + 'x the passengers for ' + GT.PAX.AD_TURNS + ' jumps.') + '</span></div></div>';
  return h;
};
ACTX.push(function (a) {
  if (a.indexOf('fare-') === 0) { if (a === 'fare-off') S.fareMult = null; else S.fareMult = { 'fare-lo': 0.7, 'fare-mid': 1, 'fare-hi': 1.5 }[a]; return true; }
  if (a === 'advertise') { if (ui.dest != null && GT.advertise(S, ui.dest)) SFX.play('coin'); else SFX.play('bad'); return true; }
  return false;
});
INPX.push(function (t, v) {
  if (t.id !== 'in-fare') return false;
  if (!(v > 0)) S.fareMult = null; else GT.setFare(S, v, ui.dest);
  var el = $('paxinfo'); if (el && ui.dest != null) el.innerHTML = PORT.paxInfo(ui.dest);
  return true;
});

/* ---------- the spaceport page ---------- */
PAGES.pad = function () {
  var d = ui.dest, P = GT.PLANETS, here = P[S.loc], tx = GT.taxInfo(S, S.loc);
  var h = '<div class="pad-pages port"><div class="row ptop"><h2 class="hd">Spaceport &middot; ' + esc(here.name) + '</h2><button class="btn big blue" data-act="leave">Back to the street</button></div>';
  h += '<div class="portgrid"><div class="portL"><div class="mapwrap">' + UI.mapSVG(S, d) + '</div>' + PORT.view() + '</div><div class="portR">';
  h += '<div class="panel here"><div class="row"><h3 class="hd" style="color:' + here.color + '">You are at ' + esc(here.name) + '</h3><span class="dim">' + here.type + '</span></div>' + (d === null || d === S.loc ? '<p class="hdesc">' + esc(here.desc) + '</p>' : '') + '<div class="dim">Tax ' + (tx.rate * 100).toFixed(1) + '% &middot; ' + (here.fuelSold ? 'fuel sold here' : 'no fuel dock') + ' &middot; ' + (here.upgrades.length ? 'shipyard open' : 'no shipyard') + (here.gambling ? ' &middot; has a gambling parlour' : '') + '</div></div>';
  h += '<div class="panel trip"><h3 class="hd">Trip plan</h3>';
  if (d === null || d === S.loc) h += '<p class="dim" style="margin:0">Click a world on the star map to plan a jump.</p>';
  else {
    var p = P[d], cost = GT.jumpCost(S, d), ok = S.ship.fuel >= cost, rivals = S.comps.filter(function (c) { return c.loc === d; }), sf = speedFacts(GT.effSpeed(S));
    h += '<div class="row"><b style="font:11px var(--display);color:' + p.color + '">' + esc(p.name) + '</b><span class="dim">' + p.type + ' &middot; tax ' + (p.tax * 100).toFixed(1) + '%</span></div>';
    h += '<p class="hdesc tdesc">' + esc(p.desc) + '</p>';
    h += '<p class="tline">Distance <b class="num">' + GT.dist(S.loc, d).toFixed(0) + '</b> &middot; Fuel <b class="num ' + (ok ? '' : 'bad') + '">' + cost + ' PC</b> <span class="dim">(you have ' + S.ship.fuel + ')</span> &middot; <span class="dim">warp ' + GT.effSpeed(S).toFixed(1) + ' burns ' + sf.fuel + '%, dodges ' + sf.dodge + '%</span></p>';
    if (rivals.length) h += '<p class="tline dim">Rivals docked there: ' + rivals.map(function (c) { return esc(c.name); }).join(', ') + '.</p>';
    if (!ok) h += '<p class="tline bad"><b>Warning:</b> not enough fuel for this jump. ' + (here.fuelSold ? 'Visit the Fuel Dock first.' : 'There is no fuel dock here.') + '</p>';
    h += PORT.paxBlock(d) + '<div class="jumprow">' + btn('Jump to ' + esc(p.name), 'jump', GT.canJump(S, d), 'pink big') + '</div>';
  }
  if (GT.stranded(S) && !S.over) { var tt = P[GT.towTarget(S)]; h += '<p class="tline bad"><b>Stranded:</b> not enough fuel for any jump.</p>' + btn('Call a tow to ' + esc(tt.name) + ' (' + GT.CFG.TOW_COST + 'c)', 'tow', !S.pending, 'gold'); }
  h += '</div>';
  var rows = S.comps.map(function (c) { return { name: c.name + ' ' + c.title, w: c.wealth, me: false }; });
  G.players.forEach(function (q) { rows.push({ name: q.name + (q === S ? ' (you)' : G.multi ? ' (captain)' : ''), w: GT.networth(q), me: q === S, out: !!(q.over && !q.over.won) }); }); rows.sort(function (a, b) { return b.w - a.w; });
  h += '<div class="panel lead"><h3 class="hd">Standings <span class="dim">first to ' + fmt(GT.CFG.WIN) + 'c wins</span></h3><table>';
  rows.forEach(function (r, i) { h += '<tr class="' + (r.me ? 'me' : '') + '"><td>' + (i + 1) + '</td><td>' + esc(r.name) + (r.out ? ' <span class="bad">(out)</span>' : '') + '</td><td class="r">' + fmt(r.w) + 'c</td></tr>'; });
  return h + '</table></div></div></div></div>';
};

/* ---------- the ship page ---------- */
/* where each part is on each ship picture, as a fraction of the picture */
PORT.PARTS = {
  wayfarer:  { engine: [0.08, 0.52], cockpit: [0.72, 0.48], cargo: [0.52, 0.62], cabin: [0.40, 0.51], fuel: [0.52, 0.82] },
  barge:     { engine: [0.11, 0.52], cockpit: [0.88, 0.47], cargo: [0.55, 0.26], cabin: [0.66, 0.58], fuel: [0.40, 0.82] },
  stargazer: { engine: [0.09, 0.52], cockpit: [0.85, 0.49], cargo: [0.58, 0.52], cabin: [0.50, 0.27], fuel: [0.40, 0.68] },
  cutlass:   { engine: [0.12, 0.37], cockpit: [0.73, 0.47], cargo: [0.40, 0.50], cabin: [0.56, 0.46], fuel: [0.40, 0.80] }
};
PAGES.ship = function () {
  var sh = GT.SHIPS.filter(function (x) { return x.id === S.shipId; })[0], c = S.char, pts = PORT.PARTS[sh.id], W = 1240, H = 380, SW = 448, SH = 261, SX = (W - SW) / 2, SY = (H - SH) / 2;
  var es = GT.effSpeed(S), sf = speedFacts(es), used = GT.cargoUsed(S), dmg = es < S.ship.speed - 0.01;
  var box = {
    engine: { x: 10, y: 40, side: 'L', t: 'Warp engine', b: 'Warp <b class="num">' + es.toFixed(1) + '</b>' + (dmg ? ' <span class="bad">(damaged)</span>' : '') + '<br>Burns ' + sf.fuel + '% fuel, dodges ' + sf.dodge + '% of hazards' },
    fuel: { x: 10, y: 232, side: 'L', t: 'Fuel tank', b: '<b class="num">' + S.ship.fuel + ' / ' + S.ship.fuelMax + ' PC</b>' + bar(S.ship.fuel / S.ship.fuelMax, 'f') + '<br>' + (GT.PLANETS[S.loc].fuelSold ? 'Fuel is sold here.' : 'No fuel dock on this world.') },
    cockpit: { x: 910, y: 8, side: 'R', t: 'Cockpit', b: 'Captain <b>' + esc(S.name) + '</b><br>Reputation <b class="num">' + S.rep + '</b> (' + repLabel(S.rep) + '): less tax, more passengers' },
    cargo: { x: 910, y: 134, side: 'R', t: 'Cargo hold', b: '<b class="num">' + used + ' / ' + S.ship.cargoMax + '</b> crates' + bar(used / S.ship.cargoMax, '') + '<br>Worth about ' + fmt(Math.round(S.cargo.reduce(function (t, c3) { return t + c3.qty * c3.avg; }, 0))) + 'c at cost' },
    cabin: { x: 910, y: 260, side: 'R', t: 'Passenger cabins', b: '<b class="num">' + S.ship.paxMax + '</b> berth' + (S.ship.paxMax > 1 ? 's' : '') + '<br>' + (S.fareMult == null ? 'Tickets are off. Set a fare at the Spaceport.' : 'Fare multiplier x' + S.fareMult.toFixed(2) + ' of the going rate') }
  };
  var tails = '', bub = '';
  Object.keys(box).forEach(function (k) {
    var o = box[k], bw = 320, bh = 112, ax = SX + pts[k][0] * SW, ay = SY + pts[k][1] * SH, bx = o.side === 'L' ? o.x + bw - 8 : o.x + 8, by = o.y + bh / 2;
    tails += '<polygon points="' + bx + ',' + (by - 11) + ' ' + bx + ',' + (by + 11) + ' ' + ax.toFixed(0) + ',' + ay.toFixed(0) + '" fill="#fff" stroke="#000" stroke-width="3" stroke-linejoin="miter"/>';
    tails += '<rect class="dot" x="' + (ax - 5).toFixed(0) + '" y="' + (ay - 5).toFixed(0) + '" width="10" height="10" fill="#ffff55" stroke="#000" stroke-width="3"/>';
    bub += '<div class="co" style="left:' + (o.x / W * 100).toFixed(2) + '%;top:' + (o.y / H * 100).toFixed(2) + '%;width:' + (bw / W * 100).toFixed(2) + '%;height:' + (bh / H * 100).toFixed(2) + '%"><b class="ct">' + o.t + '</b><span>' + o.b + '</span></div>';
  });
  var h = '<div class="pad-pages shippg"><div class="row ptop"><h2 class="hd">' + esc(sh.name) + ' &middot; ' + esc(S.name) + '</h2><button class="btn big blue" data-act="leave">Back to the street</button></div>';
  h += '<div class="hangar" style="aspect-ratio:' + W + '/' + H + '"><div class="hstars"></div><svg class="tails" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' + tails + '</svg>';
  h += '<div class="bigship" style="left:' + (SX / W * 100).toFixed(2) + '%;top:' + (SY / H * 100).toFixed(2) + '%;width:' + (SW / W * 100).toFixed(2) + '%;height:' + (SH / H * 100).toFixed(2) + '%">' + PX.svg(UI.shipSVG(sh.id, sh.hue), 112, 65, 'bs', 4, 40) + '</div>' + bub + '</div>';
  h += '<div class="shiplow"><div class="panel capt"><div class="cport">' + UI.portrait(c) + '</div><div class="ctext"><div class="cname">' + esc(S.name) + '</div><div class="amber ctitle">' + esc(c.title) + '</div><p class="ccatch">&ldquo;' + esc(c.catch) + '&rdquo;</p><div class="dim csmall">' + esc(sh.desc) + '</div></div></div>';
  h += '<div class="panel holdp"><h3 class="hd">Cargo hold</h3><div class="pocket">';
  S.cargo.forEach(function (c2, i) { h += '<div class="slot ' + (c2.qty ? '' : 'empty') + '" data-label="' + esc(GT.ITEMS[i].name) + (c2.qty ? ': ' + c2.qty + ', avg paid ' + c2.avg.toFixed(1) + 'c' : ': none') + '">' + UI.itemIcon(i) + '<b class="num">' + c2.qty + '</b></div>'; });
  h += '</div></div><div class="panel spdp"><h3 class="hd">What speed does</h3><ul class="speedlist"><li><b>Fuel:</b> burns ' + sf.fuel + '% of baseline</li><li><b>Dodging:</b> ' + sf.dodge + '% of road hazards</li><li><b>Order:</b> fastest ship moves first in a shared game</li><li><b>Getaway:</b> +' + Math.round(GT.speedEdge(S) * 100) + '% sabotage success</li></ul></div></div></div>';
  return h;
};

/* the same tail of the spaceport page needs the stats tab of the end screen too, so keep helpers here */
PORT.stats = function (P) {
  var st = P.stats, out = '';
  function r(a, b, cls) { return '<div class="row"><span class="dim">' + a + '</span><b class="num ' + (cls || '') + '">' + b + '</b></div>'; }
  out += '<h4>Smuggling, stocks and passengers</h4><div class="cols2"><div>';
  out += r('Smuggling runs', (st.smuggleRuns || 0) + ' (' + (st.smuggleWins || 0) + ' paid, ' + (st.smuggleCaught || 0) + ' caught)') + r('Smuggling net', (st.smuggleNet >= 0 ? '+' : '-') + fmt(Math.abs(st.smuggleNet || 0)) + 'c', (st.smuggleNet || 0) >= 0 ? 'good' : 'bad');
  out += r('Stocks now worth', fmt(GT.stockValue(P)) + 'c') + r('Stock profit taken', fmt(st.stockRealized || 0) + 'c', (st.stockRealized || 0) >= 0 ? 'good' : 'bad') + r('Dividends paid to you', fmt(st.stockDiv || 0) + 'c', 'good') + r('Tax cut from shares', fmt(st.taxSavedStock || 0) + 'c', 'good');
  out += '</div><div>' + r('Passengers carried', (st.paxCarried || 0) + ' on ' + (st.paxTrips || 0) + ' trips') + r('Fares earned', fmt(st.paxIncome || 0) + 'c', 'good') + r('Refunds given', fmt(st.paxRefunds || 0) + 'c', 'bad') + r('Advertising spent', fmt(st.paxAdSpend || 0) + 'c', 'bad') + '</div></div>';
  return out;
};
