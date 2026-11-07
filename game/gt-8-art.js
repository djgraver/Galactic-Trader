/* Galactic Trader. Part 8: artwork. Five distinct ship silhouettes, planet paintings on canvas, and the star map. */
var UI = {};
UI.shade = function (hex, amt) {
  var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  function f(c) { return Math.max(0, Math.min(255, Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt)))); }
  return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
};

UI.shipSVG = function (id, hue) {
  var d = UI.shade(hue, -0.5), l = UI.shade(hue, 0.4), glass = '#bff4ff', fl = '#ffb347', body;
  var flame = function (x, y, len) { return '<path d="M' + x + ' ' + (y - 7) + ' L' + (x - len) + ' ' + y + ' L' + x + ' ' + (y + 7) + 'Z" fill="' + fl + '"/><path d="M' + x + ' ' + (y - 3) + ' L' + (x - len * 0.55) + ' ' + y + ' L' + x + ' ' + (y + 3) + 'Z" fill="#fff4c2"/>'; };
  if (id === 'barge') {
    body = flame(28, 52, 22) + flame(28, 72, 22) + flame(28, 92, 22) +
      '<rect x="30" y="42" width="14" height="20" rx="3" fill="#2a2f4a"/><rect x="30" y="62" width="14" height="20" rx="3" fill="#2a2f4a"/><rect x="30" y="82" width="14" height="20" rx="3" fill="#2a2f4a"/>' +
      '<rect x="44" y="40" width="150" height="64" rx="6" fill="' + hue + '"/><rect x="44" y="70" width="150" height="6" fill="' + d + '"/>' +
      '<rect x="56" y="24" width="38" height="18" fill="' + l + '"/><rect x="98" y="24" width="38" height="18" fill="#ff7ad9"/><rect x="140" y="24" width="38" height="18" fill="#6fe7ff"/>' +
      '<rect x="56" y="104" width="38" height="16" fill="' + d + '"/><rect x="98" y="104" width="38" height="16" fill="' + l + '"/>' +
      '<path d="M194 48 L226 60 L226 84 L194 96Z" fill="' + d + '"/><path d="M200 56 L220 63 L220 70 L200 70Z" fill="' + glass + '"/>';
  } else if (id === 'stargazer') {
    body = flame(34, 72, 20) + '<rect x="30" y="62" width="14" height="20" rx="3" fill="#2a2f4a"/>' +
      '<rect x="64" y="84" width="60" height="18" rx="9" fill="' + d + '"/><rect x="132" y="84" width="46" height="18" rx="9" fill="' + d + '"/>' +
      '<path d="M40 72 L190 62 L232 72 L190 82Z" fill="' + hue + '"/><path d="M40 72 L190 67 L232 72 L190 77Z" fill="' + l + '" opacity=".55"/>' +
      '<rect x="116" y="42" width="6" height="26" fill="' + d + '"/><ellipse cx="119" cy="38" rx="38" ry="11" fill="' + l + '"/><ellipse cx="119" cy="38" rx="30" ry="7" fill="' + d + '"/><circle cx="119" cy="30" r="4" fill="' + glass + '"/>' +
      '<ellipse cx="202" cy="70" rx="16" ry="5" fill="' + glass + '"/>';
  } else if (id === 'cutlass') {
    body = flame(34, 50, 20) + flame(34, 94, 20) +
      '<rect x="30" y="42" width="14" height="16" rx="3" fill="#2a2f4a"/><rect x="30" y="86" width="14" height="16" rx="3" fill="#2a2f4a"/>' +
      '<path d="M40 38 Q150 22 232 72 Q150 76 118 112 Q76 126 44 102 Q78 84 64 62 Q54 48 40 38Z" fill="' + hue + '"/>' +
      '<path d="M64 62 Q150 44 224 72 Q150 66 82 80Z" fill="' + l + '" opacity=".55"/><path d="M118 112 Q76 126 44 102 Q90 98 118 112Z" fill="' + d + '"/>' +
      '<ellipse cx="176" cy="66" rx="16" ry="5" transform="rotate(14 176 66)" fill="' + glass + '"/>';
  } else {
    body = flame(34, 72, 24) + '<rect x="28" y="60" width="14" height="24" rx="3" fill="#2a2f4a"/>' +
      '<path d="M92 52 L132 16 L150 18 L130 54Z M92 90 L132 126 L150 124 L130 88Z" fill="' + d + '"/>' +
      '<path d="M36 72 Q64 40 150 44 L204 62 Q220 72 204 82 L150 100 Q64 104 36 72Z" fill="' + hue + '"/><path d="M50 72 Q84 56 160 58 L200 66 L160 72Z" fill="' + l + '" opacity=".5"/>' +
      '<ellipse cx="170" cy="68" rx="22" ry="10" fill="' + glass + '"/><circle cx="96" cy="72" r="5" fill="' + d + '"/><circle cx="116" cy="72" r="5" fill="' + d + '"/>';
  }
  return '<svg viewBox="0 0 240 140" role="img" aria-label="Ship illustration">' + body + '</svg>';
};

