/* Galactic Trader Deluxe. Part 17: the flight transition. Warp tunnel, ship's computer chatter, the trouble on the way, and the landing card. */
var FL = { raf: 0, n: 0 };
FL.QUIPS = ['Reticulating splines...', 'Asking the engine nicely...', 'Playing elevator music at the void...', 'The autopilot says it knows a shortcut. It does not.', 'Please keep your arms inside the ship and your hopes low.', 'Calculating the exact cost of this fuel. Do not look.', 'Warp factor "probably fine" engaged.', 'Something is rattling. It was rattling yesterday too.', 'Feeding the ship a snack. She gets cranky.', 'Space is mostly empty. So is your hold. Soon, not.', 'Warp lines: now with 30% more lines.', 'Navigation says "left, then more left". We are going right.'];
FL.HEADS = ['MEANWHILE, IN DEEP SPACE...', 'UH OH.', 'WELL, THAT HAPPENED.', 'LOOK OUT!', 'PLOT TWIST!', 'SPACE INCIDENT!'];

FL.ball = function (p) {
  var id = 'fb' + (FL.n++), base = p.color, d = UI.shade(base, -0.4), l = UI.shade(base, 0.55), ink = SC.INK, t = p.type, o = '', k;
  o += '<svg viewBox="-30 -10 260 220" aria-hidden="true"><defs><radialGradient id="g' + id + '" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="' + l + '"/><stop offset=".55" stop-color="' + base + '"/><stop offset="1" stop-color="' + d + '"/></radialGradient><clipPath id="c' + id + '"><circle cx="100" cy="100" r="76"/></clipPath></defs>';
  if (p.ring) o += '<ellipse cx="100" cy="100" rx="122" ry="26" fill="none" stroke="' + ink + '" stroke-width="22" transform="rotate(-18 100 100)"/><ellipse cx="100" cy="100" rx="122" ry="26" fill="none" stroke="' + l + '" stroke-width="12" transform="rotate(-18 100 100)"/>';
  if (t === 'Void Station') {
    o += '<circle cx="100" cy="100" r="76" fill="#000" stroke="' + ink + '" stroke-width="6"/><circle cx="100" cy="100" r="60" fill="none" stroke="' + l + '" stroke-width="10"/>';
    for (k = 0; k < 8; k++) o += '<line x1="' + (100 + Math.cos(k * .785) * 12) + '" y1="' + (100 + Math.sin(k * .785) * 12) + '" x2="' + (100 + Math.cos(k * .785) * 58) + '" y2="' + (100 + Math.sin(k * .785) * 58) + '" stroke="' + base + '" stroke-width="3"/>';
    o += '<circle cx="100" cy="100" r="14" fill="' + l + '" stroke="' + ink + '" stroke-width="4"/>';
  } else {
    o += '<circle cx="100" cy="100" r="76" fill="url(#g' + id + ')" stroke="' + ink + '" stroke-width="6"/><g clip-path="url(#c' + id + ')">';
    if (t === 'Gas Giant') for (k = 0; k < 7; k++) o += '<rect x="20" y="' + (30 + k * 22) + '" width="160" height="' + (7 + (k % 3) * 4) + '" fill="' + (k % 2 ? 'rgba(255,240,200,.35)' : 'rgba(150,70,20,.3)') + '"/>';
    else if (t === 'Agrarian') for (k = 0; k < 14; k++) o += '<rect x="' + (30 + (k * 37) % 120) + '" y="' + (34 + (k * 23) % 120) + '" width="' + (16 + (k % 3) * 8) + '" height="12" fill="' + (k % 2 ? 'rgba(255,230,120,.6)' : 'rgba(30,120,50,.5)') + '" transform="rotate(' + (k % 2 ? 14 : -18) + ' 100 100)"/>';
    else if (t === 'Megacity') for (k = -3; k <= 3; k++) o += '<line x1="20" y1="' + (100 + k * 22) + '" x2="180" y2="' + (100 + k * 22) + '" stroke="rgba(160,240,255,.55)" stroke-width="2"/><line x1="' + (100 + k * 22) + '" y1="20" x2="' + (100 + k * 22) + '" y2="180" stroke="rgba(160,240,255,.55)" stroke-width="2"/>';
    else if (t === 'Mining') for (k = 0; k < 9; k++) o += '<circle cx="' + (45 + (k * 41) % 110) + '" cy="' + (45 + (k * 29) % 110) + '" r="' + (6 + (k % 4) * 3) + '" fill="rgba(40,10,0,.45)" stroke="rgba(255,170,90,.5)" stroke-width="2"/>';
    else if (t === 'Science') for (k = 0; k < 6; k++) o += '<path d="M' + (40 + (k * 37) % 110) + ',' + (60 + (k * 31) % 90) + ' a12,12 0 0 1 24,0z" fill="rgba(255,255,255,.85)" stroke="' + ink + '" stroke-width="2"/>';
    else if (t === 'Ruin') o += '<circle cx="96" cy="104" r="46" fill="none" stroke="rgba(255,235,190,.8)" stroke-width="5" stroke-dasharray="14 8"/>';
    o += '</g><ellipse cx="72" cy="66" rx="20" ry="10" fill="#fff" opacity=".3" transform="rotate(-30 72 66)"/>';
  }
  if (p.ring) o += '<path d="M-22,100 A122,26 0 0 0 222,100" fill="none" stroke="' + ink + '" stroke-width="22" transform="rotate(-18 100 100)"/><path d="M-22,100 A122,26 0 0 0 222,100" fill="none" stroke="' + l + '" stroke-width="12" transform="rotate(-18 100 100)"/>';
  return o + '</svg>';
};

