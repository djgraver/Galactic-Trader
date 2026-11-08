/* Galactic Trader Deluxe. Part 17: the flight transition. Warp tunnel, ship's computer chatter, the trouble on the way, and the landing card. */
var FL = { raf: 0, n: 0 };
FL.QUIPS = ['Reticulating splines...', 'Asking the engine nicely...', 'Playing elevator music at the void...', 'The autopilot says it knows a shortcut. It does not.', 'Please keep your arms inside the ship and your hopes low.', 'Calculating the exact cost of this fuel. Do not look.', 'Warp factor "probably fine" engaged.', 'Something is rattling. It was rattling yesterday too.', 'Feeding the ship a snack. She gets cranky.', 'Space is mostly empty. So is your hold. Soon, not.', 'Warp lines: now with 30% more lines.', 'Navigation says "left, then more left". We are going right.'];
FL.HEADS = ['MEANWHILE, IN DEEP SPACE...', 'UH OH.', 'WELL, THAT HAPPENED.', 'LOOK OUT!', 'PLOT TWIST!', 'SPACE INCIDENT!'];

FL.ball = function (p) {
  var B = new PX.Buf(64, 64, 255); PX.ball(B, 32, 32, p.ring ? 17 : 26, p.id, p.type, p.ring);
  return '<img class="pxi ball" src="' + PX.url('flball/' + p.id, B, false) + '" width="64" height="64" alt="">';
};

FL.card = function (head, body, label, act, cls) { return '<div class="fcard panel ' + (cls || '') + '"><h2 class="hd" style="font-size:36px">' + head + '</h2>' + body + '<div class="acts" style="margin-top:12px;justify-content:flex-end"><button class="btn big pink" data-act="' + act + '">' + label + '</button></div></div>'; };

