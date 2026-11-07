/* Galactic Trader 3. Part 13: scenery. Every planet has its own architecture, drawn in 16 EGA colours with 1-pixel black outlines.
   Buildings are drawn into small buffers, outlined, then placed on a street that climbs away from the viewer at 30 degrees. */
var SC = { W: 320, H: 200, HOR: 58, SLOPE: 0.577, X0: 30, Y0: 190 };
var UI = UI || {};
var K_ = PX.K, B_ = PX.B, G_ = PX.G, C_ = PX.C, R_ = PX.R, M_ = PX.M, N_ = PX.N, L_ = PX.L, D_ = PX.D, LB_ = PX.LB, LG_ = PX.LG, LC_ = PX.LC, LR_ = PX.LR, LM_ = PX.LM, Y_ = PX.Y, W_ = PX.W, E_ = PX.E;

/* Planet themes. w: three wall colours, dk: shade, tr: trim, rf: roof, gl: glow (lights up at night), sky: [top, bottom] with dither, gnd, road, curb, sun. */
SC.TH = {
  meridoa:  { style: 'gourd',    sky: [LC_, W_], gnd: [G_, LG_, 5], gnd2: G_, road: [N_, Y_, 3], curb: Y_, w: [Y_, LR_, LG_], dk: N_, lt: W_, tr: G_, rf: G_, gl: Y_, sun: Y_, far: [LG_, G_], decor: 'windmill' },
  karthosu: { style: 'ziggurat', sky: [LR_, Y_], gnd: [Y_, N_, 4], gnd2: N_, road: [L_, Y_, 4], curb: W_, w: [Y_, W_, L_], dk: N_, lt: W_, tr: R_, rf: N_, gl: LR_, sun: R_, far: [N_, LR_], decor: 'dunes' },
  ferrox:   { style: 'forge',    sky: [N_, R_, 6], gnd: [D_, K_, 4], gnd2: K_, road: [D_, L_, 3], curb: Y_, w: [L_, D_, N_], dk: K_, lt: W_, tr: Y_, rf: D_, gl: LR_, sun: Y_, far: [D_, K_], decor: 'rig' },
  kryndor:  { style: 'spire',    sky: [B_, LM_, 6], gnd: [D_, B_, 4], gnd2: B_, road: [K_, D_, 4], curb: LC_, w: [B_, LB_, C_], dk: K_, lt: LC_, tr: LM_, rf: B_, gl: Y_, sun: W_, far: [B_, M_], decor: 'skyline' },
  nihil:    { style: 'hull',     sky: [K_, B_, 3], gnd: [D_, B_, 4], gnd2: K_, road: [B_, D_, 4], curb: LC_, w: [L_, D_, M_], dk: K_, lt: W_, tr: LC_, rf: D_, gl: LC_, sun: LM_, far: [B_, M_], decor: 'ring' },
  quellin:  { style: 'bubble',   sky: [LM_, W_, 6], gnd: [W_, LC_, 4], gnd2: LC_, road: [L_, W_, 4], curb: LM_, w: [W_, LC_, LM_], dk: C_, lt: W_, tr: LM_, rf: LC_, gl: LC_, sun: W_, far: [LM_, LC_], decor: 'domes' },
  halcyra:  { style: 'float',    sky: [Y_, W_, 5], gnd: [W_, Y_, 4], gnd2: Y_, road: [LR_, Y_, 4], curb: W_, w: [LR_, Y_, W_], dk: R_, lt: W_, tr: R_, rf: R_, gl: Y_, sun: LR_, far: [LR_, W_], decor: 'giant' }
};
SC.night = function () { return !!(S && S.visit && S.visit.night); };
SC.nightOld = function () { return !!(typeof S !== 'undefined' && S && S.night); };
SC.roadY = function (x) { return SC.Y0 - SC.SLOPE * (x - SC.X0); };
SC.roadH = function (x) { return Math.max(3, 26 - 23 * (x - SC.X0) / 215); };

