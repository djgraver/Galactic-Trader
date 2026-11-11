/* Galactic Trader 4. Part 25b: the street scene. Puts the sky, the ground, the shadows, the buildings and the street furniture of one world into a 320 x 200 EGA picture, and works out
   the hot spots (one polygon per building) and the doors (where a walker stands to use each one). SC.hub(s) wraps the picture and the click targets in markup. No crowd in here (gt-26-crowd.js). */

/* small svg pictures at a place in the scene (an svg <image> that fills in once the picture is drawn); kept for the other parts that draw ships and people */
PX.svgImage = function (svg, x, y, w, h, cls, spread) {
  var key = PX.hash(svg) + 'x' + w + 'x' + h, url = PX.cache['s' + key];
  if (!url && !PX.pend[key]) { PX.pend[key] = 1; PX.sv[key] = [svg, w, h, spread === undefined ? 40 : spread]; PX.queue(key); }
  return '<image class="' + (cls || '') + '" data-pk="' + key + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" href="' + (url || PX.BLANK) + '" style="image-rendering:pixelated"/>';
};
PX.shipSprite = function (hull, cls, x, y, w, h) { return PX.svgImage(UI.shipSVG(hull.id, hull.hue), x, y, w, h, cls, 40); };

SC.LABELS = { market: 'Go to the Market', bank: 'Go to the Bank', yard: 'Go to the Shipyard', fuel: 'Go to the Fuel Dock', cantina: 'Go to the Cantina', alley: 'Poke around the Back Alley', office: 'Visit Real Estate',
  parlour: 'Enter the Parlour of Thin Hours', exchange: 'Go to the Stock Exchange', jobs: 'Check the Odd Jobs board', pad: 'Go to the Spaceport (star map)' };
SC.door = {};

