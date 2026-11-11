/* Galactic Trader 4. Part 25: the buildings. Every shape is painted flat into a facade (x 0..100 across, y 0..130 up) with doors, windows, awnings, cornices and roofs,
   so a shop reads as a shop. Shaded walls use darker family colours (SC.DK), lit walls get highlights, as in the Sierra EGA games.
   Each shape returns where its door and sign are: { door: {x, w, h}, sign: {x, y, w, h} } (y is the bottom of the sign). Service props are added by SC.FN. */
SC.D = function (c) { return SC.DK[c] === c ? PX.K : SC.DK[c]; };
SC.SH = {};

/* the roof-top odds and ends that make a skyline: vents, tanks, aerials, chimneys. k picks the kind. */
SC.roofTop = function (f, t, y, k, x0, x1) {
  var ux = f.ux, uy = f.uy, w = x1 - x0, kind = k % 5, D = SC.D(t.a);
  if (kind === 0) { f.R(x0 + w * 0.15, y, 9 * ux, 8 * uy, SC.D(t.r)); f.R(x0 + w * 0.15 - ux, y + 8 * uy, 11 * ux, 2 * uy, t.t); }
  else if (kind === 1) { f.R(x0 + w * 0.7, y, 2 * ux, 10 * uy, PX.D); f.R(x0 + w * 0.7 - 5 * ux, y + 10 * uy, 12 * ux, 6 * uy, t.t); f.R(x0 + w * 0.7 - 5 * ux, y + 10 * uy, 12 * ux, 2 * uy, SC.D(t.t)); }
  else if (kind === 2) { f.R(x0 + w * 0.5, y, ux, 22 * uy, PX.D); f.R(x0 + w * 0.5 - 6 * ux, y + 14 * uy, 13 * ux, uy, PX.D); f.R(x0 + w * 0.5 - 4 * ux, y + 18 * uy, 9 * ux, uy, PX.D); f.R(x0 + w * 0.5, y + 22 * uy, 2 * ux, 2 * uy, f.night ? PX.E + PX.LR : PX.LR); }
  else if (kind === 3) { f.R(x0 + w * 0.2, y, 7 * ux, 14 * uy, PX.R); f.R(x0 + w * 0.2 - ux, y + 14 * uy, 9 * ux, 3 * uy, PX.D); f.R(x0 + w * 0.2 + 1 * ux, y + 17 * uy, 4 * ux, 4 * uy, PX.L); }
  else { f.R(x0 + w * 0.65, y, 16 * ux, 4 * uy, SC.D(t.t)); f.R(x0 + w * 0.65 + 2 * ux, y + 4 * uy, 12 * ux, 8 * uy, PX.N); f.R(x0 + w * 0.65 + 2 * ux, y + 4 * uy, 12 * ux, uy, PX.Y); f.R(x0 + w * 0.65 + 4 * ux, y + 12 * uy, 8 * ux, 2 * uy, PX.D); }
};
/* a mansard or hip roof seen end-on: a sloping band above the cornice */
SC.slopeRoof = function (f, t, y, h, inset, col) {
  f.P([2, y, 98, y, 98 - inset, y + h, 2 + inset, y + h], col); f.P([2, y, 98, y, 98 - inset * 0.25, y + h * 0.28, 2 + inset * 0.25, y + h * 0.28], SC.D(col));
  f.R(2 + inset, y + h - f.uy, 96 - 2 * inset, f.uy * 1.4, SC.LT[col] === col ? PX.W : SC.LT[col]);
  for (var i = 1; i < 7; i++) f.fill(2 + inset + (96 - 2 * inset) * i / 7, y, 2 + inset + (96 - 2 * inset) * i / 7 + f.ux, y + h, function () { return true; }, SC.D(col));
};

/* ---------- generic shop block: a ground-floor display window, a door, upper windows, cornice and a rooftop ---------- */
SC.SH.box = function (f, t, o) {
  var H = o.h || 98, ux = f.ux, uy = f.uy, k = o.k || 0;
  f.wall(2, 0, 98, H, t.a, t.b, t.tex || 'plaster', 9);
  f.R(2, 0, 96, 5 * uy, SC.D(t.b));
  f.R(2, 5 * uy, 96, uy, SC.LT[t.b] === t.b ? t.t : SC.LT[t.b]);
  var rows = H > 90 ? 2 : 1, y0 = 48;
  f.grid(10, 90, y0, H - 12, 4, rows, t, { fw: 0.46, fh: 0.62 });
  f.win(9, 10, 40, 26, t, { kind: 0, lit: true });
  f.R(9, 10, 40, 2 * uy, SC.D(t.a));
  f.door(60, 24, 38, t);
  /* pilasters at the corners */
  f.R(2, 0, 5 * ux, H, SC.LT[t.a] === t.a ? t.t : SC.LT[t.a]); f.R(92, 0, 6 * ux, H, SC.D(t.b));
  f.cornice(0, 100, H, t, 6);
  if (k % 3 === 0) SC.slopeRoof(f, t, H + 6 * uy, 14, 14, t.r); else { f.R(2, H + 6 * uy, 96, 6 * uy, t.r); f.R(2, H + 11 * uy, 96, uy, SC.LT[t.r] === t.r ? PX.W : SC.LT[t.r]); }
  SC.roofTop(f, t, H + 12 * uy, k, 2, 98);
  return { door: { x: 60, w: 24, h: 38 }, sign: { x: 12, y: H - 2 * uy, w: 76, h: 12 } };
};

