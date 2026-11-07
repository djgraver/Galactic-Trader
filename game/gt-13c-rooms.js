/* Galactic Trader 3. Part 13c: shop interiors, item and HUD icons, planets and the star map. All EGA pixels. */
SC.RW = 320; SC.RH = 96;
SC.rcache = {};
SC.room = function (kind, pid, night) {
  var key = kind + '/' + pid + '/' + (night ? 1 : 0); if (SC.rcache[key]) return SC.rcache[key];
  var T = SC.TH[pid], b = new PX.Buf(SC.RW, SC.RH), i, j, x, y, rnd = SC.rnd('room' + key);
  var wall = { market: T.w[1], bank: W_, yard: L_, fuel: T.w[2], cantina: M_, alley: D_, office: T.w[0], parlour: R_, jobs: N_, cell: T.w[1] }[kind] || T.w[1];
  if (T.style === 'hull' && kind !== 'alley') wall = D_;
  b.rect(0, 0, 320, 66, [wall, K_, 3]); b.rect(0, 40, 320, 26, [wall, K_, 6]);
  for (i = 0; i < 320; i += 16) b.vline(i, 0, 66, [wall, K_, 7]);
  b.rect(0, 0, 320, 6, T.dk === K_ ? D_ : T.dk); b.hline(0, 6, 320, K_); for (i = 12; i < 320; i += 48) { b.rect(i, 6, 6, 3, K_); b.rect(i - 1, 9, 8, 3, E_ + Y_); }
  /* perspective floor */
  b.rect(0, 66, 320, 30, [T.road[0] === K_ ? D_ : T.road[0], K_, 5]); b.hline(0, 66, 320, K_);
  for (j = 0; j < 4; j++) b.hline(0, 70 + j * j * 2 + j * 3, 320, [K_, T.road[0], 8]);
  for (i = -6; i <= 6; i++) b.line(160 + i * 6, 66, 160 + i * 34, 96, [K_, T.road[0], 8]);
  /* window with the planet's own sky */
  var wx = 262, wy = 14;
  if (kind !== 'alley' && kind !== 'parlour') { b.rect(wx - 2, wy - 2, 44, 38, K_); for (y = 0; y < 34; y++) b.hline(wx, wy + y, 40, night ? [K_, B_, y >> 2] : [T.sky[0], T.sky[1], Math.round(y / 34 * (T.sky[2] || 16))]); if (night) for (i = 0; i < 8; i++) b.put(wx + (i * 13) % 40, wy + (i * 7) % 30, E_ + W_); b.vline(wx + 20, wy, 34, K_); b.hline(wx, wy + 17, 40, K_); }
  var F = {
    market: function () { for (i = 0; i < 2; i++) { var sx = i ? 214 : 6; for (j = 0; j < 3; j++) { b.rect(sx, 16 + j * 16, 44, 3, N_); for (x = 0; x < 6; x++) { b.rect(sx + 3 + x * 7, 8 + j * 16, 6, 8, [[LR_, R_], [Y_, N_], [LG_, G_], [LM_, M_], [LC_, C_]][(x + j + i) % 5]); b.rect(sx + 3 + x * 7, 8 + j * 16, 6, 1, W_); } } }
      b.rect(96, 60, 128, 36, N_); b.rect(96, 60, 128, 3, Y_); b.hline(96, 63, 128, K_); for (i = 0; i < 128; i += 8) b.vline(96 + i, 64, 32, [K_, N_, 8]); b.rect(190, 52, 16, 8, L_); b.ellipse(198, 50, 4, 3, W_); b.rect(128, 14, 56, 10, K_); b.text(133, 16, 'WE ARE OPEN', E_ + Y_, 1); },
    bank: function () { [10, 70, 230, 290].forEach(function (cx) { b.rect(cx - 7, 12, 14, 54, W_); b.rect(cx + 2, 12, 5, 54, [W_, L_, 8]); b.rect(cx - 10, 8, 20, 5, W_); b.rect(cx - 10, 62, 20, 5, W_); b.box(cx - 10, 8, 20, 5, K_); b.box(cx - 10, 62, 20, 5, K_); b.vline(cx - 7, 13, 49, K_); b.vline(cx + 6, 13, 49, K_); });
      b.ellipse(160, 36, 26, 26, K_); b.ellipse(160, 36, 24, 24, L_); b.ellipse(160, 36, 20, 20, [L_, D_, 6]); b.ellipse(160, 36, 7, 7, Y_); for (i = 0; i < 6; i++) b.line(160, 36, 160 + Math.cos(i * 1.047) * 18, 36 + Math.sin(i * 1.047) * 18, Y_); b.ring(160, 36, 15, 15, D_);
      b.rect(96, 62, 128, 34, N_); b.rect(96, 62, 128, 3, Y_); for (i = 0; i < 128; i += 5) b.vline(96 + i, 65, 31, [K_, N_, 6]); for (i = 0; i < 3; i++) { b.rect(104 + i * 6, 56 - i * 3, 14, 5, Y_); b.hline(104 + i * 6, 56 - i * 3, 14, W_); } },
    yard: function () { b.ellipse(90, 52, 70, 20, [D_, L_, 6]); b.poly([[24, 52], [130, 28], [158, 52]], L_); b.ellipse(120, 38, 12, 5, E_ + LC_); b.rect(20, 50, 100, 6, D_); b.rect(236, 10, 4, 56, Y_); b.hline(170, 10, 70, Y_); b.vline(176, 10, 14, L_); b.rect(170, 24, 14, 10, D_); b.box(170, 24, 14, 10, K_);
      for (i = 0; i < 6; i++) { b.line(200 + i * 5, 46, 205 + i * 5, 60, L_); b.rect(198 + i * 5, 44, 3, 3, W_); } b.rect(150, 62, 90, 34, N_); b.rect(150, 62, 90, 3, Y_); b.rect(170, 52, 30, 10, D_); b.rect(176, 48, 10, 4, L_); b.put(198, 46, E_ + Y_); b.put(204, 49, E_ + LR_); },
    fuel: function () { [34, 90, 146].forEach(function (cx, n) { var c = [[LR_, R_], [Y_, N_], [LC_, C_]][n]; b.rect(cx - 16, 14, 32, 48, c[0]); b.rect(cx + 6, 14, 10, 48, [c[0], c[1], 8]); b.ellipse(cx, 14, 16, 4, c[0]); b.ellipse(cx, 62, 16, 4, c[1]); b.box(cx - 16, 14, 32, 48, K_); b.rect(cx - 8, 28, 16, 10, K_); b.rect(cx - 6, 30, 12, 6, E_ + LG_); b.rect(cx - 6, 44, 12, 3, K_); });
      b.rect(200, 22, 46, 44, LR_); b.box(200, 22, 46, 44, K_); b.rect(206, 28, 34, 14, K_); b.rect(208, 30, 30, 10, E_ + LG_); b.text(210, 32, '1.5C', K_, 1); b.line(246, 40, 262, 56, K_); b.line(247, 40, 263, 56, K_); b.rect(0, 90, 320, 6, Y_); for (i = 0; i < 320; i += 12) b.poly([[i, 90], [i + 6, 90], [i + 12, 96], [i + 6, 96]], K_); },
    cantina: function () { for (i = 0; i < 12; i++) { var c = [LG_, LR_, Y_, LC_, LM_][i % 5]; b.rect(10 + i * 24, 20, 7, 14, c); b.rect(12 + i * 24, 14, 3, 7, c); b.put(11 + i * 24, 22, W_); } b.rect(0, 36, 320, 3, N_); b.rect(0, 39, 320, 20, [N_, K_, 6]);
      b.rect(0, 62, 320, 34, N_); b.rect(0, 62, 320, 4, Y_); b.hline(0, 66, 320, K_); for (i = 0; i < 320; i += 6) b.vline(i, 67, 29, [K_, N_, 6]); for (i = 0; i < 5; i++) { b.rect(24 + i * 62, 54, 10, 3, D_); b.vline(28 + i * 62, 57, 8, D_); }
      b.ellipse(160, 20, 6, 6, E_ + W_); for (i = 0; i < 8; i++) b.put(160 + Math.cos(i * 0.785) * 10, 20 + Math.sin(i * 0.785) * 10, E_ + LM_); b.rect(30, 44, 20, 12, K_); b.text(33, 47, 'BAR', E_ + LM_, 1); },
    alley: function () { for (i = 0; i < 2; i++) { var sx = i ? 250 : 0; b.rect(sx, 0, 70, 66, [D_, R_, 6]); for (j = 0; j < 66; j += 7) { b.hline(sx, j, 70, K_); for (x = (j / 7 % 2) * 6; x < 70; x += 12) b.vline(sx + x, j, 7, K_); } }
      b.rect(70, 0, 180, 66, K_); for (i = 0; i < 30; i++) b.put(70 + rnd() * 180, rnd() * 60, [D_, B_, E_ + W_][(rnd() * 3) | 0]); b.rect(96, 44, 38, 22, G_); b.rect(94, 40, 42, 5, LG_); b.box(94, 40, 42, 26, K_); b.rect(190, 50, 30, 16, L_); b.rect(188, 46, 34, 5, W_); b.box(188, 46, 34, 20, K_);
      b.rect(160, 8, 18, 14, K_); b.text(164, 11, '?', E_ + LM_, 1); b.vline(60, 0, 66, [L_, D_, 8]); b.vline(63, 0, 66, [L_, D_, 8]); for (i = 0; i < 5; i++) b.ellipse(150 + i * 4, 40 - i * 6, 4 + i, 3, [W_, D_, 5 + i]); b.put(150, 56, E_ + Y_); b.put(155, 56, E_ + Y_); },
    office: function () { for (i = 0; i < 5; i++) { var fx = 8 + i * 50; b.rect(fx, 12, 44, 34, W_); b.box(fx, 12, 44, 34, K_); b.rect(fx + 3, 15, 38, 20, [T.sky[0], T.sky[1], 7]); var hc = [LR_, Y_, LG_, LM_, LC_][i]; b.rect(fx + 12, 24, 20, 11, hc); b.poly([[fx + 9, 24], [fx + 22, 15], [fx + 35, 24]], [hc, K_, 5]); b.rect(fx + 19, 28, 6, 7, K_); b.text(fx + 8, 37, (i * 7 + 3) + '0K', K_, 1); if (i === 2) b.text(fx + 10, 20, 'SOLD', R_, 1); }
      b.rect(96, 60, 128, 36, N_); b.rect(96, 60, 128, 3, W_); b.rect(110, 48, 10, 12, LG_); b.rect(112, 44, 6, 5, G_); b.rect(180, 52, 30, 8, W_); b.text(182, 53, 'SOLD', R_, 1); for (i = 0; i < 4; i++) { b.vline(150 + i * 6, 48, 10, Y_); b.put(150 + i * 6, 58, W_); } },
    parlour: function () { for (i = 0; i < 2; i++) { var cx = i ? 290 : 30; b.rect(cx - 30, 0, 60, 66, [R_, K_, 3]); for (j = -28; j < 30; j += 8) b.vline(cx + j, 0, 66, [R_, K_, 9]); b.rect(cx - 30, 0, 60, 8, Y_); }
      b.ellipse(160, 64, 70, 16, K_); b.ellipse(160, 62, 68, 14, G_); b.ellipse(160, 62, 52, 10, [G_, LG_, 4]); b.ellipse(160, 56, 16, 6, K_); b.ellipse(160, 55, 14, 5, Y_); b.ring(160, 55, 9, 3, R_); b.ring(160, 55, 4, 1, K_);
      for (i = 0; i < 9; i++) b.put(100 + i * 15, 20 + Math.sin(i) * 3, E_ + (i % 2 ? Y_ : LR_)); b.line(160, 6, 160, 18, Y_); b.ellipse(160, 20, 14, 5, E_ + Y_); for (i = 0; i < 5; i++) b.put(150 + i * 5, 25, E_ + W_); b.text(120, 30, 'THIN HOURS', E_ + LR_, 1); },
    jobs: function () { b.rect(20, 10, 280, 52, N_); b.box(20, 10, 280, 52, K_); for (i = 0; i < 16; i++) { var c = [W_, Y_, LR_, LC_, LG_][i % 5]; b.rect(26 + i * 17, 16 + (i * 7 % 3) * 14, 13, 16, c); b.hline(29 + i * 17, 20 + (i * 7 % 3) * 14, 7, K_); b.hline(29 + i * 17, 24 + (i * 7 % 3) * 14, 5, K_); b.put(32 + i * 17, 15 + (i * 7 % 3) * 14, E_ + LR_); }
      b.rect(96, 62, 128, 34, N_); b.rect(96, 62, 128, 3, Y_); for (i = 0; i < 4; i++) { b.rect(8 + i * 8, 76 - i * 4, 18, 12, N_); b.box(8 + i * 8, 76 - i * 4, 18, 12, K_); } }
  };
  (F[kind] || F.market)();
  var cv = document.createElement('canvas'); b.paint(cv, night); return (SC.rcache[key] = cv.toDataURL());
};

