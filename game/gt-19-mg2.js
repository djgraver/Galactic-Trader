/* Galactic Trader Deluxe. Part 19: mini-games five to eight. Junk Blaster, Quantum Catch, Cloud Skimmer, and the sabotage sneak-in. */
MG.follow = function (G, inp, dt, spd, min, max) {
  var k = (inp.keys.left ? -1 : 0) + (inp.keys.right ? 1 : 0);
  if (k) G.x += k * spd * dt; else if (inp.down || inp.mouse) { var d = inp.x - G.x; G.x += Math.max(-spd * 1.7 * dt, Math.min(spd * 1.7 * dt, d)); }
  G.x = Math.max(min, Math.min(max, G.x));
};

/* ================= 5. JUNK BLASTER ================= */
MG.games.debris = {
  name: 'Junk Blaster', dur: 30, goals: [140, 260, 380], how: 'Steer with the mouse, your finger, or the arrow keys. Your ship fires by itself. Shoot the floating junk before it reaches you. Three hull points. Do not be clever.', pads: [['left', '<', 'Left'], ['right', '>', 'Right']],
  init: function (G) { G.x = 320; G.shots = []; G.junk = []; G.hull = 3; G.inv = 0; G.fire = 0; G.next = 0.5; },
  update: function (G, dt, inp) {
    MG.follow(G, inp, dt, 380, 28, 612); G.fire -= dt; if (G.fire <= 0) { G.fire = 0.2; G.shots.push({ x: G.x, y: 350 }); SFX.play('zap'); } if (G.inv > 0) G.inv -= dt;
    G.next -= dt; if (G.next <= 0) { G.next = Math.max(0.36, 0.8 - G.t * 0.014) + Math.random() * 0.25; var r = Math.random(), big = r < 0.18 ? 3 : r < 0.5 ? 2 : 1; G.junk.push({ x: 40 + Math.random() * 560, y: -40, hp: big, r: 12 + big * 9, vy: 70 + Math.random() * 60 + G.t * 2.2, vx: (Math.random() - 0.5) * 50, rot: 0, k: Math.floor(Math.random() * 3), flash: 0 }); }
    G.shots.forEach(function (s) { s.y -= 620 * dt; });
    G.junk.forEach(function (j) { j.y += j.vy * dt; j.x += j.vx * dt; j.rot += dt * 2; if (j.flash > 0) j.flash -= dt; if (j.x < 30 || j.x > 610) j.vx *= -1; });
    G.shots.forEach(function (s) { G.junk.forEach(function (j) { if (!s.dead && !j.dead && Math.abs(s.x - j.x) < j.r + 4 && Math.abs(s.y - j.y) < j.r + 6) { s.dead = true; j.hp--; j.flash = 0.08; if (j.hp <= 0) { j.dead = true; var pts = j.r < 22 ? 10 : j.r < 30 ? 20 : 35; G.score += pts; MG.float(G, j.x, j.y, '+' + pts); SFX.play('boom'); } else SFX.play('whack'); } }); });
    G.junk.forEach(function (j) { if (!j.dead && G.inv <= 0 && Math.hypot(j.x - G.x, j.y - 365) < j.r + 18) { j.dead = true; G.hull--; G.inv = 1.3; G.shake = 16; SFX.play('bad'); MG.float(G, G.x, 330, 'CLANG!', '#ff6b7d'); if (G.hull <= 0) G.over = 'dead'; } });
    G.shots = G.shots.filter(function (s) { return !s.dead && s.y > -20; }); G.junk = G.junk.filter(function (j) { return !j.dead && j.y < 440; });
  },
  draw: function (c, G) {
    c.fillStyle = '#10062e'; c.fillRect(0, 0, 640, 400); var rnd = GT.seeded(9); for (var s = 0; s < 60; s++) { c.fillStyle = '#fff'; c.globalAlpha = 0.3 + rnd() * 0.6; c.fillRect(rnd() * 640, (rnd() * 400 + G.t * 30 * (0.3 + rnd())) % 400, 2, 2); } c.globalAlpha = 1;
    G.shots.forEach(function (s) { c.fillStyle = '#ffe14a'; c.fillRect(s.x - 3, s.y - 12, 6, 16); c.strokeStyle = MG.INK; c.lineWidth = 2; c.strokeRect(s.x - 3, s.y - 12, 6, 16); });
    G.junk.forEach(function (j) {
      c.save(); c.translate(j.x, j.y); c.rotate(j.rot); var f = j.flash > 0;
      if (j.k === 0) { MG.ball(c, 0, 0, j.r, f ? '#fff' : '#4a4a5a'); MG.ball(c, 0, 0, j.r * 0.5, f ? '#fff' : '#8a8a9a'); }
      else if (j.k === 1) { MG.rect(c, -j.r, -j.r * 0.7, j.r * 2, j.r * 1.4, f ? '#fff' : '#c8c8d8', 6); c.fillStyle = MG.INK; c.fillRect(-j.r * 0.5, -j.r * 0.7, 4, j.r * 0.5); c.fillRect(j.r * 0.2, -j.r * 0.7, 4, j.r * 0.5); }
      else MG.poly(c, [[-j.r, 0], [-j.r * 0.5, -j.r], [j.r * 0.7, -j.r * 0.8], [j.r, j.r * 0.2], [0, j.r]], f ? '#fff' : '#a86a3a');
      c.restore(); if (j.hp > 1) MG.T(c, String(j.hp), j.x, j.y, 18, '#fff3cf');
    });
    var fl = G.inv > 0 && Math.floor(G.t * 14) % 2; if (!fl) { MG.poly(c, [[G.x, 340], [G.x + 22, 382], [G.x, 372], [G.x - 22, 382]], '#4fd2ff'); MG.ball(c, G.x, 362, 6, '#ffe14a', 2); MG.poly(c, [[G.x - 6, 382], [G.x, 396 + Math.random() * 6], [G.x + 6, 382]], '#ff8a1f'); }
    for (var h = 0; h < 3; h++) MG.ball(c, 24 + h * 30, 26, 11, h < G.hull ? '#ff5a4f' : '#4a3a6a');
  }
};