/* ---------- tall tower: stacked floors, a dense window grid and a crown. Glass on Kryndor Spire. ---------- */
SC.SH.tower = function (f, t, o) {
  var H = 112, ux = f.ux, uy = f.uy, k = o.k || 0;
  f.wall(12, 0, 88, H, t.a, t.b, t.tex === 'glass' ? 'glass' : 'panel', 10);
  f.R(12, 0, 76, 5 * uy, SC.D(t.b));
  f.R(4, 0, 92, 34, f.gh(SC.LT[t.a] === t.a ? t.t : SC.LT[t.a], t.a, 4, 96)); f.R(4, 34, 92, 2 * uy, SC.D(t.a));
  f.grid(18, 82, 40, H - 8, 4, 5, t, { fw: 0.55, fh: 0.58 });
  f.win(20, 8, 26, 20, t, { kind: 0, lit: true });
  f.door(56, 24, 30, t);
  f.R(12, 0, 3 * ux, H, SC.LT[t.a] === t.a ? PX.W : SC.LT[t.a]); f.R(84, 0, 4 * ux, H, SC.D(t.b));
  f.R(8, H, 84, 5 * uy, SC.D(t.a)); f.R(8, H + 5 * uy, 84, 2 * uy, t.t);
  f.R(24, H + 7 * uy, 52, 12 * uy, f.gh(t.a, t.b, 24, 76)); f.R(24, H + 7 * uy, 52, uy, t.t); f.R(24, H + 12 * uy, 52, 2 * uy, f.night ? PX.E + t.k : t.g);
  f.R(48, H + 19 * uy, 3 * ux, 22 * uy, PX.D); f.R(47, H + 41 * uy, 5 * ux, 3 * uy, f.night ? PX.E + PX.LR : PX.LR);
  return { door: { x: 56, w: 24, h: 30 }, sign: { x: 16, y: 38, w: 68, h: 12 } };
};

/* ---------- dome: a low block with a big ribbed bubble and a lamp on top. Quellin Reach. ---------- */
SC.SH.dome = function (f, t, o) {
  var H = 38, ux = f.ux, uy = f.uy;
  f.wall(2, 0, 98, H, t.a, t.b, 'plaster', 8);
  f.R(2, H, 96, 3 * uy, t.t); f.R(2, 0, 96, 4 * uy, SC.D(t.b));
  f.fill(0, H + 3 * uy, 100, 130, function (x, y) { var a = (x - 50) / 47, b = (y - (H + 3 * uy)) / 78; return a * a + b * b <= 1; }, function (lx, ly, X, Y) {
    var tt = (lx - 5) / 90, band = Math.abs(((lx - 50) / 47)); var c = PX.BAYER[(Y & 3) * 4 + (X & 3)] < tt * 16 ? t.b : t.a;
    if (Math.floor((lx - 5) / 15) !== Math.floor((lx - 5 + ux * 1.2) / 15)) c = t.t; else if (ly - H > 40 && PX.BAYER[(Y & 3) * 4 + (X & 3)] < 4) c = SC.LT[c];
    if (lx > 22 && lx < 34 && ly > H + 34 && ly < H + 44) c = PX.W; return c; });
  for (var i = 0; i < 3; i++) f.win(20 + i * 22, H + 10, 12, 10, t, { kind: 3, shut: false, lit: i !== 1 });
  f.R(2, H + 1.5 * uy, 96, 1.5 * uy, SC.D(t.t));
  f.door(38, 24, 28, t);
  f.R(49, H + 3 * uy + 78, 2 * ux, 14 * uy, PX.D); f.E(50, H + 3 * uy + 94, 3 * ux, 3 * uy, f.night ? PX.E + PX.LR : PX.LR);
  return { door: { x: 38, w: 24, h: 28 }, sign: { x: 12, y: H - 3 * uy, w: 76, h: 11 } };
};