/* ---------- pixel icons ---------- */
SC.icache = {};
SC.icon = function (key, w, h, draw) { if (SC.icache[key]) return SC.icache[key]; var b = SC.newB(w, h); draw(b); SC.outline(b); var o = new PX.Buf(w, h); o.d.fill(0); var cv = document.createElement('canvas'); cv.width = w; cv.height = h; var cx = cv.getContext('2d'), im = cx.createImageData(w, h); for (var i = 0; i < b.d.length; i++) { var v = b.d[i]; if (v === 255) { im.data[i * 4 + 3] = 0; continue; } v &= 15; var r = PX.RGB[v]; im.data[i * 4] = r[0]; im.data[i * 4 + 1] = r[1]; im.data[i * 4 + 2] = r[2]; im.data[i * 4 + 3] = 255; } cx.putImageData(im, 0, 0); return (SC.icache[key] = cv.toDataURL()); };
UI.itemIcon = function (i, cls) {
  var D = [
    function (b) { b.rect(3, 4, 10, 10, W_); b.rect(3, 7, 10, 4, LR_); b.rect(11, 4, 2, 10, [W_, L_, 8]); b.ellipse(8, 4, 5, 2, L_); },
    function (b) { b.poly([[1, 13], [15, 13], [12, 7], [4, 7]], L_); b.poly([[4, 7], [12, 7], [10, 3], [6, 3]], W_); b.hline(4, 10, 6, W_); b.rect(12, 8, 3, 5, [L_, D_, 8]); },
    function (b) { b.rect(2, 4, 12, 10, W_); b.rect(7, 6, 2, 6, R_); b.rect(5, 8, 6, 2, R_); b.rect(5, 2, 6, 3, LG_); },
    function (b) { b.rect(4, 2, 8, 3, N_); b.poly([[3, 5], [13, 5], [12, 14], [4, 14]], LR_); b.put(6, 9, Y_); b.put(9, 11, W_); b.put(10, 8, Y_); b.vline(4, 6, 7, [LR_, W_, 8]); },
    function (b) { b.rect(3, 3, 10, 10, G_); b.rect(5, 5, 6, 6, K_); b.put(8, 8, E_ + LG_); for (var k = 4; k < 13; k += 3) { b.put(1, k, L_); b.put(2, k, L_); b.put(13, k, L_); b.put(14, k, L_); } },
    function (b) { b.ellipse(8, 9, 6, 6, M_); b.ellipse(7, 8, 3, 3, LM_); b.put(8, 9, K_); b.put(13, 2, W_); b.put(2, 4, Y_); b.rect(7, 1, 3, 2, L_); },
    function (b) { b.poly([[4, 2], [12, 2], [11, 5], [13, 9], [11, 14], [5, 14], [3, 9], [5, 5]], Y_); b.rect(6, 7, 4, 3, R_); b.vline(5, 5, 8, [Y_, W_, 8]); }
  ];
  return '<img class="px itemicon ' + (cls || '') + '" src="' + SC.icon('item' + i, 16, 16, D[i]) + '" width="16" height="16" alt="">';
};
UI.icon = function (k) {
  var D = { coin: function (b) { b.ellipse(5, 5, 4, 4, Y_); b.put(4, 3, W_); b.vline(5, 3, 5, N_); }, fuel: function (b) { b.rect(1, 2, 6, 8, LR_); b.rect(2, 3, 4, 2, W_); b.line(7, 4, 9, 6, K_); b.vline(9, 6, 3, K_); }, crate: function (b) { b.rect(1, 2, 9, 8, N_); b.hline(1, 6, 9, K_); b.vline(5, 2, 8, K_); }, star: function (b) { b.poly([[5, 0], [6, 4], [10, 4], [7, 6], [8, 10], [5, 8], [2, 10], [3, 6], [0, 4], [4, 4]], Y_); } };
  return '<img class="px hicon" src="' + SC.icon('hud' + k, 11, 11, D[k]) + '" width="11" height="11" alt="">';
};
UI.shipPix = function (id, hue, w, cls) { return PIX.img(UI.shipSVG(id, hue), w, Math.round(w * 140 / 240), 'shipimg ' + (cls || ''), {}); };

