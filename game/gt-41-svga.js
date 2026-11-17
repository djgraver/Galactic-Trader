/* Galactic Trader 8. Part 41: the SVGA output stage. The late-90s look: no visible pixels. Every picture painted in the small indexed buffers is scaled up four times with an
   edge-following scaler (so diagonals and curves come out as clean lines, not stairs), softened a touch, and given a little film grain, the way pre-rendered art looked at 640 x 480
   in thousands of colours. Vector art (faces, goods, people) is rasterised at high resolution with a soft key light and is no longer reduced to a small palette. */
PX.UP = 4;
PX.sim = function (a, b) {
  if (a === b) return true;
  var da = (a >>> 24) - (b >>> 24); if (da) return false;
  var d = Math.abs((a & 255) - (b & 255)) + Math.abs(((a >> 8) & 255) - ((b >> 8) & 255)) + Math.abs(((a >> 16) & 255) - ((b >> 16) & 255));
  return d < 40;
};
/* Scale2x (EPX) with a colour tolerance, on packed 32-bit pixels */
PX.scale2x = function (src, w, h) {
  var out = new Uint32Array(w * h * 4), W2 = w * 2, x, y, S = PX.sim;
  for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
    var i = y * w + x, P = src[i], A = y > 0 ? src[i - w] : P, D = y < h - 1 ? src[i + w] : P, C = x > 0 ? src[i - 1] : P, B = x < w - 1 ? src[i + 1] : P, o = (y * 2) * W2 + x * 2;
    var ca = S(C, A), ab = S(A, B), bd = S(B, D), dc = S(D, C);
    out[o] = ca && !dc && !ab ? A : P; out[o + 1] = ab && !ca && !bd ? B : P; out[o + W2] = dc && !bd && !ca ? C : P; out[o + W2 + 1] = bd && !ab && !dc ? D : P;
  }
  return out;
};
PX.hasFilter = (function () { try { var c = document.createElement('canvas').getContext('2d'); return 'filter' in c; } catch (e) { return false; } })();
PX.render = function (buf, night, scale) {
  var w = buf.w, h = buf.h, flat = PX.flat(buf, night), px = new Uint32Array(flat.buffer), up = PX.scale2x(px, w, h), W = w * 2, H = h * 2;
  if (PX.UP >= 4) { up = PX.scale2x(up, W, H); W *= 2; H *= 2; }
  var d8 = new Uint8ClampedArray(up.buffer), i, n = W * H;
  if (w >= 200 && h >= 80) {       /* film grain on full scenes: a cheap hash, the same every time */
    for (i = 0; i < n; i++) { if (!d8[i * 4 + 3]) continue; var g = (((i * 2654435761) >>> 24) & 15) - 7.5; g *= 0.8; d8[i * 4] += g; d8[i * 4 + 1] += g; d8[i * 4 + 2] += g; }
  }
  var raw = document.createElement('canvas'); raw.width = W; raw.height = H; raw.getContext('2d').putImageData(new ImageData(d8, W, H), 0, 0);
  var cv = document.createElement('canvas'); cv.width = W; cv.height = H; var cx = cv.getContext('2d');
  if (PX.hasFilter) { cx.filter = 'blur(' + (PX.UP >= 4 ? 0.9 : 0.5) + 'px)'; cx.drawImage(raw, 0, 0); cx.filter = 'none'; cx.globalAlpha = 0.35; cx.drawImage(raw, 0, 0); cx.globalAlpha = 1; }
  else cx.drawImage(raw, 0, 0);
  return cv;
};
UI.drawPlanet = function (cv, p) { var pp = PX.planetPic(p, 160, 90), c = PX.render(pp.buf, false, 1); cv.width = c.width; cv.height = c.height; cv.getContext('2d').drawImage(c, 0, 0); cv.style.imageRendering = 'auto'; };

/* vector art: three times the old raster size, smooth, with the airbrushed light but no palette reduction */
PX.SVK = 3;
PX.quant = function (cx, w, h, spread) {
  if (spread === 46) { var im = cx.getImageData(0, 0, w, h); PX.emboss(im.data, w, h, 4.2); cx.putImageData(im, 0, 0); }
  cx.save(); cx.globalCompositeOperation = 'source-atop';
  var lg = cx.createLinearGradient(0, 0, w, h); lg.addColorStop(0, 'rgba(255,246,220,.22)'); lg.addColorStop(.45, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(10,10,60,.36)');
  cx.fillStyle = lg; cx.fillRect(0, 0, w, h); cx.restore();
};
PX.queue = function (key) {
  var a = PX.sv[key], svg = a[0], w = a[1] * PX.SVK, h = a[2] * PX.SVK, im = new Image();
  svg = PX.cleanSVG(svg); if (svg.indexOf('xmlns=') < 0) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  svg = svg.replace(/<svg([^>]*?)>/, function (m, at) { at = at.replace(/\s(width|height)="[^"]*"/g, ''); return '<svg' + at + ' width="' + w * 2 + '" height="' + h * 2 + '">'; });
  im.onload = function () {
    try { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; var cx = cv.getContext('2d'); cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high'; cx.drawImage(im, 0, 0, w, h); PX.quant(cx, w, h, a[3]); PX.cache['s' + key] = cv.toDataURL(); delete PX.sv[key]; }
    catch (e) { PX.cache['s' + key] = PX.BLANK; }
    PX.apply(key);
  };
  im.onerror = function () { PX.cache['s' + key] = PX.BLANK; };
  im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
};