/* ---------- ziggurat: stepped stone with a dark doorway and braziers. Karth-Osu. ---------- */
SC.SH.zig = function (f, t, o) {
  var ux = f.ux, uy = f.uy, i, tiers = [[2, 98, 0, 34], [14, 86, 34, 62], [27, 73, 62, 84], [38, 62, 84, 100]];
  tiers.forEach(function (r, j) {
    f.wall(r[0], r[2], r[1], r[3], j % 2 ? t.a : SC.LT[t.a] === t.a ? t.a : t.a, t.b, 'stone', 9);
    f.R(r[0] - 2 * ux, r[3], r[1] - r[0] + 4 * ux, 3 * uy, j % 2 ? t.t : SC.LT[t.a]); f.R(r[0] - 2 * ux, r[3] + 3 * uy, r[1] - r[0] + 4 * ux, uy * 1.6, SC.D(t.b));
  });
  for (i = 0; i < 5; i++) { f.R(8 + i * 17, 42, 6, 5, PX.K); f.R(9 + i * 17, 43, 4, 3, f.night ? PX.E + t.k : t.b); }
  for (i = 0; i < 3; i++) { f.R(32 + i * 14, 68, 4, 7, PX.K); }
  f.R(44, 103, 12 * 1, 5, t.t); f.R(48, 108, 4, 10, f.night ? PX.E + PX.Y : PX.R); f.E(50, 119, 4, 5, f.night ? PX.E + PX.LR : PX.LR); f.E(50, 119, 2, 3, PX.Y);
  f.fill(36, 0, 66, 30, function (x, y) { return y < 22 || ((x - 51) / 15) * ((x - 51) / 15) + ((y - 22) / 8) * ((y - 22) / 8) <= 1; }, PX.K);
  f.R(38, 0, 26, 3 * uy, SC.LT[t.a]); f.R(40, 0, 22, 2 * uy, t.t);
  [[10, 36], [84, 36]].forEach(function (b) { f.R(b[0], 0, 6, 30, SC.D(t.a)); f.R(b[0] - 2 * ux, 30, 10 * ux, 3 * uy, t.t); f.E(b[0] + 3, 36, 3 * ux, 4 * uy, f.night ? PX.E + PX.Y : PX.R); });
  return { door: { x: 36, w: 30, h: 28 }, sign: { x: 14, y: 34, w: 72, h: 11 } };
};

/* ---------- silo: a round tank with a domed top, ladder and a lean-to shed. Meridoa and Ferrox. ---------- */
SC.SH.silo = function (f, t, o) {
  var ux = f.ux, uy = f.uy, i;
  f.wall(14, 0, 74, 84, t.a, t.b, 'corr', 10);
  f.fill(14, 84, 74, 114, function (x, y) { var a = (x - 44) / 30, b = (y - 84) / 28; return a * a + b * b <= 1; }, f.gh(t.a, t.b, 14, 74));
  for (i = 0; i < 3; i++) f.R(14, 14 + i * 26, 60, 2 * uy, SC.D(t.b));
  f.R(44 - ux, 112, 2 * ux, 14 * uy, PX.D); f.E(44, 112 + 14 * uy, 3 * ux, 3 * uy, f.night ? PX.E + PX.LR : PX.LR);
  f.R(76, 0, 18, 44, f.gh(t.b, SC.D(t.b), 76, 94)); f.P([74, 44, 96, 44, 94, 52, 76, 52], t.r); f.R(79, 4, 12, 24, PX.K); f.R(80, 4, 10, 22, t.k);
  f.R(76, 0, 2 * ux, 60, PX.D); for (i = 0; i < 9; i++) f.R(76, 4 + i * 7, 6, uy, PX.L);
  f.door(30, 24, 28, t);
  return { door: { x: 30, w: 24, h: 28 }, sign: { x: 14, y: 70, w: 60, h: 12 } };
};

/* ---------- pod: a glass bubble on legs. Several worlds use it for cantinas and odd neighbours. ---------- */
SC.SH.pod = function (f, t, o) {
  var ux = f.ux, uy = f.uy;
  [[22, 0], [50, 0], [78, 0]].forEach(function (p) { f.R(p[0] - ux, 0, 2 * ux, 26, SC.D(t.b)); });
  f.R(8, 20, 84, 4 * uy, SC.D(t.b));
  f.fill(8, 24, 92, 118, function (x, y) { var a = (x - 50) / 42, b = (y - 62) / 38; return a * a + b * b <= 1; }, f.gh(t.a, t.b, 10, 90));
  f.fill(8, 24, 92, 118, function (x, y) { var a = (x - 50) / 42, b = (y - 62) / 38; return a * a + b * b <= 1 && a * a + b * b > 0.78; }, t.t);
  for (var i = 0; i < 3; i++) f.win(18 + i * 22, 52, 14, 18, t, { kind: 3, shut: false, lit: i !== 1 });
  f.R(8, 24, 84, 2 * uy, t.t); f.E(30, 92, 8, 5, PX.W);
  f.R(34, 24, 28, 24, PX.K); f.R(36, 24, 24, 22, t.k); f.R(47, 24, 2 * ux, 22, PX.K);
  f.R(49, 118, ux, 12 * uy, PX.D); f.E(49, 118 + 12 * uy, 3 * ux, 3 * uy, f.night ? PX.E + PX.LR : PX.LR);
  return { door: { x: 34, w: 28, h: 24 }, sign: { x: 14, y: 50, w: 72, h: 10 } };
};