/* ---------- planets as dithered discs ---------- */
SC.DISC = { meridoa: [LG_, G_], karthosu: [Y_, N_], ferrox: [LR_, R_], kryndor: [LC_, B_], nihil: [LM_, M_], quellin: [LM_, W_], halcyra: [Y_, LR_] };
SC.disc = function (b, cx, cy, r, p) {
  var c = SC.DISC[p.id], k, a, rnd = SC.rnd(p.id + r);
  if (p.ring) b.ring(cx, cy, r + 6, Math.max(2, r * 0.28), c[0]);
  b.ellipse(cx, cy, r + 1, r + 1, K_); b.ellipse(cx, cy, r, r, c[1]); b.ellipse(cx - r * 0.16, cy - r * 0.16, r * 0.84, r * 0.84, [c[0], c[1], 5]); b.ellipse(cx - r * 0.3, cy - r * 0.32, r * 0.4, r * 0.38, [c[0], W_, 6]);
  if (p.type === 'Gas Giant') for (k = -2; k <= 2; k++) b.hline(cx - r + 1 + Math.abs(k), cy + k * r * 0.3, 2 * r - 2 - 2 * Math.abs(k), [c[1], W_, k % 2 ? 6 : 3]);
  else if (p.type === 'Mining' || p.type === 'Ruin') for (k = 0; k < 4; k++) { a = rnd() * 6.28; b.ellipse(cx + Math.cos(a) * r * 0.5, cy + Math.sin(a) * r * 0.5, Math.max(1, r * 0.14), Math.max(1, r * 0.1), c[1]); }
  else if (p.type === 'Megacity') for (k = -2; k <= 2; k++) { b.hline(cx - r * 0.6, cy + k * r * 0.3, r * 1.2, [c[0], W_, 8]); b.vline(cx + k * r * 0.3, cy - r * 0.6, r * 1.2, [c[0], W_, 8]); }
  else if (p.type === 'Void Station') { b.ellipse(cx, cy, r, r, K_); b.ring(cx, cy, r - 2, r - 2, c[0]); b.ring(cx, cy, r * 0.5, r * 0.5, c[1]); for (k = 0; k < 8; k++) b.line(cx, cy, cx + Math.cos(k * 0.785) * (r - 2), cy + Math.sin(k * 0.785) * (r - 2), c[1]); }
  else if (p.type === 'Agrarian') for (k = 0; k < 8; k++) b.rect(cx - r * 0.6 + (k * 5) % (r * 1.2), cy - r * 0.6 + (k * 7) % (r * 1.2), 3, 2, k % 2 ? Y_ : G_);
  if (p.ring) b.ring(cx, cy, r + 6, Math.max(2, r * 0.28), c[0]);
};

