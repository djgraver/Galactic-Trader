/* Galactic Trader 4. Part 22: the street. A one-point perspective street in 16-colour EGA. Every planet has its own geometry (vanishing point, wall angles, road width),
   its own ground (road, concrete, dirt, plate, deck) and its own buildings. A building is painted flat in local units (x 0..100 across, y 0..130 up) and each pixel is warped
   onto its wall. Light comes from one side: walls on the sunny side are lit, walls on the other side are shaded and throw shadows over the pavement.
   Shadows are made with colour: SC.DK maps a colour to its darker family member and is dithered over whatever is underneath, as in the Sierra EGA games. */
var SC = { W: 320, H: 200, INK: '#000000', VX: 186, VY: 84 };
SC.night = function (s) { s = s || (typeof S !== 'undefined' ? S : null); return !!(s && s.visit && s.visit.night); };

/* darker and lighter family member of each EGA colour */
SC.DK = [0, 0, 1, 1, 5, 1, 4, 8, 0, 1, 2, 3, 4, 5, 6, 7];
SC.LT = [8, 9, 10, 11, 12, 13, 14, 15, 7, 11, 15, 15, 14, 15, 15, 15];

/* palettes. a lit wall, b shaded wall, r roof, t trim, k accent, g glass, sun. sets are wall colour schemes that neighbouring buildings take in turn.
   gt is the ground type, tex the wall texture, lamp the kind of street lamp, sunSide the side the light comes from. */
SC.TH = {
  meridoa:  { sky: [PX.LB, PX.LC, PX.W], nsky: [PX.K, PX.B, PX.B], ground: [PX.LG, PX.G], road: [PX.N, PX.Y], walk: [PX.LG, PX.G], far: [PX.G, PX.LG], a: PX.Y, b: PX.N, r: PX.LR, t: PX.W, k: PX.LG, g: PX.LC, sun: PX.Y, orn: 'farm', gt: 'dirt', tex: 'plaster', lamp: 'wood', sunSide: 'R',
              sets: [{ a: PX.Y, b: PX.N, r: PX.LR }, { a: PX.W, b: PX.L, r: PX.R }, { a: PX.LG, b: PX.G, r: PX.N }, { a: PX.LC, b: PX.C, r: PX.LR }] },
  karthosu: { sky: [PX.R, PX.LR, PX.Y], nsky: [PX.K, PX.B, PX.M], ground: [PX.Y, PX.N], road: [PX.Y, PX.L], walk: [PX.N, PX.Y], far: [PX.N, PX.R], a: PX.Y, b: PX.N, r: PX.N, t: PX.W, k: PX.LC, g: PX.K, sun: PX.LR, orn: 'ruin', gt: 'dirt', tex: 'stone', lamp: 'torch', sunSide: 'R',
              sets: [{ a: PX.Y, b: PX.N, r: PX.N }, { a: PX.W, b: PX.L, r: PX.Y }, { a: PX.LR, b: PX.R, r: PX.N }, { a: PX.L, b: PX.D, r: PX.N }] },
  ferrox:   { sky: [PX.D, PX.N, PX.LR], nsky: [PX.K, PX.K, PX.R], ground: [PX.D, PX.K], road: [PX.K, PX.D], walk: [PX.D, PX.L], far: [PX.D, PX.K], a: PX.L, b: PX.D, r: PX.R, t: PX.N, k: PX.LR, g: PX.Y, sun: PX.LR, orn: 'mine', gt: 'cinder', tex: 'panel', lamp: 'flood', sunSide: 'R',
              sets: [{ a: PX.L, b: PX.D, r: PX.R }, { a: PX.N, b: PX.R, r: PX.K }, { a: PX.LR, b: PX.R, r: PX.D }, { a: PX.Y, b: PX.N, r: PX.D }] },
  kryndor:  { sky: [PX.B, PX.M, PX.LM], nsky: [PX.K, PX.B, PX.M], ground: [PX.D, PX.K], road: [PX.K, PX.D], walk: [PX.B, PX.D], far: [PX.B, PX.M], a: PX.LC, b: PX.B, r: PX.C, t: PX.LM, k: PX.Y, g: PX.W, sun: PX.W, orn: 'neon', gt: 'road', tex: 'glass', lamp: 'neon', sunSide: 'L',
              sets: [{ a: PX.LC, b: PX.B, r: PX.C }, { a: PX.LM, b: PX.M, r: PX.B }, { a: PX.W, b: PX.LB, r: PX.C }, { a: PX.LB, b: PX.B, r: PX.M }] },
  nihil:    { sky: [PX.K, PX.K, PX.B], nsky: [PX.K, PX.K, PX.K], ground: [PX.D, PX.K], road: [PX.K, PX.B], walk: [PX.D, PX.L], far: [PX.D, PX.B], a: PX.L, b: PX.D, r: PX.D, t: PX.LM, k: PX.LC, g: PX.LM, sun: PX.LM, orn: 'void', gt: 'plate', tex: 'panel', lamp: 'bar', sunSide: 'R',
              sets: [{ a: PX.L, b: PX.D, r: PX.D }, { a: PX.LM, b: PX.M, r: PX.D }, { a: PX.LC, b: PX.C, r: PX.D }, { a: PX.W, b: PX.L, r: PX.M }] },
  quellin:  { sky: [PX.LC, PX.W, PX.W], nsky: [PX.K, PX.B, PX.C], ground: [PX.W, PX.L], road: [PX.L, PX.W], walk: [PX.W, PX.LC], far: [PX.LC, PX.C], a: PX.W, b: PX.LC, r: PX.LC, t: PX.LM, k: PX.LG, g: PX.C, sun: PX.W, orn: 'lab', gt: 'concrete', tex: 'plaster', lamp: 'orb', sunSide: 'R',
              sets: [{ a: PX.W, b: PX.LC, r: PX.LC }, { a: PX.LC, b: PX.C, r: PX.W }, { a: PX.LM, b: PX.M, r: PX.W }, { a: PX.LG, b: PX.G, r: PX.W }] },
  halcyra:  { sky: [PX.LR, PX.Y, PX.W], nsky: [PX.B, PX.M, PX.LR], ground: [PX.W, PX.L], road: [PX.Y, PX.W], walk: [PX.W, PX.L], far: [PX.LR, PX.LM], a: PX.W, b: PX.LM, r: PX.LR, t: PX.Y, k: PX.LC, g: PX.LB, sun: PX.LR, orn: 'cloud', gt: 'deck', tex: 'plank', lamp: 'flag', sunSide: 'R',
              sets: [{ a: PX.W, b: PX.LM, r: PX.LR }, { a: PX.Y, b: PX.N, r: PX.LC }, { a: PX.LC, b: PX.C, r: PX.LR }, { a: PX.LR, b: PX.R, r: PX.W }] }
};