/* ---------- giant mushroom with a doorway in the stem. Meridoa. ---------- */
SC.SH.mush = function (f, t, o) {
  var ux = f.ux, uy = f.uy, i;
  f.fill(28, 0, 72, 70, yes0, f.gh(t.a, SC.D(t.a), 28, 72)); f.R(28, 0, 44, 4 * uy, SC.D(t.b));
  f.fill(0, 62, 100, 126, function (x, y) { var a = (x - 50) / 50, b = (y - 62) / 52; return a * a + b * b <= 1 && y >= 62; }, f.gh(t.r === t.a ? PX.LR : t.r, SC.D(t.r), 0, 100));
  [[22, 76, 7], [54, 98, 9], [76, 74, 6], [38, 110, 5]].forEach(function (s) { f.E(s[0], s[1], s[2], s[2] * 0.7, PX.W); });
  f.R(2, 62, 96, 3 * uy, PX.W); f.R(2, 62, 96, 1.4 * uy, SC.D(t.r));
  f.win(34, 40, 10, 12, t, { kind: 3, lit: true }); f.win(56, 40, 10, 12, t, { kind: 3, lit: false });
  f.door(40, 20, 30, t);
  return { door: { x: 40, w: 20, h: 30 }, sign: { x: 16, y: 60, w: 68, h: 11 } };
};
function yes0() { return true; }

/* ---------- hex habitat: faceted panels, port-holes and hazard stripes. Nihil Station. ---------- */
SC.SH.hex = function (f, t, o) {
  var ux = f.ux, uy = f.uy, i;
  f.P([8, 0, 92, 0, 98, 40, 92, 100, 8, 100, 2, 40], PX.K);
  f.P([10, 2, 90, 2, 96, 40, 90, 98, 10, 98, 4, 40], PX.D);
  f.fill(4, 2, 96, 98, function (x, y) { var d = Math.abs(x - 50) / 46; return d <= 1 && y > 2 && y < 98 && (y > 8 || d < 0.9); }, function (lx, ly, X, Y) { return PX.BAYER[(Y & 3) * 4 + (X & 3)] < (lx - 4) / 92 * 14 ? t.b : t.a; });
  f.R(4, 30, 92, 2 * uy, SC.D(t.a)); f.R(4, 66, 92, 2 * uy, SC.D(t.a));
  for (i = 0; i < 4; i++) f.R(8 + i * 22, 38, 8, 22, SC.D(t.b));
  for (i = 0; i < 4; i++) f.E(12 + i * 22, 49, 4 * ux, 4 * uy, f.night && i !== 2 ? PX.E + PX.Y : t.g);
  for (i = 0; i < 4; i++) f.E(12 + i * 22, 82, 3 * ux, 3 * uy, f.night && i % 2 ? PX.E + PX.LC : t.g);
  for (i = 0; i < 12; i++) f.P([4 + i * 8, 0, 8 + i * 8, 0, 12 + i * 8, 6, 8 + i * 8, 6], (i & 1) ? PX.Y : PX.K);
  f.door(38, 24, 30, t);
  f.R(30, 98, 40, 4 * uy, PX.D); f.R(47, 102, 2 * ux, 22 * uy, PX.D); f.E(48, 102 + 22 * uy, 4 * ux, 3 * uy, f.night ? PX.E + PX.LC : PX.LC);
  return { door: { x: 38, w: 24, h: 30 }, sign: { x: 12, y: 86, w: 76, h: 10 } };
};

/* ---------- barn: planked walls, X-braced double doors, a hay loft and a gambrel roof. Meridoa. ---------- */
SC.SH.barn = function (f, t, o) {
  var ux = f.ux, uy = f.uy;
  f.wall(4, 0, 96, 64, t.a, t.b, 'plank', 9);
  f.R(4, 0, 92, 4 * uy, SC.D(t.b));
  f.P([4, 64, 96, 64, 96, 84, 82, 104, 18, 104, 4, 84], f.gh(t.a, t.b, 4, 96));
  f.P([0, 62, 100, 62, 98, 66, 2, 66], t.t);
  f.P([4, 84, 18, 104, 82, 104, 96, 84, 98, 84, 84, 108, 16, 108, 2, 84], SC.D(t.r)); f.P([14, 104, 86, 104, 82, 112, 18, 112], t.r); f.R(14, 112, 72, uy * 1.4, SC.LT[t.r]);
  f.R(36, 74, 28, 22, PX.K); f.R(38, 76, 24, 18, SC.D(t.a)); f.L(38, 76, 62, 94, 2, t.t); f.L(38, 94, 62, 76, 2, t.t); f.R(48, 94, 4, 8, PX.N); f.R(46, 98, 8, 2, PX.N);
  f.R(26, 0, 48, 44, PX.K); f.R(28, 0, 21, 42, t.k); f.R(51, 0, 21, 42, t.k); f.L(28, 2, 49, 40, 2, t.t); f.L(28, 40, 49, 2, 2, t.t); f.L(72, 2, 51, 40, 2, t.t); f.L(72, 40, 51, 2, 2, t.t);
  f.R(49, 0, 2, 44, PX.K); f.R(24, 44, 52, 3 * uy, t.t); f.R(24, 44, 52, uy, PX.W);
  f.win(8, 26, 10, 12, t, { kind: 3, lit: true }); f.win(82, 26, 10, 12, t, { kind: 3, lit: false });
  f.R(70, 112, 2 * ux, 12 * uy, PX.D); f.P([70, 124, 78, 120, 70, 118], PX.N);
  return { door: { x: 26, w: 48, h: 44 }, sign: { x: 12, y: 62, w: 76, h: 11 } };
};