/* ---------- planets (canvas, black starfield behind) ---------- */
UI.drawPlanet = function (cv, p) {
  var W = 480, H = 270, dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr; cv.style.aspectRatio = W + ' / ' + H;
  var c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
  var seed = 0; for (var i = 0; i < p.id.length; i++) seed = seed * 31 + p.id.charCodeAt(i);
  var rnd = GT.seeded(seed), cx = 300, cy = 126, r = 88, k;
  c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  for (k = 0; k < 150; k++) { c.globalAlpha = 0.25 + rnd() * 0.75; c.fillStyle = '#fff'; var sz = rnd() < 0.1 ? 1.8 : 1; c.fillRect(rnd() * W, rnd() * H, sz, sz); }
  c.globalAlpha = 1;
  var base = p.color, dark = UI.shade(base, -0.65), lite = UI.shade(base, 0.45);
  function sphere() { var g = c.createRadialGradient(cx - r * 0.4, cy - r * 0.45, r * 0.1, cx, cy, r * 1.05); g.addColorStop(0, lite); g.addColorStop(0.45, base); g.addColorStop(1, dark); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill(); }
  function shadow() { var g = c.createRadialGradient(cx - r * 0.5, cy - r * 0.5, r * 0.5, cx + r * 0.2, cy + r * 0.2, r * 1.25); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,6,.78)'); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill(); }
  function clip() { c.save(); c.beginPath(); c.arc(cx, cy, r, 0, 7); c.clip(); }
  function glow() { var g = c.createRadialGradient(cx, cy, r * 0.95, cx, cy, r * 1.3); g.addColorStop(0, base + '66'); g.addColorStop(1, base + '00'); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r * 1.3, 0, 7); c.fill(); }
  var t = p.type;
  if (t === 'Void Station') {
    var g = c.createRadialGradient(cx, cy, 8, cx, cy, r * 1.25); g.addColorStop(0, '#000'); g.addColorStop(0.55, '#000'); g.addColorStop(0.75, base + '88'); g.addColorStop(1, base + '00');
    c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r * 1.25, 0, 7); c.fill();
    c.strokeStyle = lite; c.lineWidth = 7; c.beginPath(); c.ellipse(cx, cy, 70, 70, 0, 0, 7); c.stroke();
    c.strokeStyle = base; c.lineWidth = 2;
    for (k = 0; k < 8; k++) { var a = k * Math.PI / 4; c.beginPath(); c.moveTo(cx + Math.cos(a) * 14, cy + Math.sin(a) * 14); c.lineTo(cx + Math.cos(a) * 67, cy + Math.sin(a) * 67); c.stroke(); }
    c.fillStyle = lite; c.beginPath(); c.arc(cx, cy, 15, 0, 7); c.fill(); c.fillStyle = '#000'; c.beginPath(); c.arc(cx, cy, 6, 0, 7); c.fill();
    c.fillStyle = '#fff'; for (k = 0; k < 24; k++) { var b = k * Math.PI / 12; c.fillRect(cx + Math.cos(b) * 70 - 1, cy + Math.sin(b) * 70 - 1, 3, 3); }
    return;
  }
  if (p.ring) { c.save(); c.translate(cx, cy); c.rotate(-0.28); c.strokeStyle = lite; c.globalAlpha = 0.55; c.lineWidth = 16; c.beginPath(); c.ellipse(0, 0, 150, 28, 0, Math.PI, 2 * Math.PI); c.stroke(); c.lineWidth = 6; c.strokeStyle = base; c.beginPath(); c.ellipse(0, 0, 170, 34, 0, Math.PI, 2 * Math.PI); c.stroke(); c.restore(); c.globalAlpha = 1; }
  glow(); sphere(); clip();
  if (t === 'Gas Giant') { for (k = 0; k < 16; k++) { c.fillStyle = k % 2 ? 'rgba(255,240,200,.22)' : 'rgba(150,80,20,.25)'; var yy = cy - r + k * (r * 2 / 16) + rnd() * 4; c.fillRect(cx - r, yy, r * 2, 6 + rnd() * 8); } c.fillStyle = 'rgba(190,60,30,.55)'; c.beginPath(); c.ellipse(cx + 28, cy + 26, 22, 11, 0, 0, 7); c.fill(); }
  else if (t === 'Agrarian') { for (k = 0; k < 90; k++) { c.save(); c.translate(cx + (rnd() - 0.5) * r * 2, cy + (rnd() - 0.5) * r * 2); c.rotate(rnd() < 0.5 ? 0.3 : -0.4); c.fillStyle = rnd() < 0.5 ? 'rgba(255,230,120,.5)' : 'rgba(30,120,50,.5)'; c.fillRect(0, 0, 8 + rnd() * 18, 5 + rnd() * 10); c.restore(); } c.fillStyle = 'rgba(70,150,255,.5)'; c.beginPath(); c.ellipse(cx - 30, cy + 40, 24, 10, 0.4, 0, 7); c.fill(); }
  else if (t === 'Megacity') { for (k = 0; k < 400; k++) { var px = cx + (rnd() - 0.5) * r * 2, py = cy + (rnd() - 0.5) * r * 2; c.fillStyle = rnd() < 0.2 ? '#fff' : base; c.globalAlpha = 0.4 + rnd() * 0.6; c.fillRect(px, py, 1.6, 1.6); } c.globalAlpha = 1; c.strokeStyle = 'rgba(160,240,255,.35)'; c.lineWidth = 1; for (k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(cx - r, cy + k * 24); c.lineTo(cx + r, cy + k * 24); c.stroke(); c.beginPath(); c.moveTo(cx + k * 24, cy - r); c.lineTo(cx + k * 24, cy + r); c.stroke(); } }
  else if (t === 'Mining') { for (k = 0; k < 28; k++) { var qx = cx + (rnd() - 0.5) * r * 1.8, qy = cy + (rnd() - 0.5) * r * 1.8, qr = 3 + rnd() * 12; c.fillStyle = 'rgba(40,10,0,.45)'; c.beginPath(); c.arc(qx, qy, qr, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,170,90,.35)'; c.stroke(); } c.fillStyle = '#ffb347'; for (k = 0; k < 14; k++) c.fillRect(cx + (rnd() - 0.5) * r * 1.6, cy + (rnd() - 0.5) * r * 1.6, 2, 2); }
  else if (t === 'Science') { for (k = 0; k < 9; k++) { var dx = cx + (rnd() - 0.5) * r * 1.5, dy = cy + (rnd() - 0.5) * r * 1.5; c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.arc(dx, dy, 6 + rnd() * 6, Math.PI, 2 * Math.PI); c.fill(); c.fillRect(dx - 12, dy, 24, 3); } c.strokeStyle = 'rgba(255,255,255,.35)'; for (k = 0; k < 6; k++) { c.beginPath(); c.moveTo(cx - r, cy - 60 + k * 24 + rnd() * 6); c.quadraticCurveTo(cx, cy - 70 + k * 26, cx + r, cy - 50 + k * 22); c.stroke(); } }
  else if (t === 'Ruin') { for (k = 0; k < 18; k++) { var rx = cx + (rnd() - 0.5) * r * 1.6, ry = cy + (rnd() - 0.5) * r * 1.6; c.strokeStyle = 'rgba(70,40,10,.5)'; c.lineWidth = 2; c.beginPath(); c.arc(rx, ry, 4 + rnd() * 14, 0, 7); c.stroke(); } c.strokeStyle = 'rgba(255,235,190,.7)'; c.lineWidth = 3; c.beginPath(); c.arc(cx - 6, cy + 4, 50, 0.4, 4.2); c.stroke(); c.fillStyle = 'rgba(255,235,190,.8)'; for (k = 0; k < 6; k++) { var aa = 0.4 + k * 0.62; c.fillRect(cx - 6 + Math.cos(aa) * 50 - 2, cy + 4 + Math.sin(aa) * 50 - 6, 4, 12); } }
  c.restore(); shadow();
  c.strokeStyle = '#1d0f33'; c.lineWidth = 5; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.stroke();
  if (p.ring) { c.save(); c.translate(cx, cy); c.rotate(-0.28); c.strokeStyle = lite; c.globalAlpha = 0.85; c.lineWidth = 16; c.beginPath(); c.ellipse(0, 0, 150, 28, 0, 0, Math.PI); c.stroke(); c.lineWidth = 6; c.strokeStyle = base; c.beginPath(); c.ellipse(0, 0, 170, 34, 0, 0, Math.PI); c.stroke(); c.restore(); c.globalAlpha = 1; }
};

/* ---------- star map (svg) ---------- */
UI.mapSX = function (x) { return 24 + x * 3.55; };
UI.mapSY = function (y) { return 26 + y * 3.7; };
UI.mapSVG = function (s, dest) {
  var P = GT.PLANETS, out = '<svg viewBox="0 0 400 270" role="group" aria-label="Star map"><rect width="400" height="270" fill="#000"/>', k, rnd = GT.seeded(77);
  for (k = 0; k < 110; k++) out += '<circle cx="' + (rnd() * 400).toFixed(0) + '" cy="' + (rnd() * 270).toFixed(0) + '" r="' + (rnd() < 0.12 ? 1.2 : 0.6) + '" fill="#fff" opacity="' + (0.25 + rnd() * 0.7).toFixed(2) + '"/>';
  if (dest !== null && dest !== s.loc) {
    out += '<line x1="' + UI.mapSX(P[s.loc].x) + '" y1="' + UI.mapSY(P[s.loc].y) + '" x2="' + UI.mapSX(P[dest].x) + '" y2="' + UI.mapSY(P[dest].y) + '" stroke="#ffd166" stroke-width="2" stroke-dasharray="6 5"/>';
  }
  P.forEach(function (p, i) {
    var x = UI.mapSX(p.x), y = UI.mapSY(p.y), here = i === s.loc, sel = i === dest, rad = here ? 11 : 8;
    out += '<g class="pl" data-i="' + i + '" tabindex="0" role="button" aria-label="' + GT.esc(p.name) + (here ? ', current location' : sel ? ', selected destination' : '') + '">';
    out += '<circle cx="' + x + '" cy="' + y + '" r="22" fill="transparent"/>';
    if (p.ring) out += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (rad + 8) + '" ry="3.4" fill="none" stroke="' + p.color + '" stroke-width="1.6" opacity=".85" transform="rotate(-16 ' + x + ' ' + y + ')"/>';
    if (here) out += '<circle cx="' + x + '" cy="' + y + '" r="' + (rad + 6) + '" fill="none" stroke="#6fe7ff" stroke-width="1.5"/>';
    if (sel) out += '<circle cx="' + x + '" cy="' + y + '" r="' + (rad + 6) + '" fill="none" stroke="#ffd166" stroke-width="2" stroke-dasharray="3 3"/>';
    out += '<circle cx="' + x + '" cy="' + y + '" r="' + rad + '" fill="' + p.color + '"/><circle cx="' + (x - rad * 0.3) + '" cy="' + (y - rad * 0.3) + '" r="' + rad * 0.45 + '" fill="#fff" opacity=".28"/>';
    out += '<text x="' + x + '" y="' + (y + rad + (here || sel ? 21 : 13)) + '" text-anchor="middle" font-size="' + (here ? 14 : 10) + '" font-weight="' + (here ? 800 : 500) + '" fill="' + (here ? '#6fe7ff' : sel ? '#ffd166' : '#c9d0ff') + '">' + GT.esc(p.name) + '</text>';
    s.comps.forEach(function (cp, ci) { if (cp.loc === i) out += '<g><rect x="' + (x + rad + 1 + ci * 7) + '" y="' + (y - rad - 4) + '" width="5" height="5" transform="rotate(45 ' + (x + rad + 3 + ci * 7) + ' ' + (y - rad - 1.5) + ')" fill="#ff7a8c"><title>' + GT.esc(cp.name) + '</title></rect></g>'; });
    out += '</g>';
  });
  return out + '</svg>';
};
