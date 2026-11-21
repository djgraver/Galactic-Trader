/* Galactic Trader 10. Part 50: inside the cantinas. Every world's bar is now a rendered room seen from the doorway, built with the town engine (gt-43-town.js):
   walls, floor and ceiling in that world's materials, a long bar with stools, shelves of bottles behind it, tables, lamps, a window (or a porthole, or no wall at all)
   onto that world's sky, and the bar's name glowing over the shelves. The person you came to meet stands behind the bar, and a couple of regulars sit at the tables.
     Meridoa, The Muddy Boot: a plank-built farm saloon with barrels and hay.     Karth-Osu, The Sand Trap: sandstone arches, rugs, urns and oil lamps.
     Ferrox, The Drill Bit: a corrugated-steel miners' canteen with pipes and hazard paint.   Kryndor Spire, Level 413 Lounge: black glass and neon.
     Nihil Station, The Long Dark: hull plating and a great round viewport onto space.         Quellin Reach, The Cafeteria: white tiles, vending machines, a snowy view.
     Halcyra, The Storm Eye: an open-air terrace over the clouds, under a striped awning. */
var BAR = { W: 1280, H: 690, cache: {} };
(function () {
  var B = TW.box, CY = TW.cyl, D = TW.D;
  /* ---------- painters for the view out of the window ---------- */
  function grad(c, x, y, w, h, cols) { var g = c.createLinearGradient(0, y, 0, y + h); cols.forEach(function (k, i) { g.addColorStop(i / (cols.length - 1), k); }); c.fillStyle = g; c.fillRect(x, y, w, h); }
  function hills(c, x, y, w, h, col, seed, amp) { var r = GT.seeded(seed); c.fillStyle = col; c.beginPath(); c.moveTo(x, y + h); var xx = x; c.lineTo(x, y + h * 0.6); while (xx < x + w) { var ww = w * (0.12 + r() * 0.2); c.quadraticCurveTo(xx + ww / 2, y + h * (0.6 - amp * r()), xx + ww, y + h * (0.55 + r() * 0.1)); xx += ww; } c.lineTo(x + w, y + h); c.closePath(); c.fill(); }
  function starsIn(c, x, y, w, h, n, seed) { var r = GT.seeded(seed); for (var k = 0; k < n; k++) { c.fillStyle = 'rgba(255,255,255,' + (0.3 + r() * 0.7).toFixed(2) + ')'; c.fillRect(x + r() * w, y + r() * h, r() < 0.1 ? 2 : 1.2, r() < 0.1 ? 2 : 1.2); } }
  var VIEW = {
    meridoa: function (c, x, y, w, h, n) { grad(c, x, y, w, h, n ? ['#06102a', '#16305a', '#2a4a5a'] : ['#5aa8f0', '#a8dcf8', '#e8f8d0']); if (n) starsIn(c, x, y, w, h * 0.6, 60, 3); hills(c, x, y + h * 0.45, w, h * 0.55, n ? '#14301c' : '#5aa848', 11, 0.3); hills(c, x, y + h * 0.6, w, h * 0.4, n ? '#0c2414' : '#3f8a38', 12, 0.25); c.strokeStyle = n ? '#2a2a2a' : '#f2ead8'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + w * 0.72, y + h * 0.62); c.lineTo(x + w * 0.72, y + h * 0.3); c.moveTo(x + w * 0.62, y + h * 0.22); c.lineTo(x + w * 0.82, y + h * 0.38); c.moveTo(x + w * 0.82, y + h * 0.22); c.lineTo(x + w * 0.62, y + h * 0.38); c.stroke(); },
    karthosu: function (c, x, y, w, h, n) { grad(c, x, y, w, h, n ? ['#0a0618', '#3a1a3a', '#6a2a2a'] : ['#c85a2c', '#f0a04a', '#ffe0a0']); if (n) starsIn(c, x, y, w, h * 0.5, 50, 5); c.fillStyle = n ? '#ffd8b0' : '#fff0c0'; c.beginPath(); c.arc(x + w * 0.25, y + h * 0.3, h * 0.1, 0, 7); c.fill(); c.fillStyle = n ? '#2a1418' : '#b06a2c'; c.beginPath(); c.moveTo(x + w * 0.55, y + h * 0.62); c.lineTo(x + w * 0.68, y + h * 0.32); c.lineTo(x + w * 0.81, y + h * 0.62); c.fill(); hills(c, x, y + h * 0.55, w, h * 0.45, n ? '#3a2418' : '#d8a058', 31, 0.25); },
    ferrox: function (c, x, y, w, h, n) { grad(c, x, y, w, h, n ? ['#0c0606', '#3a100a', '#6a2010'] : ['#5a3a34', '#c8683a', '#f0a868']); c.fillStyle = n ? '#1c0c0a' : '#7a3420'; c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + h * 0.55); c.lineTo(x + w * 0.2, y + h * 0.4); c.lineTo(x + w * 0.45, y + h * 0.58); c.lineTo(x + w * 0.7, y + h * 0.36); c.lineTo(x + w, y + h * 0.5); c.lineTo(x + w, y + h); c.fill(); [0.3, 0.52, 0.86].forEach(function (k) { c.fillStyle = n ? '#0a0404' : '#3a2018'; c.fillRect(x + w * k, y + h * 0.3, w * 0.025, h * 0.4); c.fillStyle = 'rgba(80,60,60,.5)'; c.beginPath(); c.arc(x + w * k + 6, y + h * 0.25, h * 0.07, 0, 7); c.fill(); }); },
    kryndor: function (c, x, y, w, h, n) { grad(c, x, y, w, h, ['#05030f', '#1a0c3a', '#5a1a6a']); var r = GT.seeded(7), xx = x; while (xx < x + w) { var bw = w * (0.05 + r() * 0.07), bh = h * (0.3 + r() * 0.65); c.fillStyle = '#0c0820'; c.fillRect(xx, y + h - bh, bw, bh); c.fillStyle = 'rgba(255,220,140,.8)'; for (var yy = y + h - bh + 4; yy < y + h - 3; yy += 7) for (var x2 = xx + 3; x2 < xx + bw - 3; x2 += 5) if (r() < 0.4) c.fillRect(x2, yy, 2, 3); xx += bw + 2; } c.fillStyle = '#ff5ad8'; c.fillRect(x + w * 0.3, y + h * 0.3, 6, 2); c.fillStyle = '#6fe3ff'; c.fillRect(x + w * 0.62, y + h * 0.18, 6, 2); },
    nihil: function (c, x, y, w, h) { c.fillStyle = '#02030a'; c.fillRect(x, y, w, h); var g = c.createRadialGradient(x + w * 0.3, y + h * 0.4, 0, x + w * 0.3, y + h * 0.4, w * 0.5); g.addColorStop(0, 'rgba(120,60,200,.55)'); g.addColorStop(1, 'rgba(120,60,200,0)'); c.fillStyle = g; c.fillRect(x, y, w, h); starsIn(c, x, y, w, h, 140, 9); var px = x + w * 0.66, py = y + h * 0.58, pr = h * 0.3, pg = c.createRadialGradient(px - pr * 0.4, py - pr * 0.4, 2, px, py, pr); pg.addColorStop(0, '#c8a8ff'); pg.addColorStop(0.6, '#5a3a9c'); pg.addColorStop(1, '#1a0c40'); c.fillStyle = pg; c.beginPath(); c.arc(px, py, pr, 0, 7); c.fill(); c.strokeStyle = 'rgba(220,200,255,.6)'; c.lineWidth = 3; c.beginPath(); c.ellipse(px, py, pr * 1.7, pr * 0.3, -0.3, 0, 7); c.stroke(); },
    quellin: function (c, x, y, w, h, n) { grad(c, x, y, w, h, n ? ['#060a1c', '#1a2a4c', '#4a4a7a'] : ['#8fd0f0', '#d0eeff', '#ffe8f4']); if (n) starsIn(c, x, y, w, h * 0.5, 60, 13); var r = GT.seeded(17), xx = x - 10; while (xx < x + w) { var pw = w * (0.2 + r() * 0.2), ph = h * (0.25 + r() * 0.3); c.fillStyle = n ? '#2a3458' : '#e8c8dc'; c.beginPath(); c.moveTo(xx, y + h * 0.75); c.lineTo(xx + pw / 2, y + h * 0.75 - ph); c.lineTo(xx + pw, y + h * 0.75); c.fill(); c.fillStyle = n ? '#5a6a9a' : '#fff'; c.beginPath(); c.moveTo(xx + pw * 0.38, y + h * 0.75 - ph * 0.75); c.lineTo(xx + pw / 2, y + h * 0.75 - ph); c.lineTo(xx + pw * 0.62, y + h * 0.75 - ph * 0.75); c.fill(); xx += pw * 0.7; } c.fillStyle = n ? '#34325a' : '#f6dce8'; c.fillRect(x, y + h * 0.75, w, h * 0.25); },
    halcyra: function (c, x, y, w, h, n) { grad(c, x, y, w, h, n ? ['#0c0a2a', '#3a1c4a', '#8a3a3a'] : ['#f08a3a', '#ffc860', '#fff0b8']); var gx = x + w * 0.26, gy = y + h * 0.3, gr = h * 0.36, g = c.createRadialGradient(gx - gr * 0.3, gy - gr * 0.3, 4, gx, gy, gr); g.addColorStop(0, n ? '#c88a4a' : '#ffe8a8'); g.addColorStop(1, n ? '#5a3020' : '#e08a3a'); c.fillStyle = g; c.beginPath(); c.arc(gx, gy, gr, 0, 7); c.fill(); c.strokeStyle = n ? 'rgba(255,220,160,.5)' : 'rgba(255,255,255,.8)'; c.lineWidth = 4; c.beginPath(); c.ellipse(gx, gy, gr * 1.8, gr * 0.25, -0.15, 0, 7); c.stroke(); var r = GT.seeded(21); for (var k = 0; k < 7; k++) { c.fillStyle = n ? ['#5a3440', '#7a4a48'][k % 2] : ['#fff4d0', '#ffe2a0'][k % 2]; for (var q = 0; q < 6; q++) { c.beginPath(); c.ellipse(x + r() * w, y + h * (0.62 + k * 0.06), w * 0.12, h * 0.05, 0, 0, 7); c.fill(); } } }
  };
  /* ---------- the seven rooms ---------- */
  var ROOM = {
    meridoa: { wall: '#9a6a40', wallTex: D.lines('v', 0.55, '#3a1a08', 0.35), floor: ['#6a4424', '#5a381c'], plank: 1, ceil: '#5a3a20', beams: '#3a2410', bar: '#7a4a28', barTop: '#a8743a', barTex: D.many(D.lines('v', 0.6, '#2a1408', 0.4), D.band(0.08, 0.06, '#4a2a14')), shelf: '#5a3418', lamp: '#ffc870', amb: [1.08, 0.98, 0.85], sign: ['#3a1c0a', '#ffd27a'], stool: '#5a3418', table: '#7a4a28', win: 'rect', decor: 'farm' },
    karthosu: { wall: '#c89a62', wallTex: D.lines('brick', 0.5, '#6a4a22', 0.28), floor: ['#a8603a', '#8a4a2a'], tile: 1, rug: '#8a2a2a', ceil: '#a87a4a', beams: '#6a4a22', bar: '#b08450', barTop: '#d8b278', barTex: D.many(D.lines('brick', 0.45, '#6a4a22', 0.3), D.band(0.12, 0.08, '#2a6a8a'), D.band(0.26, 0.03, '#e8c040')), shelf: '#7a5430', lamp: '#ffb050', amb: [1.12, 1.0, 0.86], sign: ['#2a1408', '#ffb050'], stool: '#7a5430', table: '#8a6040', win: 'arch', decor: 'urns' },
    ferrox: { wall: '#646c7c', wallTex: D.lines('v', 0.22, '#000', 0.3), floor: ['#3a3e48', '#30343c'], plate: 1, ceil: '#2a2e38', beams: '#8a5a2a', bar: '#5a6070', barTop: '#9aa2b4', barTex: D.many(D.lines('panel', 0.5, '#000', 0.3), function (c, w, h, q) { if (q.pass) return; for (var k = -h; k < w; k += 16) { c.fillStyle = (Math.round(k / 16) % 2) ? '#18181c' : '#e8b82c'; c.beginPath(); c.moveTo(k, h); c.lineTo(k + 16, h); c.lineTo(k + 26, h - 10); c.lineTo(k + 10, h - 10); c.fill(); } }), shelf: '#3a3e48', lamp: '#ffd080', amb: [1.08, 0.96, 0.9], sign: ['#1a0a08', '#ff7a3a'], stool: '#3a3e48', table: '#6a7284', win: 'rect', decor: 'mine' },
    kryndor: { wall: '#181c2c', wallTex: function (c, w, h, q) { if (q.pass === 1) { c.fillStyle = '#ff5ad8'; c.fillRect(0, h * 0.86, w, 3); c.fillStyle = '#6fe3ff'; c.fillRect(0, h * 0.18, w, 2); } }, floor: ['#0c0c1a', '#14142a'], grid: '#6fe3ff', ceil: '#0c0e18', beams: '#ff5ad8', bar: '#141826', barTop: '#2a3048', barTex: function (c, w, h, q) { c.fillStyle = q.pass ? '#ff5ad8' : '#3a1a3a'; c.fillRect(0, 2, w, 3); c.fillStyle = q.pass ? '#6fe3ff' : '#1a3a4a'; c.fillRect(0, h - 5, w, 3); if (q.pass) for (var k = 20; k < w; k += 60) { c.fillStyle = 'rgba(111,227,255,.5)'; c.fillRect(k, 12, 2, h - 24); } }, shelf: '#0c0e18', lamp: '#ff5ad8', lamp2: '#6fe3ff', amb: [0.92, 0.9, 1.15], sign: ['#05030f', '#ff5ad8'], stool: '#2a3048', table: '#1c2234', win: 'rect', decor: 'neon', dark: 1 },
    nihil: { wall: '#3a4256', wallTex: D.lines('panel', 0.75, '#000', 0.35), floor: ['#22283a', '#1a2030'], grate: 1, ceil: '#1c2230', beams: '#4c556c', bar: '#2a3040', barTop: '#4c556c', barTex: function (c, w, h, q) { c.fillStyle = q.pass ? '#b060ff' : '#3a1c5c'; c.fillRect(0, h - 6, w, 4); if (!q.pass) { c.strokeStyle = 'rgba(0,0,0,.4)'; for (var k = 30; k < w; k += 30) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k, h); c.stroke(); } } }, shelf: '#2a3040', lamp: '#b060ff', amb: [0.94, 0.96, 1.12], sign: ['#12081e', '#d090ff'], stool: '#4c556c', table: '#3a4256', win: 'port', decor: 'station', dark: 1 },
    quellin: { wall: '#e8ecf4', wallTex: D.lines('panel', 0.5, '#9aa4c0', 0.4), floor: ['#dfe6f2', '#c8d2e4'], tile: 1, ceil: '#f2f4fa', beams: '#c8d0e0', bar: '#f2f4fa', barTop: '#d4dae8', barTex: D.many(D.band(0.22, 0.08, '#f0a0c0'), D.lines('v', 0.7, '#9aa4c0', 0.3)), shelf: '#c8d0e0', lamp: '#cfefff', amb: [1.0, 1.0, 1.04], sign: ['#1c2434', '#7fd8f0'], stool: '#f0a0c0', table: '#f2f4fa', win: 'rect', decor: 'lab' },
    halcyra: { wall: null, floor: ['#c89a50', '#b08440'], plank: 1, ceil: null, bar: '#8a5a2a', barTop: '#e0b040', barTex: D.many(D.lines('v', 0.5, '#4a2a10', 0.35), D.band(0.1, 0.07, '#e0b040')), shelf: '#8a5a2a', lamp: '#ffd070', amb: [1.1, 1.02, 0.9], sign: ['#4a2a10', '#ffe27a'], stool: '#e0b040', table: '#f6eeda', win: 'open', decor: 'terrace' }
  };
  BAR.ROOM = ROOM;
  /* bottles on shelves, painted on the back wall */
  function shelves(cfg) {
    return function (c, w, h, q) {
      var rows = 3, top = h * (cfg.wall ? 0.355 : 0.05), bot = h * (cfg.wall ? 0.79 : 0.92), r = GT.seeded(w | 0);
      if (q.pass === 1) { if (cfg.dark) { c.fillStyle = 'rgba(255,90,216,.35)'; c.fillRect(0, top - 4, w, 3); } return; }
      if (cfg.dark) { var g = c.createLinearGradient(0, top, 0, bot); g.addColorStop(0, 'rgba(111,227,255,.25)'); g.addColorStop(1, 'rgba(255,90,216,.25)'); c.fillStyle = g; c.fillRect(0, top, w, bot - top); }
      for (var k = 0; k < rows; k++) {
        var y = top + (bot - top) * (k + 1) / rows; c.fillStyle = cfg.shelf; c.fillRect(0, y - 4, w, 6); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, y + 2, w, 3);
        for (var x = 6; x < w - 8; x += 9 + r() * 8) {
          var bh = 14 + r() * 14, bw = 5 + r() * 4, col = ['#3a8a3a', '#8a2a2a', '#c8a03a', '#2a5a9a', '#6a3a8a', '#d8d8c8', '#8a5a2a'][Math.floor(r() * 7)];
          c.fillStyle = col; c.fillRect(x, y - 4 - bh, bw, bh); c.fillRect(x + bw * 0.3, y - 4 - bh - 6, bw * 0.4, 7); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x + 1, y - bh, 1.5, bh - 8);
        }
      }
    };
  }
  /* the bar's name in light */
  function neon(text, cfg) {
    return function (c, w, h, q) {
      var fs = h * 0.62; c.font = '900 ' + fs + 'px Orbitron, Arial Black, sans-serif'; var tw = c.measureText(text).width; if (tw > w * 0.92) { fs *= w * 0.92 / tw; c.font = '900 ' + fs + 'px Orbitron, Arial Black, sans-serif'; }
      c.textAlign = 'center'; c.textBaseline = 'middle';
      if (q.pass === 0) { c.fillStyle = cfg.sign[0]; c.fillRect(0, 0, w, h); c.strokeStyle = '#000'; c.lineWidth = 3; c.strokeRect(1, 1, w - 2, h - 2); return; }
      c.shadowColor = cfg.sign[1]; c.shadowBlur = 14; c.fillStyle = cfg.sign[1]; c.fillText(text, w / 2, h / 2 + 1); c.shadowBlur = 0; c.fillStyle = '#fff8e8'; c.globalAlpha = 0.55; c.fillText(text, w / 2, h / 2 + 1); c.globalAlpha = 1;
      c.strokeStyle = cfg.sign[1]; c.lineWidth = 2; c.strokeRect(4, 4, w - 8, h - 8);
    };
  }
  /* the back wall: plain wall, the window (or porthole) and the shelves */
  function backWall(cfg, pid, night) {
    return function (c, w, h, q) {
      var X = function (wx) { return (wx + 11) / 22 * w; }, Y = function (wy) { return h - wy / 6.2 * h; };
      if (cfg.wallTex) cfg.wallTex(c, w, h, q);
      /* the window, left of the bar */
      var wx0 = X(-9.2), wx1 = X(-2.6), wy0 = Y(4.9), wy1 = Y(1.5), ww = wx1 - wx0, wh = wy1 - wy0;
      if (cfg.win !== 'open') {
        c.save(); c.beginPath();
        if (cfg.win === 'arch') { c.moveTo(wx0, wy1); c.lineTo(wx0, wy0 + ww / 2); c.arc((wx0 + wx1) / 2, wy0 + ww / 2, ww / 2, Math.PI, 0); c.lineTo(wx1, wy1); c.closePath(); }
        else if (cfg.win === 'port') { c.arc((wx0 + wx1) / 2, (wy0 + wy1) / 2, Math.min(ww, wh * 1.25) / 2, 0, 7); }
        else c.rect(wx0, wy0, ww, wh);
        c.clip(); VIEW[pid](c, wx0, wy0, ww, wh, night);
        if (q.pass === 0) { c.fillStyle = 'rgba(180,220,255,.06)'; c.fillRect(wx0, wy0, ww, wh); }
        c.restore();
        c.strokeStyle = cfg.win === 'port' ? '#8a92a4' : cfg.dark ? '#2a3048' : cfg.beams; c.lineWidth = cfg.win === 'port' ? 14 : 9;
        c.beginPath();
        if (cfg.win === 'arch') { c.moveTo(wx0, wy1); c.lineTo(wx0, wy0 + ww / 2); c.arc((wx0 + wx1) / 2, wy0 + ww / 2, ww / 2, Math.PI, 0); c.lineTo(wx1, wy1); c.closePath(); }
        else if (cfg.win === 'port') { c.arc((wx0 + wx1) / 2, (wy0 + wy1) / 2, Math.min(ww, wh * 1.25) / 2, 0, 7); }
        else { c.rect(wx0, wy0, ww, wh); c.moveTo((wx0 + wx1) / 2, wy0); c.lineTo((wx0 + wx1) / 2, wy1); c.moveTo(wx0, (wy0 + wy1) / 2); c.lineTo(wx1, (wy0 + wy1) / 2); }
        c.stroke();
        if (cfg.win === 'port' && q.pass === 0) for (var a = 0; a < 12; a++) { var an = a / 12 * 6.283, rr = Math.min(ww, wh * 1.25) / 2; c.fillStyle = '#c8ced8'; c.beginPath(); c.arc((wx0 + wx1) / 2 + Math.cos(an) * rr, (wy0 + wy1) / 2 + Math.sin(an) * rr, 3, 0, 7); c.fill(); }
      }
      c.save(); c.translate(X(0.9), 0); shelves(cfg)(c, X(9.3) - X(0.9), h, q); c.restore();
    };
  }
  function shelvesOnly(cfg) { var s = shelves(cfg); return function (c, w, h, q) { s(c, w, h, q); }; }

  /* ---------- the build ---------- */
  BAR.build = function (pid, night) {
    var cfg = ROOM[pid], meshes = [], fg = [], sg = (NP.SIGNS[pid] || {}).cantina || 'CANTINA';
    var old = TW.setCam({ cam: [0, 2.75, 9.6], look: [0.9, 2.05, -5], F: 820, W: BAR.W, H: BAR.H, CY: 0.5 });
    try {
      var cv = document.createElement('canvas'); cv.width = BAR.W; cv.height = BAR.H; var c = cv.getContext('2d');
      /* floor */
      c.fillStyle = '#000'; c.fillRect(0, 0, BAR.W, BAR.H);
      if (cfg.win === 'open') { VIEW[pid](c, 0, 0, BAR.W, BAR.H * 0.62, night); }
      TW.ground(c, [[-11, 0, -5], [11, 0, -5], [11, 0, 12], [-11, 0, 12]], cfg.floor[0]);
      var z, x;
      if (cfg.plank) for (x = -11; x <= 11; x += 0.7) TW.gline(c, [x, 0, -5], [x, 0, 12], 'rgba(0,0,0,.3)', 1.5);
      if (cfg.tile || cfg.plate || cfg.grate) { for (x = -11; x <= 11; x += cfg.grate ? 0.5 : 1.2) TW.gline(c, [x, 0, -5], [x, 0, 12], cfg.tile ? 'rgba(0,0,0,.22)' : 'rgba(0,0,0,.45)', 1.2); for (z = -5; z <= 12; z += cfg.grate ? 0.5 : 1.2) TW.gline(c, [-11, 0, z], [11, 0, z], cfg.tile ? 'rgba(0,0,0,.22)' : 'rgba(0,0,0,.45)', 1.2); }
      if (cfg.grid) { for (x = -10; x <= 10; x += 2.5) TW.gline(c, [x, 0.01, -5], [x, 0.01, 12], 'rgba(111,227,255,.35)', 2); for (z = -5; z <= 12; z += 2.5) TW.gline(c, [-11, 0.01, z], [11, 0.01, z], 'rgba(255,90,216,.3)', 2); }
      if (cfg.rug) { TW.ground(c, [[-8.5, 0.01, -0.5], [-0.5, 0.01, -0.5], [-0.5, 0.01, 6], [-8.5, 0.01, 6]], cfg.rug); TW.ground(c, [[-8, 0.02, 0], [-1, 0.02, 0], [-1, 0.02, 5.5], [-8, 0.02, 5.5]], null, '#e8c040', 3); }
      if (cfg.plate) { TW.ground(c, [[0, 0.01, -1.1], [11, 0.01, -1.1], [11, 0.01, -0.6], [0, 0.01, -0.6]], '#e8b82c'); }
      /* walls and ceiling: one big mesh each, drawn before everything else */
      var wallM = function (v, col, tex, n, zb) { var m = TW.mesh(); TW.face(m, v, col, { n: n, tex: tex }); m.zb = zb; m.noShadow = 1; meshes.push(m); return m; };
      if (cfg.wall) {
        wallM([[-11, 0, -5], [11, 0, -5], [11, 6.2, -5], [-11, 6.2, -5]], cfg.wall, backWall(cfg, pid, night), [0, 0, 1], 1e7);
        wallM([[-11, 0, 12], [-11, 0, -5], [-11, 6.2, -5], [-11, 6.2, 12]], cfg.wall, cfg.wallTex, [1, 0, 0], 1e7 - 1);
        wallM([[11, 0, -5], [11, 0, 12], [11, 6.2, 12], [11, 6.2, -5]], cfg.wall, cfg.wallTex, [-1, 0, 0], 1e7 - 1);
        wallM([[-11, 6.2, -5], [11, 6.2, -5], [11, 6.2, 12], [-11, 6.2, 12]], cfg.ceil, function (cc, w, h, q) { if (q.pass) return; cc.fillStyle = cfg.beams; for (var k = 0; k < w; k += w / 8) cc.fillRect(k, 0, 10, h); }, [0, -1, 0], 1e7 - 2);
      } else {
        /* the terrace: a railing instead of a back wall, and a striped awning over the bar */
        var rail = TW.mesh(); for (x = -10.5; x <= 10.5; x += 1.5) B(rail, [x, 0, -4.8], [0.15, 1.1, 0.15], '#e0b040'); B(rail, [0, 1.1, -4.8], [21.5, 0.14, 0.2], '#e0b040'); B(rail, [0, 0.55, -4.8], [21.5, 0.08, 0.1], '#e0b040'); rail.zb = 1e6; rail.noShadow = 1; meshes.push(rail);
        var aw = TW.mesh(); TW.face(aw, [[0, 3.9, -0.4], [11, 3.9, -0.4], [11, 4.9, -3.6], [0, 4.9, -3.6]], '#f6eeda', { n: TW.norm([0, 3.2, 1]), tex: function (cc, w, h, q) { if (q.pass) return; cc.fillStyle = '#d85a3a'; for (var k = 0; k < w; k += 36) cc.fillRect(k, 0, 18, h); } }); [0.3, 10.7].forEach(function (px) { B(aw, [px, 0, -0.5], [0.16, 3.9, 0.16], '#8a5a2a'); }); aw.zb = -40; aw.noShadow = 1; meshes.push(aw);
      }
      /* the neon name over the shelves */
      var sgm = TW.mesh(); B(sgm, cfg.wall ? [5, 4.55, -4.85] : [5, 5.05, -3.95], [7.2, 1.0, 0.12], cfg.sign[0], { tex: { front: neon(sg, cfg) }, ao: false }); sgm.zb = 1e6; sgm.noShadow = 1; meshes.push(sgm);
      if (!cfg.wall) { var sh = TW.mesh(); B(sh, [5, 0, -4.4], [8, 3.2, 0.5], cfg.shelf, { tex: { front: shelvesOnly(cfg) } }); sh.zb = 9e5; meshes.push(sh); }
      /* the bar: back counter, then the front of the bar (foreground layer, so the barkeep stands behind it) */
      var bk = TW.mesh(); B(bk, [5, 0, -4.4], [8.4, 1.0, 0.8], cfg.bar, { cols: { top: cfg.barTop } }); bk.zb = 5e5; meshes.push(bk);
      var bar = TW.mesh(); B(bar, [4.9, 0, -1.6], [8.6, 1.18, 1.0], cfg.bar, { tex: { front: cfg.barTex }, cols: { top: cfg.barTop } }); B(bar, [4.9, 1.18, -1.6], [8.9, 0.1, 1.25], cfg.barTop); B(bar, [0.45, 0, -2.9], [0.9, 1.18, 2.2], cfg.bar, { tex: { left: cfg.barTex } });
      /* glasses and a tap on the counter */
      B(bar, [3.0, 1.28, -1.7], [0.16, 0.26, 0.16], '#cfefff'); B(bar, [6.6, 1.28, -1.5], [0.16, 0.22, 0.16], '#ffd070'); B(bar, [7.4, 1.28, -1.8], [0.12, 0.7, 0.12], '#c8ced8'); B(bar, [7.4, 1.92, -1.8], [0.5, 0.1, 0.1], '#c8ced8');
      bar.noShadow = 1; fg.push(bar);
      /* stools along the bar */
      for (x = 1.6; x <= 8.6; x += 1.75) { var st = TW.mesh(); CY(st, [x, 0, -0.35], 0.07, 0.78, 6, '#2a2e3a'); CY(st, [x, 0.78, -0.35], 0.34, 0.12, 10, cfg.stool); CY(st, [x, 0, -0.35], 0.28, 0.04, 8, '#2a2e3a'); st.noShadow = 1; fg.push(st); }
      /* tables on the left */
      [[-7.4, -2.4], [-3.4, 1.2], [-8.2, 3.4]].forEach(function (tp, k) {
        var tm = TW.mesh(); CY(tm, [tp[0], 0, tp[1]], 0.1, 0.95, 6, '#2a2e3a'); CY(tm, [tp[0], 0.95, tp[1]], 1.0, 0.1, 14, cfg.table); CY(tm, [tp[0], 0, tp[1]], 0.45, 0.05, 10, '#2a2e3a');
        [[-1.3, 0], [1.3, 0]].forEach(function (o) { CY(tm, [tp[0] + o[0], 0, tp[1] + o[1]], 0.06, 0.6, 6, '#2a2e3a'); CY(tm, [tp[0] + o[0], 0.6, tp[1] + o[1]], 0.36, 0.1, 10, cfg.stool); });
        B(tm, [tp[0] - 0.2, 1.05, tp[1]], [0.14, 0.22, 0.14], '#cfefff'); tm.noShadow = 1; meshes.push(tm);
      });
      /* hanging lamps */
      var lamps = [[-7.4, -2.4], [-3.4, 1.2], [2.6, -1.3], [5.4, -1.3], [8.2, -1.3]];
      /* the bar lamps hang from a rail over the bar, so no cords cross the sign */
      var railM = TW.mesh(); B(railM, [5.2, 3.75, -1.3], [8.4, 0.12, 0.12], '#1a1c22'); [1.1, 9.3].forEach(function (rx) { B(railM, [rx, 3.3, -1.3], [0.1, 0.45, 0.1], '#1a1c22'); }); railM.noShadow = 1; railM.zb = -20; meshes.push(railM);
      lamps.forEach(function (lp, k) { var lm = TW.mesh(), top = lp[0] > 0 ? 3.75 : (cfg.wall ? 6.2 : 3.6); CY(lm, [lp[0], 3.3, lp[1]], 0.02, top - 3.3, 4, '#111'); TW.lathe(lm, [lp[0], 3.0, lp[1]], [[0, 0.42], [0.32, 0.12]], 10, '#2a2e3a'); B(lm, [lp[0], 2.92, lp[1]], [0.24, 0.1, 0.24], (k % 2 && cfg.lamp2) || cfg.lamp, { e: 2 }); lm.noShadow = 1; lm.lamp = [lp[0], 2.9, lp[1], (k % 2 && cfg.lamp2) || cfg.lamp]; meshes.push(lm); });
      /* each world's own clutter */
      BAR.DECOR[cfg.decor](meshes, cfg, night);
      var amb = cfg.amb, sun = [0.25, 0.9, 0.75];
      TW.render(c, { meshes: meshes, sun: sun, amb: amb, night: false });
      /* the foreground layer: the bar front and stools, on its own transparent canvas */
      var cf = document.createElement('canvas'); cf.width = BAR.W; cf.height = BAR.H; var f = cf.getContext('2d');
      TW.render(f, { meshes: fg, sun: sun, amb: amb, night: false });
      /* light: pools under the lamps, a glow round each bulb, bloom and a vignette */
      var glow = function (cc, alpha) { meshes.forEach(function (m) { if (!m.lamp) return; var p = TW.P(m.lamp), r = TW.F * 2.2 / p[2], g = cc.createRadialGradient(p[0], p[1], 0, p[0], p[1], r); g.addColorStop(0, m.lamp[3] + 'aa'); g.addColorStop(0.25, m.lamp[3] + '44'); g.addColorStop(1, m.lamp[3] + '00'); cc.save(); cc.globalCompositeOperation = 'lighter'; cc.globalAlpha = alpha; cc.fillStyle = g; cc.beginPath(); cc.arc(p[0], p[1], r, 0, 7); cc.fill(); cc.restore(); }); };
      var mood = cfg.dark ? 0.42 : 0.22; c.fillStyle = 'rgba(4,6,18,' + mood + ')'; c.fillRect(0, 0, BAR.W, BAR.H); glow(c, cfg.dark ? 1 : 0.85);
      if (PX.hasFilter) { var b = document.createElement('canvas'); b.width = BAR.W / 2; b.height = BAR.H / 2; var bc = b.getContext('2d'); bc.filter = 'blur(8px) brightness(1.1) contrast(1.6)'; bc.drawImage(cv, 0, 0, b.width, b.height); c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = cfg.dark ? 0.45 : 0.22; c.drawImage(b, 0, 0, BAR.W, BAR.H); c.restore(); }
      f.save(); f.globalCompositeOperation = 'source-atop'; f.fillStyle = 'rgba(4,6,18,' + mood + ')'; f.fillRect(0, 0, BAR.W, BAR.H); f.restore();
      var vg = c.createRadialGradient(BAR.W / 2, BAR.H / 2, BAR.H * 0.5, BAR.W / 2, BAR.H / 2, BAR.W * 0.7); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,8,.5)'); c.fillStyle = vg; c.fillRect(0, 0, BAR.W, BAR.H);
      /* where people go, as percentages of the picture */
      var at = function (p, hgt) { var a = TW.P(p), b2 = TW.P([p[0], p[1] + hgt, p[2]]); return { x: a[0] / BAR.W * 100, y: a[1] / BAR.H * 100, h: (a[1] - b2[1]) / BAR.H * 100 }; };
      return { bg: cv.toDataURL('image/jpeg', 0.9), fg: cf.toDataURL('image/png'), keep: at([4.4, 0, -3.1], 2.35), seats: [at([-6.0, 0, -2.7], 1.75), at([-1.9, 0, 1.2], 1.75)] };
    } finally { TW.setCam(old); }
  };
  BAR.DECOR = {
    farm: function (M, cfg) { var m = TW.mesh(); [[-10, -3.8], [-9.1, -4.2], [-9.6, -3.0]].forEach(function (p, k) { CY(m, [p[0], k === 2 ? 1.2 : 0, p[1]], 0.55, 1.2, 12, function (a, j) { return j % 3 === 0 ? '#3a3e48' : '#8a5a2a'; }); }); B(m, [-10.2, 0, 2.5], [1.4, 0.9, 1.2], '#d8b84a', { tex: { front: D.lines('h', 0.15, '#8a6a1a', 0.4) } }); m.noShadow = 1; M.push(m); },
    urns: function (M) { var m = TW.mesh(); [[-10, -4], [-9.2, -4.3], [10, 5]].forEach(function (p, k) { TW.lathe(m, [p[0], 0, p[1]], [[0, 0.3], [0.3, 0.55], [0.9, 0.62], [1.4, 0.32], [1.6, 0.36]], 12, k % 2 ? '#b85a2a' : '#d8a058'); }); m.noShadow = 1; M.push(m); },
    mine: function (M) { var m = TW.mesh(); for (var z = -4; z < 10; z += 3) { var p = TW.mesh(); B(p, [0, 5.7, z], [22, 0.22, 0.22], '#8a5a2a'); p.zb = 8e6; p.noShadow = 1; M.push(p); } [[-10, -4], [-9.1, -4.2]].forEach(function (p) { CY(m, [p[0], 0, p[1]], 0.5, 1.3, 12, function (a, j) { return j % 2 ? '#c83a2c' : '#a82a1c'; }); }); B(m, [10.2, 0, 3], [1.2, 1.8, 1.4], '#5a6070', { tex: { left: D.lines('panel', 0.4, '#000', 0.3) } }); m.noShadow = 1; M.push(m); },
    neon: function (M) { var m = TW.mesh(); [[-10.2, -1], [-10.2, 4]].forEach(function (p, k) { B(m, [p[0], 0.2, p[1]], [0.2, 5.6, 0.2], k ? '#6fe3ff' : '#ff5ad8', { e: 2 }); }); B(m, [10.6, 0, 3], [0.6, 2.4, 2.4], '#1c2234', { tex: { left: function (c, w, h, q) { if (!q.pass) return; c.fillStyle = '#ff5ad8'; c.font = '900 ' + h * 0.18 + 'px Orbitron, sans-serif'; c.textAlign = 'center'; c.fillText('JUKE', w / 2, h * 0.3); c.fillStyle = '#6fe3ff'; c.fillRect(w * 0.2, h * 0.5, w * 0.6, h * 0.08); } } }); m.noShadow = 1; M.push(m); },
    station: function (M) { var m = TW.mesh(); for (var z = -4; z < 10; z += 2.5) { var p = TW.mesh(); B(p, [0, 6.0, z], [22, 0.25, 0.4], '#4c556c'); p.zb = 8e6; p.noShadow = 1; M.push(p); } B(m, [10.3, 0, 2], [1.2, 2.2, 1.6], '#2a3040', { tex: { left: function (c, w, h, q) { c.fillStyle = q.pass ? '#5dff8f' : '#0a2a14'; c.fillRect(w * 0.15, h * 0.15, w * 0.7, h * 0.35); if (q.pass) { c.fillStyle = '#0a2a14'; c.font = '700 ' + h * 0.08 + 'px Orbitron, sans-serif'; c.textAlign = 'center'; c.fillText('ODDS', w / 2, h * 0.34); } } } }); m.noShadow = 1; M.push(m); },
    lab: function (M) { var m = TW.mesh(); [[10.3, 0.5, '#ff7ad9'], [10.3, 2.6, '#7fd8f0']].forEach(function (v) { B(m, [v[0], 0, v[1]], [1.2, 2.5, 1.6], '#f2f4fa', { tex: { left: function (c, w, h, q) { c.fillStyle = q.pass ? v[2] : '#c8d0e0'; c.fillRect(w * 0.12, h * 0.1, w * 0.76, h * 0.5); if (!q.pass) { c.fillStyle = '#9aa4c0'; for (var k = 0; k < 4; k++) c.fillRect(w * 0.18, h * (0.15 + k * 0.11), w * 0.64, 2); } } } }); }); TW.lathe(m, [-10, 0, -4], [[0, 0.4], [0.8, 0.45]], 10, '#f0a0c0'); TW.dome(m, [-10, 0.8, -4], 0.7, 10, '#5aa848', { rings: 3 }); m.noShadow = 1; M.push(m); },
    terrace: function (M) { var m = TW.mesh(); [[-9.5, -3.6], [9.6, 4.5]].forEach(function (p) { CY(m, [p[0], 0, p[1]], 0.05, 3.6, 4, '#8a5a2a'); TW.lathe(m, [p[0], 3.6, p[1]], [[0, 0.05], [0.4, 0.55], [0.9, 0.7], [1.4, 0.55], [1.7, 0.01]], 12, function (a, j) { return j % 2 ? '#d85a3a' : '#f6eeda'; }); }); m.noShadow = 1; M.push(m); }
  };
  BAR.get = function (pid, night) { var k = pid + (night ? '/n' : '/d'); return BAR.cache[k] || (BAR.cache[k] = BAR.build(pid, night)); };
})();