/* ---------- arch: a temple front with a pylon, pillars and a dark doorway. Karth-Osu. ---------- */
SC.SH.arch = function (f, t, o) {
  var ux = f.ux, uy = f.uy, i;
  f.wall(2, 0, 98, 92, t.a, t.b, 'stone', 9);
  f.R(2, 0, 96, 5 * uy, SC.D(t.b)); f.R(0, 92, 100, 5 * uy, t.t); f.R(2, 97 + 5 * uy, 96, 3 * uy, SC.D(t.a)); f.R(0, 92 + 4 * uy, 100, uy, SC.LT[t.t] === t.t ? PX.W : SC.LT[t.t]);
  [10, 22, 70, 82].forEach(function (x) { f.R(x, 5 * uy, 8, 82, f.gh(SC.LT[t.a] === t.a ? PX.W : SC.LT[t.a], t.a, x, x + 8)); f.R(x - 1.5 * ux, 87, 11 * ux, 5 * uy, t.t); f.R(x - 1.5 * ux, 0, 11 * ux, 4 * uy, t.t); });
  f.fill(34, 0, 66, 78, function (x, y) { return y < 56 || ((x - 50) / 16) * ((x - 50) / 16) + ((y - 56) / 22) * ((y - 56) / 22) <= 1; }, PX.K);
  f.fill(37, 0, 63, 72, function (x, y) { return y < 54 || ((x - 50) / 13) * ((x - 50) / 13) + ((y - 54) / 18) * ((y - 54) / 18) <= 1; }, function (lx, ly, X, Y) { return f.night ? PX.E + PX.N : PX.BAYER[(Y & 3) * 4 + (X & 3)] < 7 ? PX.D : PX.K; });
  for (i = 0; i < 3; i++) { f.R(18 + i * 26, 100, 8, 6, SC.D(t.a)); f.E(22 + i * 26, 108, 4, 3, t.t); }
  f.E(50, 82, 6, 5, t.t); f.R(48, 80, 4, 4, PX.R);
  return { door: { x: 36, w: 28, h: 56 }, sign: { x: 12, y: 90, w: 76, h: 11 } };
};

/* ---------- derrick: a lattice tower over a corrugated shed. Ferrox. ---------- */
SC.SH.derrick = function (f, t, o) {
  var ux = f.ux, uy = f.uy, i;
  f.wall(4, 0, 96, 40, t.a, t.b, 'corr', 9); f.R(4, 0, 92, 4 * uy, SC.D(t.b)); f.P([0, 40, 100, 40, 94, 52, 6, 52], t.r); f.R(0, 40, 100, 2 * uy, SC.D(t.r));
  f.P([18, 52, 82, 52, 56, 130, 44, 130], PX.K);
  f.P([22, 52, 78, 52, 54, 126, 46, 126], f.night ? PX.D : PX.N);
  for (i = 0; i < 6; i++) { var yy = 56 + i * 11, hw = 26 - i * 3.6; f.L(50 - hw, yy, 50 + hw, yy + 5, 1.6, PX.K); f.L(50 + hw, yy, 50 - hw, yy + 5, 1.6, PX.K); f.R(50 - hw, yy, hw * 2, uy, PX.K); }
  f.R(44, 126, 12, 5 * uy, PX.D); f.E(50, 126 + 5 * uy, 5 * ux, 3 * uy, f.night ? PX.E + PX.LR : PX.LR);
  f.R(10, 8, 16, 26, PX.K); f.R(12, 8, 12, 24, t.k); f.win(70, 14, 20, 14, t, { kind: 1, lit: true });
  f.R(6, 40, 3 * ux, 12, PX.Y); f.R(84, 40, 3 * ux, 12, PX.Y);
  f.door(34, 22, 30, t);
  return { door: { x: 34, w: 22, h: 30 }, sign: { x: 8, y: 40, w: 84, h: 11 } };
};