/* ---------- small helpers ---------- */
SC.newB = function (w, h) { var b = new PX.Buf(w, h); b.d.fill(255); return b; };
SC.outline = function (b) {
  var w = b.w, h = b.h, s = b.d.slice(), x, y, i;
  for (y = 0; y < h; y++) for (x = 0; x < w; x++) { i = y * w + x; if (s[i] === 255 && ((x > 0 && s[i - 1] !== 255) || (x < w - 1 && s[i + 1] !== 255) || (y > 0 && s[i - w] !== 255) || (y < h - 1 && s[i + w] !== 255))) b.d[i] = 0; }
  return b;
};
SC.shBox = function (b, x, y, w, h, c, dk, lt) { b.rect(x, y, w, h, c); var sw = Math.max(2, w >> 2); b.rect(x + w - sw, y, sw, h, [c, dk, 8]); if (lt !== undefined) { b.rect(x, y, 1, h, lt); b.rect(x, y, w, 1, lt); } };
SC.shEll = function (b, cx, cy, rx, ry, c, dk, lt) { b.ellipse(cx, cy, rx, ry, dk); b.ellipse(cx - rx * 0.14, cy - ry * 0.04, rx * 0.86, ry * 0.97, c); b.ellipse(cx - rx * 0.12, cy - ry * 0.04, rx * 0.5, ry * 0.5, [c, lt, 5]); };
SC.win = function (b, x, y, w, h, lit, glass) { b.rect(x, y, w, h, K_); b.rect(x + 1, y + 1, w - 2, h - 2, lit ? E_ + Y_ : (glass === undefined ? LC_ : glass)); };
SC.round = function (b, x, y, r, lit, rim) { b.ellipse(x, y, r + 1, r + 1, rim === undefined ? N_ : rim); b.ellipse(x, y, r, r, lit ? E_ + Y_ : LC_); };
SC.door = function (b, x, y, w, h, arch, c) {
  var l = Math.round(x - w / 2); b.rect(l, y - h, w, h, K_); if (arch) { b.ellipse(x, y - h + 1, w / 2, w / 2, K_); }
  b.rect(l + 1, y - h + 1, w - 2, h - 1, c === undefined ? D_ : c); if (arch) b.ellipse(x, y - h + 2, w / 2 - 1, w / 2 - 1, c === undefined ? D_ : c);
  b.rect(l + w - 3, y - Math.round(h * 0.45), 1, 2, Y_);
};
SC.sign = function (b, cx, y, w, text, bg, fg) {
  var tw = PX.textW(text), t = text; while (tw > w - 3 && t.length > 2) { t = t.slice(0, -1); tw = PX.textW(t); }
  w = Math.max(w, tw + 3); var l = Math.round(cx - w / 2); b.rect(l, y, w, 9, K_); b.rect(l + 1, y + 1, w - 2, 7, bg + E_); b.text(Math.round(cx - tw / 2), y + 1, t, fg + E_, 1);
};
SC.rnd = function (seed) { return GT.seeded(CH.hash(String(seed))); };

