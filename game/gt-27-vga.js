/* Galactic Trader 6. Part 27: the VGA painter. Loaded right after the pixel engine and replaces its EGA output stage.
   The drawing code still paints with sixteen colour roles, but each role is now a hand-picked VGA ramp colour, the checkerboard dithers the scene painters lay down are
   melted into smooth shading when a buffer goes on screen, and vector art (portraits, ships, icons) is kept in 256 colours with a soft airbrushed light instead of being
   snapped to sixteen. Inspired by Solar Winds (airbrushed hulls, lit portraits), Descent (gritty lit metal) and Homeworld (bold livery against smooth space). */

/* the sixteen roles, now painted: deep space black, navy, forest, teal, brick, plum, rust, steel, gunmetal, sky blue, leaf, aqua, coral, orchid, gold, pearl */
PX.PAL = ['#05060e', '#1c2c94', '#23813f', '#2196ac', '#b22c30', '#8c3c90', '#92602c', '#bcc0cc', '#5c6478', '#5f82f4', '#66d070', '#74e6f2', '#f56e5e', '#e684dc', '#f8dc60', '#f6f8ff'];
PX.RGB = PX.PAL.map(function (h) { var n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; });
/* after dark most roles sink into the navy ramp; glowing things keep their colour */
PX.NIGHT = [0, 0, 1, 1, 0, 1, 0, 8, 0, 1, 2, 3, 4, 5, 6, 7];

/* ---------- screen output: palette, de-dither, soft light ---------- */
PX.smooth = true;
PX.shade = function (rgb, w, h) { return rgb; };
/* turn an indexed buffer into a flat RGBA array (w*h*4). The scene painters lay down ordered dither on a 4x4 grid; any 4x4 block whose two colours split cleanly along that
   grid is a dither block, and its pixels become a smooth bilinear blend of the neighbouring dither blocks instead. Hard edges, lines and text never split cleanly, so they stay crisp. */
