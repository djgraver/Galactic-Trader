/* Galactic Trader Deluxe. Part 22: the street. A one-point perspective boulevard in 16-colour EGA. The walls run away at about 28 degrees toward a vanishing point,
   each planet has its own palette, building shapes and ornaments, and every building is painted flat and then warped onto its wall. */
var SC = { W: 320, H: 180, VX: 186, VY: 76, INK: '#000000' };
SC.night = function (s) { s = s || (typeof S !== 'undefined' ? S : null); return !!(s && s.visit && s.visit.night); };

/* palettes: a lit wall, b shaded wall, r roof, t trim, k accent, g glass, sun. sky and nsky are top-to-bottom gradients. */
SC.TH = {
  meridoa:  { sky: [PX.LB, PX.LC, PX.W], nsky: [PX.K, PX.B, PX.B], ground: [PX.LG, PX.G], road: [PX.N, PX.Y], walk: [PX.L, PX.W], far: [PX.G, PX.LG], a: PX.Y, b: PX.N, r: PX.LR, t: PX.W, k: PX.LG, g: PX.LC, sun: PX.Y, orn: 'farm' },
  karthosu: { sky: [PX.R, PX.LR, PX.Y], nsky: [PX.K, PX.B, PX.M], ground: [PX.Y, PX.N], road: [PX.Y, PX.L], walk: [PX.N, PX.Y], far: [PX.N, PX.R], a: PX.Y, b: PX.N, r: PX.N, t: PX.W, k: PX.LC, g: PX.K, sun: PX.LR, orn: 'ruin' },
  ferrox:   { sky: [PX.D, PX.N, PX.LR], nsky: [PX.K, PX.K, PX.R], ground: [PX.D, PX.K], road: [PX.K, PX.D], walk: [PX.D, PX.L], far: [PX.D, PX.K], a: PX.L, b: PX.D, r: PX.R, t: PX.N, k: PX.LR, g: PX.Y, sun: PX.LR, orn: 'mine' },
  kryndor:  { sky: [PX.B, PX.M, PX.LM], nsky: [PX.K, PX.B, PX.M], ground: [PX.D, PX.K], road: [PX.K, PX.D], walk: [PX.B, PX.D], far: [PX.B, PX.M], a: PX.LC, b: PX.B, r: PX.C, t: PX.LM, k: PX.Y, g: PX.W, sun: PX.W, orn: 'neon' },
  nihil:    { sky: [PX.K, PX.K, PX.B], nsky: [PX.K, PX.K, PX.K], ground: [PX.D, PX.K], road: [PX.K, PX.B], walk: [PX.D, PX.L], far: [PX.D, PX.B], a: PX.L, b: PX.D, r: PX.D, t: PX.LM, k: PX.LC, g: PX.LM, sun: PX.LM, orn: 'void' },
  quellin:  { sky: [PX.LC, PX.W, PX.W], nsky: [PX.K, PX.B, PX.C], ground: [PX.W, PX.L], road: [PX.L, PX.W], walk: [PX.W, PX.LC], far: [PX.LC, PX.C], a: PX.W, b: PX.LC, r: PX.LC, t: PX.LM, k: PX.LG, g: PX.C, sun: PX.W, orn: 'lab' },
  halcyra:  { sky: [PX.LR, PX.Y, PX.W], nsky: [PX.B, PX.M, PX.LR], ground: [PX.W, PX.L], road: [PX.Y, PX.W], walk: [PX.W, PX.L], far: [PX.LR, PX.LM], a: PX.W, b: PX.LM, r: PX.LR, t: PX.Y, k: PX.LC, g: PX.LB, sun: PX.LR, orn: 'cloud' }
};
/* which building shape each planet uses for each service, and what decorations the rest wear */
SC.KIT = {
  meridoa:  { market: 'mush', bank: 'silo', yard: 'barn', fuel: 'silo', cantina: 'pod', office: 'barn', parlour: 'pod', decor: ['pod', 'silo', 'mush'] },
  karthosu: { market: 'zig', bank: 'arch', yard: 'arch', fuel: 'arch', cantina: 'zig', office: 'zig', parlour: 'arch', decor: ['zig', 'arch', 'tower'] },
  ferrox:   { market: 'box', bank: 'derrick', yard: 'derrick', fuel: 'silo', cantina: 'box', office: 'box', parlour: 'box', decor: ['derrick', 'silo', 'box'] },
  kryndor:  { market: 'tower', bank: 'tower', yard: 'box', fuel: 'pod', cantina: 'tower', office: 'tower', parlour: 'tower', decor: ['tower', 'box', 'pod'] },
  nihil:    { market: 'hex', bank: 'hex', yard: 'hex', fuel: 'pod', cantina: 'hex', office: 'hex', parlour: 'dome', decor: ['pod', 'hex', 'dome'] },
  quellin:  { market: 'dome', bank: 'dome', yard: 'pod', fuel: 'silo', cantina: 'dome', office: 'pod', parlour: 'dome', decor: ['dome', 'pod', 'silo'] },
  halcyra:  { market: 'balloon', bank: 'dome', yard: 'balloon', fuel: 'balloon', cantina: 'balloon', office: 'balloon', parlour: 'balloon', decor: ['balloon', 'pod', 'dome'] }
};
/* who stands where. L1..L4 run up the left wall (near to far), R1..R4 up the right, E closes the street. */
SC.LAYOUT = {
  meridoa:  { L: ['market', 'cantina', 'office', 'decor'], R: ['fuel', 'yard', 'alley', 'decor'], E: 'bank' },
  karthosu: { L: ['bank', 'market', 'decor', 'alley'], R: ['cantina', 'yard', 'office', 'decor'], E: 'fuel' },
  ferrox:   { L: ['yard', 'market', 'alley', 'decor'], R: ['fuel', 'cantina', 'office', 'decor'], E: 'bank' },
  kryndor:  { L: ['market', 'fuel', 'cantina', 'decor'], R: ['bank', 'office', 'alley', 'decor'], E: 'yard' },
  nihil:    { L: ['market', 'cantina', 'yard', 'decor'], R: ['fuel', 'office', 'alley', 'decor'], E: 'parlour', bank: 'L4' },
  quellin:  { L: ['bank', 'cantina', 'decor', 'alley'], R: ['market', 'yard', 'office', 'decor'], E: 'fuel' },
  halcyra:  { L: ['market', 'yard', 'office', 'decor'], R: ['cantina', 'fuel', 'alley', 'decor'], E: 'bank' }
};
SC.SLOTS = {
  L1: { s: 'L', xa: -6, xb: 50, Hw: 150 }, L2: { s: 'L', xa: 54, xb: 86, Hw: 140 }, L3: { s: 'L', xa: 90, xb: 114, Hw: 130 }, L4: { s: 'L', xa: 118, xb: 136, Hw: 120 },
  R1: { s: 'R', xa: 276, xb: 326, Hw: 150 }, R2: { s: 'R', xa: 244, xb: 272, Hw: 140 }, R3: { s: 'R', xa: 222, xb: 240, Hw: 130 }, R4: { s: 'R', xa: 208, xb: 218, Hw: 120 },
  E: { s: 'E', xa: 144, xb: 204, Hw: 84 }
};
SC.baseL = function (x) { return SC.VY + (178 - SC.VY) * (SC.VX - x) / (SC.VX + 6); };
SC.baseR = function (x) { return SC.VY + (150 - SC.VY) * (x - SC.VX) / (326 - SC.VX); };
SC.scL = function (x) { return (SC.VX - x) / (SC.VX + 6); };
SC.scR = function (x) { return (x - SC.VX) / (326 - SC.VX); };