/* ================= 6. QUANTUM CATCH ================= */
MG.games.catch = {
  name: 'Quantum Catch', dur: 30, goals: [140, 260, 380], how: 'Slide the beaker (mouse, finger or arrows) under the good particles: blue is good, gold is great. Green ones flicker. <b>Avoid the red ones.</b> A streak multiplies your score.', pads: [['left', '<', 'Left'], ['right', '>', 'Right']],
  init: function (G) { G.x = 320; G.ps = []; G.next = 0.4; G.streak = 0; },
  update: function (G, dt, inp) {
    MG.follow(G, inp, dt, 460, 46, 594);
    G.next -= dt; if (G.next <= 0) { G.next = Math.max(0.26, 0.5 - G.t * 0.008) + Math.random() * 0.12; var r = Math.random(), k = r < 0.24 ? 'bad' : r < 0.32 ? 'gold' : r < 0.52 ? 'flick' : 'good'; G.ps.push({ x: 30 + Math.random() * 580, y: -20, k: k, vy: 150 + Math.random() * 60 + G.t * 4 + (k === 'gold' ? 80 : 0), ph: Math.random() * 6 }); }
    G.ps.forEach(function (p) { p.y += p.vy * dt; if (!p.dead && p.y > 330 && p.y < 372 && Math.abs(p.x - G.x) < 52) { p.dead = true; var m = 1 + Math.min(1, Math.floor(G.streak / 6) * 0.5); if (p.k === 'bad') { G.score = Math.max(0, G.score - 25); G.streak = 0; G.shake = 12; MG.float(G, p.x, 320, 'EW -25', '#ff6b7d'); SFX.play('bad'); } else { var pts = Math.round((p.k === 'gold' ? 30 : p.k === 'flick' ? 15 : 10) * m); G.streak++; G.score += pts; MG.float(G, p.x, 320, '+' + pts, p.k === 'gold' ? '#ffd23d' : '#9ae0ff'); SFX.play(p.k === 'gold' ? 'win' : 'pop'); } } });
    G.ps = G.ps.filter(function (p) { return !p.dead && p.y < 420; });
  },
  draw: function (c, G) {
    var gr = c.createLinearGradient(0, 0, 0, 400); gr.addColorStop(0, '#1b1b5a'); gr.addColorStop(1, '#3a1a7a'); c.fillStyle = gr; c.fillRect(0, 0, 640, 400);
    c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 2; for (var g = 0; g < 16; g++) { c.beginPath(); c.moveTo(g * 40, 0); c.lineTo(g * 40, 400); c.stroke(); }
    G.ps.forEach(function (p) {
      var vis = p.k !== 'flick' || Math.sin(G.t * 9 + p.ph) > -0.2; if (!vis) { c.globalAlpha = 0.18; }
      var col = { good: '#4fd2ff', flick: '#7bd957', gold: '#ffd23d', bad: '#ff3d4f' }[p.k]; MG.ball(c, p.x, p.y, p.k === 'gold' ? 13 : 11, col); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(p.x - 4, p.y - 6, 4, 4); if (p.k === 'bad') { c.strokeStyle = MG.INK; c.lineWidth = 3; c.beginPath(); c.moveTo(p.x - 5, p.y - 3); c.lineTo(p.x + 5, p.y + 3); c.moveTo(p.x + 5, p.y - 3); c.lineTo(p.x - 5, p.y + 3); c.stroke(); } c.globalAlpha = 1;
    });
    MG.poly(c, [[G.x - 40, 330], [G.x + 40, 330], [G.x + 32, 378], [G.x - 32, 378]], 'rgba(190,240,255,.65)'); MG.rect(c, G.x - 44, 324, 88, 10, '#c8d0dc', 4, 3); MG.T(c, 'x' + (1 + Math.min(1, Math.floor(G.streak / 6) * 0.5)).toFixed(1), G.x, 356, 22, '#1d0f33');
    MG.T(c, 'STREAK ' + G.streak, 90, 380, 22, '#fff3cf');
  }
};