/* ---------- architecture: one kit per planet, two variants each ---------- */
SC.K = {};
/* Meridoa: fat gourd houses with leafy stalks */
SC.K.gourd = function (b, o) {
  var T = o.T, x = o.ox, y = o.oy, w = o.w, h = o.h, c = T.w[o.k % 3], i, k;
  if (o.v === 0) {
    var ry = h * 0.5, cy = y - ry;
    SC.shEll(b, x, cy, w / 2, ry, c, T.dk, W_);
    for (k = -2; k <= 2; k++) { if (!k) continue; var f = k * 0.24, hh = ry * Math.sqrt(1 - f * f) - 3; b.vline(Math.round(x + f * w), Math.round(cy - hh), Math.round(hh * 2), [c, T.dk, 7]); }
    b.rect(x - 1, y - h - 5, 3, 7, G_); b.ellipse(x + 6, y - h - 3, 6, 2, LG_); b.ellipse(x - 6, y - h - 2, 5, 2, G_);
    SC.round(b, Math.round(x - w * 0.24), Math.round(cy - ry * 0.25), 3, o.lit); SC.round(b, Math.round(x + w * 0.24), Math.round(cy - ry * 0.25), 3, o.lit);
    b.rect(Math.round(x - w * 0.24) - 3, Math.round(cy - ry * 0.25) + 5, 7, 2, G_); b.put(Math.round(x - w * 0.24) - 2, Math.round(cy - ry * 0.25) + 4, LR_); b.put(Math.round(x - w * 0.24) + 1, Math.round(cy - ry * 0.25) + 4, Y_);
    return { door: { x: x, y: y, w: Math.max(9, w * 0.22 | 0), h: Math.round(h * 0.36), arch: 1 }, sign: { x: x, y: Math.round(cy - ry * 0.7), w: Math.round(w * 0.7) } };
  }
  var ry1 = h * 0.34, ry2 = h * 0.24;
  SC.shEll(b, x, y - ry1, w / 2, ry1, c, T.dk, W_); SC.shEll(b, x + w * 0.06, y - h + ry2 + 2, w * 0.33, ry2, T.w[(o.k + 1) % 3], T.dk, W_);
  b.rect(x + w * 0.06 - 1, y - h - 4, 3, 7, G_); b.ellipse(x + w * 0.06 + 6, y - h - 2, 6, 2, LG_);
  SC.round(b, x + w * 0.06, y - h + ry2, 3, o.lit); SC.round(b, Math.round(x - w * 0.26), Math.round(y - ry1 * 1.3), 3, o.lit); SC.round(b, Math.round(x + w * 0.26), Math.round(y - ry1 * 1.3), 3, o.lit);
  return { door: { x: x, y: y, w: Math.max(9, w * 0.22 | 0), h: Math.round(h * 0.3), arch: 1 }, sign: { x: x, y: Math.round(y - ry1 * 1.15), w: Math.round(w * 0.66) } };
};
/* Karth-Osu: sandstone ziggurats and carved gates */
SC.K.ziggurat = function (b, o) {
  var T = o.T, x = o.ox, y = o.oy, w = o.w, h = o.h, c = T.w[o.k % 3], i;
  if (o.v === 0) {
    var h1 = Math.round(h * 0.45), h2 = Math.round(h * 0.28), h3 = Math.round(h * 0.2), w2 = Math.round(w * 0.74), w3 = Math.round(w * 0.46);
    SC.shBox(b, x - w / 2, y - h1, w, h1, c, T.dk, W_); SC.shBox(b, x - w2 / 2, y - h1 - h2, w2, h2, c, T.dk, W_); SC.shBox(b, x - w3 / 2, y - h1 - h2 - h3, w3, h3, c, T.dk, W_);
    for (i = 0; i < w - 6; i += 4) { b.rect(x - w / 2 + 3 + i, y - h1 + 2, 2, 2, T.dk); if (i < w2 - 6) b.rect(x - w2 / 2 + 3 + i, y - h1 - h2 + 2, 2, 2, T.dk); }
    b.poly([[x - 4, y - h1 - h2 - h3], [x + 4, y - h1 - h2 - h3], [x, y - h1 - h2 - h3 - 7]], Y_); b.put(x, y - h1 - h2 - h3 - 3, R_);
    b.rect(x + w2 / 2 - 3, y - h1 - h2 + 5, 3, 6, [K_, T.dk, 8]); SC.win(b, x - w3 / 2 + 4, y - h1 - h2 - h3 + 5, 4, 5, o.lit, K_); SC.win(b, x + w3 / 2 - 8, y - h1 - h2 - h3 + 5, 4, 5, o.lit, K_);
    return { door: { x: x, y: y, w: Math.max(9, w * 0.2 | 0), h: Math.round(h1 * 0.8), arch: 0 }, sign: { x: x, y: y - h1 - 8, w: Math.round(w * 0.74) } };
  }
  var cw = Math.max(7, w * 0.16 | 0), lh = h - 6;
  SC.shBox(b, x - w / 2, y - lh, cw, lh, c, T.dk, W_); SC.shBox(b, x + w / 2 - cw, y - lh, cw, lh, c, T.dk, W_);
  SC.shBox(b, x - w / 2 - 2, y - h, w + 4, 8, T.w[(o.k + 1) % 3], T.dk, W_); for (i = 0; i < w; i += 5) b.rect(x - w / 2 + i, y - h + 2, 2, 3, T.dk);
  SC.shBox(b, x - w / 2 + cw, y - lh + 10, w - cw * 2, lh - 10, [c, T.dk, 4], T.dk);
  b.poly([[x - w / 2 - 2, y - h], [x + w / 2 + 2, y - h], [x, y - h - 9]], [T.w[(o.k + 1) % 3], T.dk, 4]); b.ellipse(x, y - h - 4, 3, 3, R_);
  return { door: { x: x, y: y, w: Math.max(10, (w - cw * 2) * 0.5 | 0), h: Math.round(lh * 0.55), arch: 0 }, sign: { x: x, y: y - h + 10, w: Math.round(w * 0.74) } };
};
/* Ferrox: riveted foundries, stacks and derricks */
SC.K.forge = function (b, o) {
  var T = o.T, x = o.ox, y = o.oy, w = o.w, h = o.h, c = T.w[o.k % 3], i, bh = Math.round(h * 0.66);
  if (o.v === 0) {
    SC.shBox(b, x - w / 2, y - bh, w, bh, c, T.dk, W_);
    for (i = 8; i < w - 4; i += 9) b.vline(x - w / 2 + i, y - bh + 1, bh - 2, [c, K_, 6]);
    for (i = 3; i < w - 3; i += 6) { b.put(x - w / 2 + i, y - bh + 3, W_); b.put(x - w / 2 + i, y - 8, W_); }
    for (i = 0; i < 3; i++) b.poly([[x - w / 2 + i * w / 3, y - bh], [x - w / 2 + (i + 1) * w / 3, y - bh], [x - w / 2 + i * w / 3, y - bh - 8]], c);
    var sx = x + w / 2 - 12; SC.shBox(b, sx, y - bh - 24, 8, 26, D_, K_, L_); b.rect(sx - 1, y - bh - 26, 10, 3, Y_); b.rect(sx + 1, y - bh - 26, 2, 3, K_); b.rect(sx + 5, y - bh - 26, 2, 3, K_);
    b.ellipse(sx + 6, y - bh - 32, 6, 4, [L_, D_, 6]); b.ellipse(sx + 12, y - bh - 40, 5, 3, [D_, L_, 6]);
    for (i = 0; i < w - 6; i += 4) b.rect(x - w / 2 + 3 + i, y - 4, 2, 3, i % 8 ? K_ : Y_);
    b.rect(x - w / 2 + 6, y - bh + 6, 12, 3, E_ + LR_); b.rect(x - w / 2 + 6, y - bh + 10, 8, 2, E_ + Y_);
    return { door: { x: x - 2, y: y - 4, w: Math.max(12, w * 0.3 | 0), h: Math.round(bh * 0.6), arch: 0 }, sign: { x: x - 4, y: y - bh + 14, w: Math.round(w * 0.62) } };
  }
  b.dome(x, y, w / 2, bh, c); b.dome(x - w * 0.12, y - 3, w * 0.35, bh * 0.8, [c, W_, 4]); b.dome(x + w * 0.22, y, w * 0.3, bh * 0.9, [c, T.dk, 8]);
  var tx = x + w / 2 - 6; b.line(tx, y, tx - 6, y - h, K_); b.line(tx + 8, y, tx + 2, y - h, K_); for (i = 0; i < 6; i++) { var yy = y - 4 - i * (h / 6.5); b.line(tx - i * 1 + (i % 2 ? 0 : 8), yy, tx + 8 - i * 1 - (i % 2 ? 8 : 0), yy - h / 6.5, T.tr); }
  b.rect(tx - 7, y - h - 3, 16, 3, Y_); b.rect(tx - 2, y - h - 7, 6, 4, D_);
  for (i = 0; i < 4; i++) b.rect(x - w / 2 + 4 + i * 9, y - bh * 0.55, 5, 2, E_ + LR_);
  return { door: { x: x - w * 0.12, y: y, w: Math.max(12, w * 0.28 | 0), h: Math.round(bh * 0.5), arch: 0 }, sign: { x: x - w * 0.1, y: y - bh * 0.85, w: Math.round(w * 0.6) } };
};
/* Kryndor Spire: neon towers and holo-signs */
SC.K.spire = function (b, o) {
  var T = o.T, x = o.ox, y = o.oy, w = o.w, h = o.h, c = T.w[o.k % 3], i, j, r = SC.rnd('sp' + o.k);
  var bw = Math.round(w * 0.78), bh = Math.round(h * 0.74);
  if (o.v === 0) {
    SC.shBox(b, x - bw / 2, y - bh, bw, bh, c, T.dk, T.lt); var w2 = Math.round(bw * 0.6), h2 = Math.round(h * 0.22);
    SC.shBox(b, x - w2 / 2, y - bh - h2, w2, h2, T.w[(o.k + 1) % 3], T.dk, T.lt); b.vline(x, y - bh - h2 - 12, 12, L_); b.put(x, y - bh - h2 - 13, E_ + LR_);
    b.rect(x - bw / 2, y - bh, bw, 1, E_ + LM_); b.rect(x - w2 / 2, y - bh - h2, w2, 1, E_ + LC_);
    for (j = 0; j < Math.floor((bh - 22) / 6); j++) for (i = 0; i < Math.floor((bw - 4) / 5); i++) if (r() < 0.62) SC.win(b, x - bw / 2 + 3 + i * 5, y - bh + 4 + j * 6, 3, 3, r() < 0.5 || o.lit, B_);
    for (j = 0; j < 3; j++) for (i = 0; i < Math.floor((w2 - 2) / 5); i++) b.rect(x - w2 / 2 + 2 + i * 5, y - bh - h2 + 3 + j * 6, 3, 3, r() < 0.6 ? E_ + Y_ : B_);
    return { door: { x: x, y: y, w: Math.max(9, bw * 0.24 | 0), h: Math.round(bh * 0.28), arch: 0 }, sign: { x: x, y: y - Math.round(bh * 0.42), w: Math.round(bw * 0.9) } };
  }
  b.poly([[x - bw / 2, y], [x - bw / 2, y - bh + 6], [x + bw / 2, y - bh - h * 0.2], [x + bw / 2, y]], c); b.poly([[x + bw / 2 - 6, y], [x + bw / 2 - 6, y - bh - h * 0.19 + 3], [x + bw / 2, y - bh - h * 0.2], [x + bw / 2, y]], [c, T.dk, 8]);
  b.line(x - bw / 2, y - bh + 6, x + bw / 2, y - bh - h * 0.2, E_ + LC_);
  for (j = 0; j < 4; j++) for (i = 0; i < Math.floor((bw - 4) / 5); i++) if (r() < 0.7) SC.win(b, x - bw / 2 + 3 + i * 5, y - bh + 10 + j * 6 - i, 3, 3, r() < 0.5 || o.lit, B_);
  b.ring(x, y - bh - h * 0.24, 10, 3, E_ + LM_); b.ring(x, y - bh - h * 0.24, 7, 2, E_ + LC_); b.put(x, y - bh - h * 0.24, E_ + W_);
  return { door: { x: x, y: y, w: Math.max(9, bw * 0.24 | 0), h: Math.round(bh * 0.28), arch: 0 }, sign: { x: x, y: y - Math.round(bh * 0.45), w: Math.round(bw * 0.9) } };
};
/* Nihil Station: bolted hull modules with portholes and airlocks */
SC.K.hull = function (b, o) {
  var T = o.T, x = o.ox, y = o.oy, w = o.w, h = o.h, c = T.w[o.k % 3], i, bh = Math.round(h * 0.6);
  if (o.v === 0) {
    SC.shBox(b, x - w / 2, y - bh, w, bh, c, T.dk, W_); b.ellipse(x - w / 2, y - bh / 2, 4, bh / 2, c); b.ellipse(x + w / 2, y - bh / 2, 4, bh / 2, [c, T.dk, 8]);
    for (i = 6; i < w - 2; i += 7) b.vline(x - w / 2 + i, y - bh, bh, [c, K_, 6]);
    for (i = 0; i < Math.floor((w - 8) / 8); i++) SC.round(b, x - w / 2 + 8 + i * 8, y - bh + 6, 2, true, K_);
    b.rect(x - 14, y - bh - 7, 2, 7, L_); b.ellipse(x - 13, y - bh - 9, 7, 3, W_); b.vline(x + w / 2 - 8, y - bh - 14, 14, D_); b.put(x + w / 2 - 8, y - bh - 15, E_ + LR_);
    b.rect(x - w / 2 - 9, y - 12, 12, 5, L_); b.rect(x - w / 2 - 9, y - 12, 12, 1, W_);
    return { door: { x: x, y: y, w: Math.max(10, w * 0.22 | 0), h: Math.round(bh * 0.6), arch: 1 }, sign: { x: x, y: y - bh + 14, w: Math.round(w * 0.78) } };
  }
  var r = Math.round(Math.min(w * 0.42, h * 0.5)), cy = y - r - 4;
  b.rect(x - r + 2, y - 6, 3, 6, D_); b.rect(x + r - 5, y - 6, 3, 6, D_); b.rect(x - r - 2, y - 2, 8, 2, L_); b.rect(x + r - 6, y - 2, 8, 2, L_);
  SC.shEll(b, x, cy, r, r, c, T.dk, W_); b.rect(x - r, cy - 1, r * 2, 3, [D_, c, 8]); for (i = -1; i <= 1; i += 2) { b.rect(x + i * (r + 2) - 3, cy - r - 8, 7, 14, [B_, LB_, 6]); b.vline(x + i * (r + 2), cy - r - 8, 14, K_); }
  for (i = -2; i <= 2; i++) if (i) SC.round(b, x + i * 6, cy - 6, 2, true, K_);
  return { door: { x: x, y: y - 4, w: Math.max(9, r * 0.5 | 0), h: Math.round(r * 0.7), arch: 1 }, sign: { x: x, y: cy - r * 0.45, w: Math.round(r * 1.5) } };
};
/* Quellin Reach: glass domes, flasks and floating atoms */
SC.K.bubble = function (b, o) {
  var T = o.T, x = o.ox, y = o.oy, w = o.w, h = o.h, c = T.w[o.k % 3], i;
  if (o.v === 0) {
    var ry = Math.round(h * 0.75), rx = Math.round(w * 0.5);
    b.dome(x, y, rx, ry, [LC_, W_, 6]); b.dome(x - rx * 0.12, y, rx * 0.8, ry * 0.8, [LC_, W_, 10]);
    for (i = -2; i <= 2; i++) { var f = i / 3, hh = ry * Math.sqrt(1 - f * f); b.line(x + f * rx, y, x + f * rx * 0.85, y - hh + 1, W_); }
    b.dome(x, y - ry * 0.55, rx * 0.84, ry * 0.45, [LC_, W_, 9]); b.rect(x - rx, y - 3, rx * 2, 3, C_);
    b.rect(x + rx * 0.2, y - 18, 9, 14, [LG_, W_, 3]); b.rect(x + rx * 0.2 + 3, y - 22, 3, 5, W_); b.put(x + rx * 0.2 + 2, y - 10, E_ + W_); b.put(x + rx * 0.2 + 6, y - 14, E_ + W_);
    b.ellipse(x - rx * 0.55, y - 10, 6, 5, LM_); b.ring(x - rx * 0.55, y - 10, 6, 5, M_);
    b.ring(x + rx * 0.5, y - ry - 6, 6, 2, E_ + LM_); b.put(x + rx * 0.5, y - ry - 6, E_ + W_);
    return { door: { x: x, y: y, w: Math.max(9, w * 0.2 | 0), h: Math.round(ry * 0.45), arch: 1 }, sign: { x: x, y: y - Math.round(ry * 0.72), w: Math.round(w * 0.72) } };
  }
  var r = Math.round(w * 0.42), cy = y - r, nh = Math.round(h * 0.34), nw = Math.max(8, w * 0.26 | 0);
  b.rect(x - nw / 2, y - 2 * r - nh + 4, nw, nh, [LC_, W_, 6]); b.rect(x - nw / 2 - 1, y - 2 * r - nh + 1, nw + 2, 3, N_);
  b.ellipse(x, cy, r, r, [LC_, W_, 6]); b.ellipse(x, cy + r * 0.3, r * 0.92, r * 0.7, c); b.rect(x - r, cy + r * 0.1, r * 2, 2, W_);
  for (i = 0; i < 5; i++) b.put(x - r * 0.6 + i * r * 0.3, cy + r * 0.2 + (i * 5 % 7), W_);
  b.ring(x, y - 2 * r - nh - 6, 7, 3, E_ + LM_); b.ring(x, y - 2 * r - nh - 6, 3, 7, E_ + LC_);
  return { door: { x: x, y: y, w: Math.max(9, r * 0.5 | 0), h: Math.round(r * 0.8), arch: 1 }, sign: { x: x, y: y - r * 1.35, w: Math.round(r * 1.6) } };
};
/* Halcyra: gas-bag houses tethered over the cloud deck */
SC.K.float = function (b, o) {
  var T = o.T, x = o.ox, y = o.oy, w = o.w, h = o.h, c = T.w[o.k % 3], i, gy = y - 10;
  var ch = Math.round(h * 0.34), cw = Math.round(w * 0.62);
  b.ellipse(x - w * 0.34, y - 1, 12, 4, W_); b.ellipse(x + w * 0.3, y - 1, 14, 5, W_); b.ellipse(x, y, w * 0.34, 5, [W_, LC_, 3]);
  if (o.v === 0) {
    var rx = Math.round(w * 0.46), ry = Math.round(h * 0.34), cy = y - h + ry;
    b.ellipse(x, cy, rx, ry, c); for (i = -3; i <= 3; i++) { var f = i / 3.4, hh = ry * Math.sqrt(1 - f * f); b.vline(Math.round(x + f * rx), Math.round(cy - hh + 1), Math.round(hh * 2 - 1), i % 2 ? [c, T.w[(o.k + 1) % 3], 16] : [c, W_, 5]); }
    b.ellipse(x - rx * 0.3, cy - ry * 0.35, rx * 0.25, ry * 0.2, [c, W_, 8]); b.line(x - cw / 2, y - ch - 10, x - rx * 0.55, cy + ry * 0.6, N_); b.line(x + cw / 2, y - ch - 10, x + rx * 0.55, cy + ry * 0.6, N_);
    SC.shBox(b, x - cw / 2, y - ch - 10, cw, ch, T.w[(o.k + 2) % 3], T.dk, W_); b.rect(x - cw / 2 - 2, y - ch - 12, cw + 4, 3, T.rf);
    SC.win(b, x - cw / 2 + 4, y - ch - 5, 5, 5, o.lit); SC.win(b, x + cw / 2 - 9, y - ch - 5, 5, 5, o.lit);
    b.line(x - 2, y - 10, x - 3, y - 1, N_); b.line(x + 2, y - 10, x + 3, y - 1, N_);
    return { door: { x: x, y: y - 10, w: Math.max(8, cw * 0.22 | 0), h: Math.round(ch * 0.62), arch: 1 }, sign: { x: x, y: Math.round(cy - 3), w: Math.round(rx * 1.5) } };
  }
  var bw = Math.round(w * 0.8), cy2 = y - ch - 14;
  [-0.3, 0, 0.3].forEach(function (f, n) { var bx = Math.round(x + f * w), by = y - h + 8 + (n === 1 ? -3 : 3); b.ellipse(bx, by, 9, 11, [c, T.w[(o.k + n) % 3], n === 1 ? 16 : 5]); b.ellipse(bx - 2, by - 3, 3, 4, [c, W_, 8]); b.line(bx, by + 11, x + f * bw * 0.3, cy2 - 2, N_); });
  SC.shBox(b, x - bw / 2, y - ch - 10, bw, ch, T.w[(o.k + 2) % 3], T.dk, W_); b.poly([[x - bw / 2 - 4, y - ch - 9], [x + bw / 2 + 4, y - ch - 9], [x + bw / 2 - 2, y - ch - 17], [x - bw / 2 + 2, y - ch - 17]], T.rf);
  SC.win(b, x - bw / 2 + 4, y - ch - 5, 5, 5, o.lit); SC.win(b, x + bw / 2 - 9, y - ch - 5, 5, 5, o.lit); b.line(x - 2, y - 10, x - 3, y - 1, N_); b.line(x + 2, y - 10, x + 3, y - 1, N_);
  return { door: { x: x, y: y - 10, w: Math.max(8, bw * 0.2 | 0), h: Math.round(ch * 0.62), arch: 0 }, sign: { x: x, y: y - ch - 26 + 14, w: Math.round(bw * 0.8) } };
};