/* which building shape each planet uses for each service */
SC.KIT = {
  meridoa:  { market: 'mush', bank: 'silo', yard: 'barn', fuel: 'silo', cantina: 'pod', office: 'barn', parlour: 'pod', exchange: 'hall', jobs: 'kiosk', decor: ['pod', 'silo', 'mush'] },
  karthosu: { market: 'zig', bank: 'arch', yard: 'arch', fuel: 'arch', cantina: 'zig', office: 'zig', parlour: 'arch', exchange: 'hall', jobs: 'kiosk', decor: ['zig', 'arch', 'box'] },
  ferrox:   { market: 'box', bank: 'derrick', yard: 'derrick', fuel: 'silo', cantina: 'box', office: 'box', parlour: 'box', exchange: 'hall', jobs: 'kiosk', decor: ['derrick', 'silo', 'box'] },
  kryndor:  { market: 'tower', bank: 'tower', yard: 'box', fuel: 'pod', cantina: 'tower', office: 'tower', parlour: 'tower', exchange: 'tower', jobs: 'kiosk', decor: ['tower', 'box', 'pod'] },
  nihil:    { market: 'hex', bank: 'hex', yard: 'hex', fuel: 'pod', cantina: 'hex', office: 'hex', parlour: 'dome', exchange: 'hex', jobs: 'kiosk', decor: ['pod', 'hex', 'dome'] },
  quellin:  { market: 'dome', bank: 'dome', yard: 'pod', fuel: 'silo', cantina: 'dome', office: 'pod', parlour: 'dome', exchange: 'dome', jobs: 'kiosk', decor: ['dome', 'pod', 'silo'] },
  halcyra:  { market: 'balloon', bank: 'dome', yard: 'balloon', fuel: 'balloon', cantina: 'balloon', office: 'balloon', parlour: 'balloon', exchange: 'hall', jobs: 'kiosk', decor: ['balloon', 'pod', 'dome'] }
};

/* the shape of each street. VX,VY is the vanishing point. L0 and R0 are the heights at which the left and right wall bases leave the screen (near edge). ls and rs are where the kerbs sit
   across the street (0 is the left wall, 1 the right). H is the tallest wall at the near edge, zEnd how deep the street runs. L and R list the buildings from near to far, E is the one that closes the street. */
SC.GEO = {
  meridoa:  { VX: 168, VY: 90, L0: 196, R0: 190, ls: 0.12, rs: 0.86, H: 150, zEnd: 3.6, L: ['market', 'jobs', 'cantina', 'office'], R: ['fuel', 'yard', 'alley', 'exchange'], E: 'bank', sun: 'R' },
  karthosu: { VX: 226, VY: 82, L0: 198, R0: 186, ls: 0.1, rs: 0.8, H: 166, zEnd: 4.0, L: ['bank', 'market', 'jobs', 'exchange', 'alley'], R: ['cantina', 'yard', 'office'], E: 'fuel', sun: 'R' },
  ferrox:   { VX: 128, VY: 78, L0: 198, R0: 196, ls: 0.16, rs: 0.9, H: 160, zEnd: 4.0, L: ['yard', 'market', 'jobs'], R: ['fuel', 'cantina', 'exchange', 'office', 'alley'], E: 'bank', sun: 'R' },
  kryndor:  { VX: 172, VY: 70, L0: 200, R0: 196, ls: 0.14, rs: 0.84, H: 196, zEnd: 3.4, L: ['market', 'fuel', 'jobs', 'cantina'], R: ['bank', 'office', 'alley', 'exchange'], E: 'yard', sun: 'L' },
  nihil:    { VX: 200, VY: 96, L0: 196, R0: 190, ls: 0.1, rs: 0.8, H: 140, zEnd: 4.2, L: ['market', 'cantina', 'jobs', 'yard', 'bank'], R: ['fuel', 'office', 'alley', 'exchange'], E: 'parlour', sun: 'R' },
  quellin:  { VX: 148, VY: 88, L0: 198, R0: 194, ls: 0.12, rs: 0.88, H: 152, zEnd: 3.8, L: ['bank', 'cantina', 'jobs'], R: ['market', 'yard', 'office', 'exchange', 'alley'], E: 'fuel', sun: 'R' },
  halcyra:  { VX: 184, VY: 94, L0: 194, R0: 194, ls: 0.12, rs: 0.86, H: 146, zEnd: 3.6, L: ['market', 'yard', 'office', 'jobs'], R: ['cantina', 'fuel', 'exchange', 'alley'], E: 'bank', sun: 'R' }
};
/* relative width of each kind of building, and its height against the tallest wall */
SC.WT = { jobs: 0.42, alley: 0.55, exchange: 1.15, office: 0.9, market: 1.1, bank: 1.1, yard: 1.1, parlour: 1.1 };
SC.HF = { jobs: 0.42, alley: 0.8, exchange: 1.05, bank: 0.98, market: 0.92, cantina: 0.9, office: 0.86, yard: 0.84, fuel: 0.7 };

/* a point on the ground: s is depth (1 at the near edge, 0 at the vanishing point) and lat runs from the left wall (0) to the right wall (1) */
SC.P = function (g, s, lat) {
  var xl = g.VX - s * (g.VX + 6), yl = g.VY + (g.L0 - g.VY) * s, xr = g.VX + s * (326 - g.VX), yr = g.VY + (g.R0 - g.VY) * s;
  return [xl + (xr - xl) * lat, yl + (yr - yl) * lat];
};
SC.baseY = function (g, side, s) { return side === 'L' ? g.VY + (g.L0 - g.VY) * s : g.VY + (g.R0 - g.VY) * s; };
SC.wallX = function (g, side, s) { return side === 'L' ? g.VX - s * (g.VX + 6) : g.VX + s * (326 - g.VX); };

/* work out where every building stands on this street */
SC.slotsFor = function (g, lay, rnd) {
  var out = [], z0 = 1, gap = 0.05, ends = { L: 0, R: 999 }, side;
  ['L', 'R'].forEach(function (sd) {
    var list = lay[sd], n = list.length, wts = list.map(function (fn, i) { return (SC.WT[fn] || 1) * (1 + 0.09 * i); }), tot = 0, zs = z0, avail = g.zEnd - z0 - gap * (n - 1);
    wts.forEach(function (w) { tot += w; });
    list.forEach(function (fn, i) {
      var za = zs, zb = zs + avail * wts[i] / tot; zs = zb + gap;
      var sa = 1 / za, sb = 1 / zb, hf = (SC.HF[fn] || 0.9) * (0.9 + rnd() * 0.18);
      var xn = SC.wallX(g, sd, sa), xf = SC.wallX(g, sd, sb);
      var sl = sd === 'L' ? { s: 'L', xa: xn, xb: xf, scA: sa, scB: sb } : { s: 'R', xa: xf, xb: xn, scA: sb, scB: sa };
      sl.ybA = SC.baseY(g, sd, sl.scA); sl.ybB = SC.baseY(g, sd, sl.scB); sl.hA = g.H * hf * sl.scA; sl.hB = g.H * hf * sl.scB; sl.fn = fn; sl.id = sd + (i + 1); sl.hf = hf; sl.z = za;
      if (sd === 'L') ends.L = Math.max(ends.L, sl.xb); else ends.R = Math.min(ends.R, sl.xa);
      out.push(sl);
    });
  });
  var xa = ends.L + 2, xb = ends.R - 2, sE = 1 / (g.zEnd + 0.25);
  if (xb - xa < 50) { var c = (xa + xb) / 2; xa = c - 25; xb = c + 25; }
  var yE = Math.max(SC.baseY(g, 'L', sE), SC.baseY(g, 'R', sE)) + 3, hE = g.H * sE * 1.3;
  out.push({ s: 'E', xa: xa, xb: xb, ybA: yE, ybB: yE, hA: hE, hB: hE, scA: 1, scB: 1, fn: lay.E, id: 'E', hf: 1, z: 99 });
  return out;
};