/* ================= 7. CLOUD SKIMMER ================= */
MG.games.cloud = {
  name: 'Cloud Skimmer', dur: 30, goals: [110, 200, 290], how: '<b>Hold</b> the mouse, your finger or Space to climb. Let go to dive. Fly through the golden rings. Dodge the thunderheads. Three lives.', pads: [['space', 'CLIMB', 'Hold to climb']],
  init: function (G) { G.y = 200; G.vy = 0; G.obj = []; G.lives = 3; G.inv = 0; G.next = 0.4; G.combo = 0; },
  update: function (G, dt, inp) {
    var up = inp.down || inp.keys.space || inp.keys.up; G.vy += (up ? -980 : 720) * dt; G.vy = Math.max(-340, Math.min(340, G.vy)); G.y += G.vy * dt; if (G.y < 26) { G.y = 26; G.vy = 0; } if (G.y > 374) { G.y = 374; G.vy = 0; }
    if (G.inv > 0) G.inv -= dt; var sp = 220 + G.t * 4;
    G.next -= dt; if (G.next <= 0) { G.next = Math.max(0.42, 0.75 - G.t * 0.01); var r = Math.random(); G.obj.push({ x: 700, y: 50 + Math.random() * 300, k: r < 0.55 ? 'ring' : 'storm', ph: Math.random() * 6 }); }
    G.obj.forEach(function (o) { o.x -= sp * dt; if (o.dead) return; var d = Math.hypot(o.x - 120, o.y - G.y); if (o.k === 'ring' && d < 34 && Math.abs(o.x - 120) < 14) { o.dead = true; G.combo++; var pts = 10 + Math.min(10, G.combo); G.score += pts; MG.float(G, o.x, o.y - 20, '+' + pts, '#ffd23d'); SFX.play('coin'); } else if (o.k === 'storm' && d < 40 && G.inv <= 0) { o.dead = true; G.lives--; G.inv = 1.3; G.combo = 0; G.shake = 14; SFX.play('bad'); MG.float(G, 120, G.y - 20, 'ZAP!', '#ff6b7d'); if (G.lives <= 0) G.over = 'dead'; } if (o.k === 'ring' && !o.dead && o.x < 60) { o.dead = true; G.combo = 0; } });
    G.obj = G.obj.filter(function (o) { return !o.dead && o.x > -60; });
  },
  draw: function (c, G) {
    var gr = c.createLinearGradient(0, 0, 0, 400); gr.addColorStop(0, '#ffd23d'); gr.addColorStop(1, '#ff8a3d'); c.fillStyle = gr; c.fillRect(0, 0, 640, 400);
    for (var i = 0; i < 6; i++) { var x = ((i * 150 - G.t * 60) % 800 + 800) % 800 - 80; c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(x, 60 + (i * 53) % 280, 60, 18, 0, 0, 7); c.fill(); }
    G.obj.forEach(function (o) {
      if (o.k === 'ring') { c.strokeStyle = MG.INK; c.lineWidth = 14; c.beginPath(); c.ellipse(o.x, o.y, 14, 34, 0, 0, 7); c.stroke(); c.strokeStyle = '#ffe14a'; c.lineWidth = 7; c.beginPath(); c.ellipse(o.x, o.y, 14, 34, 0, 0, 7); c.stroke(); }
      else { MG.ball(c, o.x - 16, o.y + 6, 22, '#4a3a7a'); MG.ball(c, o.x + 14, o.y + 4, 26, '#3a2a6a'); MG.ball(c, o.x, o.y - 12, 24, '#5a4a8a'); MG.poly(c, [[o.x - 2, o.y + 14], [o.x + 8, o.y + 14], [o.x, o.y + 34 + Math.sin(G.t * 20 + o.ph) * 4], [o.x + 10, o.y + 28]], '#ffe14a'); MG.eyes(c, o.x, o.y - 10, 9, 6); }
    });
    var fl = G.inv > 0 && Math.floor(G.t * 14) % 2; if (!fl) { c.save(); c.translate(120, G.y); c.rotate(G.vy / 700); MG.poly(c, [[-30, -4], [8, -16], [34, 0], [8, 12], [-30, 8]], '#ff3d8b'); MG.poly(c, [[-4, -2], [-26, -30], [-12, -2]], '#4fd2ff'); MG.poly(c, [[-4, 6], [-26, 26], [-12, 6]], '#4fd2ff'); MG.ball(c, 16, -3, 7, '#bff4ff', 2.5); c.restore(); }
    for (var h = 0; h < 3; h++) MG.ball(c, 26 + h * 30, 26, 11, h < G.lives ? '#ff3d8b' : '#a98bff');
    if (G.combo > 1) MG.T(c, 'RING STREAK ' + G.combo, 520, 26, 24, '#fff3cf');
  }
};