/* ---------- street furniture: drawn in pixels, sized by the depth scale sc (1 is the near edge) ---------- */
SC.shadowAt = function (B, x, y, w, h, lv) {
  /* a soft shadow: the darker family colour dithered over whatever is already there */
  var map = SC.DK;
  for (var j = -h; j <= h; j++) { var hw = w * Math.sqrt(1 - (j / h) * (j / h)); for (var i = Math.round(-hw); i <= hw; i++) { var X = Math.round(x + i), Y = Math.round(y + j), c = B.get(X, Y); if (c < 16 && PX.BAYER[(Y & 3) * 4 + (X & 3)] < lv) B.px(X, Y, map[c]); } }
};
SC.PROP = {};
SC.PROP.lamp = function (B, x, y, sc, o) {
  var th = o.th, h = Math.max(8, Math.round(46 * sc)), w = Math.max(1, Math.round(sc * 1.6)), k = th.lamp, n = o.night, glow = function (c) { return n ? PX.E + c : c; }, topY = y - h, hd = Math.max(2, Math.round(5 * sc));
  SC.shadowAt(B, x + 5 * sc * o.dir, y + 1, 8 * sc, Math.max(1, 2 * sc), 9);
  B.rect(x - w / 2, topY, w, h, k === 'wood' ? PX.N : PX.D); B.rect(x - w, y - 2, w * 2 + 1, 2, PX.D);
  B.rect(x - w / 2, topY, Math.max(1, w / 2), h, k === 'wood' ? PX.Y : PX.L);
  if (k === 'wood') { B.rect(x - hd, topY - hd, hd * 2 + 1, hd + 1, PX.K); B.rect(x - hd + 1, topY - hd + 1, hd * 2 - 1, hd - 1, glow(PX.Y)); B.rect(x - hd - 1, topY - hd - 1, hd * 2 + 3, 1, PX.N); }
  else if (k === 'torch') { B.rect(x - hd, topY, hd * 2 + 1, 2, PX.N); B.rect(x - hd, topY - 1, 1, 3, PX.D); B.poly([x - hd + 1, topY, x + hd, topY, x + 1, topY - hd * 2.2], glow(PX.LR)); B.poly([x - hd / 2, topY, x + hd / 2, topY, x, topY - hd * 1.4], glow(PX.Y)); }
  else if (k === 'flood') { B.rect(x - hd, topY - hd, hd * 2 + 2, hd, PX.K); B.rect(x - hd + 1, topY - hd + 1, hd * 2, hd - 2 < 1 ? 1 : hd - 2, glow(PX.W)); B.line(x - hd, topY, x, topY + 1, PX.D); }
  else if (k === 'neon') { B.rect(x - 1, topY - hd * 3, 2, hd * 3, glow(PX.LM)); B.rect(x - hd * 1.5, topY - hd * 3, hd * 3, 1, glow(PX.LC)); B.rect(x - hd, topY - hd * 1.5, hd * 2, 1, glow(PX.LM)); }
  else if (k === 'bar') { B.rect(x - hd * 1.5, topY - 1, hd * 3 + 1, 2, glow(PX.LC)); B.rect(x - hd * 1.5, topY + 1, hd * 3 + 1, 1, PX.K); }
  else if (k === 'orb') { B.ell(x, topY - hd * 0.6, hd * 0.9, hd * 0.9, PX.K); B.ell(x, topY - hd * 0.6, hd * 0.9 - 0.7, hd * 0.9 - 0.7, glow(PX.W)); }
  else { B.poly([x, topY - hd * 2.6, x, topY - hd * 0.5, x + hd * 2.2, topY - hd * 1.6], PX.R); B.px(x + 1, topY - hd * 1.6, PX.Y); }
  if (n) for (var r = 3; r > 0; r--) SC.shadowAt(B, x, y - 2 * sc, 14 * sc * r / 3, 3 * sc * r / 3, 0) || 0;
  if (n) { var gx = x, gy = y; for (var j = -4; j <= 4; j++) for (var i = -16; i <= 16; i++) { var d = (i * i) / 256 + (j * j) / 16; if (d < 1) { var X = Math.round(gx + i * sc), Y = Math.round(gy + j * sc * 0.5 - 1), c = B.get(X, Y); if (c < 16 && PX.BAYER[(Y & 3) * 4 + (X & 3)] < (1 - d) * 8) B.px(X, Y, SC.LT[c]); } } }
};
SC.PROP.bench = function (B, x, y, sc, o) {
  var w = Math.max(6, Math.round(22 * sc)), h = Math.max(3, Math.round(8 * sc));
  SC.shadowAt(B, x + 4 * sc * o.dir, y + 1, w * 0.6, Math.max(1, 2 * sc), 9);
  B.rect(x - w / 2, y - h, w, Math.max(1, Math.round(2 * sc)), PX.N); B.rect(x - w / 2, y - h * 1.9, w, Math.max(1, Math.round(1.8 * sc)), PX.N); B.rect(x - w / 2, y - h * 1.9, w, 1, PX.Y);
  B.rect(x - w / 2 + 1, y - h, 1, h, PX.K); B.rect(x + w / 2 - 2, y - h, 1, h, PX.K); B.rect(x - w / 2, y - h * 1.9, 1, h * 0.9, PX.K); B.rect(x + w / 2 - 1, y - h * 1.9, 1, h * 0.9, PX.K);
};
SC.PROP.bin = function (B, x, y, sc, o) {
  var w = Math.max(3, Math.round(8 * sc)), h = Math.max(4, Math.round(11 * sc));
  SC.shadowAt(B, x + 3 * sc * o.dir, y + 1, w * 0.9, Math.max(1, 1.6 * sc), 9);
  B.rect(x - w / 2, y - h, w, h, PX.D); B.rect(x - w / 2, y - h, Math.max(1, w / 3), h, PX.L); B.rect(x - w / 2 - 1, y - h - 1, w + 2, 2, PX.K); B.rect(x - w / 2, y - h * 0.5, w, 1, PX.K);
};
SC.PROP.crates = function (B, x, y, sc, o) {
  var w = Math.max(4, Math.round(10 * sc)); SC.shadowAt(B, x + 4 * sc * o.dir, y + 1, w * 1.1, Math.max(1, 1.8 * sc), 9);
  var cr = function (cx, cy, s, c) { B.rect(cx - s / 2, cy - s, s, s, PX.K); B.rect(cx - s / 2 + 1, cy - s + 1, s - 2, s - 2, c); B.line(cx - s / 2 + 1, cy - s + 1, cx + s / 2 - 2, cy - 2, SC.DK[c]); B.rect(cx - s / 2 + 1, cy - s + 1, s - 2, 1, SC.LT[c]); };
  cr(x - w * 0.3, y, w, PX.N); cr(x + w * 0.5, y, w * 0.8, PX.Y === o.th.a ? PX.N : PX.Y === 0 ? PX.N : PX.N); cr(x, y - w, w * 0.8, PX.N);
};
SC.PROP.planter = function (B, x, y, sc, o) {
  var w = Math.max(5, Math.round(14 * sc)), h = Math.max(3, Math.round(6 * sc)), th = o.th;
  SC.shadowAt(B, x + 4 * sc * o.dir, y + 1, w * 0.7, Math.max(1, 2 * sc), 9);
  B.rect(x - w / 2, y - h, w, h, PX.N); B.rect(x - w / 2, y - h, w, 1, PX.Y); B.rect(x + w / 2 - 2, y - h, 2, h, SC.DK[PX.N]);
  var kind = th.orn === 'ruin' || th.orn === 'mine' ? 'cactus' : th.orn === 'void' || th.orn === 'neon' ? 'crystal' : 'bush', gh = Math.max(3, Math.round(10 * sc));
  if (kind === 'cactus') { B.rect(x - 1, y - h - gh, Math.max(2, 2 * sc), gh, PX.G); B.rect(x - 3 * sc - 1, y - h - gh * 0.7, 2, gh * 0.4, PX.G); B.px(x, y - h - gh - 1, PX.LR); }
  else if (kind === 'crystal') { B.poly([x - 3 * sc - 1, y - h, x, y - h - gh * 1.3, x + 2, y - h], o.night ? PX.E + PX.LC : PX.LC); B.poly([x, y - h, x + 3 * sc + 1, y - h - gh * 0.8, x + 5 * sc, y - h], o.night ? PX.E + PX.LM : PX.LM); }
  else { B.ell(x, y - h - gh * 0.4, w * 0.5, gh * 0.55, PX.G); B.ell(x - w * 0.12, y - h - gh * 0.55, w * 0.34, gh * 0.4, PX.LG); B.px(x + w * 0.15, y - h - gh * 0.6, PX.LR); B.px(x - w * 0.25, y - h - gh * 0.3, PX.Y); }
};
SC.PROP.barrel = function (B, x, y, sc, o) {
  var w = Math.max(3, Math.round(8 * sc)), h = Math.max(4, Math.round(10 * sc)); SC.shadowAt(B, x + 3 * sc * o.dir, y + 1, w, Math.max(1, 1.6 * sc), 9);
  B.rect(x - w / 2, y - h, w, h, PX.N); B.rect(x - w / 2, y - h, Math.max(1, w / 3), h, PX.Y); B.rect(x - w / 2, y - h * 0.7, w, 1, PX.K); B.rect(x - w / 2, y - h * 0.3, w, 1, PX.K); B.rect(x - w / 2 - 1, y - h + 1, 1, h - 2, PX.K); B.rect(x + w / 2, y - h + 1, 1, h - 2, PX.K);
};
SC.PROP.post = function (B, x, y, sc, o) { /* a signpost with a little arrow board */
  var h = Math.max(10, Math.round(30 * sc)), w = Math.max(1, Math.round(sc * 1.4)), bw = Math.max(6, Math.round(14 * sc)), bh = Math.max(3, Math.round(5 * sc));
  SC.shadowAt(B, x + 4 * sc * o.dir, y + 1, 6 * sc, Math.max(1, 1.5 * sc), 9);
  B.rect(x - w / 2, y - h, w, h, PX.D); B.rect(x - bw / 2, y - h, bw, bh, PX.K); B.rect(x - bw / 2 + 1, y - h + 1, bw - 2, bh - 2, PX.Y);
};
/* which furniture each world scatters on its pavements (kind, depth step) */
SC.FURN = {
  meridoa: ['planter', 'lamp', 'barrel', 'bench', 'lamp', 'crates', 'planter', 'lamp'], karthosu: ['lamp', 'crates', 'barrel', 'lamp', 'planter', 'post', 'lamp'], ferrox: ['lamp', 'barrel', 'crates', 'lamp', 'bin', 'barrel', 'lamp'],
  kryndor: ['lamp', 'bench', 'bin', 'lamp', 'planter', 'post', 'lamp', 'bin'], nihil: ['lamp', 'crates', 'bin', 'lamp', 'post', 'barrel', 'lamp'], quellin: ['lamp', 'bench', 'planter', 'lamp', 'bin', 'planter', 'lamp'], halcyra: ['lamp', 'planter', 'bench', 'lamp', 'barrel', 'planter', 'lamp']
};

