/* Galactic Trader 7. Part 38: every shopkeeper is their own person now. Each one gets a workplace painted behind them (tinted by their world), the clothes of the job,
   a tool of the trade, and two personal marks picked from their name (a scar, freckles, an earring, a toothpick...). Captains get a cockpit and epaulettes. */
(function () {
  var O = CH.OUT;
  function rndOf(key) { return GT.seeded(CH.hash('npc7' + key)); }
  function planetCol(pid) { var p = GT.PLANETS.filter(function (x) { return x.id === pid; })[0]; return p ? p.color : '#5f82f4'; }
  var R = function (x, y, w, h, f, o) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + f + '"' + (o ? ' opacity="' + o + '"' : '') + '/>'; };
  var C = function (x, y, r, f, o) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"' + (o ? ' opacity="' + o + '"' : '') + '/>'; };

  /* ---------- workplaces. The portrait box is x -80..80, y -112..150. ---------- */
  CH.BACK = {
    bank: function (c, r) {
      var s = R(-80, -112, 160, 262, '#24303c') + R(-80, 60, 160, 90, '#18222c') + C(26, -30, 62, '#8791ae') + C(26, -30, 54, '#5a6483') + C(26, -30, 46, '#727c9a') + C(26, -30, 12, '#d8b040');
      for (var a = 0; a < 8; a++) s += '<line x1="26" y1="-30" x2="' + (26 + Math.cos(a * 0.785) * 44).toFixed(1) + '" y2="' + (-30 + Math.sin(a * 0.785) * 44).toFixed(1) + '" stroke="#3a4260" stroke-width="5"/>' + C(26 + Math.cos(a * 0.785 + 0.39) * 58, -30 + Math.sin(a * 0.785 + 0.39) * 58, 3, '#c8cede');
      for (var i = 0; i < 5; i++) s += R(-78 + i * 9, -112, 4, 172, '#b8901a');
      return s + R(-80, 56, 160, 6, '#d8b040') + R(-80, 56, 160, 2, '#fff6b0');
    },
    market: function (c, r) {
      var s = R(-80, -112, 160, 262, '#5a3a22'), cols = ['#e05a3a', '#f4d054', '#4aa8e8', '#66d070', '#e684dc', '#f8f8ff', c];
      for (var j = 0; j < 4; j++) { s += R(-80, -70 + j * 44, 160, 6, '#92602c') + R(-80, -64 + j * 44, 160, 2, '#2a1a0c'); for (var i = 0; i < 8; i++) { var h = 14 + Math.floor(r() * 16), col = cols[Math.floor(r() * cols.length)]; s += r() < 0.5 ? R(-76 + i * 20, -70 + j * 44 - h, 13, h, col) + R(-76 + i * 20, -70 + j * 44 - h, 13, 3, '#fff', 0.5) : C(-70 + i * 20, -70 + j * 44 - h / 2, h / 2, col) + R(-73 + i * 20, -73 + j * 44 - h, 6, 4, '#3a2a1a'); } }
      return s;
    },
    yard: function (c, r) {
      var s = R(-80, -112, 160, 262, '#2c3444') + R(-80, -112, 160, 14, '#5a6478'), i;
      for (i = 0; i < 6; i++) s += '<path d="M' + (-80 + i * 32) + ',-98 l16,26 l16,-26" fill="none" stroke="#5a6478" stroke-width="4"/>';
      s += R(-80, -72, 160, 5, '#5a6478') + '<line x1="-52" y1="-70" x2="-52" y2="-20" stroke="#aab4cc" stroke-width="2" stroke-dasharray="4 3"/><path d="M-58,-20 h12 v8 q0,10 -8,10 q-6,0 -6,-6" fill="none" stroke="#f4d040" stroke-width="4"/>';
      s += R(18, -52, 58, 70, '#3a4458') + '<path d="M28,-40 l6,-6 l4,4 l-4,4 l22,22 l-4,4 l-22,-22 l-4,4z" fill="#c8cede"/><rect x="60" y="-44" width="5" height="34" fill="#c25a2a"/><rect x="57" y="-48" width="11" height="8" fill="#aab4cc"/><circle cx="34" cy="2" r="8" fill="none" stroke="#c8cede" stroke-width="3"/>';
      for (i = 0; i < 5; i++) s += C(-20 + r() * 30, 20 + r() * 30, 1.6, '#ffe27a') ;
      return s + R(-80, 70, 160, 80, '#1c2230');
    },
    fuel: function (c, r) {
      var s = R(-80, -112, 160, 262, '#3a2c24') + '<rect x="-74" y="-90" width="70" height="170" rx="30" fill="#b22c30"/><rect x="-74" y="-90" width="18" height="170" rx="9" fill="#f56e5e" opacity=".6"/><rect x="-22" y="-90" width="18" height="170" rx="9" fill="#000" opacity=".3"/>';
      for (var i = 0; i < 7; i++) s += '<path d="M' + (-74 + i * 10) + ',-10 l6,-10 h6 l-6,10z" fill="#f4d040"/>';
      s += R(-74, -22, 70, 3, '#14161f') + R(-74, -10, 70, 3, '#14161f') + C(40, -50, 22, '#dfe5f2') + C(40, -50, 18, '#14161f') + '<line x1="40" y1="-50" x2="52" y2="-60" stroke="#ff5a4a" stroke-width="3"/>' + C(40, -50, 3, '#dfe5f2');
      return s + '<path d="M-4,20 h50 v-48" fill="none" stroke="#727c9a" stroke-width="8"/><path d="M-4,40 h84" fill="none" stroke="#5a6483" stroke-width="10"/>' + C(46, 20, 7, '#8791ae');
    },
    office: function (c, r) {
      var s = R(-80, -112, 160, 262, '#c8b89a') + R(-66, -96, 92, 110, '#1c2c64') + R(-66, -96, 92, 110, c, 0.35), i;
      for (i = 0; i < 6; i++) { var h = 30 + r() * 60; s += R(-64 + i * 15, 14 - h, 12, h, '#0b1240'); for (var j = 0; j < 4; j++) if (r() < 0.6) s += R(-61 + i * 15, 10 - h + j * 12 + 4, 3, 3, '#ffe27a'); }
      for (i = 0; i < 11; i++) s += R(-66, -96 + i * 10, 92, 2.5, '#f6f8ff', 0.75);
      s += '<rect x="-70" y="-100" width="100" height="118" fill="none" stroke="#7a5a34" stroke-width="6"/>' + R(40, -80, 32, 40, '#f6f8ff') + '<rect x="40" y="-80" width="32" height="40" fill="none" stroke="#b8901a" stroke-width="4"/>' + R(46, -72, 20, 2, '#727c9a') + R(46, -66, 20, 2, '#727c9a') + C(56, -52, 5, '#b22c30');
      return s + R(-80, 40, 160, 110, '#a89674');
    },
    exchange: function (c, r) {
      var s = R(-80, -112, 160, 262, '#0b1020') + R(-74, -104, 148, 96, '#05060e'), y = -40, i, pts = '';
      for (i = 0; i <= 12; i++) { y += (r() - 0.56) * 22; y = Math.max(-96, Math.min(-18, y)); pts += (i ? ' L' : 'M') + (-70 + i * 11.5) + ',' + y.toFixed(1); }
      s += '<path d="' + pts + '" fill="none" stroke="#66d070" stroke-width="3"/>';
      for (i = 0; i < 9; i++) { var up = r() < 0.5; s += R(-70 + i * 16, -4, 12, 9, up ? '#23813f' : '#b22c30') + '<path d="M' + (-66 + i * 16) + ',' + (up ? 3 : -2) + ' l2,' + (up ? -5 : 5) + ' l2,' + (up ? 5 : -5) + 'z" fill="#fff"/>'; }
      for (i = 0; i < 4; i++) s += '<line x1="-74" y1="' + (-90 + i * 22) + '" x2="74" y2="' + (-90 + i * 22) + '" stroke="#1c2c94" stroke-width="1"/>';
      return s + R(-80, 12, 160, 4, c) + R(-80, 60, 160, 90, '#161c30');
    },
    cantina: function (c, r) {
      var s = R(-80, -112, 160, 262, '#2a1830') + R(-80, -112, 160, 262, c, 0.12), cols = ['#66d070', '#f56e5e', '#f8dc60', '#74e6f2', '#e684dc', '#f6f8ff'], i, j;
      for (j = 0; j < 3; j++) { s += R(-80, -50 + j * 44, 160, 5, '#6a4a2c'); for (i = 0; i < 9; i++) { var h = 18 + Math.floor(r() * 14), col = cols[Math.floor(r() * 6)], x = -76 + i * 18; s += R(x, -50 + j * 44 - h, 9, h, col) + R(x + 3, -50 + j * 44 - h - 7, 3, 8, col) + R(x + 1, -50 + j * 44 - h + 2, 2, h - 4, '#fff', 0.5); } }
      return s + '<circle cx="42" cy="-86" r="18" fill="none" stroke="#ff6fb0" stroke-width="4"/><circle cx="42" cy="-86" r="24" fill="#ff6fb0" opacity=".25"/><path d="M34,-90 q8,-10 16,0 q-8,14 -16,0z" fill="#ff6fb0"/>' + R(-80, 84, 160, 66, '#3a2416') + R(-80, 84, 160, 4, '#92602c');
    },
    jobs: function (c, r) {
      var s = R(-80, -112, 160, 262, '#4a5470') + R(-72, -100, 144, 130, '#b8843c') + '<rect x="-72" y="-100" width="144" height="130" fill="none" stroke="#5a3a1a" stroke-width="6"/>', cols = ['#f6f8ff', '#f8dc60', '#74e6f2', '#f5a0b0', '#a8e8a0'];
      for (var i = 0; i < 9; i++) { var x = -62 + (i % 3) * 44 + r() * 8, y = -90 + Math.floor(i / 3) * 40 + r() * 6, rot = (r() - 0.5) * 16; s += '<g transform="rotate(' + rot.toFixed(1) + ' ' + (x + 15) + ' ' + (y + 14) + ')">' + R(x, y, 30, 28, cols[i % 5]) + R(x + 4, y + 8, 20, 2, '#5a6483') + R(x + 4, y + 14, 14, 2, '#5a6483') + R(x + 4, y + 20, 18, 2, '#5a6483') + C(x + 15, y + 3, 3, '#b22c30') + '</g>'; }
      return s + R(-80, 60, 160, 90, '#343c54');
    },
    parlour: function (c, r) {
      var s = R(-80, -112, 160, 262, '#1c0c2c'), i;
      for (i = 0; i < 8; i++) s += '<path d="M' + (-80 + i * 20) + ',-112 q10,130 0,262 h20 q-10,-130 0,-262z" fill="' + (i % 2 ? '#5a1c6a' : '#7a2a8c') + '"/>';
      s += '<line x1="30" y1="-112" x2="30" y2="-78" stroke="#d8b040" stroke-width="2"/><ellipse cx="30" cy="-70" rx="16" ry="9" fill="#f8dc60"/><ellipse cx="30" cy="-70" rx="34" ry="24" fill="#f8dc60" opacity=".22"/>';
      s += '<path d="M52,-50 q8,-10 14,-2 q-8,2 -8,8 q-2,-8 -6,-6z" fill="#f6f8ff"/><path d="M52,-50 q-8,-10 -14,-2 q8,2 8,8 q2,-8 6,-6z" fill="#f6f8ff"/>';
      return s + R(-80, 90, 160, 60, '#0c0618');
    },
    captain: function (c, r) {
      var s = R(-80, -112, 160, 262, '#05060e') + '<ellipse cx="0" cy="-30" rx="110" ry="90" fill="' + c + '" opacity=".16"/>', i;
      for (i = 0; i < 46; i++) s += C(-78 + r() * 156, -110 + r() * 150, r() < 0.2 ? 1.6 : 0.9, r() < 0.3 ? '#74e6f2' : '#f6f8ff');
      s += C(48, -64, 20, c) + '<path d="M30,-56 a20,20 0 0 0 36,-16 a26,22 0 0 1 -36,16z" fill="#000" opacity=".35"/><ellipse cx="48" cy="-64" rx="30" ry="6" fill="none" stroke="#f6f8ff" stroke-width="1.6" opacity=".7"/>';
      s += '<path d="M-80,-112 h160 v262 h-160z M-66,-98 h132 q8,0 8,8 v110 q0,8 -8,8 h-132 q-8,0 -8,-8 v-110 q0,-8 8,-8z" fill="#3a4260" fill-rule="evenodd"/><path d="M-66,-98 h132 q8,0 8,8 v110 q0,8 -8,8 h-132 q-8,0 -8,-8 v-110 q0,-8 8,-8z" fill="none" stroke="#8791ae" stroke-width="3"/>';
      for (i = 0; i < 6; i++) s += C(-64 + i * 26, 40, 3, ['#f56e5e', '#66d070', '#f8dc60'][i % 3]);
      return s + R(-80, 50, 160, 100, '#232a40');
    }
  };
  CH.BACK.rival = CH.BACK.captain;

  /* ---------- the clothes of the job, drawn over the plain torso ---------- */
  var sw = 'stroke="' + O + '" stroke-width="3" stroke-linejoin="round"';
  CH.WORK = {
    bank: function (t) { return '<path d="M-22,66 L-4,110 L-10,150 L-64,150 Q-64,80 -22,66Z M22,66 L4,110 L10,150 L64,150 Q64,80 22,66Z" fill="#1f2a44" ' + sw + '/><path d="M-22,66 L0,84 L22,66 L8,100 L0,92 L-8,100Z" fill="#f6f8ff" ' + sw + '/><path d="M-5,86 L5,86 L8,122 L0,134 L-8,122Z" fill="#b22c30" ' + sw + '/><path d="M26,104 h14 l-2,-7 h-10z" fill="#f8dc60"/>'; },
    market: function (t) { return '<path d="M-18,70 L-26,96 M18,70 L26,96" stroke="' + O + '" stroke-width="7"/><path d="M-18,70 L-26,96 M18,70 L26,96" stroke="#f6f0d8" stroke-width="3.5"/><path d="M-30,94 L30,94 L36,150 L-36,150Z" fill="#f6f0d8" ' + sw + '/><rect x="-14" y="112" width="28" height="18" rx="3" fill="#e0d8b8" ' + sw + ' stroke-width="2.5"/><path d="M-6,112 v-8 M2,112 v-12" stroke="#e05a3a" stroke-width="3"/>'; },
    yard: function (t) { return '<path d="M-20,70 L-22,98 M20,70 L22,98" stroke="' + O + '" stroke-width="9"/><path d="M-20,70 L-22,98 M20,70 L22,98" stroke="#3b5a9a" stroke-width="5"/><path d="M-28,96 L28,96 L34,150 L-34,150Z" fill="#3b5a9a" ' + sw + '/><circle cx="-22" cy="98" r="3.5" fill="#f8dc60"/><circle cx="22" cy="98" r="3.5" fill="#f8dc60"/><rect x="-12" y="108" width="24" height="16" fill="#2c467c" ' + sw + ' stroke-width="2.5"/><path d="M4,112 l5,-14 q5,-2 6,4 l-5,2 l-2,10z" fill="#c8cede" ' + sw + ' stroke-width="2"/><path d="M-46,112 q8,6 4,16" fill="none" stroke="#14161f" stroke-width="4" opacity=".5"/>'; },
    fuel: function (t) { return '<path d="M-40,74 L-14,68 L-6,150 L-50,150Z M40,74 L14,68 L6,150 L50,150Z" fill="#ff8a2a" ' + sw + '/><path d="M-46,112 L-8,108 L-7,120 L-48,124Z M46,112 L8,108 L7,120 L48,124Z" fill="#f6f8a0"/><path d="M-36,84 L-12,80 L-11,88 L-38,92Z M36,84 L12,80 L11,88 L38,92Z" fill="#f6f8a0"/><ellipse cx="0" cy="66" rx="20" ry="9" fill="#5a6478" ' + sw + '/><circle cx="-12" cy="68" r="6" fill="#3a4260" ' + sw + ' stroke-width="2"/><circle cx="12" cy="68" r="6" fill="#3a4260" ' + sw + ' stroke-width="2"/>'; },
    office: function (t) { return '<path d="M-22,66 L-8,104 L-14,150 L-62,150 Q-62,82 -22,66Z M22,66 L8,104 L14,150 L62,150 Q62,82 22,66Z" fill="' + CH.shade(t.shirt, -0.45) + '" ' + sw + '/><path d="M-16,70 L0,114 L16,70" fill="none" stroke="#d8483a" stroke-width="3"/><rect x="-11" y="110" width="22" height="26" rx="3" fill="#f6f8ff" ' + sw + ' stroke-width="2.5"/><rect x="-7" y="115" width="14" height="9" fill="' + t.skin + '"/><rect x="-7" y="127" width="14" height="2" fill="#5a6483"/><rect x="-7" y="131" width="9" height="2" fill="#5a6483"/>'; },
    exchange: function (t) { return '<path d="M-22,66 L-6,112 L-12,150 L-40,150 L-44,92Z M22,66 L6,112 L12,150 L40,150 L44,92Z" fill="#2a2f4a" ' + sw + '/><path d="M-30,72 L-26,150 M30,72 L26,150" stroke="#e8482c" stroke-width="5"/><path d="M-4,84 h8 v10 l-4,5 l-4,-5z" fill="#f8dc60" ' + sw + ' stroke-width="2"/><rect x="20" y="100" width="14" height="4" fill="#f6f8ff"/><rect x="22" y="92" width="3" height="10" fill="#4aa8e8"/><rect x="27" y="94" width="3" height="8" fill="#e8482c"/>'; },
    cantina: function (t) { return '<path d="M-52,150 Q-60,84 -22,66 Q0,92 22,66 Q60,84 52,150Z" fill="' + CH.shade(t.shirt, -0.35) + '" ' + sw + '/><path d="M-22,66 Q0,92 22,66 Q0,104 -22,66Z" fill="' + CH.shade(t.shirt, 0.35) + '" ' + sw + '/><circle cx="0" cy="90" r="7" fill="#f8dc60" ' + sw + ' stroke-width="2.5"/><circle cx="0" cy="90" r="3" fill="#e05a3a"/>'; },
    jobs: function (t) { return CH.WORK.fuel(t).replace(/#ff8a2a/g, '#e8e040').replace(/#f6f8a0/g, '#c8cede') + '<rect x="18" y="104" width="24" height="32" rx="2" fill="#b8843c" ' + sw + ' stroke-width="2.5"/><rect x="22" y="110" width="16" height="22" fill="#f6f8ff"/><rect x="24" y="114" width="12" height="2" fill="#5a6483"/><rect x="24" y="119" width="12" height="2" fill="#5a6483"/><rect x="24" y="124" width="8" height="2" fill="#5a6483"/><rect x="26" y="101" width="8" height="5" fill="#8791ae"/>'; },
    parlour: function (t) { return '<path d="M-22,66 L-6,116 L-12,150 L-42,150 L-46,90Z M22,66 L6,116 L12,150 L42,150 L46,90Z" fill="#14101f" ' + sw + '/><path d="M-22,66 L0,86 L22,66 L8,104 L0,94 L-8,104Z" fill="#f6f8ff" ' + sw + '/><path d="M0,74 L-16,64 L-16,84Z M0,74 L16,64 L16,84Z" fill="#b22c30" ' + sw + '/><path d="M24,104 q4,-6 8,0 q4,6 -4,12 q-8,-6 -4,-12z" fill="#e8482c"/><path d="M-32,102 l5,7 l-5,7 l-5,-7z" fill="#e8482c"/>'; },
    captain: function (t) { return '<path d="M-64,96 Q-58,76 -36,72 L-30,84 Q-50,88 -56,104Z M64,96 Q58,76 36,72 L30,84 Q50,88 56,104Z" fill="#f8dc60" ' + sw + '/><path d="M-58,92 l10,-4 M-54,98 l10,-4 M58,92 l-10,-4 M54,98 l-10,-4" stroke="#b8901a" stroke-width="2"/><path d="M26,108 l4,8 l9,1 l-7,6 l2,9 l-8,-5 l-8,5 l2,-9 l-7,-6 l9,-1z" fill="#f8dc60" ' + sw + ' stroke-width="2" transform="scale(.6) translate(36 70)"/>'; }
  };
  CH.WORK.rival = function (t) { return CH.WORK.captain(t).replace(/#f8dc60/g, '#c8cede').replace(/#b8901a/g, '#5a6483') + '<path d="M-10,96 h20 v8 l-10,12 l-10,-12z" fill="#b22c30" ' + sw + ' stroke-width="2.5"/>'; };

  /* ---------- personal marks on the face (people-shaped heads only) and a tool of the trade for the head ---------- */
  var swh = 'stroke="' + O + '" stroke-linejoin="round" stroke-linecap="round"';
  CH.MARK = {
    scar: function () { return '<path d="M22,-34 L34,10" stroke="#b22c30" stroke-width="3" fill="none" opacity=".8"/><path d="M22,-26 l8,-3 M25,-14 l8,-3 M28,-2 l8,-3" stroke="#b22c30" stroke-width="2" opacity=".8"/>'; },
    freckles: function () { var s = ''; [[-26, 10], [-20, 14], [-30, 16], [-22, 20], [22, 10], [28, 14], [20, 16], [26, 20], [0, 8]].forEach(function (p) { s += C(p[0], p[1], 1.8, '#92602c', 0.75); }); return s; },
    mole: function () { return C(20, 24, 3, '#3a2416'); },
    tattoo: function () { return '<path d="M-34,6 l4,8 l8,1 l-6,6 l2,8 l-8,-5 l-8,5 l2,-8 l-6,-6 l8,-1z" fill="#1c2c94" opacity=".75" transform="translate(-22 4) scale(.5) translate(34 -6)"/><path d="M-40,-38 q8,-8 18,-6" fill="none" stroke="#1c2c94" stroke-width="2.5" opacity=".7"/>'; },
    warpaint: function () { return '<path d="M-38,8 h18 M-36,15 h14 M20,8 h18 M22,15 h14" stroke="#e8482c" stroke-width="4" opacity=".85"/>'; },
    hoop: function () { return '<circle cx="-46" cy="12" r="7" fill="none" stroke="' + O + '" stroke-width="5"/><circle cx="-46" cy="12" r="7" fill="none" stroke="#f8dc60" stroke-width="2.5"/>'; },
    stud: function () { return C(46, 8, 4, '#74e6f2') + '<circle cx="46" cy="8" r="4" fill="none" ' + swh + ' stroke-width="2"/>' + C(-46, 8, 4, '#74e6f2') + '<circle cx="-46" cy="8" r="4" fill="none" ' + swh + ' stroke-width="2"/>'; },
    toothpick: function () { return '<path d="M12,30 L40,40" stroke="' + O + '" stroke-width="4"/><path d="M12,30 L40,40" stroke="#f6f0d8" stroke-width="2"/>'; },
    cigar: function () { return '<path d="M12,31 L38,36" stroke="' + O + '" stroke-width="9"/><path d="M12,31 L38,36" stroke="#92602c" stroke-width="5.5"/><circle cx="39" cy="36" r="3" fill="#ff8a2a"/><path d="M42,30 q6,-8 0,-14 q-6,-8 2,-14" fill="none" stroke="#c8cede" stroke-width="2.5" opacity=".6"/>'; },
    cyber: function () { return '<path d="M4,-26 h36 l4,10 v10 l-8,8 h-28 z" fill="#5a6478" ' + swh + ' stroke-width="3"/><circle cx="22" cy="-8" r="9" fill="#14161f" ' + swh + ' stroke-width="2.5"/><circle cx="22" cy="-8" r="5" fill="#ff3a2a"/><circle cx="20" cy="-10" r="1.8" fill="#fff"/><circle cx="38" cy="-20" r="1.6" fill="#c8cede"/><circle cx="10" cy="-20" r="1.6" fill="#c8cede"/>'; },
    bandage: function () { return '<path d="M-44,-30 Q0,-44 44,-30 L44,-20 Q0,-34 -44,-20Z" fill="#f6f0d8" ' + swh + ' stroke-width="3"/><path d="M-20,-34 l3,10 M4,-36 l2,10" stroke="#c8b89a" stroke-width="2"/>'; },
    blushmark: function () { return C(-26, 16, 8, '#ff6fb0', 0.5) + C(26, 16, 8, '#ff6fb0', 0.5) + '<path d="M-30,14 l8,4 M-30,19 l8,4 M22,14 l8,4 M22,19 l8,4" stroke="#e02a6a" stroke-width="1.6" opacity=".7"/>'; }
  };
  CH.MARKS = Object.keys(CH.MARK);
  CH.GEAR = {
    bank: function () { return '<path d="M-48,-22 Q0,-40 48,-22 L62,-12 Q0,-30 -62,-12Z" fill="#23813f" opacity=".85" ' + swh + ' stroke-width="3"/><path d="M-44,-24 Q0,-40 44,-24" fill="none" stroke="#14161f" stroke-width="5"/>'; },
    yard: function () { return '<path d="M-46,-30 Q0,-44 46,-30" fill="none" stroke="#3a2416" stroke-width="7"/><ellipse cx="-17" cy="-36" rx="14" ry="10" fill="#8ad8ff" opacity=".8" ' + swh + ' stroke-width="4"/><ellipse cx="17" cy="-36" rx="14" ry="10" fill="#8ad8ff" opacity=".8" ' + swh + ' stroke-width="4"/><path d="M-24,-40 l8,-3 M10,-40 l8,-3" stroke="#fff" stroke-width="2"/>'; },
    exchange: function () { return '<path d="M-46,-6 Q-52,-58 0,-60 Q52,-58 46,-6" fill="none" stroke="' + O + '" stroke-width="9"/><path d="M-46,-6 Q-52,-58 0,-60 Q52,-58 46,-6" fill="none" stroke="#5a6478" stroke-width="5"/><rect x="-56" y="-12" width="14" height="24" rx="5" fill="#2a2f4a" ' + swh + ' stroke-width="3"/><rect x="42" y="-12" width="14" height="24" rx="5" fill="#2a2f4a" ' + swh + ' stroke-width="3"/><path d="M-50,10 Q-46,38 -14,34" fill="none" stroke="' + O + '" stroke-width="5"/><circle cx="-12" cy="34" r="5" fill="#14161f" ' + swh + ' stroke-width="2"/>'; },
    market: function () { return '<path d="M40,-18 L58,-40" stroke="' + O + '" stroke-width="7"/><path d="M40,-18 L58,-40" stroke="#f8dc60" stroke-width="4"/><path d="M57,-39 l3,-4" stroke="#f5a0b0" stroke-width="4"/>'; },
    office: function () { return '<path d="M40,-16 L60,-34" stroke="' + O + '" stroke-width="6"/><path d="M40,-16 L60,-34" stroke="#4aa8e8" stroke-width="3"/>'; },
    jobs: function () { return '<path d="M30,26 q10,-4 14,4" fill="none" stroke="' + O + '" stroke-width="3"/><circle cx="46" cy="32" r="5" fill="#c8cede" ' + swh + ' stroke-width="2.5"/>'; },
    parlour: function () { return '<path d="M-30,-44 q6,-10 12,0 q6,10 -6,18 q-12,-8 -6,-18z" fill="#e8482c" ' + swh + ' stroke-width="2.5" transform="translate(52 6) scale(.6)"/>'; }
  };

  /* ---------- putting it together ---------- */
  CH.traits = function (t) {
    if (t.v7) return t.v7;
    var key = (t.name || 'x') + '|' + (t.role || 'captain'), r = rndOf(key), n = CH.MARKS.length, a = Math.floor(r() * n), b = Math.floor(r() * n);
    if (b === a) b = (a + 1 + Math.floor(r() * (n - 1))) % n;
    var marks = [CH.MARKS[a]]; if (r() < 0.7) marks.push(CH.MARKS[b]);
    /* a cigar and a toothpick do not share a mouth, and a cyber eye replaces any accessory over the eyes */
    if (marks.indexOf('cigar') >= 0 && marks.indexOf('toothpick') >= 0) marks.splice(marks.indexOf('toothpick'), 1);
    return (t.v7 = { marks: marks, seed: CH.hash(key) });
  };
  var baseHead = CH.head, baseTorso = CH.torso, basePortrait = CH.portrait;
  CH.headPlus = function (t) {
    var h = baseHead(t), sp = CH.SPECIES[t.sp], role = t.role || 'captain';
    if (sp.alien || sp.id === 'bot') return h + (CH.GEAR[role] && role === 'exchange' ? CH.GEAR.exchange() : '');
    var tr = CH.traits(t), s = '', acc = CH.ACC[t.acc];
    tr.marks.forEach(function (m) { if (m === 'cyber' && (acc === 'monocle' || acc === 'glasses' || acc === 'goggles' || acc === 'eyepatch')) return; if ((m === 'bandage') && CH.HAIRS[t.hair] !== 'bald' && CH.HAIRS[t.hair] !== 'tuft') return; if ((m === 'cigar' || m === 'toothpick') && t.gen === 'm' && CH.BEARDS[t.beard || 0] === 'beard') return; s += CH.MARK[m](); });
    var hat = CH.HAIRS[t.hair], bare = hat === 'bald' || hat === 'tuft' || hat === 'afro' || hat === 'mohawk' || hat === 'pigtails';
    if (CH.GEAR[role] && (bare || role === 'market' || role === 'office' || role === 'jobs' || role === 'parlour')) s += CH.GEAR[role]();
    return h + s;
  };
  /* a portrait with a role gets the full treatment; sprites and tiny faces keep the plain head and torso */
  CH.portrait = function (t, extra) {
    var role = t.role || (t.title ? 'captain' : null);
    if (!role || !CH.BACK[role]) return basePortrait(t, extra);
    var col = t.pid ? planetCol(t.pid) : (t.hatCol || '#5f82f4'), r = rndOf('bg' + (t.name || '') + role + (t.pid || ''));
    var tt = Object.create(t); tt.role = role;
    return '<svg class="portrait ' + (extra || '') + '" viewBox="-80 -112 160 262" role="img" aria-label="' + GT.esc(t.name || 'Character') + '">' + CH.BACK[role](col, r) +
      '<rect x="-80" y="-112" width="160" height="262" fill="#05060e" opacity=".4"/><ellipse cx="0" cy="-10" rx="70" ry="80" fill="#fff" opacity=".1"/>' +
      '<g transform="scale(' + t.size.toFixed(2) + ' ' + t.size.toFixed(2) + ')">' + baseTorso(t) + (CH.WORK[role] ? CH.WORK[role](t) : '') + CH.headPlus(tt) + '</g></svg>';
  };

  /* tell each cast member where they work */
  var baseChar = NP.char, baseWho2 = NP.who2, baseRival = NP.rival;
  NP.char = function (pid, role) { var t = baseChar(pid, role); t.role = role; t.pid = pid; return t; };
  NP.who2 = function (pid) { var t = baseWho2(pid); t.role = 'cantina'; t.pid = pid; return t; };
  NP.rival = function (ci) { var t = baseRival(ci); t.role = 'rival'; return t; };
})();
