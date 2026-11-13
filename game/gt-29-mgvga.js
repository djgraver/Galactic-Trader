/* Galactic Trader 6. Part 29: VGA paint for the mini-games and the warp flight. Colours are kept in 256 steps instead of being snapped to sixteen, shapes get an airbrushed
   light (bright top left, cool shade bottom right), and every space backdrop gets a soft nebula. */
PX.snap = function (cx, w, h) {
  var im = cx.getImageData(0, 0, w, h), d = im.data, i, x, y, L = [24, 24, 24];
  for (i = 0, y = 0; y < h; y++) for (x = 0; x < w; x++, i += 4) {
    var t = (PX.BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.47) * 5;
    for (var ch = 0; ch < 3; ch++) { var s = 255 / (L[ch] - 1); d[i + ch] = Math.round(Math.max(0, Math.min(255, d[i + ch] + t)) / s) * s; }
    d[i + 3] = 255;
  }
  cx.putImageData(im, 0, 0);
};
(function () {
  var glossBall = function (c, x, y, r) {
    var g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r * 1.05);
    g.addColorStop(0, 'rgba(255,255,255,.62)'); g.addColorStop(0.35, 'rgba(255,255,255,.08)'); g.addColorStop(0.7, 'rgba(0,0,40,.12)'); g.addColorStop(1, 'rgba(0,0,50,.5)');
    c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = g; c.fill();
  };
  var gloss = function (c, x0, y0, x1, y1) {
    c.save(); c.clip(); var g = c.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(0.35, 'rgba(255,255,255,.1)'); g.addColorStop(0.7, 'rgba(0,0,40,.1)'); g.addColorStop(1, 'rgba(0,0,50,.45)');
    c.fillStyle = g; c.fillRect(x0 - 4, y0 - 4, x1 - x0 + 8, y1 - y0 + 8); c.restore();
  };
  MG.ball = function (c, x, y, r, fill, lw) {
    c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = fill; c.fill(); if (r > 5) glossBall(c, x, y, r);
    c.beginPath(); c.arc(x, y, r, 0, 7); c.lineWidth = lw || Math.max(2, r / 5); c.strokeStyle = MG.INK; c.stroke();
  };
  MG.rect = function (c, x, y, w, h, fill, r, lw) {
    c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r || 0); else c.rect(x, y, w, h); c.fillStyle = fill; c.fill();
    if (w > 10 && h > 10) gloss(c, x, y, x + w * 0.4, y + h);
    c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r || 0); else c.rect(x, y, w, h); c.lineWidth = lw || 4; c.strokeStyle = MG.INK; c.lineJoin = 'round'; c.stroke();
  };
  MG.poly = function (c, pts, fill) {
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, path = function () { c.beginPath(); pts.forEach(function (p, i) { i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.closePath(); };
    pts.forEach(function (p) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    path(); c.fillStyle = fill; c.fill(); if (x1 - x0 > 10 && y1 - y0 > 10) { path(); gloss(c, x0, y0, x1, y1); }
    path(); c.lineWidth = 4; c.strokeStyle = MG.INK; c.lineJoin = 'round'; c.stroke();
  };
  /* a soft nebula and a few tinted clouds behind the stars */
  var neb = [['#5a2aa8', '#1e6ad0'], ['#a82a8c', '#2a5ad8'], ['#1a8ab0', '#6a2ac0'], ['#c05a2a', '#7a2a90']];
  MG.nebula = function (c, seed) {
    var rnd = GT.seeded(seed * 13 + 7), pal = neb[seed % neb.length], k;
    c.save(); for (k = 0; k < 3; k++) {
      var x = rnd() * 640, y = rnd() * 400, r = 150 + rnd() * 170, g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, pal[k % 2] + '66'); g.addColorStop(0.6, pal[k % 2] + '22'); g.addColorStop(1, pal[k % 2] + '00'); c.fillStyle = g; c.fillRect(0, 0, 640, 400);
    } c.restore();
  };
})();
