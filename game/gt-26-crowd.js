/* Galactic Trader 4. Part 26: life on the street. Passers-by walk from one building door to another and vanish inside (about one every three seconds, sometimes two at once),
   and now and then a few birds flap slowly across the skyline. Everything is drawn into the street's <svg id="crowd"> layer, under the click targets, so it never gets in the way.
   One animation loop runs for the whole game and only does work while the street is on screen. */
var CR = { walkers: [], birds: [], pool: {}, cur: null, nextW: 0, nextB: 0, started: false };
CR.SPEED = 24;      /* scene pixels per second, a stroll */
CR.POOL = 14;       /* different passers-by, drawn once and reused */

CR.rnd = function () { return Math.random(); };
CR.person = function (k) {
  if (CR.pool[k]) return CR.pool[k];
  var t = CH.fromSeed('walker-' + k, {}), g = CH.sprite(t).replace(/^<g/, '<svg viewBox="-6 -2 112 176"><g').replace(/<\/g>$/, '</g></svg>');
  return (CR.pool[k] = PX.svgImage(g, -7, -26, 14, 26, 'pl'));
};

/* the doors a walker may use: every building on the street, but not the spaceport sign at the front */
CR.doors = function () { var d = SC.door || {}, out = []; Object.keys(d).forEach(function (k) { if (k !== 'pad' && d[k] && d[k].x != null) out.push(d[k]); }); return out; };

CR.spawnWalker = function (now) {
  var layer = CR.cur, ds = CR.doors(); if (!layer || ds.length < 2) return;
  var a = ds[Math.floor(CR.rnd() * ds.length)], b, tries = 0;
  do { b = ds[Math.floor(CR.rnd() * ds.length)]; tries++; } while ((b === a || Math.hypot(a.x - b.x, a.y - b.y) < 36) && tries < 12);
  if (b === a) return;
  var dist = Math.hypot(b.x - a.x, b.y - a.y), g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'walker'); g.setAttribute('opacity', '0'); g.innerHTML = CR.person(Math.floor(CR.rnd() * CR.POOL));
  layer.appendChild(g);
  CR.walkers.push({ el: g, a: a, b: b, t0: now, dur: Math.max(2.2, dist / CR.SPEED) * 1000, ph: CR.rnd() * 6 });
};

CR.spawnBirds = function (now) {
  var layer = CR.cur; if (!layer) return;
  var n = 1 + Math.floor(CR.rnd() * 3), dir = CR.rnd() < 0.5 ? 1 : -1, y0 = 8 + CR.rnd() * 34, sp = 7 + CR.rnd() * 5, night = SC.night(S), col = night ? '#aaaaaa' : '#000000', k;
  for (k = 0; k < n; k++) {
    var big = CR.rnd() < 0.6, up = '', dn = '', s = big ? 1 : 0.7;
    var px = function (list) { return list.map(function (p) { return '<rect x="' + p[0] + '" y="' + p[1] + '" width="1" height="1"/>'; }).join(''); };
    up = px([[0, 0], [6, 0], [1, 1], [5, 1], [2, 2], [3, 2], [4, 2]]); dn = px([[2, 0], [3, 0], [4, 0], [1, 1], [5, 1], [0, 2], [6, 2]]);
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'bird'); g.setAttribute('fill', col); g.setAttribute('shape-rendering', 'crispEdges');
    g.innerHTML = '<g class="wu">' + up + '</g><g class="wd" display="none">' + dn + '</g>';
    layer.appendChild(g);
    CR.birds.push({ el: g, wu: g.firstChild, wd: g.lastChild, dir: dir, x0: dir > 0 ? -12 - k * 14 : 332 + k * 14, y0: y0 + (CR.rnd() - 0.5) * 12, sp: sp * (0.9 + CR.rnd() * 0.2), t0: now, ph: CR.rnd() * 2, s: s, last: -1 });
  }
};

CR.frame = function (now) {
  requestAnimationFrame(CR.frame);
  var layer = document.getElementById('crowd');
  if (layer !== CR.cur) {                                /* a new street picture: start fresh with a couple of people already about */
    CR.cur = layer; CR.walkers = []; CR.birds = [];
    if (layer && S && !S.over) { CR.nextW = now + 150; CR.nextB = now + 1800 + CR.rnd() * 3000; CR.first = 2; }
  }
  if (!layer || (typeof reduced === 'function' && reduced())) return;
  if (now >= CR.nextW) { CR.spawnWalker(now); if (CR.first > 0) { CR.first--; CR.nextW = now + 500; } else { if (CR.rnd() < 0.28) CR.spawnWalker(now + 350); CR.nextW = now + 2300 + CR.rnd() * 1500; } }
  if (now >= CR.nextB) { CR.spawnBirds(now); CR.nextB = now + 8000 + CR.rnd() * 9000; }
  var i, w, t, e, x, y, s, f;
  for (i = CR.walkers.length - 1; i >= 0; i--) {
    w = CR.walkers[i]; t = (now - w.t0) / w.dur;
    if (t >= 1 || !w.el.isConnected) { if (w.el.parentNode) w.el.parentNode.removeChild(w.el); CR.walkers.splice(i, 1); continue; }
    if (t < 0) continue;
    x = w.a.x + (w.b.x - w.a.x) * t; y = w.a.y + (w.b.y - w.a.y) * t; s = Math.max(0.3, Math.min(1, w.a.s + (w.b.s - w.a.s) * t));
    y += (Math.floor((now / 170 + w.ph)) & 1) ? -0.7 * s : 0;     /* a little stepping bob */
    f = Math.min(1, t * 14, (1 - t) * 14);
    w.el.setAttribute('transform', 'translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ') scale(' + s.toFixed(2) + ')'); w.el.setAttribute('opacity', f.toFixed(2));
  }
  for (i = CR.birds.length - 1; i >= 0; i--) {
    w = CR.birds[i]; t = (now - w.t0) / 1000; x = w.x0 + w.dir * w.sp * t;
    if ((w.dir > 0 && x > 340) || (w.dir < 0 && x < -24) || !w.el.isConnected) { if (w.el.parentNode) w.el.parentNode.removeChild(w.el); CR.birds.splice(i, 1); continue; }
    y = w.y0 + Math.round(Math.sin(t * 0.9 + w.ph) * 2);
    w.el.setAttribute('transform', 'translate(' + Math.round(x) + ',' + Math.round(y) + ') scale(' + w.s + ')');
    f = (Math.floor(t * 3 + w.ph) & 1); if (f !== w.last) { w.last = f; w.wu.setAttribute('display', f ? 'none' : 'inline'); w.wd.setAttribute('display', f ? 'inline' : 'none'); }
  }
};
CR.start = function () { if (CR.started || typeof requestAnimationFrame !== 'function') return; CR.started = true; requestAnimationFrame(CR.frame); };
