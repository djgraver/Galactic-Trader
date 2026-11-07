/* Galactic Trader 3. Part 13b: the street. It climbs away from the viewer at 30 degrees. Far-side buildings step up the hill, near-side ones sit in the lower right. */
SC.FAR = [
  { k: 'yard', cx: 244, w: 56, h: 62, s: 0.62 }, { k: 'cantina', cx: 203, w: 58, h: 68, s: 0.74 }, { k: 'alley', cx: 166, w: 44, h: 52, s: 0.78 },
  { k: 'bank', cx: 118, w: 68, h: 74, s: 0.9 }, { k: 'market', cx: 46, w: 90, h: 84, s: 1 }
];
SC.NEAR = [
  { k: 'parlour', cx: 292, base: 134, w: 42, h: 54 }, { k: 'office', cx: 232, base: 152, w: 46, h: 48 }, { k: 'fuel', cx: 160, base: 187, w: 62, h: 50 }
];
/* where the captain stands for each place, and the route from there up to the road */
SC.ROADJ = 198;
SC.SPOT = {
  market: { x: 46, y: 0 }, bank: { x: 118, y: 0 }, alley: { x: 167, y: 0 }, cantina: { x: 204, y: 0 }, yard: { x: 244, y: 0 },
  fuel: { x: 160, y: 191, route: [[196, 188], [199, 118]] }, office: { x: 232, y: 155, route: [[204, 156], [199, 118]] },
  parlour: { x: 292, y: 137, route: [[268, 157], [204, 162], [199, 118]] }, pad: { x: 268, y: 188, route: [[214, 188], [203, 150], [199, 118]] },
  jobs: { x: 98, y: 199, route: [[104, 182]] }
};
SC.FAR.forEach(function (f) { SC.SPOT[f.k].y = Math.round(SC.roadY(f.cx) - SC.roadH(f.cx) + 5); });
SC.NAMES = { market: 'the Market', bank: 'the Bank', cantina: 'the Cantina', yard: 'the Shipyard', fuel: 'the Fuel Dock', office: 'Real Estate', parlour: 'the Parlour', jobs: 'the Odd Jobs board', pad: 'the Launch Pad', alley: 'the Back Alley' };

