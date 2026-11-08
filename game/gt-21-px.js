/* Galactic Trader Deluxe. Part 21: the pixel engine. Everything on screen is built from the 16 EGA colours, drawn into small indexed buffers and scaled up with hard pixels.
   Indices 0-15 are the EGA palette. Add PX.E (16) to a colour to make it glow at night. 255 is transparent. */
var PX = { E: 16, T: 255 };
PX.PAL = ['#000000', '#0000aa', '#00aa00', '#00aaaa', '#aa0000', '#aa00aa', '#aa5500', '#aaaaaa', '#555555', '#5555ff', '#55ff55', '#55ffff', '#ff5555', '#ff55ff', '#ffff55', '#ffffff'];
PX.RGB = PX.PAL.map(function (h) { var n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; });
/* named colours: K black, B blue, G green, C cyan, R red, M magenta, N brown, L light grey, D dark grey, then the bright ones */
PX.K = 0; PX.B = 1; PX.G = 2; PX.C = 3; PX.R = 4; PX.M = 5; PX.N = 6; PX.L = 7; PX.D = 8; PX.LB = 9; PX.LG = 10; PX.LC = 11; PX.LR = 12; PX.LM = 13; PX.Y = 14; PX.W = 15;
/* what each colour turns into after dark (anything drawn with PX.E added keeps its colour) */
PX.NIGHT = [0, 0, 1, 1, 0, 1, 0, 8, 0, 1, 2, 3, 4, 5, 6, 7];
PX.BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
/* a dither fill: level 0..16 mixes colour a into colour b */
PX.dith = function (a, b, l) { return function (x, y) { return l > PX.BAYER[(y & 3) * 4 + (x & 3)] ? b : a; }; };
PX.checker = function (a, b) { return function (x, y) { return (x + y) & 1 ? b : a; }; };

