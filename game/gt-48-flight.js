/* Galactic Trader 10. Part 48: the warp, v10.
   - The star streaks pour out of the direction you are flying on the star map, and the ship turns to face that way. The world you left slides away behind you
     and the one you are bound for grows out of the vanishing point.
   - The ship's computer says something different every trip. Lines are drawn from pools (departures, chatter, trouble ahead, good news, the Defence Grid, arrivals)
     and a line is not used again until its pool has run dry.
   - When the Defence Grid turns trouble aside you see it: a blue lattice flares round the ship. */
FL.POOL = {
  dep: ['Departed {A}. Bound for {B}.', 'Clear of {A}. Course laid in for {B}.', '{A} shrinks in the rear view. Next stop: {B}.', 'Undocking from {A}... and we are off to {B}.', 'Warp engaged. {B}, here we come.', 'The docking clamps let go of {A}. Heading for {B}.', 'Leaving {A} in a cloud of exhaust and unpaid parking.', 'Course plotted: {A} to {B}. The autopilot looks smug.'],
  idle: FL.QUIPS.concat(['The crew are playing cards for ration bars again.', 'Somebody left the coffee machine on in the hold. It smells amazing.', 'The navigator is humming the theme from a very old space film.', 'Stars stretch into long bright lines. Nobody ever gets tired of that.', 'Cruising. The hull creaks like an old armchair.', 'The cook asks if anyone has seen the spare spatula. Nobody has.', 'All systems green. Suspiciously green.', 'The engines purr. The cargo rattles. All is well.', 'A small bird-shaped robot has been found in the vents. It refuses to leave.']),
  bad: ['Proximity alarm!', 'Uh-oh. The scanner just went very red.', 'Red lights on the bridge. Never a good sign.', 'Brace yourselves...', 'The crew go suspiciously quiet.', 'Something big on the long-range scope. And it is turning towards us.', 'Wait. What was that?', 'That rattle is new. That rattle is definitely new.'],
  good: ['Huh. Something shiny on the scanner.', 'A hail on an open channel... it sounds friendly.', 'The sensors pick up something interesting off the port bow.', 'Well, would you look at that.', 'Something drifting out here. Something valuable?', 'The navigator whistles. "Captain, you will want to see this."'],
  shield: ['Hostile contact! Raising the Defence Grid...', 'Shields up! Something is coming!', 'The Defence Grid hums to life...', 'Incoming! Grid to full power!', 'Turrets armed. Deflector charging. Here it comes...'],
  dodge: ['Hazard ahead! Full burn!', 'Evasive manoeuvres!', 'Hold on to something!', 'Hard to starboard! Hard to starboard!'],
  neutral: ['Something is out there...', 'A strange signal crackles over the radio...', 'The crew gather at the viewport...', 'The scanner chirps at something odd.'],
  arr: ['Approaching {B}...', '{B} on the long-range scope.', 'Dropping out of warp near {B}...', 'Docking clearance requested from {B}.', 'Final approach to {B}. Mind the bump.', 'Slowing down. {B} fills the viewport.', '{B} control: "Welcome back, captain. Try not to scratch the paint."']
};
FL.HEADS2 = { loss: ['UH OH.', 'LOOK OUT!', 'SPACE INCIDENT!', 'THAT HURT.', 'BAD NEWS, CAPTAIN.'], gain: ['WELL, WELL, WELL.', 'LUCKY BREAK!', 'GOOD NEWS, CAPTAIN!', 'JACKPOT!'], event: ['MEANWHILE, IN DEEP SPACE...', 'PLOT TWIST!', 'WELL, THAT HAPPENED.'], shield: ['SHIELDS HOLD!', 'DEFENCE GRID: ONLINE', 'NOT TODAY, PIRATES.'], dodge: ['DODGED IT!', 'CLOSE CALL!'] };
FL.used = {};
/* a line from a pool that has not been used lately */
FL.line = function (pool, A, B) {
  var all = FL.POOL[pool], used = FL.used[pool] || (FL.used[pool] = []), fresh = all.filter(function (x) { return used.indexOf(x) < 0; });
  if (!fresh.length) { used.length = 0; fresh = all.slice(); if (FL.last && fresh.length > 1) fresh = fresh.filter(function (x) { return x !== FL.last; }); }
  var t = fresh[Math.floor(Math.random() * fresh.length)]; used.push(t); FL.last = t;
  return t.replace(/\{A\}/g, A).replace(/\{B\}/g, B);
};
FL.headFor = function (kind) { var a = FL.HEADS2[kind] || FL.HEADS; return a[Math.floor(Math.random() * a.length)]; };

