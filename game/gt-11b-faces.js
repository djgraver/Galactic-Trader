/* Galactic Trader. Part 11b: faces (v5). Masculine and feminine faces for the people-shaped species, and five proper aliens.
   Portraits are shrunk to about 48 pixels wide and snapped to the EGA palette, so every feature is drawn bold: thick brows, big lashes, solid lips, chunky jaws. */
CH.JAW = {
  m: ['M-44,-28 Q-46,-52 0,-52 Q46,-52 44,-28 L45,14 Q44,36 30,46 Q16,52 0,52 Q-16,52 -30,46 Q-44,36 -45,14Z',
      'M-40,-34 Q-42,-54 0,-54 Q42,-54 40,-34 L42,16 Q40,40 22,52 L0,57 L-22,52 Q-40,40 -42,16Z',
      'M-46,-20 Q-48,-52 0,-52 Q48,-52 46,-20 Q50,30 24,48 Q0,54 -24,48 Q-50,30 -46,-20Z'],
  f: ['M-40,-30 Q-42,-52 0,-52 Q42,-52 40,-30 Q40,16 26,38 Q14,52 0,52 Q-14,52 -26,38 Q-40,16 -40,-30Z',
      'M-44,-28 Q-46,-52 0,-52 Q46,-52 44,-28 Q42,12 20,40 Q8,53 0,53 Q-8,53 -20,40 Q-42,12 -44,-28Z',
      'M-43,-26 Q-45,-52 0,-52 Q45,-52 43,-26 Q47,30 20,46 Q0,52 -20,46 Q-47,30 -43,-26Z']
};

/* hair that falls behind the head */
CH.hairBack = function (hat, hc, hat2, sw) {
  var f = function (d) { return '<path d="' + d + '" fill="' + hc + '" ' + sw + '/>'; };
  if (hat === 'long') return f('M-54,-8 Q-64,52 -46,100 L-20,102 L-20,58 L20,58 L20,102 L46,100 Q64,52 54,-8 Q46,-62 0,-62 Q-46,-62 -54,-8Z');
  if (hat === 'bob') return f('M-52,-14 Q-60,36 -46,50 L-28,46 L28,46 L46,50 Q60,36 52,-14 Q44,-62 0,-62 Q-44,-62 -52,-14Z');
  if (hat === 'ponytail') return f('M24,-48 Q80,-64 70,2 Q66,34 50,42 Q58,6 44,-14Z') + '<circle cx="32" cy="-44" r="7" fill="' + hat2 + '" ' + sw + ' stroke-width="3"/>';
  return '';
};