/* ---------- balloon: a house slung under a patterned gas bag. Halcyra. ---------- */
SC.SH.balloon = function (f, t, o) {
  var ux = f.ux, uy = f.uy, i, c1 = t.r, c2 = SC.D(t.r) === t.r ? PX.W : PX.W;
  f.fill(8, 74, 92, 150, function (x, y) { var a = (x - 50) / 42, b = (y - 112) / 38; return a * a + b * b <= 1; }, function (lx, ly, X, Y) { var st = Math.floor((lx - 8) / 10) & 1, c = st ? c2 : c1; return PX.BAYER[(Y & 3) * 4 + (X & 3)] < (lx - 8) / 84 * 12 ? SC.D(c) : c; });
  f.E(34, 130, 7, 4, SC.LT[c1] === c1 ? PX.W : SC.LT[c1]);
  for (i = 0; i < 4; i++) f.L(20 + i * 20, 80, 26 + i * 16, 54, 1, PX.D);
  f.wall(12, 0, 88, 52, t.a, t.b, 'plank', 9);
  f.R(10, 52, 80, 4 * uy, t.t); f.R(12, 0, 76, 4 * uy, SC.D(t.b)); f.R(12, 4 * uy, 76, 1.5 * uy, SC.LT[t.b] === t.b ? t.t : SC.LT[t.b]);
  f.win(16, 24, 16, 18, t, { kind: 3, lit: true }); f.win(68, 24, 16, 18, t, { kind: 3, lit: false });
  f.door(40, 22, 32, t);
  f.R(12, 56, 2 * ux, 12, t.t); f.R(86, 56, 2 * ux, 12, t.t); f.L(12, 56, 12, 68, 1.5, t.t);
  return { door: { x: 40, w: 22, h: 32 }, sign: { x: 16, y: 48, w: 68, h: 10 } };
};

/* ---------- hall: the stock exchange, a columned front with a pediment and a live ticker ---------- */
SC.SH.hall = function (f, t, o) {
  var ux = f.ux, uy = f.uy, i;
  f.wall(2, 0, 98, 86, t.a, t.b, 'stone', 9); f.R(2, 0, 96, 5 * uy, SC.D(t.b));
  f.P([0, 86, 100, 86, 100, 90, 0, 90], t.t); f.P([4, 90, 96, 90, 50, 118], f.gh(t.a, t.b, 4, 96)); f.P([10, 90, 90, 90, 50, 112], t.t); f.P([18, 92, 82, 92, 50, 108], SC.D(t.a));
  f.E(50, 98, 5 * ux, 4 * uy, PX.Y); f.R(46, 94, 8, 2, PX.N);
  for (i = 0; i < 6; i++) { var x = 8 + i * 15; f.R(x, 5 * uy, 7, 78, f.gh(SC.LT[t.a] === t.a ? PX.W : SC.LT[t.a], t.a, x, x + 7)); f.R(x - 1 * ux, 83, 9 * ux, 3 * uy, t.t); f.R(x - 1 * ux, 0, 9 * ux, 4 * uy, t.t); }
  f.R(8, 36, 84, 20, PX.K); f.R(10, 38, 80, 16, PX.K);
  for (i = 0; i < 7; i++) { var up = (i + (o.k || 0)) % 3 !== 0; f.R(12 + i * 11, 40, 8, 5, up ? PX.LG : PX.LR); f.R(13 + i * 11, 47, 6, 3, up ? PX.G : PX.R); }
  f.R(8, 36, 84, uy * 1.2, PX.D); f.R(8, 56, 84, uy * 1.2, PX.D);
  f.door(38, 24, 32, t, { steps: true });
  return { door: { x: 38, w: 24, h: 32 }, sign: { x: 14, y: 82, w: 72, h: 10 } };
};

/* ---------- kiosk: a little roofed noticeboard on two posts. The Odd Jobs board. ---------- */
SC.SH.kiosk = function (f, t, o) {
  var ux = f.ux, uy = f.uy, i, cols = [PX.W, PX.LR, PX.LG, PX.LC, PX.Y, PX.LM];
  f.R(8, 0, 4 * ux, 62, SC.D(PX.N)); f.R(88 - ux * 2, 0, 4 * ux, 62, SC.D(PX.N)); f.R(8, 0, ux * 1.5, 62, PX.N); f.R(88 - ux * 2, 0, ux * 1.5, 62, PX.N);
  f.R(6, 12, 88, 52, PX.K); f.R(7, 13, 86, 50, PX.N); f.R(9, 15, 82, 46, f.gh(PX.Y, PX.N, 9, 91));
  for (i = 0; i < 9; i++) { var px = 12 + (i % 3) * 27 + ((i * 7) % 4), py = 20 + Math.floor(i / 3) * 14 + ((i * 5) % 3); f.R(px, py, 20, 11, cols[(i + (o.k || 0)) % cols.length]); f.R(px + 8, py + 9, 3, 3, PX.R); f.R(px + 2, py + 3, 12, uy, PX.D); f.R(px + 2, py + 6, 9, uy, PX.D); }
  f.P([0, 66, 100, 66, 90, 80, 10, 80], t.r); f.P([0, 66, 100, 66, 100, 68, 0, 68], SC.D(t.r)); f.R(10, 80, 80, uy * 1.4, SC.LT[t.r] === t.r ? PX.W : SC.LT[t.r]);
  f.R(30, 0, 40, 5, PX.N); f.R(30, 5, 40, 2, SC.D(PX.N)); f.R(33, 0, 3, 12, PX.N); f.R(64, 0, 3, 12, PX.N);
  f.R(50, 80, 2 * ux, 10 * uy, PX.D); f.E(51, 80 + 10 * uy, 3 * ux, 3 * uy, f.night ? PX.E + PX.Y : PX.Y);
  return { door: { x: 30, w: 40, h: 12 }, sign: { x: 14, y: 80, w: 72, h: 12 }, small: true };
};