SC.sky = function (b, T, night, seed) {
  var rnd = SC.rnd(seed), y, i, HOR = SC.HOR;
  for (y = 0; y < HOR; y++) {
    var t = y / HOR;
    b.hline(0, y, SC.W, night ? [K_, B_, Math.round(t * t * 7)] : [T.sky[0], T.sky[1], Math.round(t * (T.sky[2] || 16))]);
  }
  if (night || T.style === 'hull') for (i = 0; i < 90; i++) b.put(Math.floor(rnd() * SC.W), Math.floor(rnd() * (HOR - 6)), rnd() < 0.12 ? E_ + Y_ : rnd() < 0.2 ? E_ + LC_ : E_ + W_);
  var sx = 272, sy = 26;
  if (night) { b.ellipse(sx, sy, 10, 10, E_ + W_); b.ellipse(sx + 4, sy - 2, 8, 8, K_); b.put(sx - 3, sy + 3, E_ + L_); }
  else { b.ellipse(sx, sy, 12, 12, T.sun); b.ellipse(sx - 3, sy - 3, 6, 6, [T.sun, W_, 8]); if (T.style === 'forge') b.ellipse(sx, sy, 12, 12, [T.sun, D_, 8]); }
  return rnd;
};
SC.decor = function (b, T, night, rnd) {
  var HOR = SC.HOR, f = [T.far[0], T.far[1], 5], i, x;
  switch (T.decor) {
    case 'windmill': for (i = 0; i < 6; i++) b.dome(30 + i * 62, HOR + 2, 46, 10 + (i * 7) % 12, [LG_, G_, 8]); b.rect(284, HOR - 22, 7, 24, W_); b.poly([[283, HOR - 22], [292, HOR - 22], [288, HOR - 30]], R_); b.line(288, HOR - 24, 272, HOR - 38, W_); b.line(288, HOR - 24, 304, HOR - 10, W_); b.line(288, HOR - 24, 300, HOR - 40, W_); b.line(288, HOR - 24, 276, HOR - 8, W_); break;
    case 'dunes': for (i = 0; i < 5; i++) b.dome(20 + i * 75, HOR + 2, 52, 9 + (i * 5) % 10, [N_, Y_, 7]); b.poly([[236, HOR], [262, HOR - 20], [288, HOR]], [N_, Y_, 6]); b.poly([[262, HOR - 20], [288, HOR], [262, HOR]], [N_, K_, 5]); b.poly([[200, HOR], [214, HOR - 11], [228, HOR]], [N_, Y_, 4]); break;
    case 'rig': for (i = 0; i < 9; i++) { x = 10 + i * 36; b.rect(x, HOR - 8 - (i * 11) % 18, 12, 30, D_); b.rect(x + 12, HOR - 6 - (i * 7) % 10, 10, 30, K_); if (i % 3 === 0) { b.rect(x + 3, HOR - 18 - (i * 11) % 18, 4, 10, L_); b.ellipse(x + 5, HOR - 24 - (i * 11) % 18, 6, 3, [D_, L_, 6]); } } b.line(150, HOR, 170, HOR - 30, K_); b.line(190, HOR, 170, HOR - 30, K_); b.line(160, HOR - 12, 180, HOR - 12, K_); break;
    case 'skyline': for (i = 0; i < 26; i++) { x = i * 13 - 4; var hh = 14 + (i * 37) % 30 + (i % 4) * 4; b.rect(x, HOR - hh, 11, hh + 2, i % 2 ? B_ : [B_, M_, 6]); for (var q = 0; q < hh - 4; q += 5) if ((i * 7 + q) % 3 === 0) b.put(x + 2 + (q % 7), HOR - hh + 3 + q, E_ + (q % 2 ? Y_ : LC_)); } b.vline(70, HOR - 54, 20, M_); b.put(70, HOR - 55, E_ + LR_); break;
    case 'ring': b.ellipse(80, HOR - 14, 40, 40, M_); b.ellipse(72, HOR - 22, 28, 28, [M_, LM_, 7]); b.ring(80, HOR - 14, 70, 10, LM_); b.ring(80, HOR - 14, 66, 9, [LM_, M_, 8]); b.rect(0, HOR - 1, 320, 2, D_); for (i = 0; i < 4; i++) { b.rect(190 + i * 28, HOR - 8 - i % 2 * 6, 20, 10, D_); b.rect(194 + i * 28, HOR - 6 - i % 2 * 6, 3, 2, E_ + LC_); } break;
    case 'domes': for (i = 0; i < 6; i++) { b.dome(26 + i * 58, HOR + 1, 24 + (i % 3) * 6, 14 + (i * 5) % 10, [LC_, W_, 8]); b.dome(26 + i * 58, HOR + 1, 24 + (i % 3) * 6, 14 + (i * 5) % 10, [LC_, LM_, 3]); } b.ellipse(150, HOR - 34, 5, 5, [LM_, W_, 6]); b.ellipse(210, HOR - 44, 4, 4, [LC_, W_, 6]); b.ellipse(40, HOR - 40, 3, 3, [LM_, W_, 6]); break;
    case 'giant': b.ellipse(150, HOR + 40, 150, 70, [LR_, Y_, 6]); for (i = 0; i < 5; i++) b.hline(0, HOR - 12 + i * 5, 320, [LR_, W_, i % 2 ? 8 : 3]); b.rect(0, HOR - 2, 320, 4, [W_, LC_, 6]); for (i = 0; i < 3; i++) { b.ellipse(50 + i * 110, HOR - 30 - i * 3, 16, 5, W_); b.ellipse(60 + i * 110, HOR - 34 - i * 3, 11, 5, W_); } break;
  }
};
SC.ground = function (b, T, night, rnd) {
  var HOR = SC.HOR, i;
  b.rect(0, HOR, SC.W, SC.H - HOR, T.gnd);
  for (i = 0; i < 160; i++) b.put(Math.floor(rnd() * SC.W), HOR + 3 + Math.floor(rnd() * (SC.H - HOR - 3)), T.gnd2);
  b.rect(0, HOR, SC.W, 5, [T.far[1], T.gnd[1], 6]);
  if (T.decor === 'giant') for (i = 0; i < 30; i++) b.ellipse(Math.floor(rnd() * 320), HOR + 10 + Math.floor(rnd() * 130), 8 + rnd() * 14, 2 + rnd() * 3, [W_, LC_, 4]);
};
SC.road = function (b, T) {
  var top = [], bot = [], x, HOR = SC.HOR, HOR2 = HOR + 1;
  for (x = -10; x <= 270; x += 10) { top.push([x, Math.max(HOR2, SC.roadY(x) - SC.roadH(x))]); bot.unshift([x, Math.max(HOR2, SC.roadY(x) + SC.roadH(x))]); }
  b.poly(top.concat(bot), T.road);
  b.polyLine(top, T.curb); b.polyLine(bot.map(function (p) { return [p[0], p[1] + 0]; }), K_);
  b.polyLine(top.map(function (p) { return [p[0], p[1] + 1]; }), [T.curb, K_, 8]);
  for (x = 20; x < 255; x += 17) { var y = SC.roadY(x), f = Math.max(0.3, 1 - (x - SC.X0) / 260); b.line(x, y + 1, x + 9 * f, y + 1 - 9 * f * SC.SLOPE, [W_, T.curb, 2]); }
};
SC.alley = function (b, T, w, h) {
  var W = w + 24, H = h + 30, bb = SC.newB(W, H), x = W >> 1, y = H - 3, i;
  bb.rect(x - w / 2, y - h, w, h, [D_, N_, 6]); for (i = 0; i < h; i += 6) bb.hline(x - w / 2, y - i, w, K_); for (i = 0; i < w; i += 7) bb.vline(x - w / 2 + i, y - h, h, K_);
  bb.rect(x - w / 2 + 3, y - h + 5, w - 6, h - 5, K_);
  bb.rect(x - 7, y - 11, 13, 9, G_); bb.rect(x - 8, y - 13, 15, 3, LG_); bb.rect(x + 2, y - 7, 3, 2, K_);
  bb.put(x - 5, y - 24, E_ + Y_); bb.put(x - 2, y - 24, E_ + Y_); bb.text(x - 2, y - h - 11, '?', E_ + LM_, 1);
  bb.vline(x + w / 2 - 4, y - 18, 10, [LG_, K_, 8]);
  SC.outline(bb); return { b: bb, ox: x, oy: y, door: { x: x, y: y, w: w - 4, h: h - 4 }, sign: { x: x, y: y - h } };
};
SC.jobsBoard = function (b, T) {
  var W = 44, H = 52, bb = SC.newB(W, H), x = 22, y = 49;
  bb.rect(x - 15, y - 28, 3, 28, N_); bb.rect(x + 12, y - 28, 3, 28, N_); bb.rect(x - 18, y - 42, 36, 18, N_); bb.box(x - 18, y - 42, 36, 18, K_);
  bb.rect(x - 14, y - 38, 10, 9, W_); bb.rect(x - 2, y - 39, 9, 10, Y_); bb.rect(x + 9, y - 37, 7, 8, LR_); bb.rect(x - 12, y - 30, 8, 5, LC_); bb.rect(x - 1, y - 28, 12, 3, W_);
  bb.rect(x - 14, y - 49, 28, 8, T.tr); bb.text(x - 12, y - 48, 'JOBS', [Y_, W_, LC_, LM_, LG_, LR_, LB_].indexOf(T.tr) >= 0 ? K_ : W_, 1);
  SC.outline(bb); return { b: bb, ox: x, oy: y };
};
SC.padArt = function (b, T, cx, cy) {
  b.ellipse(cx, cy + 1, 46, 11, K_); b.ellipse(cx, cy, 45, 10, D_); b.ellipse(cx, cy, 38, 8, [D_, L_, 5]); b.ring(cx, cy, 33, 6, Y_); b.ring(cx, cy, 34, 6, [Y_, K_, 8]);
  for (var i = 0; i < 12; i++) { var a = i / 12 * 6.283; b.put(cx + Math.cos(a) * 42, cy + Math.sin(a) * 9, E_ + (i % 2 ? Y_ : LR_)); }
  b.text(cx - 9, cy - 3, 'PAD', [D_, W_, 8], 1);
};
SC.lamp = function (b, x, y, T) { b.vline(x, y - 18, 18, K_); b.rect(x - 2, y - 22, 5, 5, E_ + Y_); b.box(x - 2, y - 22, 5, 5, K_); b.put(x, y - 23, K_); };

