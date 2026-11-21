/* Galactic Trader 11. Part 53: the odd jobs and sabotage, v11.
   - Keyboard only. The mouse does nothing inside a game and its pointer is hidden, and the on-screen buttons are only shown on touch screens
     (a phone has no keyboard). Keyboard steering speeds up while a key is held, so it is quick across the screen and still fine for small moves.
   - Crater Critters shows its keys (Q W E / A S D / Z X C) on the craters.
   - Sabotage now has three games, taken in turn so you see a different one each time:
       Dock Sneak (tinker with the engine while the guard looks away), Lock Breaker (type the airlock codes before the scanner comes round)
       and Vent Crawl (crawl the air duct to the rival's engine between the sweeps of the security lights). */
(function () {
  var W = 640, H = 400, TAU = Math.PI * 2, K = MG.K;
  MG.touch = function () { try { return window.matchMedia && window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(pointer: fine)').matches; } catch (e) { return false; } };
  var SAB = ['sneak', 'hack', 'vent'];
  MG.sabSeen = MG.sabSeen || {};
  /* the sabotage game you have played least often (ties broken at random) */
  MG.pickSabotage = function () { var best = null, n = 1e9; SAB.slice().sort(function () { return Math.random() - 0.5; }).forEach(function (id) { var k = MG.sabSeen[id] || 0; if (k < n) { n = k; best = id; } }); MG.sabSeen[best] = n + 1; return best; };
  var prevRun = MG.run;
  MG.run = function (id, done, opts) {
    if (id === 'sneak' && opts && opts.startLabel === 'Sneak in!') { id = MG.pickSabotage(); opts.startLabel = { sneak: 'Sneak in!', hack: 'Crack it!', vent: 'Crawl in!' }[id]; }
    prevRun(id, done, opts);
    var el = $('mg'); if (!el || !MG.cv) return;
    var touch = MG.touch();
    el.classList.toggle('kbonly', !touch);
    if (!touch) {
      /* mouse input is ignored inside the game */
      MG.cv.onpointerdown = MG.cv.onpointermove = MG.cv.onpointerup = MG.cv.onpointercancel = null;
      MG.inp.mouse = false; MG.inp.down = false;
      var pads = $('mg-pads'); if (pads) pads.hidden = true;
    } else {
      var pd = MG.cv.onpointerdown, pm = MG.cv.onpointermove;
      MG.cv.onpointerdown = function (e) { if (e.pointerType === 'mouse') return; pd(e); };
      MG.cv.onpointermove = function (e) { if (e.pointerType === 'mouse') return; pm(e); };
    }
  };
  /* keyboard steering that speeds up while the key is held */
  MG.follow = function (G, inp, dt, spd, min, max) {
    var k = (inp.keys.left || inp.keys.a ? -1 : 0) + (inp.keys.right || inp.keys.d ? 1 : 0);
    if (k) { G.kh = (G.kdir === k ? (G.kh || 0) : 0) + dt; G.kdir = k; G.x += k * spd * Math.min(1.75, 0.65 + G.kh * 4.5) * dt; }
    else { G.kh = 0; G.kdir = 0; if (inp.down || inp.mouse) { var d = inp.x - G.x; G.x += Math.max(-spd * 1.7 * dt, Math.min(spd * 1.7 * dt, d)); } }
    G.x = Math.max(min, Math.min(max, G.x));
  };
  /* how to play, keyboard first */
  var G_ = MG.games, HOW = {
    pests: 'Moon moles pop out of the craters. Whack them with the keys printed on each crater: <b>Q W E</b>, <b>A S D</b>, <b>Z X C</b>. Gold moles are worth more. Do <b>not</b> whack the station cat.',
    tomb: 'Switch lanes with <b>LEFT</b> and <b>RIGHT</b> (or A and D). Dodge the mines, rocks and drones; grab the blue crystals. Three lives.',
    ore: 'Rocks ride the belt. Press <b>LEFT</b> to send <b>ORE</b> (glowing veins) to the ore hopper and <b>RIGHT</b> to send <b>SCRAP</b> to the scrap hopper. Keep the streak going.',
    traffic: 'Fly the pod from the planet to the docking ring with the <b>arrow keys</b> (or WASD), one square at a time. Shuttles hurt.',
    debris: 'Steer with <b>LEFT</b> and <b>RIGHT</b> (or A and D). Hold a key to speed up. Your ship fires by itself. Shoot the rocks before they hit you. Three hull points.',
    catch: 'Slide the tractor beam with <b>LEFT</b> and <b>RIGHT</b> (or A and D) under the good cargo: blue crates are good, gold bars are great, green orbs flicker. <b>Avoid the red antimatter.</b> A streak multiplies your score.',
    cloud: '<b>Hold SPACE</b> (or UP) to thrust, let go to drop. Thread the golden warp gates (they follow a flying line, so chain them for a streak). Dodge the rock clusters. Three lives.',
    sneak: 'The guard robot keeps turning round. Press <b>SPACE</b> to tinker while his back is turned. If he sees you, you lose ground. Three strikes and you are caught.'
  };
  Object.keys(HOW).forEach(function (id) { if (G_[id]) G_[id].how = HOW[id]; });
  /* key labels on the craters */
  var pestDraw = G_.pests.draw, KEYS9 = ['Q', 'W', 'E', 'A', 'S', 'D', 'Z', 'X', 'C'];
  G_.pests.draw = function (c, G) { pestDraw(c, G); for (var i = 0; i < 9; i++) { var x = 130 + (i % 3) * 190, y = 130 + Math.floor(i / 3) * 105; c.fillStyle = 'rgba(4,8,20,.75)'; c.beginPath(); c.arc(x + 70, y + 12, 13, 0, TAU); c.fill(); c.strokeStyle = 'rgba(111,227,255,.8)'; c.lineWidth = 1.5; c.stroke(); K.text(c, KEYS9[i], x + 70, y + 13, 18, '#cfeaff', 'center', false); } };

  /* ================= SABOTAGE 2. LOCK BREAKER ================= */
  var ARW = { up: '↑', down: '↓', left: '←', right: '→' }, DIRS = ['up', 'down', 'left', 'right'];
  G_.hack = {
    name: 'Lock Breaker', dur: 16, goals: [0, 0, 0],
    how: 'The rival\'s airlock takes a code. Type each code with the <b>arrow keys</b> (or WASD) before the security scanner comes round. Each code cracked opens the lock further. A wrong key or a code too slow is a strike. Three strikes and you are caught.',
    pads: [['left', '←', 'Left'], ['up', '↑', 'Up'], ['down', '↓', 'Down'], ['right', '→', 'Right']],
    init: function (G) { G.prog = 0; G.strikes = 0; G.n = 0; G.flash = 0; G.bad = 0; G.newCode(G); },
    update: function (G, dt, inp) {
      G.tl -= dt; if (G.flash > 0) G.flash -= dt; if (G.bad > 0) G.bad -= dt; G.score = G.prog;
      var key = null; DIRS.forEach(function (d) { if (inp.hits[d]) key = d; }); if (!key) { if (inp.hits.w) key = 'up'; else if (inp.hits.s) key = 'down'; else if (inp.hits.a) key = 'left'; else if (inp.hits.d) key = 'right'; }
      if (key) {
        if (key === G.code[G.pos]) { G.pos++; SFX.play('tick'); if (G.pos >= G.code.length) { G.prog = Math.min(100, G.prog + (8 + G.code.length * 2)); G.n++; G.flash = 0.35; SFX.play('coin'); MG.float(G, 320, 160, 'CRACKED!', '#5dff8f'); K.burst(G, 320, 200, '#5dff8f', 20, 160, 0.5, 2.5); if (G.prog >= 100) { G.over = 'done'; return; } G.newCode(G); } }
        else { G.strike(G, 'WRONG KEY'); }
      }
      if (G.tl <= 0) G.strike(G, 'TOO SLOW');
    },
    perf: function (G) { return G.over === 'caught' ? 0 : Math.max(0, Math.min(1, G.prog / 100 - G.strikes * 0.08)); },
    outro: function (G) { var p = G_.hack.perf(G); return G.over === 'caught' ? 'The alarm goes off. Security is very interested in your fingers.' : p > 0.85 ? 'The airlock sighs open. Nobody heard a thing.' : p > 0.5 ? 'Half the lock gives way. It might be enough.' : 'The lock barely noticed you.'; },
    draw: function (c, G) {
      K.blit(c, 'hackbg', W, H, function (x) { var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0a0f1c'); g.addColorStop(1, '#05070d'); x.fillStyle = g; x.fillRect(0, 0, W, H); x.strokeStyle = 'rgba(111,227,255,.08)'; for (var i = 0; i < W; i += 20) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); } var dg = x.createLinearGradient(140, 0, 500, 0); dg.addColorStop(0, '#3a4256'); dg.addColorStop(0.5, '#6a7284'); dg.addColorStop(1, '#3a4256'); x.fillStyle = dg; x.fillRect(140, 60, 360, 250); x.fillStyle = '#0a0d14'; x.fillRect(160, 80, 320, 150); });
      /* the scanner sweeping round */
      var a = (1 - G.tl / G.tmax) * TAU - Math.PI / 2, sx = 560, sy = 90; K.glow(c, sx, sy, 60, 'rgba(255,60,60,.35)'); c.strokeStyle = 'rgba(255,90,90,.85)'; c.lineWidth = 3; c.beginPath(); c.arc(sx, sy, 34, -Math.PI / 2, a); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.15)'; c.beginPath(); c.arc(sx, sy, 34, 0, TAU); c.stroke(); K.text(c, 'SCAN', sx, sy, 14, '#ff8a8a');
      /* the code */
      var n = G.code.length, cw = Math.min(70, 300 / n), x0 = 320 - (n - 1) * cw / 2;
      G.code.forEach(function (d, i) { var x = x0 + i * cw, done = i < G.pos, cur = i === G.pos; c.fillStyle = done ? 'rgba(93,255,143,.25)' : cur ? 'rgba(111,227,255,.22)' : 'rgba(255,255,255,.05)'; c.fillRect(x - cw / 2 + 4, 120, cw - 8, 70); if (cur) { c.strokeStyle = '#6fe3ff'; c.lineWidth = 2; c.strokeRect(x - cw / 2 + 4, 120, cw - 8, 70); } K.text(c, ARW[d], x, 156, 52, done ? '#5dff8f' : cur ? '#ffffff' : '#7a8aa8'); });
      if (G.bad > 0) { c.fillStyle = 'rgba(255,40,60,' + (G.bad * 1.5).toFixed(2) + ')'; c.fillRect(160, 80, 320, 150); }
      if (G.flash > 0) { c.fillStyle = 'rgba(93,255,143,' + (G.flash * 1.2).toFixed(2) + ')'; c.fillRect(160, 80, 320, 150); }
      K.text(c, 'AIRLOCK', 320, 255, 18, '#cfe4ff'); K.text(c, 'CODES CRACKED ' + G.n, 320, 285, 14, '#6fe3ff');
      c.fillStyle = '#05070d'; c.fillRect(30, 340, 580, 26); var pg = c.createLinearGradient(34, 0, 610, 0); pg.addColorStop(0, '#2fd464'); pg.addColorStop(1, '#bfffd0'); c.fillStyle = pg; c.fillRect(34, 344, Math.max(0, 572 * G.prog / 100), 18); K.text(c, 'LOCK ' + Math.round(G.prog) + '%', 320, 353, 15, '#ffffff');
      for (var s = 0; s < 3; s++) { var sx2 = 24 + s * 26; if (s < G.strikes) { K.glow(c, sx2, 24, 16, 'rgba(255,60,60,.7)'); K.orb(c, sx2, 24, 8, '#ff3d4f', '#fff', '#300'); } else { c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 2; c.beginPath(); c.arc(sx2, 24, 8, 0, TAU); c.stroke(); } }
    }
  };
  G_.hack.newCode = function (G) { var len = Math.min(7, 3 + Math.floor(G.n / 2)); G.code = []; for (var i = 0; i < len; i++) G.code.push(DIRS[Math.floor(Math.random() * 4)]); G.pos = 0; G.tmax = G.tl = 0.9 + len * 0.36; };
  G_.hack.init = (function (init) { return function (G) { G.newCode = G_.hack.newCode; G.strike = function (G, why) { G.strikes++; G.prog = Math.max(0, G.prog - 6); G.bad = 0.4; G.shake = 12; SFX.play('bad'); MG.float(G, 320, 110, why, '#ff6b7d'); if (G.strikes >= 3) { G.over = 'caught'; return; } G.newCode(G); }; init(G); }; })(G_.hack.init);

  /* ================= SABOTAGE 3. VENT CRAWL ================= */
  var BEAMS = [150, 265, 380, 495];
  G_.vent = {
    name: 'Vent Crawl', dur: 20, goals: [0, 0, 0],
    how: 'Crawl along the air duct to the rival\'s engine with <b>RIGHT</b> (back off with <b>LEFT</b>). Security lights sweep the duct: they flicker before they come on, so stop or back off. Reach the engine to plant a charge, twice. Getting lit up is a strike. Three strikes and you are caught.',
    pads: [['left', '←', 'Back off'], ['right', '→', 'Crawl']],
    init: function (G) { G.prog = 0; G.strikes = 0; G.x = 40; G.runs = 0; G.inv = 0; G.beams = BEAMS.map(function (x, i) { return { x: x, st: 'off', t: 0.5 + i * 0.55 + Math.random() * 0.8 }; }); },
    update: function (G, dt, inp) {
      var spd = 140 + G.runs * 15, mv = (inp.keys.right || inp.keys.d ? 1 : 0) - (inp.keys.left || inp.keys.a ? 1 : 0);
      G.x = Math.max(40, Math.min(600, G.x + mv * spd * dt)); if (G.inv > 0) G.inv -= dt;
      var fast = 1 + G.runs * 0.25;
      G.beams.forEach(function (b) { b.t -= dt * fast; if (b.t <= 0) { if (b.st === 'off') { b.st = 'warn'; b.t = 0.55; } else if (b.st === 'warn') { b.st = 'on'; b.t = 0.9 + Math.random() * 0.6; } else { b.st = 'off'; b.t = 1.0 + Math.random() * 1.1; } } });
      if (G.inv <= 0) G.beams.forEach(function (b) { if (b.st === 'on' && Math.abs(G.x - b.x) < 34) { G.strikes++; G.inv = 1.0; G.x = Math.max(40, G.x - 90); G.shake = 12; SFX.play('bad'); MG.float(G, b.x, 150, 'SPOTTED!', '#ff6b7d'); if (G.strikes >= 3) G.over = 'caught'; } });
      if (G.x >= 598 && !G.over) { G.runs++; G.prog = Math.min(100, G.runs * 50); SFX.play('win'); MG.float(G, 560, 160, 'CHARGE PLANTED', '#5dff8f'); K.burst(G, 600, 220, '#5dff8f', 24, 180, 0.6, 3); G.x = 40; if (G.runs >= 2) G.over = 'done'; }
      G.score = G.prog + Math.round((G.x - 40) / 560 * 50 * (G.runs < 2 ? 1 : 0));
    },
    perf: function (G) { return G.over === 'caught' ? 0 : Math.max(0, Math.min(1, G.score / 100 - G.strikes * 0.08)); },
    outro: function (G) { var p = G_.vent.perf(G); return G.over === 'caught' ? 'A security drone shines a torch up the duct and says "hello". Not your best work.' : p > 0.85 ? 'Two charges, set and silent. Their engine is in for a nasty surprise.' : p > 0.5 ? 'One charge planted. It should do something.' : 'You spent most of the time in a dusty duct.'; },
    draw: function (c, G) {
      K.blit(c, 'ventbg', W, H, function (x) { var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#141824'); g.addColorStop(1, '#07090e'); x.fillStyle = g; x.fillRect(0, 0, W, H);
        var d = x.createLinearGradient(0, 160, 0, 280); d.addColorStop(0, '#5a6274'); d.addColorStop(0.15, '#2a3040'); d.addColorStop(0.85, '#1a1e28'); d.addColorStop(1, '#4a5264'); x.fillStyle = d; x.fillRect(0, 160, W, 120);
        x.strokeStyle = 'rgba(0,0,0,.5)'; x.lineWidth = 2; for (var i = 0; i < W; i += 80) { x.beginPath(); x.moveTo(i, 160); x.lineTo(i, 280); x.stroke(); }
        x.fillStyle = '#a8522e'; x.fillRect(600, 150, 40, 140); x.fillStyle = '#3a4256'; x.fillRect(606, 170, 28, 100); });
      K.text(c, 'ENGINE', 615, 132, 14, '#ffb050'); K.glow(c, 620, 220, 50, 'rgba(255,140,60,.35)');
      G.beams.forEach(function (b) {
        var on = b.st === 'on', warn = b.st === 'warn' && Math.floor(G.t * 16) % 2;
        c.fillStyle = '#3a4256'; c.fillRect(b.x - 18, 120, 36, 16); K.glow(c, b.x, 136, 14, on ? 'rgba(255,255,220,1)' : warn ? 'rgba(255,200,80,.9)' : 'rgba(80,90,110,.6)');
        if (on || warn) { var g = c.createLinearGradient(0, 136, 0, 280); g.addColorStop(0, on ? 'rgba(255,250,200,.65)' : 'rgba(255,200,80,.25)'); g.addColorStop(1, on ? 'rgba(255,250,200,.12)' : 'rgba(255,200,80,.04)'); c.fillStyle = g; c.beginPath(); c.moveTo(b.x - 10, 136); c.lineTo(b.x + 10, 136); c.lineTo(b.x + 36, 280); c.lineTo(b.x - 36, 280); c.closePath(); c.fill(); }
      });
      /* you, crawling */
      var x = G.x, bob = Math.sin(G.t * 12) * 2, fl = G.inv > 0 && Math.floor(G.t * 14) % 2;
      if (!fl) { c.fillStyle = '#1c2434'; c.beginPath(); c.ellipse(x - 14, 252 + bob, 22, 10, 0, 0, TAU); c.fill(); K.orb(c, x + 10, 246 + bob, 11, '#4c556c', '#c8d0e0', '#0a0d14'); c.fillStyle = '#6fe3ff'; c.fillRect(x + 12, 242 + bob, 8, 4); K.glow(c, x + 22, 244 + bob, 14, 'rgba(111,227,255,.5)'); }
      c.fillStyle = '#05070d'; c.fillRect(30, 340, 580, 26); var pg = c.createLinearGradient(34, 0, 610, 0); pg.addColorStop(0, '#2fd464'); pg.addColorStop(1, '#bfffd0'); c.fillStyle = pg; c.fillRect(34, 344, Math.max(0, 572 * Math.min(100, G.score) / 100), 18); K.text(c, 'CHARGES ' + G.runs + ' / 2', 320, 353, 15, '#ffffff');
      for (var s = 0; s < 3; s++) { var sx2 = 24 + s * 26; if (s < G.strikes) { K.glow(c, sx2, 24, 16, 'rgba(255,60,60,.7)'); K.orb(c, sx2, 24, 8, '#ff3d4f', '#fff', '#300'); } else { c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 2; c.beginPath(); c.arc(sx2, 24, 8, 0, TAU); c.stroke(); } }
    }
  };
})();