/* ---------- a facade: paint in flat local units (x 0..100 across, y 0..130 up), pixels land warped on the wall ---------- */
SC.Fac = function (B, slot, night, rnd) {
  var s = slot.s, xa = slot.xa, xb = slot.xb, ba = s === 'L' ? SC.baseL : s === 'R' ? SC.baseR : function () { return SC.VY + 8; }, sc = s === 'L' ? SC.scL : s === 'R' ? SC.scR : function () { return 1; };
  this.B = B; this.xa = xa; this.xb = xb; this.ybA = ba(xa); this.ybB = ba(xb); this.hA = slot.Hw * sc(xa); this.hB = slot.Hw * sc(xb); this.night = night; this.rnd = rnd; this.mask = new Uint8Array(B.w * B.h);
  this.px = (xb - xa) / 100;
};
(function (F) {
  F.map = function (lx, ly) { var u = lx / 100; return [this.xa + u * (this.xb - this.xa), this.ybA + u * (this.ybB - this.ybA) - ly / 130 * (this.hA + u * (this.hB - this.hA))]; };
  F.fill = function (x0, y0, x1, y1, test, col) {
    var me = this, B = this.B, X0 = 1e9, X1 = -1e9, Y0 = 1e9, Y1 = -1e9;
    [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].forEach(function (c) { var p = me.map(c[0], c[1]); X0 = Math.min(X0, p[0]); X1 = Math.max(X1, p[0]); Y0 = Math.min(Y0, p[1]); Y1 = Math.max(Y1, p[1]); });
    X0 = Math.max(0, Math.floor(X0)); X1 = Math.min(B.w - 1, Math.ceil(X1)); Y0 = Math.max(0, Math.floor(Y0)); Y1 = Math.min(B.h - 1, Math.ceil(Y1));
    var du = this.xb - this.xa;
    for (var X = X0; X <= X1; X++) {
      var u = (X + 0.5 - this.xa) / du, lx = u * 100; if (lx < x0 || lx >= x1) continue;
      var yb = this.ybA + u * (this.ybB - this.ybA), h = this.hA + u * (this.hB - this.hA);
      for (var Y = Y0; Y <= Y1; Y++) {
        var ly = (yb - (Y + 0.5)) / h * 130; if (ly < y0 || ly >= y1 || !test(lx, ly)) continue;
        var c = typeof col === 'function' ? col(lx, ly, X, Y) : col; if (c < 0) continue;
        B.d[Y * B.w + X] = c; this.mask[Y * B.w + X] = 1;
      }
    }
  };
  F.R = function (x, y, w, h, c) { this.fill(x, y, x + w, y + h, function () { return true; }, c); };
  F.E = function (cx, cy, rx, ry, c) { this.fill(cx - rx, cy - ry, cx + rx, cy + ry, function (x, y) { var a = (x - cx) / rx, b = (y - cy) / ry; return a * a + b * b <= 1; }, c); };
  F.P = function (pts, c) {
    var xs = [], ys = [], n = pts.length / 2, i; for (i = 0; i < n; i++) { xs.push(pts[i * 2]); ys.push(pts[i * 2 + 1]); }
    this.fill(Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs) + 0.01, Math.max.apply(null, ys) + 0.01, function (x, y) {
      var inside = false; for (var a = 0, b = n - 1; a < n; b = a++) { if ((ys[a] > y) !== (ys[b] > y) && x < (xs[b] - xs[a]) * (y - ys[a]) / (ys[b] - ys[a]) + xs[a]) inside = !inside; } return inside;
    }, c);
  };
  F.L = function (x0, y0, x1, y1, w, c) { var dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l * w / 2, ny = dx / l * w / 2; this.P([x0 + nx, y0 + ny, x1 + nx, y1 + ny, x1 - nx, y1 - ny, x0 - nx, y0 - ny], c); };
  /* a run of text, baseline at y, hgt local units tall */
  F.T = function (s, x, y, hgt, c, align) {
    s = String(s).toUpperCase(); var cw = hgt * 6 / 7, tw = s.length * cw; if (align === 'c') x -= tw / 2;
    this.fill(x, y, x + tw, y + hgt, function (lx, ly) {
      var gx = (lx - x) / cw, ci = Math.floor(gx), col = Math.floor((gx - ci) * 6), row = 6 - Math.floor((ly - y) / hgt * 7); if (col > 4 || row < 0 || row > 6) return false;
      var g = PX.FONT[s[ci]] || PX.FONT['?']; return ((g[col] >> row) & 1) === 1;
    }, c);
  };
  F.gh = function (a, b, x0, x1) { return function (lx, ly, X, Y) { var t = Math.max(0, Math.min(1, (lx - x0) / (x1 - x0))) * 16; return PX.BAYER[(Y & 3) * 4 + (X & 3)] < t ? b : a; }; };
  F.gv = function (a, b, y0, y1) { return function (lx, ly, X, Y) { var t = Math.max(0, Math.min(1, (ly - y0) / (y1 - y0))) * 16; return PX.BAYER[(Y & 3) * 4 + (X & 3)] < t ? b : a; }; };
  F.wins = function (x, y, cols, rows, w, h, gx, gy, glass) {
    for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) { var lit = this.night && this.rnd() < 0.6; this.R(x + i * (w + gx), y + j * (h + gy), w, h, lit ? PX.E + PX.Y : glass); }
  };
  /* give the whole painted building a one pixel black edge */
  F.edge = function () {
    var B = this.B, m = this.mask, w = B.w, h = B.h, out = [], i, x, y;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) { i = y * w + x; if (!m[i]) continue; if (x === 0 || y === 0 || x === w - 1 || y === h - 1 || !m[i - 1] || !m[i + 1] || !m[i - w] || !m[i + w]) out.push(i); }
    out.forEach(function (j) { B.d[j] = 0; });
  };
  for (var k in F) SC.Fac.prototype[k] = F[k];
})({});

