/* Galactic Trader Deluxe. Part 23: shop banners, planet balls and the star map, all in EGA pixels. */
/* a colour set per world: light, dark, detail */
PX.PCOL = { meridoa: [PX.LG, PX.G, PX.Y], karthosu: [PX.Y, PX.N, PX.R], ferrox: [PX.LR, PX.R, PX.D], kryndor: [PX.LB, PX.B, PX.LM], nihil: [PX.LM, PX.M, PX.K], quellin: [PX.W, PX.LC, PX.LM], halcyra: [PX.Y, PX.LR, PX.W] };
/* a shaded planet with the features of its type */
PX.ball = function (B, cx, cy, r, pid, type, ring) {
  var c = PX.PCOL[pid] || [PX.LC, PX.B, PX.W], x, y;
  if (ring) { B.ring(cx, cy, r * 1.9, r * 0.45, c[2]); B.ring(cx, cy, r * 1.9 + 1, r * 0.45 + 1, c[1]); }
  if (type === 'Void Station') { B.ell(cx, cy, r, r, PX.K); B.ring(cx, cy, r - 1, r - 1, c[0]); B.ring(cx, cy, r - 3, r - 3, c[1]); B.line(cx - r + 2, cy, cx + r - 2, cy, c[0]); B.line(cx, cy - r + 2, cx, cy + r - 2, c[0]); B.ell(cx, cy, Math.max(2, r / 4), Math.max(2, r / 4), c[0]); return; }
  B.ell(cx, cy, r, r, PX.K);
  for (y = -r + 1; y < r; y++) for (x = -r + 1; x < r; x++) {
    if (x * x + y * y > (r - 1) * (r - 1)) continue; var lit = (x * 0.7 + y * 0.7) / r, t = (lit + 1) * 8;
    B.px(cx + x, cy + y, PX.BAYER[((cy + y) & 3) * 4 + ((cx + x) & 3)] < t ? c[1] : c[0]);
    if (type === 'Gas Giant' && ((y + r) >> 2) % 2 === 1 && PX.BAYER[((cy + y) & 3) * 4 + ((cx + x) & 3)] < 10) B.px(cx + x, cy + y, c[2]);
    if (type === 'Agrarian' && ((x * 3 + y * 5 + r * 7) % 11) < 3 && PX.BAYER[((cy + y) & 3) * 4 + ((cx + x) & 3)] < 12) B.px(cx + x, cy + y, c[2]);
    if (type === 'Mining' && ((x * 5 + y * 3) % 13) === 0) B.px(cx + x, cy + y, c[2]);
    if (type === 'Megacity' && (x % 5 === 0 || y % 5 === 0) && PX.BAYER[((cy + y) & 3) * 4 + ((cx + x) & 3)] < 8) B.px(cx + x, cy + y, c[2]);
    if (type === 'Science' && ((x * 7 + y * 11) % 17) < 2) B.px(cx + x, cy + y, c[2]);
    if (type === 'Ruin' && Math.abs(Math.hypot(x, y) - r * 0.55) < 0.8 && (x + y) % 3) B.px(cx + x, cy + y, c[2]);
  }
  B.ell(cx - r * 0.35, cy - r * 0.4, Math.max(1, r * 0.2), Math.max(1, r * 0.12), PX.W);
  if (ring) { for (x = -Math.round(r * 1.9); x <= r * 1.9; x++) { var yy = Math.round(Math.sqrt(Math.max(0, 1 - x * x / (r * 1.9 * r * 1.9))) * r * 0.45); if (yy > 0 && Math.abs(x) < r + 2) { B.px(cx + x, cy + yy, c[2]); B.px(cx + x, cy + yy + 1, c[1]); } } }
};
PX.planetPic = function (p, w, h) {
  var key = 'pp/' + p.id + w, B = new PX.Buf(w, h), rnd = GT.seeded(CH.hash(p.id)), i; B.rect(0, 0, w, h, PX.K);
  for (i = 0; i < w * h / 70; i++) B.px(Math.floor(rnd() * w), Math.floor(rnd() * h), rnd() < 0.2 ? PX.W : PX.L);
  PX.ball(B, Math.round(w / 2), Math.round(h / 2), Math.round(h * 0.34), p.id, p.type, p.ring); return { buf: B, key: key };
};
UI.drawPlanet = function (cv, p) { var pp = PX.planetPic(p, 160, 90), c = PX.render(pp.buf, false, 1); cv.width = 160; cv.height = 90; cv.getContext('2d').drawImage(c, 0, 0); cv.style.imageRendering = 'pixelated'; };