/* Paint a whole street. Returns the picture and where the clickable places are. Cached per look. */
SC.cache = {};
SC.paint = function (s) {
  var p = GT.PLANETS[s.loc], T = SC.TH[p.id], night = SC.night(), sg = NP.SIGNS[p.id], closedYard = !p.upgrades.length, closedFuel = !p.fuelSold, offer = !!s.visit.offer;
  var key = [p.id, night ? 1 : 0, closedYard ? 1 : 0, closedFuel ? 1 : 0, offer ? 1 : 0, s.owned[s.loc] ? 1 : 0].join('/');
  if (SC.cache[key]) return SC.cache[key];
  var b = new PX.Buf(SC.W, SC.H), rnd = SC.sky(b, T, night, p.id), hs = [], i, bb;
  SC.decor(b, T, night, rnd); SC.ground(b, T, night, rnd); SC.road(b, T);
  function place(role, built, cx, base, label, closed) {
    b.blit(built.b, cx - built.ox, base - built.oy, 255);
    var bd = built.b, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, x, y;
    for (y = 0; y < bd.h; y++) for (x = 0; x < bd.w; x++) if (bd.d[y * bd.w + x] !== 255) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    hs.push({ k: role, label: label, closed: !!closed, x: cx - built.ox + x0, y: base - built.oy + y0, w: x1 - x0 + 1, h: y1 - y0 + 1 });
  }
  var lit = night;
  SC.FAR.forEach(function (f) {
    var base = Math.round(SC.roadY(f.cx) - SC.roadH(f.cx)) - 1, w = Math.round(f.w * f.s), h = Math.round(f.h * f.s);
    if (f.k === 'alley') { place('alley', SC.alley(b, T, w, h), f.cx, base, 'Poke around the Back Alley'); return; }
    var closed = (f.k === 'yard' && closedYard);
    place(f.k, SC.build(T, f.k, w, h, { text: sg[f.k], closed: closed, lit: lit }), f.cx, base, closed ? 'The Shipyard is closed' : { market: 'Go to the Market', bank: 'Go to the Bank', cantina: 'Go to the ' + sg.cantina, yard: 'Go to the Shipyard' }[f.k], closed);
  });
  SC.NEAR.forEach(function (f) {
    var closed = f.k === 'fuel' && closedFuel, role = f.k === 'parlour' && !p.gambling ? 'decor' : f.k;
    var built = SC.build(T, role, f.w, f.h, { text: role === 'office' ? (sg.office || '') : role === 'decor' ? '' : sg[f.k], closed: closed, lit: lit });
    if (role === 'decor') { b.blit(built.b, f.cx - built.ox, f.base - built.oy, 255); return; }
    place(f.k, built, f.cx, f.base, closed ? 'There is no fuel dock here' : { fuel: 'Go to the Fuel Dock', office: offer ? 'Visit Real Estate (an offer awaits!)' : 'Visit Real Estate', parlour: 'Enter the Parlour of Thin Hours' }[f.k], closed);
  });
  SC.padArt(b, T, 268, 184); hs.push({ k: 'pad', label: 'Go to the Launch Pad (Star Map)', x: 222, y: 150, w: 94, h: 46 });
  place('jobs', SC.jobsBoard(b, T), 98, 199, 'Check the Odd Jobs board');
  if (offer) { b.rect(236, 100, 11, 11, E_ + Y_); b.box(236, 100, 11, 11, K_); b.text(239, 102, '!', K_, 1); }
  SC.lamp(b, 78, 128, T); SC.lamp(b, 20, 164, T); SC.lamp(b, 188, 98, T);
  var cv = document.createElement('canvas'); b.paint(cv, night);
  var out = { url: cv.toDataURL(), hs: hs, buf: b };
  SC.cache[key] = out; return out;
};