FL.run = function (from, to, entries, done) {
  var el = $('flight'), P = GT.PLANETS, A = P[from], B = P[to], DUR = 6600, t0 = 0, phase = 'warp', last = 0, W = 0, H = 0, dpr = 1 / 3, stars = [], rnd = GT.seeded(Date.now() & 0xffff), k;
  var mid = [], post = [], seenArr = false;
  /* only real trouble (or luck) on the lanes interrupts the warp; interest, dividends, rumours and the like wait for the arrival card */
  var isTravel = function (e) { return e.travel || e.dodge || e.shield || GT.TRAVEL.some(function (x) { return e.text.indexOf(x.t) >= 0; }); };
  entries.forEach(function (e) { var tx = plainText(e.text); if (/^Arrived/.test(tx)) { seenArr = true; return; } if (/^Departed|^A tanker tug/.test(tx)) return; if (!seenArr && isTravel(e)) mid.push(e); else post.push(e); });
  /* what kind of trip it was decides what the computer says in the middle */
  var shielded = mid.some(function (e) { return e.shield; }), dodged = mid.some(function (e) { return e.dodge; }), worst = 'event';
  mid.forEach(function (e) { if (e.kind === 'loss') worst = 'loss'; else if (e.kind === 'gain' && worst !== 'loss') worst = 'gain'; });
  var midPool = !mid.length ? 'idle' : shielded ? 'shield' : dodged ? 'dodge' : worst === 'loss' ? 'bad' : worst === 'gain' ? 'good' : mid.some(function (e) { return /Passenger|passenger/.test(e.text); }) ? 'idle' : 'neutral';
  var lines = [FL.line('dep', A.name, B.name), FL.line(midPool, A.name, B.name), FL.line('arr', A.name, B.name)];
  /* the heading: the direction from here to there on the star map, squashed a little so routes read as mostly sideways */
  var dx = B.x - A.x, dy = (B.y - A.y) * 0.85, dl = Math.hypot(dx, dy) || 1, ux = dx / dl, uy = dy / dl, phi = Math.atan2(uy, ux), yaw = -phi * 0.95 - 0.2;
  var sh = GT.SHIPS.filter(function (x) { return x.id === S.shipId; })[0];
  el.innerHTML = '<canvas class="stars"></canvas><div class="top">WARP TO ' + esc(B.name.toUpperCase()) + '</div><div class="pl" id="fl-a" style="width:300px">' + FL.ball(A) + '</div><div class="pl" id="fl-b" style="width:300px;opacity:0">' + FL.ball(B) + '</div><div class="fship">' + G3.live(sh.id, sh.hue, 'flight').replace('data-mode="flight"', 'data-mode="flight" data-yaw="' + yaw.toFixed(3) + '"') + '<div class="fshield" id="fl-shield"></div></div><div class="heading" id="fl-head"></div><div class="cap" id="fl-cap"><div class="ticker" id="fl-tick"></div><div class="prog"><i id="fl-prog"></i></div><div style="font-size:12px;opacity:.7;margin-top:4px">Click to skip</div></div><div id="fl-card"></div>';
  el.hidden = false; $('toast').hidden = true; $('stage').setAttribute('aria-hidden', 'true');
  FL.bg = null; var cv = el.querySelector('canvas'), cx = cv.getContext('2d'), pa = $('fl-a'), pb = $('fl-b'), tick = $('fl-tick'), prog = $('fl-prog'), shl = $('fl-shield');
  function size() { W = el.clientWidth; H = el.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  size();
  for (k = 0; k < 300; k++) stars.push({ a: rnd() * 6.283, r: rnd() * Math.max(W, H) * 0.8, c: ['#ffffff', '#9af0ff', '#ffb0f0', '#fff0a0', '#ffffff'][Math.floor(rnd() * 5)], z: 0.4 + rnd() * 1.1 });
  function ease(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function lerp(a, b, x) { return a + (b - a) * x; }
  /* a little compass in the corner shows the heading */
  var compass = Math.round(((Math.atan2(-(B.y - A.y), B.x - A.x) * 180 / Math.PI) + 450) % 360);
  $('fl-head').innerHTML = '<svg viewBox="-30 -30 60 60" width="84" height="84"><circle r="26" fill="rgba(4,8,20,.7)" stroke="#6fe3ff" stroke-width="2"/><path d="M0,-22 L0,-16 M22,0 L16,0 M0,22 L0,16 M-22,0 L-16,0" stroke="#6fe3ff" stroke-width="2"/><g transform="rotate(' + (phi * 180 / Math.PI + 90).toFixed(1) + ')"><path d="M0,-18 L6,6 L0,2 L-6,6Z" fill="#ffc24a"/></g></svg><span>HDG ' + ('00' + compass).slice(-3) + '</span>';
  SFX.play('warp');
  var shown = -1, typed = 0, flared = false;
  function frame(now) {
    if (phase !== 'warp') return;
    if (!t0) { t0 = now; last = now; } var t = Math.min(now - t0, DUR), dt = Math.min(0.05, (now - last) / 1000); last = now;
    var v = t < 1300 ? lerp(60, 1700, ease(t / 1300)) : t < 5000 ? 1700 : lerp(1700, 80, ease((t - 5000) / 1600));
    /* the vanishing point sits ahead of the ship, in the direction of travel */
    var off = Math.min(1, t / 900), mx = W / 2 + ux * W * 0.3 * off, my = H / 2 + uy * H * 0.3 * off;
    var lim = Math.max(Math.hypot(mx, my), Math.hypot(W - mx, my), Math.hypot(mx, H - my), Math.hypot(W - mx, H - my)) * 1.02;
    if (!FL.bg || FL.bgW !== W) { var bgc = document.createElement('canvas'); bgc.width = Math.max(2, Math.round(W / 3)); bgc.height = Math.max(2, Math.round(H / 3)); var bx = bgc.getContext('2d'), gw = bgc.width, gh = bgc.height, g0 = bx.createRadialGradient(gw / 2, gh / 2, 0, gw / 2, gh / 2, gw * 0.7); g0.addColorStop(0, '#16206a'); g0.addColorStop(0.45, '#0a0f3a'); g0.addColorStop(1, '#02030c'); bx.fillStyle = g0; bx.fillRect(0, 0, gw, gh);
      [[0.2, 0.25, '#7a2ac8'], [0.82, 0.7, '#1a8ab0'], [0.7, 0.18, '#b03a8c']].forEach(function (n) { var g1 = bx.createRadialGradient(gw * n[0], gh * n[1], 0, gw * n[0], gh * n[1], gw * 0.3); g1.addColorStop(0, n[2] + '55'); g1.addColorStop(1, n[2] + '00'); bx.fillStyle = g1; bx.fillRect(0, 0, gw, gh); }); FL.bg = bgc; FL.bgW = W; }
    cx.drawImage(FL.bg, 0, 0, W, H);
    /* a glow where we are headed */
    var gl = cx.createRadialGradient(mx, my, 0, mx, my, Math.min(W, H) * 0.35); gl.addColorStop(0, 'rgba(190,230,255,' + (0.28 * Math.min(1, v / 1700)).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(190,230,255,0)'); cx.fillStyle = gl; cx.fillRect(0, 0, W, H);
    cx.lineCap = 'round';
    stars.forEach(function (s) { var r0 = s.r; s.r += v * s.z * dt * (0.25 + s.r / 420); if (s.r > lim) { s.r = 6 + Math.random() * 40; s.a = Math.random() * 6.283; r0 = s.r; } var len = Math.max(1, v * s.z * 0.012 * (0.4 + s.r / 300)); cx.strokeStyle = s.c; cx.lineWidth = 3 * (1 + Math.floor(s.r / 220)); cx.beginPath(); cx.moveTo(mx + Math.cos(s.a) * (s.r - len), my + Math.sin(s.a) * (s.r - len) * 0.9); cx.lineTo(mx + Math.cos(s.a) * s.r, my + Math.sin(s.a) * s.r * 0.9); cx.stroke(); });
    var a = ease(t / 1300), b = ease((t - 4600) / 2000), base = Math.min(W, H) / 300;
    function place(e, x, y, s) { e.style.transform = 'translate(' + (x - 150) + 'px,' + (y - 150) + 'px) scale(' + s + ')'; }
    /* the world you left falls away behind you, the one you want grows out of the vanishing point */
    pa.style.opacity = String(t < 1500 ? 1 - a * 0.3 : 0); place(pa, lerp(W / 2 - ux * W * 0.22, W / 2 - ux * W * 0.62, a), lerp(H / 2 - uy * H * 0.22 + H * 0.1, H / 2 - uy * H * 0.7, a), lerp(1.3 * base, 0.2 * base, a));
    pb.style.opacity = String(t > 4600 ? 1 : 0); place(pb, lerp(mx, W / 2 + ux * W * 0.26, b), lerp(my, H / 2 + uy * H * 0.2, b), lerp(0.03 * base, 0.95 * base, b));
    prog.style.width = (t / DUR * 100).toFixed(1) + '%';
    var li = Math.min(lines.length - 1, Math.floor(t / (DUR / lines.length))); if (li !== shown) { shown = li; typed = 0; if (li > 0) SFX.play(li === 1 && mid.length ? (shielded ? 'zap' : 'blip') : 'tick'); }
    if (shielded && li === 1 && !flared) { flared = true; shl.classList.add('on'); SFX.play('zap'); }
    typed += 2.5; tick.textContent = lines[li].slice(0, Math.floor(typed));
    if (t >= DUR) { arrive(); return; }
    FL.raf = requestAnimationFrame(frame);
  }
  function evCard() {
    phase = 'event'; cancelAnimationFrame(FL.raf); $('fl-cap').hidden = true; var body = '';
    mid.forEach(function (e) { body += '<div class="le ' + e.kind + (e.shield ? ' shieldle' : '') + '" style="font-size:15px;margin-top:6px">' + e.text + '</div>'; });
    SFX.play(shielded ? 'win' : worst === 'loss' ? 'bad' : worst === 'gain' ? 'win' : 'pop');
    $('fl-card').innerHTML = FL.card(FL.headFor(shielded ? 'shield' : dodged ? 'dodge' : worst), body, 'Carry on', 'fl-next', shielded ? 'shieldcard' : '');
  }
  function arrCard() {
    phase = 'arrive'; cancelAnimationFrame(FL.raf); $('fl-cap').hidden = true; pa.style.opacity = '0'; pb.style.opacity = '0'; cx.clearRect(0, 0, W, H); shl.classList.remove('on');
    /* the most useful few lines first (money and jobs), the rest are in the log */
    var rank = function (e) { return /Job done|Job failed|Ninth Lane|Payday|Strike|fees over|offers you/.test(e.text) ? 0 : e.kind === 'gain' || e.kind === 'loss' ? 1 : /rumour|Word on the lanes|buyer on/.test(e.text) ? 2 : 3; };
    var show = post.slice().sort(function (a, b) { return rank(a) - rank(b); }), extra = '';
    show.slice(0, 5).forEach(function (e) { extra += '<div class="le ' + e.kind + '" style="font-size:13px;margin-top:4px">' + e.text + '</div>'; });
    if (show.length > 5) extra += '<div class="dim" style="font-size:13px;margin-top:4px">...and ' + (show.length - 5) + ' more in the flight log.</div>';
    $('fl-card').innerHTML = FL.card('WELCOME TO ' + esc(B.name.toUpperCase()), '<canvas id="fl-pic" style="width:100%;border:4px solid var(--ink);border-radius:12px;display:block"></canvas><div class="dim" style="margin:6px 0 0;font-size:13px">' + B.type + ' &middot; say it: ' + esc(B.say) + '</div>' + extra, 'Dock', 'fl-dock', 'arrive');
    var pic = $('fl-pic'); if (pic) UI.drawPlanet(pic, B); SFX.play('coin');
  }
  function arrive() { if (mid.length) evCard(); else arrCard(); }
  el.onclick = function (e) {
    var ac = e.target.closest('[data-act]');
    if (phase === 'warp' && !ac) { t0 = performance.now() - DUR + 50; return; }
    if (!ac) return;
    if (ac.dataset.act === 'fl-next') { arrCard(); return; }
    if (ac.dataset.act === 'fl-dock') { phase = 'done'; cancelAnimationFrame(FL.raf); el.hidden = true; el.innerHTML = ''; $('stage').removeAttribute('aria-hidden'); el.onclick = null; done(); }
  };
  FL.raf = requestAnimationFrame(frame);
};