/* ---------- building shapes. Each paints into the facade and returns where the door and sign are. ---------- */
SC.SH = {};
SC.SH.box = function (f, t, o) {
  var h = o.h || 74; f.R(6, 0, 88, h, f.gh(t.a, t.b, 6, 94)); f.R(2, h, 96, 7, t.t); f.R(8, h + 7, 84, 3, t.r);
  f.wins(14, h - 36, 3, 2, 16, 11, 11, 7, t.g); f.R(38, 0, 24, 30, PX.K); f.R(41, 0, 18, 27, t.k); f.R(49, 0, 2, 27, PX.K);
  return { dx: 38, dw: 24, dh: 30, sx: 8, sy: h - 6, sw: 84, sh: 12 };
};
SC.SH.tower = function (f, t, o) {
  var h = 108; f.R(18, 0, 64, h, f.gh(t.a, t.b, 18, 82)); f.R(26, h, 48, 10, t.b); f.R(34, h + 10, 32, 8, t.a); f.L(50, h + 18, 50, h + 34, 2, t.t); f.R(48, h + 32, 4, 4, PX.E + PX.LR);
  for (var j = 0; j < 7; j++) f.R(22, 40 + j * 9, 56, 3, j % 2 ? t.g : (f.night ? PX.E + PX.Y : t.g));
  f.R(22, 12, 56, 2, t.t); f.R(38, 0, 24, 26, PX.K); f.R(41, 0, 18, 23, t.g);
  return { dx: 38, dw: 24, dh: 26, sx: 20, sy: 30, sw: 60, sh: 11 };
};
SC.SH.dome = function (f, t, o) {
  f.R(8, 0, 84, 34, f.gh(t.a, t.b, 8, 92)); f.R(5, 34, 90, 5, t.t); f.E(50, 38, 42, 44, f.gh(t.a, t.b, 8, 92)); f.R(0, 0, 100, 38, -1);
  f.E(50, 40, 42, 40, f.gh(t.b === PX.LC ? PX.W : t.a, t.b, 12, 90)); for (var i = 0; i < 3; i++) f.L(50 + i * 14 - 14, 40, 50 + (i - 1) * 6, 80, 2, t.t);
  f.E(36, 66, 8, 5, PX.W); f.L(50, 80, 50, 96, 2, t.t); f.E(50, 98, 4, 4, PX.E + PX.LR);
  f.R(8, 0, 84, 34, f.gh(t.a, t.b, 8, 92)); f.wins(16, 14, 4, 1, 14, 10, 8, 0, t.g); f.R(38, 0, 24, 24, PX.K); f.R(41, 0, 18, 21, t.k); f.R(5, 34, 90, 4, t.t);
  return { dx: 38, dw: 24, dh: 24, sx: 12, sy: 25, sw: 76, sh: 8 };
};
SC.SH.zig = function (f, t, o) {
  f.R(4, 0, 92, 32, f.gh(t.a, t.b, 4, 96)); f.R(16, 32, 68, 26, f.gh(t.a, t.b, 16, 84)); f.R(30, 58, 40, 22, f.gh(t.a, t.b, 30, 70)); f.R(40, 80, 20, 14, t.t); f.R(46, 94, 8, 10, PX.E + t.k);
  f.R(2, 30, 96, 3, t.r); f.R(14, 56, 72, 3, t.r); f.R(28, 78, 44, 3, t.r);
  for (var i = 0; i < 6; i++) { f.R(10 + i * 14, 40, 6, 6, f.night ? PX.E + t.k : t.b); f.R(36 + (i % 2) * 18, 64, 5, 7, f.night ? PX.E + t.k : t.b); }
  f.R(38, 0, 24, 26, PX.K); f.R(41, 0, 18, 22, PX.D); f.R(44, 0, 12, 18, PX.K);
  return { dx: 38, dw: 24, dh: 26, sx: 8, sy: 33, sw: 84, sh: 9 };
};
SC.SH.silo = function (f, t, o) {
  f.R(18, 0, 64, 84, f.gh(t.a, t.b, 18, 82)); f.E(50, 84, 32, 16, f.gh(t.a, t.b, 18, 82)); f.E(50, 92, 20, 8, t.t); f.L(50, 100, 50, 118, 2, t.t); f.E(50, 120, 5, 4, PX.E + PX.LR);
  f.R(18, 54, 64, 3, t.r); f.R(18, 18, 64, 3, t.r); f.R(86, 0, 8, 70, f.gh(t.b, PX.D, 86, 94)); f.E(90, 70, 6, 4, t.t);
  f.R(38, 0, 24, 28, PX.K); f.R(41, 0, 18, 25, t.k); f.R(48, 0, 4, 25, PX.K);
  return { dx: 38, dw: 24, dh: 28, sx: 22, sy: 32, sw: 56, sh: 12 };
};
SC.SH.pod = function (f, t, o) {
  f.L(30, 20, 18, 0, 5, t.b); f.L(70, 20, 82, 0, 5, t.b); f.L(50, 20, 50, 0, 5, t.b);
  f.E(50, 64, 38, 46, f.gh(t.a, t.b, 12, 88)); f.E(50, 64, 38, 8, t.t); f.R(12, 62, 76, 5, t.t);
  for (var i = 0; i < 3; i++) f.E(30 + i * 20, 84, 6, 6, f.night ? PX.E + PX.Y : t.g); f.E(50, 40, 12, 14, PX.K); f.E(50, 40, 9, 11, t.k);
  return { dx: 40, dw: 20, dh: 24, sx: 14, sy: 56, sw: 72, sh: 12 };
};
SC.SH.mush = function (f, t, o) {
  f.R(34, 0, 32, 66, f.gh(t.a, t.b, 34, 66)); f.E(50, 70, 48, 28, f.gh(t.r, t.b, 4, 96)); f.R(0, 0, 100, 66, -1);
  f.R(34, 0, 32, 66, f.gh(t.a, t.b, 34, 66)); f.E(50, 70, 48, 28, t.r); f.E(34, 82, 7, 5, PX.W); f.E(64, 90, 6, 4, PX.W); f.E(72, 72, 5, 4, PX.W); f.E(22, 70, 5, 4, PX.W);
  f.R(4, 62, 92, 4, t.b); f.R(38, 0, 24, 30, PX.K); f.R(41, 0, 18, 27, t.k);
  return { dx: 38, dw: 24, dh: 30, sx: 36, sy: 34, sw: 28, sh: 9 };
};
SC.SH.hex = function (f, t, o) {
  f.P([14, 4, 86, 4, 98, 30, 98, 56, 86, 82, 14, 82, 2, 56, 2, 30], f.gh(t.a, t.b, 2, 98)); f.P([22, 12, 78, 12, 88, 32, 88, 54, 78, 74, 22, 74, 12, 54, 12, 32], f.gh(t.b, PX.D, 12, 88));
  for (var i = 0; i < 4; i++) f.E(22 + i * 19, 62, 6, 6, f.night ? PX.E + t.g : t.k); f.R(38, 0, 24, 22, PX.K); f.R(41, 0, 18, 19, t.t); f.R(49, 0, 2, 19, PX.K);
  f.L(50, 82, 50, 102, 2, t.t); f.E(50, 106, 12, 5, t.t); f.R(8, 80, 16, 3, PX.Y); f.R(76, 80, 16, 3, PX.Y);
  return { dx: 38, dw: 24, dh: 22, sx: 18, sy: 28, sw: 64, sh: 12 };
};
SC.SH.barn = function (f, t, o) {
  f.R(8, 0, 84, 46, f.gh(t.a, t.b, 8, 92)); f.P([0, 44, 50, 90, 100, 44], t.r); f.P([12, 46, 50, 80, 88, 46], f.gh(t.b, t.r, 12, 88)); f.R(42, 52, 16, 16, PX.K); f.R(44, 54, 12, 12, t.g);
  f.R(26, 0, 48, 34, PX.K); f.R(29, 0, 42, 31, t.b); f.L(29, 0, 71, 31, 2, t.a); f.L(29, 31, 71, 0, 2, t.a);
  return { dx: 26, dw: 48, dh: 34, sx: 14, sy: 36, sw: 72, sh: 8 };
};
SC.SH.arch = function (f, t, o) {
  f.P([4, 0, 96, 0, 96, 58, 82, 66, 60, 56, 36, 70, 14, 60, 4, 66], f.gh(t.a, t.b, 4, 96)); f.R(10, 0, 8, 62, t.t); f.R(82, 0, 8, 62, t.t); f.R(8, 58, 12, 5, t.a); f.R(80, 58, 12, 5, t.a);
  f.E(50, 28, 17, 22, PX.K); f.R(33, 0, 34, 28, PX.K); for (var i = 0; i < 5; i++) { f.R(24 + i * 14, 48, 6, 4, f.night ? PX.E + t.k : t.b); }
  f.R(70, 0, 12, 8, t.a); f.R(84, 0, 10, 5, t.b);
  return { dx: 33, dw: 34, dh: 40, sx: 22, sy: 40, sw: 56, sh: 8 };
};
SC.SH.derrick = function (f, t, o) {
  f.R(4, 0, 64, 40, f.gh(t.a, t.b, 4, 68)); f.R(0, 40, 72, 5, t.r); f.R(14, 0, 22, 26, PX.K); f.R(17, 0, 16, 23, t.k); f.wins(42, 18, 2, 1, 12, 10, 4, 0, t.g);
  f.L(64, 45, 54, 118, 4, t.b); f.L(84, 45, 70, 118, 4, t.b); for (var i = 0; i < 6; i++) { f.L(60 - i * 1.2, 52 + i * 12, 78 - i * 2, 52 + i * 12, 2, t.t); f.L(60 - i * 1.2, 52 + i * 12, 79 - i * 2, 64 + i * 12, 2, t.b); }
  f.P([50, 118, 76, 118, 70, 126, 56, 126], t.r); f.R(66, 126, 3, 4, PX.E + PX.LR);
  f.R(80, 0, 10, 70, f.gh(t.a, t.b, 80, 90)); f.E(85, 72, 8, 3, PX.D); f.E(88, 82, 7, 5, PX.D); f.E(84, 92, 8, 5, PX.L);
  return { dx: 14, dw: 22, dh: 26, sx: 4, sy: 41, sw: 64, sh: 10 };
};
SC.SH.balloon = function (f, t, o) {
  f.E(50, 98, 36, 30, f.gh(t.r, t.b, 14, 86)); for (var i = 0; i < 5; i++) f.P([50 + (i - 2) * 14, 126, 50 + (i - 2) * 14 + 7, 126, 50 + (i - 2) * 6 + 3, 74, 50 + (i - 2) * 6, 74], i % 2 ? t.t : t.k); f.E(50, 98, 36, 30, -1);
  f.L(30, 70, 34, 44, 1, PX.K); f.L(70, 70, 66, 44, 1, PX.K);
  f.R(22, 4, 56, 40, f.gh(t.a, t.b, 22, 78)); f.R(18, 42, 64, 5, t.t); f.R(26, 22, 14, 10, f.night ? PX.E + PX.Y : t.g); f.R(60, 22, 14, 10, f.night ? PX.E + PX.Y : t.g); f.R(42, 4, 16, 18, PX.K); f.R(44, 4, 12, 16, t.k);
  f.E(18, 4, 14, 6, PX.W); f.E(84, 4, 16, 7, PX.W); f.E(50, 0, 24, 6, PX.W);
  return { dx: 42, dw: 16, dh: 18, sx: 24, sy: 34, sw: 52, sh: 8 };
};
SC.SH.decor = SC.SH.pod;

