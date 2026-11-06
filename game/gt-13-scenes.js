/* Galactic Trader Deluxe. Part 13: scenery. Every planet gets a wonky cartoon street, and each shop a backdrop for its inside. */
var SC = { W: 900, H: 420, FEET: 396 };
SC.INK = '#1d0f33';
SC.TH = {
  meridoa:  { sky: ['#7fd6ff', '#e4f8ff'], nsky: ['#1b1b5a', '#6a3a8a'], far: '#8fd48a', ground: '#78c043', ground2: '#58a02c', walk: '#ecdca8', wall: ['#ff9a3d', '#ffd23d', '#ff6f91'], roof: '#c0392b', sun: '#fff06a', decor: 'windmill' },
  karthosu: { sky: ['#ffb36b', '#ffe6b0'], nsky: ['#2a1450', '#8a3a5a'], far: '#d99a5a', ground: '#e0b070', ground2: '#c08a45', walk: '#f6dfa8', wall: ['#e8b86d', '#d98c4a', '#f0d08a'], roof: '#8d5a2b', sun: '#ff7a3d', decor: 'obelisk' },
  ferrox:   { sky: ['#c0654a', '#ffb98f'], nsky: ['#2b1030', '#7a2a3a'], far: '#8a5040', ground: '#8a6a58', ground2: '#5a3f34', walk: '#b8a290', wall: ['#8a8f9a', '#c06a3a', '#7a7f8a'], roof: '#3a3f4a', sun: '#ffd23d', decor: 'drill' },
  kryndor:  { sky: ['#7a4dff', '#ffa6dc'], nsky: ['#10063a', '#4a1a7a'], far: '#5a3aa8', ground: '#4e4e86', ground2: '#34345a', walk: '#c4c5ee', wall: ['#4fd2ff', '#ff5fa8', '#ffd23d'], roof: '#2a2a5a', sun: '#ffffff', decor: 'spire' },
  nihil:    { sky: ['#1a0b3b', '#5a3a8a'], nsky: ['#05030f', '#1f0f46'], far: '#3a2470', ground: '#3e2e62', ground2: '#241540', walk: '#8a70c4', wall: ['#b07cff', '#6a4aa8', '#ff5fa8'], roof: '#1a0b3b', sun: '#c08aff', decor: 'dish' },
  quellin:  { sky: ['#ffd1ec', '#e8f6ff'], nsky: ['#1a1050', '#7a3aa0'], far: '#f0b0dc', ground: '#e8f0ff', ground2: '#c0d0f4', walk: '#ffffff', wall: ['#ff7ad9', '#7ad9ff', '#d9ff7a'], roof: '#ff5fa8', sun: '#ffffff', decor: 'dome' },
  halcyra:  { sky: ['#ffd23d', '#fff4b8'], nsky: ['#3a1050', '#b04a5a'], far: '#ffb060', ground: '#ffc24d', ground2: '#e09a2a', walk: '#fff2c4', wall: ['#ff8a3d', '#ffd23d', '#5ad0ff'], roof: '#d35400', sun: '#ff7a3d', decor: 'ring' }
};
SC.night = function () { var t = document.documentElement.getAttribute('data-theme'); if (t === 'night' || t === 'dark') return true; if (t === 'day' || t === 'light') return false; return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches); };

/* ---------- little drawing helpers ---------- */
SC.st = function (w) { return ' stroke="' + SC.INK + '" stroke-width="' + (w || 4) + '" stroke-linejoin="round" stroke-linecap="round"'; };
SC.poly = function (pts, fill, w) { return '<polygon points="' + pts + '" fill="' + fill + '"' + SC.st(w) + '/>'; };
SC.rect = function (x, y, w, h, fill, rx, sw) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + fill + '"' + SC.st(sw) + '/>'; };
SC.circ = function (x, y, r, fill, sw) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '"' + SC.st(sw) + '/>'; };
SC.txt = function (x, y, s, size, fill, rot, maxW) { var tl = maxW ? ' textLength="' + Math.round(Math.min(maxW, s.length * size * 0.47)) + '" lengthAdjust="spacingAndGlyphs"' : ''; return '<text x="' + x + '" y="' + y + '" text-anchor="middle"' + tl + ' font-family="Bangers, Impact, sans-serif" font-size="' + size + '" letter-spacing="1" fill="' + fill + '" stroke="' + SC.INK + '" stroke-width="' + Math.max(2, size / 7) + '" paint-order="stroke" stroke-linejoin="round"' + (rot ? ' transform="rotate(' + rot + ' ' + x + ' ' + y + ')"' : '') + '>' + GT.esc(s) + '</text>'; };
SC.wonky = function (cx, base, w, h, fill, lean, shade) {
  var l = cx - w / 2, r = cx + w / 2, d = UI.shade(fill, -0.25);
  return SC.poly(l + ',' + base + ' ' + r + ',' + base + ' ' + (r + lean) + ',' + (base - h) + ' ' + (l - lean * 0.6) + ',' + (base - h), fill) +
    '<polygon points="' + (r - w * 0.18) + ',' + base + ' ' + r + ',' + base + ' ' + (r + lean) + ',' + (base - h) + ' ' + (r - w * 0.18 + lean * 0.9) + ',' + (base - h) + '" fill="' + d + '" opacity=".6"/>';
};
SC.hs = function (kind, label, inner, closed) { return '<g class="hs' + (closed ? ' closed' : '') + '" data-hs="' + kind + '" data-label="' + GT.esc(label) + '" tabindex="0" role="button" aria-label="' + GT.esc(label) + '">' + inner + '</g>'; };
SC.win = function (x, y, w, h, on) { return SC.rect(x, y, w, h, on ? '#fff0a0' : '#7ad0ff', 3, 3) + '<line x1="' + (x + w / 2) + '" y1="' + y + '" x2="' + (x + w / 2) + '" y2="' + (y + h) + '" stroke="' + SC.INK + '" stroke-width="2"/>'; };

