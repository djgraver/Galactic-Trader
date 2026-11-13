/* Galactic Trader v5. Part 19b: the Odd Jobs, redone as space games.
   The rules, scoring and difficulty of each game are unchanged (they were tuned against the economy). What changes is the theme: every familiar arcade idea now happens in space.
     Crater Critters  (whack-a-mole)      Hyperlane Dash (lane runner)   Rock Sorter   (belt sorter)   Orbit Hop     (frogger)
     Asteroid Blaster (asteroids)         Tractor Catch  (kaboom)        Gate Glider   (flappy)        Dock Sneak    (sabotage, unchanged) */
(function () {
  var J = GT.JOBS;
  J.meridoa = { id: 'pests', name: 'Crater Critters', where: 'the Moon Patch' };
  J.karthosu = { id: 'tomb', name: 'Hyperlane Dash', where: 'the Warp Tunnel' };
  J.ferrox = { id: 'ore', name: 'Rock Sorter', where: 'the Smelter Deck' };
  J.kryndor = { id: 'traffic', name: 'Orbit Hop', where: 'the Shuttle Lanes' };
  J.nihil = { id: 'debris', name: 'Asteroid Blaster', where: 'the Debris Deck' };
  J.quellin = { id: 'catch', name: 'Tractor Catch', where: 'Cargo Bay Four' };
  J.halcyra = { id: 'cloud', name: 'Gate Glider', where: 'the Gas Giant Rim' };
  GT.JOB_BLURB = {
    pests: 'Moon moles keep popping out of the craters and eating the station wiring. Whack them. Do not whack the station cat in her little helmet. She will know.',
    tomb: 'Fly the warp tunnel in three lanes. Dodge mines, asteroids and drones, and scoop up the fuel crystals.',
    ore: 'Left for ORE, right for SCRAP. The belt gets faster, and so does the foreman.',
    traffic: 'Hop your little pod across eight lanes of angry shuttles. Make as many drop-offs as you can.',
    debris: 'Blast the asteroids before they blast you. Three hull points. Do not be clever.',
    catch: 'Slide the tractor beam under the good cargo. Avoid the red antimatter. Some of it flickers. That is science.',
    cloud: 'Hold to thrust, let go to drop. Thread the warp gates and keep clear of the rock clusters.'
  };
  var G_ = MG.games;
  G_.pests.name = 'Crater Critters'; G_.pests.how = 'Tap the moon moles as they pop out of the craters (or press Q W E / A S D / Z X C). Do <b>not</b> tap the station cat.';
  G_.tomb.name = 'Hyperlane Dash'; G_.tomb.how = 'Switch lanes with the arrow keys, the on-screen buttons, or by tapping the left or right side of the screen. Dodge mines, asteroids and drones. Grab the fuel crystals. Three lives.';
  G_.ore.name = 'Rock Sorter'; G_.ore.how = 'Rocks ride the belt. Press <b>LEFT</b> (or tap the left side) to send <b>ORE</b> to the left bin. Press <b>RIGHT</b> for <b>SCRAP</b>. Keep the streak going.';
  G_.traffic.name = 'Orbit Hop'; G_.traffic.how = 'Hop the pod from the depot at the bottom to the glowing dock at the top. Arrow keys or WASD move one square. Tap beside, above or below the pod to move too. Shuttles hurt.';
  G_.debris.name = 'Asteroid Blaster'; G_.debris.how = 'Steer with the mouse, your finger, or the arrow keys. Your ship fires by itself. Shoot the asteroids before they reach you. Three hull points. Do not be clever.';
  G_.catch.name = 'Tractor Catch'; G_.catch.how = 'Slide the tractor beam (mouse, finger or arrows) under the good cargo: blue is good, gold is great. Green ones flicker. <b>Avoid the red antimatter.</b> A streak multiplies your score.';
  G_.cloud.name = 'Gate Glider'; G_.cloud.how = '<b>Hold</b> the mouse, your finger or Space to thrust. Let go to drop. Fly through the golden warp gates. Dodge the rock clusters. Three lives.';

  var stars = function (c, G, seed, n, speed, dir) {
    var rnd = GT.seeded(seed); for (var s = 0; s < n; s++) { var z = 0.3 + rnd() * 0.7, x = rnd() * 640, y = rnd() * 400; c.fillStyle = '#fff'; c.globalAlpha = 0.35 + z * 0.55;
      if (dir === 'y') y = (y + G.t * speed * z) % 400; else if (dir === 'x') x = ((x - G.t * speed * z) % 640 + 640) % 640; c.fillRect(x, y, z > 0.8 ? 3 : 2, z > 0.8 ? 3 : 2); } c.globalAlpha = 1;
  };
  var rock = function (c, x, y, r, col, dark) {
    MG.ball(c, x, y, r, col); c.fillStyle = dark; [[-0.35, -0.3, 0.28], [0.3, 0.1, 0.22], [-0.1, 0.4, 0.18]].forEach(function (q) { c.beginPath(); c.arc(x + q[0] * r, y + q[1] * r, q[2] * r, 0, 7); c.fill(); });
  };
  var planet = function (c, x, y, r, col, ring) {
    if (ring) { c.strokeStyle = MG.INK; c.lineWidth = 9; c.beginPath(); c.ellipse(x, y, r * 1.7, r * 0.45, -0.3, 0, 7); c.stroke(); c.strokeStyle = ring; c.lineWidth = 4; c.stroke(); }
    MG.ball(c, x, y, r, col, 4);
  };
  var saucer = function (c, x, y, w, col, dome) {
    MG.ball(c, x, y - w * 0.16, w * 0.3, dome || '#bff4ff', 3); MG.poly(c, [[x - w * 0.5, y + w * 0.1], [x - w * 0.28, y - w * 0.12], [x + w * 0.28, y - w * 0.12], [x + w * 0.5, y + w * 0.1], [x + w * 0.22, y + w * 0.24], [x - w * 0.22, y + w * 0.24]], col);
    c.fillStyle = '#ffe14a'; [-0.28, 0, 0.28].forEach(function (q) { c.fillRect(x + q * w - 3, y + 2, 6, 6); });
  };
  var ship = function (c, x, y, s, col) {
    MG.poly(c, [[x, y - 26 * s], [x + 20 * s, y + 16 * s], [x + 8 * s, y + 10 * s], [x, y + 18 * s], [x - 8 * s, y + 10 * s], [x - 20 * s, y + 16 * s]], col || '#4fd2ff'); MG.ball(c, x, y - 2 * s, 6 * s, '#ffe14a', 2);
  };

  /* ---- 1. CRATER CRITTERS: whack-a-mole on the moon ---- */
  G_.pests.draw = function (c, G) {
    c.fillStyle = '#10062e'; c.fillRect(0, 0, 640, 400); stars(c, G, 3, 40, 0, '');
    planet(c, 560, 50, 30, '#3a7aff'); c.fillStyle = '#58ff9a'; c.beginPath(); c.arc(550, 44, 11, 0, 7); c.fill(); c.beginPath(); c.arc(572, 60, 7, 0, 7); c.fill();
    var gr = c.createLinearGradient(0, 80, 0, 400); gr.addColorStop(0, '#9a9aaa'); gr.addColorStop(1, '#6a6a80'); c.fillStyle = gr; c.beginPath(); c.moveTo(0, 90); c.quadraticCurveTo(320, 60, 640, 90); c.lineTo(640, 400); c.lineTo(0, 400); c.closePath(); c.fill(); c.lineWidth = 4; c.strokeStyle = MG.INK; c.stroke();
    MG.rect(c, 20, 20, 140, 36, '#2a2a4a', 6); MG.T(c, 'MOON BASE', 90, 38, 20, '#58ff9a');
    G.cells.forEach(function (cl, i) {
      var x = 130 + (i % 3) * 190, y = 130 + Math.floor(i / 3) * 105; c.beginPath(); c.ellipse(x, y, 66, 24, 0, 0, 7); c.fillStyle = '#4a4a60'; c.fill(); c.lineWidth = 4; c.strokeStyle = MG.INK; c.stroke();
      c.beginPath(); c.ellipse(x, y + 2, 52, 16, 0, 0, 7); c.fillStyle = '#1d1a2e'; c.fill();
      if (cl.kind) {
        var rise = cl.hit ? 0.3 : Math.min(1, cl.t / 0.12), by = y + 14 - rise * 56; c.save(); c.beginPath(); c.rect(x - 70, y - 90, 140, 90 + 12); c.clip();
        if (cl.kind === 3) { MG.ball(c, x, by - 12, 26, '#f0b070'); MG.poly(c, [[x - 22, by - 30], [x - 16, by - 52], [x - 6, by - 34]], '#f0b070'); MG.poly(c, [[x + 22, by - 30], [x + 16, by - 52], [x + 6, by - 34]], '#f0b070'); MG.ball(c, x, by - 14, 29, 'rgba(190,240,255,.45)', 3); MG.eyes(c, x, by - 14, 9, 7); c.fillStyle = '#ff7a8a'; c.fillRect(x - 3, by - 2, 6, 4); }
        else if (cl.kind === 2) { MG.ball(c, x, by - 12, 24, '#58ff9a'); MG.ball(c, x, by - 30, 6, '#ffe14a', 2); c.strokeStyle = MG.INK; c.lineWidth = 3; c.beginPath(); c.moveTo(x, by - 34); c.lineTo(x, by - 22); c.stroke(); MG.eyes(c, x, by - 14, 8, 7); MG.poly(c, [[x - 8, by + 0], [x, by + 8], [x + 8, by + 0]], '#fff'); }
        else { MG.ball(c, x, by - 12, 28, '#9a6ad8'); MG.poly(c, [[x - 14, by - 4], [x - 6, by + 4], [x, by - 4]], '#fff'); MG.poly(c, [[x, by - 4], [x + 6, by + 4], [x + 14, by - 4]], '#fff'); MG.eyes(c, x, by - 20, 10, 8); MG.poly(c, [[x - 22, by - 26], [x - 30, by - 44], [x - 12, by - 34]], '#7a4ac8'); MG.poly(c, [[x + 22, by - 26], [x + 30, by - 44], [x + 12, by - 34]], '#7a4ac8'); }
        if (cl.hit) MG.T(c, cl.kind === 3 ? 'MROW!' : 'BONK', x, by - 50, 28, '#ffe14a');
        c.restore();
      }
      c.beginPath(); c.ellipse(x, y + 8, 68, 16, 0, 0, Math.PI); c.fillStyle = '#8a8aa0'; c.fill(); c.lineWidth = 4; c.strokeStyle = MG.INK; c.stroke();
    });
    MG.T(c, 'COMBO x' + G.combo, 70, 380, 22, '#fff3cf', 'center');
  };

  /* ---- 2. HYPERLANE DASH: three-lane runner down a warp tunnel ---- */
  G_.tomb.draw = function (c, G) {
    c.fillStyle = '#0c0430'; c.fillRect(0, 0, 640, 400); stars(c, G, 11, 50, 140, 'y');
    c.fillStyle = '#1d1060'; c.fillRect(150, 0, 340, 400); c.fillStyle = '#2a1a8a'; c.fillRect(150, 0, 6, 400); c.fillRect(484, 0, 6, 400);
    for (var i = 0; i < 14; i++) { var yy = ((G.dist * 0.9 + i * 40) % 560) - 40; c.fillStyle = '#4a3ad8'; c.fillRect(138, yy, 12, 5); c.fillRect(490, yy, 12, 5); }
    c.strokeStyle = 'rgba(88,255,255,.45)'; c.lineWidth = 3; [265, 375].forEach(function (x) { for (var k = 0; k < 14; k++) { var y = ((G.dist + k * 60) % 840) - 40; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 30); c.stroke(); } });
    G.obs.forEach(function (o) {
      var x = 210 + o.lane * 110, y = o.y;
      if (o.kind === 'gem') { MG.poly(c, [[x, y - 20], [x + 14, y], [x, y + 20], [x - 14, y]], '#55ffff'); c.fillStyle = '#fff'; c.fillRect(x - 3, y - 10, 5, 8); }
      else if (o.kind === 'spike') { for (var a = 0; a < 8; a++) { var an = a * 0.785; MG.poly(c, [[x + Math.cos(an - 0.2) * 16, y + Math.sin(an - 0.2) * 16], [x + Math.cos(an) * 30, y + Math.sin(an) * 30], [x + Math.cos(an + 0.2) * 16, y + Math.sin(an + 0.2) * 16]], '#c8d0dc'); } MG.ball(c, x, y, 17, '#4a4a5a'); MG.ball(c, x, y, 6, Math.floor(G.t * 6) % 2 ? '#ff3d4f' : '#7a1a22', 2); }
      else if (o.kind === 'boulder') rock(c, x, y, 34, '#8a7a6a', '#6a5a4a');
      else { saucer(c, x, y, 50, '#7bd957', '#ffe14a'); c.strokeStyle = MG.INK; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 8, y + 14); c.lineTo(x - 12, y + 26 + Math.sin(G.t * 20) * 3); c.moveTo(x + 8, y + 14); c.lineTo(x + 12, y + 26 - Math.sin(G.t * 20) * 3); c.stroke(); }
    });
    var px = 210 + G.lx * 110, flick = G.inv > 0 && Math.floor(G.t * 14) % 2; if (!flick) { MG.poly(c, [[px - 8, 340], [px, 366 + Math.random() * 8], [px + 8, 340]], '#ff8a1f'); ship(c, px, 318, 1.3, '#ff3d8b'); }
    for (var h = 0; h < 3; h++) MG.ball(c, 30 + h * 34, 28, 12, h < G.lives ? '#ff5a4f' : '#4a3a6a');
  };

  /* ---- 3. ROCK SORTER: ore to the left, scrap to the right ---- */
  G_.ore.draw = function (c, G) {
    c.fillStyle = '#5a5f70'; c.fillRect(0, 0, 640, 400); c.fillStyle = '#42465a'; for (var r = 0; r < 8; r++) c.fillRect(0, r * 52, 640, 4);
    c.fillStyle = '#0c0430'; [[260, 30], [330, 30], [400, 30]].forEach(function (q) { c.beginPath(); c.arc(q[0] + 20, q[1] + 40, 26, 0, 7); c.fill(); c.lineWidth = 5; c.strokeStyle = MG.INK; c.stroke(); }); stars(c, G, 4, 12, 0, '');
    MG.rect(c, 20, 40, 150, 110, '#d98a2a', 10); MG.T(c, 'ORE', 95, 95, 54, '#fff3cf'); MG.rect(c, 470, 40, 150, 110, '#7a8a9a', 10); MG.T(c, 'SCRAP', 545, 95, 44, '#fff3cf');
    MG.rect(c, -10, 250, 660, 50, '#2a2a3a', 4); c.fillStyle = '#4a4a5e'; for (var b = 0; b < 24; b++) { var bx = ((b * 30 + G.t * (120 + G.t * 6) * 0.6) % 720) - 30; c.fillRect(bx, 256, 14, 38); }
    function item(o, x, y) {
      if (o.ore) { rock(c, x, y, 20, ['#f0a030', '#e07a2a', '#ffc13a'][o.v], '#b0601c'); c.fillStyle = '#fff3cf'; c.fillRect(x + 4, y - 12, 5, 5); c.fillRect(x - 12, y + 2, 4, 4); }
      else if (o.v === 0) { MG.rect(c, x - 16, y - 12, 32, 24, '#9a9ab0', 4); c.strokeStyle = MG.INK; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 16, y); c.lineTo(x + 16, y); c.stroke(); MG.ball(c, x + 6, y + 14, 4, '#555', 2); }
      else if (o.v === 1) { MG.ball(c, x, y, 14, '#d0d8e8'); c.strokeStyle = MG.INK; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 22, y - 10); c.lineTo(x + 22, y - 10); c.moveTo(x - 22, y + 10); c.lineTo(x + 22, y + 10); c.stroke(); MG.rect(c, x - 26, y - 14, 8, 28, '#4a6aa8', 2, 3); MG.rect(c, x + 18, y - 14, 8, 28, '#4a6aa8', 2, 3); }
      else { MG.poly(c, [[x - 20, y + 12], [x - 12, y - 14], [x + 14, y - 10], [x + 20, y + 14]], '#7a8a9a'); c.fillStyle = MG.INK; c.fillRect(x - 6, y - 4, 4, 14); c.fillRect(x + 4, y - 2, 4, 12); }
    }
    var f0 = null; G.q.forEach(function (o) { if (o.x > 20 && (!f0 || o.x > f0.x)) f0 = o; });
    G.q.forEach(function (o) { item(o, o.x, 250); if (o === f0) { c.strokeStyle = '#ffe14a'; c.lineWidth = 3; c.setLineDash([6, 5]); c.strokeRect(o.x - 28, 220, 56, 60); c.setLineDash([]); } });
    G.fly.forEach(function (f) { var k = f.t / 0.35; item(f, f.x + f.dir * k * 150, 250 - k * 140); });
    MG.T(c, 'STREAK ' + G.combo, 320, 360, 28, G.combo >= 5 ? '#ffe14a' : '#fff3cf');
  };

  /* ---- 4. ORBIT HOP: frogger across shuttle lanes ---- */
  G_.traffic.draw = function (c, G) {
    c.fillStyle = '#0c0430'; c.fillRect(0, 0, 640, 400); stars(c, G, 5, 40, 0, '');
    MG.rect(c, 0, 0, 640, 40, '#2ed8c0', 0); MG.T(c, 'DOCK', 320, 22, 26, '#1d0f33'); MG.rect(c, 0, 360, 640, 40, '#6a2c91', 0); MG.T(c, 'DEPOT', 320, 382, 22, '#ffe14a');
    G.lanes.forEach(function (l) {
      var y = l.r * 40; c.fillStyle = l.r % 2 ? '#1c1c4c' : '#262660'; c.fillRect(0, y, 640, 40); c.fillStyle = 'rgba(88,255,255,.2)'; for (var d = 0; d < 16; d++) c.fillRect(d * 40 + 10, y + 19, 18, 3);
      l.cars.forEach(function (cr) {
        var cx = cr.x + cr.w / 2, cy = y + 20, w = cr.w, dr = l.dir;
        MG.rect(c, cr.x, cy - 12, w, 24, l.col, 8, 3); MG.rect(c, cr.x + (dr > 0 ? w - 22 : 4), cy - 8, 18, 10, '#bff4ff', 4, 2);
        MG.poly(c, [[dr > 0 ? cr.x : cr.x + w, cy - 6], [dr > 0 ? cr.x - 10 - Math.random() * 6 : cr.x + w + 10 + Math.random() * 6, cy], [dr > 0 ? cr.x : cr.x + w, cy + 6]], '#ff8a1f');
        c.fillStyle = '#fff3cf'; for (var wn = 0; wn < Math.floor(w / 24); wn++) c.fillRect(cr.x + 8 + wn * 14, cy + 2, 6, 5);
      });
    });
    var x = G.px * 40 + 20, y = G.py * 40 + 20, blink = G.stun > 0 && Math.floor(G.t * 14) % 2; if (!blink) { MG.ball(c, x, y, 13, '#ffe14a'); MG.ball(c, x, y - 4, 7, '#bff4ff', 2); MG.poly(c, [[x - 14, y + 8], [x - 20, y + 16], [x - 8, y + 10]], '#ff3d8b'); MG.poly(c, [[x + 14, y + 8], [x + 20, y + 16], [x + 8, y + 10]], '#ff3d8b'); }
    MG.T(c, 'DROPS ' + G.drops, 560, 380, 22, '#fff3cf');
  };

  /* ---- 5. ASTEROID BLASTER ---- */
  G_.debris.draw = function (c, G) {
    c.fillStyle = '#10062e'; c.fillRect(0, 0, 640, 400); stars(c, G, 9, 60, 30, 'y');
    G.shots.forEach(function (s) { c.fillStyle = '#55ff55'; c.fillRect(s.x - 3, s.y - 14, 6, 18); c.strokeStyle = MG.INK; c.lineWidth = 2; c.strokeRect(s.x - 3, s.y - 14, 6, 18); });
    G.junk.forEach(function (j) {
      c.save(); c.translate(j.x, j.y); c.rotate(j.rot); var f = j.flash > 0, r = j.r, base = f ? '#fff' : ['#8a7a6a', '#9a6a4a', '#6a6a7a'][j.k];
      MG.poly(c, [[-r, -r * 0.2], [-r * 0.6, -r * 0.9], [r * 0.2, -r], [r * 0.95, -r * 0.3], [r * 0.8, r * 0.6], [-r * 0.1, r], [-r * 0.85, r * 0.6]], base);
      if (!f) { c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.arc(-r * 0.3, -r * 0.2, r * 0.25, 0, 7); c.fill(); c.beginPath(); c.arc(r * 0.35, r * 0.25, r * 0.18, 0, 7); c.fill(); }
      c.restore(); if (j.hp > 1) MG.T(c, String(j.hp), j.x, j.y, 18, '#fff3cf');
    });
    var fl = G.inv > 0 && Math.floor(G.t * 14) % 2; if (!fl) { MG.poly(c, [[G.x - 6, 382], [G.x, 396 + Math.random() * 6], [G.x + 6, 382]], '#ff8a1f'); ship(c, G.x, 362, 1.15, '#4fd2ff'); }
    for (var h = 0; h < 3; h++) MG.ball(c, 24 + h * 30, 26, 11, h < G.hull ? '#ff5a4f' : '#4a3a6a');
  };

  /* ---- 6. TRACTOR CATCH: kaboom with a tractor beam ---- */
  G_.catch.draw = function (c, G) {
    c.fillStyle = '#14104a'; c.fillRect(0, 0, 640, 400); stars(c, G, 6, 40, 0, '');
    MG.rect(c, 0, 0, 640, 28, '#3a3f58', 0); for (var g = 0; g < 16; g++) { MG.ball(c, 20 + g * 40, 14, 5, g % 2 ? '#55ffff' : '#ffe14a', 2); }
    G.ps.forEach(function (p) {
      var vis = p.k !== 'flick' || Math.sin(G.t * 9 + p.ph) > -0.2; if (!vis) c.globalAlpha = 0.18;
      var x = p.x, y = p.y;
      if (p.k === 'bad') { MG.ball(c, x, y, 13, '#ff3d4f'); c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 7, 0, 7); c.stroke(); c.fillStyle = MG.INK; c.fillRect(x - 3, y - 3, 6, 6); }
      else { var col = { good: '#4fd2ff', flick: '#7bd957', gold: '#ffd23d' }[p.k]; MG.rect(c, x - 11, y - 11, 22, 22, col, 4, 3); c.strokeStyle = MG.INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 11, y); c.lineTo(x + 11, y); c.moveTo(x, y - 11); c.lineTo(x, y + 11); c.stroke(); if (p.k === 'gold') { c.fillStyle = '#fff'; c.fillRect(x - 6, y - 6, 4, 4); } }
      c.globalAlpha = 1;
    });
    c.fillStyle = 'rgba(88,255,255,.28)'; c.beginPath(); c.moveTo(G.x - 14, 338); c.lineTo(G.x + 14, 338); c.lineTo(G.x + 52, 324); c.lineTo(G.x - 52, 324); c.closePath(); c.fill();
    c.strokeStyle = '#55ffff'; c.lineWidth = 3; c.beginPath(); c.ellipse(G.x, 326, 52, 9, 0, 0, 7); c.stroke();
    saucer(c, G.x, 356, 84, '#c8d0dc', '#bff4ff'); MG.T(c, 'x' + (1 + Math.min(1, Math.floor(G.streak / 6) * 0.5)).toFixed(1), G.x, 384, 20, '#fff3cf');
    MG.T(c, 'STREAK ' + G.streak, 90, 380, 22, '#fff3cf');
  };

  /* ---- 7. GATE GLIDER: flappy rocket through warp gates ---- */
  G_.cloud.draw = function (c, G) {
    c.fillStyle = '#16083a'; c.fillRect(0, 0, 640, 400); stars(c, G, 8, 50, 70, 'x');
    planet(c, 520 - (G.t * 8) % 60, 320, 70, '#d8763a'); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 6; c.beginPath(); c.ellipse(520 - (G.t * 8) % 60, 320, 70, 14, 0, 0, 7); c.stroke();
    G.obj.forEach(function (o) {
      if (o.k === 'ring') { c.strokeStyle = MG.INK; c.lineWidth = 14; c.beginPath(); c.ellipse(o.x, o.y, 14, 36, 0, 0, 7); c.stroke(); c.strokeStyle = '#ffe14a'; c.lineWidth = 7; c.beginPath(); c.ellipse(o.x, o.y, 14, 36, 0, 0, 7); c.stroke(); c.strokeStyle = 'rgba(88,255,255,.5)'; c.lineWidth = 3; c.beginPath(); c.ellipse(o.x, o.y, 5, 24, 0, 0, 7); c.stroke(); }
      else { rock(c, o.x - 16, o.y + 8, 20, '#7a6a8a', '#5a4a6a'); rock(c, o.x + 14, o.y + 6, 24, '#6a5a7a', '#4a3a5a'); rock(c, o.x, o.y - 14, 22, '#8a7a9a', '#6a5a7a'); }
    });
    var fl = G.inv > 0 && Math.floor(G.t * 14) % 2; if (!fl) { c.save(); c.translate(120, G.y); c.rotate(G.vy / 700); MG.poly(c, [[-34, -6], [-22, 0], [-34, 6]], '#ff8a1f'); MG.poly(c, [[-26, -4], [-4, -18], [30, 0], [-4, 18], [-26, 4]], '#ff3d8b'); MG.poly(c, [[-10, -8], [-22, -24], [-2, -14]], '#4fd2ff'); MG.poly(c, [[-10, 8], [-22, 24], [-2, 14]], '#4fd2ff'); MG.ball(c, 8, 0, 7, '#bff4ff', 2.5); c.restore(); }
    for (var h = 0; h < 3; h++) MG.ball(c, 26 + h * 30, 26, 11, h < G.lives ? '#ff3d8b' : '#a98bff');
    if (G.combo > 1) MG.T(c, 'GATE STREAK ' + G.combo, 520, 26, 24, '#fff3cf');
  };

  /* ---- Dock Sneak keeps its logic; the guard becomes an alien dock guard ---- */
  var sneakDraw = G_.sneak.draw;
  G_.sneak.draw = function (c, G) {
    sneakDraw(c, G);
    var gx = 180 + G.gx; c.fillStyle = '#58ff9a'; c.beginPath(); c.arc(gx, 168, 27, 0, 7); c.fill(); c.lineWidth = 3; c.strokeStyle = MG.INK; c.stroke();
    if (G.face) { MG.eyes(c, gx, 166, 11, 9); } else { c.fillStyle = '#3a8a5a'; c.beginPath(); c.arc(gx, 168, 27, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#6a4a2a'; c.beginPath(); c.arc(gx, 168, 28, Math.PI, 7); c.fill(); c.stroke(); if (G.warn) MG.T(c, '?', gx, 108, 44, '#ffe14a'); }
    c.strokeStyle = MG.INK; c.lineWidth = 3; c.beginPath(); c.moveTo(gx - 10, 142); c.lineTo(gx - 18, 118); c.moveTo(gx + 10, 142); c.lineTo(gx + 18, 118); c.stroke(); MG.ball(c, gx - 18, 116, 5, '#ffe14a', 2); MG.ball(c, gx + 18, 116, 5, '#ffe14a', 2);
  };
})();