/* entries: the log lines the jump created, oldest first. done() runs when the player docks. */
FL.run = function (from, to, entries, done) {
  var el = $('flight'), P = GT.PLANETS, A = P[from], B = P[to], DUR = 5400, t0 = 0, phase = 'warp', last = 0, W = 0, H = 0, dpr = 1 / 3, stars = [], rnd = GT.seeded(Date.now() & 0xffff), k;
  var mid = [], post = [], seenArr = false;
  entries.forEach(function (e, i) { var tx = plainText(e.text); if (/^Arrived/.test(tx)) { seenArr = true; return; } if (seenArr) post.push(e); else if (!/^Departed/.test(tx)) mid.push(e); });
  var lines = ['Departed ' + A.name + '. Bound for ' + B.name + '.'];
  var qs = FL.QUIPS.slice().sort(function () { return GT.rand() - 0.5; }); lines.push(qs[0], qs[1], mid.length ? 'Wait. What was that?' : qs[2], 'Approaching ' + B.name + '...');
  var sh = GT.SHIPS.filter(function (x) { return x.id === S.shipId; })[0];
  el.innerHTML = '<canvas class="stars"></canvas><div class="top">WARP TO ' + esc(B.name.toUpperCase()) + '</div><div class="pl" id="fl-a" style="width:300px">' + FL.ball(A) + '</div><div class="pl" id="fl-b" style="width:300px;opacity:0">' + FL.ball(B) + '</div><div class="fship">' + UI.shipPic(sh.id, sh.hue, 64, 40, 4) + '</div><div class="cap" id="fl-cap"><div class="ticker" id="fl-tick"></div><div class="prog"><i id="fl-prog"></i></div><div style="font-size:12px;opacity:.7;margin-top:4px">Click to skip</div></div><div id="fl-card"></div>';
  el.hidden = false; $('toast').hidden = true; $('stage').setAttribute('aria-hidden', 'true');
  var cv = el.querySelector('canvas'), cx = cv.getContext('2d'), pa = $('fl-a'), pb = $('fl-b'), tick = $('fl-tick'), prog = $('fl-prog');
  function size() { W = el.clientWidth; H = el.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  size();
  for (k = 0; k < 260; k++) stars.push({ a: rnd() * 6.283, r: rnd() * Math.max(W, H) * 0.7, c: ['#ffffff', '#55ffff', '#ff55ff', '#ffff55'][Math.floor(rnd() * 4)], z: 0.4 + rnd() * 1.1 });
  function ease(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function lerp(a, b, x) { return a + (b - a) * x; }
  SFX.play('warp');
  var shown = -1, typed = 0;
  function frame(now) {
    if (phase !== 'warp') return;
    if (!t0) { t0 = now; last = now; } var t = Math.min(now - t0, DUR), dt = Math.min(0.05, (now - last) / 1000); last = now;
    var v = t < 1300 ? lerp(60, 1700, ease(t / 1300)) : t < 3900 ? 1700 : lerp(1700, 80, ease((t - 3900) / 1500));
    cx.fillStyle = '#000'; cx.fillRect(0, 0, W, H); var mx = W / 2, my = H / 2, lim = Math.hypot(W, H) * 0.55;
    stars.forEach(function (s) { var r0 = s.r; s.r += v * s.z * dt * (0.25 + s.r / 420); if (s.r > lim) { s.r = 6 + Math.random() * 40; s.a = Math.random() * 6.283; r0 = s.r; } var len = Math.max(1, v * s.z * 0.012 * (0.4 + s.r / 300)); cx.strokeStyle = s.c; cx.lineWidth = 3 * (1 + Math.floor(s.r / 220)); cx.beginPath(); cx.moveTo(mx + Math.cos(s.a) * (s.r - len), my + Math.sin(s.a) * (s.r - len) * 0.9); cx.lineTo(mx + Math.cos(s.a) * s.r, my + Math.sin(s.a) * s.r * 0.9); cx.stroke(); });
    PX.snap(cx, cv.width, cv.height);
    var a = ease(t / 1300), b = ease((t - 3500) / 1900), base = Math.min(W, H) / 300;
    function place(e, x, y, s) { e.style.transform = 'translate(' + (x - 150) + 'px,' + (y - 127) + 'px) scale(' + s + ')'; }
    pa.style.opacity = String(t < 1500 ? 1 - a * 0.2 : 0); place(pa, lerp(W * 0.25, W * 0.04, a), lerp(H * 0.58, H * 0.32, a), lerp(1.4 * base, 0.08 * base, a));
    pb.style.opacity = String(t > 3500 ? 1 : 0); place(pb, lerp(W * 0.74, W * 0.72, b), lerp(H * 0.4, H * 0.42, b), lerp(0.03 * base, 1.0 * base, b));
    prog.style.width = (t / DUR * 100).toFixed(1) + '%';
    var li = Math.min(lines.length - 1, Math.floor(t / (DUR / lines.length))); if (li !== shown) { shown = li; typed = 0; if (li > 0) SFX.play('tick'); }
    typed += 1.1; tick.textContent = lines[li].slice(0, Math.floor(typed));
    if (t >= DUR) { arrive(); return; }
    FL.raf = requestAnimationFrame(frame);
  }
  function evCard() {
    phase = 'event'; cancelAnimationFrame(FL.raf); $('fl-cap').hidden = true; var body = '', worst = 'event';
    mid.forEach(function (e) { body += '<div class="le ' + e.kind + '" style="font-size:15px;margin-top:6px">' + e.text + '</div>'; if (e.kind === 'loss') worst = 'loss'; else if (e.kind === 'gain' && worst !== 'loss') worst = 'gain'; });
    SFX.play(worst === 'loss' ? 'bad' : worst === 'gain' ? 'win' : 'pop');
    $('fl-card').innerHTML = FL.card(GT.pick(FL.HEADS), body, 'Carry on', 'fl-next');
  }
  function arrCard() {
    phase = 'arrive'; cancelAnimationFrame(FL.raf); $('fl-cap').hidden = true; pa.style.opacity = '0'; pb.style.opacity = '0'; cx.clearRect(0, 0, W, H);
    var extra = ''; post.forEach(function (e) { extra += '<div class="le ' + e.kind + '" style="font-size:13px;margin-top:4px">' + e.text + '</div>'; });
    $('fl-card').innerHTML = FL.card('WELCOME TO ' + esc(B.name.toUpperCase()), '<canvas id="fl-pic" style="width:100%;border:4px solid var(--ink);border-radius:12px;display:block"></canvas><div class="dim" style="margin:6px 0 0;font-size:13px">' + B.type + ' &middot; say it: ' + esc(B.say) + '</div>' + extra, 'Dock', 'fl-dock', 'arrive');
    var pic = $('fl-pic'); if (pic) UI.drawPlanet(pic, B); SFX.play('coin');
  }
  function arrive() { if (mid.length) evCard(); else arrCard(); }
  el.onclick = function (e) {
    var a = e.target.closest('[data-act]');
    if (phase === 'warp' && !a) { t0 = performance.now() - DUR + 50; return; }
    if (!a) return;
    if (a.dataset.act === 'fl-next') { arrCard(); return; }
    if (a.dataset.act === 'fl-dock') { phase = 'done'; cancelAnimationFrame(FL.raf); el.hidden = true; el.innerHTML = ''; $('stage').removeAttribute('aria-hidden'); el.onclick = null; done(); }
  };
  FL.raf = requestAnimationFrame(frame);
};