/* ---------- a facade: paint in flat local units (x 0..100 across, y 0..130 up), pixels land warped on the wall ---------- */
SC.Fac = function (B, slot, night, rnd, shaded) {
  this.B = B; this.xa = slot.xa; this.xb = slot.xb; this.ybA = slot.ybA; this.ybB = slot.ybB; this.hA = slot.hA; this.hB = slot.hB; this.scA = slot.scA; this.scB = slot.scB; this.side = slot.s;
  this.night = night; this.rnd = rnd; this.shaded = shaded; this.mask = new Uint8Array(B.w * B.h);
  this.ux = 100 / Math.max(1, slot.xb - slot.xa); this.uy = 130 / Math.max(4, (slot.hA + slot.hB) / 2);
};
(function (F) {
  F.map = function (lx, ly) { var u = lx / 100; return [this.xa + u * (this.xb - this.xa), this.ybA + u * (this.ybB - this.ybA) - ly / 130 * (this.hA + u * (this.hB - this.hA))]; };
  /* a point out in front of the wall (toward the street) by o pixels at the nearest scale */
  F.out = function (lx, ly, o) {
    var p = this.map(lx, ly), u = lx / 100, sc = this.scA + u * (this.scB - this.scA), dir = this.side === 'L' ? 1 : this.side === 'R' ? -1 : 0;
    return this.side === 'E' ? [p[0], p[1] + o * 0.5] : [p[0] + dir * o * sc, p[1]];
  };
  F.fill = function (x0, y0, x1, y1, test, col) {
    var me = this, B = this.B, X0 = 1e9, X1 = -1e9, Y0 = 1e9, Y1 = -1e9;
    [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].forEach(function (c) { var p = me.map(c[0], c[1]); X0 = Math.min(X0, p[0]); X1 = Math.max(X1, p[0]); Y0 = Math.min(Y0, p[1]); Y1 = Math.max(Y1, p[1]); });
    X0 = Math.max(0, Math.floor(X0)); X1 = Math.min(B.w - 1, Math.ceil(X1)); Y0 = Math.max(0, Math.floor(Y0)); Y1 = Math.min(B.h - 1, Math.ceil(Y1));
    var du = this.xb - this.xa, ux = this.ux;
    for (var X = X0; X <= X1; X++) {
      var u = (X + 0.5 - this.xa) / du, lx = u * 100; if (lx < x0 || lx >= x1) continue;
      var yb = this.ybA + u * (this.ybB - this.ybA), h = this.hA + u * (this.hB - this.hA), uy = 130 / h;
      for (var Y = Y0; Y <= Y1; Y++) {
        var ly = (yb - (Y + 0.5)) / h * 130; if (ly < y0 || ly >= y1 || !test(lx, ly)) continue;
        var c = typeof col === 'function' ? col(lx, ly, X, Y, uy, ux) : col; if (c < 0) continue;
        B.d[Y * B.w + X] = c; this.mask[Y * B.w + X] = 1;
      }
    }
  };
  var yes = function () { return true; };
  F.R = function (x, y, w, h, c) { this.fill(x, y, x + w, y + h, yes, c); };
  F.E = function (cx, cy, rx, ry, c) { this.fill(cx - rx, cy - ry, cx + rx, cy + ry, function (x, y) { var a = (x - cx) / rx, b = (y - cy) / ry; return a * a + b * b <= 1; }, c); };
  F.P = function (pts, c) {
    var xs = [], ys = [], n = pts.length / 2, i; for (i = 0; i < n; i++) { xs.push(pts[i * 2]); ys.push(pts[i * 2 + 1]); }
    this.fill(Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs) + 0.01, Math.max.apply(null, ys) + 0.01, function (x, y) {
      var inside = false; for (var a = 0, b = n - 1; a < n; b = a++) { if ((ys[a] > y) !== (ys[b] > y) && x < (xs[b] - xs[a]) * (y - ys[a]) / (ys[b] - ys[a]) + xs[a]) inside = !inside; } return inside;
    }, c);
  };
  F.L = function (x0, y0, x1, y1, w, c) { var dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l * w / 2, ny = dx / l * w / 2; this.P([x0 + nx, y0 + ny, x1 + nx, y1 + ny, x1 - nx, y1 - ny, x0 - nx, y0 - ny], c); };
  /* a screen-space polygon that joins the building (so it gets the outline too) */
  F.S = function (pts, c) { var m = this.mask, w = this.B.w, B = this.B; B.poly(pts, function (x, y) { if (x < 0 || y < 0 || x >= B.w || y >= B.h) return -1; m[y * w + x] = 1; return typeof c === 'function' ? c(x, y) : c; }); };
  /* a run of text, baseline at y, hgt local units tall; glyph cells are kept square on screen */
  F.T = function (s, x, y, hgt, c, align) {
    s = String(s).toUpperCase(); var cw = hgt * 6 / 7 * this.ux / this.uy, tw = s.length * cw; if (align === 'c') x -= tw / 2;
    this.fill(x, y, x + tw, y + hgt, function (lx, ly) {
      var gx = (lx - x) / cw, ci = Math.floor(gx), col = Math.floor((gx - ci) * 6), row = 6 - Math.floor((ly - y) / hgt * 7); if (col > 4 || row < 0 || row > 6) return false;
      var g = PX.FONT[s[ci]] || PX.FONT['?']; return ((g[col] >> row) & 1) === 1;
    }, c);
  };
  F.textFit = function (s, maxw, hgt) { return Math.floor(maxw / (hgt * 6 / 7 * this.ux / this.uy)); };
  F.gh = function (a, b, x0, x1) { return function (lx, ly, X, Y) { var t = Math.max(0, Math.min(1, (lx - x0) / (x1 - x0))) * 16; return PX.BAYER[(Y & 3) * 4 + (X & 3)] < t ? b : a; }; };
  F.gv = function (a, b, y0, y1) { return function (lx, ly, X, Y) { var t = Math.max(0, Math.min(1, (ly - y0) / (y1 - y0))) * 16; return PX.BAYER[(Y & 3) * 4 + (X & 3)] < t ? b : a; }; };
  /* darken (or lighten) what is already painted in a region, dithered. lv 0..16 */
  F.shade = function (x0, y0, x1, y1, lv, lighter) {
    var m = this.mask, w = this.B.w, B = this.B, map = lighter ? SC.LT : SC.DK;
    this.fill(x0, y0, x1, y1, yes, function (lx, ly, X, Y) { var i = Y * w + X; if (!m[i]) return -1; var c = B.d[i]; return c < 16 && PX.BAYER[(Y & 3) * 4 + (X & 3)] < lv ? map[c] : c; });
  };
  /* wall with a gradient from a to b and a surface texture */
  F.wall = function (x0, y0, x1, y1, a, b, tex, lv) {
    var gb = lv === undefined ? 9 : lv, me = this, w = x1 - x0, ch = tex === 'stone' ? 6 : 4, jc = SC.DK[a] === a ? b : SC.DK[a];
    this.fill(x0, y0, x1, y1, yes, function (lx, ly, X, Y, uy, ux) {
      var t = (lx - x0) / w * gb + (ly < 9 ? 3 : 0), fx = (lx - x0) / w, base = (ly - y0) < 5 * uy ? b : (PX.BAYER[(Y & 3) * 4 + (X & 3)] < Math.max(0, Math.min(1, (fx - 0.28) / 0.62)) * 16 ? b : a), cy = (ly - y0) / uy, cx = (lx - x0) / ux, hs = (X * 7 + Y * 13) % 23, row, c = base;
      if (tex === 'brick' || tex === 'stone') {
        row = Math.floor(cy / ch); var cwid = tex === 'stone' ? 11 : 6;
        if (cy - row * ch < 1) c = jc; else if (((cx + (row & 1) * cwid / 2) % cwid) < 1) c = jc; else if (hs === 0) c = SC.LT[a];
      } else if (tex === 'panel') {
        if (cy % 18 < 1 || cx % 15 < 1) c = jc; else if ((cy % 18 === 3 || cy % 18 === 15) && (cx % 15 === 3 || cx % 15 === 12)) c = SC.LT[a];
      } else if (tex === 'plank') { if (cx % 6 < 1) c = jc; else if (hs === 0) c = jc; }
      else if (tex === 'corr') { c = (Math.floor(cx / 2) & 1) ? b : a; }
      else if (tex === 'glass') {
        if (cx % 9 < 1 || cy % 8 < 1) c = SC.LT[a] === a ? b : SC.LT[a]; else { var dg = (cx + cy * 0.7) % 23; c = dg < 3 ? PX.W : base; if (me.night && hs < 5 && (Math.floor(cx / 9) * 3 + Math.floor(cy / 8)) % 4 === 0) c = PX.E + PX.Y; }
      } else if (hs === 0) c = jc; else if (hs === 5 && PX.BAYER[(Y & 3) * 4 + (X & 3)] < 8) c = SC.LT[a];
      return c;
    });
  };
  /* a window with frame, sill, lintel shadow and an interior (blinds, curtain, shutters or plain), lit at night */
  F.win = function (x, y, w, h, t, o) {
    o = o || {}; var ux = this.ux, uy = this.uy, g = o.g !== undefined ? o.g : t.g, fr = o.fr !== undefined ? o.fr : PX.K, kind = o.kind !== undefined ? o.kind : Math.floor(this.rnd() * 4), lit = this.night && (o.lit !== undefined ? o.lit : this.rnd() < 0.55), me = this;
    if (w < ux * 3 || h < uy * 3) { this.R(x, y, w, h, lit ? PX.E + PX.Y : g); return; }
    this.R(x - ux, y - uy, w + 2 * ux, h + 2 * uy, fr);
    var gl = lit ? PX.E + PX.Y : g, dk = lit ? PX.E + PX.N : SC.DK[g] === g ? PX.K : SC.DK[g];
    this.fill(x, y, x + w, y + h, yes, function (lx, ly, X, Y) {
      var tt = (ly - y) / h, bay = PX.BAYER[(Y & 3) * 4 + (X & 3)];
      if (kind === 1 && !lit && ((Y & 1) === 0) && tt < 0.8) return dk;
      if (kind === 2 && lx - x < w * 0.28) return o.k !== undefined ? o.k : t.k;
      if (kind === 2 && lx - x > w * 0.78) return o.k !== undefined ? o.k : t.k;
      if (tt > 0.78 && bay < 7) return lit ? PX.E + PX.LR : dk;
      if (!lit && (lx - x) / w + tt > 1.5 && bay < 9) return PX.W;
      return gl;
    });
    this.R(x + w / 2 - ux / 2, y, ux, h, fr);
    if (h > uy * 6) this.R(x, y + h * 0.5, w, uy, fr);
    if (kind === 3 && o.shut !== false) { this.R(x - ux * 3, y, ux * 2.2, h, o.k !== undefined ? o.k : t.k); this.R(x + w + ux * 0.8, y, ux * 2.2, h, o.k !== undefined ? o.k : t.k); }
    this.R(x - ux * 2, y - uy * 2.2, w + 4 * ux, uy * 1.2, SC.DK[t.a]);
    this.R(x - ux * 2, y - uy * 1.2, w + 4 * ux, uy * 1.1, t.t === PX.W ? PX.W : SC.LT[t.a]);
  };
  F.grid = function (x0, x1, y0, y1, cols, rows, t, o) {
    o = o || {}; var cw = (x1 - x0) / cols, rh = (y1 - y0) / rows, ww = cw * (o.fw || 0.5), wh = rh * (o.fh || 0.56);
    for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) this.win(x0 + i * cw + (cw - ww) / 2, y0 + j * rh + (rh - wh) / 2, ww, wh, t, o);
  };
  /* a doorway: surround, dark recess, door leaf with a glass pane, handle and steps */
  F.door = function (x, w, h, t, o) {
    o = o || {}; var ux = this.ux, uy = this.uy, k = o.k !== undefined ? o.k : t.k;
    this.R(x - 4 * ux, -2, w + 8 * ux, h + 4 * uy + 2, o.trim !== undefined ? o.trim : SC.LT[t.a] === t.a ? t.t : t.t);
    this.R(x - 4 * ux, h + 1.5 * uy, w + 8 * ux, 2.5 * uy, SC.DK[t.a]);
    this.R(x - ux, 0, w + 2 * ux, h + uy, PX.K);
    this.R(x + ux * 1.5, 0, w - 3 * ux, h - uy, k);
    this.fill(x + ux * 1.5, 0, x + w - ux * 1.5, h - uy, yes, function (lx, ly, X, Y) { return (lx > x + w * 0.5 && ((X + Y) & 1) && ly < h * 0.5) ? SC.DK[k] : lx < x + w * 0.2 && PX.BAYER[(Y & 3) * 4 + (X & 3)] < 5 ? SC.LT[k] : k; });
    this.R(x + w * 0.22, h * 0.45, w * 0.56, h * 0.38, this.night ? PX.E + PX.Y : t.g); this.R(x + w * 0.5 - ux * 0.5, h * 0.45, ux, h * 0.38, PX.K);
    this.R(x + w * 0.7, h * 0.3, ux * 1.6, uy * 1.8, PX.Y);
    this.R(x - ux, h - uy * 1.2, w + 2 * ux, uy * 1.5, PX.K);
    if (o.steps !== false) { this.R(x - 7 * ux, -4.2 * uy, w + 14 * ux, 4.2 * uy, SC.LT[t.a] === t.a ? PX.L : SC.LT[t.a]); this.R(x - 7 * ux, -4.2 * uy, w + 14 * ux, uy * 1.1, PX.W); this.R(x - 11 * ux, -8.4 * uy, w + 22 * ux, 4.2 * uy, PX.L); this.R(x - 11 * ux, -8.4 * uy, w + 22 * ux, uy * 1.1, PX.W); this.R(x - 11 * ux, -8.4 * uy, w + 22 * ux, uy * 0.9, PX.D); this.R(x - 7 * ux, -4.2 * uy, w + 14 * ux, uy * 0.9, PX.D); }
  };
  /* a striped awning that sticks out over the pavement, with a dark shadow on the wall under it */
  F.awning = function (x0, x1, ly, drop, off, c1, c2) {
    var A = this.map(x0, ly), Bq = this.map(x1, ly), C = this.out(x1, ly - drop, off), D = this.out(x0, ly - drop, off), mx = Math.min(A[0], Bq[0], C[0], D[0]), self = this, k = 0;
    this.shade(x0, ly - drop * 2.4, x1, ly - drop * 0.4, 12);
    this.S([A[0], A[1], Bq[0], Bq[1], C[0], C[1], D[0], D[1]], function (x, y) { return (Math.floor((x - mx) / 4) & 1) ? c2 : c1; });
    this.B.line(D[0], D[1], C[0], C[1], SC.DK[c1]); this.B.line(D[0], D[1] + 1, C[0], C[1] + 1, PX.K);
    for (var i = 0; i < 12; i++) { var q = (x1 - x0) * i / 12; var P1 = this.out(x0 + q, ly - drop, off); this.B.px(P1[0], P1[1] + 1, (i & 1) ? c2 : c1); }
  };
  /* a ledge or cornice along the top of a wall, with a shadow beneath it */
  F.cornice = function (x0, x1, y, t, hh) {
    var ux = this.ux, uy = this.uy; hh = hh || 5;
    this.R(x0, y - uy * 3, x1 - x0, uy * 3, SC.DK[t.a]); this.shade(x0, y - uy * 8, x1, y - uy * 3, 10);
    this.R(x0 - 3 * ux, y, x1 - x0 + 6 * ux, hh * 0.5 * uy + uy, t.t); this.R(x0 - 3 * ux, y + hh * 0.5 * uy + uy * 0.5, x1 - x0 + 6 * ux, uy * 1.5, t.r);
  };
  /* give the whole painted building a one pixel black edge */
  F.edge = function () {
    var B = this.B, m = this.mask, w = B.w, h = B.h, out = [], i, x, y;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) { i = y * w + x; if (!m[i]) continue; if (x === 0 || y === 0 || x === w - 1 || y === h - 1 || !m[i - 1] || !m[i + 1] || !m[i - w] || !m[i + w]) out.push(i); }
    out.forEach(function (j) { B.d[j] = 0; });
    /* a bright rim just inside the left and top edges of buildings that face the light, so each one reads as a solid shape */
    if (!this.shaded) { var rim = []; for (y = 1; y < h - 1; y++) for (x = 1; x < w - 1; x++) { i = y * w + x; if (!m[i] || B.d[i] === 0) continue; if ((B.d[i - 1] === 0 && m[i - 1]) || (B.d[i - w] === 0 && m[i - w])) rim.push(i); }
      rim.forEach(function (j) { var c = B.d[j]; if (c < 16) B.d[j] = SC.LT[c]; }); }
    /* and a dark bevel just inside the right and bottom edges */
    var bev = []; for (y = 1; y < h - 1; y++) for (x = 1; x < w - 1; x++) { i = y * w + x; if (!m[i] || B.d[i] === 0) continue; if ((B.d[i + 1] === 0 && m[i + 1]) || (B.d[i + w] === 0 && m[i + w])) bev.push(i); }
    bev.forEach(function (j) { var c = B.d[j]; if (c < 16 && SC.DK[c] !== 0) B.d[j] = SC.DK[c]; });
  };
  for (var k in F) SC.Fac.prototype[k] = F[k];
})({});