/* ---------- the captain, who walks ---------- */
SC.SIZES = [28, 32, 36, 40];
SC.spriteSVG = function (c) { return '<svg viewBox="0 0 100 175">' + CH.sprite(c) + '</svg>'; };
SC.sizeAt = function (y) { var h = 24 + 18 * Math.max(0, Math.min(1, (y - SC.HOR) / (SC.H - SC.HOR))); return SC.SIZES.reduce(function (a, v) { return Math.abs(v - h) < Math.abs(a - h) ? v : a; }, SC.SIZES[0]); };
SC.spriteAt = function (c, y, cb) { var h = SC.sizeAt(y), w = Math.round(h * 100 / 175); PIX.raster(SC.spriteSVG(c), w, h, { dither: false }, function (cv) { cb(cv.toDataURL(), w, h); }); };
SC.placePlayer = function (x, y) {
  var el = document.getElementById('player'); if (!el || !S) return; S.pos = { x: x, y: y };
  el.style.left = (x / SC.W * 100) + '%'; el.style.top = (y / SC.H * 100) + '%';
  var h = SC.sizeAt(y), w = Math.round(h * 100 / 175); el.style.width = (w / SC.W * 100) + '%';
  if (el.dataset.h !== String(h)) { el.dataset.h = String(h); SC.spriteAt(S.char, y, function (u) { if (el.dataset.h === String(h)) el.src = u; }); }
};
/* Route from a spot to the road, along the road, and up to another spot */
SC.route = function (from, to) {
  var A = SC.SPOT[from], B = SC.SPOT[to], pts = [];
  function toRoad(k) { var S0 = SC.SPOT[k], r = [[S0.x, S0.y]]; if (S0.route) S0.route.forEach(function (q) { r.push(q); }); else r.push([S0.x, Math.round(SC.roadY(S0.x))]); var last = r[r.length - 1]; r.push([last[0], Math.round(SC.roadY(last[0]))]); return r; }
  var ra = toRoad(from), rb = toRoad(to).reverse();
  return ra.concat(rb);
};
SC.walk = function (pts, done) {
  var el = document.getElementById('player'); if (!el || reduced()) { var q = pts[pts.length - 1]; SC.placePlayer(q[0], q[1]); done(); return; }
  var segs = [], len = 0, i; for (i = 1; i < pts.length; i++) { var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(d); len += d; }
  var speed = Math.max(95, len / 1.7), t0 = performance.now(); el.classList.add('walking');
  (function step(now) {
    var d = Math.min(len, (now - t0) / 1000 * speed), k = 0, acc = 0; while (k < segs.length - 1 && acc + segs[k] < d) { acc += segs[k]; k++; }
    var f = segs[k] ? (d - acc) / segs[k] : 1, a = pts[k], bq = pts[k + 1] || pts[k]; SC.placePlayer(a[0] + (bq[0] - a[0]) * f, a[1] + (bq[1] - a[1]) * f);
    el.classList.toggle('flip', bq[0] < a[0] - 0.5);
    if (d >= len) { el.classList.remove('walking'); done(); return; }
    requestAnimationFrame(step);
  })(t0);
};