/* ---------- what each shop adds to its front ---------- */
SC.PROP = {
  market: function (b, o, i) { var x = o.ox, y = o.oy; [-1, 1].forEach(function (s, n) { var cx = x + s * Math.round(o.w * 0.42); b.rect(cx - 5, y - 8, 11, 8, N_); b.rect(cx - 5, y - 4, 11, 1, K_); [[-3, LR_], [0, Y_], [3, LG_]].forEach(function (p) { b.rect(cx + p[0] - 1, y - 11, 3, 3, p[1]); }); }); },
  bank: function (b, o, i) { var x = o.ox, y = o.oy, px = x + Math.round(o.w * 0.4); b.ellipse(px, y - 2, 5, 2, Y_); b.ellipse(px, y - 4, 5, 2, Y_); b.ellipse(px, y - 6, 5, 2, [Y_, W_, 6]); b.put(px - 2, y - 6, K_); b.vline(x - Math.round(o.w * 0.5), y - 18, 18, W_); b.rect(x - Math.round(o.w * 0.5) + 1, y - 18, 7, 4, E_ + LM_); },
  cantina: function (b, o, i) { var x = o.ox, y = o.oy, mx = x - Math.round(o.w * 0.5) + 3, my = y - Math.round(o.h * 0.55); b.rect(mx, my, 8, 9, E_ + LM_); b.rect(mx + 1, my + 2, 6, 6, K_); b.rect(mx + 1, my, 6, 2, E_ + W_); b.rect(mx + 8, my + 2, 3, 5, E_ + LM_); b.rect(mx + 9, my + 3, 1, 3, K_); b.ellipse(x + Math.round(o.w * 0.44), y - 5, 5, 6, N_); b.hline(x + Math.round(o.w * 0.44) - 5, y - 6, 10, K_); },
  yard: function (b, o, i) { var x = o.ox, y = o.oy, cx = x + Math.round(o.w * 0.5) + 3; b.vline(cx, y - 30, 30, Y_); b.hline(cx - 14, y - 30, 15, Y_); b.vline(cx - 14, y - 30, 8, L_); b.rect(cx - 17, y - 22, 7, 5, D_); b.rect(x - Math.round(o.w * 0.5) - 2, y - 5, 9, 5, L_); },
  fuel: function (b, o, i) { var x = o.ox, y = o.oy; [-1, 1].forEach(function (s) { var cx = x + s * Math.round(o.w * 0.5) + (s > 0 ? 6 : -6); b.rect(cx - 3, y - 15, 7, 15, LR_); b.rect(cx - 2, y - 13, 5, 4, LC_); b.rect(cx - 3, y - 15, 7, 1, W_); b.line(cx + 4, y - 11, cx + 8, y - 6, K_); }); b.rect(x - 14, y - 2, 28, 2, [Y_, K_, 8]); },
  office: function (b, o, i) { var x = o.ox, y = o.oy, px = x + Math.round(o.w * 0.5) + 6; b.vline(px, y - 22, 22, N_); b.rect(px - 8, y - 26, 17, 11, W_); b.box(px - 8, y - 26, 17, 11, K_); b.text(px - 7, y - 24, 'SALE', R_, 1); b.poly([[px - 5, y - 18], [px, y - 22], [px + 5, y - 18]], LR_); },
  parlour: function (b, o, i) { var x = o.ox, y = o.oy, k; for (k = 0; k < o.w; k += 4) { b.put(x - o.w / 2 + k, y - o.h + 1, E_ + (k % 8 ? LR_ : Y_)); b.put(x - o.w / 2 + k, y - 1, E_ + (k % 8 ? Y_ : LR_)); }},
  decor: function (b, o, i) { var x = o.ox, y = o.oy; b.line(x - Math.round(o.w * 0.5), y - Math.round(o.h * 0.4), x + Math.round(o.w * 0.5), y - Math.round(o.h * 0.5), L_); b.rect(x - 8, y - Math.round(o.h * 0.4), 4, 6, LR_); b.rect(x + 2, y - Math.round(o.h * 0.44), 4, 6, W_); }
};
SC.ROLEK = { market: 0, bank: 1, cantina: 2, yard: 3, fuel: 4, office: 5, parlour: 6, decor: 7 };

