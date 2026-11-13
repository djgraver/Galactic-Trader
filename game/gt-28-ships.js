/* Galactic Trader 6. Part 28: painted ships. Airbrushed metal hulls (Solar Winds), bold liveries with decals and greebles (Homeworld / Chris Foss), and engine glow.
   Each ship is drawn facing right on a 240x140 sheet and rendered at twice the old pixel size so the panel lines survive. */
UI.shipSVG = function (id, hue) {
  var d = UI.shade(hue, -0.55), dd = UI.shade(hue, -0.75), m = UI.shade(hue, -0.25), l = UI.shade(hue, 0.45), ll = UI.shade(hue, 0.8), uid = 'g' + id.slice(0, 3);
  var defs = '<defs>' +
    '<linearGradient id="' + uid + 'h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + ll + '"/><stop offset=".22" stop-color="' + l + '"/><stop offset=".55" stop-color="' + hue + '"/><stop offset=".85" stop-color="' + d + '"/><stop offset="1" stop-color="' + dd + '"/></linearGradient>' +
    '<linearGradient id="' + uid + 'w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + m + '"/><stop offset="1" stop-color="' + dd + '"/></linearGradient>' +
    '<linearGradient id="' + uid + 'm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8d96ad"/><stop offset=".5" stop-color="#4b5266"/><stop offset="1" stop-color="#1c2030"/></linearGradient>' +
    '<linearGradient id="' + uid + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8fdff"/><stop offset=".35" stop-color="#5fc8f0"/><stop offset="1" stop-color="#0b2a6a"/></linearGradient>' +
    '<radialGradient id="' + uid + 'f" cx="1" cy=".5" r="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".25" stop-color="#ffe9a0"/><stop offset=".6" stop-color="#ff9b3a"/><stop offset="1" stop-color="#ff5a1a" stop-opacity="0"/></radialGradient>' +
    '</defs>';
  var H = 'url(#' + uid + 'h)', W = 'url(#' + uid + 'w)', M = 'url(#' + uid + 'm)', G = 'url(#' + uid + 'g)';
  var flame = function (x, y, len, r) { return '<ellipse cx="' + (x - len * 0.5) + '" cy="' + y + '" rx="' + len + '" ry="' + r + '" fill="url(#' + uid + 'f)"/>'; };
  var nozzle = function (x, y, h) { return '<rect x="' + x + '" y="' + (y - h / 2) + '" width="14" height="' + h + '" rx="2" fill="' + M + '"/><rect x="' + (x + 11) + '" y="' + (y - h / 2 + 1) + '" width="3" height="' + (h - 2) + '" fill="#10131f"/><rect x="' + (x + 2) + '" y="' + (y - h / 2 + 2) + '" width="7" height="1.4" fill="#c6cde0" opacity=".7"/>'; };
  var rivets = function (x0, y, n, st) { var s = ''; for (var i = 0; i < n; i++) s += '<circle cx="' + (x0 + i * st) + '" cy="' + y + '" r="0.9" fill="' + ll + '" opacity=".8"/>'; return s; };
  var seam = function (x1, y1, x2, y2) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + dd + '" stroke-width="1" opacity=".7"/>'; };
  var lights = function (x0, y, n, st, c) { var s = ''; for (var i = 0; i < n; i++) s += '<rect x="' + (x0 + i * st) + '" y="' + y + '" width="3" height="2.2" fill="' + c + '"/>'; return s; };
  var body;
  if (id === 'barge') {
    body = flame(30, 52, 26, 8) + flame(30, 72, 28, 9) + flame(30, 92, 26, 8) +
      nozzle(26, 52, 16) + nozzle(26, 72, 18) + nozzle(26, 92, 16) +
      '<rect x="38" y="36" width="156" height="72" rx="5" fill="' + H + '"/>' +
      '<rect x="38" y="68" width="156" height="5" fill="' + dd + '" opacity=".6"/>' +
      '<rect x="46" y="18" width="40" height="22" rx="2" fill="#e05a3a"/><rect x="90" y="18" width="40" height="22" rx="2" fill="#f4d054"/><rect x="134" y="18" width="40" height="22" rx="2" fill="#4aa8e8"/>' +
      '<rect x="46" y="18" width="40" height="4" fill="#fff" opacity=".35"/><rect x="90" y="18" width="40" height="4" fill="#fff" opacity=".35"/><rect x="134" y="18" width="40" height="4" fill="#fff" opacity=".35"/>' +
      seam(56, 18, 56, 40) + seam(66, 18, 66, 40) + seam(100, 18, 100, 40) + seam(110, 18, 110, 40) + seam(144, 18, 144, 40) + seam(154, 18, 154, 40) +
      '<rect x="46" y="108" width="40" height="18" rx="2" fill="' + W + '"/><rect x="90" y="108" width="40" height="18" rx="2" fill="' + H + '"/><rect x="134" y="108" width="40" height="18" rx="2" fill="' + W + '"/>' +
      seam(70, 36, 70, 108) + seam(110, 36, 110, 108) + seam(150, 36, 150, 108) + rivets(44, 40, 14, 10) + rivets(44, 104, 14, 10) +
      '<rect x="50" y="52" width="30" height="10" fill="#e04a3a"/><rect x="54" y="54" width="22" height="2" fill="#fff"/><rect x="54" y="58" width="12" height="2" fill="#fff"/>' +
      lights(120, 82, 12, 5, '#ffe27a') +
      '<path d="M194 42 L230 58 L230 86 L194 102Z" fill="' + W + '"/><path d="M194 42 L230 58 L230 62 L194 48Z" fill="' + l + '"/><path d="M200 54 L224 64 L224 72 L200 72Z" fill="' + G + '"/><path d="M203 57 L216 62 L203 62Z" fill="#fff" opacity=".6"/>';
  } else if (id === 'stargazer') {
    body = flame(34, 72, 28, 6) + nozzle(28, 72, 14) +
      '<path d="M70 58 L110 30 L122 30 L110 62Z" fill="' + W + '"/><path d="M70 86 L110 114 L122 114 L110 82Z" fill="' + W + '"/>' +
      '<rect x="62" y="26" width="64" height="6" rx="2" fill="#2a63c8"/><rect x="62" y="26" width="64" height="2" fill="#8fc2ff"/><rect x="62" y="112" width="64" height="6" rx="2" fill="#2a63c8"/><rect x="62" y="116" width="64" height="2" fill="#12306a"/>' +
      '<path d="M40 66 Q60 58 150 60 L218 69 Q232 72 218 75 L150 84 Q60 86 40 78Z" fill="' + H + '"/>' +
      '<path d="M48 64 Q100 59 190 66 L150 66 Q90 64 52 68Z" fill="#fff" opacity=".35"/>' +
      '<ellipse cx="126" cy="54" rx="28" ry="9" fill="' + M + '"/><ellipse cx="126" cy="51" rx="22" ry="6" fill="#9aa3bb"/><rect x="123" y="38" width="6" height="14" fill="' + M + '"/><circle cx="126" cy="36" r="3.4" fill="#ff6a4a"/><circle cx="125.4" cy="35.2" r="1.2" fill="#fff"/>' +
      '<path d="M176 66 Q200 62 214 69 Q200 72 176 72Z" fill="' + G + '"/><path d="M182 65 Q196 64 204 67 Q192 67 182 68Z" fill="#fff" opacity=".7"/>' +
      seam(70, 62, 70, 82) + seam(100, 61, 100, 83) + seam(150, 62, 150, 84) + rivets(76, 80, 10, 7) + lights(84, 70, 8, 6, '#ffe27a') +
      '<rect x="52" y="68" width="14" height="5" fill="#ff7a3a"/><rect x="108" y="76" width="30" height="3" fill="#fff" opacity=".7"/>';
  } else if (id === 'cutlass') {
    body = flame(32, 50, 26, 6) + flame(32, 96, 26, 6) + nozzle(24, 50, 12) + nozzle(24, 96, 12) +
      '<path d="M40 40 Q60 30 130 34 L232 72 Q140 70 112 108 Q76 128 38 104 Q70 90 66 68 Q58 52 40 40Z" fill="' + H + '"/>' +
      '<path d="M66 54 Q130 40 226 71 Q140 62 78 70Z" fill="#fff" opacity=".3"/>' +
      '<path d="M112 108 Q76 128 38 104 Q86 104 112 108Z" fill="' + dd + '" opacity=".8"/>' +
      '<path d="M84 74 L190 72 L168 84 L96 88Z" fill="' + W + '"/>' +
      '<path d="M150 62 Q178 58 204 70 Q178 70 150 70Z" fill="' + G + '"/><path d="M158 62 Q176 60 190 65 Q174 64 158 66Z" fill="#fff" opacity=".7"/>' +
      '<path d="M44 44 L98 40 L96 46 L52 50Z" fill="#111522"/><path d="M60 50 L120 40 L118 44 L68 54Z" fill="#fff" opacity=".7"/>' +
      '<rect x="92" y="74" width="40" height="4" fill="#ffd23a"/><rect x="92" y="80" width="26" height="3" fill="#111522"/>' +
      seam(100, 52, 122, 74) + seam(120, 46, 140, 72) + rivets(70, 76, 9, 6) + lights(70, 92, 7, 6, '#ff7a5a');
  } else {
    body = flame(34, 72, 30, 9) + nozzle(24, 72, 24) +
      '<path d="M92 56 L134 14 L156 16 L132 58Z" fill="' + W + '"/><path d="M92 88 L134 130 L156 128 L132 86Z" fill="' + W + '"/>' +
      '<path d="M96 54 L134 17 L142 17 L110 56Z" fill="' + l + '" opacity=".6"/><path d="M96 90 L134 127 L142 127 L110 88Z" fill="' + l + '" opacity=".4"/>' +
      '<rect x="146" y="14" width="10" height="5" fill="#ff4a3a"/><rect x="146" y="125" width="10" height="5" fill="#ff4a3a"/>' +
      '<path d="M34 72 Q62 40 150 44 L206 62 Q222 72 206 82 L150 100 Q62 104 34 72Z" fill="' + H + '"/>' +
      '<path d="M48 70 Q84 52 160 54 L204 64 L160 66 Q90 62 52 72Z" fill="#fff" opacity=".35"/>' +
      '<path d="M34 72 Q62 104 150 100 L206 82 Q150 90 100 92 Q60 92 34 72Z" fill="' + dd + '" opacity=".55"/>' +
      '<path d="M150 62 Q178 56 202 68 Q180 78 152 78Z" fill="' + G + '"/><path d="M158 61 Q176 58 192 64 Q176 64 160 68Z" fill="#fff" opacity=".75"/>' +
      '<rect x="62" y="64" width="46" height="9" fill="#e84a2c"/><rect x="66" y="66" width="20" height="2" fill="#fff"/><rect x="66" y="69" width="10" height="2" fill="#fff"/><rect x="90" y="66" width="14" height="5" fill="#fff" opacity=".85"/>' +
      '<circle cx="96" cy="76" r="4.5" fill="' + dd + '"/><circle cx="96" cy="76" r="2.4" fill="#12192b"/><circle cx="95" cy="75" r="0.9" fill="#fff"/>' +
      seam(72, 52, 72, 92) + seam(116, 48, 116, 98) + seam(128, 47, 128, 96) + rivets(58, 82, 12, 6) + lights(132, 86, 8, 5, '#ffe27a');
  }
  return '<svg viewBox="0 0 240 140" role="img" aria-label="Ship illustration">' + defs + body + '</svg>';
};
/* the little ship pictures are drawn at double the old pixel density and shown at the same size */
UI.shipPic = function (id, hue, w, h, scale, cls) { return PX.svg(UI.shipSVG(id, hue), (w || 64) * 2, (h || 40) * 2, 'shippic ' + (cls || ''), (scale || 2) / 2, 40); };