FL.card = function (head, body, label, act, cls) { return '<div class="fcard panel ' + (cls || '') + '"><h2 class="hd" style="font-size:36px">' + head + '</h2>' + body + '<div class="acts" style="margin-top:12px;justify-content:flex-end"><button class="btn big pink" data-act="' + act + '">' + label + '</button></div></div>'; };

/* entries: the log lines the jump created, oldest first. done() runs when the player docks. */
FL.run = function (from, to, entries, done) {
  var el = $('flight'), P = GT.PLANETS, A = P[from], B = P[to], DUR = 5400, t0 = 0, phase = 'warp', last = 0, W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), stars = [], rnd = GT.seeded(Date.now() & 0xffff), k;
  var mid = [], post = [], seenArr = false;
  entries.forEach(function (e, i) { var tx = plainText(e.text); if (/^Arrived/.test(tx)) { seenArr = true; return; } if (seenArr) post.push(e); else if (!/^Departed/.test(tx)) mid.push(e); });
  var lines = ['Departed ' + A.name + '. Bound for ' + B.name + '.'];
  var qs = FL.QUIPS.slice().sort(function () { return GT.rand() - 0.5; }); lines.push(qs[0], qs[1], mid.length ? 'Wait. What was that?' : qs[2], 'Approaching ' + B.name + '...');
  var sh = GT.SHIPS.filter(function (x) { return x.id === S.shipId; })[0];
  el.innerHTML = '<canvas class="stars"></canvas><div class="top">WARP TO ' + esc(B.name.toUpperCase()) + '</div><div class="pl" id="fl-a" style="width:300px">' + FL.ball(A) + '</div><div class="pl" id="fl-b" style="width:300px;opacity:0">' + FL.ball(B) + '</div><div class="fship">' + UI.shipSVG(sh.id, sh.hue) + '</div><div class="cap" id="fl-cap"><div class="ticker" id="fl-tick"></div><div class="prog"><i id="fl-prog"></i></div><div style="font-size:12px;opacity:.7;margin-top:4px">Click to skip</div></div><div id="fl-card"></div>';
  el.hidden = false; $('stage').setAttribute('aria-hidden', 'true');
  var cv = el.querySelector('canvas'), cx = cv.getContext('2d'), pa = $('fl-a'), pb = $('fl-b'), tick = $('fl-tick'), prog = $('fl-prog');
  function size() { W = el.clientWidth; H = el.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  size();
  for (k = 0; k < 260; k++) stars.push({ a: rnd() * 6.283, r: rnd() * Math.max(W, H) * 0.7, c: ['#ffffff', '#9fe6ff', '#ffb6e6', '#ffe99a'][Math.floor(rnd() * 4)], z: 0.4 + rnd() * 1.1 });
  function ease(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function lerp(a, b, x) { return a + (b - a) * x; }
  SFX.play('warp');
  var shown = -1, typed = 0;
  function frame(now) {
    if (phase !== 'warp') return;
    if (!t0) { t0 = now; last = now; } var t = Math.min(now - t0, DUR), dt = Math.min(0.05, (now - last) / 1000); last = now;
    var v = t < 1300 ? lerp(60, 1700, ease(t / 1300)) : t < 3900 ? 1700 : lerp(1700, 80, ease((t - 3900) / 1500));
    cx.fillStyle = 'rgba(4,2,15,.45)'; cx.fillRect(0, 0, W, H); var mx = W / 2, my = H / 2, lim = Math.hypot(W, H) * 0.55;
    stars.forEach(function (s) { var r0 = s.r; s.r += v * s.z * dt * (0.25 + s.r / 420); if (s.r > lim) { s.r = 6 + Math.random() * 40; s.a = Math.random() * 6.283; r0 = s.r; } var len = Math.max(1, v * s.z * 0.012 * (0.4 + s.r / 300)); cx.strokeStyle = s.c; cx.lineWidth = 1 + s.r / 260 + (v > 1000 ? 0.8 : 0); cx.beginPath(); cx.moveTo(mx + Math.cos(s.a) * (s.r - len), my + Math.sin(s.a) * (s.r - len) * 0.9); cx.lineTo(mx + Math.cos(s.a) * s.r, my + Math.sin(s.a) * s.r * 0.9); cx.stroke(); });
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
