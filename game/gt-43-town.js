/* Galactic Trader 9. Part 43: the towns, rebuilt in 3D. Every world's street is now a small rendered plaza: free-standing buildings with clear gaps between them, seen from a raised
   camera, lit by that world's sun, with painted-on windows, doors and signs, ground shadows, and lit windows and bloom at night. Each world has its own architecture (gt-44-worlds.js).
   This part is the engine: camera, solid primitives, wall decals, sorting and drawing. The picture is 1280 x 800; click targets and doors are reported in the old 320 x 200 scene units. */
var TW = { W: 1280, H: 800, F: 900, CY: 0.6, cam: [0, 12, 22.5], look: [0, 1.5, -6.5], PXU: 22 };
(function () {
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function norm(a) { var n = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / n, a[1] / n, a[2] / n]; }
  function cen(v) { var c = [0, 0, 0]; v.forEach(function (p) { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; }); return [c[0] / v.length, c[1] / v.length, c[2] / v.length]; }
  function rgb(h) { var n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  TW.rgb = rgb; TW.norm = norm;
  var fw, rt, up;
  function basis() { fw = norm(sub(TW.look, TW.cam)); rt = norm(cross(fw, [0, 1, 0])); up = cross(rt, fw); }
  basis();
  /* v10: point the camera somewhere else (the bar interiors use this); returns the old settings so they can be put back */
  TW.setCam = function (o) { var old = { cam: TW.cam, look: TW.look, F: TW.F, W: TW.W, H: TW.H, CY: TW.CY }; ['cam', 'look', 'F', 'W', 'H', 'CY'].forEach(function (k) { if (o[k] !== undefined) TW[k] = o[k]; }); basis(); return old; };
  /* world point to picture point: [x, y, depth] */
  TW.P = function (p) { var d = sub(p, TW.cam), z = dot(d, fw); if (z < 0.5) z = 0.5; return [TW.W / 2 + TW.F * dot(d, rt) / z, TW.H * TW.CY - TW.F * dot(d, up) / z, z]; };

  /* ---------- solids. A mesh is one free-standing thing: { f: faces, lo, hi (bounds) } ---------- */
  TW.mesh = function () { return { f: [], lo: [1e9, 1e9, 1e9], hi: [-1e9, -1e9, -1e9] }; };
  /* verts are given bottom-left, bottom-right, top-right, top-left as seen from outside, so a decal lands the right way up. o: { tex, e (glows), ao (darker at the foot), n (normal) } */
  TW.face = function (m, v, col, o) {
    o = o || {}; var n = o.n || norm(cross(sub(v[1], v[0]), sub(v[2], v[0])));
    if (o.ref) { var d = sub(cen(v), o.ref); if (dot(n, d) < 0) { v = v.slice().reverse(); n = [-n[0], -n[1], -n[2]]; } }
    v.forEach(function (p) { for (var k = 0; k < 3; k++) { if (p[k] < m.lo[k]) m.lo[k] = p[k]; if (p[k] > m.hi[k]) m.hi[k] = p[k]; } });
    m.f.push({ v: v, n: n, c: typeof col === 'string' ? rgb(col) : col, tex: o.tex, e: o.e || 0, ao: o.ao, lit: o.lit });
  };
  /* c is the centre of the base; s is [width, height, depth]. o.tex: { front, back, left, right, top }; o.cols the same keys for colours */
  TW.box = function (m, c, s, col, o) {
    o = o || {}; var x0 = c[0] - s[0] / 2, x1 = c[0] + s[0] / 2, y0 = c[1], y1 = c[1] + s[1], z0 = c[2] - s[2] / 2, z1 = c[2] + s[2] / 2, t = o.tex || {}, k = o.cols || {}, e = o.e;
    var F = function (v, n, key, ao) { TW.face(m, v, k[key] || col, { n: n, tex: t[key], ao: ao && o.ao !== false, e: e }); };
    F([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1], 'front', 1); F([[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]], [0, 0, -1], 'back', 1);
    F([[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], [1, 0, 0], 'right', 1); F([[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], [-1, 0, 0], 'left', 1);
    F([[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], [0, 1, 0], 'top');
  };
  /* a tapering block: base w x d at y, top w2 x d2 at y + h. Walls lean in. */
  TW.frustum = function (m, c, w, d, w2, d2, h, col, o) {
    o = o || {}; var y0 = c[1], y1 = y0 + h, a = [c[0] - w / 2, c[0] + w / 2, c[2] - d / 2, c[2] + d / 2], b = [c[0] - w2 / 2, c[0] + w2 / 2, c[2] - d2 / 2, c[2] + d2 / 2], t = o.tex || {}, k = o.cols || {}, ref = [c[0], y0 + h / 2, c[2]];
    var F = function (v, key, ao) { TW.face(m, v, k[key] || col, { ref: ref, tex: t[key], ao: ao, e: o.e }); };
    F([[a[0], y0, a[3]], [a[1], y0, a[3]], [b[1], y1, b[3]], [b[0], y1, b[3]]], 'front', 1); F([[a[1], y0, a[2]], [a[0], y0, a[2]], [b[0], y1, b[2]], [b[1], y1, b[2]]], 'back', 1);
    F([[a[1], y0, a[3]], [a[1], y0, a[2]], [b[1], y1, b[2]], [b[1], y1, b[3]]], 'right', 1); F([[a[0], y0, a[2]], [a[0], y0, a[3]], [b[0], y1, b[3]], [b[0], y1, b[2]]], 'left', 1);
    if (w2 > 0.02 && d2 > 0.02) F([[b[0], y1, b[3]], [b[1], y1, b[3]], [b[1], y1, b[2]], [b[0], y1, b[2]]], 'top');
  };
  /* a pitched roof on a w x d footprint at height y: ridge along x (ax 0) or along z (ax 2), rise h, overhang ov */
  TW.gable = function (m, c, w, d, h, ax, col, o) {
    o = o || {}; var ov = o.ov === undefined ? 0.25 : o.ov, x0 = c[0] - w / 2 - ov, x1 = c[0] + w / 2 + ov, z0 = c[2] - d / 2 - ov, z1 = c[2] + d / 2 + ov, y = c[1], ref = [c[0], y, c[2]], end = o.end || col, t = o.tex;
    if (ax === 0) {
      TW.face(m, [[x0, y, z1], [x1, y, z1], [x1, y + h, c[2]], [x0, y + h, c[2]]], col, { ref: ref, tex: t }); TW.face(m, [[x1, y, z0], [x0, y, z0], [x0, y + h, c[2]], [x1, y + h, c[2]]], col, { ref: ref, tex: t });
      TW.face(m, [[x1 - ov, y, z1 - ov], [x1 - ov, y, z0 + ov], [x1 - ov, y + h, c[2]]], end, { ref: ref }); TW.face(m, [[x0 + ov, y, z0 + ov], [x0 + ov, y, z1 - ov], [x0 + ov, y + h, c[2]]], end, { ref: ref });
    } else {
      TW.face(m, [[x1, y, z1], [x1, y, z0], [c[0], y + h, z0], [c[0], y + h, z1]], col, { ref: ref, tex: t }); TW.face(m, [[x0, y, z0], [x0, y, z1], [c[0], y + h, z1], [c[0], y + h, z0]], col, { ref: ref, tex: t });
      TW.face(m, [[x0 + ov, y, z1 - ov], [x1 - ov, y, z1 - ov], [c[0], y + h, z1 - ov]], end, { ref: ref, tex: o.endTex }); TW.face(m, [[x1 - ov, y, z0 + ov], [x0 + ov, y, z0 + ov], [c[0], y + h, z0 + ov]], end, { ref: ref });
    }
  };
  /* an upright round thing from stacked rings: prof is [[y, r], ...] from the bottom up. col may be a function (ring, segment). Closed at the top if the last radius is > 0. */
  TW.lathe = function (m, c, prof, n, col, o) {
    o = o || {}; var R = prof.map(function (p) { var a = []; for (var j = 0; j < n; j++) { var t = (j + 0.5) / n * 6.2832; a.push([c[0] + Math.cos(t) * p[1] * (o.sx || 1), c[1] + p[0], c[2] + Math.sin(t) * p[1] * (o.sz || 1)]); } return a; });
    for (var i = 0; i < prof.length - 1; i++) for (var j = 0; j < n; j++) {
      var k = (j + 1) % n, ref = [c[0], c[1] + (prof[i][0] + prof[i + 1][0]) / 2, c[2]], cc = typeof col === 'function' ? col(i, j) : col, a = R[i][j], b = R[i][k], cc2 = R[i + 1][k], d = R[i + 1][j];
      if (prof[i + 1][1] < 0.01) TW.face(m, [a, b, d], cc, { ref: ref, e: o.e }); else if (prof[i][1] < 0.01) TW.face(m, [a, cc2, d], cc, { ref: ref, e: o.e }); else TW.face(m, [a, b, cc2, d], cc, { ref: ref, e: o.e, tex: o.tex && j === Math.floor(n / 4) ? o.tex : null });
    }
    var last = prof[prof.length - 1]; if (last[1] > 0.01) TW.face(m, R[prof.length - 1], o.cap || (typeof col === 'function' ? col(prof.length - 1, 0) : col), { n: [0, 1, 0] });
  };
  TW.cyl = function (m, c, r, h, n, col, o) { TW.lathe(m, c, [[0, r], [h, (o && o.r2 !== undefined) ? o.r2 : r]], n, col, o); };
  TW.dome = function (m, c, r, n, col, o) { o = o || {}; var k = o.rings || 4, prof = [], sq = o.squash || 1; for (var i = 0; i <= k; i++) { var a = i / k * 1.5708; prof.push([Math.sin(a) * r * sq, Math.max(0.001, Math.cos(a) * r)]); } TW.lathe(m, c, prof, n, col, o); };
  /* a barrel roof (half cylinder) over a w x d footprint at height y, running along x (ax 0) or z (ax 2) */
  TW.barrel = function (m, c, w, d, ax, col, o) {
    o = o || {}; var n = o.n || 8, r = (ax === 0 ? d : w) / 2, len = ax === 0 ? w : d, ref = [c[0], c[1], c[2]], i, pts = [], end = o.end || col, hs = o.hs || 1;
    for (i = 0; i <= n; i++) { var a = i / n * 3.1416; pts.push([Math.cos(a) * r, Math.sin(a) * r * hs]); }
    var V = function (p, t) { return ax === 0 ? [c[0] + t, c[1] + p[1], c[2] + p[0]] : [c[0] + p[0], c[1] + p[1], c[2] + t]; };
    for (i = 0; i < n; i++) TW.face(m, [V(pts[i], -len / 2), V(pts[i], len / 2), V(pts[i + 1], len / 2), V(pts[i + 1], -len / 2)], typeof col === 'function' ? col(i) : col, { ref: ref });
    [-len / 2, len / 2].forEach(function (t) { TW.face(m, pts.map(function (p) { return V(p, t); }), end, { ref: ref, tex: t > 0 && ax === 2 ? o.endTex : null }); });
  };

  /* ---------- decals: painted onto a wall in its own flat space (w x h world units, origin top left, PXU pixels per unit) ---------- */
  var D = TW.D = {};
  D.many = function () { var a = arguments; return function (c, w, h, q) { for (var i = 0; i < a.length; i++) if (a[i]) a[i](c, w, h, q); }; };
  /* a grid of windows. o: { cols, rows, x0, x1, y0, y1 (fractions of the wall), glass, lit, frame, arch, seed, p (share lit at night) } */
  D.win = function (o) {
    return function (c, w, h, q) {
      var x0 = (o.x0 || 0.08) * w, x1 = (o.x1 || 0.92) * w, y0 = (o.y0 || 0.12) * h, y1 = (o.y1 || 0.62) * h, cw = (x1 - x0) / o.cols, rh = (y1 - y0) / o.rows, gx = cw * (o.gap || 0.28), gy = rh * (o.gapy || o.gap || 0.28), rnd = GT.seeded((o.seed || 7) * 31 + o.cols);
      for (var r = 0; r < o.rows; r++) for (var k = 0; k < o.cols; k++) {
        var x = x0 + k * cw + gx / 2, y = y0 + r * rh + gy / 2, ww = cw - gx, hh = rh - gy, lit = rnd() < (o.p === undefined ? 0.6 : o.p);
        if (q.pass === 1) { if (q.night && lit) { c.fillStyle = o.lit || '#ffd870'; shape(c, x, y, ww, hh, o.arch); c.fill(); } continue; }
        if (o.frame) { c.fillStyle = o.frame; shape(c, x - 1.5, y - 1.5, ww + 3, hh + 3, o.arch); c.fill(); }
        c.fillStyle = q.night ? (lit ? (o.lit || '#ffd870') : '#0a0e1c') : (o.glass || '#274a78'); shape(c, x, y, ww, hh, o.arch); c.fill();
        if (!q.night) { c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + ww * 0.6, y); c.lineTo(x, y + hh * 0.7); c.closePath(); c.fill(); }
      }
    };
  };
  function shape(c, x, y, w, h, arch) { c.beginPath(); if (arch) { c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, 3.1416, 0); c.lineTo(x + w, y + h); c.closePath(); } else c.rect(x, y, w, h); }
  /* a door at the foot of the wall. o: { w, h (world units), x (fraction, centre), col, arch, kind: 'double' | 'roller' | 'dark' | 'glow', trim, glow } */
  D.door = function (o) {
    return function (c, w, h, q) {
      var dw = o.w * TW.PXU, dh = o.h * TW.PXU, x = (o.x === undefined ? 0.5 : o.x) * w - dw / 2, y = h - dh;
      if (q.pass === 1) { if (o.kind === 'glow' || (q.night && o.kind !== 'dark' && o.kind !== 'roller')) { c.fillStyle = o.glow || '#ffcf70'; c.globalAlpha = o.kind === 'glow' ? 1 : 0.55; shape(c, x + 2, y + 2, dw - 4, dh - 2, o.arch); c.fill(); c.globalAlpha = 1; } return; }
      c.fillStyle = o.trim || '#1a1410'; shape(c, x - 3, y - 3, dw + 6, dh + 3, o.arch); c.fill();
      c.fillStyle = o.kind === 'dark' ? '#07080c' : (o.col || '#5a3a22'); shape(c, x, y, dw, dh, o.arch); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = 1.5;
      if (o.kind === 'double' || o.kind === 'barn') { c.beginPath(); c.moveTo(x + dw / 2, y); c.lineTo(x + dw / 2, y + dh); c.stroke(); }
      if (o.kind === 'barn') { c.strokeStyle = o.brace || '#f2ead8'; c.lineWidth = 2.5; c.strokeRect(x + 2, y + 2, dw / 2 - 3, dh - 3); c.strokeRect(x + dw / 2 + 1, y + 2, dw / 2 - 3, dh - 3); c.beginPath(); c.moveTo(x + 2, y + 2); c.lineTo(x + dw / 2 - 1, y + dh); c.moveTo(x + dw / 2 - 1, y + 2); c.lineTo(x + 2, y + dh); c.moveTo(x + dw / 2 + 1, y + 2); c.lineTo(x + dw - 2, y + dh); c.moveTo(x + dw - 2, y + 2); c.lineTo(x + dw / 2 + 1, y + dh); c.stroke(); }
      if (o.kind === 'roller') { for (var i = 3; i < dh; i += 5) { c.beginPath(); c.moveTo(x, y + i); c.lineTo(x + dw, y + i); c.stroke(); } }
      if (o.kind === 'glass') { c.fillStyle = q.night ? '#ffcf70' : '#6fc0e8'; c.fillRect(x + 3, y + 3, dw / 2 - 4, dh - 4); c.fillRect(x + dw / 2 + 1, y + 3, dw / 2 - 4, dh - 4); }
    };
  };
  /* lines across a wall: 'h' boards, 'v' corrugation, 'brick' blocks, 'panel' plates */
  D.lines = function (kind, step, col, alpha) {
    return function (c, w, h, q) {
      if (q.pass) return; c.strokeStyle = col || '#000'; c.globalAlpha = alpha || 0.18; c.lineWidth = 1.2; c.beginPath(); var s = step * TW.PXU, i, j;
      if (kind === 'h' || kind === 'brick' || kind === 'panel') for (i = s; i < h; i += s) { c.moveTo(0, i); c.lineTo(w, i); }
      if (kind === 'v' || kind === 'panel') for (i = s * (kind === 'panel' ? 2 : 1); i < w; i += s * (kind === 'panel' ? 2 : 1)) { c.moveTo(i, 0); c.lineTo(i, h); }
      if (kind === 'brick') for (j = 0, i = 0; i < h; i += s, j++) for (var x = (j % 2 ? s : s * 2); x < w; x += s * 2) { c.moveTo(x, i); c.lineTo(x, i + s); }
      c.stroke(); c.globalAlpha = 1;
    };
  };
  /* a coloured band: y and hh are fractions of the wall height */
  D.band = function (y, hh, col, lit) { return function (c, w, h, q) { if (q.pass === 1) { if (lit && q.night) { c.fillStyle = col; c.fillRect(0, y * h, w, hh * h); } return; } c.fillStyle = col; c.fillRect(0, y * h, w, hh * h); }; };
  D.rect = function (x, y, ww, hh, col, lit) { return function (c, w, h, q) { if (q.pass === 1) { if (lit) { c.fillStyle = col; c.fillRect(x * w, y * h, ww * w, hh * h); } return; } c.fillStyle = col; c.fillRect(x * w, y * h, ww * w, hh * h); }; };
  /* the shop sign: a board near the top of the wall with the name on it; glows after dark. o: { text, bg, fg, y (fraction of wall height for the board centre), hgt (world units) } */
  D.sign = function (o) {
    return function (c, w, h, q) {
      var t = o.text || '', lines = [t], mid, i, best = -1;
      if (t.length > 12 && t.indexOf(' ') > 0) { mid = t.length / 2; for (i = 0; i < t.length; i++) if (t[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i; lines = [t.slice(0, best), t.slice(best + 1)]; }
      var bh = (o.hgt || 0.95) * TW.PXU * (lines.length > 1 ? 1.5 : 1), bw = Math.min(w - 4, Math.max(w * 0.62, 0)), fs = bh / lines.length * 0.62, wide = 0;
      c.font = '900 ' + fs + 'px Orbitron, Arial Black, sans-serif'; lines.forEach(function (l) { wide = Math.max(wide, c.measureText(l).width); });
      bw = Math.min(w - 4, wide + 14); if (wide > bw - 8) { fs *= (bw - 8) / wide; c.font = '900 ' + fs + 'px Orbitron, Arial Black, sans-serif'; }
      var x = (w - bw) / 2, y = Math.max(2, (o.y === undefined ? 0.14 : o.y) * h - bh / 2);
      c.textAlign = 'center'; c.textBaseline = 'middle';
      if (q.pass === 1) { if (!q.night || o.dead) return; c.fillStyle = o.fg || '#ffe27a'; lines.forEach(function (l, k) { c.fillText(l, w / 2, y + bh * (k + 0.5) / lines.length + 1); }); c.strokeStyle = o.fg || '#ffe27a'; c.lineWidth = 1.5; c.strokeRect(x + 1.5, y + 1.5, bw - 3, bh - 3); return; }
      c.fillStyle = '#0a0c12'; c.fillRect(x - 2, y - 2, bw + 4, bh + 4); c.fillStyle = o.bg || '#1c2c94'; c.fillRect(x, y, bw, bh);
      c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(x, y, bw, bh * 0.4);
      c.fillStyle = o.fg || '#ffe27a'; lines.forEach(function (l, k) { c.fillText(l, w / 2, y + bh * (k + 0.5) / lines.length + 1); });
    };
  };
  /* anything else: draw(c, w, h, q) is used as given */

  /* ---------- drawing a town ---------- */
  /* scene: { meshes: [mesh], sun: [x,y,z], amb: [r,g,b] tint 0..1, night, flat: [fn(c)] ground-level paint done before the solids } */
  TW.render = function (cx, sc) {
    var L = norm(sc.sun), night = sc.night, list = sc.meshes.slice();
    list.forEach(function (m) { var cc = [(m.lo[0] + m.hi[0]) / 2, 0, (m.lo[2] + m.hi[2]) / 2], d = sub(cc, TW.cam); m.z = d[0] * d[0] + d[2] * d[2] + (m.zb || 0); });
    list.sort(function (a, b) { return b.z - a.z; });
    /* ground shadows first */
    if (!night) list.forEach(function (m) {
      if (m.noShadow) return; var h = m.hi[1] * 0.42, sx = -L[0] / Math.max(0.3, L[1]) * h, sz = -L[2] / Math.max(0.3, L[1]) * h, x0 = m.lo[0], x1 = m.hi[0], z0 = m.lo[2], z1 = m.hi[2], y = m.base || 0.02;
      var pts = [[x0, y, z1], [x1, y, z1], [x1 + sx, y, z1 + sz], [x1 + sx, y, z0 + sz], [x0 + sx, y, z0 + sz], [x0, y, z0]].map(TW.P);
      cx.fillStyle = 'rgba(8,10,30,.3)'; cx.beginPath(); pts.forEach(function (p, i) { if (i) cx.lineTo(p[0], p[1]); else cx.moveTo(p[0], p[1]); }); cx.closePath(); cx.fill();
    });
    list.forEach(function (m) {
      var fs = [];
      m.f.forEach(function (f) { var c = cen(f.v), d = sub(TW.cam, c); if (dot(f.n, d) <= 0) return; fs.push({ f: f, z: dot(d, d) }); });
      fs.sort(function (a, b) { return b.z - a.z; });
      fs.forEach(function (it) {
        var f = it.f, pv = f.v.map(TW.P), dif = Math.max(0, dot(f.n, L)), I, c = f.c, r, g, b;
        if (f.e) { r = c[0]; g = c[1]; b = c[2]; if (night === false && f.e < 2) { r *= 0.9; g *= 0.9; b *= 0.9; } }
        else if (night) { I = 0.2 + 0.26 * dif + (f.n[1] > 0.5 ? 0.06 : 0); r = c[0] * I * 0.75 + 4; g = c[1] * I * 0.85 + 8; b = c[2] * I * 1.15 + 22; }
        else { I = 0.46 + 0.62 * dif; r = c[0] * I * sc.amb[0]; g = c[1] * I * sc.amb[1]; b = c[2] * I * sc.amb[2] + (1 - dif) * 10; }
        var col = 'rgb(' + Math.min(255, Math.round(r)) + ',' + Math.min(255, Math.round(g)) + ',' + Math.min(255, Math.round(b)) + ')';
        cx.beginPath(); pv.forEach(function (p, i) { if (i) cx.lineTo(p[0], p[1]); else cx.moveTo(p[0], p[1]); }); cx.closePath(); cx.fillStyle = col; cx.fill(); cx.strokeStyle = col; cx.lineWidth = 1; cx.stroke();
        if ((f.tex || f.ao) && pv.length === 4) {
          var w = Math.hypot(f.v[1][0] - f.v[0][0], f.v[1][1] - f.v[0][1], f.v[1][2] - f.v[0][2]) * TW.PXU, h = Math.hypot(f.v[3][0] - f.v[0][0], f.v[3][1] - f.v[0][1], f.v[3][2] - f.v[0][2]) * TW.PXU, TL = pv[3], TR = pv[2], BL = pv[0];
          cx.save(); cx.clip(); cx.transform((TR[0] - TL[0]) / w, (TR[1] - TL[1]) / w, (BL[0] - TL[0]) / h, (BL[1] - TL[1]) / h, TL[0], TL[1]);
          if (f.tex) { f.tex(cx, w, h, { night: night, pass: 0 }); }
          /* shade the paint to match the wall, darker towards the foot */
          var sh = night ? 0.62 : Math.max(0, 0.42 - dif * 0.5), gr = cx.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(' + (night ? '4,8,30,' : '10,10,30,') + sh + ')'); gr.addColorStop(1, 'rgba(' + (night ? '4,8,30,' : '10,10,30,') + Math.min(0.85, sh + (f.ao ? 0.2 : 0.05)) + ')');
          if (f.tex || f.ao) { cx.fillStyle = gr; cx.fillRect(0, 0, w, h); }
          if (f.tex) { f.tex(cx, w, h, { night: night, pass: 1 }); }
          cx.restore();
        }
      });
    });
  };
  /* the outline of a mesh on the picture, in old scene units (320 x 200), as a flat list for a polygon */
  TW.hull = function (m) {
    var pts = [], x, y, z; for (x = 0; x < 2; x++) for (y = 0; y < 2; y++) for (z = 0; z < 2; z++) { var p = TW.P([x ? m.hi[0] : m.lo[0], y ? m.hi[1] : Math.max(0, m.lo[1]), z ? m.hi[2] : m.lo[2]]); pts.push([p[0] / 4, p[1] / 4]); }
    pts.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    var cr = function (o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }, lo = [], hi = [], i;
    for (i = 0; i < pts.length; i++) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], pts[i]) <= 0) lo.pop(); lo.push(pts[i]); }
    for (i = pts.length - 1; i >= 0; i--) { while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], pts[i]) <= 0) hi.pop(); hi.push(pts[i]); }
    lo.pop(); hi.pop(); var out = []; lo.concat(hi).forEach(function (p) { out.push(Math.max(0, Math.min(320, p[0])), Math.max(0, Math.min(200, p[1]))); }); return out;
  };
  /* where a walker stands at a world spot, and how big they look there */
  TW.spot = function (p) { var q = TW.P(p), s = Math.max(0.5, Math.min(1, TW.F * 1.9 / q[2] / 4 / 26)); return { x: Math.round(q[0] / 4), y: Math.round(q[1] / 4), s: s, sc: s }; };
  /* a filled shape on the ground from world points */
  TW.ground = function (cx, pts, fill, stroke, lw) { cx.beginPath(); pts.forEach(function (p, i) { var q = TW.P(p); if (i) cx.lineTo(q[0], q[1]); else cx.moveTo(q[0], q[1]); }); cx.closePath(); if (fill) { cx.fillStyle = fill; cx.fill(); } if (stroke) { cx.strokeStyle = stroke; cx.lineWidth = lw || 1; cx.stroke(); } };
  TW.gline = function (cx, a, b, col, lw) { var p = TW.P(a), q = TW.P(b); cx.strokeStyle = col; cx.lineWidth = lw || 1; cx.beginPath(); cx.moveTo(p[0], p[1]); cx.lineTo(q[0], q[1]); cx.stroke(); };
  TW.horizon = function () { return TW.P([0, 0, -900])[1]; };
})();