/* hair and hats that sit on top */
CH.hairTop = function (t, hat, hc, sw, a) {
  var O = CH.OUT, skin = t.skin, top = '', f = function (d) { return '<path d="' + d + '" fill="' + hc + '" ' + sw + '/>'; };
  var fringe = f('M-46,-16 Q-48,-60 0,-60 Q48,-60 46,-16 Q38,-36 14,-44 Q-14,-30 -46,-16Z');
  if (hat === 'tuft') top = f('M-6,-50 Q-18,-76 -4,-70 Q0,-86 10,-70 Q24,-78 10,-50Z');
  else if (hat === 'afro') top = '<circle cx="0" cy="-40" r="46" fill="' + hc + '" ' + sw + '/><ellipse cx="0" cy="-30" rx="40" ry="22" fill="' + skin + '"/>' + '<path d="M-42,-24 Q0,-10 42,-24" fill="none" stroke="' + O + '" stroke-width="3"/>';
  else if (hat === 'mohawk') top = f('M-10,-48 L-14,-80 L-4,-62 L2,-90 L10,-62 L18,-82 L14,-48Z');
  else if (hat === 'pigtails') top = f('M-40,-30 Q0,-64 40,-30 Q0,-48 -40,-30Z') + '<circle cx="-54" cy="-18" r="14" fill="' + hc + '" ' + sw + '/><circle cx="54" cy="-18" r="14" fill="' + hc + '" ' + sw + '/>';
  else if (hat === 'bowler') top = '<ellipse cx="0" cy="-42" rx="50" ry="9" fill="#2a2038" ' + sw + '/><path d="M-30,-44 Q-30,-84 0,-84 Q30,-84 30,-44Z" fill="#2a2038" ' + sw + '/><rect x="-30" y="-56" width="60" height="9" fill="' + t.hatCol + '"/>';
  else if (hat === 'tophat') top = '<ellipse cx="0" cy="-44" rx="50" ry="9" fill="#2a2038" ' + sw + '/><rect x="-28" y="-100" width="56" height="58" rx="4" fill="#2a2038" ' + sw + '/><rect x="-28" y="-62" width="56" height="12" fill="' + t.hatCol + '"/>';
  else if (hat === 'cap') top = '<path d="M-44,-34 Q-40,-78 0,-78 Q40,-78 44,-34Z" fill="' + t.hatCol + '" ' + sw + '/><path d="M-4,-38 Q40,-34 62,-26 Q40,-44 -4,-48Z" fill="' + t.hatCol + '" ' + sw + '/>';
  else if (hat === 'captain') top = '<path d="M-48,-36 Q-40,-86 0,-84 Q40,-86 48,-36 Q0,-26 -48,-36Z" fill="#f4f1ff" ' + sw + '/><path d="M-50,-34 Q0,-20 50,-34 L48,-42 Q0,-30 -48,-42Z" fill="#1d3a8a" ' + sw + ' stroke-width="3"/><circle cx="0" cy="-60" r="9" fill="#ffc531" ' + sw + ' stroke-width="3"/>';
  else if (hat === 'propeller') top = '<path d="M-36,-36 Q0,-82 36,-36Z" fill="' + t.hatCol + '" ' + sw + '/><line x1="0" y1="-64" x2="0" y2="-78" ' + sw + '/><path d="M-26,-82 Q0,-92 26,-82 Q0,-76 -26,-82Z" fill="#ffc531" ' + sw + ' stroke-width="3"/>';
  else if (hat === 'wizard') top = '<ellipse cx="0" cy="-42" rx="50" ry="9" fill="#5a3bb0" ' + sw + '/><path d="M-32,-44 L8,-110 Q18,-90 32,-44Z" fill="#5a3bb0" ' + sw + '/><circle cx="2" cy="-72" r="5" fill="#ffe14a"/><circle cx="12" cy="-58" r="3.5" fill="#ffe14a"/>';
  /* v5 hair */
  else if (hat === 'long') top = fringe;
  else if (hat === 'bob') top = f('M-47,-16 Q-48,-60 0,-60 Q48,-60 47,-16 L34,-34 Q16,-26 0,-34 Q-16,-26 -34,-34Z');
  else if (hat === 'bun') top = '<circle cx="0" cy="-68" r="16" fill="' + hc + '" ' + sw + '/>' + f('M-45,-18 Q-47,-58 0,-58 Q47,-58 45,-18 Q30,-34 8,-40 Q-18,-34 -45,-18Z');
  else if (hat === 'ponytail') top = fringe;
  else if (hat === 'curls') top = [[-40, -32, 15], [-24, -48, 16], [0, -56, 16], [24, -48, 16], [40, -32, 15], [-50, -10, 11], [50, -10, 11]].map(function (c) { return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="' + hc + '" ' + sw + '/>'; }).join('');
  else if (hat === 'swept') top = f('M-46,-18 Q-56,-64 -8,-70 Q42,-82 50,-30 Q40,-52 14,-48 Q-12,-46 -46,-18Z') + '<path d="M-20,-62 Q0,-72 22,-64" fill="none" stroke="' + CH.shade(hc, 0.3) + '" stroke-width="4" stroke-linecap="round"/>';
  else if (hat === 'crew') top = f('M-46,-20 Q-48,-58 0,-58 Q48,-58 46,-20 Q36,-42 0,-44 Q-36,-42 -46,-20Z') + '<path d="M-46,-20 L-43,0 L-37,0 L-38,-24Z M46,-20 L43,0 L37,0 L38,-24Z" fill="' + hc + '" ' + sw + ' stroke-width="3"/>';
  else if (hat === 'slick') top = f('M-47,-20 Q-50,-60 0,-60 Q50,-60 47,-20 Q36,-46 6,-48 Q-24,-46 -47,-20Z') + '<path d="M-14,-58 Q-8,-52 -14,-46" fill="none" stroke="' + O + '" stroke-width="3.5" stroke-linecap="round"/>';
  else if (hat === 'shaggy') top = f('M-48,-12 L-52,-44 L-38,-36 L-34,-64 L-22,-46 L-12,-72 L0,-48 L12,-70 L20,-46 L34,-64 L38,-36 L52,-44 L48,-12 Q36,-40 0,-42 Q-36,-40 -48,-12Z');
  if (a === 'goggles') top += '<rect x="-40" y="-52" width="80" height="12" rx="6" fill="#6a4a2a" ' + sw + ' stroke-width="3"/><circle cx="-18" cy="-46" r="11" fill="#9fe6ff" ' + sw + ' stroke-width="3"/><circle cx="18" cy="-46" r="11" fill="#9fe6ff" ' + sw + ' stroke-width="3"/>';
  return top;
};

/* the five aliens: each returns { back, shape, face } */
CH.alien = function (t, sp, sw) {
  var O = CH.OUT, skin = t.skin, sk2 = t.skin2, hc = t.hairCol, px = t.pupil[0], py = t.pupil[1], k = sp.alien, back = '', shape = '', face = '';
  var white = function (x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff" ' + sw + ' stroke-width="3.5"/>'; };
  if (k === 'squid') {
    [-30, -10, 10, 30].forEach(function (x, i) {
      var s = i % 2 ? 1 : -1, d = 'M' + x + ',22 Q' + (x + s * 16) + ',46 ' + (x - s * 4) + ',62 Q' + (x - s * 10) + ',70 ' + (x - s * 2) + ',74';
      back += '<path d="' + d + '" fill="none" stroke="' + O + '" stroke-width="18" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="' + skin + '" stroke-width="11" stroke-linecap="round"/><circle cx="' + (x + s * 5) + '" cy="44" r="2.6" fill="' + sk2 + '"/>';
    });
    shape = '<path d="M-44,20 Q-54,-58 0,-64 Q54,-58 44,20 Q30,36 0,36 Q-30,36 -44,20Z" fill="' + skin + '" ' + sw + '/><circle cx="-18" cy="-44" r="5" fill="' + sk2 + '"/><circle cx="14" cy="-50" r="6" fill="' + sk2 + '"/><circle cx="30" cy="-32" r="4" fill="' + sk2 + '"/>';
    var se = function (x) { return white(x, -8, 13) + '<rect x="' + (x - 9 + px * 0.5) + '" y="' + (-11 + py * 0.4) + '" width="18" height="6" rx="3" fill="' + O + '"/>'; };
    face = t.eyes === 3 ? white(0, -8, 22) + '<rect x="' + (-14 + px) + '" y="-11" width="28" height="7" rx="3.5" fill="' + O + '"/>' : se(-25) + se(25) + (t.eyes === 2 ? white(0, -34, 8) + '<circle cx="' + px * 0.4 + '" cy="-34" r="3.2" fill="' + O + '"/>' : '');
    face += t.eyes === 1 ? '<path d="M-40,-14 L-10,-14 M10,-14 L40,-14" stroke="' + O + '" stroke-width="5" stroke-linecap="round"/>' : '';
    face += '<path d="M-10,20 L0,32 L10,20Z" fill="#ffc531" ' + sw + ' stroke-width="3"/>';
  } else if (k === 'gray') {
    shape = '<path d="M-52,-14 Q-58,-60 0,-62 Q58,-60 52,-14 Q44,30 12,50 Q0,56 -12,50 Q-44,30 -52,-14Z" fill="' + skin + '" ' + sw + '/><path d="M-30,-48 Q0,-60 30,-48" fill="none" stroke="' + CH.shade(skin, 0.3) + '" stroke-width="4" stroke-linecap="round"/>';
    var ge = function (s) { return t.eyes === 1 ? '<ellipse cx="' + (s * 24) + '" cy="-8" rx="17" ry="20" fill="#15101f" ' + sw + ' stroke-width="3.5"/><circle cx="' + (s * 24 - 5) + '" cy="-15" r="4" fill="#fff"/>' : '<path d="M' + (s * 46) + ',-22 Q' + (s * 30) + ',-34 ' + (s * 6) + ',-4 Q' + (s * 26) + ',12 ' + (s * 46) + ',-22Z" fill="#15101f" ' + sw + ' stroke-width="3.5"/><circle cx="' + (s * 28 + s * px * 0.3) + '" cy="-14" r="' + (t.eyes === 2 ? 5 : 3.6) + '" fill="' + (t.eyes === 2 ? '#ff3d4f' : '#fff') + '"/>'; };
    face = ge(-1) + ge(1) + '<circle cx="-3.5" cy="14" r="2.6" fill="' + O + '"/><circle cx="3.5" cy="14" r="2.6" fill="' + O + '"/>' + (t.mouth % 2 ? '<ellipse cx="0" cy="34" rx="5" ry="4" fill="#3a1a2a" ' + sw + ' stroke-width="3"/>' : '<path d="M-10,33 Q0,37 10,33" fill="none" ' + sw + ' stroke-width="3.5"/>');
  } else if (k === 'cyclops') {
    back = '<path d="M-26,-44 L-38,-76 L-12,-52Z M26,-44 L38,-76 L12,-52Z" fill="#f4e8c8" ' + sw + '/>';
    shape = '<path d="M-47,-18 Q-50,-54 0,-56 Q50,-54 47,-18 Q52,30 30,46 Q0,58 -30,46 Q-52,30 -47,-18Z" fill="' + skin + '" ' + sw + '/>';
    var iris = ['#3aa7ff', '#58ff9a', '#ffc531', '#ff3d8b'][t.nose % 4];
    face = white(0, -8, 25) + '<circle cx="' + px + '" cy="' + (-8 + py * 0.5) + '" r="14" fill="' + iris + '" ' + sw + ' stroke-width="3"/><circle cx="' + (px + 1) + '" cy="' + (-8 + py * 0.5) + '" r="6.5" fill="' + O + '"/><circle cx="' + (px + 5) + '" cy="' + (-13 + py * 0.5) + '" r="2.6" fill="#fff"/>' +
      '<path d="M-36,-34 Q0,-48 36,-34" fill="none" stroke="' + O + '" stroke-width="11" stroke-linecap="round"/><path d="M-36,-34 Q0,-48 36,-34" fill="none" stroke="' + CH.shade(hc, -0.1) + '" stroke-width="7" stroke-linecap="round"/>' +
      '<ellipse cx="0" cy="22" rx="12" ry="7" fill="' + sk2 + '" ' + sw + ' stroke-width="3"/><circle cx="-4" cy="22" r="2.2" fill="' + O + '"/><circle cx="4" cy="22" r="2.2" fill="' + O + '"/>' +
      '<path d="M-24,34 Q0,52 24,34 Q0,40 -24,34Z" fill="#5a1a2a" ' + sw + ' stroke-width="3.5"/><path d="M-17,38 L-13,26 L-8,40Z M8,40 L13,26 L17,38Z" fill="#fff" ' + sw + ' stroke-width="2.5"/>';
  } else if (k === 'mantis') {
    back = '<path d="M-14,-44 Q-26,-84 -48,-88 M14,-44 Q26,-84 48,-88" fill="none" ' + sw + ' stroke-width="4"/><circle cx="-48" cy="-89" r="5" fill="#ffe14a" ' + sw + ' stroke-width="3"/><circle cx="48" cy="-89" r="5" fill="#ffe14a" ' + sw + ' stroke-width="3"/>';
    shape = '<path d="M-48,-34 Q0,-76 48,-34 Q44,8 12,48 Q0,58 -12,48 Q-44,8 -48,-34Z" fill="' + skin + '" ' + sw + '/>';
    var me = function (s) { return '<ellipse cx="' + (s * 28) + '" cy="-14" rx="18" ry="25" transform="rotate(' + (s * 16) + ' ' + (s * 28) + ' -14)" fill="#15281c" ' + sw + ' stroke-width="3.5"/><circle cx="' + (s * 28 - 6) + '" cy="-24" r="4.2" fill="#9fe6ff"/><circle cx="' + (s * 28 + 5) + '" cy="-8" r="3" fill="#58ff9a"/>'; };
    face = me(-1) + me(1) + '<circle cx="0" cy="-34" r="4" fill="#15281c"/><path d="M-3,10 L-3,18 M3,10 L3,18" stroke="' + O + '" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path d="M-12,34 Q-26,46 -10,58 Q-12,46 -4,38Z M12,34 Q26,46 10,58 Q12,46 4,38Z" fill="' + sk2 + '" ' + sw + ' stroke-width="3.5"/>' + (t.mouth % 2 ? '<path d="M-6,38 L6,38" stroke="' + O + '" stroke-width="3.5"/>' : '');
  } else {
    shape = '<path d="M-44,-40 L-20,-54 L22,-50 L46,-36 L51,0 L43,40 L12,53 L-30,49 L-48,22 L-51,-14Z" fill="' + skin + '" ' + sw + '/><path d="M-40,-34 Q-30,-58 -8,-50 Q-18,-40 -28,-36Z" fill="#4aa83a" ' + sw + ' stroke-width="3"/><path d="M22,-50 L14,-34 L24,-24 M-44,8 L-32,16 L-38,30" fill="none" stroke="' + O + '" stroke-width="3.5" stroke-linejoin="round"/>';
    var gl = '#ffb02a', ex = px * 0.5;
    face = t.eyes === 2 ? '<rect x="-36" y="-22" width="72" height="16" rx="3" fill="#1a1410" ' + sw + ' stroke-width="3"/><rect x="' + (-30 + ex) + '" y="-18" width="60" height="8" fill="' + gl + '"/>' :
      t.eyes === 1 ? '<circle cx="-20" cy="-10" r="13" fill="#1a1410" ' + sw + ' stroke-width="3"/><circle cx="20" cy="-10" r="13" fill="#1a1410" ' + sw + ' stroke-width="3"/><circle cx="' + (-20 + ex) + '" cy="-10" r="6.5" fill="' + gl + '"/><circle cx="' + (20 + ex) + '" cy="-10" r="6.5" fill="' + gl + '"/>' :
      '<rect x="-34" y="-22" width="24" height="18" fill="#1a1410" ' + sw + ' stroke-width="3"/><rect x="10" y="' + (t.eyes === 3 ? -18 : -22) + '" width="24" height="' + (t.eyes === 3 ? 12 : 18) + '" fill="#1a1410" ' + sw + ' stroke-width="3"/><rect x="' + (-28 + ex) + '" y="-18" width="12" height="10" fill="' + gl + '"/><rect x="' + (16 + ex) + '" y="' + (t.eyes === 3 ? -15 : -18) + '" width="12" height="' + (t.eyes === 3 ? 6 : 10) + '" fill="' + gl + '"/>';
    face += '<path d="M0,-2 L-9,18 L9,18Z" fill="' + sk2 + '" ' + sw + ' stroke-width="3"/><path d="M-22,34 L-13,26 L-4,36 L5,26 L14,36 L22,28" fill="none" stroke="' + O + '" stroke-width="4.5" stroke-linejoin="round"/>';
  }
  return { back: back, shape: shape, face: face };
};

CH.head = function (t) {
  var sp = CH.SPECIES[t.sp], O = CH.OUT, sw = 'stroke="' + O + '" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"', h = '', back = '', gen = t.gen || 'n';
  var skin = t.skin, sk2 = t.skin2, hc = t.hairCol, hat = CH.HAIRS[t.hair], bot = sp.id === 'bot', al = sp.alien, M = gen === 'm', F = gen === 'f';
  var brow = CH.shade(hc, -0.15), a = CH.ACC[t.acc], px = t.pupil[0], py = t.pupil[1];
  /* ---- the alien path ---- */
  if (al) {
    var A = CH.alien(t, sp, sw), top0 = CH.hairTop(t, hat, hc, sw, a);
    var neck0 = al === 'gray' ? '<rect x="-8" y="40" width="16" height="30" rx="4" fill="' + sk2 + '" ' + sw + '/>' : al === 'mantis' ? '<rect x="-10" y="40" width="20" height="30" rx="4" fill="' + sk2 + '" ' + sw + '/>' : al === 'cyclops' ? '<rect x="-18" y="38" width="36" height="32" rx="8" fill="' + sk2 + '" ' + sw + '/>' : '';
    var acc0 = '';
    if (a === 'monocle') acc0 = '<circle cx="18" cy="-8" r="16" fill="rgba(180,230,255,.35)" ' + sw + ' stroke="#d8a21a" stroke-width="3.5"/>';
    if (a === 'eyepatch') acc0 = '<ellipse cx="-20" cy="-8" rx="17" ry="14" fill="#15101f" ' + sw + ' stroke-width="3"/>';
    if (a === 'glasses') acc0 = '<rect x="-36" y="-22" width="30" height="26" rx="8" fill="rgba(180,230,255,.3)" ' + sw + ' stroke-width="3.5"/><rect x="6" y="-22" width="30" height="26" rx="8" fill="rgba(180,230,255,.3)" ' + sw + ' stroke-width="3.5"/>';
    if (a === 'bandaid') acc0 = '<rect x="14" y="14" width="22" height="9" rx="4" transform="rotate(-24 25 18)" fill="#ffd6a5" ' + sw + ' stroke-width="2.5"/>';
    return neck0 + A.back + A.shape + A.face + acc0 + top0;
  }
  /* ---- species extras that sit behind the head ---- */
  if (sp.stalk) h += '<path d="M0,-44 Q-6,-72 10,-84" fill="none" ' + sw + ' stroke-width="9"/><path d="M0,-44 Q-6,-72 10,-84" fill="none" stroke="' + skin + '" stroke-width="4" stroke-linecap="round"/><circle cx="10" cy="-88" r="11" fill="#fff" ' + sw + '/><circle cx="12" cy="-87" r="4.5" fill="' + O + '"/>';
  if (sp.antennae) h += '<path d="M-14,-46 Q-24,-78 -36,-84 M14,-46 Q24,-78 36,-84" fill="none" ' + sw + '/><circle cx="-36" cy="-85" r="6" fill="#ffe14a" ' + sw + '/><circle cx="36" cy="-85" r="6" fill="#ffe14a" ' + sw + '/>';
  if (sp.fuzz) h += '<path d="M-10,-46 Q-30,-82 -50,-66 Q-36,-62 -34,-46Z M10,-46 Q30,-82 50,-66 Q36,-62 34,-46Z" fill="#fff8e0" ' + sw + '/>';
  if (sp.crest) h += '<path d="M-22,-42 L-14,-70 L-6,-46 L2,-74 L10,-46 L20,-68 L24,-40Z" fill="#e0572b" ' + sw + '/>';
  if (bot) h += '<line x1="0" y1="-46" x2="0" y2="-72" ' + sw + '/><circle cx="0" cy="-76" r="6" fill="#ff5a4f" ' + sw + '/>';
  if (!bot && !sp.stalk) { var nw = M ? 17 : F ? 11 : 13; h += '<rect x="' + -nw + '" y="36" width="' + nw * 2 + '" height="34" rx="6" fill="' + sk2 + '" ' + sw + '/>'; }
  h += CH.hairBack(hat, hc, t.hatCol, sw);
  if (sp.id === 'human') h += '<circle cx="-44" cy="0" r="9" fill="' + skin + '" ' + sw + ' stroke-width="3.5"/><circle cx="44" cy="0" r="9" fill="' + skin + '" ' + sw + ' stroke-width="3.5"/>';
  /* ---- the head itself ---- */
  var jaw = gen === 'n' ? null : CH.JAW[gen][t.fshape % 3], skinFill = 'fill="' + skin + '" ' + sw;
  var shape = { human: jaw ? '<path d="' + jaw + '" ' + skinFill + '/>' : '<ellipse cx="0" cy="0" rx="46" ry="50" ' + skinFill + '/>', ellipse: '<ellipse cx="0" cy="0" rx="46" ry="50" ' + skinFill + '/>', pear: '<path d="M-36,-30 Q-38,-52 0,-52 Q38,-52 36,-30 Q58,30 0,52 Q-58,30 -36,-30Z" ' + skinFill + '/>', blob: '<path d="M-48,2 Q-54,-46 0,-50 Q54,-46 48,2 Q52,48 0,50 Q-52,48 -48,2Z" ' + skinFill + '/>', box: '<rect x="-44" y="-46" width="88" height="94" rx="14" ' + skinFill + '/>' }[sp.head];
  if (!jaw && sp.id === 'human') shape = '<ellipse cx="0" cy="0" rx="46" ry="50" ' + skinFill + '/>';
  /* masculine and feminine versions of the round-ish species get a stronger or softer jaw on top of their own shape */
  h += shape;
  if (M && sp.id !== 'human' && !bot) h += '<path d="M-38,22 Q-30,46 -10,50 M38,22 Q30,46 10,50" fill="none" stroke="' + sk2 + '" stroke-width="4" stroke-linecap="round"/>';
  if (sp.fuzz) h += '<path d="M-46,10 Q-60,24 -42,36 M46,10 Q60,24 42,36" fill="none" stroke="#fff8e0" stroke-width="9" stroke-linecap="round"/>';
  if (bot) h += '<circle cx="-36" cy="-36" r="3" fill="' + sk2 + '"/><circle cx="36" cy="-36" r="3" fill="' + sk2 + '"/><circle cx="-36" cy="40" r="3" fill="' + sk2 + '"/><circle cx="36" cy="40" r="3" fill="' + sk2 + '"/>';
  /* stubble and beards sit under the features */
  var bd = CH.BEARDS[t.beard || 0];
  if (M && bd === 'stubble') h += '<path d="M-42,10 Q-40,50 0,52 Q40,50 42,10 Q30,34 0,36 Q-30,34 -42,10Z" fill="' + CH.shade(skin, -0.3) + '"/>';
  if (M && bd === 'beard') h += '<path d="M-45,8 Q-48,58 0,62 Q48,58 45,8 Q36,24 22,24 Q0,34 -22,24 Q-36,24 -45,8Z" fill="' + hc + '" ' + sw + '/>';
  if (M && bd === 'goatee') h += '<path d="M-12,34 Q0,30 12,34 L10,54 Q0,62 -10,54Z" fill="' + hc + '" ' + sw + '/>';
  /* eyes */
  var er = F ? 14 : M ? 12 : 13, eyes = '';
  var eye = function (x, y, r, big) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff" ' + sw + ' stroke-width="3.5"/>' + (sp.id === 'lizard' ? '<ellipse cx="' + (x + px * 0.4) + '" cy="' + y + '" rx="2.6" ry="' + (r * 0.7) + '" fill="' + O + '"/>' : '<circle cx="' + (x + px) + '" cy="' + (y + py) + '" r="' + (big ? 6.5 : 5) + '" fill="' + O + '"/><circle cx="' + (x + px + 1.8) + '" cy="' + (y + py - 2) + '" r="1.6" fill="#fff"/>'); };
  if (bot) eyes = '<rect x="-30" y="-20" width="24" height="18" rx="4" fill="#0e2a1a" ' + sw + ' stroke-width="3"/><rect x="6" y="-20" width="24" height="18" rx="4" fill="#0e2a1a" ' + sw + ' stroke-width="3"/><circle cx="' + (-18 + px) + '" cy="-11" r="4" fill="#58ff9a"/><circle cx="' + (18 + px) + '" cy="-11" r="4" fill="#58ff9a"/>';
  else if (t.eyes === 2) eyes = eye(0, -8, 20, true);
  else if (t.eyes === 3) eyes = eye(-18, -8, er + 2, true) + eye(18, -6, 10, false);
  else if (t.eyes === 1) eyes = eye(-18, -8, er) + eye(18, -8, er) + '<path d="M-33,-10 Q-18,-26 -3,-10Z M3,-10 Q18,-26 33,-10Z" fill="' + sk2 + '" ' + sw + ' stroke-width="3"/>';
  else eyes = eye(-18, -8, er) + eye(18, -8, er);
  h += eyes;
  /* brows, lashes and blush: the quickest way to read a face as masculine or feminine at 48 pixels */
  if (M && !bot) {
    var bl = [['M-35,-28 L-7,-26', 'M7,-26 L35,-28'], ['M-35,-33 L-7,-23', 'M7,-23 L35,-33'], ['M-35,-24 L-7,-31', 'M7,-31 L35,-24']][t.brow % 3];
    if (t.eyes === 2) bl = ['M-26,-36 L-2,-34', 'M2,-34 L26,-36'];
    h += '<path d="' + bl[0] + ' ' + bl[1] + '" fill="none" stroke="' + O + '" stroke-width="16" stroke-linecap="round"/><path d="' + bl[0] + ' ' + bl[1] + '" fill="none" stroke="' + brow + '" stroke-width="10" stroke-linecap="round"/>';
    h += '<path d="M-42,12 Q-38,40 -22,48 M42,12 Q38,40 22,48" fill="none" stroke="' + sk2 + '" stroke-width="5" stroke-linecap="round"/>';
  }
  if (F && !bot) {
    var one = t.eyes === 2, xs = one ? [0] : [-18, 18], ys = one ? -8 : (t.eyes === 3 ? -8 : -8), rr = one ? 20 : er + (t.eyes === 3 ? 2 : 0), ls = '', lin = '', br = '';
    xs.forEach(function (ex, i) {
      var s = ex < 0 ? -1 : 1, rx = one ? 0 : ex, r0 = i === 0 && t.eyes === 3 ? er + 2 : (t.eyes === 3 && i === 1 ? 10 : rr);
      var cy = (t.eyes === 3 && i === 1) ? -6 : -8;
      if (one) { [-1, 1].forEach(function (q) { ls += 'M' + (q * 19) + ',' + (cy - 6) + ' L' + (q * 30) + ',' + (cy - 16) + ' M' + (q * 20) + ',' + (cy) + ' L' + (q * 33) + ',' + (cy - 4) + ' '; }); }
      else ls += 'M' + (rx + s * (r0 - 1)) + ',' + (cy - 6) + ' L' + (rx + s * (r0 + 9)) + ',' + (cy - 16) + ' M' + (rx + s * r0) + ',' + (cy) + ' L' + (rx + s * (r0 + 11)) + ',' + (cy - 4) + ' ';
      lin += 'M' + (rx - r0) + ',' + cy + ' Q' + rx + ',' + (cy - r0 * 1.75) + ' ' + (rx + r0) + ',' + cy + ' ';
      br += 'M' + (rx - r0 + 1) + ',' + (cy - r0 - 7) + ' Q' + rx + ',' + (cy - r0 - 16) + ' ' + (rx + r0 - 1) + ',' + (cy - r0 - 5) + ' ';
    });
    h += '<path d="' + lin + '" fill="none" stroke="' + O + '" stroke-width="5" stroke-linecap="round"/><path d="' + ls + '" fill="none" stroke="' + O + '" stroke-width="4.5" stroke-linecap="round"/><path d="' + br + '" fill="none" stroke="' + brow + '" stroke-width="5" stroke-linecap="round"/>';
    h += '<ellipse cx="-30" cy="16" rx="9" ry="6" fill="#ff8ab0"/><ellipse cx="30" cy="16" rx="9" ry="6" fill="#ff8ab0"/>';
  }
  /* nose */
  var nz = F ? [0, 2, 2, 0][t.nose] : t.nose;
  h += ['<circle cx="0" cy="8" r="8" fill="' + sk2 + '" ' + sw + ' stroke-width="3"/>', '<path d="M-3,-2 Q14,14 -2,22 Q-10,20 -8,14Z" fill="' + sk2 + '" ' + sw + ' stroke-width="3"/>', '<ellipse cx="0" cy="10" rx="4.5" ry="3.5" fill="' + sk2 + '" ' + sw + ' stroke-width="3"/>', '<ellipse cx="0" cy="12" rx="13" ry="9" fill="' + sk2 + '" ' + sw + ' stroke-width="3"/><circle cx="-4" cy="12" r="2" fill="' + O + '"/><circle cx="4" cy="12" r="2" fill="' + O + '"/>'][nz];
  /* mouth */
  var lip = t.lip || '#ff3d6e', lp = function (d, fill) { return '<path d="' + d + '" fill="' + fill + '" stroke="' + lip + '" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="' + O + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>'; };
  var mm = F ? [
    lp('M-17,27 Q0,46 17,27 Q0,22 -17,27Z', '#fff'),
    lp('M-15,32 Q0,22 15,32', 'none'),
    '<ellipse cx="0" cy="32" rx="12" ry="10" fill="' + lip + '" ' + sw + ' stroke-width="3.5"/><ellipse cx="0" cy="32" rx="5" ry="4.5" fill="#5a1a2a"/>',
    lp('M-14,30 Q0,40 14,28', 'none'),
    lp('M-14,30 Q0,36 14,30 Q0,24 -14,30Z', lip)
  ][t.mouth] : [
    '<path d="M-20,26 Q0,46 20,26Z" fill="#fff" ' + sw + ' stroke-width="3.5"/><path d="M-12,30 L12,30" stroke="' + O + '" stroke-width="2"/>',
    '<path d="M-15,34 Q0,22 15,34" fill="none" ' + sw + '/>',
    '<ellipse cx="0" cy="32" rx="11" ry="9" fill="#5a1a2a" ' + sw + ' stroke-width="3.5"/><ellipse cx="0" cy="36" rx="6" ry="3.5" fill="#ff7a8a"/>',
    '<path d="M-14,28 Q0,38 14,28" fill="none" ' + sw + '/><rect x="-6" y="28" width="6" height="9" rx="1.5" fill="#fff" ' + sw + ' stroke-width="2.5"/><rect x="0" y="28" width="6" height="9" rx="1.5" fill="#fff" ' + sw + ' stroke-width="2.5"/>',
    M ? '<path d="M-12,32 L12,30" fill="none" ' + sw + ' stroke-width="4"/>' : '<path d="M-14,28 Q0,40 14,28" fill="none" ' + sw + '/><path d="M-26,24 Q-12,16 0,24 Q12,16 26,24 Q14,34 0,28 Q-14,34 -26,24Z" fill="' + hc + '" ' + sw + ' stroke-width="3"/>'
  ][t.mouth];
  h += mm;
  if (M && (bd === 'mustache' || bd === 'goatee' || bd === 'beard')) h += '<path d="M-24,24 Q-12,14 0,21 Q12,14 24,24 Q12,30 0,25 Q-12,30 -24,24Z" fill="' + hc + '" ' + sw + ' stroke-width="3.5"/>';
  if (F && t.ring) h += '<circle cx="-46" cy="14" r="6" fill="#ffd23d" ' + sw + ' stroke-width="3"/><circle cx="46" cy="14" r="6" fill="#ffd23d" ' + sw + ' stroke-width="3"/>';
  /* accessory on the face */
  if (a === 'monocle') h += '<circle cx="18" cy="-8" r="16" fill="rgba(180,230,255,.35)" ' + sw + ' stroke="#d8a21a" stroke-width="3.5"/><path d="M30,0 Q40,30 30,56" fill="none" stroke="#d8a21a" stroke-width="2"/>';
  if (a === 'eyepatch') h += '<path d="M-46,-18 L30,-26" stroke="' + O + '" stroke-width="4"/><ellipse cx="-18" cy="-8" rx="17" ry="14" fill="#15101f" ' + sw + ' stroke-width="3"/>';
  if (a === 'glasses') h += '<rect x="-36" y="-22" width="30" height="26" rx="8" fill="rgba(180,230,255,.3)" ' + sw + ' stroke-width="3.5"/><rect x="6" y="-22" width="30" height="26" rx="8" fill="rgba(180,230,255,.3)" ' + sw + ' stroke-width="3.5"/><line x1="-6" y1="-10" x2="6" y2="-10" stroke="' + O + '" stroke-width="3.5"/>';
  if (a === 'bandaid') h += '<rect x="14" y="14" width="22" height="9" rx="4" transform="rotate(-24 25 18)" fill="#ffd6a5" ' + sw + ' stroke-width="2.5"/>';
  return h + CH.hairTop(t, hat, hc, sw, a);
};