/* ---------- the way into the back alley: a dark gap between two walls ---------- */
SC.SH.gap = function (f, t, o) {
  var ux = f.ux, uy = f.uy, i;
  f.wall(2, 0, 98, 100, SC.D(t.b), PX.K, 'brick', 11); f.R(2, 0, 96, 6 * uy, PX.K);
  f.fill(20, 0, 80, 84, function (x, y) { return y < 62 || ((x - 50) / 30) * ((x - 50) / 30) + ((y - 62) / 22) * ((y - 62) / 22) <= 1; }, PX.K);
  f.fill(24, 0, 76, 76, function (x, y) { return y < 60 || ((x - 50) / 26) * ((x - 50) / 26) + ((y - 60) / 16) * ((y - 60) / 16) <= 1; }, function (lx, ly, X, Y) { return ly < 12 ? PX.D : (PX.BAYER[(Y & 3) * 4 + (X & 3)] < 3 ? PX.D : PX.K); });
  f.E(34, 14, 7, 7, PX.G); f.R(27, 4, 14, 8, PX.G); f.R(27, 4, 14, 2, PX.LG); f.R(60, 0, 14, 22, PX.D); f.R(58, 22, 18, 2, PX.L);
  f.E(46, 70, 3 * ux, 3 * uy, f.night ? PX.E + PX.Y : PX.Y); f.E(54, 70, 3 * ux, 3 * uy, f.night ? PX.E + PX.Y : PX.Y); f.R(45, 69, 1, 1, PX.K);
  f.R(10, 20, 2 * ux, 80, PX.D); f.R(88, 30, 2 * ux, 70, PX.D); f.L(12, 70, 24, 78, 1, PX.D);
  f.R(0, 100, 100, 4 * uy, SC.D(t.a)); f.R(0, 100 + 4 * uy, 100, uy, t.t);
  f.win(7, 52, 8, 10, t, { kind: 1, lit: false }); f.win(86, 52, 8, 10, t, { kind: 1, lit: true });
  return { door: { x: 24, w: 52, h: 60 }, sign: { x: 20, y: 96, w: 60, h: 8 }, noSign: true };
};

/* ================= service dressings: awnings, canopies, columns, signs and the odd prop ================= */
SC.FN = {};
SC.FN.market = function (f, t, m, o) {
  var ux = f.ux, uy = f.uy, i, st = [PX.R, PX.W, PX.Y, PX.G];
  f.awning(6, 54, 42, 7, 16, st[(o.k || 0) % 2 ? 2 : 0], st[(o.k || 0) % 2 ? 3 : 1]);
  for (i = 0; i < 3; i++) { f.R(10 + i * 14, 0, 11, 8, PX.N); f.R(10 + i * 14, 8, 11, uy * 1.4, PX.Y); f.E(15 + i * 14, 11, 5, 3, [PX.LR, PX.LG, PX.Y][i]); }
};
SC.FN.bank = function (f, t, m, o) {
  var ux = f.ux, uy = f.uy, i;
  [12, 26, 66, 80].forEach(function (x) { if (x > 50 && x < 70) return; f.R(x, 5 * uy, 6, 34, f.gh(PX.W, PX.L, x, x + 6)); f.R(x - ux, 0, 8 * ux, 4 * uy, PX.W); f.R(x - ux, 39 + 5 * uy, 8 * ux, 3 * uy, PX.W); });
  f.E(50, 62, 10 * ux, 9 * uy, PX.Y); f.E(50, 62, 7 * ux, 6.5 * uy, PX.N); f.T('C', 50, 58, 7, PX.Y, 'c'); f.E(50, 62, 10 * ux, 9 * uy, -1);
};
SC.FN.yard = function (f, t, m, o) {
  var ux = f.ux, uy = f.uy, i;
  f.R(6, 0, 36, 38, PX.K); f.R(8, 0, 32, 36, PX.D); for (i = 0; i < 8; i++) f.R(8, i * 4.6, 32, uy, PX.K);
  f.R(6, 38, 36, 3 * uy, PX.Y); for (i = 0; i < 6; i++) f.R(6 + i * 6, 38, 3, 3 * uy, PX.K);
  f.L(88, 4, 88, 80, 3, PX.N); f.L(88, 80, 66, 90, 3, PX.N); f.L(66, 90, 66, 72, 1, PX.D); f.R(62, 66, 8, 6, PX.Y);
};
SC.FN.fuel = function (f, t, m, o) {
  var ux = f.ux, uy = f.uy, i;
  f.R(2, 44, 96, 4 * uy, PX.R); f.R(2, 44, 96, uy, PX.W); f.R(2, 44 + 4 * uy, 96, 2 * uy, SC.D(PX.R));
  [10, 74].forEach(function (x) { f.R(x, 0, 14, 34, PX.R); f.R(x + 2, 18, 10, 12, PX.W); f.R(x + 3, 21, 8, 3, PX.LC); f.R(x + 3, 26, 8, 2, PX.D); f.R(x - 2 * ux, 34, 18 * ux, 3 * uy, PX.D); f.L(x + 14, 22, x + 22, 8, 1.4, PX.K); });
  f.R(54, 0, 3 * ux, 44, PX.D);
};
SC.FN.cantina = function (f, t, m, o) {
  var ux = f.ux, uy = f.uy, i;
  f.awning(6, 54, 44, 6, 14, PX.R, PX.N);
  for (i = 0; i < 6; i++) { f.E(12 + i * 8, 49 + (i % 2) * 2, 2 * ux, 2 * uy, f.night ? PX.E + [PX.LR, PX.Y, PX.LG, PX.LC][i % 4] : [PX.LR, PX.Y, PX.LG, PX.LC][i % 4]); }
  f.R(72, 52, 18, 18, PX.K); f.P([74, 68, 88, 68, 81, 56], f.night ? PX.E + PX.LM : PX.LM); f.R(80, 54, 2, 4, f.night ? PX.E + PX.LM : PX.LM); f.R(76, 53, 10, 2, f.night ? PX.E + PX.LM : PX.LM);
};
SC.FN.office = function (f, t, m, o) {
  var ux = f.ux, uy = f.uy;
  f.R(90, 0, 2 * ux, 60, PX.D); f.R(74, 40, 20, 14, PX.W); f.R(74, 40, 20, 2 * uy, PX.R); f.T('SALE', 84, 43, 7, PX.R, 'c');
  f.R(10, 0, 20, 22, PX.W); f.R(10, 22, 20, 2 * uy, PX.R); f.T('SOLD', 20, 7, 6, PX.R, 'c');
};
SC.FN.parlour = function (f, t, m, o) {
  var ux = f.ux, uy = f.uy, i;
  f.P([2, 90, 20, 90, 14, 4, 2, 4], PX.R); f.P([98, 90, 80, 90, 86, 4, 98, 4], PX.R);
  for (i = 0; i < 12; i++) f.E(6 + i * 8, 56, 1.6 * ux, 1.6 * uy, f.night ? PX.E + (i % 2 ? PX.Y : PX.LR) : (i % 2 ? PX.Y : PX.LR));
  f.E(50, 76, 8 * ux, 7 * uy, PX.Y); f.E(50, 76, 6 * ux, 5 * uy, PX.R); f.E(50, 76, 2 * ux, 2 * uy, PX.Y);
};
SC.FN.exchange = function (f, t, m, o) {
  var ux = f.ux, uy = f.uy;
  f.R(90, 90, 2 * ux, 30, PX.D); f.P([92, 118, 104, 114, 92, 110], PX.LG);
};
SC.FN.alley = function () {};
SC.FN.jobs = function () {};