/* ---------- buildings. Each takes the centre x and the base line. ---------- */
SC.B = {};
SC.B.market = function (cx, base, th, sign) {
  var w = 190, h = 150, l = cx - w / 2, o = SC.wonky(cx, base, w, h, th.wall[1], 6);
  var aw = ''; for (var i = 0; i < 8; i++) aw += SC.poly((l + 4 + i * 23) + ',' + (base - 100) + ' ' + (l + 27 + i * 23) + ',' + (base - 100) + ' ' + (l + 29 + i * 23) + ',' + (base - 72) + ' ' + (l + 2 + i * 23) + ',' + (base - 72), i % 2 ? '#fff' : '#ff3d8b', 3);
  var fruit = ''; ['#ff5a4f', '#ffd23d', '#7bd957', '#ff8a2a', '#c25cff', '#ff5a4f', '#ffd23d'].forEach(function (c, k) { fruit += SC.circ(l + 18 + k * 25, base - 40, 10, c, 3); });
  return o + SC.rect(l + 8, base - 32, w - 16, 30, '#a0642a', 3) + fruit + SC.rect(l + 20, base - 132, w - 40, 26, '#fff3cf', 5) + SC.txt(cx, base - 112, sign, 22, '#ff3d8b', 0, w - 44) + aw + SC.circ(l + 14, base - 140, 7, '#ffd23d', 3);
};
SC.B.bank = function (cx, base, th, sign) {
  var w = 124, h = 140, l = cx - w / 2, cols = '';
  for (var i = 0; i < 4; i++) cols += SC.rect(l + 10 + i * 28, base - h + 38, 14, h - 50, '#fff8e8', 3);
  return SC.wonky(cx, base, w, h, th.wall[2], 4) + SC.poly((l - 8) + ',' + (base - h) + ' ' + (cx + 2) + ',' + (base - h - 44) + ' ' + (l + w + 8) + ',' + (base - h), '#d9d2f0') + SC.circ(cx, base - h - 12, 14, '#ffd23d', 3) + SC.txt(cx, base - h - 6, 'c', 20, '#1d0f33') + cols +
    SC.rect(l + 8, base - h + 20, w - 16, 18, '#fff3cf', 3) + SC.txt(cx, base - h + 35, sign, 13, '#6a2c91', 0, w - 24) + '<path d="M' + (cx - 16) + ',' + base + ' L' + (cx - 16) + ',' + (base - 38) + ' Q' + cx + ',' + (base - 56) + ' ' + (cx + 16) + ',' + (base - 38) + ' L' + (cx + 16) + ',' + base + 'Z" fill="#2a2a4a"' + SC.st(3) + '/>' + SC.circ(cx, base - 28, 9, '#c0c8d8', 3) + '<line x1="' + (cx - 6) + '" y1="' + (base - 28) + '" x2="' + (cx + 6) + '" y2="' + (base - 28) + '" stroke="' + SC.INK + '" stroke-width="3"/>';
};
SC.B.yard = function (cx, base, th, sign, closed) {
  var w = 116, h = 92, l = cx - w / 2, door = '';
  for (var i = 0; i < 5; i++) door += '<line x1="' + (l + 14) + '" y1="' + (base - 56 + i * 11) + '" x2="' + (l + w - 14) + '" y2="' + (base - 56 + i * 11) + '" stroke="' + SC.INK + '" stroke-width="2"/>';
  return SC.wonky(cx, base, w, h, th.wall[0], 5) + SC.poly((l - 8) + ',' + (base - h) + ' ' + (l + w + 12) + ',' + (base - h) + ' ' + (l + w) + ',' + (base - h - 22) + ' ' + (l + 6) + ',' + (base - h - 18), th.roof) +
    SC.rect(l + 14, base - 58, w - 28, 58, closed ? '#6a6a7a' : '#4a4a62', 3) + door + SC.rect(l + 10, base - h + 6, w - 20, 16, '#fff3cf', 4) + SC.txt(cx, base - h + 19, sign, 12, '#ff8a1f', 0, w - 28) +
    '<path d="M' + (l + w + 6) + ',' + (base - h - 10) + ' L' + (l + w + 30) + ',' + (base - h - 50) + ' L' + (l + w + 50) + ',' + (base - h - 44)  + '" fill="none"' + SC.st(5) + '/><line x1="' + (l + w + 44) + '" y1="' + (base - h - 46) + '" x2="' + (l + w + 44) + '" y2="' + (base - h - 18) + '" stroke="' + SC.INK + '" stroke-width="3"/>' + SC.circ(l - 14, base - 10, 12, '#2a2a3a', 3) + SC.circ(l - 14, base - 10, 5, '#8a8a9a', 2) +
    (closed ? SC.rect(cx - 44, base - 40, 88, 24, '#fff3cf', 3) + SC.txt(cx, base - 22, 'CLOSED', 22, '#e0263f', -6) : '<polygon points="' + (cx + 4) + ',' + (base - 20) + ' ' + (cx + 12) + ',' + (base - 32) + ' ' + (cx + 14) + ',' + (base - 18) + '" fill="#ffd23d"/>');
};
SC.B.fuel = function (cx, base, th, sign, closed) {
  var w = 70, h = 112, l = cx - w / 2, hz = '';
  for (var i = 0; i < 4; i++) hz += SC.poly((l + i * 18) + ',' + (base - 30) + ' ' + (l + 10 + i * 18) + ',' + (base - 30) + ' ' + (l + 20 + i * 18) + ',' + (base - 8) + ' ' + (l + 10 + i * 18) + ',' + (base - 8), '#ffd23d', 2);
  return SC.wonky(cx, base, w, h, th.wall[1], 3) + '<ellipse cx="' + cx + '" cy="' + (base - h) + '" rx="' + (w / 2 + 6) + '" ry="22" fill="' + th.wall[2] + '"' + SC.st() + '/><ellipse cx="' + (cx - 10) + '" cy="' + (base - h - 8) + '" rx="12" ry="6" fill="#fff" opacity=".5"/>' +
    SC.rect(l + 8, base - h + 18, w - 16, 20, '#fff3cf', 4) + SC.txt(cx, base - h + 33, sign.length > 9 ? sign.slice(0, 9) : sign, 12, '#1d0f33', 0, w - 20) + SC.rect(l + 8, base - 70, w - 16, 28, '#2a2a4a', 4) + SC.circ(cx, base - 56, 8, closed ? '#8a8a9a' : '#58ff9a', 3) + hz +
    '<path d="M' + (l + w) + ',' + (base - 60) + ' Q' + (l + w + 26) + ',' + (base - 20) + ' ' + (l + w + 6) + ',' + (base + 2) + '" fill="none"' + SC.st(5) + '/>' +
    (closed ? SC.rect(cx - 36, base - 100, 72, 22, '#fff3cf', 3) + SC.txt(cx, base - 83, 'NO FUEL', 18, '#e0263f', 7) : '');
};
SC.B.cantina = function (cx, base, th, sign) {
  var w = 130, h = 124, l = cx - w / 2;
  return SC.wonky(cx, base, w, h, th.wall[2], -5) + SC.poly((l - 8) + ',' + (base - h) + ' ' + (l + w + 6) + ',' + (base - h) + ' ' + (l + w) + ',' + (base - h - 20) + ' ' + (l + 6) + ',' + (base - h - 16), th.roof) +
    '<rect x="' + (l + 10) + '" y="' + (base - h + 8) + '" width="' + (w - 20) + '" height="26" rx="13" fill="#1a0b3b"' + SC.st(4) + '/><text x="' + cx + '" y="' + (base - h + 28) + '" text-anchor="middle" font-family="Bangers, Impact" font-size="17" textLength="' + Math.min(w - 40, sign.length * 8) + '" lengthAdjust="spacingAndGlyphs" fill="#7cfff0" stroke="#7cfff0" stroke-width=".6" style="filter:drop-shadow(0 0 4px #7cfff0)">' + GT.esc(sign) + '</text>' +
    SC.win(l + 12, base - 78, 28, 26, true) + SC.win(l + w - 40, base - 78, 28, 26, true) + SC.rect(cx - 17, base - 50, 15, 36, '#a0642a', 3) + SC.rect(cx + 2, base - 50, 15, 36, '#a0642a', 3) + SC.rect(cx - 17, base - 14, 34, 14, '#fff3cf', 2, 2) + SC.circ(l - 8, base - 12, 11, '#8a4a1a', 3);
};
SC.B.alley = function (cx, base) {
  var w = 56, h = 104, l = cx - w / 2;
  return SC.poly(l + ',' + base + ' ' + (l + w) + ',' + base + ' ' + (l + w) + ',' + (base - h) + ' ' + l + ',' + (base - h), '#0c0618') + '<ellipse cx="' + (cx - 8) + '" cy="' + (base - 58) + '" rx="4" ry="6" fill="#ffe14a"/><ellipse cx="' + (cx + 8) + '" cy="' + (base - 58) + '" rx="4" ry="6" fill="#ffe14a"/>' +
    SC.rect(l + 4, base - 20, 16, 20, '#6a6a7a', 3) + '<path d="M' + (l - 4) + ',' + (base - h) + ' L' + (l - 4) + ',' + base + ' M' + (l + w + 4) + ',' + (base - h) + ' L' + (l + w + 4) + ',' + base + '" stroke="' + SC.INK + '" stroke-width="6"/>' + SC.txt(cx, base - h - 8, '???', 18, '#ffe14a', -4);
};
SC.B.parlour = function (cx, base, th, sign) {
  var w = 96, h = 132, l = cx - w / 2, star = '';
  for (var i = 0; i < 10; i++) { var a = i * Math.PI / 5, rr = i % 2 ? 20 : 34; star += (cx + Math.cos(a) * rr).toFixed(1) + ',' + (base - h + 40 + Math.sin(a) * rr).toFixed(1) + ' '; }
  return SC.wonky(cx, base, w, h, '#4a2a8a', 4) + SC.poly(star.trim(), '#ff3d8b', 3) + SC.circ(cx, base - h + 40, 12, '#fff', 3) + SC.circ(cx, base - h + 40, 5, '#1d0f33', 2) + SC.rect(l + 8, base - 52, w - 16, 52, '#1a0b3b', 8) + SC.txt(cx, base - 36, sign, 15, '#7cfff0', 0, w - 26) + '<path d="M' + (l + 8) + ',' + (base - 52) + ' Q' + (cx - 14) + ',' + (base - 30) + ' ' + (l + 28) + ',' + base + ' M' + (l + w - 8) + ',' + (base - 52) + ' Q' + (cx + 14) + ',' + (base - 30) + ' ' + (l + w - 28) + ',' + base + '" fill="#8a1a4a"' + SC.st(3) + '/>';
};
SC.DECOR = {
  windmill: function (x, b) { return SC.poly((x - 16) + ',' + b + ' ' + (x + 16) + ',' + b + ' ' + (x + 8) + ',' + (b - 120) + ' ' + (x - 8) + ',' + (b - 120), '#fff3cf') + '<g transform="translate(' + x + ' ' + (b - 120) + ')">' + [0, 90, 180, 270].map(function (a) { return '<polygon points="0,0 -8,-60 8,-60" fill="#ff6f91"' + SC.st(3) + ' transform="rotate(' + (a + 20) + ')"/>'; }).join('') + SC.circ(0, 0, 8, '#ffd23d', 3) + '</g>'; },
  obelisk: function (x, b) { return SC.poly((x - 18) + ',' + b + ' ' + (x + 18) + ',' + b + ' ' + (x + 8) + ',' + (b - 150) + ' ' + x + ',' + (b - 172) + ' ' + (x - 8) + ',' + (b - 150), '#f0d08a') + '<circle cx="' + x + '" cy="' + (b - 100) + '" r="7" fill="#ff7a3d"' + SC.st(3) + '/>'; },
  drill: function (x, b) { return SC.poly((x - 26) + ',' + b + ' ' + (x + 26) + ',' + b + ' ' + (x + 6) + ',' + (b - 140) + ' ' + (x - 6) + ',' + (b - 140), '#8a8f9a') + SC.poly((x - 16) + ',' + (b - 140) + ' ' + (x + 16) + ',' + (b - 140) + ' ' + x + ',' + (b - 170), '#ffd23d') + '<line x1="' + (x - 20) + '" y1="' + (b - 20) + '" x2="' + (x + 8) + '" y2="' + (b - 110) + '" stroke="' + SC.INK + '" stroke-width="3"/>'; },
  spire: function (x, b) { return SC.poly((x - 22) + ',' + b + ' ' + (x + 22) + ',' + b + ' ' + (x + 6) + ',' + (b - 200) + ' ' + x + ',' + (b - 230) + ' ' + (x - 6) + ',' + (b - 200), '#4fd2ff') + SC.circ(x, b - 150, 18, '#fff3cf', 3) + SC.rect(x - 4, b - 170, 8, 12, '#ff3d8b', 2, 2); },
  dish: function (x, b) { return SC.rect(x - 6, b - 100, 12, 100, '#6a4aa8', 2) + '<ellipse cx="' + x + '" cy="' + (b - 108) + '" rx="46" ry="16" fill="#c08aff"' + SC.st() + ' transform="rotate(-18 ' + x + ' ' + (b - 108) + ')"/>' + SC.circ(x + 14, b - 134, 6, '#ff3d8b', 3); },
  dome: function (x, b) { return '<path d="M' + (x - 60) + ',' + b + ' Q' + (x - 60) + ',' + (b - 110) + ' ' + x + ',' + (b - 110) + ' Q' + (x + 60) + ',' + (b - 110) + ' ' + (x + 60) + ',' + b + 'Z" fill="#ffffff" fill-opacity=".85"' + SC.st() + '/><line x1="' + x + '" y1="' + (b - 110) + '" x2="' + x + '" y2="' + b + '" stroke="' + SC.INK + '" stroke-width="3"/>' + SC.circ(x - 20, b - 30, 12, '#7bd957', 3) + SC.circ(x + 22, b - 36, 9, '#ff7ad9', 3); },
  ring: function (x, b) { return '<ellipse cx="' + x + '" cy="' + (b - 120) + '" rx="64" ry="14" fill="#ffd23d"' + SC.st() + '/>' + SC.circ(x, b - 150, 22, '#ff8a3d', 3) + '<line x1="' + (x - 40) + '" y1="' + (b - 120) + '" x2="' + (x - 40) + '" y2="' + b + '" stroke="' + SC.INK + '" stroke-width="3"/><line x1="' + (x + 40) + '" y1="' + (b - 120) + '" x2="' + (x + 40) + '" y2="' + b + '" stroke="' + SC.INK + '" stroke-width="3"/>'; }
};
SC.SLOT = { yard: 70, bank: 195, market: 360, alley: 495, cantina: 595, fuel: 715, parlour: 830, jobs: 60, office: 275, pad: 800 };