PX.Buf = function (w, h, fill) { this.w = w; this.h = h; this.d = new Uint8Array(w * h); this.d.fill(fill === undefined ? 0 : fill); };
(function (P) {
  P.px = function (x, y, c) { x = x | 0; y = y | 0; if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; if (typeof c === 'function') c = c(x, y); if (c < 0 || c === 255) return; this.d[y * this.w + x] = c; };
  P.get = function (x, y) { return x < 0 || y < 0 || x >= this.w || y >= this.h ? 0 : this.d[y * this.w + x]; };
  P.rect = function (x, y, w, h, c) { x = Math.round(x); y = Math.round(y); for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.px(x + i, y + j, c); };
  P.line = function (x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    var dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy, n = 0;
    for (;;) { this.px(x0, y0, c); if ((x0 === x1 && y0 === y1) || n++ > 2000) break; var e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  };
  /* scanline polygon fill, even-odd. pts = [x0,y0,x1,y1,...] */
  P.poly = function (pts, c) {
    var n = pts.length / 2, miny = 1e9, maxy = -1e9, i, y;
    for (i = 0; i < n; i++) { miny = Math.min(miny, pts[i * 2 + 1]); maxy = Math.max(maxy, pts[i * 2 + 1]); }
    for (y = Math.max(0, Math.floor(miny)); y <= Math.min(this.h - 1, Math.ceil(maxy)); y++) {
      var xs = [], yc = y + 0.5;
      for (i = 0; i < n; i++) { var j = (i + 1) % n, ax = pts[i * 2], ay = pts[i * 2 + 1], bx = pts[j * 2], by = pts[j * 2 + 1]; if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + (yc - ay) / (by - ay) * (bx - ax)); }
      xs.sort(function (a, b) { return a - b; });
      for (i = 0; i + 1 < xs.length; i += 2) for (var x = Math.round(xs[i]); x < Math.round(xs[i + 1]); x++) this.px(x, y, c);
    }
  };
  P.ell = function (cx, cy, rx, ry, c) {
    for (var y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) { var t = (y + 0.5 - cy) / ry; if (t < -1 || t > 1) continue; var hw = rx * Math.sqrt(1 - t * t); for (var x = Math.round(cx - hw); x < Math.round(cx + hw); x++) this.px(x, y, c); }
  };
  P.ring = function (cx, cy, rx, ry, c) { var n = Math.max(12, Math.round((rx + ry) * 1.6)), pts = [], i; for (i = 0; i <= n; i++) pts.push(cx + Math.cos(i / n * 6.2832) * rx, cy + Math.sin(i / n * 6.2832) * ry); for (i = 0; i < n; i++) this.line(pts[i * 2], pts[i * 2 + 1], pts[i * 2 + 2], pts[i * 2 + 3], c); };
  P.outline = function (pts, c) { var n = pts.length / 2; for (var i = 0; i < n; i++) { var j = (i + 1) % n; this.line(pts[i * 2], pts[i * 2 + 1], pts[j * 2], pts[j * 2 + 1], c); } };
  /* vertical sky: bands of colours blended by dither. cols = [c0, c1, c2...] from top to bottom */
  P.vgrad = function (x, y, w, h, cols) {
    var seg = cols.length - 1;
    for (var j = 0; j < h; j++) { var t = j / Math.max(1, h - 1) * seg, k = Math.min(seg - 1, Math.floor(t)), l = (t - k) * 16; for (var i = 0; i < w; i++) this.px(x + i, y + j, PX.BAYER[((y + j) & 3) * 4 + ((x + i) & 3)] < l ? cols[k + 1] : cols[k]); }
  };
  P.blit = function (src, x, y) { for (var j = 0; j < src.h; j++) for (var i = 0; i < src.w; i++) { var c = src.d[j * src.w + i]; if (c !== 255) this.px(x + i, y + j, c); } };
  P.text = function (x, y, s, c, sc) { sc = sc || 1; s = String(s).toUpperCase(); var cx = x; for (var k = 0; k < s.length; k++) { var g = PX.FONT[s[k]] || PX.FONT['?']; for (var col = 0; col < 5; col++) for (var row = 0; row < 7; row++) if ((g[col] >> row) & 1) this.rect(cx + col * sc, y + row * sc, sc, sc, c); cx += 6 * sc; } return cx - x; };
  for (var k in P) PX.Buf.prototype[k] = P[k];
})({});
PX.textW = function (s, sc) { return String(s).length * 6 * (sc || 1) - (sc || 1); };
/* classic 5x7 font, five columns per glyph, least significant bit at the top */
PX.FONT = (function () {
  var raw = ' 0000000000|!00005f0000|"0007000700|#147f147f14|$242a7f2a12|%2313086462|&3649552250|\'0005030000|(001c224100|)0041221c00|*14083e0814|+08083e0808|,0050300000|-0808080808|.0060600000|/2010080402|03e5149453e|10042 7f4000|242615149 46|32141454b31|4181412 7f10|52745454539|63c4a494930|7017109 0503|83649494936|90649 49291e|:0036360000|;0056360000|<0814224100|=1414141414|>0041221408|?0201510906|@3249794 13e|A7e1111117e|B7f49494936|C3e41414122|D7f4141221c|E7f49494941|F7f09090901|G3e41494 97a|H7f0808087f|I00417f4100|J2040413f01|K7f08142241|L7f40404040|M7f020c027f|N7f0408107f|O3e4141413e|P7f09090906|Q3e4151215e|R7f09192946|S4649494931|T01017f0101|U3f4040403f|V1f2040201f|W3f4038403f|X6314081463|Y0708700807|Z6151494543|[007f414100|\\0204081020|]00417f0000|^0402010204|_4040404040'.replace(/ /g, '').split('|');
  var f = {};
  raw.forEach(function (r) { var ch = r[0], hex = r.slice(1); f[ch] = [0, 1, 2, 3, 4].map(function (i) { return parseInt(hex.substr(i * 2, 2), 16); }); });
  f['0'] = [0x3e, 0x51, 0x49, 0x45, 0x3e]; f['1'] = [0x00, 0x42, 0x7f, 0x40, 0x00]; f['2'] = [0x42, 0x61, 0x51, 0x49, 0x46]; f['3'] = [0x21, 0x41, 0x45, 0x4b, 0x31]; f['4'] = [0x18, 0x14, 0x12, 0x7f, 0x10];
  f['5'] = [0x27, 0x45, 0x45, 0x45, 0x39]; f['6'] = [0x3c, 0x4a, 0x49, 0x49, 0x30]; f['7'] = [0x01, 0x71, 0x09, 0x05, 0x03]; f['8'] = [0x36, 0x49, 0x49, 0x49, 0x36]; f['9'] = [0x06, 0x49, 0x49, 0x29, 0x1e];
  f['G'] = [0x3e, 0x41, 0x49, 0x49, 0x7a]; f['J'] = [0x20, 0x40, 0x41, 0x3f, 0x01]; f['Q'] = [0x3e, 0x41, 0x51, 0x21, 0x5e]; f['@'] = [0x32, 0x49, 0x79, 0x41, 0x3e]; f['$'] = [0x24, 0x2a, 0x7f, 0x2a, 0x12];
  f[' '] = [0, 0, 0, 0, 0]; return f;
})();