/* ---------- shop banners ---------- */
SC.RK = {
  market: function (B, th) { var i; for (i = 0; i < 5; i++) { B.rect(8 + i * 20, 36, 16, 14, PX.N); B.rect(8 + i * 20, 36, 16, 2, PX.Y); B.ell(16 + i * 20, 32, 6, 4, [PX.LR, PX.Y, PX.LG, PX.LM, PX.LC][i]); }
    for (i = 0; i < 4; i++) { B.rect(226 + i * 20, 36, 16, 14, PX.N); B.rect(226 + i * 20, 36, 16, 2, PX.Y); B.ell(234 + i * 20, 32, 6, 4, [PX.Y, PX.LG, PX.LR, PX.W][i]); }
    for (i = 0; i < 16; i++) B.rect(i * 20, 3, 10, 6, i % 2 ? PX.W : PX.R); },
  bank: function (B, th) { var i; [14, 34, 54, 250, 270, 290].forEach(function (x) { B.rect(x, 4, 8, 40, PX.W); B.rect(x - 2, 4, 12, 3, PX.L); B.rect(x - 2, 42, 12, 3, PX.L); B.rect(x + 6, 7, 2, 35, PX.L); });
    B.ell(220, 30, 14, 14, PX.L); B.ell(220, 30, 10, 10, PX.D); B.ell(220, 30, 3, 3, PX.Y); for (i = 0; i < 4; i++) B.line(220, 30, 220 + [10, 0, -10, 0][i], 30 + [0, 10, 0, -10][i], PX.L); for (i = 0; i < 4; i++) { B.rect(84 + i * 4, 44 - i * 3, 12, 3, PX.Y); B.rect(84 + i * 4, 41 - i * 3, 12, 1, PX.N); } },
  yard: function (B, th) { var i; for (i = 0; i < 12; i++) B.rect(i * 8, 46, 4, 8, PX.Y); B.line(20, 6, 20, 46, PX.N); B.line(20, 6, 70, 10, PX.N); B.line(70, 10, 70, 22, PX.D); B.rect(66, 22, 8, 6, PX.Y);
    B.poly([240, 44, 300, 44, 312, 34, 270, 22, 250, 30], PX.L); B.poly([250, 30, 270, 22, 296, 32, 262, 36], PX.W); B.ell(262, 30, 5, 3, PX.C); B.rect(100, 36, 30, 14, PX.D); B.ell(115, 36, 10, 6, PX.L); B.line(160, 14, 150, 42, PX.L); B.ell(150, 44, 5, 3, PX.L); },
  fuel: function (B, th) { var i; for (i = 0; i < 3; i++) { var x = 14 + i * 34; B.rect(x, 12, 18, 34, PX.R); B.rect(x + 3, 16, 12, 8, PX.W); B.rect(x + 4, 18, 10, 2, PX.LC); B.line(x + 18, 24, x + 26, 40, PX.K); B.rect(x + 22, 40, 6, 6, PX.K); }
    for (i = 0; i < 4; i++) { B.rect(236 + i * 17, 28, 13, 20, PX.D); B.rect(236 + i * 17, 28, 13, 3, PX.L); B.rect(236 + i * 17, 38, 13, 2, PX.Y); } },
  cantina: function (B, th) { var i; B.rect(0, 20, 320, 3, PX.N); for (i = 0; i < 12; i++) { B.rect(10 + i * 14, 8, 5, 12, [PX.LG, PX.LR, PX.Y, PX.LC][i % 4]); B.rect(11 + i * 14, 5, 3, 3, PX.W); }
    B.rect(0, 34, 320, 14, PX.N); B.rect(0, 34, 320, 2, PX.Y); for (i = 0; i < 6; i++) { B.rect(24 + i * 50, 28, 6, 6, PX.W); } B.ell(40, 52, 8, 3, PX.R); B.ell(230, 52, 8, 3, PX.R); },
  alley: function (B, th) { var i, j; for (j = 0; j < 8; j++) for (i = 0; i < 17; i++) B.rect(i * 20 - (j % 2) * 10, j * 7, 18, 5, PX.D);
    B.rect(24, 30, 36, 22, PX.G); B.rect(22, 28, 40, 3, PX.LG); B.line(120, 4, 120, 50, PX.L); B.line(124, 4, 124, 50, PX.L); B.line(120, 22, 160, 22, PX.L); B.ell(244, 30, 3, 3, PX.E + PX.Y); B.ell(254, 30, 3, 3, PX.E + PX.Y); B.ell(190, 8, 4, 2, PX.L); B.ell(196, 4, 5, 2, PX.L); },
  office: function (B, th) { var i; for (i = 0; i < 5; i++) { var x = 10 + i * 24; B.rect(x, 8, 20, 18, PX.W); B.rect(x, 8, 20, 2, PX.L); B.poly([x + 2, 18, x + 10, 11, x + 18, 18], PX.R); B.rect(x + 5, 18, 10, 8, PX.Y); B.rect(x + 8, 20, 4, 6, PX.N); }
    B.rect(200, 30, 100, 16, PX.N); B.rect(204, 26, 22, 4, PX.W); for (i = 0; i < 5; i++) B.rect(210 + i * 16, 34 + (i % 2) * 4, 8, 4, PX.Y); B.ell(180, 40, 6, 6, PX.Y); B.line(180, 40, 190, 48, PX.Y); },
  parlour: function (B, th) { var i; B.poly([0, 0, 40, 0, 24, 56, 0, 56], PX.R); B.poly([320, 0, 280, 0, 296, 56, 320, 56], PX.R); for (i = 0; i < 5; i++) { B.line(8 + i * 7, 0, 4 + i * 5, 56, PX.M); B.line(312 - i * 7, 0, 316 - i * 5, 56, PX.M); }
    B.ring(238, 32, 14, 14, PX.Y); B.ring(238, 32, 10, 10, PX.R); for (i = 0; i < 8; i++) B.line(238, 32, 238 + Math.cos(i * 0.785) * 14, 32 + Math.sin(i * 0.785) * 14, PX.LR); B.ell(238, 32, 3, 3, PX.Y);
    B.line(80, 0, 80, 6, PX.Y); B.ell(80, 10, 10, 4, PX.E + PX.Y); for (i = 0; i < 5; i++) B.ell(70 + i * 5, 16, 1, 2, PX.E + PX.W); },
  jobs: function (B, th) { var i; B.rect(10, 6, 300, 42, PX.N); B.rect(12, 8, 296, 38, PX.Y); for (i = 0; i < 12; i++) { var x = 18 + i * 24 + (i % 3) * 2; B.rect(x, 12 + (i % 2) * 18, 16, 14, [PX.W, PX.LR, PX.LG, PX.LC][i % 4]); B.px(x + 7, 12 + (i % 2) * 18, PX.R); B.line(x + 3, 16 + (i % 2) * 18, x + 12, 16 + (i % 2) * 18, PX.D); B.line(x + 3, 20 + (i % 2) * 18, x + 9, 20 + (i % 2) * 18, PX.D); } }
};
SC.bannerCache = {};
SC.backdrop = function (kind, pid) {
  var key = kind + '/' + pid, u = SC.bannerCache[key]; if (!u) {
    var th = SC.TH[pid], B = new PX.Buf(320, 56), i, nm = (NP.SIGNS[pid] || {})[kind] || (kind === 'alley' ? 'BACK ALLEY' : kind === 'jobs' ? 'ODD JOBS' : kind.toUpperCase());
    B.vgrad(0, 0, 320, 56, [th.b, th.b, PX.D]); for (i = 0; i < 900; i++) B.px((i * 37) % 320, (i * 53) % 56, th.a);
    B.rect(0, 0, 320, 2, th.t); B.rect(0, 52, 320, 4, th.ground[1]);
    (SC.RK[kind] || SC.RK.market)(B, th);
    var sc = nm.length <= 9 ? 2 : 1, tw = PX.textW(nm, sc), bw = Math.min(150, tw + 14), bx = 160 - bw / 2;
    B.rect(bx - 2, 5, bw + 4, 12 * sc / 2 + 18, PX.K); B.rect(bx, 7, bw, 12 * sc / 2 + 14, kind === 'parlour' ? PX.M : PX.N); B.rect(bx + 2, 9, bw - 4, 12 * sc / 2 + 10, PX.K);
    B.text(Math.round(160 - tw / 2), 8 + (sc === 2 ? 5 : 8), nm.length > 24 ? nm.slice(0, 24) : nm, kind === 'parlour' ? PX.E + PX.LM : PX.Y, sc);
    u = SC.bannerCache[key] = PX.render(B, false).toDataURL();
  }
  return '<img class="bg pxi" src="' + u + '" width="320" height="56" alt="">';
};