/* ---------- painting a building ---------- */
SC.shadeWall = function (f, lv) { f.shade(0, 0, 100, 150, lv); };
SC.paintSlot = function (B, g, th, sl, p, night, rnd, sg, idx) {
  var fn = sl.fn, pid = p.id, kit = SC.KIT[pid], closed = (fn === 'yard' && !p.upgrades.length) || (fn === 'fuel' && !p.fuelSold);
  var shape = fn === 'alley' ? 'gap' : kit[fn] || 'box', sets = th.sets, set = sets[idx % sets.length];
  var t = { a: set.a, b: set.b, r: set.r, t: th.t, k: th.k, g: th.g, tex: th.tex };
  if (fn === 'jobs') { t.a = PX.N; t.b = SC.DK[PX.N]; t.r = PX.R; }
  if (closed) { t.a = PX.L; t.b = PX.D; t.k = PX.D; t.r = PX.D; }
  var shaded = sl.s === g.sun, f = new SC.Fac(B, sl, night, rnd, shaded);
  var m = SC.SH[shape](f, t, { k: idx, h: 70 + (idx % 3) * 10 });
  if (SC.FN[fn] && !closed) SC.FN[fn](f, t, m, { k: idx });
  if (SC.ORN[th.orn] && fn !== 'jobs') SC.ORN[th.orn](f, t, m, { k: idx });
  if (m.sign && !m.noSign) SC.sign(f, m.sign, closed ? (fn === 'yard' ? 'CLOSED' : 'NO FUEL') : sg[fn] || fn.toUpperCase(), night, closed, fn);
  if (closed) { f.R(m.door.x - 2, 0, m.door.w + 4, m.door.h + 2, PX.K); f.L(m.door.x - 2, 4, m.door.x + m.door.w + 2, m.door.h - 2, 3, PX.N); f.L(m.door.x - 2, m.door.h - 2, m.door.x + m.door.w + 2, 4, 3, PX.N); }
  if (shaded) SC.shadeWall(f, 7); else f.shade(0, 100, 100, 150, 3, true);
  f.edge();
  return { m: m, closed: closed, f: f };
};
/* a shop sign: black frame, plate, text that is cut to fit, or stripes when it is too far away to read */
SC.sign = function (f, sg, label, night, closed, fn) {
  var ux = f.ux, uy = f.uy, pxh = sg.h / uy, plate = night ? PX.E + (closed ? PX.R : PX.N) : (closed ? PX.R : PX.W), ink = night ? PX.E + PX.Y : (closed ? PX.W : PX.K);
  var y0 = sg.y - sg.h;
  f.R(sg.x - ux, y0 - uy, sg.w + 2 * ux, sg.h + 2 * uy, PX.K); f.R(sg.x, y0, sg.w, sg.h, fn === 'jobs' || night ? PX.K : plate);
  if (night) f.R(sg.x, y0, sg.w, sg.h, PX.K);
  var hgt = sg.h - 3 * uy;
  if (pxh < 9) { for (var i = 0; i < 6; i++) f.R(sg.x + 2 + i * sg.w / 6.5, y0 + uy * 1.5, sg.w / 13, sg.h - 3 * uy, night ? PX.E + PX.Y : (closed ? PX.W : PX.N)); return; }
  var maxc = f.textFit(label, sg.w - 4 * ux, hgt), words = label.split(' ');
  while (label.length > maxc && words.length > 1) { words.pop(); label = words.join(' '); }
  if (label.length > maxc) label = label.slice(0, Math.max(1, maxc));
  f.T(label, sg.x + sg.w / 2, y0 + 1.5 * uy, hgt, ink, 'c');
};