/* ---------- what each service adds to its building ---------- */
SC.FN = {};
SC.FN.market = function (f, t, m) { for (var i = 0; i < 6; i++) f.P([10 + i * 13, m.dh + 10, 23 + i * 13, m.dh + 10, 25 + i * 13, m.dh + 2, 8 + i * 13, m.dh + 2], i % 2 ? PX.W : PX.R); f.R(4, 0, 12, 8, PX.N); f.R(84, 0, 12, 8, PX.N); f.E(10, 11, 5, 4, PX.Y); f.E(90, 11, 5, 4, PX.LG); };
SC.FN.bank = function (f, t, m) { [14, 28, 66, 80].forEach(function (x) { f.R(x, 0, 6, 52, f.gh(PX.W, PX.L, x, x + 6)); f.R(x - 1, 52, 8, 3, PX.W); }); f.E(50, 60, 8, 8, PX.Y); f.R(48, 56, 4, 8, PX.N); };
SC.FN.yard = function (f, t, m) { for (var i = 0; i < 6; i++) f.R(m.dx + i * 4, 0, 2, m.dh, i % 2 ? PX.Y : PX.K); f.L(90, 0, 90, 70, 3, PX.N); f.L(90, 70, 62, 84, 3, PX.N); f.L(62, 84, 62, 72, 1, PX.D); f.P([4, 78, 26, 84, 4, 90], PX.W); };
SC.FN.fuel = function (f, t, m) { f.R(6, 0, 14, 24, PX.R); f.R(8, 14, 10, 6, PX.W); f.L(20, 18, 30, 6, 2, PX.K); f.E(78, 8, 9, 8, PX.D); f.E(78, 18, 9, 8, PX.D); f.R(70, 6, 16, 16, PX.D); f.R(72, 8, 12, 4, PX.LC); };
SC.FN.cantina = function (f, t, m) { f.E(50, m.sy + 22, 12, 10, PX.E + PX.Y); f.R(44, m.sy + 12, 12, 8, PX.E + PX.W); f.R(56, m.sy + 16, 6, 5, PX.E + PX.Y); for (var i = 0; i < 7; i++) f.E(10 + i * 13, m.sy + 6 + (i % 2) * 3, 2, 2, PX.E + [PX.LR, PX.Y, PX.LG, PX.LC][i % 4]); f.R(4, 0, 6, 12, PX.N); f.R(90, 0, 6, 12, PX.N); };
SC.FN.office = function (f, t, m) { f.R(74, 0, 3, 30, PX.N); f.R(62, 18, 34, 14, PX.W); f.R(62, 18, 34, 2, PX.R); f.T('SALE', 79, 21, 8, PX.R, 'c'); f.P([8, m.sy + 4, 28, m.sy + 4, 28, m.sy + 20, 8, m.sy + 20], PX.R); f.T('SOLD', 18, m.sy + 8, 8, PX.W, 'c'); };
SC.FN.parlour = function (f, t, m) { f.P([0, 70, 14, 70, 10, 0, 0, 0], PX.R); f.P([100, 70, 86, 70, 90, 0, 100, 0], PX.R); for (var i = 0; i < 12; i++) f.E(8 + i * 8, m.sy + 12, 2, 2, PX.E + (i % 2 ? PX.Y : PX.LR)); f.R(38, 0, 24, m.dh, PX.R); f.R(41, 0, 18, m.dh - 3, PX.M); };
SC.FN.alley = function (f, t, m) { f.R(10, 0, 18, 14, PX.D); f.R(12, 12, 14, 3, PX.L); f.E(50, 20, 3, 3, PX.E + PX.Y); f.E(60, 20, 3, 3, PX.E + PX.Y); f.R(66, 0, 20, 8, PX.N); for (var i = 0; i < 3; i++) f.E(78 + i * 4, 18 + i * 8, 4 - i, 3, PX.L); };
SC.FN.decor = function () {};

