/* Galactic Trader 7. Part 28: the ships, redrawn. Each hull now has its own silhouette you can read at a glance (Homeworld), airbrushed metal with a rim light (Solar Winds),
   and working-ship clutter: nacelles, dishes, radiators, hazard paint, hull numbers and running lights. Drawn facing right on a 240 x 140 sheet. */
UI.shipSVG = function (id, hue) {
  var d = UI.shade(hue, -0.5), dd = UI.shade(hue, -0.74), m = UI.shade(hue, -0.25), l = UI.shade(hue, 0.4), ll = UI.shade(hue, 0.78), u = 'g' + id.slice(0, 3), ion = id === 'stargazer';
  var defs = '<defs>' +
    '<linearGradient id="' + u + 'h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + ll + '"/><stop offset=".18" stop-color="' + l + '"/><stop offset=".5" stop-color="' + hue + '"/><stop offset=".8" stop-color="' + d + '"/><stop offset="1" stop-color="' + dd + '"/></linearGradient>' +
    '<linearGradient id="' + u + 'w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + m + '"/><stop offset="1" stop-color="' + dd + '"/></linearGradient>' +
    '<linearGradient id="' + u + 'm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b4bcd0"/><stop offset=".35" stop-color="#727a92"/><stop offset=".7" stop-color="#3a4056"/><stop offset="1" stop-color="#161a28"/></linearGradient>' +
    '<linearGradient id="' + u + 'k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5068"/><stop offset="1" stop-color="#0c0e18"/></linearGradient>' +
    '<linearGradient id="' + u + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2feff"/><stop offset=".3" stop-color="#6ad4f6"/><stop offset=".7" stop-color="#1c56a8"/><stop offset="1" stop-color="#081a48"/></linearGradient>' +
    '<linearGradient id="' + u + 's" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a8cf0"/><stop offset=".5" stop-color="#1c2c94"/><stop offset="1" stop-color="#0a1040"/></linearGradient>' +
    '<radialGradient id="' + u + 'f" cx="1" cy=".5" r="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".22" stop-color="' + (ion ? '#c8fbff' : '#fff0a8') + '"/><stop offset=".55" stop-color="' + (ion ? '#4ac8ff' : '#ff9b3a') + '"/><stop offset="1" stop-color="' + (ion ? '#2a4cff' : '#ff4a1a') + '" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="' + u + 'o" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="' + (ion ? '#8ae4ff' : '#ffb060') + '" stop-opacity=".55"/><stop offset="1" stop-color="' + (ion ? '#2a4cff' : '#ff4a1a') + '" stop-opacity="0"/></radialGradient>' +
    '</defs>';
  var H = 'url(#' + u + 'h)', W = 'url(#' + u + 'w)', M = 'url(#' + u + 'm)', K = 'url(#' + u + 'k)', G = 'url(#' + u + 'g)', SOL = 'url(#' + u + 's)';
  var flame = function (x, y, len, r) { return '<ellipse cx="' + (x - len * 0.2) + '" cy="' + y + '" rx="' + len * 0.9 + '" ry="' + r * 2.2 + '" fill="url(#' + u + 'o)"/><ellipse cx="' + (x - len * 0.5) + '" cy="' + y + '" rx="' + len + '" ry="' + r + '" fill="url(#' + u + 'f)"/><ellipse cx="' + (x - len * 0.18) + '" cy="' + y + '" rx="' + len * 0.36 + '" ry="' + r * 0.42 + '" fill="#fff" opacity=".9"/>'; };
  var nozzle = function (x, y, h, w) { w = w || 12; return '<path d="M' + x + ',' + (y - h / 2 - 1.5) + ' L' + (x + w) + ',' + (y - h / 2 + 1) + ' L' + (x + w) + ',' + (y + h / 2 - 1) + ' L' + x + ',' + (y + h / 2 + 1.5) + 'Z" fill="' + M + '"/><rect x="' + x + '" y="' + (y - h / 2 - 1.5) + '" width="2.4" height="' + (h + 3) + '" fill="#0c0e18"/><rect x="' + (x + w - 2.5) + '" y="' + (y - h / 2 + 1) + '" width="2.5" height="' + (h - 2) + '" fill="#0c0e18" opacity=".7"/><rect x="' + (x + 3) + '" y="' + (y - h / 2 + 1.5) + '" width="' + (w - 6) + '" height="1.2" fill="#e8ecf8" opacity=".75"/>'; };
  var rivets = function (x0, y, n, st) { var s = ''; for (var i = 0; i < n; i++) s += '<circle cx="' + (x0 + i * st) + '" cy="' + y + '" r="0.8" fill="' + ll + '" opacity=".8"/>'; return s; };
  var seam = function (x1, y1, x2, y2, o) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + dd + '" stroke-width="0.9" opacity="' + (o || 0.7) + '"/><line x1="' + (x1 + 1) + '" y1="' + y1 + '" x2="' + (x2 + 1) + '" y2="' + y2 + '" stroke="' + ll + '" stroke-width="0.5" opacity=".35"/>'; };
  var lights = function (x0, y, n, st, c) { var s = ''; for (var i = 0; i < n; i++) s += '<rect x="' + (x0 + i * st) + '" y="' + y + '" width="2.6" height="1.9" fill="' + c + '"/>'; return s; };
  var lamp = function (x, y, c) { return '<circle cx="' + x + '" cy="' + y + '" r="3.6" fill="' + c + '" opacity=".3"/><circle cx="' + x + '" cy="' + y + '" r="1.5" fill="' + c + '"/><circle cx="' + (x - 0.4) + '" cy="' + (y - 0.4) + '" r="0.6" fill="#fff"/>'; };
  var hazard = function (x, y, w, h) { var s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#f4d040"/>'; for (var i = 0; i < w; i += 6) s += '<path d="M' + (x + i) + ',' + (y + h) + ' L' + (x + i + 3) + ',' + y + ' L' + Math.min(x + w, x + i + 6) + ',' + y + ' L' + (x + i + 3) + ',' + (y + h) + 'Z" fill="#14161f"/>'; return s; };
  var text = function (x, y, t, sz, c) { return '<text x="' + x + '" y="' + y + '" font-family="Verdana,Arial,sans-serif" font-weight="bold" font-size="' + sz + '" fill="' + (c || '#fff') + '">' + t + '</text>'; };
  var dish = function (x, y, r) { return '<line x1="' + x + '" y1="' + (y + r + 6) + '" x2="' + x + '" y2="' + y + '" stroke="#3a4056" stroke-width="2"/><path d="M' + (x - r) + ',' + (y - r * 0.2) + ' Q' + x + ',' + (y + r * 1.1) + ' ' + (x + r) + ',' + (y - r * 0.2) + ' Q' + x + ',' + (y + r * 0.3) + ' ' + (x - r) + ',' + (y - r * 0.2) + 'Z" fill="' + M + '"/><line x1="' + x + '" y1="' + (y + r * 0.3) + '" x2="' + (x + r * 0.5) + '" y2="' + (y - r * 0.9) + '" stroke="#c8cede" stroke-width="1"/><circle cx="' + (x + r * 0.5) + '" cy="' + (y - r * 0.9) + '" r="1.4" fill="#ff5a4a"/>'; };
  var body;
  if (id === 'barge') {
    /* a spine with container racks, a drive block the size of a house and a small, brave bridge */
    var cols = ['#d8503a', '#f0c848', '#4a9fe0', '#58b868', '#b8bccc', '#d8503a', '#4a9fe0', '#f0c848'], cont = '';
    for (var c = 0; c < 8; c++) {
      var cx = 64 + (c % 4) * 32, cy = c < 4 ? 26 : 80, col = cols[c];
      cont += '<rect x="' + cx + '" y="' + cy + '" width="30" height="34" rx="1.5" fill="' + col + '"/><rect x="' + cx + '" y="' + cy + '" width="30" height="5" fill="#fff" opacity=".4"/><rect x="' + cx + '" y="' + (cy + 26) + '" width="30" height="8" fill="#000" opacity=".3"/>';
      for (var q = 1; q < 5; q++) cont += '<line x1="' + (cx + q * 6) + '" y1="' + (cy + 2) + '" x2="' + (cx + q * 6) + '" y2="' + (cy + 32) + '" stroke="#000" stroke-width="0.8" opacity=".28"/>';
      if (c % 3 === 0) cont += '<rect x="' + (cx + 4) + '" y="' + (cy + 12) + '" width="14" height="8" fill="#fff" opacity=".85"/><rect x="' + (cx + 6) + '" y="' + (cy + 14) + '" width="10" height="1.6" fill="' + col + '"/><rect x="' + (cx + 6) + '" y="' + (cy + 17) + '" width="6" height="1.6" fill="' + col + '"/>';
      if (c % 3 === 1) cont += '<circle cx="' + (cx + 15) + '" cy="' + (cy + 17) + '" r="6" fill="none" stroke="#14161f" stroke-width="1.6" opacity=".7"/><path d="M' + (cx + 11) + ',' + (cy + 17) + ' h8 M' + (cx + 15) + ',' + (cy + 13) + ' v8" stroke="#14161f" stroke-width="1.6" opacity=".7"/>';
    }
    body = flame(30, 46, 24, 7) + flame(30, 70, 28, 9) + flame(30, 94, 24, 7) +
      '<rect x="36" y="14" width="18" height="6" fill="' + K + '"/><rect x="36" y="120" width="18" height="6" fill="' + K + '"/><rect x="34" y="12" width="22" height="2" fill="#ff7a4a"/><rect x="34" y="126" width="22" height="2" fill="#ff7a4a"/>' +
      nozzle(24, 46, 16, 12) + nozzle(22, 70, 20, 14) + nozzle(24, 94, 16, 12) +
      '<path d="M34,26 L60,22 L62,118 L34,114Z" fill="' + H + '"/><path d="M34,26 L60,22 L60,28 L34,32Z" fill="#fff" opacity=".4"/>' + hazard(38, 62, 20, 5) + hazard(38, 73, 20, 5) +
      '<rect x="40" y="36" width="16" height="20" fill="' + K + '"/>' + lights(42, 40, 3, 4, '#ffb050') + lights(42, 46, 3, 4, '#ffb050') + '<rect x="40" y="84" width="16" height="20" fill="' + K + '"/>' + lights(42, 88, 3, 4, '#ffb050') + lights(42, 94, 3, 4, '#ffb050') +
      '<rect x="58" y="62" width="140" height="16" fill="' + M + '"/>' + (function () { var s = ''; for (var i = 0; i < 9; i++) s += '<path d="M' + (62 + i * 15) + ',62 l7.5,16 l7.5,-16" fill="none" stroke="#161a28" stroke-width="1.2" opacity=".8"/>'; return s; })() + '<rect x="58" y="62" width="140" height="2" fill="#e0e6f4" opacity=".6"/>' +
      cont + '<rect x="62" y="58" width="130" height="4" fill="' + K + '"/><rect x="62" y="78" width="130" height="4" fill="' + K + '"/>' +
      '<line x1="126" y1="26" x2="126" y2="12" stroke="#3a4056" stroke-width="2"/><line x1="126" y1="12" x2="160" y2="16" stroke="#3a4056" stroke-width="2"/><line x1="160" y1="16" x2="160" y2="22" stroke="#c8cede" stroke-width="1"/><rect x="157" y="22" width="6" height="4" fill="#f4d040"/>' +
      '<path d="M194,42 L216,42 L234,60 L234,82 L216,100 L194,100Z" fill="' + H + '"/><path d="M194,42 L216,42 L234,60 L230,60 L214,46 L194,46Z" fill="#fff" opacity=".45"/><path d="M194,88 L234,76 L234,82 L216,100 L194,100Z" fill="#000" opacity=".3"/>' +
      '<path d="M204,54 L216,54 L230,66 L230,72 L204,72Z" fill="' + G + '"/><path d="M206,56 L215,56 L222,62 L206,62Z" fill="#fff" opacity=".65"/><line x1="216" y1="54" x2="216" y2="72" stroke="#0c0e18" stroke-width="1"/>' +
      text(197, 86, 'BB-4', 7, '#14161f') + seam(204, 76, 204, 100) + rivets(198, 96, 5, 4) +
      dish(206, 30, 7) + lamp(234, 58, '#58ff7a') + lamp(234, 84, '#ff4a3a') + lamp(60, 20, '#ff4a3a') + lamp(60, 120, '#ff4a3a');
  } else if (id === 'stargazer') {
    /* a needle of a survey ship: spinning habitat ring, two fields of solar panel, a big dish and a cold blue ion drive */
    var grid = function (x, y, w, h) { var s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + SOL + '"/>', i; for (i = 1; i < 6; i++) s += '<line x1="' + (x + i * w / 6) + '" y1="' + y + '" x2="' + (x + i * w / 6) + '" y2="' + (y + h) + '" stroke="#8fb8ff" stroke-width="0.7" opacity=".7"/>'; for (i = 1; i < 4; i++) s += '<line x1="' + x + '" y1="' + (y + i * h / 4) + '" x2="' + (x + w) + '" y2="' + (y + i * h / 4) + '" stroke="#8fb8ff" stroke-width="0.7" opacity=".7"/>'; return s + '<path d="M' + x + ',' + y + ' L' + (x + w * 0.5) + ',' + y + ' L' + x + ',' + (y + h * 0.7) + 'Z" fill="#fff" opacity=".22"/><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="none" stroke="#c8cede" stroke-width="1.2"/>'; };
    body = flame(30, 70, 34, 6) +
      '<line x1="66" y1="62" x2="66" y2="44" stroke="#727a92" stroke-width="2.4"/><line x1="66" y1="78" x2="66" y2="96" stroke="#727a92" stroke-width="2.4"/>' + grid(40, 10, 54, 34) + grid(40, 96, 54, 34) +
      nozzle(26, 70, 16, 14) + '<rect x="38" y="60" width="10" height="20" fill="' + K + '"/>' +
      '<path d="M46,62 L150,58 L222,67 Q232,70 222,73 L150,82 L46,78Z" fill="' + H + '"/><path d="M46,62 L150,58 L222,67 L150,63 L46,66Z" fill="#fff" opacity=".5"/><path d="M46,78 L150,82 L222,73 L150,77 L46,74Z" fill="#000" opacity=".28"/>' +
      '<circle cx="84" cy="70" r="13" fill="' + M + '"/><circle cx="84" cy="70" r="13" fill="none" stroke="#0c0e18" stroke-width="1"/><path d="M75,62 Q84,56 93,62" fill="none" stroke="#fff" stroke-width="1.6" opacity=".7"/>' + hazard(74, 68, 20, 4) +
      '<ellipse cx="126" cy="70" rx="11" ry="46" fill="none" stroke="' + dd + '" stroke-width="11"/><ellipse cx="126" cy="70" rx="11" ry="46" fill="none" stroke="' + H + '" stroke-width="8"/><ellipse cx="124" cy="70" rx="11" ry="46" fill="none" stroke="#fff" stroke-width="1.2" opacity=".5"/>' +
      (function () { var s = '', a; for (a = 0; a < 12; a++) { var an = a / 12 * 6.283, x = 126 + Math.cos(an) * 11, y = 70 + Math.sin(an) * 46; if (Math.cos(an) > -0.2) s += '<rect x="' + (x - 1.2).toFixed(1) + '" y="' + (y - 1).toFixed(1) + '" width="2.4" height="2" fill="#ffe27a"/>'; } return s; })() +
      '<line x1="126" y1="26" x2="126" y2="60" stroke="#727a92" stroke-width="2"/><line x1="126" y1="80" x2="126" y2="114" stroke="#727a92" stroke-width="2"/>' +
      '<path d="M178,64 Q202,61 218,68 Q204,71 178,71Z" fill="' + G + '"/><path d="M184,64 Q198,63 208,66 Q196,66 184,67Z" fill="#fff" opacity=".75"/>' +
      '<line x1="222" y1="70" x2="240" y2="70" stroke="#c8cede" stroke-width="1.4"/><line x1="232" y1="66" x2="232" y2="74" stroke="#c8cede" stroke-width="1"/><line x1="236" y1="68" x2="236" y2="72" stroke="#c8cede" stroke-width="1"/>' +
      '<rect x="150" y="68" width="22" height="5" fill="#ff7a3a"/>' + text(100, 74, 'SG-9', 6, '#fff') + seam(104, 60, 104, 80) + seam(150, 58, 150, 82) + seam(176, 61, 176, 79) + rivets(52, 76, 6, 5) + lights(152, 76, 4, 5, '#ffe27a') +
      dish(162, 36, 12) + lamp(46, 60, '#ff4a3a') + lamp(222, 66, '#58ff7a') + lamp(94, 12, '#ff4a3a') + lamp(94, 128, '#ff4a3a');
  } else if (id === 'cutlass') {
    /* a blade with engines: forward-swept wings, long afterburners, a tinted canopy and teeth painted on the nose */
    body = flame(34, 50, 38, 6) + flame(34, 90, 38, 6) +
      '<path d="M76,50 L124,44 L160,10 L140,8Z" fill="' + W + '"/><path d="M76,90 L124,96 L160,130 L140,132Z" fill="' + W + '"/><path d="M82,48 L124,44 L158,11 L150,10Z" fill="' + l + '" opacity=".55"/>' +
      '<rect x="138" y="6" width="44" height="4" rx="2" fill="' + M + '"/><rect x="138" y="130" width="44" height="4" rx="2" fill="' + M + '"/><rect x="176" y="6" width="6" height="4" fill="#ff4a3a"/><rect x="176" y="130" width="6" height="4" fill="#ff4a3a"/>' +
      nozzle(26, 50, 13, 16) + nozzle(26, 90, 13, 16) + '<rect x="40" y="42" width="34" height="16" rx="3" fill="' + M + '"/><rect x="40" y="82" width="34" height="16" rx="3" fill="' + M + '"/><rect x="66" y="44" width="6" height="12" fill="#0c0e18"/><rect x="66" y="84" width="6" height="12" fill="#0c0e18"/>' +
      '<path d="M44,56 L122,40 L238,69 L238,71 L122,100 L44,84 L56,70Z" fill="' + H + '"/><path d="M44,56 L122,40 L238,69 L122,48 L50,60Z" fill="#fff" opacity=".42"/><path d="M44,84 L122,100 L238,71 L122,90 L52,78Z" fill="#000" opacity=".34"/>' +
      '<path d="M60,66 L176,66 L200,70 L176,74 L60,74Z" fill="#14161f"/><path d="M60,69 L186,69 L192,70 L186,71 L60,71Z" fill="#f4d040"/>' +
      '<path d="M126,54 Q168,52 204,66 Q168,66 128,66Z" fill="' + K + '"/><path d="M134,55 Q166,54 190,62 Q164,60 134,58Z" fill="#8ad8ff" opacity=".7"/><line x1="160" y1="54" x2="162" y2="66" stroke="#0c0e18" stroke-width="1"/>' +
      '<path d="M196,76 L232,71.5 L226,77 L222,74 L218,79 L214,75.5 L210,81 L206,77 L202,82Z" fill="#fff"/><path d="M196,76 L232,71.5" stroke="#b22c30" stroke-width="1.4" fill="none"/><circle cx="212" cy="66" r="2.2" fill="#fff"/><circle cx="212.6" cy="66" r="1" fill="#14161f"/>' +
      '<path d="M74,54 L84,32 L100,30 L96,50Z" fill="' + W + '"/><path d="M74,86 L84,108 L100,110 L96,90Z" fill="' + W + '"/>' + text(84, 46, '13', 7, '#fff') +
      '<path d="M96,80 h30 v10 h-30z" fill="none" stroke="' + dd + '" stroke-width="0.9" stroke-dasharray="2 1.5"/>' + seam(120, 41, 120, 100) + seam(150, 47, 150, 93) + rivets(64, 62, 8, 6) + lights(100, 60, 4, 5, '#ff8a5a') +
      lamp(160, 10, '#58ff7a') + lamp(160, 130, '#ff4a3a') + lamp(238, 70, '#fff');
  } else {
    /* the Wayfarer: a lifting body with a nacelle on each wing, a tail fin, a dish and a faded company stripe */
    body = flame(36, 70, 30, 8) + flame(70, 22, 22, 5) + flame(70, 118, 22, 5) +
      '<path d="M98,50 L134,48 L112,22 L90,22Z" fill="' + W + '"/><path d="M98,90 L134,92 L112,118 L90,118Z" fill="' + W + '"/><path d="M100,49 L132,48 L112,24 L104,24Z" fill="' + l + '" opacity=".5"/>' +
      nozzle(62, 22, 9, 10) + nozzle(62, 118, 9, 10) + '<rect x="70" y="15" width="54" height="14" rx="6" fill="' + H + '"/><rect x="70" y="111" width="54" height="14" rx="6" fill="' + H + '"/><ellipse cx="122" cy="22" rx="3" ry="5.5" fill="#0c0e18"/><ellipse cx="122" cy="118" rx="3" ry="5.5" fill="#0c0e18"/><rect x="78" y="17" width="34" height="1.6" fill="#fff" opacity=".6"/><rect x="78" y="113" width="34" height="1.6" fill="#fff" opacity=".6"/><rect x="90" y="20" width="16" height="4" fill="#e8482c"/><rect x="90" y="116" width="16" height="4" fill="#e8482c"/>' +
      '<path d="M58,52 L84,50 L62,28 L50,30Z" fill="' + W + '"/><path d="M60,51 L82,50 L62,30 L56,31Z" fill="' + l + '" opacity=".5"/>' + text(60, 44, '7', 8, '#fff') +
      nozzle(26, 70, 24, 16) +
      '<path d="M40,70 Q50,46 110,44 L172,50 Q214,58 230,70 Q214,82 172,90 L110,96 Q50,94 40,70Z" fill="' + H + '"/>' +
      '<path d="M52,64 Q70,49 112,47 L172,52 Q200,57 220,67 Q196,60 170,58 L112,54 Q76,54 54,68Z" fill="#fff" opacity=".45"/>' +
      '<path d="M40,70 Q50,94 110,96 L172,90 Q214,82 230,70 Q208,78 172,82 L110,86 Q64,86 40,70Z" fill="#000" opacity=".3"/>' +
      '<path d="M196,61 Q214,64 230,70 Q214,76 196,79 Q204,70 196,61Z" fill="' + K + '" opacity=".55"/><line x1="230" y1="70" x2="240" y2="70" stroke="#c8cede" stroke-width="1.2"/>' +
      '<path d="M158,56 Q186,56 204,66 Q188,70 160,70Z" fill="' + G + '"/><path d="M164,57 Q182,57 194,63 Q180,62 164,62Z" fill="#fff" opacity=".8"/><line x1="176" y1="56" x2="178" y2="70" stroke="#0c0e18" stroke-width="1"/>' +
      '<path d="M58,66 L150,64 L156,70 L150,76 L58,74Z" fill="#e8482c"/><path d="M58,66 L150,64 L152,66 L58,68Z" fill="#fff" opacity=".5"/>' + text(64, 73.2, 'GT-07 WAYFARER', 6, '#fff') +
      '<rect x="98" y="78" width="30" height="13" fill="none" stroke="' + dd + '" stroke-width="1"/>' + hazard(98, 78, 30, 3) + '<circle cx="124" cy="86" r="1.4" fill="#14161f"/>' +
      seam(84, 48, 84, 95) + seam(140, 46, 140, 94) + seam(156, 48, 156, 92) + rivets(58, 80, 6, 6) + rivets(144, 86, 5, 6) + lights(136, 79, 5, 5, '#ffe27a') +
      dish(140, 34, 8) + lamp(112, 13, '#58ff7a') + lamp(112, 127, '#ff4a3a') + lamp(56, 30, '#ff4a3a');
  }
  return '<svg viewBox="0 0 240 140" role="img" aria-label="Ship illustration">' + defs + body + '</svg>';
};
/* the little ship pictures are drawn at double the old pixel density and shown at the same size */
UI.shipPic = function (id, hue, w, h, scale, cls) { return PX.svg(UI.shipSVG(id, hue), (w || 64) * 2, (h || 40) * 2, 'shippic ' + (cls || ''), (scale || 2) / 2, 40); };