PX.RANK = []; (function () { for (var k = 0; k < 16; k++) PX.RANK[k] = PX.BAYER[k]; })();
PX.flat = function (buf, night) {
  var w = buf.w, h = buf.h, n = w * h, ci = new Uint8Array(n), out = new Uint8ClampedArray(n * 4), i, c, x, y;
  for (i = 0; i < n; i++) { c = buf.d[i]; if (c === 255) { ci[i] = 255; continue; } if (c >= 16) c -= 16; else if (night) c = PX.NIGHT[c]; ci[i] = c; }
  var bw = Math.ceil(w / 4), bh = Math.ceil(h / 4), fl = new Uint8Array(bw * bh), bX = new Uint8Array(bw * bh), bY = new Uint8Array(bw * bh), mr = new Float32Array(bw * bh * 3);
  if (PX.smooth) for (var by = 0; by < bh; by++) for (var bx = 0; bx < bw; bx++) {
    var rk = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []], kinds = [], j, k, bi = by * bw + bx, tot = 0;
    for (j = 0; j < 4; j++) for (k = 0; k < 4; k++) {
      x = bx * 4 + k; y = by * 4 + j; if (x >= w || y >= h) continue; c = ci[y * w + x]; if (c === 255) continue;
      if (!rk[c].length) kinds.push(c); rk[c].push(PX.BAYER[j * 4 + k]); tot++;
    }
    if (kinds.length < 2 || kinds.length > 6 || tot < 12) continue;
    var best = 0, bX0 = 0, bY0 = 0, ia, ib, t, q2;
    for (ia = 0; ia < kinds.length; ia++) for (ib = 0; ib < kinds.length; ib++) {
      if (ia === ib) continue; var XX = kinds[ia], YY = kinds[ib], cx0 = rk[XX].length, cy0 = rk[YY].length; if (cx0 < 2 || cy0 < 2) continue;
      var bv = 99; for (t = 1; t < 16; t++) { var vv = 0; for (q2 = 0; q2 < cx0; q2++) if (rk[XX][q2] >= t) vv++; for (q2 = 0; q2 < cy0; q2++) if (rk[YY][q2] < t) vv++; if (vv < bv) bv = vv; }
      if (bv === 0 && cx0 + cy0 > best && cx0 + cy0 >= (kinds.length === 2 ? 6 : 9)) { best = cx0 + cy0; bX0 = XX; bY0 = YY; }
    }
    if (!best) continue;
    fl[bi] = 1; bX[bi] = bX0; bY[bi] = bY0;
    for (var ch = 0; ch < 3; ch++) mr[bi * 3 + ch] = (rk[bX0].length * PX.RGB[bX0][ch] + rk[bY0].length * PX.RGB[bY0][ch]) / (rk[bX0].length + rk[bY0].length);
  }
  for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
    i = y * w + x; c = ci[i]; var o = i * 4;
    if (c === 255) { out[o + 3] = 0; continue; }
    var rr = PX.RGB[c][0], gg = PX.RGB[c][1], bb = PX.RGB[c][2], own = (y >> 2) * bw + (x >> 2);
    if (fl[own] && (c === bX[own] || c === bY[own])) {
      var fx = (x - 1.5) / 4, fy = (y - 1.5) / 4, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0, sr = 0, sg = 0, sb = 0, sw = 0, q;
      for (q = 0; q < 4; q++) {
        var cx2 = x0 + (q & 1), cy2 = y0 + (q >> 1); if (cx2 < 0 || cy2 < 0 || cx2 >= bw || cy2 >= bh) continue;
        var nb = cy2 * bw + cx2; if (!fl[nb]) continue;
        var dr = mr[nb * 3] - mr[own * 3], dg = mr[nb * 3 + 1] - mr[own * 3 + 1], db = mr[nb * 3 + 2] - mr[own * 3 + 2];
        if (nb !== own && dr * dr + dg * dg + db * db > 9000) continue;
        var wt = ((q & 1) ? tx : 1 - tx) * ((q >> 1) ? ty : 1 - ty);
        sr += mr[nb * 3] * wt; sg += mr[nb * 3 + 1] * wt; sb += mr[nb * 3 + 2] * wt; sw += wt;
      }
      if (sw > 0) { rr = sr / sw; gg = sg / sw; bb = sb / sw; } else { rr = mr[own * 3]; gg = mr[own * 3 + 1]; bb = mr[own * 3 + 2]; }
    }
    out[o] = rr; out[o + 1] = gg; out[o + 2] = bb; out[o + 3] = 255;
  }
  if (PX.smooth) out = PX.bilateral(out, w, h);
  return out;
};
/* an edge-keeping blur: neighbours that are close in colour are averaged together (so leftover stipple melts into paint), neighbours that are far away (outlines, text, sprites) are ignored */
PX.bilateral = function (src, w, h) {
  var out = new Uint8ClampedArray(src.length), R = 2, sg = 1.5, rs = PX.RS || 120, ws = [], j, k, x, y;
  for (j = -R; j <= R; j++) for (k = -R; k <= R; k++) ws.push(Math.exp(-(j * j + k * k) / (2 * sg * sg)));
  var inv = 1 / (2 * rs * rs);
  for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
    var o = (y * w + x) * 4; if (src[o + 3] === 0) { continue; }
    var r0 = src[o], g0 = src[o + 1], b0 = src[o + 2], sr = 0, sgc = 0, sb = 0, sw = 0, q = 0;
    for (j = -R; j <= R; j++) for (k = -R; k <= R; k++, q++) {
      var yy = y + j, xx = x + k; if (yy < 0 || xx < 0 || yy >= h || xx >= w) continue; var p = (yy * w + xx) * 4; if (src[p + 3] === 0) continue;
      var dr = src[p] - r0, dg = src[p + 1] - g0, db = src[p + 2] - b0, wt = ws[q] * Math.exp(-(dr * dr + dg * dg + db * db) * inv);
      sr += src[p] * wt; sgc += src[p + 1] * wt; sb += src[p + 2] * wt; sw += wt;
    }
    out[o] = sr / sw; out[o + 1] = sgc / sw; out[o + 2] = sb / sw; out[o + 3] = 255;
  }
  return out;
};
PX.render = function (buf, night, scale) {
  scale = scale || 1; var w = buf.w, h = buf.h, cv = document.createElement('canvas'); cv.width = w * scale; cv.height = h * scale;
  var cx = cv.getContext('2d'), flat = PX.flat(buf, night);
  if (scale === 1) { cx.putImageData(new ImageData(flat, w, h), 0, 0); return cv; }
  var small = document.createElement('canvas'); small.width = w; small.height = h; small.getContext('2d').putImageData(new ImageData(flat, w, h), 0, 0);
  cx.imageSmoothingEnabled = false; cx.drawImage(small, 0, 0, w * scale, h * scale); return cv;
};