/* an ornament per world, scattered on the roofs and walls so no two planets feel alike */
SC.ORN = {
  farm: function (f, t, m, o) { f.E(14, 6, 7, 5, PX.LR); f.L(14, 10, 14, 13, 2, PX.G); f.E(88, 6, 6, 4, PX.Y); if (o.k % 2) { f.L(50, 84, 50, 104, 1, PX.N); f.L(40, 100, 60, 100, 1, PX.N); f.R(62, 96, 10, 6, PX.W); } },
  ruin: function (f, t, m, o) { f.E(50, 112, 8, 6, PX.W); f.E(50, 112, 4, 4, PX.E + t.k); f.R(49, 109, 2, 6, PX.K); for (var i = 0; i < 3; i++) f.R(12 + i * 28, 4, 8, 6, PX.E + PX.LC); },
  mine: function (f, t, m, o) { for (var i = 0; i < 3; i++) f.E(24 + i * 6, 96 + i * 12, 5 + i * 2, 4 + i, PX.L); f.R(10, 100, 5, 20, PX.D); f.R(8, 98, 9, 3, PX.R); if (o.k % 2) f.E(88, 100, 4, 4, PX.E + PX.LR); },
  neon: function (f, t, m, o) { f.R(0, 46, 100, 2, PX.E + PX.LM); f.R(0, 90, 100, 2, PX.E + PX.LC); f.R(84, 96, 12, 18, PX.E + PX.Y); f.T('BAR', 90, 100, 7, PX.K, 'c'); },
  void: function (f, t, m, o) { f.L(0, 40, 100, 52, 1, PX.D); f.L(0, 90, 100, 80, 1, PX.D); f.E(90, 98, 7, 7, PX.E + PX.LM); f.E(10, 104, 5, 5, PX.E + PX.LC); f.L(50, 108, 50, 124, 1, PX.L); },
  lab: function (f, t, m, o) { f.E(50, 52, 56, 6, PX.LM); f.E(50, 52, 56, 6, -1); f.L(2, 52, 98, 52, 2, PX.LM); f.E(20, 108, 5, 5, PX.E + PX.LG); f.E(80, 100, 4, 4, PX.E + PX.LM); f.L(78, 96, 90, 118, 2, PX.L); f.E(92, 120, 5, 5, PX.W); },
  cloud: function (f, t, m, o) { f.E(10, 0, 18, 6, PX.W); f.E(90, 2, 20, 7, PX.W); f.E(50, -2, 30, 8, PX.W); f.P([2, 112, 22, 112, 2, 124], PX.R); f.L(2, 112, 2, 130, 1, PX.K); }
};