SC.hubKey = function (s) { var p = GT.PLANETS[s.loc]; return p.id + '|' + (SC.night(s) ? 'n' : 'd') + '|' + (p.upgrades.length ? 'y' : '-') + (p.fuelSold ? 'f' : '-') + (p.gambling ? 'p' : '-'); };
SC.build = function (s) {
  var p = GT.PLANETS[s.loc], pid = p.id, th = SC.TH[pid], g = SC.GEO[pid], night = SC.night(s), rnd = GT.seeded(CH.hash(pid + (night ? 'n' : 'd'))), sg = NP.SIGNS[pid], B = new PX.Buf(SC.W, SC.H);
  var lay = { L: g.L.filter(function (x) { return x !== 'parlour' || p.gambling; }), R: g.R.filter(function (x) { return x !== 'parlour' || p.gambling; }), E: g.E };
  SC.skyArt(B, pid, th, g, night, rnd); SC.groundArt(B, pid, th, g, rnd);
  var slots = SC.slotsFor(g, lay, rnd), hits = [], door = {}, dir = g.sun === 'R' ? -1 : 1;
  /* shadows of the buildings on the sunless side fall across the pavement first, so buildings and furniture draw over them */
  slots.forEach(function (sl) {
    if (sl.s !== g.sun) return;
    var w = sl.fn === 'jobs' ? 0.1 : sl.hf > 0.9 ? 0.4 : sl.hf > 0.7 ? 0.3 : 0.2, s0 = Math.min(sl.scA, sl.scB), s1 = Math.max(sl.scA, sl.scB), l0 = sl.s === 'L' ? 0 : 1 - w, l1 = sl.s === 'L' ? w : 1;
    SC.quad(B, g, s0, s1, l0, l1, function (x, y) { var c = B.get(x, y); return c < 16 && PX.BAYER[(y & 3) * 4 + (x & 3)] < 8 ? SC.DK[c] : -1; });
    SC.quad(B, g, s0, s1, sl.s === 'L' ? w : 1 - w - 0.05, sl.s === 'L' ? w + 0.05 : 1 - w, function (x, y) { var c = B.get(x, y); return c < 16 && PX.BAYER[(y & 3) * 4 + (x & 3)] < 3 ? SC.DK[c] : -1; });
  });
  /* the draw list: buildings and furniture, far to near */
  var items = [], idx = 0;
  slots.forEach(function (sl) { items.push({ z: sl.s === 'E' ? 99 : sl.z, sl: sl, k: idx++ }); });
  var fl = SC.FURN[pid], fk = 0, hh = CH.hash(pid);
  ['L', 'R'].forEach(function (sd) {
    for (var q = 0; q < 8; q++) {
      var z = 1.15 + q * ((g.zEnd - 1.4) / 7) + ((hh >> (q + (sd === 'L' ? 0 : 5))) & 3) * 0.05, kind = fl[(fk++ + (sd === 'L' ? 0 : 3)) % fl.length], lat = sd === 'L' ? g.ls * 0.82 : g.rs + (1 - g.rs) * 0.18;
      if (kind !== 'lamp' && q % 2) continue; if (kind === 'lamp' && q % 2 === 0 && q > 0) lat = sd === 'L' ? g.ls * 0.95 : g.rs + (1 - g.rs) * 0.05;
      if (kind !== 'lamp') lat = sd === 'L' ? g.ls * 0.45 : g.rs + (1 - g.rs) * 0.55;
      items.push({ z: z, prop: kind, side: sd, lat: lat });
    }
  });
  items.sort(function (a, b) { return b.z - a.z; });
  var built = {};
  items.forEach(function (it) {
    if (it.prop) { var pt = SC.P(g, 1 / it.z, it.lat), sc = 1 / it.z; SC.PROP[it.prop](B, Math.round(pt[0]), Math.round(pt[1]), sc, { th: th, night: night, dir: dir }); return; }
    var sl = it.sl, r = SC.paintSlot(B, g, th, sl, p, night, rnd, sg, it.k), f = r.f, fn = sl.fn;
    /* the door: where a walker stands in front of it, on the pavement */
    var u = (r.m.door.x + r.m.door.w / 2) / 100, sc = sl.s === 'E' ? sl.scA : sl.scA + u * (sl.scB - sl.scA), wx = sl.xa + u * (sl.xb - sl.xa), wy = sl.ybA + u * (sl.ybB - sl.ybA), dpt;
    if (sl.s === 'E') dpt = [wx, wy + 5, 1 / (g.zEnd + 0.25)];
    else { var lat = sl.s === 'L' ? g.ls * 0.6 : g.rs + (1 - g.rs) * 0.4, pt2 = SC.P(g, sc, lat); dpt = [pt2[0], pt2[1], sc]; }
    door[fn] = { x: Math.round(dpt[0]), y: Math.round(dpt[1]), s: dpt[2], sc: dpt[2] };
    var hMul = sl.fn === 'jobs' ? 1.0 : 1.08, topA = sl.ybA - sl.hA * hMul, topB = sl.ybB - sl.hB * hMul;
    var pts = sl.s === 'E' ? [sl.xa, sl.ybA, sl.xb, sl.ybB, sl.xb, topB, sl.xa, topA] : [sl.xa, sl.ybA, sl.xb, sl.ybB, sl.xb, topB, sl.xa, topA];
    hits.push({ fn: fn, closed: r.closed, pts: pts, label: r.closed ? (fn === 'yard' ? 'The Shipyard is closed' : 'There is no fuel dock here') : null });
  });
  SC.spaceportSign(B, night);
  door.pad = { x: 160, y: 168, s: 1, sc: 1 };
  hits.push({ fn: 'pad', pts: [110, 176, 210, 176, 210, 198, 110, 198] });
  return { buf: B, hits: hits, door: door };
};
/* the "To Spaceport -->" button on the near pavement */
SC.spaceportSign = function (B, night) {
  var x = 108, y = 177, w = 104, h = 19, c = night ? PX.E : 0;
  B.rect(x + 2, y + 2, w, h, PX.K);
  B.rect(x, y, w, h, PX.K); B.rect(x + 1, y + 1, w - 2, h - 2, PX.W); B.rect(x + 2, y + 2, w - 4, h - 4, PX.L); B.rect(x + 2, y + 2, w - 4, 1, PX.W); B.rect(x + 2, y + h - 3, w - 4, 1, PX.D);
  B.rect(x + 3, y + 3, w - 6, h - 6, PX.B); B.rect(x + 3, y + 3, w - 6, 1, PX.LB);
  B.text(x + 6, y + 6, 'TO SPACEPORT', PX.E + PX.Y, 1);
  var ax = x + w - 17; B.rect(ax, y + 8, 9, 3, PX.E + PX.LR); B.poly([ax + 8, y + 5, ax + 14, y + 9.5, ax + 8, y + 14], PX.E + PX.LR);
};