/* ---------- the hub street ---------- */
SC.hub = function (s) {
  var p = GT.PLANETS[s.loc], th = SC.TH[p.id], sg = NP.SIGNS[p.id], night = SC.night(), sky = night ? th.nsky : th.sky, rnd = GT.seeded(CH.hash(p.id)), o = '';
  o += '<svg class="scene" viewBox="0 0 ' + SC.W + ' ' + SC.H + '" preserveAspectRatio="xMidYMax meet" id="scene" role="group" aria-label="' + GT.esc(p.name) + ' street"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + sky[0] + '"/><stop offset="1" stop-color="' + sky[1] + '"/></linearGradient></defs>';
  o += '<rect width="' + SC.W + '" height="320" fill="url(#sky)"/>';
  if (night) for (var k = 0; k < 50; k++) o += '<circle cx="' + (rnd() * SC.W).toFixed(0) + '" cy="' + (rnd() * 200).toFixed(0) + '" r="' + (rnd() < .15 ? 2.2 : 1.2) + '" fill="#fff" opacity="' + (0.4 + rnd() * 0.6).toFixed(2) + '"/>';
  o += SC.circ(760, 70, 34, night ? '#f4f1ff' : th.sun, 4);
  if (p.ring) o += '<ellipse cx="760" cy="70" rx="64" ry="12" fill="none" stroke="' + SC.INK + '" stroke-width="5" transform="rotate(-18 760 70)"/>';
  [[120, 60, 1], [420, 40, .8], [640, 100, .7]].forEach(function (c) { o += '<g transform="translate(' + c[0] + ' ' + c[1] + ') scale(' + c[2] + ')" opacity="' + (night ? .35 : .95) + '"><ellipse cx="0" cy="0" rx="46" ry="16" fill="#fff"' + SC.st(3) + '/><ellipse cx="22" cy="-10" rx="26" ry="14" fill="#fff"' + SC.st(3) + '/></g>'; });
  var sx = -20; while (sx < SC.W + 20) { var bw = 40 + rnd() * 60, bh = 60 + rnd() * 110; o += SC.poly(sx + ',300 ' + (sx + bw) + ',300 ' + (sx + bw + 4) + ',' + (300 - bh) + ' ' + (sx - 3) + ',' + (300 - bh - 8), night ? UI.shade(th.far, -0.55) : th.far, 3); sx += bw - 4; }
  o += SC.DECOR[th.decor](p.id === 'kryndor' ? 285 : 430, 300);
  o += '<rect x="0" y="300" width="' + SC.W + '" height="120" fill="' + th.ground + '"/><rect x="0" y="300" width="' + SC.W + '" height="6" fill="' + SC.INK + '"/>' + SC.poly('0,338 900,338 900,372 0,372', th.walk, 4) + '<rect x="0" y="372" width="900" height="48" fill="' + th.ground2 + '"/>';
  for (var d = 0; d < 9; d++) o += '<rect x="' + (d * 110 + 20) + '" y="398" width="54" height="7" rx="3" fill="' + th.walk + '" opacity=".8"/>';
  var closedYard = !p.upgrades.length, closedFuel = !p.fuelSold, hasParlour = p.gambling;
  o += SC.hs('yard', closedYard ? 'The Shipyard is closed' : 'Go to the Shipyard', SC.B.yard(SC.SLOT.yard, 305, th, sg.yard, closedYard), closedYard);
  o += SC.hs('alley', 'Poke around the Back Alley', SC.B.alley(SC.SLOT.alley, 312));
  if (!hasParlour) o += SC.DECOR[th.decor] && '';
  o += SC.hs('bank', 'Go to the Bank', SC.B.bank(SC.SLOT.bank, 338, th, sg.bank));
  o += SC.hs('market', 'Go to the Market', SC.B.market(SC.SLOT.market, 338, th, sg.market));
  o += SC.hs('cantina', 'Go to the ' + sg.cantina.replace(/\b\w/g, function (c) { return c; }), SC.B.cantina(SC.SLOT.cantina, 338, th, sg.cantina));
  o += SC.hs('fuel', closedFuel ? 'There is no fuel dock here' : 'Go to the Fuel Dock', SC.B.fuel(SC.SLOT.fuel, 338, th, sg.fuel, closedFuel), closedFuel);
  if (hasParlour) o += SC.hs('parlour', 'Enter the Parlour of Thin Hours', SC.B.parlour(SC.SLOT.parlour, 338, th, sg.parlour));
  else o += SC.circ(830, 320, 0, 'none', 0) + '<g opacity=".95">' + SC.rect(796, 280, 70, 58, th.wall[0], 6) + SC.win(808, 292, 18, 20, true) + SC.win(836, 292, 18, 20, false) + '</g>';
  /* foreground */
  o += SC.hs('jobs', 'Check the Odd Jobs board', SC.rect(34, 346, 6, 56, '#8a5a2a', 2, 3) + SC.rect(78, 346, 6, 56, '#8a5a2a', 2, 3) + SC.rect(24, 322, 72, 46, '#c8884a', 4) + SC.rect(32, 330, 22, 16, '#fff', 2, 2) + SC.rect(58, 332, 26, 20, '#ffd23d', 2, 2) + SC.rect(36, 350, 20, 12, '#ff9ac8', 2, 2) + SC.txt(60, 316, 'ODD JOBS', 15, '#fff3cf'));
  var offer = !!s.visit.offer, owned = !!s.owned[s.loc];
  o += SC.hs('office', offer ? 'Visit the property booth (an offer awaits!)' : 'Visit the property booth', SC.rect(246, 346, 58, 54, '#6aa0ff', 5) + SC.poly('232,346 318,346 304,324 246,324', '#ff3d8b') + SC.rect(256, 356, 38, 22, '#fff3cf', 3) + SC.txt(275, 372, 'DEEDS', 12, '#1d0f33') + (offer ? SC.circ(275, 312, 13, '#ffd23d', 3) + SC.txt(275, 319, '!', 20, '#e0263f') : owned ? SC.circ(275, 312, 11, '#7bd957', 3) + SC.txt(275, 318, 'OK', 11, '#1d0f33') : ''));
  var hull = GT.SHIPS.filter(function (x) { return x.id === s.shipId; })[0];
  o += SC.hs('pad', 'Go to the Launch Pad (Star Map)', '<ellipse cx="800" cy="394" rx="96" ry="18" fill="#2a2a4a"' + SC.st() + '/><ellipse cx="800" cy="394" rx="70" ry="12" fill="none" stroke="#ffd23d" stroke-width="3" stroke-dasharray="10 8"/>' + UI.shipSVG(hull.id, hull.hue).replace('<svg viewBox', '<svg x="722" y="318" width="156" height="91" viewBox'));
  /* rivals who happen to be in town stand about, minding their own business */
  var rv = s.comps.map(function (c, i) { return c.loc === s.loc ? i : -1; }).filter(function (i) { return i >= 0; });
  rv.forEach(function (ci, k) { var rc = NP.rival(ci); o += '<g transform="translate(' + (150 + k * 46) + ' 322) scale(.5)">' + CH.sprite(rc) + '</g>' + SC.txt(150 + k * 46 + 25, 318, rc.name.split(' ')[0], 11, '#ffe14a'); });
  /* the player */
  var px = s.char ? (typeof ui !== 'undefined' && ui.px != null ? ui.px : SC.SLOT.pad - 70) : 600;
  o += '<g id="player" style="transform: translate(' + (px - 28) + 'px, ' + (SC.FEET - 92) + 'px) scale(.55)">' + (s.char ? CH.sprite(s.char) : '') + '</g></svg>';
  return o;
};