/* ---------- the whole street ---------- */
SC.stars = function (B, rnd, y1) { for (var i = 0; i < 70; i++) { var x = Math.floor(rnd() * B.w), y = Math.floor(rnd() * y1), c = rnd() < 0.2 ? PX.Y : PX.W; B.px(x, y, PX.E + c); if (rnd() < 0.08) { B.px(x + 1, y, PX.E + PX.L); B.px(x, y + 1, PX.E + PX.L); } } };
SC.skyArt = function (B, pid, th, night, rnd) {
  var cols = night ? th.nsky.map(function (c) { return c + PX.E; }) : th.sky; B.vgrad(0, 0, B.w, SC.VY + 14, cols);
  if (night || pid === 'nihil') SC.stars(B, rnd, SC.VY + 8);
  var sx = pid === 'kryndor' ? 40 : pid === 'karthosu' ? 270 : 252, sy = 30, r = pid === 'halcyra' ? 30 : pid === 'nihil' ? 26 : 14;
  var disc = night ? [PX.E + PX.W, PX.E + PX.L] : [th.sun, PX.W];
  if (pid === 'nihil') { B.ell(sx, sy, r + 4, r + 4, PX.E + PX.LM); B.ell(sx - 4, sy - 4, r, r, PX.E + PX.M); B.line(sx - 40, sy + 8, sx + 40, sy - 8, PX.E + PX.LC); }
  else if (pid === 'halcyra') { B.ell(sx, sy, r, r, night ? PX.E + PX.LM : PX.LR); B.rect(sx - r, sy - 6, r * 2, 3, night ? PX.E + PX.M : PX.R); B.rect(sx - r + 4, sy + 6, r * 2 - 8, 3, night ? PX.E + PX.M : PX.W); B.line(sx - 44, sy + 4, sx + 44, sy - 6, night ? PX.E + PX.LC : PX.Y); }
  else { B.ell(sx, sy, r, r, disc[0]); B.ell(sx - 3, sy - 3, r - 5, r - 5, disc[1]); if (night) B.ell(sx + 5, sy - 2, r - 3, r - 3, PX.E + PX.B); }
  if (!night && pid !== 'nihil' && pid !== 'kryndor') [[50, 24], [130, 14], [214, 36]].forEach(function (c) { B.ell(c[0], c[1], 20, 4, PX.W); B.ell(c[0] + 10, c[1] - 3, 12, 4, PX.W); });
  /* the far skyline, a different silhouette on every world */
  var y0 = SC.VY + 4, col = night ? PX.D : th.far[0], x;
  if (pid === 'meridoa') { for (x = 0; x < 330; x += 1) B.rect(x, y0 - 6 - Math.round(Math.sin(x / 22) * 5 + Math.sin(x / 9) * 2), 1, 12, th.far[(x >> 2) & 1]); B.rect(100, y0 - 22, 3, 22, PX.N); B.line(101, y0 - 22, 112, y0 - 28, PX.W); B.line(101, y0 - 22, 92, y0 - 16, PX.W); B.line(101, y0 - 22, 94, y0 - 30, PX.W); B.line(101, y0 - 22, 110, y0 - 14, PX.W); }
  else if (pid === 'karthosu') { B.poly([0, y0, 20, y0 - 20, 50, y0 - 20, 70, y0], PX.N); B.poly([230, y0, 252, y0 - 26, 290, y0 - 26, 320, y0], PX.N); B.poly([150, y0, 170, y0 - 36, 174, y0 - 36, 194, y0], PX.R); B.rect(110, y0 - 40, 4, 40, PX.Y); B.poly([108, y0 - 40, 116, y0 - 40, 112, y0 - 50], PX.Y); }
  else if (pid === 'ferrox') { for (x = 4; x < 320; x += 28) { B.rect(x, y0 - 30 - (x % 3) * 8, 6, 40, PX.D); B.ell(x + 3, y0 - 34 - (x % 3) * 8, 7, 4, PX.L); } B.poly([0, y0, 60, y0 - 16, 130, y0], PX.D); }
  else if (pid === 'kryndor') { for (x = 0; x < 320; x += 12) B.rect(x, y0 - 14 - ((x * 7) % 5) * 14, 11, 80, (x >> 3) & 1 ? PX.B : PX.D); for (x = 0; x < 320; x += 12) if (night) for (var w = 0; w < 4; w++) B.px(x + 3, y0 - 8 - ((x * 7) % 5) * 14 + w * 6, PX.E + PX.Y); B.rect(50, y0 - 100, 3, 100, PX.D); B.px(51, y0 - 101, PX.E + PX.LR); }
  else if (pid === 'nihil') { B.ring(100, 52, 70, 12, PX.E + PX.D); B.ring(100, 52, 74, 14, PX.E + PX.D); for (x = 20; x < 300; x += 40) B.rect(x, y0 - 8, 22, 8, PX.D); }
  else if (pid === 'quellin') { for (x = 10; x < 320; x += 46) { B.ell(x + 12, y0, 16, 12, PX.LC); B.rect(x - 4, y0, 32, 10, PX.LC); } B.ring(60, 40, 22, 6, PX.W); B.rect(240, y0 - 40, 3, 40, PX.L); B.ell(241, y0 - 42, 6, 6, PX.LM); }
  else { for (x = 0; x < 330; x += 26) B.ell(x, y0 + 2, 24, 8 + (x % 3) * 3, night ? PX.LM : PX.LM); B.ell(70, y0 - 8, 30, 6, PX.W); B.ell(290, y0 - 10, 34, 7, PX.W); }
};
SC.groundArt = function (B, pid, th, rnd) {
  var VX = SC.VX, VY = SC.VY, i, k;
  B.poly([0, VY, 330, VY, 330, 190, 0, 190], th.ground[0]);
  for (i = 0; i < 700; i++) B.px(Math.floor(rnd() * 320), VY + Math.floor(rnd() * 104), th.ground[1]);
  /* road */
  var road = PX.checker(th.road[0], th.road[1]);
  B.poly([-6, 178, VX, VY, 326, 150, 326, 182, -6, 182], function (x, y) { return PX.BAYER[(y & 3) * 4 + (x & 3)] < 5 ? th.road[1] : th.road[0]; });
  B.poly([-6, 178, VX, VY, 46, 182, -6, 182], PX.checker(th.walk[0], th.walk[1])); B.line(-6, 178, VX, VY, PX.K); B.line(46, 182, VX, VY, PX.K);
  B.poly([326, 150, VX, VY, 300, 182, 326, 182], PX.checker(th.walk[0], th.walk[1])); B.line(326, 150, VX, VY, PX.K); B.line(300, 182, VX, VY, PX.K);
  /* centre dashes running into the distance */
  for (k = 1.2; k < 4.4; k *= 1.28) { var cx = VX + (160 - VX) / k, cy = VY + (182 - VY) / k, wd = 5 / k + 1; B.poly([cx - wd, cy, cx + wd, cy, cx + wd * 0.7, cy - 1.5 / k - 0.5, cx - wd * 0.7, cy - 1.5 / k - 0.5], pid === 'nihil' ? PX.LC : PX.Y); }
};
SC.drawBoard = function (B, th, night) {
  B.rect(84, 150, 3, 28, PX.N); B.rect(112, 150, 3, 28, PX.N); B.rect(76, 134, 46, 28, PX.N); B.rect(78, 136, 42, 24, PX.Y); B.rect(82, 140, 14, 8, PX.W); B.rect(100, 142, 16, 10, PX.LR); B.rect(84, 152, 12, 5, PX.LG); B.text(79, 125, 'JOBS', PX.W, 1); B.rect(76, 134, 46, 1, PX.K); B.rect(76, 161, 46, 1, PX.K); B.rect(76, 134, 1, 28, PX.K); B.rect(121, 134, 1, 28, PX.K);
};
SC.drawPad = function (B, night) {
  B.ell(252, 166, 50, 11, PX.D); B.ell(252, 165, 46, 9, PX.L); B.ell(252, 165, 40, 7, PX.D); B.ring(252, 165, 34, 5, PX.Y); B.ring(252, 165, 24, 3, PX.Y);
  for (var i = 0; i < 8; i++) { var a = i / 8 * 6.2832; B.px(252 + Math.cos(a) * 44, 165 + Math.sin(a) * 8, night ? PX.E + PX.LR : PX.R); }
};

