/* Galactic Trader 10. Part 51: the odd jobs, redone. Same eight games and the same controls, rebuilt to look like a proper space game:
   the picture is drawn at twice the resolution, the art is lit and glowing instead of outlined cartoon shapes, things explode into particles,
   the backgrounds scroll in layers, and your own ship (the 3D model from the hangar) flies the ship games.
   Rules stay close to the old ones. A few were tuned (see GOALS10 and the notes per game) so a great run earns Gold, measured with bots in gt-mgsim.js.
   Logic still runs on a 640 x 400 field, so taps, keys and buttons work exactly as before. */
(function () {
  var W = 640, H = 400, TAU = Math.PI * 2, rnd = Math.random;
  MG.SC = 2;
  /* ---------- the shared kit ---------- */
  var K = MG.K = {};
  K.cache = {};
  K.off = function (key, w, h, paint) { var c = K.cache[key]; if (c) return c; if (typeof document === 'undefined' || !document.createElement('canvas').getContext) return null; c = document.createElement('canvas'); c.width = w * MG.SC; c.height = h * MG.SC; var x = c.getContext('2d'); x.scale(MG.SC, MG.SC); paint(x, w, h); return (K.cache[key] = c); };
  K.blit = function (c, key, w, h, paint, x, y) { var o = K.off(key, w, h, paint); if (o) c.drawImage(o, x || 0, y || 0, w, h); };
  K.seeded = function (s) { return GT.seeded(s); };
  K.glow = function (c, x, y, r, col, a) { var g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a === undefined ? 1 : a; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.restore(); };
  K.orb = function (c, x, y, r, base, hi, lo) { var g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r * 1.05); g.addColorStop(0, hi || '#ffffff'); g.addColorStop(0.35, base); g.addColorStop(1, lo || '#05060e'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); };
  K.text = function (c, s, x, y, size, fill, al, glow) { c.save(); c.font = '900 ' + Math.round(size * 0.78) + 'px Orbitron, "Arial Black", sans-serif'; c.textAlign = al || 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = Math.max(3, size / 7); c.strokeStyle = 'rgba(2,4,12,.9)'; c.strokeText(s, x, y); if (glow !== false) { c.shadowColor = fill || '#6fe3ff'; c.shadowBlur = size / 3; } c.fillStyle = fill || '#e8f4ff'; c.fillText(s, x, y); c.restore(); };
  MG.T = function (c, s, x, y, size, fill, al) { K.text(c, s, x, y, size, fill, al); };
  /* space backdrop: gradient, nebula and three layers of stars; dir 'x' or 'y' scrolls it */
  K.space = function (c, G, o) {
    o = o || {}; var key = 'sp' + (o.seed || 1) + (o.tint || '');
    K.blit(c, key, W, H, function (x) { var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, o.top || '#05061a'); g.addColorStop(1, o.bot || '#120a30'); x.fillStyle = g; x.fillRect(0, 0, W, H); var r = K.seeded(o.seed || 1); for (var k = 0; k < 4; k++) { var nx = r() * W, ny = r() * H, nr = 120 + r() * 200, col = (o.neb || ['#5a2a9c', '#1a6a8c', '#8a2a7a', '#2a3a9c'])[k % 4], gg = x.createRadialGradient(nx, ny, 0, nx, ny, nr); gg.addColorStop(0, col + '66'); gg.addColorStop(1, col + '00'); x.fillStyle = gg; x.fillRect(0, 0, W, H); } });
    var r = K.seeded((o.seed || 1) + 7), sp = o.speed || 0, t = G.t || 0;
    for (var i = 0; i < 120; i++) {
      var z = 0.25 + r() * 0.75, x = r() * W, y = r() * H, tw = 0.55 + 0.45 * Math.sin(t * (1 + r() * 3) + i);
      if (o.dir === 'y') y = (y + t * sp * z) % H; else if (o.dir === 'x') x = ((x - t * sp * z) % W + W) % W;
      c.globalAlpha = (0.25 + z * 0.65) * tw; c.fillStyle = z > 0.85 ? '#cfeaff' : '#ffffff';
      if (o.dir && sp > 120 && z > 0.6) { c.fillRect(o.dir === 'x' ? x : x - 0.6, o.dir === 'y' ? y - z * sp * 0.04 : y - 0.6, o.dir === 'x' ? z * sp * 0.04 : 1.2, o.dir === 'y' ? z * sp * 0.04 : 1.2); }
      else c.fillRect(x - z, y - z, z * 2, z * 2);
    }
    c.globalAlpha = 1;
  };
  /* particles */
  K.burst = function (G, x, y, col, n, sp, life, size) { G.parts = G.parts || []; for (var i = 0; i < (n || 16); i++) { var a = rnd() * TAU, v = (sp || 140) * (0.3 + rnd() * 0.9); G.parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: (life || 0.6) * (0.6 + rnd() * 0.6), col: col, s: (size || 2.5) * (0.6 + rnd() * 0.8) }); } };
  K.tick = function (G, dt) { if (!G.parts) return; G.parts.forEach(function (p) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 1 - dt * 1.5; p.vy *= 1 - dt * 1.5; }); G.parts = G.parts.filter(function (p) { return p.t < p.life; }); };
  K.parts = function (c, G) { if (!G.parts) return; c.save(); c.globalCompositeOperation = 'lighter'; G.parts.forEach(function (p) { var k = 1 - p.t / p.life; c.globalAlpha = k; c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, p.s * (0.5 + k * 0.5), 0, TAU); c.fill(); }); c.restore(); };
  /* your own ship, from the hangar */
  K.ship = function (c, x, y, s, yaw, pitch, roll, flame) {
    var id = (typeof S !== 'undefined' && S && S.shipId) || 'wayfarer', sh = GT.SHIPS ? GT.SHIPS.filter(function (q) { return q.id === id; })[0] : null;
    if (typeof G3 === 'undefined' || !G3.ship || !sh) { c.fillStyle = '#6fe3ff'; c.beginPath(); c.moveTo(x, y - 18 * s / 30); c.lineTo(x + 16 * s / 30, y + 14 * s / 30); c.lineTo(x - 16 * s / 30, y + 14 * s / 30); c.fill(); return; }
    G3.draw(c, G3.ship(id, sh.hue), { x: x, y: y, s: s, yaw: yaw, pitch: pitch, roll: roll || 0, flame: flame || 1 });
  };
  K.hearts = function (c, n, max, col) { for (var h = 0; h < max; h++) { var x = 22 + h * 26, y = 24; if (h < n) { K.glow(c, x, y, 16, col, 0.6); K.orb(c, x, y, 8, col, '#fff', '#300'); } else { c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 8, 0, TAU); c.stroke(); } } };
  K.rock = function (c, x, y, r, seed, rot, tone, hit) {
    var rr = K.seeded(seed), n = 9, pts = []; for (var i = 0; i < n; i++) pts.push(r * (0.78 + rr() * 0.3));
    c.save(); c.translate(x, y); c.rotate(rot || 0); c.beginPath(); pts.forEach(function (q, i) { var a = i / n * TAU; if (i) c.lineTo(Math.cos(a) * q, Math.sin(a) * q); else c.moveTo(Math.cos(a) * q, Math.sin(a) * q); }); c.closePath();
    var g = c.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.1); g.addColorStop(0, hit ? '#ffffff' : tone[0]); g.addColorStop(0.55, hit ? '#ffe8c8' : tone[1]); g.addColorStop(1, tone[2]); c.fillStyle = g; c.fill();
    c.fillStyle = 'rgba(0,0,0,.28)'; for (var k = 0; k < 3; k++) { c.beginPath(); c.arc((rr() - 0.5) * r * 1.0, (rr() - 0.5) * r * 1.0, r * (0.12 + rr() * 0.14), 0, TAU); c.fill(); }
    c.restore();
  };
  /* ---------- the runner: picture at twice the size, lit HUD ---------- */
  var baseRun = MG.run;
  MG.run = function (id, done, opts) {
    baseRun(id, done, opts);
    if (MG.cv) { MG.cv.width = W * MG.SC; MG.cv.height = H * MG.SC; MG.cx = MG.cv.getContext('2d'); if (MG.fit) MG.fit(); }
    if (MG.G) MG.G.parts = [];
  };
  MG.loop = function (now) {
    var g = MG.g, G = MG.G, c = MG.cx, dt = Math.min(0.05, (now - MG.last) / 1000); MG.last = now; if (!g || !MG.state) return;
    if (MG.state === 'count') { var n0 = Math.ceil(MG.cd); MG.cd -= dt; if (Math.ceil(MG.cd) !== n0 && MG.cd > 0) SFX.play('blip'); if (MG.cd <= 0) { MG.state = 'play'; SFX.play('tick'); } }
    if (MG.state === 'play') {
      G.t += dt; g.update(G, dt, MG.inp);
      G.fx.forEach(function (f) { f.t += dt; f.y -= 40 * dt; }); G.fx = G.fx.filter(function (f) { return f.t < 0.9; }); G.shake = Math.max(0, G.shake - dt * 30);
      MG.inp.hits = {}; MG.inp.taps = [];
      if (G.t >= g.dur || G.over) { MG.state = 'result'; MG.finish(); }
    }
    K.tick(G, MG.state === 'play' ? dt : dt * 0.5);
    c.setTransform(MG.SC, 0, 0, MG.SC, 0, 0); c.save(); if (G.shake > 0) c.translate((rnd() - 0.5) * G.shake, (rnd() - 0.5) * G.shake);
    g.draw(c, G, MG.inp); K.parts(c, G);
    G.fx.forEach(function (f) { c.globalAlpha = Math.max(0, 1 - f.t / 0.9); K.text(c, f.txt, f.x, f.y, 24, f.col); c.globalAlpha = 1; }); c.restore();
    if (MG.state === 'count') { c.fillStyle = 'rgba(2,4,14,.55)'; c.fillRect(0, 0, W, H); K.text(c, MG.cd > 0.5 ? String(Math.ceil(MG.cd)) : 'GO!', W / 2, H / 2, 110, '#ffc24a'); }
    $('mg-s').textContent = Math.round(G.score); var tb = $('mg-t'); if (tb) { var fr = Math.max(0, 1 - G.t / g.dur); tb.style.width = (fr * 100) + '%'; tb.style.background = fr < 0.25 ? 'var(--bad)' : fr < 0.5 ? 'var(--mustard)' : 'var(--lime)'; }
    MG.raf = requestAnimationFrame(MG.loop);
  };

  var G_ = MG.games;
  /* ================= 1. CRATER CRITTERS ================= */
  var cell = function (i) { return { x: 130 + (i % 3) * 190, y: 130 + Math.floor(i / 3) * 105 }; };  /* the same spots the taps aim at */
  G_.pests.update = (function (base) { return function (G, dt, inp) {
    var before = G.cells.map(function (c) { return c.hit; }); base(G, dt, inp);
    G.cells.forEach(function (c, i) { if (c.hit && !before[i] && c.kind) { var p = cell(i); K.burst(G, p.x, p.y - 30, c.kind === 3 ? '#ff6b7d' : c.kind === 2 ? '#ffd23d' : '#c8b8ff', 18, 160, 0.5, 3); } });
  }; })(G_.pests.update);
  G_.pests.draw = function (c, G) {
    K.space(c, G, { seed: 3, top: '#02030c', bot: '#0c0a24' });
    /* a planet rising over the moon */
    K.glow(c, 540, 70, 90, 'rgba(90,170,255,.55)'); K.orb(c, 540, 70, 46, '#2a7ad8', '#bfe4ff', '#04102a'); c.fillStyle = 'rgba(90,220,130,.75)'; c.beginPath(); c.ellipse(525, 60, 18, 10, 0.4, 0, TAU); c.ellipse(560, 86, 12, 7, -0.3, 0, TAU); c.fill();
    K.blit(c, 'moon', W, H, function (x) {
      var g = x.createLinearGradient(0, 90, 0, H); g.addColorStop(0, '#a8acbc'); g.addColorStop(0.4, '#7a7e90'); g.addColorStop(1, '#3a3c4c'); x.fillStyle = g; x.beginPath(); x.moveTo(0, 104); x.quadraticCurveTo(320, 70, 640, 104); x.lineTo(640, 400); x.lineTo(0, 400); x.closePath(); x.fill();
      var r = K.seeded(44); for (var k = 0; k < 40; k++) { var cx = r() * W, cy = 110 + r() * 290, cr = 3 + r() * 14; x.fillStyle = 'rgba(30,30,50,.25)'; x.beginPath(); x.ellipse(cx, cy, cr, cr * 0.4, 0, 0, TAU); x.fill(); x.strokeStyle = 'rgba(255,255,255,.12)'; x.lineWidth = 1; x.beginPath(); x.ellipse(cx, cy - 1, cr, cr * 0.4, 0, Math.PI, TAU); x.stroke(); }
      for (var i = 0; i < 9; i++) { var p = cell(i), gg = x.createRadialGradient(p.x, p.y + 2, 4, p.x, p.y + 2, 62); gg.addColorStop(0, '#05060e'); gg.addColorStop(0.7, '#1a1b28'); gg.addColorStop(1, 'rgba(26,27,40,0)'); x.fillStyle = gg; x.beginPath(); x.ellipse(p.x, p.y, 62, 22, 0, 0, TAU); x.fill(); x.strokeStyle = 'rgba(220,225,240,.55)'; x.lineWidth = 2; x.beginPath(); x.ellipse(p.x, p.y, 60, 21, 0, 0.1, Math.PI - 0.1); x.stroke(); x.strokeStyle = 'rgba(0,0,0,.4)'; x.beginPath(); x.ellipse(p.x, p.y, 60, 21, 0, Math.PI + 0.1, TAU - 0.1); x.stroke(); }
    });
    G.cells.forEach(function (cl, i) {
      if (!cl.kind) return; var p = cell(i), x = p.x, y = p.y, rise = cl.hit ? 0.35 : Math.min(1, cl.t / 0.12), by = y + 18 - rise * 58;
      c.save(); c.beginPath(); c.rect(x - 70, y - 110, 140, 110); c.ellipse(x, y, 60, 21, 0, 0, Math.PI); c.clip();
      if (cl.kind === 3) {
        /* the station cat, in her little helmet */
        c.fillStyle = '#f0a050'; c.beginPath(); c.moveTo(x - 24, by - 26); c.lineTo(x - 16, by - 50); c.lineTo(x - 6, by - 32); c.moveTo(x + 24, by - 26); c.lineTo(x + 16, by - 50); c.lineTo(x + 6, by - 32); c.fill();
        K.orb(c, x, by - 12, 26, '#f0a050', '#ffe0b0', '#7a3a10'); c.fillStyle = '#1a1028'; c.beginPath(); c.ellipse(x - 9, by - 16, 4, 6, 0, 0, TAU); c.ellipse(x + 9, by - 16, 4, 6, 0, 0, TAU); c.fill(); c.fillStyle = '#ff8aa0'; c.beginPath(); c.arc(x, by - 6, 3, 0, TAU); c.fill();
        c.strokeStyle = '#3a2010'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x - 6, by - 4); c.lineTo(x - 22, by - 8); c.moveTo(x + 6, by - 4); c.lineTo(x + 22, by - 8); c.stroke();
        c.strokeStyle = 'rgba(200,240,255,.8)'; c.lineWidth = 2.5; c.beginPath(); c.arc(x, by - 14, 34, 0, TAU); c.stroke(); c.fillStyle = 'rgba(180,230,255,.12)'; c.fill(); c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(x - 14, by - 32, 8, 4, -0.6, 0, TAU); c.fill();
      } else {
        var gold = cl.kind === 2, fur = gold ? ['#ffd23d', '#fff6c8', '#8a5a08'] : ['#8a6ad0', '#d8c8ff', '#2a1858'];
        K.orb(c, x, by - 10, 28, fur[0], fur[1], fur[2]);
        c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x - 10, by - 14, 7, 8, 0, 0, TAU); c.ellipse(x + 10, by - 14, 7, 8, 0, 0, TAU); c.fill(); c.fillStyle = '#120a20'; c.beginPath(); c.arc(x - 9, by - 12, 3.4, 0, TAU); c.arc(x + 11, by - 12, 3.4, 0, TAU); c.fill();
        c.fillStyle = '#fff'; c.fillRect(x - 6, by + 2, 5, 7); c.fillRect(x + 1, by + 2, 5, 7);
        /* mining helmet with a lamp */
        c.fillStyle = gold ? '#c8a030' : '#3a4256'; c.beginPath(); c.arc(x, by - 26, 22, Math.PI, TAU); c.fill(); c.fillRect(x - 25, by - 28, 50, 5); K.glow(c, x, by - 38, 22, gold ? 'rgba(255,240,180,.9)' : 'rgba(255,230,140,.8)'); K.orb(c, x, by - 38, 5, '#fff6c8', '#fff', '#c8a030');
        if (gold) { K.glow(c, x + 18, by - 30, 10, 'rgba(255,255,255,.9)', Math.abs(Math.sin(G.t * 8))); }
      }
      c.restore();
      if (cl.hit) K.text(c, cl.kind === 3 ? 'MROW!' : 'BONK', x, by - 62, 24, cl.kind === 3 ? '#ff6b7d' : '#ffe27a');
    });
    var cmb = Math.min(10, Math.floor(G.combo / 3) * 2);
    K.text(c, 'COMBO x' + G.combo, 18, 380, 18, G.combo >= 6 ? '#ffc24a' : '#cfe4ff', 'left'); if (cmb) K.text(c, '+' + cmb + ' BONUS', 170, 380, 14, '#5dff8f', 'left');
  };

  /* ================= 2. HYPERLANE DASH: a lane runner through a warp tunnel, in perspective ================= */
  var hz = 118, u = function (y) { return Math.max(0, (y + 40) / 500); }, sY = function (y) { return hz + 300 * Math.pow(u(y), 1.55); }, sS = function (y) { return 0.12 + 0.95 * Math.pow(u(y), 1.55); }, sX = function (lane, y) { return 320 + (lane - 1) * 150 * sS(y); };
  G_.tomb.update = (function (base) { return function (G, dt, inp) {
    var lives = G.lives, gems = G.gems; base(G, dt, inp);
    var px = sX(G.lx, 320), py = sY(320);
    if (G.gems > gems) K.burst(G, px, py - 20, '#6fe3ff', 14, 150, 0.45, 2.5);
    if (G.lives < lives) K.burst(G, px, py - 10, '#ff7a3a', 30, 220, 0.7, 3.5);
  }; })(G_.tomb.update);
  G_.tomb.draw = function (c, G) {
    var t = G.t, sp = 230 + t * 7;
    var g = c.createRadialGradient(320, hz, 10, 320, hz + 80, 520); g.addColorStop(0, '#1c1a58'); g.addColorStop(0.35, '#0a0a2a'); g.addColorStop(1, '#020208'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    K.glow(c, 320, hz, 120, 'rgba(160,120,255,.55)');
    /* tunnel rings rushing toward you */
    for (var k = 0; k < 14; k++) {
      var yy = ((G.dist * 0.9 + k * 38) % 532) - 40, s = sS(yy), cy = sY(yy), rx = 330 * s * 1.4, ry = 210 * s * 1.3, al = Math.min(1, u(yy) * 1.4);
      c.strokeStyle = 'rgba(111,227,255,' + (0.08 + 0.35 * al).toFixed(3) + ')'; c.lineWidth = 1 + 3 * s;
      c.beginPath(); for (var e = 0; e <= 6; e++) { var a = e / 6 * TAU + Math.PI / 6; var x = 320 + Math.cos(a) * rx, y = cy - ry * 0.55 + Math.sin(a) * ry; if (e) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke();
    }
    /* the three lanes */
    c.lineWidth = 2; [0.5, 1.5].forEach(function (l) { c.strokeStyle = 'rgba(255,90,216,.45)'; c.beginPath(); c.moveTo(sX(l, -40), sY(-40)); c.lineTo(sX(l, 460), sY(460)); c.stroke(); });
    c.strokeStyle = 'rgba(111,227,255,.5)'; [-0.5, 2.5].forEach(function (l) { c.beginPath(); c.moveTo(sX(l, -40), sY(-40)); c.lineTo(sX(l, 460), sY(460)); c.stroke(); });
    for (var d = 0; d < 16; d++) { var yy2 = ((G.dist * 1.0 + d * 32) % 512) - 40; [0.5, 1.5].forEach(function (l) { var s2 = sS(yy2); c.fillStyle = 'rgba(255,90,216,' + (0.2 + 0.6 * u(yy2)).toFixed(2) + ')'; c.fillRect(sX(l, yy2) - 1.5 * s2 - 1, sY(yy2), 3 * s2 + 2, 10 * s2); }); }
    /* obstacles, far ones first */
    G.obs.slice().sort(function (a, b) { return a.y - b.y; }).forEach(function (o) {
      var s = sS(o.y), x = sX(o.lane, o.y), y = sY(o.y) - 26 * s;
      if (o.kind === 'gem') { K.glow(c, x, y, 40 * s, 'rgba(111,227,255,.8)'); c.save(); c.translate(x, y); c.rotate(t * 2); c.fillStyle = '#bff4ff'; c.beginPath(); c.moveTo(0, -20 * s); c.lineTo(13 * s, 0); c.lineTo(0, 20 * s); c.lineTo(-13 * s, 0); c.closePath(); c.fill(); c.fillStyle = '#2fa8c8'; c.beginPath(); c.moveTo(0, -20 * s); c.lineTo(13 * s, 0); c.lineTo(0, 4 * s); c.closePath(); c.fill(); c.restore(); }
      else if (o.kind === 'spike') { K.glow(c, x, y, 50 * s, 'rgba(255,60,60,.6)'); K.orb(c, x, y, 20 * s, '#a01c14', '#ff8a7a', '#1a0404'); c.strokeStyle = '#ffb0a0'; c.lineWidth = 3 * s; for (var q = 0; q < 8; q++) { var a2 = q / 8 * TAU + t; c.beginPath(); c.moveTo(x + Math.cos(a2) * 18 * s, y + Math.sin(a2) * 18 * s); c.lineTo(x + Math.cos(a2) * 30 * s, y + Math.sin(a2) * 30 * s); c.stroke(); } K.glow(c, x, y, 10 * s, Math.sin(t * 12) > 0 ? 'rgba(255,255,255,.95)' : 'rgba(255,80,80,.9)'); }
      else if (o.kind === 'boulder') { K.rock(c, x, y, 34 * s, 7 + Math.floor(o.ph * 10), t * 0.8 + o.ph, ['#b8a898', '#7a6a5a', '#1a140e']); }
      else { /* a drone that wanders between lanes */ K.glow(c, x, y, 40 * s, 'rgba(255,90,216,.45)'); c.fillStyle = '#4c556c'; c.beginPath(); c.ellipse(x, y, 30 * s, 10 * s, 0, 0, TAU); c.fill(); K.orb(c, x, y - 6 * s, 13 * s, '#8a92a4', '#e8f0ff', '#1a1e2a'); K.glow(c, x, y - 6 * s, 10 * s, 'rgba(255,40,80,1)'); c.fillStyle = '#ff5ad8'; [-1, 0, 1].forEach(function (q) { c.fillRect(x + q * 16 * s - 2 * s, y + 2 * s, 4 * s, 3 * s); }); }
    });
    /* your ship, from behind */
    var px = sX(G.lx, 320), py = sY(320), fl = G.inv > 0 && Math.floor(t * 14) % 2;
    if (!fl) { K.glow(c, px, py + 6, 60, 'rgba(255,170,80,.35)'); K.ship(c, px, py - 8, 46, 1.52, 0.42, (G.lane - G.lx) * -0.9, 1.25 + Math.sin(t * 40) * 0.1); }
    K.hearts(c, G.lives, 3, '#ff5a4f'); K.text(c, 'CRYSTALS ' + G.gems, 620, 24, 15, '#6fe3ff', 'right');
  };

  /* ================= 3. ROCK SORTER ================= */
  G_.ore.update = (function (base) { return function (G, dt, inp) {
    var n = G.fly.length; base(G, dt, inp);
    if (G.fly.length > n) { var f = G.fly[G.fly.length - 1]; K.burst(G, f.x, 250, f.ok ? (f.ore ? '#ffb050' : '#9fb4d8') : '#ff4a4a', f.ok ? 12 : 20, 140, 0.4, 2.5); }
  }; })(G_.ore.update);
  function oreItem(c, o, x, y, t) {
    if (o.ore) { var tones = [['#d88a3a', '#8a4a1a', '#2a1406'], ['#c8a040', '#7a5a1a', '#2a1c06'], ['#4ac0b0', '#1a6a6a', '#062a2a']][o.v]; K.rock(c, x, y, 20, 30 + o.v * 7 + Math.floor(x / 97), 0, ['#9a8a7a', '#5a4a3a', '#1a140e']); c.strokeStyle = tones[0]; c.lineWidth = 2.5; c.shadowColor = tones[0]; c.shadowBlur = 8; c.beginPath(); c.moveTo(x - 12, y - 4); c.lineTo(x - 2, y + 2); c.lineTo(x + 6, y - 6); c.lineTo(x + 12, y + 4); c.stroke(); c.shadowBlur = 0; K.glow(c, x, y, 26, tones[0] + '66'); }
    else if (o.v === 0) { c.fillStyle = '#8a92a4'; c.beginPath(); c.moveTo(x - 20, y + 12); c.lineTo(x - 16, y - 12); c.lineTo(x + 2, y - 16); c.lineTo(x + 6, y - 2); c.lineTo(x + 20, y - 6); c.lineTo(x + 18, y + 12); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x - 14, y - 10, 12, 3); c.fillStyle = '#3a4256'; c.beginPath(); c.arc(x - 6, y + 4, 3, 0, TAU); c.arc(x + 8, y + 4, 3, 0, TAU); c.fill(); }
    else if (o.v === 1) { c.save(); c.translate(x, y); c.rotate(t); c.fillStyle = '#6a7284'; for (var k = 0; k < 8; k++) { c.rotate(TAU / 8); c.fillRect(-4, -20, 8, 8); } c.beginPath(); c.arc(0, 0, 14, 0, TAU); c.fill(); c.fillStyle = '#1a1e2a'; c.beginPath(); c.arc(0, 0, 5, 0, TAU); c.fill(); c.restore(); }
    else { var g = c.createLinearGradient(x - 10, 0, x + 10, 0); g.addColorStop(0, '#5a8a6a'); g.addColorStop(0.5, '#a8d8b8'); g.addColorStop(1, '#3a5a4a'); c.fillStyle = g; c.fillRect(x - 10, y - 16, 20, 30); c.fillStyle = '#c83a2c'; c.fillRect(x - 10, y - 6, 20, 8); c.fillStyle = '#c8ced8'; c.fillRect(x - 8, y - 20, 16, 5); }
  }
  G_.ore.draw = function (c, G) {
    var sp = 120 + G.t * 6;
    K.blit(c, 'oredeck', W, H, function (x) {
      var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1c2230'); g.addColorStop(1, '#0a0d14'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.strokeStyle = 'rgba(120,140,180,.12)'; x.lineWidth = 1; for (var i = 0; i < W; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); } for (var j = 0; j < H; j += 32) { x.beginPath(); x.moveTo(0, j); x.lineTo(W, j); x.stroke(); }
      /* the two hoppers */
      [[95, '#d8641e', 'ORE'], [545, '#6a7a94', 'SCRAP']].forEach(function (h) { var gg = x.createLinearGradient(h[0] - 80, 0, h[0] + 80, 0); gg.addColorStop(0, '#2a3040'); gg.addColorStop(0.5, '#4c556c'); gg.addColorStop(1, '#2a3040'); x.fillStyle = gg; x.beginPath(); x.moveTo(h[0] - 80, 40); x.lineTo(h[0] + 80, 40); x.lineTo(h[0] + 50, 160); x.lineTo(h[0] - 50, 160); x.closePath(); x.fill(); x.fillStyle = '#05070d'; x.beginPath(); x.ellipse(h[0], 46, 76, 12, 0, 0, TAU); x.fill(); x.fillStyle = h[1]; x.fillRect(h[0] - 60, 74, 120, 34); });
      /* the belt bed */
      var bg = x.createLinearGradient(0, 226, 0, 300); bg.addColorStop(0, '#3a4256'); bg.addColorStop(0.5, '#1a1e2a'); bg.addColorStop(1, '#0a0c12'); x.fillStyle = bg; x.fillRect(0, 226, W, 74); x.fillStyle = '#8a92a4'; x.fillRect(0, 222, W, 4); x.fillRect(0, 300, W, 3);
    });
    /* moving rollers */
    c.fillStyle = 'rgba(160,170,190,.35)'; for (var b = 0; b < 26; b++) { var bx = ((b * 28 + G.t * sp) % 728) - 28; c.fillRect(bx, 230, 3, 66); }
    K.text(c, 'ORE', 95, 91, 30, '#ffe0b0'); K.text(c, 'SCRAP', 545, 91, 26, '#dfe8f8');
    K.glow(c, 95, 60, 90, 'rgba(255,140,60,.25)'); K.glow(c, 545, 60, 90, 'rgba(140,170,220,.2)');
    var f0 = null; G.q.forEach(function (o) { if (o.x > 20 && (!f0 || o.x > f0.x)) f0 = o; });
    /* the scanner beam picks out the next rock */
    if (f0) { var sg = c.createLinearGradient(0, 160, 0, 290); sg.addColorStop(0, 'rgba(111,227,255,0)'); sg.addColorStop(1, 'rgba(111,227,255,.35)'); c.fillStyle = sg; c.beginPath(); c.moveTo(f0.x - 4, 170); c.lineTo(f0.x + 4, 170); c.lineTo(f0.x + 34, 285); c.lineTo(f0.x - 34, 285); c.closePath(); c.fill(); c.strokeStyle = '#6fe3ff'; c.lineWidth = 2; c.strokeRect(f0.x - 30, 222, 60, 58); K.glow(c, f0.x, 168, 10, 'rgba(111,227,255,1)'); }
    G.q.forEach(function (o) { oreItem(c, o, o.x, 252, G.t); });
    G.fly.forEach(function (f) { var k = f.t / 0.35, tx = f.dir < 0 ? 95 : 545, x = f.x + (tx - f.x) * k, y = 252 - Math.sin(k * Math.PI) * 120 - k * 150; oreItem(c, f, x, y, G.t * 5); });
    var m = 1 + Math.min(2, Math.floor(G.combo / 5));
    K.text(c, 'STREAK ' + G.combo, 320, 345, 24, G.combo >= 5 ? '#ffc24a' : '#cfe4ff'); if (m > 1) K.text(c, 'x' + m, 320, 375, 18, '#5dff8f');
  };

  /* ================= 4. ORBIT HOP ================= */
  G_.traffic.update = (function (base) { return function (G, dt, inp) {
    var dr = G.drops, st = G.stun; base(G, dt, inp);
    if (G.drops > dr) K.burst(G, G.px * 40 + 20, 28, '#5dff8f', 22, 160, 0.6, 3);
    if (G.stun > 0 && !(st > 0)) K.burst(G, 340, 360, '#ff7a3a', 20, 160, 0.5, 3);
  }; })(G_.traffic.update);
  G_.traffic.draw = function (c, G) {
    K.space(c, G, { seed: 5, top: '#030414', bot: '#0a1030' });
    K.blit(c, 'orbit', W, H, function (x) {
      /* the planet below and the station dock above */
      var g = x.createRadialGradient(320, 1100, 600, 320, 1100, 760); g.addColorStop(0, '#2a7ad8'); g.addColorStop(0.9, '#5ab8f0'); g.addColorStop(1, 'rgba(160,220,255,0)'); x.fillStyle = g; x.beginPath(); x.arc(320, 1100, 760, 0, TAU); x.fill();
      x.fillStyle = 'rgba(90,200,120,.5)'; x.beginPath(); x.ellipse(200, 380, 90, 14, 0, 0, TAU); x.ellipse(470, 392, 120, 12, 0, 0, TAU); x.fill();
      var d = x.createLinearGradient(0, 0, 0, 40); d.addColorStop(0, '#3a4256'); d.addColorStop(1, '#1a1e2a'); x.fillStyle = d; x.fillRect(0, 0, W, 40); x.fillStyle = '#5dff8f'; for (var i = 10; i < W; i += 40) x.fillRect(i, 34, 20, 3);
      for (var r = 1; r <= 8; r++) { x.fillStyle = r % 2 ? 'rgba(20,30,70,.35)' : 'rgba(30,40,90,.35)'; x.fillRect(0, r * 40, W, 40); x.setLineDash([10, 10]); x.strokeStyle = 'rgba(111,227,255,.18)'; x.lineWidth = 1; x.beginPath(); x.moveTo(0, r * 40 + 20); x.lineTo(W, r * 40 + 20); x.stroke(); x.setLineDash([]); }
    });
    K.text(c, 'DOCKING RING', 320, 18, 16, '#5dff8f');
    G.lanes.forEach(function (l) {
      var y = l.r * 40;
      l.cars.forEach(function (cr) {
        var x0 = cr.x, w = cr.w, cy = y + 20, nose = l.dir > 0 ? x0 + w : x0, tail = l.dir > 0 ? x0 : x0 + w;
        K.glow(c, tail - l.dir * 6, cy, 22, l.col + 'aa'); c.fillStyle = l.col; c.fillRect(tail - l.dir * 16, cy - 2, l.dir * 14, 4);
        var g = c.createLinearGradient(0, y + 6, 0, y + 34); g.addColorStop(0, '#f2f6ff'); g.addColorStop(0.45, l.col); g.addColorStop(1, '#1a1e2a'); c.fillStyle = g; c.beginPath(); c.moveTo(tail, y + 9); c.lineTo(nose - l.dir * 12, y + 9); c.quadraticCurveTo(nose + l.dir * 4, cy, nose - l.dir * 12, y + 31); c.lineTo(tail, y + 31); c.closePath(); c.fill();
        c.fillStyle = 'rgba(160,230,255,.9)'; for (var wi = 0; wi < w / 20 - 1; wi++) c.fillRect(Math.min(tail, nose) + 10 + wi * 18, y + 14, 10, 6);
      });
    });
    var x = G.px * 40 + 20, y = G.py * 40 + 20, blink = G.stun > 0 && Math.floor(G.t * 14) % 2;
    if (!blink) { K.glow(c, x, y, 30, 'rgba(255,194,74,.6)'); K.orb(c, x, y, 12, '#ffc24a', '#fff6c8', '#6a3a08'); c.fillStyle = '#05070d'; c.fillRect(x - 7, y - 4, 14, 5); c.fillStyle = '#6fe3ff'; c.fillRect(x - 5, y - 3, 10, 3); c.strokeStyle = '#c8ced8'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y - 12); c.lineTo(x + 5, y - 20); c.stroke(); K.glow(c, x + 5, y - 20, 5, Math.sin(G.t * 10) > 0 ? 'rgba(255,90,90,1)' : 'rgba(90,255,140,1)'); }
    K.text(c, 'DROPS ' + G.drops, 620, 388, 16, '#5dff8f', 'right');
  };

  /* ================= 5. ASTEROID BLASTER ================= */
  G_.debris.update = (function (base) { return function (G, dt, inp) {
    var before = G.junk.slice(), hull = G.hull; base(G, dt, inp);
    before.forEach(function (j) { if (j.dead) K.burst(G, j.x, j.y, j.hp <= 0 ? '#ffb050' : '#ff5a4f', 10 + j.r, 130 + j.r * 3, 0.6, 3); else if (j.flash > 0.07) K.burst(G, j.x, j.y + j.r * 0.6, '#fff0c0', 5, 90, 0.25, 1.8); });
    if (G.hull < hull) K.burst(G, G.x, 362, '#6fe3ff', 26, 200, 0.6, 3);
  }; })(G_.debris.update);
  G_.debris.draw = function (c, G) {
    K.space(c, G, { seed: 9, dir: 'y', speed: 140, top: '#02030c', bot: '#0c0622' });
    G.junk.forEach(function (j) { var tone = [['#c8b8a8', '#7a6a5a', '#1a140e'], ['#a8b4c8', '#5a6478', '#0e121a'], ['#d8a070', '#8a4a2a', '#1a0a04']][j.k]; K.rock(c, j.x, j.y, j.r, 11 + j.k * 5 + Math.floor(j.r), j.rot, tone, j.flash > 0); if (j.hp > 1) { c.strokeStyle = 'rgba(255,200,120,.75)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(j.x - j.r * 0.4, j.y - j.r * 0.2); c.lineTo(j.x, j.y + j.r * 0.1); c.lineTo(j.x + j.r * 0.3, j.y - j.r * 0.3); if (j.hp > 2) { c.moveTo(j.x - j.r * 0.1, j.y + j.r * 0.4); c.lineTo(j.x + j.r * 0.2, j.y + j.r * 0.1); } c.stroke(); } });
    c.save(); c.globalCompositeOperation = 'lighter'; G.shots.forEach(function (s) { var g = c.createLinearGradient(0, s.y - 16, 0, s.y + 6); g.addColorStop(0, 'rgba(111,227,255,0)'); g.addColorStop(1, '#bff4ff'); c.fillStyle = g; c.fillRect(s.x - 2, s.y - 16, 4, 22); K.glow(c, s.x, s.y, 8, 'rgba(111,227,255,.8)'); }); c.restore();
    var fl = G.inv > 0 && Math.floor(G.t * 14) % 2; if (!fl) { K.glow(c, G.x, 378, 34, 'rgba(255,160,70,.35)'); K.ship(c, G.x, 358, 40, 1.57, 0.95, Math.max(-0.5, Math.min(0.5, (MG.inp && MG.inp.x !== undefined ? (MG.inp.x - G.x) / 200 : 0))), 1.3); if (G.inv > 0) { c.strokeStyle = 'rgba(111,227,255,.6)'; c.lineWidth = 2; c.beginPath(); c.arc(G.x, 360, 34, 0, TAU); c.stroke(); } }
    K.hearts(c, G.hull, 3, '#6fe3ff');
  };

  /* ================= 6. TRACTOR CATCH ================= */
  G_.catch.update = (function (base) { return function (G, dt, inp) {
    var before = G.ps.slice(); base(G, dt, inp);
    before.forEach(function (p) { if (p.dead) K.burst(G, p.x, 340, { bad: '#ff3d4f', gold: '#ffd23d', flick: '#5dff8f', good: '#6fe3ff' }[p.k], p.k === 'bad' ? 26 : 12, 160, 0.5, 2.6); });
  }; })(G_.catch.update);
  G_.catch.draw = function (c, G) {
    K.space(c, G, { seed: 12, top: '#04030f', bot: '#140a2a', neb: ['#3a2a8c', '#1a5a8c', '#6a2a7a', '#2a6a6a'] });
    G.ps.forEach(function (p) {
      var vis = p.k !== 'flick' || Math.sin(G.t * 9 + p.ph) > -0.2, a = vis ? 1 : 0.15; c.globalAlpha = a;
      if (p.k === 'bad') { K.glow(c, p.x, p.y, 30, 'rgba(255,40,60,.7)'); K.orb(c, p.x, p.y, 11, '#c81c2c', '#ffb0b8', '#200206'); c.strokeStyle = '#ffd23d'; c.lineWidth = 2; c.beginPath(); c.arc(p.x, p.y, 16, G.t * 4, G.t * 4 + 2); c.stroke(); c.beginPath(); c.arc(p.x, p.y, 16, G.t * 4 + 3.1, G.t * 4 + 5.1); c.stroke(); }
      else if (p.k === 'gold') { K.glow(c, p.x, p.y, 34, 'rgba(255,210,61,.75)'); c.save(); c.translate(p.x, p.y); c.rotate(G.t * 3); var gg = c.createLinearGradient(-12, -8, 12, 8); gg.addColorStop(0, '#fff6c8'); gg.addColorStop(0.5, '#ffc24a'); gg.addColorStop(1, '#8a5a08'); c.fillStyle = gg; c.fillRect(-13, -8, 26, 16); c.restore(); }
      else if (p.k === 'flick') { K.glow(c, p.x, p.y, 26, 'rgba(93,255,143,.6)'); K.orb(c, p.x, p.y, 10, '#2fd464', '#e8ffe8', '#04200c'); }
      else { K.glow(c, p.x, p.y, 24, 'rgba(111,227,255,.5)'); c.fillStyle = '#2f6fe0'; c.fillRect(p.x - 10, p.y - 10, 20, 20); c.fillStyle = '#9fc4ff'; c.fillRect(p.x - 10, p.y - 10, 20, 5); c.strokeStyle = '#bff4ff'; c.lineWidth = 1.5; c.strokeRect(p.x - 10, p.y - 10, 20, 20); }
      c.globalAlpha = 1;
    });
    /* the hauler and its beam */
    var bx = G.x, beam = c.createLinearGradient(0, 200, 0, 352); beam.addColorStop(0, 'rgba(111,227,255,0)'); beam.addColorStop(1, 'rgba(111,227,255,.38)'); c.fillStyle = beam; c.beginPath(); c.moveTo(bx - 52, 312); c.lineTo(bx + 52, 312); c.lineTo(bx + 18, 360); c.lineTo(bx - 18, 360); c.closePath(); c.fill();
    c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(160,240,255,.5)'; c.lineWidth = 1; for (var k = 0; k < 4; k++) { var yy = 312 + ((G.t * 60 + k * 12) % 48); var w = 52 - (yy - 312) * 0.7; c.beginPath(); c.moveTo(bx - w, yy); c.lineTo(bx + w, yy); c.stroke(); } c.restore();
    var hg = c.createLinearGradient(0, 356, 0, 396); hg.addColorStop(0, '#c8ced8'); hg.addColorStop(0.5, '#6a7284'); hg.addColorStop(1, '#2a3040'); c.fillStyle = hg; c.beginPath(); c.moveTo(bx - 46, 372); c.lineTo(bx - 20, 356); c.lineTo(bx + 20, 356); c.lineTo(bx + 46, 372); c.lineTo(bx + 30, 390); c.lineTo(bx - 30, 390); c.closePath(); c.fill();
    K.glow(c, bx, 358, 14, 'rgba(111,227,255,1)'); var m = 1 + Math.min(1, Math.floor(G.streak / 6) * 0.5); K.text(c, 'x' + m.toFixed(1), bx, 380, 13, m > 1 ? '#ffc24a' : '#cfe4ff');
    K.text(c, 'STREAK ' + G.streak, 18, 24, 16, '#6fe3ff', 'left');
  };

  /* ================= 7. GATE GLIDER ================= */
  /* v10: gates now follow a flying line (each within reach of the last), and the rock clusters keep off that line, so a skilled pilot can chain them */
  G_.cloud.update = function (G, dt, inp) {
    var up = inp.down || inp.keys.space || inp.keys.up; G.vy += (up ? -980 : 720) * dt; G.vy = Math.max(-340, Math.min(340, G.vy)); G.y += G.vy * dt; if (G.y < 26) { G.y = 26; G.vy = 0; } if (G.y > 374) { G.y = 374; G.vy = 0; }
    if (G.inv > 0) G.inv -= dt; var sp = 220 + G.t * 4;
    G.next -= dt;
    if (G.next <= 0) {
      G.next = Math.max(0.42, 0.75 - G.t * 0.01); G.lastY = G.lastY || 200;
      if (Math.random() < 0.6) { var ny = Math.max(50, Math.min(350, G.lastY + (Math.random() - 0.5) * 2 * Math.min(140, 120 + G.t * 1.5))); G.lastY = ny; G.obj.push({ x: 700, y: ny, k: 'ring', ph: Math.random() * 6 }); }
      else { var sy = G.lastY + (Math.random() < 0.5 ? -1 : 1) * (95 + Math.random() * 80); if (sy < 40 || sy > 360) sy = G.lastY + (sy < 40 ? 1 : -1) * (95 + Math.random() * 80); G.obj.push({ x: 700, y: Math.max(40, Math.min(360, sy)), k: 'storm', ph: Math.random() * 6 }); }
    }
    G.obj.forEach(function (o) { o.x -= sp * dt; if (o.dead) return; var d = Math.hypot(o.x - 120, o.y - G.y); if (o.k === 'ring' && d < 34 && Math.abs(o.x - 120) < 14) { o.dead = true; G.combo++; var pts = 10 + Math.min(10, G.combo); G.score += pts; MG.float(G, o.x, o.y - 20, '+' + pts, '#ffd23d'); SFX.play('coin'); K.burst(G, o.x, o.y, '#ffd23d', 16, 150, 0.5, 2.5); } else if (o.k === 'storm' && d < 40 && G.inv <= 0) { o.dead = true; G.lives--; G.inv = 1.3; G.combo = 0; G.shake = 14; SFX.play('bad'); MG.float(G, 120, G.y - 20, 'ZAP!', '#ff6b7d'); K.burst(G, 120, G.y, '#9a6aff', 26, 200, 0.6, 3); if (G.lives <= 0) G.over = 'dead'; } if (o.k === 'ring' && !o.dead && o.x < 60) { o.dead = true; G.combo = 0; } });
    G.obj = G.obj.filter(function (o) { return !o.dead && o.x > -60; });
  };
  function gate(c, o, half, t) {
    var a0 = half ? Math.PI * 0.5 : -Math.PI * 0.5, a1 = half ? Math.PI * 1.5 : Math.PI * 0.5;
    c.save(); c.lineCap = 'round'; c.strokeStyle = 'rgba(255,194,74,.35)'; c.lineWidth = 12; c.beginPath(); c.ellipse(o.x, o.y, 15, 36, 0, a0, a1); c.stroke();
    c.strokeStyle = '#ffe27a'; c.lineWidth = 4; c.shadowColor = '#ffc24a'; c.shadowBlur = 14; c.beginPath(); c.ellipse(o.x, o.y, 15, 36, 0, a0, a1); c.stroke(); c.restore();
    if (!half) for (var k = 0; k < 3; k++) { var a = t * 3 + k * 2.1 + o.ph; K.glow(c, o.x + Math.cos(a) * 15, o.y + Math.sin(a) * 36, 6, 'rgba(255,240,180,.9)'); }
  }
  G_.cloud.draw = function (c, G) {
    K.space(c, G, { seed: 15, dir: 'x', speed: 70, top: '#1a0a2a', bot: '#3a1a1a', neb: ['#8a3a2a', '#8a5a2a', '#5a2a6a', '#2a3a8a'] });
    /* the gas giant and cloud bands scrolling past */
    K.blit(c, 'giant', W, H, function (x) { var g = x.createRadialGradient(470, 330, 40, 470, 360, 300); g.addColorStop(0, '#ffd890'); g.addColorStop(0.6, '#e08a3a'); g.addColorStop(1, '#5a2a1a'); x.fillStyle = g; x.beginPath(); x.arc(470, 380, 260, 0, TAU); x.fill(); x.strokeStyle = 'rgba(120,60,30,.35)'; x.lineWidth = 10; for (var k = 0; k < 6; k++) { x.beginPath(); x.ellipse(470, 200 + k * 42, 250, 14, 0, 0, Math.PI); x.stroke(); } x.strokeStyle = 'rgba(255,240,200,.55)'; x.lineWidth = 4; x.beginPath(); x.ellipse(470, 380, 380, 50, -0.12, Math.PI * 1.05, Math.PI * 1.95); x.stroke(); });
    for (var i = 0; i < 7; i++) { var cx = ((i * 140 - G.t * 90) % 980 + 980) % 980 - 170, cy = 70 + (i * 61) % 280; c.fillStyle = 'rgba(255,220,180,.07)'; c.beginPath(); c.ellipse(cx, cy, 120, 16, 0, 0, TAU); c.fill(); }
    G.obj.forEach(function (o) { if (o.k === 'ring') gate(c, o, true, G.t); else { K.glow(c, o.x, o.y, 60, 'rgba(150,90,255,.4)'); [[-16, 6, 22], [14, 4, 24], [0, -12, 20], [-4, 16, 14]].forEach(function (q, k) { K.rock(c, o.x + q[0], o.y + q[1], q[2], 50 + k + Math.floor(o.ph * 3), G.t * (k % 2 ? 0.6 : -0.5), ['#8a7a9a', '#4a3a5a', '#0e0814']); }); if (Math.sin(G.t * 9 + o.ph) > 0.6) { c.strokeStyle = '#d8c8ff'; c.lineWidth = 2; c.shadowColor = '#b060ff'; c.shadowBlur = 10; c.beginPath(); c.moveTo(o.x - 20, o.y - 20); c.lineTo(o.x - 4, o.y - 2); c.lineTo(o.x - 12, o.y + 2); c.lineTo(o.x + 10, o.y + 24); c.stroke(); c.shadowBlur = 0; } } });
    var fl = G.inv > 0 && Math.floor(G.t * 14) % 2; if (!fl) { K.glow(c, 92, G.y, 40, 'rgba(255,160,70,.35)'); K.ship(c, 120, G.y, 44, -0.05, 0.28, -G.vy / 900, 1.1 + (G.vy < 0 ? 0.4 : 0)); }
    G.obj.forEach(function (o) { if (o.k === 'ring') gate(c, o, false, G.t); });
    K.hearts(c, G.lives, 3, '#ff5ad8'); if (G.combo > 1) K.text(c, 'GATE STREAK ' + G.combo, 620, 24, 15, '#ffc24a', 'right');
  };

  /* ================= 8. DOCK SNEAK ================= */
  G_.sneak.draw = function (c, G) {
    K.blit(c, 'bay', W, H, function (x) {
      var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a1e2a'); g.addColorStop(1, '#0a0c12'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.strokeStyle = 'rgba(0,0,0,.45)'; x.lineWidth = 2; for (var i = 0; i < W; i += 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 300); x.stroke(); } for (var j = 0; j < 300; j += 50) { x.beginPath(); x.moveTo(0, j); x.lineTo(W, j); x.stroke(); }
      x.fillStyle = '#12151e'; x.fillRect(0, 300, W, 100); for (var k = -100; k < W; k += 30) { x.fillStyle = (k / 30) % 2 ? '#e8b82c' : '#18181c'; x.beginPath(); x.moveTo(k, 300); x.lineTo(k + 30, 300); x.lineTo(k + 50, 312); x.lineTo(k + 20, 312); x.fill(); }
      /* the engine */
      var eg = x.createLinearGradient(340, 0, 640, 0); eg.addColorStop(0, '#4c556c'); eg.addColorStop(0.5, '#8a92a4'); eg.addColorStop(1, '#3a4256'); x.fillStyle = eg; x.fillRect(350, 60, 270, 240); x.fillStyle = '#1a1e2a'; x.fillRect(380, 100, 210, 150);
    });
    for (var i = 0; i < 4; i++) { var on = G.spark > 0 && i % 2; K.glow(c, 412 + i * 50, 150, 26, on ? 'rgba(255,255,255,.95)' : 'rgba(255,160,60,.6)'); K.orb(c, 412 + i * 50, 150, 11, on ? '#ffffff' : '#ffb050', '#fff6c8', '#6a2a08'); c.fillStyle = '#3a4256'; c.fillRect(398 + i * 50, 182, 28, 52); c.fillStyle = 'rgba(111,227,255,.5)'; c.fillRect(402 + i * 50, 190, 20, 4); }
    K.text(c, 'ENGINE', 485, 84, 20, '#cfe4ff'); if (G.spark > 0) { K.text(c, 'CLINK!', 485, 276, 26, '#ffc24a'); K.glow(c, 485, 200, 80, 'rgba(255,220,140,.5)'); }
    /* the guard robot */
    var gx = 180 + G.gx; K.glow(c, gx, 168, 70, G.face ? 'rgba(255,60,60,.35)' : 'rgba(111,227,255,.18)');
    var bg = c.createLinearGradient(gx - 30, 0, gx + 30, 0); bg.addColorStop(0, '#3a4256'); bg.addColorStop(0.5, '#a8b0c2'); bg.addColorStop(1, '#3a4256'); c.fillStyle = bg; c.fillRect(gx - 26, 196, 52, 90); c.fillRect(gx - 34, 286, 20, 14); c.fillRect(gx + 14, 286, 20, 14);
    K.orb(c, gx, 168, 28, '#8a92a4', '#e8f0ff', '#1a1e2a');
    if (G.face) { c.fillStyle = '#05070d'; c.fillRect(gx - 20, 158, 40, 16); K.glow(c, gx - 9, 166, 14, 'rgba(255,40,40,1)'); K.glow(c, gx + 9, 166, 14, 'rgba(255,40,40,1)'); var cone = c.createLinearGradient(gx, 0, gx + 300, 0); cone.addColorStop(0, 'rgba(255,60,60,.35)'); cone.addColorStop(1, 'rgba(255,60,60,0)'); c.fillStyle = cone; c.beginPath(); c.moveTo(gx + 14, 166); c.lineTo(gx + 320, 90); c.lineTo(gx + 320, 300); c.closePath(); c.fill(); }
    else { c.fillStyle = '#3a4256'; c.fillRect(gx - 22, 156, 44, 6); if (G.warn) K.text(c, '?', gx, 112, 40, '#ffc24a'); }
    c.strokeStyle = '#8a92a4'; c.lineWidth = 3; c.beginPath(); c.moveTo(gx, 140); c.lineTo(gx, 124); c.stroke(); K.glow(c, gx, 122, 8, G.face ? 'rgba(255,60,60,1)' : 'rgba(93,255,143,1)');
    c.fillStyle = '#05070d'; c.fillRect(30, 340, 580, 26); var pg = c.createLinearGradient(34, 0, 610, 0); pg.addColorStop(0, '#2fd464'); pg.addColorStop(1, '#bfffd0'); c.fillStyle = pg; c.fillRect(34, 344, Math.max(0, 572 * G.prog / 100), 18); K.text(c, 'SABOTAGE ' + Math.round(G.prog) + '%', 320, 353, 15, '#ffffff');
    for (var s = 0; s < 3; s++) { var sx = 24 + s * 26; if (s < G.strikes) { K.glow(c, sx, 24, 16, 'rgba(255,60,60,.7)'); K.orb(c, sx, 24, 8, '#ff3d4f', '#fff', '#300'); } else { c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 2; c.beginPath(); c.arc(sx, 24, 8, 0, TAU); c.stroke(); } }
  };

  /* ---------- goals for v10 (Bronze / Silver / Gold) ---------- */
  MG.GOALS10 = { pests: [130, 300, 495], tomb: [220, 450, 720], ore: [110, 260, 435], traffic: [40, 95, 150], debris: [140, 340, 570], catch: [140, 340, 570], cloud: [110, 230, 370] };
  Object.keys(MG.GOALS10).forEach(function (id) { if (G_[id]) G_[id].goals = MG.GOALS10[id]; });
  if (G_.ore.pads) G_.ore.pads = [['left', 'ORE', 'Send to the ore hopper'], ['right', 'SCRAP', 'Send to the scrap hopper']];
  G_.cloud.how = '<b>Hold</b> the mouse, your finger or Space to thrust. Let go to drop. Thread the golden warp gates (they follow a flying line, so chain them for a streak). Dodge the rock clusters. Three lives.';
})();