/* ---------- the star map ---------- */
/* v4: the map is a fixed 280 x 160 pixel picture shown at 2x (560 x 320), so it never grows on a wide window */
UI.MW = 280; UI.MH = 160;
UI.mapSX = function (x) { return Math.round(26 + (x - 8) * 2.95); };
UI.mapSY = function (y) { return Math.round(34 + (y - 12) * 2.85); };
UI.mapSVG = function (s, dest) {
  var P = GT.PLANETS, B = new PX.Buf(UI.MW, UI.MH), rnd = GT.seeded(77), k, hit = '';
  for (k = 0; k < 150; k++) B.px(Math.floor(rnd() * UI.MW), Math.floor(rnd() * UI.MH), rnd() < 0.15 ? PX.W : rnd() < 0.5 ? PX.D : PX.L);
  for (k = 0; k < 5; k++) { var nx = 30 + rnd() * 220, ny = 20 + rnd() * 120; B.ring(nx, ny, 3, 3, PX.B); }
  if (dest !== null && dest !== s.loc) { var a = P[s.loc], b = P[dest], x0 = UI.mapSX(a.x), y0 = UI.mapSY(a.y), x1 = UI.mapSX(b.x), y1 = UI.mapSY(b.y), n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 4); for (k = 0; k < n; k += 1) if (k % 2 === 0) B.line(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, x0 + (x1 - x0) * (k + 1) / n, y0 + (y1 - y0) * (k + 1) / n, PX.Y); }
  P.forEach(function (p, i) {
    var x = UI.mapSX(p.x), y = UI.mapSY(p.y), here = i === s.loc, sel = i === dest, r = here ? 9 : 6;
    PX.ball(B, x, y, r, p.id, p.type, p.ring);
    if (here) { B.ring(x, y, r + 4, r + 4, PX.LC); B.ring(x, y, r + 5, r + 5, PX.LC); }
    if (sel) { B.ring(x, y, r + 4, r + 4, PX.Y); B.px(x - r - 5, y, PX.Y); B.px(x + r + 5, y, PX.Y); }
    var nm = p.name.toUpperCase(), tw = PX.textW(nm, 1), ty = y + r + (here || sel ? 7 : 5); if (ty > UI.MH - 9) ty = y - r - 12;
    B.text(Math.round(Math.max(1, Math.min(UI.MW - tw - 1, x - tw / 2))), ty, nm, here ? PX.LC : sel ? PX.Y : PX.L, 1);
    s.comps.forEach(function (cp, ci) { if (cp.loc === i) { var dx = x + r + 2 + ci * 6, dy = y - r - 2; B.poly([dx, dy - 3, dx + 3, dy, dx, dy + 3, dx - 3, dy], PX.LR); } });
    if (s.game && s.game.multi) s.game.players.forEach(function (q) { if (q !== s && q.loc === i && !(q.over && !q.over.won)) { var dx = x - r - 4 - q.seat * 5, dy = y - r - 2; B.rect(dx, dy, 4, 4, ui.SEATCOL[q.seat]); B.rect(dx, dy, 4, 1, PX.K); } });
    hit += '<g class="pl" data-i="' + i + '" tabindex="0" role="button" aria-label="' + GT.esc(p.name) + (here ? ', current location' : sel ? ', selected destination' : '') + '" data-label="' + GT.esc(p.name + ': ' + p.type) + '"><circle cx="' + x + '" cy="' + y + '" r="14" fill="transparent"/></g>';
  });
  return '<img class="pxi mapimg" src="' + PX.render(B, false).toDataURL() + '" width="' + UI.MW + '" height="' + UI.MH + '" alt=""><svg class="ov" viewBox="0 0 ' + UI.MW + ' ' + UI.MH + '" role="group" aria-label="Star map">' + hit + '</svg>';
};
