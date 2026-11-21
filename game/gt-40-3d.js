/* Galactic Trader 8. Part 40: a small 3D engine and the four ships as polygon models. Flat-shaded, depth-sorted, lit from one side with a specular glint and engine glow:
   the look of a 1996 space sim. The same models are used everywhere a ship appears: turning slowly in the hangar, banking through the warp, parked on the pad, and in the pickers.
   Model space: x points to the nose, y is up, z is starboard. A ship is about two units long. */
var G3 = { L: (function () { var l = [-0.45, 0.72, 0.53], n = Math.hypot(l[0], l[1], l[2]); return [l[0] / n, l[1] / n, l[2] / n]; })() };
(function () {
  function rgb(h) { var n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { var n = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / n, a[1] / n, a[2] / n]; }
  function cen(v) { var c = [0, 0, 0]; v.forEach(function (p) { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; }); return [c[0] / v.length, c[1] / v.length, c[2] / v.length]; }
  G3.mesh = function () { return { f: [], g: [] }; };
  /* add a face; ref is a point known to be inside the solid, so the face is turned to point away from it. o: { e: glows, sp: shininess 0..1 } */
  G3.face = function (m, v, col, ref, o) {
    var n = norm(cross(sub(v[1], v[0]), sub(v[2], v[0]))), c = cen(v), d = sub(c, ref);
    if (n[0] * d[0] + n[1] * d[1] + n[2] * d[2] < 0) { v = v.slice().reverse(); n = [-n[0], -n[1], -n[2]]; }
    o = o || {}; m.f.push({ v: v, n: n, c: rgb(col), e: o.e || 0, sp: o.sp === undefined ? 0.5 : o.sp, j: ((m.f.length * 7919) % 13) / 13 });
  };
  G3.box = function (m, c, s, col, o) {
    var x0 = c[0] - s[0] / 2, x1 = c[0] + s[0] / 2, y0 = c[1] - s[1] / 2, y1 = c[1] + s[1] / 2, z0 = c[2] - s[2] / 2, z1 = c[2] + s[2] / 2, F = function (v, cc) { G3.face(m, v, cc || col, c, o); }, k = o && o.cols;
    F([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], k && k.top); F([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]]);
    F([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]); F([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]]);
    F([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], k && k.front); F([[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]], k && k.back);
  };
  /* a body of revolution along x. rings: [x, ry, rz, cy, cz]. col may be a function (ring index, segment index, n) for stripes. cap: colour of the open ends, or { back, front } */
  G3.lathe = function (m, rings, n, col, o) {
    o = o || {}; var P = rings.map(function (r) { var a = []; for (var j = 0; j < n; j++) { var t = j / n * 6.2832; a.push([r[0], (r[3] || 0) + Math.cos(t) * r[1], (r[4] || 0) + Math.sin(t) * (r[2] === undefined ? r[1] : r[2])]); } return a; });
    for (var i = 0; i < rings.length - 1; i++) for (var j = 0; j < n; j++) {
      var k = (j + 1) % n, a = P[i][j], b = P[i][k], c = P[i + 1][k], d = P[i + 1][j], ref = [(rings[i][0] + rings[i + 1][0]) / 2, ((rings[i][3] || 0) + (rings[i + 1][3] || 0)) / 2, ((rings[i][4] || 0) + (rings[i + 1][4] || 0)) / 2];
      var cc = typeof col === 'function' ? col(i, j, n) : col, small0 = rings[i][1] < 0.004, small1 = rings[i + 1][1] < 0.004;
      G3.face(m, small0 ? [a, c, d] : small1 ? [a, b, d] : [a, b, c, d], cc, ref, o);
    }
    var cap = function (i, cc, e) { if (rings[i][1] < 0.004) return; G3.face(m, P[i], cc, [rings[i][0] + (i ? -1 : 1), rings[i][3] || 0, rings[i][4] || 0], { e: e || 0, sp: 0.2 }); };
    if (o.back) cap(0, o.back, o.backE); if (o.front) cap(rings.length - 1, o.front, o.frontE);
  };
  /* a flat plate (wing, panel, fin) from an outline of 3D points, given a thickness along axis ax (0 x, 1 y, 2 z) */
  G3.plate = function (m, pts, ax, th, col, o) {
    var top = pts.map(function (p) { var q = p.slice(); q[ax] += th / 2; return q; }), bot = pts.map(function (p) { var q = p.slice(); q[ax] -= th / 2; return q; }), c = cen(pts), n = pts.length, k = o && o.cols;
    G3.face(m, top, (k && k.top) || col, c, o); G3.face(m, bot, col, c, o);
    for (var i = 0; i < n; i++) { var j = (i + 1) % n; G3.face(m, [top[i], top[j], bot[j], bot[i]], (k && k.edge) || col, c, o); }
  };
  G3.glow = function (m, p, r, col, kind) { m.g.push({ p: p, r: r, c: rgb(col), k: kind || 'lamp' }); };
  G3.mirrorZ = function (pts) { return pts.map(function (p) { return [p[0], p[1], -p[2]]; }); };

  /* ---------- drawing ---------- */
  /* o: { yaw, pitch, roll, s (pixels per unit), x, y (centre), flame (0..1.5), wire } */
  G3.draw = function (cx, m, o) {
    var cy = Math.cos(o.yaw || 0), sy = Math.sin(o.yaw || 0), cp = Math.cos(o.pitch || 0), sp = Math.sin(o.pitch || 0), cr = Math.cos(o.roll || 0), sr = Math.sin(o.roll || 0), s = o.s, L = G3.L;
    var T = function (v) { var y1 = v[1] * cr - v[2] * sr, z1 = v[1] * sr + v[2] * cr, x2 = v[0] * cy + z1 * sy, z2 = -v[0] * sy + z1 * cy; return [x2, y1 * cp - z2 * sp, y1 * sp + z2 * cp]; };
    var list = [], i, f;
    for (i = 0; i < m.f.length; i++) {
      f = m.f[i]; var n = T(f.n); if (n[2] <= 0.02) continue;
      var pv = f.v.map(T), z = 0; pv.forEach(function (p) { z += p[2]; }); list.push({ z: z / pv.length, f: f, p: pv, n: n });
    }
    m.g.forEach(function (g) { var p = T(g.p); list.push({ z: p[2] - (g.k === 'flame' ? 0.05 : -0.05), g: g, p: p }); });
    list.sort(function (a, b) { return a.z - b.z; });
    cx.lineJoin = 'round';
    list.forEach(function (it) {
      if (it.g) {
        var g = it.g, px = o.x + it.p[0] * s * (1 + it.p[2] * 0.08), py = o.y - it.p[1] * s * (1 + it.p[2] * 0.08), fl = g.k === 'flame' ? (o.flame === undefined ? 1 : o.flame) : 1, r = g.r * s * (g.k === 'flame' ? 0.6 + fl * 0.7 : 1); if (r < 0.5 || fl <= 0) return;
        var gr = cx.createRadialGradient(px, py, 0, px, py, r); gr.addColorStop(0, 'rgba(255,255,255,' + (g.k === 'flame' ? 0.95 : 0.9) + ')'); gr.addColorStop(0.25, 'rgba(' + g.c + ',0.8)'); gr.addColorStop(1, 'rgba(' + g.c + ',0)');
        cx.save(); cx.globalCompositeOperation = 'lighter'; cx.fillStyle = gr; cx.beginPath(); cx.arc(px, py, r, 0, 6.3); cx.fill(); cx.restore(); return;
      }
      f = it.f; var n2 = it.n, c = f.c, col;
      if (f.e) col = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
      else {
        var d = Math.max(0, n2[0] * L[0] + n2[1] * L[1] + n2[2] * L[2]), I = 0.2 + 0.86 * d + (f.j - 0.5) * 0.05, hx = L[0], hy = L[1], hz = L[2] + 1, hn = Math.hypot(hx, hy, hz), sp2 = Math.pow(Math.max(0, (n2[0] * hx + n2[1] * hy + n2[2] * hz) / hn), 26) * f.sp * 190, rim = Math.pow(1 - n2[2], 3) * 26, bounce = Math.max(0, -n2[1]) * 0.12;
        col = 'rgb(' + Math.min(255, Math.round(c[0] * I + sp2 + rim * 0.5 + c[0] * bounce * 0.4)) + ',' + Math.min(255, Math.round(c[1] * I + sp2 + rim * 0.7 + c[1] * bounce * 0.5)) + ',' + Math.min(255, Math.round(c[2] * I + sp2 + rim + c[2] * bounce + 6)) + ')';
      }
      cx.beginPath(); it.p.forEach(function (p, k) { var pk = 1 + p[2] * 0.08, X = o.x + p[0] * s * pk, Y = o.y - p[1] * s * pk; if (k) cx.lineTo(X, Y); else cx.moveTo(X, Y); }); cx.closePath();
      cx.fillStyle = col; cx.fill(); cx.strokeStyle = o.wire ? 'rgba(111,227,255,.5)' : col; cx.lineWidth = o.wire ? 0.8 : 0.9; cx.stroke();
      if (f.e) { cx.save(); cx.globalCompositeOperation = 'lighter'; cx.shadowColor = col; cx.shadowBlur = s * 0.08; cx.fill(); cx.restore(); }
    });
  };
  /* where a model point lands on screen for a pose, as a fraction of a box (used for the hangar call-outs) */
  G3.project = function (v, o) { var cy = Math.cos(o.yaw), sy = Math.sin(o.yaw), cp = Math.cos(o.pitch), sp = Math.sin(o.pitch), x2 = v[0] * cy + v[2] * sy, z2 = -v[0] * sy + v[2] * cy, y3 = v[1] * cp - z2 * sp, z3 = v[1] * sp + z2 * cp, k = 1 + z3 * 0.08; return [o.x + x2 * o.s * k, o.y - y3 * o.s * k]; };

  /* ---------- the fleet ---------- */
  var sh = function (h, a) { return UI.shade(h, a); }, STEEL = '#7c869c', DARK = '#2a3040', GLASS = '#3fb8e8', HOT = '#ffb050';
  G3.BUILD = {
    wayfarer: function (hue) {
      var m = G3.mesh(), lt = sh(hue, 0.25), dk = sh(hue, -0.35), red = '#d8482c';
      G3.lathe(m, [[-0.98, 0.12, 0.13], [-0.86, 0.2, 0.22], [-0.3, 0.22, 0.26], [0.3, 0.2, 0.24], [0.66, 0.13, 0.16], [0.92, 0.05, 0.06], [1.02, 0.001, 0.001]], 14,
        function (i, j, n) { var side = j === 0 || j === n - 1 || j === n / 2 - 1 || j === n / 2; return i >= 1 && i <= 2 && side ? red : i === 4 ? lt : i >= 5 ? dk : (i + j) % 5 === 0 ? lt : hue; }, { back: '#ffcf80', backE: 1, sp: 0.6 });
      G3.lathe(m, [[0.22, 0.02, 0.06, 0.2], [0.34, 0.09, 0.11, 0.17], [0.56, 0.085, 0.1, 0.13], [0.74, 0.02, 0.04, 0.08]], 8, GLASS, { sp: 1 });
      var wing = [[0.28, -0.02, 0.2], [-0.42, -0.02, 0.2], [-0.72, 0.02, 0.9], [-0.38, 0.02, 0.9]];
      G3.plate(m, wing, 1, 0.05, hue, { cols: { top: lt, edge: dk } }); G3.plate(m, G3.mirrorZ(wing), 1, 0.05, hue, { cols: { top: lt, edge: dk } });
      [0.9, -0.9].forEach(function (z) {
        G3.lathe(m, [[-0.95, 0.07, 0.07, 0.02, z], [-0.88, 0.1, 0.1, 0.02, z], [-0.35, 0.1, 0.1, 0.02, z], [-0.22, 0.06, 0.06, 0.02, z]], 10, function (i) { return i === 1 ? hue : i === 2 ? red : STEEL; }, { back: '#ffcf80', backE: 1, front: '#10141c' });
        G3.glow(m, [-1.02, 0.02, z], 0.2, '#ff9a40', 'flame'); G3.glow(m, [-0.5, 0.14, z * 1.02], 0.05, z > 0 ? '#58ff7a' : '#ff4a3a');
      });
      G3.plate(m, [[-0.92, 0.18, 0], [-0.5, 0.2, 0], [-0.78, 0.62, 0], [-0.98, 0.62, 0]], 2, 0.04, hue, { cols: { edge: red } });
      G3.box(m, [-0.05, -0.2, 0], [0.5, 0.12, 0.3], dk, { sp: 0.2 });
      G3.box(m, [0.1, 0.27, 0], [0.03, 0.14, 0.03], STEEL); G3.lathe(m, [[0.04, 0.001, 0.001, 0.36], [0.1, 0.09, 0.09, 0.4]], 8, '#c8cede', { front: '#9aa4bc' });
      G3.glow(m, [-1.06, 0, 0], 0.34, '#ff9a40', 'flame');
      m.parts = { engine: [-0.95, 0, 0.1], cockpit: [0.5, 0.16, 0.05], cargo: [-0.05, -0.2, 0.15], cabin: [0.1, 0.1, 0.24], fuel: [-0.6, 0.02, 0.9] };
      return m;
    },
    barge: function (hue) {
      var m = G3.mesh(), dk = sh(hue, -0.4), lt = sh(hue, 0.3), cols = ['#c8463a', '#e8b83a', '#3f8fd8', '#4aa860', '#aab2c6', '#c8463a', '#3f8fd8', '#e8b83a'], i = 0;
      G3.box(m, [0, 0, 0], [1.5, 0.1, 0.12], STEEL, { sp: 0.3 });
      for (var ix = 0; ix < 4; ix++) for (var iy = 0; iy < 2; iy++) for (var iz = 0; iz < 2; iz++) { var c = cols[(i++ * 3 + ix) % 8]; G3.box(m, [-0.48 + ix * 0.31, iy ? 0.2 : -0.2, iz ? 0.16 : -0.16], [0.28, 0.27, 0.29], c, { sp: 0.25, cols: { top: sh(c, 0.25) } }); }
      G3.box(m, [-0.84, 0, 0], [0.34, 0.66, 0.7], hue, { sp: 0.5, cols: { top: lt, back: DARK } });
      G3.box(m, [-0.84, 0, 0], [0.36, 0.08, 0.72], '#e8c030', { sp: 0.2 });
      [[0.2, 0.2], [0.2, -0.2], [-0.2, 0.2], [-0.2, -0.2]].forEach(function (p) { G3.lathe(m, [[-1.1, 0.12, 0.12, p[0], p[1]], [-1.0, 0.09, 0.09, p[0], p[1]]], 10, STEEL, { back: '#ffcf80', backE: 1 }); G3.glow(m, [-1.14, p[0], p[1]], 0.24, '#ff9a40', 'flame'); });
      G3.plate(m, [[-1.0, 0.33, 0], [-0.7, 0.33, 0], [-0.74, 0.56, 0], [-0.96, 0.56, 0]], 2, 0.03, DARK); G3.plate(m, [[-1.0, -0.33, 0], [-0.7, -0.33, 0], [-0.74, -0.56, 0], [-0.96, -0.56, 0]], 2, 0.03, DARK);
      G3.box(m, [0.86, 0.02, 0], [0.26, 0.36, 0.44], hue, { sp: 0.5, cols: { top: lt } });
      G3.lathe(m, [[0.98, 0.2, 0.24, 0.02], [1.08, 0.09, 0.13, 0.0]], 4, dk, { front: dk });
      G3.box(m, [0.995, 0.1, 0], [0.02, 0.08, 0.34], '#8fe6ff', { e: 1 }); G3.box(m, [0.86, 0.24, 0], [0.1, 0.1, 0.1], STEEL);
      G3.box(m, [0.86, 0.34, 0], [0.02, 0.14, 0.02], '#c8cede'); G3.glow(m, [0.86, 0.43, 0], 0.05, '#ff4a3a');
      G3.glow(m, [1.0, 0.02, 0.24], 0.05, '#58ff7a'); G3.glow(m, [1.0, 0.02, -0.24], 0.05, '#ff4a3a');
      m.parts = { engine: [-1.05, 0.1, 0.2], cockpit: [1.0, 0.1, 0.1], cargo: [-0.1, 0.3, 0.2], cabin: [0.86, -0.05, 0.2], fuel: [-0.84, -0.2, 0.35] };
      return m;
    },
    stargazer: function (hue) {
      var m = G3.mesh(), lt = sh(hue, 0.3), dk = sh(hue, -0.4), n = 22, R0 = 0.5, R1 = 0.58, xa = 0.02, xb = 0.14, k;
      G3.lathe(m, [[-0.95, 0.05, 0.05], [-0.86, 0.085, 0.085], [-0.2, 0.08, 0.08], [0.5, 0.06, 0.06], [0.9, 0.03, 0.03], [1.04, 0.001, 0.001]], 10, function (i, j) { return i === 2 && j % 2 ? lt : i >= 4 ? dk : hue; }, { back: '#bff4ff', backE: 1, sp: 0.7 });
      for (k = 0; k < n; k++) {
        var a0 = k / n * 6.2832, a1 = (k + 1) / n * 6.2832, P = function (x, r, a) { return [x, Math.cos(a) * r, Math.sin(a) * r]; }, ref = [(xa + xb) / 2, Math.cos((a0 + a1) / 2) * (R0 + R1) / 2, Math.sin((a0 + a1) / 2) * (R0 + R1) / 2], cc = k % 4 === 0 ? lt : hue;
        G3.face(m, [P(xa, R1, a0), P(xa, R1, a1), P(xb, R1, a1), P(xb, R1, a0)], cc, ref, { sp: 0.6 }); G3.face(m, [P(xa, R0, a0), P(xa, R0, a1), P(xb, R0, a1), P(xb, R0, a0)], dk, ref);
        G3.face(m, [P(xb, R0, a0), P(xb, R0, a1), P(xb, R1, a1), P(xb, R1, a0)], k % 2 ? '#ffe27a' : hue, ref, { e: k % 2 }); G3.face(m, [P(xa, R0, a0), P(xa, R0, a1), P(xa, R1, a1), P(xa, R1, a0)], dk, ref);
      }
      G3.box(m, [0.08, 0, 0], [0.03, 1.0, 0.03], STEEL); G3.box(m, [0.08, 0, 0], [0.03, 0.03, 1.0], STEEL);
      var pan = [[-0.8, 0, 0.16], [-0.4, 0, 0.16], [-0.4, 0, 0.86], [-0.8, 0, 0.86]];
      G3.plate(m, pan, 1, 0.02, '#1c3aa0', { sp: 1, cols: { edge: '#c8cede' } }); G3.plate(m, G3.mirrorZ(pan), 1, 0.02, '#1c3aa0', { sp: 1, cols: { edge: '#c8cede' } });
      G3.box(m, [-0.6, 0, 0], [0.04, 0.03, 0.34], STEEL);
      G3.lathe(m, [[-0.44, 0.001, 0.001], [-0.38, 0.11, 0.11], [-0.28, 0.16, 0.16], [-0.18, 0.11, 0.11], [-0.12, 0.001, 0.001]], 10, '#c8cede', { sp: 0.9 });
      G3.lathe(m, [[0.42, 0.001, 0.001, 0.22], [0.5, 0.14, 0.14, 0.26]], 10, '#dfe5f2', { front: '#9aa4bc' }); G3.box(m, [0.45, 0.14, 0], [0.03, 0.16, 0.03], STEEL);
      G3.lathe(m, [[0.52, 0.03, 0.05, 0.075], [0.62, 0.05, 0.06, 0.07], [0.8, 0.02, 0.03, 0.04]], 8, GLASS, { sp: 1 });
      G3.glow(m, [-1.0, 0, 0], 0.3, '#5ac8ff', 'flame'); G3.glow(m, [-0.8, 0.03, 0.86], 0.05, '#ff4a3a'); G3.glow(m, [-0.8, 0.03, -0.86], 0.05, '#ff4a3a'); G3.glow(m, [1.04, 0, 0], 0.04, '#58ff7a');
      m.parts = { engine: [-0.95, 0, 0.05], cockpit: [0.65, 0.08, 0.04], cargo: [0.3, 0, 0.08], cabin: [0.08, 0.54, 0], fuel: [-0.28, 0, 0.16] };
      return m;
    },
    cutlass: function (hue) {
      var m = G3.mesh(), lt = sh(hue, 0.3), dk = sh(hue, -0.45);
      G3.lathe(m, [[-0.82, 0.07, 0.24], [-0.4, 0.12, 0.3], [0.15, 0.1, 0.21], [0.62, 0.055, 0.1], [0.94, 0.02, 0.03], [1.06, 0.001, 0.001]], 12,
        function (i, j, n) { var top = j === n / 4 || j === n / 4 - 1; return top && i <= 2 ? '#14161f' : (j === n / 4 + 1 || j === n / 4 - 2) && i <= 2 ? '#e8c030' : i >= 4 ? '#f2f4f8' : (i + j) % 4 === 0 ? lt : hue; }, { back: DARK, sp: 0.7 });
      G3.lathe(m, [[0.02, 0.02, 0.05, 0.1], [0.16, 0.07, 0.085, 0.1], [0.44, 0.06, 0.07, 0.075], [0.64, 0.015, 0.03, 0.045]], 8, '#182a44', { sp: 1 });
      var wing = [[-0.5, 0, 0.26], [-0.08, 0, 0.22], [0.42, 0.03, 0.84], [0.18, 0.03, 0.86]];
      G3.plate(m, wing, 1, 0.04, hue, { cols: { top: lt, edge: dk } }); G3.plate(m, G3.mirrorZ(wing), 1, 0.04, hue, { cols: { top: lt, edge: dk } });
      [0.86, -0.86].forEach(function (z) { G3.lathe(m, [[0.02, 0.025, 0.025, 0.03, z], [0.1, 0.035, 0.035, 0.03, z], [0.62, 0.03, 0.03, 0.03, z], [0.72, 0.001, 0.001, 0.03, z]], 6, STEEL, { back: DARK }); G3.glow(m, [0.72, 0.03, z], 0.045, z > 0 ? '#58ff7a' : '#ff4a3a'); });
      [0.15, -0.15].forEach(function (z) {
        G3.lathe(m, [[-1.04, 0.075, 0.075, 0.03, z], [-0.96, 0.1, 0.1, 0.03, z], [-0.55, 0.1, 0.1, 0.03, z], [-0.45, 0.07, 0.07, 0.03, z]], 10, function (i) { return i === 1 ? STEEL : DARK; }, { back: '#ffe0a0', backE: 1, front: '#10141c' });
        G3.glow(m, [-1.12, 0.03, z], 0.3, '#ff8a30', 'flame');
        G3.plate(m, [[-0.8, 0.1, z * 1.5], [-0.45, 0.1, z * 1.5], [-0.72, 0.4, z * 2.3], [-0.88, 0.4, z * 2.3]], 2, 0.03, hue, { cols: { edge: '#14161f' } });
      });
      m.parts = { engine: [-1.0, 0.03, 0.15], cockpit: [0.35, 0.12, 0.05], cargo: [-0.3, -0.05, 0.25], cabin: [0.0, 0.08, 0.15], fuel: [-0.6, 0.03, 0.22] };
      return m;
    }
  };
  G3.cache = {};
  G3.ship = function (id, hue) { var k = id + hue; return G3.cache[k] || (G3.cache[k] = (G3.BUILD[id] || G3.BUILD.wayfarer)(hue)); };
  G3.POSE = { yaw: -0.5, pitch: 0.4, roll: 0 };
  /* a still picture of a ship, as a data URL, drawn at twice the asked size for clean edges */
  G3.pic = {};
  G3.still = function (id, hue, w, h, pose) {
    var k = [id, hue, w, h, pose ? pose.yaw : ''].join('|'); if (G3.pic[k]) return G3.pic[k];
    var cv = document.createElement('canvas'); cv.width = w * 2; cv.height = h * 2; var o = { x: w, y: h * 1.02, s: Math.min(w * 2 / 2.8, h * 2 / 1.7), flame: 0.9 }, p = pose || G3.POSE; o.yaw = p.yaw; o.pitch = p.pitch; o.roll = p.roll || 0;
    G3.draw(cv.getContext('2d'), G3.ship(id, hue), o); return (G3.pic[k] = cv.toDataURL());
  };

  /* ---------- live canvases: any <canvas class="g3live" data-ship data-hue data-mode> in the page is animated ---------- */
  G3.tick = function (t) {
    var list = document.querySelectorAll('canvas.g3live'), i;
    for (i = 0; i < list.length; i++) {
      var cv = list[i], r = cv.getBoundingClientRect(); if (!r.width) continue;
      var W = Math.round(cv.clientWidth * 2) || 2, H = Math.round(cv.clientHeight * 2) || 2; if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
      var cx = cv.getContext('2d'), mode = cv.dataset.mode, o = { x: W / 2, y: H * 0.51, s: Math.min(W / 2.8, H / 1.7) }, still = G3.reduced;
      cx.clearRect(0, 0, W, H);
      if (mode === 'flight') { o.s = Math.min(W / 3.4, H / 2.1); o.yaw = (cv.dataset.yaw ? +cv.dataset.yaw : -0.34) + Math.sin(t / 1900) * 0.1; o.pitch = 0.5 + Math.sin(t / 1300) * 0.05; o.roll = Math.sin(t / 900) * 0.22; o.flame = 1.15 + Math.sin(t / 50) * 0.12 + Math.sin(t / 23) * 0.06; o.y = H * 0.5 + Math.sin(t / 700) * H * 0.012; }
      else { o.yaw = G3.POSE.yaw + (still ? 0 : Math.sin(t / 2600) * 0.16); o.pitch = G3.POSE.pitch + (still ? 0 : Math.sin(t / 3700) * 0.04); o.roll = still ? 0 : Math.sin(t / 3100) * 0.05; o.flame = 0.55 + (still ? 0 : Math.sin(t / 60) * 0.06); }
      G3.draw(cx, G3.ship(cv.dataset.ship, cv.dataset.hue), o);
    }
    G3.raf = requestAnimationFrame(G3.tick);
  };
  try { G3.reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  G3.raf = requestAnimationFrame(G3.tick);
  G3.live = function (id, hue, mode, cls) { return '<canvas class="g3live ' + (cls || '') + '" data-ship="' + id + '" data-hue="' + hue + '" data-mode="' + (mode || 'hangar') + '" aria-label="Your ship" role="img"></canvas>'; };

  /* the hangar call-outs point at where each part of the model sits in the resting pose */
  if (typeof PORT !== 'undefined') GT.SHIPS.forEach(function (d) {
    var m = G3.ship(d.id, d.hue), W = 224, H = 130, o = { x: W / 2, y: H * 0.51, s: Math.min(W / 2.8, H / 1.7), yaw: G3.POSE.yaw, pitch: G3.POSE.pitch }, out = {};
    Object.keys(m.parts).forEach(function (k) { var q = G3.project(m.parts[k], o); out[k] = [q[0] / W, q[1] / H]; }); PORT.PARTS[d.id] = out;
  });
  /* ---------- hook the models in wherever a ship picture was used ---------- */
  UI.shipPic = function (id, hue, w, h, scale, cls) { w = w || 64; h = h || 40; var k = scale || 2; return '<img class="shippic ' + (cls || '') + '" src="' + G3.still(id, hue, w * 2, h * 2) + '" width="' + w + '" height="' + h + '" style="width:' + w * k + 'px;height:' + h * k + 'px" alt="">'; };
  PX.shipSprite = function (hull, cls, x, y, w, h) { return '<image class="' + (cls || '') + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" href="' + G3.still(hull.id, hull.hue, Math.round(w * 6), Math.round(h * 6)) + '"/>'; };
})();