/* ---------- sky, far skyline and ground ---------- */
SC.stars = function (B, rnd, y1) { for (var i = 0; i < 70; i++) { var x = Math.floor(rnd() * B.w), y = Math.floor(rnd() * y1), c = rnd() < 0.2 ? PX.Y : PX.W; B.px(x, y, PX.E + c); if (rnd() < 0.08) { B.px(x + 1, y, PX.E + PX.L); B.px(x, y + 1, PX.E + PX.L); } } };
SC.skyArt = function (B, pid, th, g, night, rnd) {
  var VY = g.VY, cols = night ? th.nsky.map(function (c) { return c + PX.E; }) : th.sky; B.vgrad(0, 0, B.w, VY + 14, cols);
  if (night || pid === 'nihil') SC.stars(B, rnd, VY + 8);
  var sx = pid === 'kryndor' ? 40 : pid === 'karthosu' ? 270 : 252, sy = Math.min(34, VY - 18), r = pid === 'halcyra' ? 30 : pid === 'nihil' ? 26 : 14;
  var disc = night ? [PX.E + PX.W, PX.E + PX.L] : [th.sun, PX.W];
  if (pid === 'nihil') { B.ell(sx, sy, r + 4, r + 4, PX.E + PX.LM); B.ell(sx - 4, sy - 4, r, r, PX.E + PX.M); B.line(sx - 40, sy + 8, sx + 40, sy - 8, PX.E + PX.LC); }
  else if (pid === 'halcyra') { B.ell(sx, sy, r, r, night ? PX.E + PX.LM : PX.LR); B.rect(sx - r, sy - 6, r * 2, 3, night ? PX.E + PX.M : PX.R); B.rect(sx - r + 4, sy + 6, r * 2 - 8, 3, night ? PX.E + PX.M : PX.W); B.line(sx - 44, sy + 4, sx + 44, sy - 6, night ? PX.E + PX.LC : PX.Y); }
  else { B.ell(sx, sy, r, r, disc[0]); B.ell(sx - 3, sy - 3, r - 5, r - 5, disc[1]); if (night) B.ell(sx + 5, sy - 2, r - 3, r - 3, PX.E + PX.B); }
  if (!night && pid !== 'nihil' && pid !== 'kryndor') [[50, 24], [130, 14], [214, 36]].forEach(function (c) { B.ell(c[0], c[1], 20, 4, PX.W); B.ell(c[0] + 10, c[1] - 3, 12, 4, PX.W); });
  var y0 = VY + 4, x, w;
  /* a hazy pair of distant ridges first, then each world's own skyline */
  if (pid === 'meridoa' || pid === 'karthosu' || pid === 'ferrox') {
    var hc = [night ? PX.B : pid === 'meridoa' ? PX.C : pid === 'karthosu' ? PX.LR : PX.D, night ? PX.K : pid === 'meridoa' ? PX.G : pid === 'karthosu' ? PX.R : PX.K];
    for (x = 0; x < 330; x++) { var hh = Math.round(Math.sin(x / 31 + 1) * 6 + Math.sin(x / 13) * 3 + 11); B.rect(x, y0 - hh, 1, hh + 4, hc[0]); }
    for (x = 0; x < 330; x++) { var h2 = Math.round(Math.sin(x / 19 + 3) * 4 + Math.sin(x / 7) * 2 + 5); B.rect(x, y0 - h2, 1, h2 + 4, hc[1]); }
  }
  if (pid === 'meridoa') { for (x = 0; x < 330; x += 1) B.rect(x, y0 - 3 - Math.round(Math.sin(x / 22) * 3 + Math.sin(x / 9) * 1), 1, 8, th.far[(x >> 2) & 1]); B.rect(100, y0 - 22, 3, 22, PX.N); B.line(101, y0 - 22, 112, y0 - 28, PX.W); B.line(101, y0 - 22, 92, y0 - 16, PX.W); B.line(101, y0 - 22, 94, y0 - 30, PX.W); B.line(101, y0 - 22, 110, y0 - 14, PX.W); B.rect(280, y0 - 14, 8, 14, PX.W); B.poly([278, y0 - 14, 290, y0 - 14, 284, y0 - 21], PX.LR); }
  else if (pid === 'karthosu') { B.poly([0, y0, 20, y0 - 20, 50, y0 - 20, 70, y0], PX.N); B.poly([230, y0, 252, y0 - 26, 290, y0 - 26, 320, y0], PX.N); B.poly([150, y0, 170, y0 - 36, 174, y0 - 36, 194, y0], PX.R); B.rect(110, y0 - 40, 4, 40, PX.Y); B.poly([108, y0 - 40, 116, y0 - 40, 112, y0 - 50], PX.Y); B.poly([20, y0 - 20, 50, y0 - 20, 70, y0, 38, y0], PX.R); }
  else if (pid === 'ferrox') { for (x = 4; x < 320; x += 28) { B.rect(x, y0 - 30 - (x % 3) * 8, 6, 40, PX.D); B.ell(x + 3, y0 - 34 - (x % 3) * 8, 7, 4, PX.L); B.ell(x + 8, y0 - 44 - (x % 3) * 8, 6, 3, PX.D); } B.poly([0, y0, 60, y0 - 16, 130, y0], PX.D); }
  else if (pid === 'kryndor') { for (x = 0; x < 320; x += 12) B.rect(x, y0 - 14 - ((x * 7) % 5) * 14, 11, 80, (x >> 3) & 1 ? PX.B : PX.D); for (x = 0; x < 320; x += 12) if (night) for (w = 0; w < 4; w++) B.px(x + 3, y0 - 8 - ((x * 7) % 5) * 14 + w * 6, PX.E + PX.Y); B.rect(50, y0 - 100, 3, 100, PX.D); B.px(51, y0 - 101, PX.E + PX.LR); }
  else if (pid === 'nihil') { B.ring(100, 52, 70, 12, PX.E + PX.D); B.ring(100, 52, 74, 14, PX.E + PX.D); for (x = 20; x < 300; x += 40) B.rect(x, y0 - 8, 22, 8, PX.D); }
  else if (pid === 'quellin') { for (x = 10; x < 320; x += 46) { B.ell(x + 12, y0, 16, 12, PX.LC); B.rect(x - 4, y0, 32, 10, PX.LC); } B.ring(60, 40, 22, 6, PX.W); B.rect(240, y0 - 40, 3, 40, PX.L); B.ell(241, y0 - 42, 6, 6, PX.LM); }
  else if (pid === 'halcyra') { for (x = 0; x < 330; x += 26) B.ell(x, y0 + 2, 24, 8 + (x % 3) * 3, PX.LM); B.ell(70, y0 - 8, 30, 6, PX.W); B.ell(290, y0 - 10, 34, 7, PX.W); }
};