/* ---------- inside backdrops for the shop pages ---------- */
SC.backdrop = function (kind, pid) {
  var th = SC.TH[pid], wall = { market: th.wall[1], bank: '#e8e0ff', yard: th.wall[0], fuel: th.wall[2], cantina: '#7a3a9a', alley: '#5a4a6a', office: '#8ac0ff', parlour: '#3a1a6a', jobs: '#c8884a', cell: th.wall[1] }[kind] || th.wall[1], o = '', i;
  o += '<svg class="bg" viewBox="0 0 900 560" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><rect x="-1500" y="-300" width="3900" height="1000" fill="' + wall + '"/>';
  for (i = 0; i < 12; i++) o += '<circle cx="' + (i * 80 + 20) + '" cy="' + ((i * 53) % 400 + 30) + '" r="6" fill="#fff" opacity=".12"/>';
  o += '<rect x="-1500" y="430" width="3900" height="330" fill="' + UI.shade(wall, -0.4) + '"' + SC.st(5) + '/>';
  if (kind === 'market') { for (i = 0; i < 3; i++) { o += SC.rect(300, 90 + i * 100, 580, 14, '#a0642a', 3); for (var j = 0; j < 9; j++) o += SC.circ(330 + j * 62, 78 + i * 100, 13, ['#ff5a4f', '#ffd23d', '#7bd957', '#c25cff', '#ff8a2a'][(i + j) % 5], 3); } for (i = 0; i < 9; i++) o += SC.poly((300 + i * 64) + ',0 ' + (364 + i * 64) + ',0 ' + (364 + i * 64) + ',44 ' + (332 + i * 64) + ',62 ' + (300 + i * 64) + ',44', i % 2 ? '#fff' : '#ff3d8b', 4); }
  else if (kind === 'bank') { for (i = 0; i < 4; i++) o += SC.rect(320 + i * 150, 30, 40, 400, '#fff8e8', 5); o += SC.circ(560, 250, 120, '#9aa4b8', 6) + SC.circ(560, 250, 84, '#c0c8d8', 5) + SC.circ(560, 250, 22, '#ffd23d', 4); for (i = 0; i < 6; i++) o += '<line x1="560" y1="250" x2="' + (560 + Math.cos(i * 1.047) * 84) + '" y2="' + (250 + Math.sin(i * 1.047) * 84) + '" stroke="' + SC.INK + '" stroke-width="7"/>'; for (i = 0; i < 6; i++) o += SC.circ(330 + i * 70, 440 - (i % 2) * 8, 22, '#ffd23d', 4); }
  else if (kind === 'yard') { o += SC.rect(300, 40, 580, 330, '#c9a070', 6); for (i = 0; i < 7; i++) o += '<path d="M' + (340 + i * 80) + ',90 l30,-20 l-4,60z" fill="#8a94aa"' + SC.st(3) + '/>' + SC.circ(360 + i * 80, 200, 24, '#ffd23d', 4) + SC.rect(350 + i * 80, 250, 22, 80, '#6a6a7a', 4); o += SC.circ(600, 400, 54, '#4a4a62', 6) + SC.circ(600, 400, 20, '#ff8a1f', 4); }
  else if (kind === 'fuel') { for (i = 0; i < 3; i++) o += SC.rect(360 + i * 160, 140, 80, 290, '#fff3cf', 8) + SC.rect(375 + i * 160, 170, 50, 60, '#1d2a4a', 5) + SC.circ(400 + i * 160, 200, 12, '#58ff9a', 3) + '<path d="M' + (440 + i * 160) + ',260 Q' + (490 + i * 160) + ',330 ' + (460 + i * 160) + ',420" fill="none" stroke="' + SC.INK + '" stroke-width="9"/>'; for (i = 0; i < 6; i++) o += SC.poly((300 + i * 100) + ',60 ' + (350 + i * 100) + ',60 ' + (320 + i * 100) + ',100 ' + (270 + i * 100) + ',100', '#ffd23d', 4); }
  else if (kind === 'cantina') { for (i = 0; i < 6; i++) o += SC.rect(330 + i * 90, 110, 26, 80, ['#7bd957', '#ff5a4f', '#ffd23d', '#4fd2ff'][i % 4], 8) + SC.rect(336 + i * 90, 92, 14, 20, '#fff', 3); o += SC.rect(300, 200, 580, 12, '#a0642a', 3) + SC.rect(300, 330, 600, 100, '#a0642a', 6) + '<rect x="560" y="30" width="200" height="44" rx="22" fill="#1a0b3b"' + SC.st() + '/><text x="660" y="60" text-anchor="middle" font-family="Bangers" font-size="30" fill="#7cfff0">OPEN</text>'; for (i = 0; i < 4; i++) o += '<ellipse cx="' + (360 + i * 150) + '" cy="470" rx="30" ry="10" fill="#ff3d8b"' + SC.st() + '/>'; }
  else if (kind === 'alley') { for (i = 0; i < 8; i++) for (var j2 = 0; j2 < 6; j2++) o += '<rect x="' + (i * 120 - (j2 % 2) * 60) + '" y="' + (j2 * 72) + '" width="116" height="68" fill="#7a5a6a" stroke="' + SC.INK + '" stroke-width="3"/>'; o += SC.rect(600, 250, 200, 180, '#3a8a5a', 8) + SC.rect(590, 232, 220, 28, '#2a6a44', 6) + '<path d="M340,0 L340,260 Q340,300 400,300" fill="none" stroke="' + SC.INK + '" stroke-width="16"/>' + SC.circ(780, 70, 40, '#f4f1ff', 4); }
  else if (kind === 'office') { for (i = 0; i < 4; i++) o += SC.rect(320 + i * 140, 70, 110, 140, '#fff3cf', 4) + SC.poly((330 + i * 140) + ',150 ' + (375 + i * 140) + ',110 ' + (420 + i * 140) + ',150', '#e0263f', 3) + SC.rect(345 + i * 140, 150, 60, 44, '#ffd23d', 3); o += SC.rect(300, 330, 580, 40, '#8a5a2a', 5); }
  else if (kind === 'parlour') { o += '<path d="M300,0 Q380,260 300,430 L420,430 Q480,260 420,0Z M880,0 Q800,260 880,430 L760,430 Q700,260 760,0Z" fill="#8a1a4a"' + SC.st(5) + '/>'; for (i = 0; i < 6; i++) o += '<circle cx="660" cy="220" r="' + (20 + i * 22) + '" fill="none" stroke="' + ['#ff3d8b', '#7cfff0', '#ffe14a'][i % 3] + '" stroke-width="6" opacity="' + (0.9 - i * 0.12).toFixed(2) + '"/>'; for (i = 0; i < 5; i++) o += SC.rect(330 + i * 110, 400, 10, 34, '#fff3cf', 2) + '<ellipse cx="' + (335 + i * 110) + '" cy="392" rx="6" ry="10" fill="#ffd23d"/>'; }
  else { o += SC.rect(320, 60, 520, 300, '#c8884a', 8); for (i = 0; i < 8; i++) o += SC.rect(350 + (i % 4) * 120, 90 + Math.floor(i / 4) * 120, 90, 90, ['#fff', '#ffd23d', '#ff9ac8', '#9ae0ff'][i % 4], 4); }
  return o + '</svg>';
};