/* ---------- the star map: black and starry, pixel planets, clickable ---------- */
SC.MW = 320; SC.MH = 192;
SC.mx = function (x) { return Math.round(16 + x * 2.9); };
SC.my = function (y) { return Math.round(18 + y * 2.5); };
SC.mapBuf = function (s, dest) {
  var P = GT.PLANETS, b = new PX.Buf(SC.MW, SC.MH), rnd = SC.rnd('map'), k;
  b.clear(K_); for (k = 0; k < 160; k++) b.put(rnd() * SC.MW, rnd() * SC.MH, rnd() < 0.12 ? W_ : rnd() < 0.3 ? L_ : D_);
  if (dest !== null && dest !== s.loc) { var A = P[s.loc], B = P[dest], n = 40; for (k = 0; k <= n; k += 2) b.put(SC.mx(A.x) + (SC.mx(B.x) - SC.mx(A.x)) * k / n, SC.my(A.y) + (SC.my(B.y) - SC.my(A.y)) * k / n, Y_); }
  P.forEach(function (p, i) {
    var x = SC.mx(p.x), y = SC.my(p.y), here = i === s.loc, sel = i === dest, r = here ? 11 : 8;
    SC.disc(b, x, y, r, p);
    if (here) { b.ring(x, y, r + 5, r + 5, LC_); b.ring(x, y, r + 6, r + 6, [LC_, K_, 8]); }
    if (sel) b.ring(x, y, r + 5, r + 5, [Y_, K_, 8]);
    var nm = p.name.toUpperCase(), tw = PX.textW(nm); b.text(Math.round(x - tw / 2), y + r + (here || sel ? 8 : 5), nm, here ? LC_ : sel ? Y_ : L_, 1);
    s.comps.forEach(function (cp, ci) { if (cp.loc === i) { var rx = x + r + 2 + ci * 6, ry = y - r - 2; b.poly([[rx + 2, ry - 2], [rx + 4, ry], [rx + 2, ry + 2], [rx, ry]], E_ + LR_); } });
  });
  b.text(6, 4, 'STAR MAP', LC_, 1);
  return b;
};
UI.mapHTML = function (s, dest) {
  var b = SC.mapBuf(s, dest), cv = document.createElement('canvas'); b.paint(cv, false);
  var h = '<div class="scene2 mapbox"><img class="px scenepix" src="' + cv.toDataURL() + '" alt="Star map" width="' + SC.MW + '" height="' + SC.MH + '"><svg class="hsl" viewBox="0 0 ' + SC.MW + ' ' + SC.MH + '" role="group" aria-label="Star map">';
  GT.PLANETS.forEach(function (p, i) { h += '<g class="pl" data-i="' + i + '" tabindex="0" role="button" aria-label="' + esc(p.name) + (i === s.loc ? ', current location' : i === dest ? ', selected destination' : '') + '" data-label="' + esc(p.name) + ': ' + esc(p.type) + '"><circle cx="' + SC.mx(p.x) + '" cy="' + SC.my(p.y) + '" r="17"/></g>'; });
  return h + '</svg></div>';
};