/* Draw one building into its own buffer. Returns the buffer with the door and sign positions. */
SC.ROLEWORD = { market: ['MARKET', 'SHOP'], bank: ['BANK'], cantina: ['CANTINA', 'BAR'], yard: ['SHIPYARD', 'YARD'], fuel: ['FUEL DOCK', 'FUEL'], office: ['REAL ESTATE', 'REALTY', 'SALES'], parlour: ['PARLOUR', 'CARDS'], decor: [] };
SC.fit = function (list, w) { for (var i = 0; i < list.length; i++) if (PX.textW(list[i]) <= w - 3) return list[i]; return list[list.length - 1]; };
SC.build = function (T, role, w, h, o2) {
  o2 = o2 || {};
  var W = w + 34, H = h + 46, bb = SC.newB(W, H), o = { T: T, ox: W >> 1, oy: H - 3, w: w, h: h, k: SC.ROLEK[role] || 0, v: (SC.ROLEK[role] || 0) % 2, lit: !!o2.lit }, info;
  info = SC.K[T.style](bb, o);
  if (o2.closed) {
    SC.door(bb, info.door.x, info.door.y, info.door.w, info.door.h, info.door.arch, K_);
    for (var k = 0; k < 3; k++) bb.line(info.door.x - info.door.w / 2 - 2, info.door.y - 4 - k * 5, info.door.x + info.door.w / 2 + 2, info.door.y - 9 - k * 5, N_);
    SC.sign(bb, info.sign.x, info.sign.y, info.sign.w, SC.fit(['CLOSED', 'SHUT'], info.sign.w), R_, W_);
  } else {
    SC.door(bb, info.door.x, info.door.y, info.door.w, info.door.h, info.door.arch);
    if (role !== 'decor') SC.sign(bb, info.sign.x, info.sign.y, info.sign.w, SC.fit([o2.text || ''].concat(SC.ROLEWORD[role]).filter(Boolean), info.sign.w), T.tr, [Y_, W_, LC_, LM_, LG_, LR_, LB_].indexOf(T.tr) >= 0 ? K_ : W_);
    if (SC.PROP[role]) SC.PROP[role](bb, o, info);
  }
  SC.outline(bb);
  return { b: bb, ox: o.ox, oy: o.oy, door: info.door, sign: info.sign };
};