/* ---------- little icons ---------- */
UI.itemIcon = function (i, cls) {
  var s = SC.st(3), b = '';
  if (i === 0) b = '<rect x="9" y="12" width="30" height="28" rx="5" fill="#d8dfe8"' + s + '/><rect x="9" y="20" width="30" height="14" fill="#ff5a4f"' + s + '/><ellipse cx="24" cy="12" rx="15" ry="5" fill="#f4f7fb"' + s + '/>';
  else if (i === 1) b = '<polygon points="6,38 42,38 36,26 12,26" fill="#aab4c4"' + s + '/><polygon points="12,26 36,26 32,14 16,14" fill="#c8d0dc"' + s + '/><line x1="16" y1="31" x2="26" y2="31" stroke="#fff" stroke-width="3"/>';
  else if (i === 2) b = '<rect x="6" y="12" width="36" height="28" rx="5" fill="#fff"' + s + '/><rect x="19" y="18" width="10" height="16" fill="#e0263f"/><rect x="16" y="21" width="16" height="10" fill="#e0263f"/><rect x="16" y="6" width="16" height="8" rx="3" fill="#7bd957"' + s + '/>';
  else if (i === 3) b = '<rect x="12" y="8" width="24" height="8" rx="3" fill="#8a5a2a"' + s + '/><path d="M10,16 L38,16 L36,40 L12,40Z" fill="#ff8a1f"' + s + '/><circle cx="20" cy="28" r="3" fill="#ffd23d"/><circle cx="29" cy="32" r="3" fill="#fff3cf"/><circle cx="27" cy="23" r="2.5" fill="#ffd23d"/>';
  else if (i === 4) b = '<rect x="10" y="10" width="28" height="28" rx="4" fill="#2faa5a"' + s + '/><rect x="17" y="17" width="14" height="14" rx="2" fill="#1d0f33"/><path d="M4,16 h6 M4,24 h6 M4,32 h6 M38,16 h6 M38,24 h6 M38,32 h6" stroke="' + SC.INK + '" stroke-width="3"/><circle cx="24" cy="24" r="3" fill="#ffd23d"/>';
  else if (i === 5) b = '<circle cx="24" cy="25" r="16" fill="#6a2ca0"' + s + '/><path d="M12,24 Q24,10 36,24 Q24,38 12,24Z" fill="#c08aff"/><circle cx="24" cy="24" r="5" fill="#1d0f33"/><circle cx="38" cy="8" r="2.5" fill="#fff"/><circle cx="8" cy="12" r="2" fill="#ffe14a"/>';
  else b = '<path d="M14,8 h20 l-3,10 q10,6 4,18 q-2,6 -11,6 q-9,0 -11,-6 q-6,-12 4,-18z" fill="#ffd23d"' + s + '/><circle cx="24" cy="26" r="5" fill="#e0263f"' + s + '/><path d="M16,13 h16" stroke="#fff" stroke-width="2.5" opacity=".7"/>';
  return '<svg class="itemicon ' + (cls || '') + '" viewBox="0 0 48 48" aria-hidden="true">' + b + '</svg>';
};
UI.icon = function (k) {
  var s = SC.st(3);
  return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ({
    coin: '<circle cx="12" cy="12" r="9" fill="#ffd23d"' + s + '/><text x="12" y="16.5" text-anchor="middle" font-family="Bangers" font-size="13" fill="#1d0f33">c</text>',
    fuel: '<rect x="4" y="5" width="11" height="16" rx="2" fill="#ff8a1f"' + s + '/><rect x="6.5" y="8" width="6" height="4" fill="#fff"/><path d="M15,10 L19,10 L19,17" fill="none"' + s + '/>',
    crate: '<rect x="3" y="6" width="18" height="15" rx="2" fill="#c8884a"' + s + '/><path d="M3,13 H21 M12,6 V21" stroke="' + SC.INK + '" stroke-width="2"/>',
    star: '<polygon points="12,2 15,9 22,9.5 16.5,14.5 18,22 12,18 6,22 7.5,14.5 2,9.5 9,9" fill="#ffd23d"' + s + '/>'
  })[k] + '</svg>';
};
