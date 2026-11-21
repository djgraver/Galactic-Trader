/* Galactic Trader 10. Part 49: faces in three-quarter view.
   Most people now sit for their portrait with the head turned a little to one side, as people do in real photographs, instead of staring straight down the lens.
   The face is drawn as before and then bent round a ball: the rules come from how real heads look turned (and from drawing guides):
     - the features slide toward the way the head is turned, and the nose (which sticks out furthest) slides most, so it sits at about the three-quarter mark
       and its bridge starts to overlap the far eye;
     - the far half of the face is squeezed narrower and the near half is wider, so the near eye looks bigger;
     - only the near ear shows, set back about halfway across the side of the head, and the far ear is hidden;
     - the far cheek and jaw swing in, the chin follows the nose, and the back of the skull shows on the near side;
     - the eyes look the way the head is turned.
   Every portrait gets its own turn from its name: left or right, between about 15 and 32 degrees, and about one in seven still faces the front. */
(function () {
  var Rr = 52;                     /* the ball the face is bent round */
  function zOf(x, y) { var q = Rr * Rr - x * x - 0.62 * y * y; return q > 0 ? Math.sqrt(q) : 0; }
  CH.yawOf = function (t) {
    if (t.yaw !== undefined) return t.yaw;
    var h = CH.hash((t.name || 'x') + '|yaw|' + (t.salt || 0));
    if (h % 7 === 0) return 0;
    var deg = 15 + (h >>> 3) % 18, d = (h >>> 9) % 2 ? 1 : -1;
    return d * deg * Math.PI / 180;
  };
  /* ---------- a tiny SVG rewriter: every coordinate goes through f(x, y) ---------- */
  var num = /-?\d*\.?\d+(?:e-?\d+)?/g;
  function fx(v) { return (Math.round(v * 10) / 10).toString(); }
  function sxAt(f, x, y) { return Math.max(0.45, Math.min(1.6, f(x + 0.5, y) - f(x - 0.5, y))); }
  function warpPath(d, f) {
    var out = '', cx = 0, cy = 0, sx0 = 0, sy0 = 0, toks = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) || [], i = 0, cmd = '';
    function n() { return parseFloat(toks[i++]); }
    function P(x, y) { return fx(f(x, y)) + ',' + fx(y); }
    while (i < toks.length) {
      if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++];
      var rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase(), x, y, x1, y1, x2, y2;
      if (C === 'Z') { out += 'Z'; cx = sx0; cy = sy0; continue; }
      if (C === 'M' || C === 'L' || C === 'T') { x = n(); y = n(); if (rel) { x += cx; y += cy; } out += (C === 'M' ? 'M' : C === 'T' ? 'T' : 'L') + P(x, y) + ' '; cx = x; cy = y; if (C === 'M') { sx0 = x; sy0 = y; cmd = rel ? 'l' : 'L'; } continue; }
      if (C === 'H') { x = n(); if (rel) x += cx; out += 'L' + P(x, cy) + ' '; cx = x; continue; }
      if (C === 'V') { y = n(); if (rel) y += cy; out += 'L' + P(cx, y) + ' '; cy = y; continue; }
      if (C === 'Q' || C === 'S') { x1 = n(); y1 = n(); x = n(); y = n(); if (rel) { x1 += cx; y1 += cy; x += cx; y += cy; } out += C + P(x1, y1) + ' ' + P(x, y) + ' '; cx = x; cy = y; continue; }
      if (C === 'C') { x1 = n(); y1 = n(); x2 = n(); y2 = n(); x = n(); y = n(); if (rel) { x1 += cx; y1 += cy; x2 += cx; y2 += cy; x += cx; y += cy; } out += 'C' + P(x1, y1) + ' ' + P(x2, y2) + ' ' + P(x, y) + ' '; cx = x; cy = y; continue; }
      if (C === 'A') { var rx = n(), ry = n(), rot = n(), la = n(), sw = n(); x = n(); y = n(); if (rel) { x += cx; y += cy; } out += 'A' + fx(rx * sxAt(f, cx, cy)) + ',' + fx(ry) + ' ' + rot + ' ' + la + ' ' + sw + ' ' + P(x, y) + ' '; cx = x; cy = y; continue; }
      i++;   /* anything unexpected: skip a token rather than loop forever */
    }
    return out.trim();
  }
  function attr(tag, name) { var m = tag.match(new RegExp('\\s' + name + '="([^"]*)"')); return m ? m[1] : null; }
  function setAttr(tag, name, v) { var re = new RegExp('(\\s' + name + '=")([^"]*)(")'); return re.test(tag) ? tag.replace(re, '$1' + v + '$3') : tag.replace(/^<(\w+)/, '<$1 ' + name + '="' + v + '"'); }
  function warpTag(tag, f) {
    var name = (tag.match(/^<(\w+)/) || [])[1], x, y, s, tr = attr(tag, 'transform');
    if (tr && /rotate\(/.test(tr)) { tag = setAttr(tag, 'transform', tr.replace(/rotate\(([^ )]+)[ ,]+([^ )]+)[ ,]+([^ )]+)\)/, function (m, a, rx, ry) { return 'rotate(' + a + ' ' + fx(f(+rx, +ry)) + ' ' + ry + ')'; })); }
    if (name === 'path') { var d = attr(tag, 'd'); if (d) tag = setAttr(tag, 'd', warpPath(d, f)); }
    else if (name === 'circle') { x = +attr(tag, 'cx') || 0; y = +attr(tag, 'cy') || 0; var r = +attr(tag, 'r') || 0; s = sxAt(f, x, y); tag = tag.replace(/^<circle/, '<ellipse').replace(/\scx="[^"]*"/, ' cx="' + fx(f(x, y)) + '"').replace(/\sr="[^"]*"/, ' rx="' + fx(r * s) + '" ry="' + fx(r) + '"'); }
    else if (name === 'ellipse') { x = +attr(tag, 'cx') || 0; y = +attr(tag, 'cy') || 0; s = sxAt(f, x, y); tag = setAttr(setAttr(tag, 'cx', fx(f(x, y))), 'rx', fx((+attr(tag, 'rx') || 0) * s)); }
    else if (name === 'rect') { var w = +attr(tag, 'width') || 0, hh = +attr(tag, 'height') || 0; x = (+attr(tag, 'x') || 0) + w / 2; y = (+attr(tag, 'y') || 0) + hh / 2; s = sxAt(f, x, y); var w2 = w * s; tag = setAttr(setAttr(tag, 'x', fx(f(x, y) - w2 / 2)), 'width', fx(w2)); }
    else if (name === 'line') { var x1 = +attr(tag, 'x1'), y1 = +attr(tag, 'y1'), x2 = +attr(tag, 'x2'), y2 = +attr(tag, 'y2'); tag = setAttr(setAttr(tag, 'x1', fx(f(x1, y1))), 'x2', fx(f(x2, y2))); }
    else if (name === 'polygon' || name === 'polyline') { var pts = (attr(tag, 'points') || '').match(num) || [], o = []; for (var k = 0; k + 1 < pts.length; k += 2) o.push(fx(f(+pts[k], +pts[k + 1])) + ',' + pts[k + 1]); tag = setAttr(tag, 'points', o.join(' ')); }
    return tag;
  }
  /* rewrite a run of SVG: groups with their own transform are moved as one piece, by the shift at their origin */
  CH.warpSVG = function (svg, f) {
    var depth = 0;
    return svg.replace(/<\/?\w+[^>]*>/g, function (tag) {
      if (/^<\/g/.test(tag)) { if (depth) depth--; return tag; }
      if (/^<g[\s>]/.test(tag)) {
        if (depth) { if (!/\/>$/.test(tag)) depth++; return tag; }
        var tr = attr(tag, 'transform');
        if (tr) { var m = tr.match(/translate\(\s*([-\d.]+)[ ,]+([-\d.]+)/), ox = m ? +m[1] : 0, oy = m ? +m[2] : 0; if (!/\/>$/.test(tag)) depth = 1; return setAttr(tag, 'transform', 'translate(' + fx(f(ox, oy) - ox) + ' 0) ' + tr); }
        return tag;
      }
      if (depth || /^<\//.test(tag) || /^<(defs|linearGradient|radialGradient|stop|filter|svg|image)/.test(tag)) return tag;
      return warpTag(tag, f);
    });
  };
  /* ---------- the head, turned ---------- */
  var baseHead = CH.head;
  CH.headTurned = function (t, extra) {
    var yaw = CH.yawOf(t); if (!yaw) return baseHead(t) + (extra || '');
    var d = yaw > 0 ? 1 : -1, s = Math.sin(Math.abs(yaw)), sp = CH.SPECIES[t.sp];
    /* look the way the head is turned */
    var t2 = Object.create(t); t2.pupil = [Math.max(-4, Math.min(4, t.pupil[0] + d * 3)), t.pupil[1]];
    var raw = baseHead(t2), parts = {}, keys = ['SH', 'FE', 'NO', 'MO', 'TP'], rest = raw;
    var first = raw.indexOf('<!--SH-->'); parts.back = first >= 0 ? raw.slice(0, first) : '';
    keys.forEach(function (k, i) {
      var a = raw.indexOf('<!--' + k + '-->'); if (a < 0) { parts[k] = ''; return; }
      var b = raw.length; for (var j = i + 1; j < keys.length; j++) { var bj = raw.indexOf('<!--' + keys[j] + '-->'); if (bj >= 0) { b = bj; break; } }
      parts[k] = raw.slice(a + k.length + 7, b);
    });
    if (first < 0) return raw + (extra || '');
    var face = function (x, y) { return x + d * s * zOf(x, y); };
    var nose = function (x, y) { var fall = Math.max(0, 1 - Math.abs(y - 10) / 26); return face(x, y) + d * s * 11 * fall; };
    var top = function (x, y) { return x + d * s * zOf(x, y) * 0.62; };
    var back = function (x, y) { return x + d * s * 5; };
    /* the near ear moves in and sits on top of the side of the head; the far ear goes */
    var ear = '', backS = parts.back.replace(/<circle data-ear="(-?1)"[^>]*\/>/g, function (tag, side) { if (+side === -d) ear = tag.replace(/\scx="[^"]*"/, ' cx="' + (-d * 33) + '"').replace(/\scy="[^"]*"/, ' cy="2"').replace(/\sr="[^"]*"/, ' r="9.5"'); return ''; });
    if (ear) ear = ear.replace(/<circle/, '<ellipse').replace(/\sr="([^"]*)"/, ' rx="7.5" ry="10.5"') + '<path d="M' + (-d * 34) + ',-3 Q' + (-d * 29) + ',2 ' + (-d * 33) + ',7" fill="none" stroke="' + CH.OUT + '" stroke-width="2.5" stroke-linecap="round"/>';
    /* the back of the skull shows on the near side, in skin under the hair */
    var skull = sp.alien || sp.id === 'bot' ? '' : '<ellipse cx="' + (-d * 9) + '" cy="-14" rx="46" ry="41" fill="' + t.skin + '" stroke="' + CH.OUT + '" stroke-width="4"/>';
    /* earrings: the far one is hidden behind the head, the near one hangs from the near ear */
    parts.MO = parts.MO.replace(/<circle cx="(-?46)" cy="14" r="6"([^>]*)\/>/g, function (tag, x, rest) { return +x === d * 46 ? '' : '<circle cx="' + (-d * 37) + '" cy="15" r="5"' + rest + '/>'; });
    var out = CH.warpSVG(backS, back) + skull + CH.warpSVG(parts.SH, face) + ear + CH.warpSVG(parts.FE, face) + CH.warpSVG(parts.NO, nose);
    /* the bridge of the nose runs out toward the far eye, so it overlaps it a little, as in a real three-quarter view */
    if (!sp.alien && sp.id !== 'bot' && t.nose !== 3) out += '<path d="M' + fx(face(d * 6, -16)) + ',-16 Q' + fx(face(d * 9, -2) + d * 4) + ',-2 ' + fx(nose(d * 4, 12)) + ',12" fill="none" stroke="' + CH.shade(t.skin, -0.32) + '" stroke-width="3.2" stroke-linecap="round"/>';
    out += CH.warpSVG(parts.MO, face) + CH.warpSVG(parts.TP, top) + (extra ? CH.warpSVG(extra, face) : '');
    return out;
  };
  /* portraits, the little face in the status strip and the quest pictures all turn; tiny street sprites keep looking at the camera */
  var basePortrait = CH.portrait, baseHeadPlus = CH.headPlus;
  CH.portrait = function (t, extra) {
    var keepHead = CH.head;
    CH.head = function (tt) { return CH.headTurned(tt); };
    var headPlus = CH.headPlus;
    CH.headPlus = function (tt) { var plain = baseHeadPlus(tt), core = baseHead(tt), add = plain.indexOf(core) === 0 ? plain.slice(core.length) : ''; return CH.headTurned(tt, add); };
    try { return basePortrait(t, extra); } finally { CH.head = keepHead; CH.headPlus = headPlus; }
  };
})();