SC.hubCache = {};
SC.hub = function (s) {
  var key = SC.hubKey(s), r = SC.hubCache[key]; if (!r) { r = SC.hubCache[key] = SC.build(s); r.url = PX.render(r.buf, SC.night(s)).toDataURL(); }
  SC.door = r.door;
  var o = '<div class="scene" id="scene" data-world="' + GT.PLANETS[s.loc].id + '"><img class="pxi bgimg" src="' + r.url + '" width="' + SC.W + '" height="' + SC.H + '" alt="">';
  o += '<svg class="crowd" id="crowd" viewBox="0 0 ' + SC.W + ' ' + SC.H + '" aria-hidden="true"></svg>';
  o += '<svg class="ov" viewBox="0 0 ' + SC.W + ' ' + SC.H + '" id="ov" role="group" aria-label="' + GT.esc(GT.PLANETS[s.loc].name) + ' street">';
  r.hits.forEach(function (h) {
    var lab = h.label || SC.LABELS[h.fn] || h.fn; if (h.fn === 'office' && s.visit.offer) lab = 'Visit Real Estate (an offer awaits!)'; if (h.fn === 'alley' && s.visit.smuggle) lab = 'Poke around the Back Alley (a fixer is waiting!)';
    o += '<g class="hs' + (h.closed ? ' closed' : '') + '" data-hs="' + h.fn + '" data-label="' + GT.esc(lab) + '" tabindex="0" role="button" aria-label="' + GT.esc(lab) + '"><polygon points="' + h.pts.map(function (v) { return v.toFixed(1); }).join(' ') + '"/></g>';
  });
  var px = ui.px && ui.px.x != null ? ui.px : SC.door.pad, sc = Math.max(0.5, Math.min(1, px.s || 1));
  o += '<g id="player" style="transform: translate(' + px.x + 'px,' + px.y + 'px) scale(' + sc.toFixed(2) + ')">' + (s.char ? PX.svgImage(CH.sprite(s.char).replace(/^<g/, '<svg viewBox="-6 -2 112 176"><g').replace(/<\/g>$/, '</g></svg>'), -7, -26, 14, 26, 'pl') : '') + '</g></svg></div>';
  return o;
};