/* ---------- vector art in 256 colours with an airbrushed light ---------- */
PX.quant = function (cx, w, h, spread) {
  /* soft key light from the top left and a cool shade at the bottom right, only where there is paint */
  cx.save(); cx.globalCompositeOperation = 'source-atop';
  var lg = cx.createLinearGradient(0, 0, w, h); lg.addColorStop(0, 'rgba(255,246,220,.26)'); lg.addColorStop(.45, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(10,10,60,.34)');
  cx.fillStyle = lg; cx.fillRect(0, 0, w, h); cx.restore();
  var im = cx.getImageData(0, 0, w, h), d = im.data, x, y, i, t, ch, v, L = [8, 9, 8];
  for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
    i = (y * w + x) * 4; if (d[i + 3] < 110) { d[i + 3] = 0; continue; }
    t = (PX.BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.47) * 8;
    for (ch = 0; ch < 3; ch++) { var s = 255 / (L[ch] - 1); v = Math.round(Math.max(0, Math.min(255, d[i + ch] + t)) / s) * s; d[i + ch] = v; }
    d[i + 3] = 255;
  }
  cx.putImageData(im, 0, 0);
};

/* ---------- airbrushed volume: soft light from the top left across a blurred copy of the shape, so flat vector faces and hulls read as rounded, lit forms ---------- */
PX.boxblur = function (a, w, h, r) {
  var t = new Float32Array(a.length), o = new Float32Array(a.length), x, y, k, s, n;
  for (y = 0; y < h; y++) { s = 0; n = 0; for (x = -r; x <= r; x++) { if (x >= 0 && x < w) { s += a[y * w + x]; n++; } } for (x = 0; x < w; x++) { t[y * w + x] = s / n; var ax = x - r, bx = x + r + 1; if (ax >= 0) { s -= a[y * w + ax]; n--; } if (bx < w) { s += a[y * w + bx]; n++; } } }
  for (x = 0; x < w; x++) { s = 0; n = 0; for (y = -r; y <= r; y++) { if (y >= 0 && y < h) { s += t[y * w + x]; n++; } } for (y = 0; y < h; y++) { o[y * w + x] = s / n; var ay = y - r, by = y + r + 1; if (ay >= 0) { s -= t[ay * w + x]; n--; } if (by < h) { s += t[by * w + x]; n++; } } }
  return o;
};
PX.emboss = function (d, w, h, str) {
  var n = w * h, ht = new Float32Array(n), i, x, y;
  for (i = 0; i < n; i++) { var a = d[i * 4 + 3] / 255, l = (d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) / 255; ht[i] = a * (0.5 + 0.5 * l); }
  var r = Math.max(2, Math.round(Math.min(w, h) / 12)); ht = PX.boxblur(PX.boxblur(ht, w, h, r), w, h, r);
  for (y = 1; y < h - 1; y++) for (x = 1; x < w - 1; x++) {
    i = y * w + x; if (d[i * 4 + 3] < 110) continue;
    var gx = ht[i + 1] - ht[i - 1], gy = ht[i + w] - ht[i - w], s = (-(gx * 0.7 + gy * 0.7)) * str * 255 / (r * 0.8);
    s = Math.max(-60, Math.min(70, s)); for (var c = 0; c < 3; c++) d[i * 4 + c] = Math.max(0, Math.min(255, d[i * 4 + c] + s * (s > 0 ? (1 - d[i * 4 + c] / 300) : 1)));
  }
};
PX.quantBase = PX.quant;
PX.quant = function (cx, w, h, spread) {
  if (spread === 46) { var im = cx.getImageData(0, 0, w, h); PX.emboss(im.data, w, h, 5.5); cx.putImageData(im, 0, 0); }
  PX.quantBase(cx, w, h, spread);
};