/* ---------- putting a buffer on screen ---------- */
PX.render = function (buf, night, scale) {
  scale = scale || 1; var cv = document.createElement('canvas'); cv.width = buf.w * scale; cv.height = buf.h * scale;
  var cx = cv.getContext('2d'), im = cx.createImageData(cv.width, cv.height), o = im.data, x, y, c, i, sx, sy;
  for (y = 0; y < cv.height; y++) for (x = 0; x < cv.width; x++) {
    c = buf.d[((y / scale) | 0) * buf.w + ((x / scale) | 0)]; i = (y * cv.width + x) * 4;
    if (c === 255) { o[i + 3] = 0; continue; }
    if (c >= 16) c -= 16; else if (night) c = PX.NIGHT[c];
    var rgb = PX.RGB[c]; o[i] = rgb[0]; o[i + 1] = rgb[1]; o[i + 2] = rgb[2]; o[i + 3] = 255;
  }
  cx.putImageData(im, 0, 0); return cv;
};
PX.cache = {};
PX.url = function (key, buf, night) { var k = key + (night ? '/n' : '/d'); return PX.cache[k] || (PX.cache[k] = PX.render(buf, night).toDataURL()); };
PX.img = function (url, w, h, cls, scale, extra) { return '<img class="pxi ' + (cls || '') + '" src="' + url + '" width="' + w + '" height="' + h + '" style="width:' + (w * (scale || 1)) + 'px;height:' + (h * (scale || 1)) + 'px"' + (extra || '') + ' alt="">'; };

/* ---------- turning existing vector art (portraits, ships, icons) into EGA pixel art ---------- */
PX.BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
PX.pend = {}; PX.sv = {};
PX.hash = function (s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
/* quantise an RGBA canvas onto the EGA palette. spread is the strength of the ordered dither. */
PX.quant = function (cx, w, h, spread) {
  var im = cx.getImageData(0, 0, w, h), d = im.data, x, y, i, k, best, bd, t, r, g, b;
  for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
    i = (y * w + x) * 4; if (d[i + 3] < 110) { d[i + 3] = 0; continue; }
    t = (PX.BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.47) * spread; r = d[i] + t; g = d[i + 1] + t; b = d[i + 2] + t; best = 0; bd = 1e9;
    for (k = 0; k < 16; k++) { var q = PX.RGB[k], dr = r - q[0], dg = g - q[1], db = b - q[2], dd = dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11; if (dd < bd) { bd = dd; best = k; } }
    d[i] = PX.RGB[best][0]; d[i + 1] = PX.RGB[best][1]; d[i + 2] = PX.RGB[best][2]; d[i + 3] = 255;
  }
  cx.putImageData(im, 0, 0);
};
/* returns an <img> (or any tag via tag='image') that fills in with an EGA version of the svg a moment later. */
PX.svg = function (svg, w, h, cls, scale, spread) {
  var key = PX.hash(svg) + 'x' + w + 'x' + h, url = PX.cache['s' + key], tag = '<img class="pxi ' + (cls || '') + '" data-pk="' + key + '" src="' + (url || PX.BLANK) + '" width="' + w + '" height="' + h + '" style="width:' + (w * (scale || 1)) + 'px;height:' + (h * (scale || 1)) + 'px" alt="">';
  if (!url && !PX.pend[key]) {
    PX.pend[key] = 1; PX.sv[key] = [svg, w, h, spread === undefined ? 40 : spread];
    PX.queue(key);
  }
  return tag;
};
/* SVG pictures are parsed as strict XML when drawn as images, so drop repeated attributes (the first one wins, as in HTML) and stray ampersands. */
PX.cleanSVG = function (svg) {
  svg = svg.replace(/<[a-zA-Z][^<>]*>/g, function (tag) {
    var seen = {}; return tag.replace(/(\s)([a-zA-Z_:][\w:.-]*)\s*=\s*("[^"]*"|'[^']*')/g, function (m, sp, name, val) { if (seen[name]) return ''; seen[name] = 1; return m; });
  });
  return svg.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
};
PX.queue = function (key) {
  var a = PX.sv[key], svg = a[0], w = a[1], h = a[2], im = new Image();
  svg = PX.cleanSVG(svg); if (svg.indexOf('xmlns=') < 0) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  svg = svg.replace(/<svg([^>]*?)>/, function (m, at) { at = at.replace(/\s(width|height)="[^"]*"/g, ''); return '<svg' + at + ' width="' + w * 6 + '" height="' + h * 6 + '">'; });
  im.onload = function () {
    try { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; var cx = cv.getContext('2d'); cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high'; cx.drawImage(im, 0, 0, w, h); PX.quant(cx, w, h, a[3]); PX.cache['s' + key] = cv.toDataURL(); delete PX.sv[key]; }
    catch (e) { PX.cache['s' + key] = PX.BLANK; }
    PX.apply(key);
  };
  im.onerror = function () { PX.cache['s' + key] = PX.BLANK; };
  im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
};
PX.apply = function (key) { var u = PX.cache['s' + key]; Array.prototype.forEach.call(document.querySelectorAll('[data-pk="' + key + '"]'), function (e) { if (e.tagName === 'image') e.setAttribute('href', u); else e.src = u; }); };