SC.quad = function (B, g, s0, s1, l0, l1, c) { var a = SC.P(g, s0, l0), b = SC.P(g, s0, l1), c2 = SC.P(g, s1, l1), d = SC.P(g, s1, l0); B.poly([a[0], a[1], b[0], b[1], c2[0], c2[1], d[0], d[1]], c); };
SC.gline = function (B, g, s0, l0, s1, l1, c) { var a = SC.P(g, s0, l0), b = SC.P(g, s1, l1); B.line(a[0], a[1], b[0], b[1], c); };
SC.dith = function (a, b, lv) { return function (x, y) { return PX.BAYER[(y & 3) * 4 + (x & 3)] < lv ? b : a; }; };
/* a grid of joints across a strip of ground: cross joints at even steps of depth, long joints at even steps across */
SC.tiles = function (B, g, l0, l1, zstep, nl, c, c2) {
  var k, z, i;
  for (z = 1; z < 14; z += zstep) { var s = 1 / z, a = SC.P(g, s, l0), b = SC.P(g, s, l1); B.line(a[0], a[1], b[0], b[1], c); if (c2 !== undefined) { B.line(a[0], a[1] + 1, b[0], b[1] + 1, c2); } }
  for (i = 0; i <= nl; i++) { var l = l0 + (l1 - l0) * i / nl; SC.gline(B, g, 1.12, l, 0.06, l, c); }
};
SC.kerb = function (B, g, top, face, dark) {
  [g.ls, g.rs].forEach(function (l, i) {
    var inner = i === 0 ? -0.018 : 0.0, o = i === 0 ? 0 : -0.018;
    SC.quad(B, g, 0.04, 1.12, l + (i === 0 ? -0.02 : 0), l + (i === 0 ? 0 : 0.02), top);
    SC.quad(B, g, 0.04, 1.12, l + (i === 0 ? 0 : -0.006), l + (i === 0 ? 0.008 : 0), face);
    SC.gline(B, g, 1.12, l, 0.04, l, dark);
  });
};
SC.scatter = function (B, g, rnd, n, l0, l1, fn) { for (var i = 0; i < n; i++) { var s = 0.08 + Math.sqrt(rnd()) * 1.0, l = l0 + rnd() * (l1 - l0), p = SC.P(g, s, l); fn(p[0], p[1], s, i); } };