/* the world's own flourish on top of everything: a few roof and wall ornaments so no two planets feel alike */
SC.ORN = {
  farm: function (f, t, m, o) { var uy = f.uy, ux = f.ux; if (o.k % 2) { f.R(10, 128, 2 * ux, 8 * uy, PX.N); f.P([12, 136, 22, 134, 12, 131], PX.W); } if (o.k % 3 === 0) { f.E(12, 112, 6 * ux, 4 * uy, PX.Y); f.R(10, 108, 4 * ux, 4 * uy, PX.N); } },
  ruin: function (f, t, m, o) { var uy = f.uy, ux = f.ux; if (o.k % 2) { f.P([4, 98, 20, 98, 14, 108, 8, 104], SC.D(t.a)); } f.R(6, 20, 2 * ux, 14 * uy, SC.D(t.a)); f.R(88, 6, 2 * ux, 3 * uy, f.night ? PX.E + PX.LR : PX.R); },
  mine: function (f, t, m, o) { var uy = f.uy, ux = f.ux; if (o.k % 2) { f.R(84, 100, 6 * ux, 20 * uy, PX.D); f.E(87, 120 + 4 * uy, 6 * ux, 4 * uy, PX.L); f.E(92, 130 + 8 * uy, 5 * ux, 3 * uy, PX.D); } f.R(4, 0, 3 * ux, 10, PX.Y); },
  neon: function (f, t, m, o) { var uy = f.uy, ux = f.ux; f.R(2, 60, 3 * ux, 40, f.night ? PX.E + PX.LM : PX.LM); f.R(95, 50, 3 * ux, 30, f.night ? PX.E + PX.LC : PX.LC); },
  void: function (f, t, m, o) { var uy = f.uy, ux = f.ux; f.R(94, 0, 3 * ux, 90, PX.D); f.R(2, 0, 2 * ux, 60, PX.L); if (o.k % 2) f.E(10, 108, 4 * ux, 3 * uy, f.night ? PX.E + PX.LC : PX.LC); },
  lab: function (f, t, m, o) { var uy = f.uy, ux = f.ux; if (o.k % 2) { f.E(80, 8, 10 * ux, 3 * uy, PX.LM); f.R(78, 0, 3 * ux, 8, PX.D); } },
  cloud: function (f, t, m, o) { var uy = f.uy, ux = f.ux; f.P([4, 8, 18, 6, 4, 2], t.r); f.R(4, 0, ux, 10, PX.D); }
};