SC.hubKey = function (s) { var p = GT.PLANETS[s.loc]; return p.id + '|' + (SC.night(s) ? 'n' : 'd') + '|' + (p.upgrades.length ? 'y' : '-') + (p.fuelSold ? 'f' : '-') + (p.gambling ? 'p' : '-'); };
SC.build = function (s) {
  var p = GT.PLANETS[s.loc], pid = p.id, th = SC.TH[pid], night = SC.night(s), kit = SC.KIT[pid], lay = SC.LAYOUT[pid], rnd = GT.seeded(CH.hash(pid + (night ? 'n' : 'd'))), sg = NP.SIGNS[pid], B = new PX.Buf(SC.W, SC.H);
  SC.skyArt(B, pid, th, night, rnd); SC.groundArt(B, pid, th, rnd);
  var slots = [], hits = [], used = {}, door = {};
  var place = function (slotId, fn) { slots.push({ id: slotId, fn: fn }); };
  ['L1', 'L2', 'L3', 'L4'].forEach(function (id, i) { place(id, lay.L[i]); }); ['R1', 'R2', 'R3', 'R4'].forEach(function (id, i) { place(id, lay.R[i]); }); place('E', lay.E);
  if (lay.bank) { slots.forEach(function (sl) { if (sl.id === lay.bank) sl.fn = 'bank'; }); }
  if (!p.gambling) slots.forEach(function (sl) { if (sl.fn === 'parlour') sl.fn = 'decor'; });
  /* paint far to near */
  var order = ['E', 'L4', 'R4', 'L3', 'R3', 'L2', 'R2', 'L1', 'R1'];
  order.forEach(function (id) {
    var sl = slots.filter(function (x) { return x.id === id; })[0], g = SC.SLOTS[id], fn = sl.fn, closed = (fn === 'yard' && !p.upgrades.length) || (fn === 'fuel' && !p.fuelSold);
    var shape = fn === 'decor' ? kit.decor[(id.charCodeAt(0) + id.charCodeAt(1 % id.length)) % kit.decor.length] : fn === 'alley' ? 'box' : kit[fn] || 'box', k = id.charCodeAt(0) + (id.length > 1 ? +id[1] : 0);
    var t = { a: th.a, b: th.b, r: th.r, t: th.t, k: th.k, g: th.g };
    if (fn === 'decor' || fn === 'alley') { t.a = th.b; t.b = PX.D; }
    if (closed) { t.a = PX.L; t.b = PX.D; t.k = PX.D; }
    var f = new SC.Fac(B, g, night, rnd), m = SC.SH[shape](f, t, { h: 56 + (k % 3) * 8 }); m.k = k;
    if (fn === 'alley') { f.R(m.dx, 0, m.dw, m.dh, PX.K); }
    if (SC.FN[fn]) SC.FN[fn](f, t, m);
    SC.ORN[th.orn](f, t, m, { k: k });
    if (fn !== 'decor' && fn !== 'alley' && g.s !== 'R' || (g.s === 'R' && g.xb - g.xa > 20 && fn !== 'decor')) {
      var label = closed ? (fn === 'yard' ? 'CLOSED' : 'NO FUEL') : sg[fn] || fn.toUpperCase();
      f.R(m.sx, m.sy - m.sh + 2, m.sw, m.sh, PX.K); f.R(m.sx + 1, m.sy - m.sh + 3, m.sw - 2, m.sh - 2, night ? PX.E + PX.N : PX.W);
      var hg = m.sh - 4, cw = hg * 6 / 7, maxc = Math.floor((m.sw - 6) / cw); label = label.length > maxc ? label.slice(0, maxc) : label;
      f.T(label, m.sx + m.sw / 2, m.sy - m.sh + 5, hg, closed ? PX.R : PX.K, 'c');
    }
    f.edge();
    var a = g.xa, b = g.xb, ya = f.ybA, yb2 = f.ybB, ha = f.hA, hb = f.hB;
    if (fn !== 'decor') {
      var dxm = (g.xa + g.xb) / 2, dir = g.s === 'L' ? 1 : g.s === 'R' ? -1 : 0, sc2 = g.s === 'L' ? SC.scL(dxm) : g.s === 'R' ? SC.scR(dxm) : 0.3, base = g.s === 'L' ? SC.baseL(dxm) : g.s === 'R' ? SC.baseR(dxm) : SC.VY + 8;
      door[fn] = { x: Math.round(dxm + dir * 7 * sc2), y: Math.round(base + 5 + 4 * sc2), s: Math.max(0.3, sc2) };
      hits.push({ fn: fn, closed: closed, pts: [a, ya, b, yb2, b, yb2 - hb * 1.08, a, ya - ha * 1.08], label: closed ? (fn === 'yard' ? 'The Shipyard is closed' : 'There is no fuel dock here') : null });
    }
  });
  SC.drawPad(B, night); SC.drawBoard(B, th, night);
  door.jobs = { x: 100, y: 176, s: 1 }; door.pad = { x: 214, y: 166, s: 1 };
  hits.push({ fn: 'jobs', pts: [74, 124, 124, 124, 124, 164, 74, 164] }); hits.push({ fn: 'pad', pts: [200, 146, 304, 146, 304, 176, 200, 176] });
  return { buf: B, hits: hits, door: door };
};
SC.hubCache = {};
SC.LABELS = { market: 'Go to the Market', bank: 'Go to the Bank', yard: 'Go to the Shipyard', fuel: 'Go to the Fuel Dock', cantina: 'Go to the Cantina', alley: 'Poke around the Back Alley', office: 'Visit Real Estate', parlour: 'Enter the Parlour of Thin Hours', jobs: 'Check the Odd Jobs board', pad: 'Go to the Launch Pad (Star Map)' };
SC.hub = function (s) {
  var key = SC.hubKey(s), r = SC.hubCache[key]; if (!r) { r = SC.hubCache[key] = SC.build(s); r.url = PX.render(r.buf, SC.night(s)).toDataURL(); }
  SC.door = r.door; var sg = NP.SIGNS[GT.PLANETS[s.loc].id], o = '<div class="scene" id="scene"><img class="pxi bgimg" src="' + r.url + '" width="' + SC.W + '" height="' + SC.H + '" alt=""><svg class="ov" viewBox="0 0 ' + SC.W + ' ' + SC.H + '" id="ov" role="group" aria-label="' + GT.esc(GT.PLANETS[s.loc].name) + ' street">';
  r.hits.forEach(function (h) {
    var lab = h.label || SC.LABELS[h.fn] || h.fn; if (h.fn === 'office' && s.visit.offer) lab = 'Visit Real Estate (an offer awaits!)';
    o += '<g class="hs' + (h.closed ? ' closed' : '') + '" data-hs="' + h.fn + '" data-label="' + GT.esc(lab) + '" tabindex="0" role="button" aria-label="' + GT.esc(lab) + '"><polygon points="' + h.pts.map(function (v) { return v.toFixed(1); }).join(' ') + '"/></g>';
  });
  var hull = GT.SHIPS.filter(function (x) { return x.id === s.shipId; })[0], px = ui.px && ui.px.x != null ? ui.px : SC.door.pad, sc = Math.max(0.3, Math.min(1, px.s || 1));
  o += PX.shipSprite(hull, 'svgimg', 246, 150, 44, 26, s);
  if (s.game && s.game.multi) GT.othersHere(s).forEach(function (q, k) { var h2 = GT.SHIPS.filter(function (x) { return x.id === q.shipId; })[0]; o += PX.shipSprite(h2, 'svgimg other', 214 + k * 30, 148 - k * 4, 30, 18, q); });
  o += '<g id="player" style="transform: translate(' + px.x + 'px,' + px.y + 'px) scale(' + sc.toFixed(2) + ')">' + (s.char ? PX.svgImage(CH.sprite(s.char).replace(/^<g/, '<svg viewBox="-6 -2 112 176"><g').replace(/<\/g>$/, '</g></svg>'), -8, -30, 16, 30, 'pl') : '') + '</g></svg></div>';
  return o;
};
/* a small ship picture at a place in the scene (as an svg <image> that fills in once drawn) */
PX.svgImage = function (svg, x, y, w, h, cls, spread) {
  var key = PX.hash(svg) + 'x' + w + 'x' + h, url = PX.cache['s' + key];
  if (!url && !PX.pend[key]) { PX.pend[key] = 1; PX.sv[key] = [svg, w, h, spread === undefined ? 40 : spread]; PX.queue(key); }
  return '<image class="' + (cls || '') + '" data-pk="' + key + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" href="' + (url || PX.BLANK) + '" style="image-rendering:pixelated"/>';
};
PX.shipSprite = function (hull, cls, x, y, w, h) { return PX.svgImage(UI.shipSVG(hull.id, hull.hue), x, y, w, h, cls, 40); };