/* ---------- the cantina page ---------- */
function barPerson(t, yaw) { var tt = Object.create(t); if (yaw !== undefined) tt.yaw = yaw; return '<svg viewBox="-82 -112 164 262" aria-hidden="true"><g transform="scale(' + t.size.toFixed(2) + ')">' + CH.torso(tt) + CH.headTurned(tt) + '</g></svg>'; }
PAGES.cantina = function () {
  var p = plan(), night = SC.night ? SC.night(S) : !!S.visit.night, R = BAR.get(p.id, night), w = NP.who2(p.id), who = NP.who(p.id), sg = NP.SIGNS[p.id].cantina;
  var keep = R.keep, h = '<div class="loc barloc">' + '<div class="in"><div class="main">';
  h += '<div class="barview"><img class="barbg" src="' + R.bg + '" alt="Inside ' + esc(sg) + '">';
  /* two regulars at the tables, then the person you came to meet behind the bar */
  var ar = BAR.H / BAR.W;
  R.seats.forEach(function (st, k) { var pt = CH.fromSeed('patron' + p.id + k), ht = st.h, wd = ht * 100 / 175 * ar; h += '<div class="barnpc pat" style="left:' + (st.x - wd / 2).toFixed(2) + '%;top:' + (st.y - ht).toFixed(2) + '%;height:' + ht.toFixed(2) + '%;width:' + wd.toFixed(2) + '%"><svg viewBox="0 0 100 175">' + CH.sprite(pt) + '</svg></div>'; });
  var ph = keep.h * 1.55, kh = ph * 0.6, kw = kh * 164 / 262 * ar; h += '<div class="barnpc keep" style="left:' + (keep.x - kw / 2).toFixed(2) + '%;top:' + (keep.y - ph).toFixed(2) + '%;height:' + kh.toFixed(2) + '%;width:' + kw.toFixed(2) + '%">' + barPerson(w) + '</div>';
  h += '<img class="barbg barfg" src="' + R.fg + '" alt="">';
  h += '<div class="barsay"><span class="nm">' + esc(w.name) + ', ' + esc(who.job) + '</span><span id="say">' + esc(ui.say.cantina || 'Pull up a stool.') + '</span></div></div>';
  h += '<div class="barrow"><div class="panel"><h2 class="hd">' + esc(sg) + '</h2><p style="margin:0">' + esc(w.name) + ' is behind the bar tonight, and the regulars are in their usual seats. Buy a round and see who wants to talk. Once per visit.</p>' + storyCard(S.visit.encountered, 'encounter', 'Round bought', 'Buy a round', 'encounter') + '</div>';
  h += '<div class="talk"><button class="btn big blue" data-act="leave" data-label="Walk back to the street">Back to the street</button></div></div>';
  return h + '</div></div></div>';
};