SC.GR = {};
SC.GR.dirt = function (B, th, g, rnd, pid) {
  var VX = g.VX, VY = g.VY, w = th.walk, r = th.road, cin = pid === 'ferrox', i, k;
  SC.quad(B, g, 0, 1.12, 0, g.ls, SC.dith(w[0], w[1], cin ? 5 : 6)); SC.quad(B, g, 0, 1.12, g.rs, 1, SC.dith(w[0], w[1], cin ? 5 : 6));
  SC.quad(B, g, 0, 1.12, g.ls, g.rs, SC.dith(r[0], r[1], cin ? 3 : 5));
  /* ruts and a worn middle */
  [0.3, 0.7].forEach(function (f) { var l = g.ls + (g.rs - g.ls) * f; SC.quad(B, g, 0.03, 1.12, l - 0.03, l + 0.03, SC.dith(-1, SC.DK[r[0]] === r[0] ? PX.K : SC.DK[r[0]], 8)); SC.quad(B, g, 0.03, 1.12, l - 0.01, l + 0.01, function (x, y) { return PX.BAYER[(y & 3) * 4 + (x & 3)] < 10 ? SC.DK[SC.DK[r[0]]] : -1; }); });
  SC.quad(B, g, 0.03, 1.12, g.ls + (g.rs - g.ls) * 0.44, g.ls + (g.rs - g.ls) * 0.56, SC.dith(-1, SC.LT[r[0]], 5));
  SC.scatter(B, g, rnd, 260, 0, 1, function (x, y, s, n) { B.px(x, y, n % 3 ? SC.DK[w[0]] : SC.LT[w[0]]); });
  SC.scatter(B, g, rnd, 90, g.ls, g.rs, function (x, y, s, n) { var sz = s > 0.6 ? 2 : 1; B.rect(x, y, sz + 1, sz, n % 2 ? PX.L : PX.D); B.px(x, y + sz, PX.K); });
  if (pid === 'meridoa') {
    /* grass verges with tufts and little flowers */
    SC.scatter(B, g, rnd, 150, 0, g.ls * 0.95, function (x, y, s, n) { var h = Math.max(2, Math.round(4 * s)); B.line(x, y, x - 1, y - h, PX.G); B.line(x + 1, y, x + 1, y - h, PX.LG); if (n % 6 === 0) B.px(x, y - h - 1, [PX.W, PX.LR, PX.Y, PX.LM][n % 4]); });
    SC.scatter(B, g, rnd, 150, g.rs * 1.0, 1, function (x, y, s, n) { var h = Math.max(2, Math.round(4 * s)); B.line(x, y, x - 1, y - h, PX.G); B.line(x + 1, y, x + 1, y - h, PX.LG); if (n % 6 === 0) B.px(x, y - h - 1, [PX.W, PX.LR, PX.Y, PX.LM][n % 4]); });
    SC.scatter(B, g, rnd, 40, g.ls, g.rs, function (x, y, s, n) { if (n % 2) B.px(x, y - 1, PX.LG); B.px(x, y, PX.G); });
  } else if (pid === 'karthosu') {
    /* wind-blown sand drifts, pebbles and a buried column drum */
    for (i = 0; i < 6; i++) { var l = g.ls + 0.05 + i * 0.12, a = SC.P(g, 0.9, l), b = SC.P(g, 0.25, l + 0.1); B.line(a[0], a[1], b[0], b[1], PX.W); B.line(a[0] + 1, a[1] + 1, b[0] + 1, b[1] + 1, SC.LT[r[0]]); }
    var cc = SC.P(g, 0.5, g.rs + 0.05); B.ell(cc[0], cc[1], 7, 3, PX.N); B.ell(cc[0], cc[1] - 2, 7, 3, PX.Y); B.ell(cc[0], cc[1] - 2, 3, 1, PX.N);
  } else if (cin) {
    /* mine cart rails with sleepers */
    var la = g.ls + (g.rs - g.ls) * 0.4, lb = g.ls + (g.rs - g.ls) * 0.6;
    for (var z = 1; z < 9; z += 0.34) { var s2 = 1 / z, a1 = SC.P(g, s2, la - 0.02), b1 = SC.P(g, s2, lb + 0.02); B.line(a1[0], a1[1], b1[0], b1[1], PX.N); }
    SC.gline(B, g, 1.12, la, 0.04, la, PX.L); SC.gline(B, g, 1.12, lb, 0.04, lb, PX.L); SC.gline(B, g, 1.12, la, 0.04, la, PX.L);
    SC.gline(B, g, 1.12, la + 0.004, 0.04, la + 0.004, PX.D); SC.gline(B, g, 1.12, lb + 0.004, 0.04, lb + 0.004, PX.D);
    SC.scatter(B, g, rnd, 22, g.ls, g.rs, function (x, y, s, n) { B.px(x, y, PX.LR); if (n % 3 === 0) B.px(x + 1, y, PX.R); });
  }
  /* a haze of dust where the ground meets the sky */
  for (k = 0; k < 14; k++) for (i = 0; i < 330; i++) if (PX.BAYER[((VY + k) & 3) * 4 + (i & 3)] > 3 + k && (i + k) % 3 === 0) B.px(i, VY + k, th.sky[2]);
  SC.kerb(B, g, SC.LT[w[0]], SC.DK[w[1]], PX.K);
};
SC.GR.cinder = SC.GR.dirt;
SC.GR.road = function (B, th, g, rnd, pid) {
  var r = th.road, i, z;
  SC.quad(B, g, 0, 1.12, 0, g.ls, SC.dith(th.walk[0], th.walk[1], 6)); SC.quad(B, g, 0, 1.12, g.rs, 1, SC.dith(th.walk[0], th.walk[1], 6));
  SC.quad(B, g, 0, 1.12, g.ls, g.rs, SC.dith(r[0], r[1], 3));
  SC.tiles(B, g, 0, g.ls, 0.42, 3, SC.DK[th.walk[1]]); SC.tiles(B, g, g.rs, 1, 0.42, 3, SC.DK[th.walk[1]]);
  SC.scatter(B, g, rnd, 220, g.ls, g.rs, function (x, y, s, n) { B.px(x, y, n % 4 ? PX.D : PX.L); });
  /* tyre-dark lanes, centre dashes, a zebra crossing and a manhole */
  var mid = (g.ls + g.rs) / 2;
  [0.28, 0.72].forEach(function (f) { var l = g.ls + (g.rs - g.ls) * f; SC.quad(B, g, 0.03, 1.12, l - 0.04, l + 0.04, SC.dith(-1, PX.K, 7)); });
  for (z = 1.1; z < 9; z *= 1.3) { var s0 = 1 / z, s1 = 1 / (z + 0.28 * z * 0.55); SC.quad(B, g, s1, s0, mid - 0.012, mid + 0.012, PX.Y); }
  for (i = 0; i < 8; i++) { var l0 = g.ls + 0.03 + i * (g.rs - g.ls - 0.06) / 8; SC.quad(B, g, 0.50, 0.58, l0, l0 + (g.rs - g.ls - 0.06) / 16, PX.W); }
  var mh = SC.P(g, 0.82, mid + 0.12); B.ell(mh[0], mh[1], 8, 3, PX.D); B.ell(mh[0], mh[1] - 1, 7, 2, PX.L); B.line(mh[0] - 5, mh[1] - 1, mh[0] + 5, mh[1] - 1, PX.D);
  SC.kerb(B, g, PX.L, PX.D, PX.K);
  /* yellow no-parking line along both kerbs */
  SC.quad(B, g, 0.05, 1.12, g.ls + 0.012, g.ls + 0.022, PX.Y); SC.quad(B, g, 0.05, 1.12, g.rs - 0.022, g.rs - 0.012, PX.Y);
};
SC.GR.concrete = function (B, th, g, rnd, pid) {
  var w = th.walk, r = th.road, i;
  SC.quad(B, g, 0, 1.12, 0, 1, SC.dith(r[0], r[1], 5));
  SC.quad(B, g, 0, 1.12, 0, g.ls, SC.dith(w[0], w[1], 4)); SC.quad(B, g, 0, 1.12, g.rs, 1, SC.dith(w[0], w[1], 4));
  SC.tiles(B, g, 0, 1, 0.5, 8, PX.LC, PX.W);
  SC.scatter(B, g, rnd, 50, 0, 1, function (x, y, s, n) { B.px(x, y, n % 2 ? PX.C : PX.LC); });
  /* a pale guide line with arrows down the middle, lamps set into the floor */
  var mid = (g.ls + g.rs) / 2; SC.quad(B, g, 0.03, 1.12, mid - 0.01, mid + 0.01, PX.LM);
  for (var z = 1.3; z < 8; z *= 1.5) { var s = 1 / z, a = SC.P(g, s, mid - 0.04), b = SC.P(g, s, mid + 0.04), c = SC.P(g, s * 0.9, mid); B.poly([a[0], a[1], b[0], b[1], c[0], c[1]], PX.LM); }
  SC.kerb(B, g, PX.W, PX.LC, PX.C);
  for (i = 0; i < 10; i++) { var q = SC.P(g, 0.15 + i * 0.09, g.ls + 0.01); B.px(q[0], q[1], PX.LB); }
};
SC.GR.plate = function (B, th, g, rnd, pid) {
  var w = th.walk, r = th.road, i;
  SC.quad(B, g, 0, 1.12, 0, 1, SC.dith(r[0], r[1], 5));
  SC.quad(B, g, 0, 1.12, 0, g.ls, SC.dith(w[0], w[1], 6)); SC.quad(B, g, 0, 1.12, g.rs, 1, SC.dith(w[0], w[1], 6));
  SC.tiles(B, g, 0, 1, 0.38, 10, PX.K, PX.D);
  /* rivets on every plate corner */
  for (var z = 1; z < 10; z += 0.38) for (i = 0; i <= 10; i++) { var s = 1 / z, p = SC.P(g, s, i / 10); B.px(p[0] + 2, p[1] + 2, PX.L); }
  /* hazard stripes along the kerbs and a glowing guide strip */
  [g.ls, g.rs].forEach(function (l, k) { for (var q = 1; q < 14; q += 0.5) { var s0 = 1 / q, s1 = 1 / (q + 0.25), a = k ? l - 0.02 : l, b = k ? l : l + 0.02; SC.quad(B, g, s1, s0, a, b, ((q * 2) | 0) % 2 ? PX.Y : PX.K); } });
  var mid = (g.ls + g.rs) / 2; for (z = 1; z < 12; z *= 1.22) { var s3 = 1 / z, p3 = SC.P(g, s3, mid), p4 = SC.P(g, 1 / (z * 1.1), mid); B.line(p3[0], p3[1], p4[0], p4[1], PX.E + PX.LC); }
  SC.kerb(B, g, PX.L, PX.D, PX.K);
  SC.scatter(B, g, rnd, 30, 0, 1, function (x, y, s, n) { B.px(x, y, PX.E + (n % 2 ? PX.LM : PX.LC)); });
};
SC.GR.deck = function (B, th, g, rnd, pid) {
  var w = th.walk, r = th.road, i;
  SC.quad(B, g, 0, 1.12, 0, 1, SC.dith(r[0], r[1], 6));
  SC.quad(B, g, 0, 1.12, 0, g.ls, SC.dith(w[0], w[1], 8)); SC.quad(B, g, 0, 1.12, g.rs, 1, SC.dith(w[0], w[1], 8));
  /* long planks, staggered butt joints */
  for (i = 0; i <= 24; i++) { var l = i / 24; SC.gline(B, g, 1.12, l, 0.05, l, SC.DK[r[0]]); }
  for (var z = 1, k = 0; z < 12; z += 0.45, k++) for (i = (k & 1); i < 24; i += 2) { var s = 1 / z, a = SC.P(g, s, i / 24), b = SC.P(g, s, (i + 1) / 24); B.px(a[0] + (b[0] - a[0]) * 0.5, a[1], PX.N); B.px(a[0] + (b[0] - a[0]) * 0.5 + 1, a[1], PX.N); }
  SC.kerb(B, g, PX.W, PX.L, PX.D);
  /* rope railing posts along the platform edge */
  SC.scatter(B, g, rnd, 20, g.ls, g.rs, function (x, y, s, n) { B.px(x, y, n % 3 ? PX.W : PX.LM); });
};
SC.groundArt = function (B, pid, th, g, rnd) {
  var VY = g.VY, i;
  B.poly([0, VY, 330, VY, 330, B.h + 4, 0, B.h + 4], SC.dith(th.ground[0], th.ground[1], 4));
  for (i = 0; i < 300; i++) B.px(Math.floor(rnd() * 320), VY + Math.floor(rnd() * 104), th.ground[1]);
  var S1 = 1.14, pl = function (l0, l1) { var a = SC.P(g, S1, l0), b = SC.P(g, S1, l1); return [a[0], a[1], g.VX, VY, b[0], b[1]]; };
  (SC.GR[th.gt] || SC.GR.dirt)(B, th, g, rnd, pid);
  B.line(SC.P(g, S1, 0)[0], SC.P(g, S1, 0)[1], g.VX, VY, PX.K); B.line(SC.P(g, S1, 1)[0], SC.P(g, S1, 1)[1], g.VX, VY, PX.K);
};