/* ================= 8. DOCK SNEAK: the sabotage mini-game. Tap TINKER only while the guard looks away. ================= */
MG.games.sneak = {
  name: 'Dock Sneak', dur: 16, goals: [0, 0, 0], how: 'The guard keeps turning around. Tap <b>TINKER</b> (or press Space) while his back is turned. If he sees you, you lose ground. Three strikes and you are caught. Fill the bar before time runs out for better odds.', pads: [['space', 'TINKER!', 'Tinker with the engine']],
  init: function (G) { G.prog = 0; G.strikes = 0; G.face = false; G.sw = 1.2; G.warn = 0; G.cool = 0; G.spark = 0; G.gx = 0; },
  update: function (G, dt, inp) {
    G.sw -= dt; if (!G.face && G.sw < 0.45) G.warn = 1; if (G.sw <= 0) { G.face = !G.face; G.warn = 0; G.sw = G.face ? 0.7 + Math.random() * 0.7 : 1.0 + Math.random() * 1.2; }
    G.gx = Math.sin(G.t * 1.4) * 40; G.cool -= dt; if (G.spark > 0) G.spark -= dt; G.score = G.prog;
    var hit = inp.hits.space || inp.taps.length; if (hit && G.cool <= 0) {
      G.cool = 0.1;
      if (G.face) { G.strikes++; G.prog = Math.max(0, G.prog - 8); G.shake = 14; SFX.play('bad'); MG.float(G, 320, 170, 'SPOTTED!', '#ff6b7d'); if (G.strikes >= 3) G.over = 'caught'; }
      else { G.prog = Math.min(100, G.prog + 8); G.spark = 0.15; SFX.play('whack'); if (G.prog >= 100) G.over = 'done'; }
    }
  },
  perf: function (G) { return G.over === 'caught' ? 0 : Math.max(0, Math.min(1, G.prog / 100 - G.strikes * 0.08)); },
  outro: function (G) { var p = MG.games.sneak.perf(G); return G.over === 'caught' ? 'The guard grabs your collar. Not your best work.' : p > 0.85 ? 'Clean work. The engine will have a very bad day.' : p > 0.5 ? 'Passable sabotage. Something will probably fall off.' : 'You barely touched it. The odds are not great.'; },
  draw: function (c, G) {
    c.fillStyle = '#3a2a6a'; c.fillRect(0, 0, 640, 400); c.fillStyle = '#2a1a4a'; c.fillRect(0, 300, 640, 100);
    MG.rect(c, 340, 60, 300, 250, '#8a94aa', 14); MG.rect(c, 380, 110, 180, 130, '#3a3f4a', 8); c.fillStyle = '#ff8a1f'; for (var i = 0; i < 4; i++) { MG.ball(c, 410 + i * 40, 150, 12, G.spark > 0 && i % 2 ? '#fff' : '#ffc531'); MG.rect(c, 396 + i * 40, 180, 28, 40, '#5a6070', 4, 3); }
    MG.T(c, 'ENGINE', 470, 90, 26, '#fff3cf'); if (G.spark > 0) MG.T(c, 'CLINK!', 470, 270, 34, '#ffe14a');
    var gx = 180 + G.gx; MG.rect(c, gx - 30, 190, 60, 110, '#3a5aff', 10); MG.ball(c, gx, 170, 30, '#ffd2a8'); MG.rect(c, gx - 34, 138, 68, 22, '#1d3a8a', 8);
    if (G.face) { MG.eyes(c, gx, 170, 12, 9); c.strokeStyle = MG.INK; c.lineWidth = 4; c.beginPath(); c.moveTo(gx - 10, 188); c.lineTo(gx + 10, 188); c.stroke(); MG.T(c, '!!!', gx, 110, 40, '#ff3d4f'); c.fillStyle = 'rgba(255,60,80,.18)'; c.beginPath(); c.moveTo(gx, 170); c.lineTo(640, 80); c.lineTo(640, 300); c.closePath(); c.fill(); }
    else { c.fillStyle = '#6a4a2a'; c.beginPath(); c.arc(gx, 168, 28, Math.PI, 7); c.fill(); c.strokeStyle = MG.INK; c.lineWidth = 3; c.stroke(); if (G.warn) MG.T(c, '?', gx, 108, 44, '#ffe14a'); }
    MG.rect(c, 30, 340, 580, 28, '#2a1a4a', 12); MG.rect(c, 34, 344, Math.max(0, 572 * G.prog / 100), 20, '#8fd633', 8, 2); MG.T(c, 'SABOTAGE ' + Math.round(G.prog) + '%', 320, 354, 20, '#fff3cf');
    for (var s = 0; s < 3; s++) MG.ball(c, 30 + s * 30, 30, 11, s < G.strikes ? '#ff3d4f' : '#5a4a8a');
  }
};