/* the street, as HTML: the picture, invisible clickable shapes over it, the captain and the ship on the pad */
SC.hub = function (s) {
  var P = SC.paint(s), h = '<div class="scene2" id="scene"><img class="px scenepix" src="' + P.url + '" alt="" width="320" height="200"><svg class="hsl" viewBox="0 0 320 200" role="group" aria-label="' + esc(GT.PLANETS[s.loc].name) + ' street">';
  P.hs.forEach(function (r) {
    h += '<g class="hs' + (r.closed ? ' closed' : '') + '" data-hs="' + r.k + '" data-label="' + esc(r.label) + '" tabindex="0" role="button" aria-label="' + esc(r.label) + '"><rect x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.h + '"/></g>';
  });
  var hull = GT.SHIPS.filter(function (x) { return x.id === s.shipId; })[0];
  h += '</svg>' + PIX.img(UI.shipSVG(hull.id, hull.hue), 56, 28, 'padship', {});
  if (!s.pos) s.pos = { x: SC.SPOT.pad.x - 22, y: SC.SPOT.pad.y - 4 };
  var sh = SC.sizeAt(s.pos.y);
  h += '<img class="px sprite" id="player" src="' + PIX.BLANK + '" alt="" style="left:' + (s.pos.x / 320 * 100) + '%;top:' + (s.pos.y / 200 * 100) + '%;width:' + (Math.round(sh * 100 / 175) / 320 * 100) + '%" data-h="' + sh + '"></div>';
  setTimeout(function () { SC.placePlayer(s.pos.x, s.pos.y); }, 0);
  return h;
};
