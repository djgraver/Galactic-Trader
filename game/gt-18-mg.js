/* Galactic Trader Deluxe. Part 18: mini-game framework and the first four games. Every game has a score, three goals (Bronze, Silver, Gold) and a time limit. */
var MG = { games: {}, W: 640, H: 400, raf: 0, state: '', G: null, g: null, inp: null, cb: null, cv: null, cx: null };
MG.INK = '#1d0f33';
MG.T = function (c, s, x, y, size, fill, al) { c.font = size + 'px Bangers, Impact, sans-serif'; c.textAlign = al || 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = Math.max(3, size / 6); c.strokeStyle = MG.INK; c.strokeText(s, x, y); c.fillStyle = fill || '#fff3cf'; c.fillText(s, x, y); };
MG.rect = function (c, x, y, w, h, fill, r, lw) { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r || 0); else c.rect(x, y, w, h); c.fillStyle = fill; c.fill(); c.lineWidth = lw || 4; c.strokeStyle = MG.INK; c.lineJoin = 'round'; c.stroke(); };
MG.ball = function (c, x, y, r, fill, lw) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = fill; c.fill(); c.lineWidth = lw || Math.max(2, r / 5); c.strokeStyle = MG.INK; c.stroke(); };
MG.poly = function (c, pts, fill) { c.beginPath(); pts.forEach(function (p, i) { i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.closePath(); c.fillStyle = fill; c.fill(); c.lineWidth = 4; c.strokeStyle = MG.INK; c.lineJoin = 'round'; c.stroke(); };
MG.eyes = function (c, x, y, d, r) { MG.ball(c, x - d, y, r, '#fff', 2.5); MG.ball(c, x + d, y, r, '#fff', 2.5); MG.ball(c, x - d + 1, y + 1, r * 0.45, MG.INK, 1); MG.ball(c, x + d + 1, y + 1, r * 0.45, MG.INK, 1); };
MG.float = function (G, x, y, txt, col) { G.fx.push({ x: x, y: y, t: 0, txt: txt, col: col || '#ffe14a' }); };
MG.rating = function (g, score) { return score >= g.goals[2] ? 3 : score >= g.goals[1] ? 2 : score >= g.goals[0] ? 1 : 0; };

/* the runner: card, countdown, loop, result card */
MG.run = function (id, done, opts) {
  var g = MG.games[id], el = $('mg'); opts = opts || {}; MG.g = g; MG.cb = done; MG.state = 'intro';
  var pads = (g.pads || []).map(function (p) { return '<button class="btn gold" data-pad="' + p[0] + '" aria-label="' + p[2] + '">' + p[1] + '</button>'; }).join('');
  el.innerHTML = '<div class="mtop"><span class="t">' + esc(g.name) + '</span><div class="tbar"><i id="mg-t"></i></div><span class="sc" id="mg-s">0</span><button class="btn" data-mg="quit" aria-label="Quit this job">X</button></div><div class="field" id="mg-f"><canvas id="mg-c" width="' + MG.W + '" height="' + MG.H + '"></canvas><div class="card panel" id="mg-card"></div></div><div class="pads" id="mg-pads">' + pads + '</div>';
  el.hidden = false; MG.cv = $('mg-c'); MG.cx = MG.cv.getContext('2d'); MG.inp = { x: MG.W / 2, y: MG.H / 2, down: false, keys: {}, hits: {}, taps: [] };
  MG.G = { t: 0, score: 0, fx: [], shake: 0 }; if (g.init) g.init(MG.G);
  var card = $('mg-card'), gl = g.goals;
  card.innerHTML = '<h2 class="hd">' + esc(g.name) + '</h2><p style="margin:0 0 8px">' + g.how + '</p><div class="row" style="margin-bottom:10px"><span class="tax">Bronze ' + gl[0] + '</span><span class="tax">Silver ' + gl[1] + '</span><span class="tax">Gold ' + gl[2] + '</span></div><div class="acts" style="justify-content:flex-end"><button class="btn big pink" data-mg="start">' + (opts.startLabel || 'Start!') + '</button></div>';
  function fit() { var f = $('mg-f'); if (!f) return; var w = f.clientWidth - 16, h = f.clientHeight - 16, s = Math.max(0.2, Math.min(w / MG.W, h / MG.H)); MG.cv.style.width = Math.floor(MG.W * s) + 'px'; MG.cv.style.height = Math.floor(MG.H * s) + 'px'; }
  MG.fit = fit; fit(); window.addEventListener('resize', fit);
  function pt(e) { var r = MG.cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * MG.W, y: (e.clientY - r.top) / r.height * MG.H }; }
  MG.cv.onpointerdown = function (e) { var p = pt(e); MG.inp.x = p.x; MG.inp.y = p.y; MG.inp.down = true; MG.inp.taps.push(p); e.preventDefault(); try { MG.cv.setPointerCapture(e.pointerId); } catch (x) {} };
  MG.cv.onpointermove = function (e) { var p = pt(e); MG.inp.x = p.x; MG.inp.y = p.y; MG.inp.mouse = e.pointerType === 'mouse'; };
  MG.cv.onpointerup = MG.cv.onpointercancel = function () { MG.inp.down = false; };
  Array.prototype.forEach.call(el.querySelectorAll('[data-pad]'), function (b) {
    var k = b.dataset.pad; b.onpointerdown = function (e) { MG.inp.keys[k] = true; MG.inp.hits[k] = true; e.preventDefault(); }; b.onpointerup = b.onpointerleave = b.onpointercancel = function () { MG.inp.keys[k] = false; };
  });
  MG.kd = function (e) { var k = MG.keyName(e), raw = /^[a-z]$/i.test(e.key) ? e.key.toLowerCase() : null; if (e.key === 'Escape') { MG.quit(); return; } [k, raw].forEach(function (n) { if (!n) return; if (!MG.inp.keys[n]) MG.inp.hits[n] = true; MG.inp.keys[n] = true; }); if (['up', 'down', 'left', 'right', 'space'].indexOf(k) >= 0) e.preventDefault(); };
  MG.ku = function (e) { var k = MG.keyName(e); if (k) MG.inp.keys[k] = false; if (/^[a-z]$/i.test(e.key)) MG.inp.keys[e.key.toLowerCase()] = false; };
  document.addEventListener('keydown', MG.kd); document.addEventListener('keyup', MG.ku);
  el.onclick = function (e) { var a = e.target.closest('[data-mg]'); if (!a) return; if (a.dataset.mg === 'start') MG.begin(); else if (a.dataset.mg === 'quit') MG.quit(); else if (a.dataset.mg === 'collect') MG.collect(); };
  MG.last = performance.now(); cancelAnimationFrame(MG.raf); MG.raf = requestAnimationFrame(MG.loop); SFX.play('door');
};
MG.keyName = function (e) { if (MG.state === 'intro' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); MG.begin(); return null; } var k = e.key; return { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', ' ': 'space', a: 'left', d: 'right', w: 'up', s: 'down', z: 'left', m: 'right', Enter: 'space' }[k] || (/^[a-z]$/i.test(k) ? k.toLowerCase() : null); };
MG.begin = function () { $('mg-card').hidden = true; MG.state = 'count'; MG.cd = 2.6; SFX.play('blip'); };
MG.loop = function (now) {
  var g = MG.g, G = MG.G, c = MG.cx, dt = Math.min(0.05, (now - MG.last) / 1000); MG.last = now; if (!g || !MG.state) return;
  if (MG.state === 'count') { var n0 = Math.ceil(MG.cd); MG.cd -= dt; if (Math.ceil(MG.cd) !== n0 && MG.cd > 0) SFX.play('blip'); if (MG.cd <= 0) { MG.state = 'play'; SFX.play('tick'); } }
  if (MG.state === 'play') {
    G.t += dt; g.update(G, dt, MG.inp);
    G.fx.forEach(function (f) { f.t += dt; f.y -= 40 * dt; }); G.fx = G.fx.filter(function (f) { return f.t < 0.9; }); G.shake = Math.max(0, G.shake - dt * 30);
    MG.inp.hits = {}; MG.inp.taps = [];
    if (G.t >= g.dur || G.over) { MG.state = 'result'; MG.finish(); }
  }
  c.save(); if (G.shake > 0) c.translate((Math.random() - 0.5) * G.shake, (Math.random() - 0.5) * G.shake);
  g.draw(c, G, MG.inp); G.fx.forEach(function (f) { c.globalAlpha = Math.max(0, 1 - f.t / 0.9); MG.T(c, f.txt, f.x, f.y, 26, f.col); c.globalAlpha = 1; }); c.restore();
  if (MG.state === 'count') { c.fillStyle = 'rgba(10,4,30,.45)'; c.fillRect(0, 0, MG.W, MG.H); MG.T(c, MG.cd > 0.5 ? String(Math.ceil(MG.cd)) : 'GO!', MG.W / 2, MG.H / 2, 120, '#ffe14a'); }
  $('mg-s').textContent = Math.round(G.score); var tb = $('mg-t'); if (tb) { var fr = Math.max(0, 1 - G.t / g.dur); tb.style.width = (fr * 100) + '%'; tb.style.background = fr < 0.25 ? 'var(--bad)' : fr < 0.5 ? 'var(--mustard)' : 'var(--lime)'; }
  MG.raf = requestAnimationFrame(MG.loop);
};
MG.finish = function () {
  var g = MG.g, G = MG.G, sc = Math.max(0, Math.round(G.score)), r = g.perf ? 0 : MG.rating(g, sc), card = $('mg-card'); card.hidden = false; MG.res = { rating: r, score: sc };
  if (g.perf) { MG.res.perf = g.perf(G); card.innerHTML = '<h2 class="hd">' + (G.over === 'caught' ? 'CAUGHT!' : 'Done!') + '</h2><p>' + esc(g.outro(G)) + '</p><div class="acts" style="justify-content:flex-end"><button class="btn big pink" data-mg="collect">Continue</button></div>'; SFX.play(MG.res.perf > 0.5 ? 'win' : 'bad'); return; }
  SFX.play(r >= 2 ? 'win' : r === 1 ? 'coin' : 'lose');
  var S0 = GT.scale(S), pay = Math.round(S0 * GT.JOB_PAY[r] / 5) * 5, col = ['#9a9ab5', '#d08a4a', '#cfd8e8', '#ffd23d'][r];
  card.innerHTML = '<h2 class="hd">' + (G.over ? 'Game over!' : 'Time\'s up!') + '</h2><div style="font:76px/1 var(--display);letter-spacing:.06em;color:' + col + ';text-shadow:3px 3px 0 var(--ink),-2px -2px 0 var(--ink),2px -2px 0 var(--ink),-2px 2px 0 var(--ink);text-align:center;transform:rotate(-3deg)">' + GT.RATINGS[r].toUpperCase() + '</div><p style="text-align:center;margin:6px 0">Score <b class="num">' + sc + '</b> &middot; Bronze ' + g.goals[0] + ' &middot; Silver ' + g.goals[1] + ' &middot; Gold ' + g.goals[2] + '</p><div class="acts" style="justify-content:flex-end"><button class="btn big pink" data-mg="collect">' + (pay ? 'Collect your pay' : 'Walk away') + '</button></div>';
};
MG.close = function () {
  MG.state = ''; cancelAnimationFrame(MG.raf); document.removeEventListener('keydown', MG.kd); document.removeEventListener('keyup', MG.ku); window.removeEventListener('resize', MG.fit);
  var el = $('mg'); el.hidden = true; el.innerHTML = ''; el.onclick = null; MG.g = null;
};
MG.collect = function () { var cb = MG.cb, res = MG.res; MG.close(); if (cb) cb(res); };
MG.quit = function () { var cb = MG.cb, g = MG.g; var res = { rating: 0, score: 0, perf: 0, quit: true }; MG.close(); if (cb) cb(res); };

/* ================= 1. PEST PANIC: whack-a-mole in a pumpkin patch ================= */
MG.KEYS9 = ['q', 'w', 'e', 'a', 's', 'd', 'z', 'x', 'c'];
MG.games.pests = {
  name: 'Pest Panic', dur: 30, goals: [130, 230, 330], how: 'Tap the pests as they pop out of the holes (or press Q W E / A S D / Z X C). Do <b>not</b> tap the farmer\'s cat.', pads: [],
  init: function (G) { G.cells = []; for (var i = 0; i < 9; i++) G.cells.push({ kind: 0, t: 0, life: 0, hit: 0 }); G.next = 0.5; G.combo = 0; },
  update: function (G, dt, inp) {
    var prog = G.t / 30, life = 1.25 - 0.55 * prog;
    G.next -= dt; if (G.next <= 0) { G.next = 0.62 - 0.27 * prog + Math.random() * 0.2; var free = G.cells.filter(function (c) { return !c.kind; }); if (free.length) { var c = free[Math.floor(Math.random() * free.length)]; c.kind = Math.random() < 0.16 ? 3 : Math.random() < 0.3 ? 2 : 1; c.t = 0; c.life = life * (0.85 + Math.random() * 0.3); c.hit = 0; } }
    G.cells.forEach(function (c) { if (c.kind) { c.t += dt; if (c.hit) { c.hit -= dt; if (c.hit <= 0) c.kind = 0; } else if (c.t > c.life) { if (c.kind !== 3) { G.score = Math.max(0, G.score - 2); G.combo = 0; } c.kind = 0; } } });
    function whack(i) { var c = G.cells[i], x = 130 + (i % 3) * 190, y = 120 + Math.floor(i / 3) * 105; if (!c.kind || c.hit) return; if (c.kind === 3) { G.score = Math.max(0, G.score - 20); G.combo = 0; MG.float(G, x, y - 30, 'MEOW! -20', '#ff6b7d'); G.shake = 12; SFX.play('bad'); c.hit = 0.25; } else { G.combo++; var pts = (c.kind === 2 ? 15 : 10) + Math.min(10, Math.floor(G.combo / 3) * 2); G.score += pts; MG.float(G, x, y - 30, '+' + pts); SFX.play('whack'); c.hit = 0.2; } }
    inp.taps.forEach(function (p) { var best = -1, bd = 70; for (var i = 0; i < 9; i++) { var d = Math.hypot(p.x - (130 + (i % 3) * 190), p.y - (110 + Math.floor(i / 3) * 105)); if (d < bd) { bd = d; best = i; } } if (best >= 0) whack(best); });
    for (var k in inp.hits) { var ix = MG.KEYS9.indexOf(k); if (ix >= 0) whack(ix); }
  },
  draw: function (c, G) {
    var gr = c.createLinearGradient(0, 0, 0, 400); gr.addColorStop(0, '#9be36a'); gr.addColorStop(1, '#5fb83a'); c.fillStyle = gr; c.fillRect(0, 0, 640, 400);
    for (var p = 0; p < 8; p++) { MG.ball(c, 30 + p * 85, 24, 17, '#ff8a1f'); c.fillStyle = '#3a8a2a'; c.fillRect(27 + p * 85, 2, 6, 8); }
    G.cells.forEach(function (cl, i) {
      var x = 130 + (i % 3) * 190, y = 130 + Math.floor(i / 3) * 105; c.beginPath(); c.ellipse(x, y, 62, 22, 0, 0, 7); c.fillStyle = '#4a2a14'; c.fill(); c.lineWidth = 4; c.strokeStyle = MG.INK; c.stroke();
      if (cl.kind) {
        var rise = cl.hit ? 0.3 : Math.min(1, cl.t / 0.12), by = y + 14 - rise * 56; c.save(); c.beginPath(); c.rect(x - 70, y - 90, 140, 90 + 12); c.clip();
        if (cl.kind === 3) { MG.ball(c, x, by - 12, 28, '#f0b070'); MG.poly(c, [[x - 24, by - 32], [x - 18, by - 54], [x - 8, by - 34]], '#f0b070'); MG.poly(c, [[x + 24, by - 32], [x + 18, by - 54], [x + 8, by - 34]], '#f0b070'); MG.eyes(c, x, by - 14, 11, 7); MG.ball(c, x, by - 2, 4, '#ff7a8a', 2); }
        else if (cl.kind === 2) { MG.ball(c, x, by - 12, 26, '#2a2a4a'); MG.poly(c, [[x + 18, by - 12], [x + 44, by - 8], [x + 18, by - 2]], '#ffc531'); MG.eyes(c, x - 4, by - 18, 9, 7); }
        else { MG.ball(c, x, by - 12, 28, '#7a4ac8'); MG.poly(c, [[x - 14, by - 4], [x - 6, by + 4], [x, by - 4]], '#fff'); MG.poly(c, [[x, by - 4], [x + 6, by + 4], [x + 14, by - 4]], '#fff'); MG.eyes(c, x, by - 20, 10, 8); }
        if (cl.hit) { MG.T(c, cl.kind === 3 ? 'OOF' : 'BONK', x, by - 50, 28, '#ffe14a'); }
        c.restore();
      }
      c.beginPath(); c.ellipse(x, y + 6, 66, 16, 0, 0, Math.PI); c.fillStyle = '#6a3a1a'; c.fill(); c.lineWidth = 4; c.strokeStyle = MG.INK; c.stroke();
    });
    MG.T(c, 'COMBO x' + G.combo, 70, 380, 22, '#fff3cf', 'center');
  }
};

/* ================= 2. TOMB DASH: three-lane runner ================= */
MG.games.tomb = {
  name: 'Tomb Dash', dur: 30, goals: [220, 380, 540], how: 'Switch lanes with the arrow keys, the on-screen buttons, or by tapping the left or right side of the screen. Dodge spikes, boulders and scarabs. Grab the gems. Three lives.', pads: [['left', '<', 'Left'], ['right', '>', 'Right']],
  init: function (G) { G.lane = 1; G.lx = 1; G.obs = []; G.dist = 0; G.lives = 3; G.inv = 0; G.next = 0.6; G.gems = 0; },
  update: function (G, dt, inp) {
    var sp = 230 + G.t * 7; G.dist += sp * dt; G.score = Math.floor(G.dist / 22) + G.gems * 18 - 0;
    function shift(d) { var n = Math.max(0, Math.min(2, G.lane + d)); if (n !== G.lane) { G.lane = n; SFX.play('tick'); } }
    if (inp.hits.left) shift(-1); if (inp.hits.right) shift(1); inp.taps.forEach(function (p) { shift(p.x < MG.W / 2 ? -1 : 1); });
    G.lx += (G.lane - G.lx) * Math.min(1, dt * 16); if (G.inv > 0) G.inv -= dt;
    G.next -= dt; if (G.next <= 0) { G.next = 0.5 + Math.random() * 0.4 - G.t * 0.006; var ln = Math.floor(Math.random() * 3), r = Math.random(), kind = r < 0.38 ? 'gem' : r < 0.62 ? 'spike' : r < 0.82 ? 'boulder' : 'scarab'; G.obs.push({ lane: ln, y: -40, kind: kind, ph: Math.random() * 6 }); if (kind !== 'gem' && Math.random() < 0.35) { var l2 = (ln + 1 + Math.floor(Math.random() * 2)) % 3; G.obs.push({ lane: l2, y: -40, kind: 'gem', ph: 0 }); } }
    G.obs.forEach(function (o) { o.y += sp * dt; if (o.kind === 'scarab') o.lane += Math.sin(G.t * 3 + o.ph) * dt * 0.8; });
    G.obs.forEach(function (o) { if (o.dead || Math.abs(o.y - 320) > 34 || Math.abs(o.lane - G.lx) > 0.45) return; if (o.kind === 'gem') { o.dead = true; G.gems++; MG.float(G, 210 + G.lx * 110, 290, '+18', '#9ae0ff'); SFX.play('coin'); } else if (G.inv <= 0) { o.dead = true; G.lives--; G.inv = 1.3; G.shake = 14; SFX.play('bad'); MG.float(G, 210 + G.lx * 110, 290, 'OUCH!', '#ff6b7d'); if (G.lives <= 0) G.over = 'dead'; } });
    G.obs = G.obs.filter(function (o) { return !o.dead && o.y < 460; });
  },
  draw: function (c, G) {
    c.fillStyle = '#e8b86d'; c.fillRect(0, 0, 640, 400); c.fillStyle = '#c08a45'; c.fillRect(0, 0, 150, 400); c.fillRect(490, 0, 150, 400);
    for (var i = 0; i < 12; i++) { var yy = ((G.dist * 0.6 + i * 40) % 480) - 40; c.fillStyle = '#a87438'; c.fillRect(0, yy, 150, 6); c.fillRect(490, yy, 150, 6); }
    c.strokeStyle = 'rgba(29,15,51,.35)'; c.lineWidth = 3; [265, 375].forEach(function (x) { for (var k = 0; k < 14; k++) { var y = ((G.dist + k * 60) % 840) - 40; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 30); c.stroke(); } });
    G.obs.forEach(function (o) {
      var x = 210 + o.lane * 110, y = o.y;
      if (o.kind === 'gem') { MG.poly(c, [[x, y - 18], [x + 16, y], [x, y + 18], [x - 16, y]], '#4fd2ff'); }
      else if (o.kind === 'spike') { for (var s = -1; s <= 1; s++) MG.poly(c, [[x + s * 22 - 11, y + 16], [x + s * 22, y - 22], [x + s * 22 + 11, y + 16]], '#c8d0dc'); }
      else if (o.kind === 'boulder') { MG.ball(c, x, y, 34, '#8a7a6a'); c.strokeStyle = MG.INK; c.lineWidth = 3; c.beginPath(); c.arc(x - 8, y - 6, 12, 0.5, 3); c.stroke(); }
      else { MG.ball(c, x, y, 17, '#2a8a5a'); MG.ball(c, x, y - 16, 9, '#2a8a5a'); for (var l = -1; l <= 1; l += 2) { c.beginPath(); c.moveTo(x + l * 16, y - 4); c.lineTo(x + l * 28, y - 14 + Math.sin(G.t * 20) * 4); c.moveTo(x + l * 16, y + 6); c.lineTo(x + l * 28, y + 14 - Math.sin(G.t * 20) * 4); c.stroke(); } }
    });
    var px = 210 + G.lx * 110, flick = G.inv > 0 && Math.floor(G.t * 14) % 2; if (!flick) { MG.ball(c, px, 320, 24, '#ff8a2a'); MG.rect(c, px - 20, 330, 40, 22, '#3a3a8a', 6); MG.ball(c, px, 306, 16, '#ffd2a8'); MG.rect(c, px - 18, 288, 36, 12, '#ffc531', 5); MG.eyes(c, px, 306, 6, 5); }
    for (var h = 0; h < 3; h++) MG.ball(c, 30 + h * 34, 28, 12, h < G.lives ? '#ff5a4f' : '#4a3a6a');
  }
};

/* ================= 3. ORE SORTER: left for ore, right for junk ================= */
MG.games.ore = {
  name: 'Ore Sorter', dur: 30, goals: [110, 200, 290], how: 'Items ride the belt. Press <b>LEFT</b> (or tap the left side) to send <b>ORE</b> to the left bin. Press <b>RIGHT</b> for <b>JUNK</b>. Keep the streak going.', pads: [['left', 'ORE', 'Send to ore bin'], ['right', 'JUNK', 'Send to junk bin']],
  init: function (G) { G.q = []; G.fly = []; G.next = 0.3; G.combo = 0; },
  update: function (G, dt, inp) {
    var sp = 120 + G.t * 6;
    G.next -= dt; if (G.next <= 0) { G.next = Math.max(0.42, 0.95 - G.t * 0.017) + Math.random() * 0.1; G.q.push({ x: -30, ore: Math.random() < 0.52, v: Math.floor(Math.random() * 3) }); }
    G.q.forEach(function (o) { o.x += sp * dt; });
    function sort(ore) {
      var f = null; G.q.forEach(function (o) { if (o.x > 20 && (!f || o.x > f.x)) f = o; }); if (!f) return;
      G.q.splice(G.q.indexOf(f), 1); var ok = f.ore === ore; f.dir = ore ? -1 : 1; f.t = 0; f.ok = ok; G.fly.push(f);
      if (ok) { G.combo++; var m = 1 + Math.min(2, Math.floor(G.combo / 5)), pts = 5 * m; G.score += pts; MG.float(G, f.x, 270, '+' + pts + (m > 1 ? ' x' + m : ''), '#9ae0ff'); SFX.play('coin'); }
      else { G.combo = 0; G.score = Math.max(0, G.score - 5); MG.float(G, f.x, 270, 'WRONG', '#ff6b7d'); G.shake = 8; SFX.play('bad'); }
    }
    if (inp.hits.left) sort(true); if (inp.hits.right) sort(false); inp.taps.forEach(function (p) { sort(p.x < MG.W / 2); });
    G.q = G.q.filter(function (o) { if (o.x > 700) { G.combo = 0; G.score = Math.max(0, G.score - 3); MG.float(G, 600, 270, 'MISSED', '#ff6b7d'); return false; } return true; });
    G.fly.forEach(function (f) { f.t += dt; }); G.fly = G.fly.filter(function (f) { return f.t < 0.35; });
  },
  draw: function (c, G) {
    c.fillStyle = '#6a6f7a'; c.fillRect(0, 0, 640, 400); c.fillStyle = '#4a4f5a'; for (var r = 0; r < 8; r++) c.fillRect(0, r * 52, 640, 4);
    MG.rect(c, 20, 40, 150, 110, '#d98a2a', 10); MG.T(c, 'ORE', 95, 95, 54, '#fff3cf'); MG.rect(c, 470, 40, 150, 110, '#7a8a9a', 10); MG.T(c, 'JUNK', 545, 95, 54, '#fff3cf');
    MG.rect(c, -10, 250, 660, 50, '#2a2a3a', 4); c.fillStyle = '#4a4a5e'; for (var b = 0; b < 24; b++) { var bx = ((b * 30 + G.t * (120 + G.t * 6) * 0.6) % 720) - 30; c.fillRect(bx, 256, 14, 38); }
    function item(o, x, y) { if (o.ore) { MG.poly(c, [[x - 20, y + 14], [x - 14, y - 14], [x + 6, y - 20], [x + 22, y - 4], [x + 18, y + 14]], ['#f0a030', '#e07a2a', '#ffc13a'][o.v]); c.fillStyle = '#fff3cf'; c.fillRect(x - 6, y - 8, 5, 5); c.fillRect(x + 8, y, 4, 4); } else { if (o.v === 0) { MG.rect(c, x - 10, y - 16, 20, 30, '#7ac8c8', 5); MG.rect(c, x - 10, y - 20, 20, 8, '#c0c8d0', 3); } else if (o.v === 1) { MG.poly(c, [[x - 22, y + 14], [x - 18, y - 16], [x - 4, y - 16], [x - 2, y], [x + 22, y + 4], [x + 22, y + 14]], '#8a4a2a'); } else { c.beginPath(); c.ellipse(x, y, 20, 12, 0.3, 0, 7); c.fillStyle = '#ffe14a'; c.fill(); c.lineWidth = 4; c.strokeStyle = MG.INK; c.stroke(); } } }
    var f0 = null; G.q.forEach(function (o) { if (o.x > 20 && (!f0 || o.x > f0.x)) f0 = o; });
    G.q.forEach(function (o) { item(o, o.x, 250); if (o === f0) { c.strokeStyle = '#ffe14a'; c.lineWidth = 3; c.setLineDash([6, 5]); c.strokeRect(o.x - 28, 220, 56, 60); c.setLineDash([]); } });
    G.fly.forEach(function (f) { var k = f.t / 0.35; item(f, f.x + f.dir * k * 150, 250 - k * 140); });
    MG.T(c, 'STREAK ' + G.combo, 320, 360, 28, G.combo >= 5 ? '#ffe14a' : '#fff3cf');
  }
};

/* ================= 4. SKYBUS SCRAMBLE: a frogger with delivery drones ================= */
MG.games.traffic = {
  name: 'Skybus Scramble', dur: 35, goals: [40, 80, 120], how: 'Fly the delivery drone from the bottom to the glowing pad at the top. Arrow keys or WASD move one square. Tap beside, above or below the drone to move too. Skybuses hurt.', pads: [['left', '<', 'Left'], ['up', '^', 'Up'], ['down', 'v', 'Down'], ['right', '>', 'Right']],
  init: function (G) { G.px = 8; G.py = 9; G.lanes = []; G.stun = 0; G.drops = 0; for (var r = 1; r <= 8; r++) { var dir = r % 2 ? 1 : -1, sp = (50 + Math.random() * 60) * (1 + r * 0.04), cars = [], n = 3 + Math.floor(Math.random() * 2), gap = 640 / n; for (var i = 0; i < n; i++) cars.push({ x: i * gap + Math.random() * 40, w: 56 + Math.floor(Math.random() * 2) * 28 }); G.lanes.push({ r: r, dir: dir, sp: sp, cars: cars, col: ['#ff5a4f', '#3aa7ff', '#ffc531', '#7bd957', '#c25cff'][r % 5] }); } },
  update: function (G, dt, inp) {
    G.lanes.forEach(function (l) { l.cars.forEach(function (c) { c.x += l.dir * l.sp * dt * (1 + G.t * 0.012); if (l.dir > 0 && c.x > 660) c.x = -c.w - 10; if (l.dir < 0 && c.x < -c.w - 20) c.x = 650; }); });
    if (G.stun > 0) { G.stun -= dt; return; }
    var dx = 0, dy = 0; if (inp.hits.left) dx = -1; else if (inp.hits.right) dx = 1; else if (inp.hits.up) dy = -1; else if (inp.hits.down) dy = 1;
    inp.taps.forEach(function (p) { var cx = G.px * 40 + 20, cy = G.py * 40 + 20, ax = p.x - cx, ay = p.y - cy; if (Math.abs(ax) > Math.abs(ay)) dx = ax < 0 ? -1 : 1; else dy = ay < 0 ? -1 : 1; });
    if (dx || dy) { G.px = Math.max(0, Math.min(15, G.px + dx)); G.py = Math.max(0, Math.min(9, G.py + dy)); SFX.play('tick'); }
    if (G.py === 0) { G.drops++; G.score += 20; MG.float(G, G.px * 40 + 20, 30, '+20 DROP!', '#9ae0ff'); SFX.play('coin'); G.py = 9; G.px = 8; }
    var l = G.lanes[G.py - 1]; if (l) { var x0 = G.px * 40 + 8, x1 = G.px * 40 + 32; l.cars.forEach(function (c) { if (x1 > c.x + 4 && x0 < c.x + c.w - 4 && G.stun <= 0) { G.stun = 0.9; G.shake = 14; G.score = Math.max(0, G.score - 5); MG.float(G, G.px * 40 + 20, G.py * 40, 'SPLAT -5', '#ff6b7d'); SFX.play('bad'); G.py = 9; G.px = 8; } }); }
  },
  draw: function (c, G) {
    c.fillStyle = '#1a1050'; c.fillRect(0, 0, 640, 400); var rnd = GT.seeded(5); for (var s = 0; s < 40; s++) { c.fillStyle = '#fff'; c.globalAlpha = 0.5; c.fillRect(rnd() * 640, rnd() * 400, 2, 2); } c.globalAlpha = 1;
    MG.rect(c, 0, 0, 640, 40, '#2ed8c0', 0); MG.T(c, 'DELIVERY PAD', 320, 22, 26, '#1d0f33'); MG.rect(c, 0, 360, 640, 40, '#6a2c91', 0); MG.T(c, 'DEPOT', 320, 382, 22, '#ffe14a');
    G.lanes.forEach(function (l) { var y = l.r * 40; c.fillStyle = l.r % 2 ? '#2a2a5a' : '#34346a'; c.fillRect(0, y, 640, 40); c.fillStyle = 'rgba(255,255,255,.18)'; for (var d = 0; d < 16; d++) c.fillRect(d * 40 + 10, y + 19, 18, 3); l.cars.forEach(function (cr) { MG.rect(c, cr.x, y + 6, cr.w, 28, l.col, 8, 3); c.fillStyle = '#bff4ff'; for (var w = 0; w < cr.w / 22 - 0.5; w++) c.fillRect(cr.x + 8 + w * 22, y + 12, 14, 8); MG.ball(c, l.dir > 0 ? cr.x + cr.w - 6 : cr.x + 6, y + 27, 3, '#ffe14a', 1); }); });
    var x = G.px * 40 + 20, y = G.py * 40 + 20, blink = G.stun > 0 && Math.floor(G.t * 14) % 2; if (!blink) { MG.ball(c, x, y, 12, '#ffe14a'); c.fillStyle = '#1d0f33'; c.fillRect(x - 18, y - 4, 36, 4); MG.rect(c, x - 8, y + 8, 16, 8, '#c25cff', 3, 2); MG.eyes(c, x, y - 2, 4, 3.5); }
    MG.T(c, 'DROPS ' + G.drops, 560, 380, 22, '#fff3cf');
  }
};
