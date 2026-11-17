/* Galactic Trader 8. Part 42: the nav display (star map as a vector tactical screen with shaded planets), smooth mini-game output, and the new theme tune. */

/* ---------- star map: a targeting-computer view ---------- */
UI.mapSVG = function (s, dest) {
  var P = GT.PLANETS, rnd = GT.seeded(77), k, W = UI.MW, H = UI.MH, h = '', defs = '<defs><filter id="mglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter>', hit = '';
  h += '<rect width="' + W + '" height="' + H + '" fill="#03050c"/><ellipse cx="200" cy="40" rx="120" ry="70" fill="#3a2a8c" opacity=".35" filter="url(#mglow)"/><ellipse cx="60" cy="130" rx="100" ry="50" fill="#14607c" opacity=".3" filter="url(#mglow)"/><ellipse cx="150" cy="90" rx="70" ry="30" fill="#7a2a6c" opacity=".16" filter="url(#mglow)"/>';
  for (k = 0; k < 170; k++) { var sx = rnd() * W, sy = rnd() * H, sr = rnd(); h += '<circle cx="' + sx.toFixed(1) + '" cy="' + sy.toFixed(1) + '" r="' + (sr < 0.08 ? 0.7 : 0.35) + '" fill="' + (sr < 0.3 ? '#9fe0ff' : sr < 0.4 ? '#ffe0a0' : '#ffffff') + '" opacity="' + (0.35 + rnd() * 0.6).toFixed(2) + '"/>'; }
  for (k = 1; k < 7; k++) h += '<line x1="' + k * 40 + '" y1="0" x2="' + k * 40 + '" y2="' + H + '" stroke="#6fe3ff" stroke-width=".25" opacity=".22"/>';
  for (k = 1; k < 4; k++) h += '<line x1="0" y1="' + k * 40 + '" x2="' + W + '" y2="' + k * 40 + '" stroke="#6fe3ff" stroke-width=".25" opacity=".22"/>';
  var a = P[s.loc], ax = UI.mapSX(a.x), ay = UI.mapSY(a.y);
  [30, 60, 90].forEach(function (r) { h += '<circle cx="' + ax + '" cy="' + ay + '" r="' + r + '" fill="none" stroke="#6fe3ff" stroke-width=".3" stroke-dasharray="1.5 2.5" opacity=".3"/>'; });
  if (dest !== null && dest !== s.loc) { var b = P[dest], bx = UI.mapSX(b.x), by = UI.mapSY(b.y); h += '<line x1="' + ax + '" y1="' + ay + '" x2="' + bx + '" y2="' + by + '" stroke="#ffc24a" stroke-width="2.4" opacity=".25" filter="url(#mglow)"/><line class="route" x1="' + ax + '" y1="' + ay + '" x2="' + bx + '" y2="' + by + '" stroke="#ffc24a" stroke-width=".9" stroke-dasharray="4 3"/>'; }
  P.forEach(function (p, i) {
    var x = UI.mapSX(p.x), y = UI.mapSY(p.y), here = i === s.loc, sel = i === dest, r = here ? 9 : 6.5, id = 'mp' + i, pr = GT.seeded(CH.hash(p.id)), col = p.color || '#5f82f4', q;
    defs += '<radialGradient id="' + id + '" cx=".34" cy=".3" r=".8"><stop offset="0" stop-color="' + UI.shade(col, 0.75) + '"/><stop offset=".35" stop-color="' + col + '"/><stop offset=".75" stop-color="' + UI.shade(col, -0.6) + '"/><stop offset="1" stop-color="#02030a"/></radialGradient><clipPath id="' + id + 'c"><circle cx="' + x + '" cy="' + y + '" r="' + r + '"/></clipPath>';
    h += '<circle cx="' + x + '" cy="' + y + '" r="' + (r + 3) + '" fill="' + col + '" opacity=".35" filter="url(#mglow)"/>';
    if (p.ring) h += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (r * 1.9) + '" ry="' + (r * 0.5) + '" fill="none" stroke="' + UI.shade(col, 0.5) + '" stroke-width="1.4" opacity=".55"/>';
    h += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + col + '"/><g clip-path="url(#' + id + 'c)">';
    for (q = 0; q < 5; q++) h += '<ellipse cx="' + (x - r + pr() * r * 2).toFixed(1) + '" cy="' + (y - r + pr() * r * 2).toFixed(1) + '" rx="' + (r * (0.5 + pr())).toFixed(1) + '" ry="' + (r * (0.12 + pr() * 0.2)).toFixed(1) + '" fill="' + (pr() < 0.5 ? UI.shade(col, 0.5) : UI.shade(col, -0.4)) + '" opacity=".55"/>';
    h += '</g><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#' + id + ')" style="mix-blend-mode:multiply" opacity=".9"/><circle cx="' + (x - r * 0.35) + '" cy="' + (y - r * 0.38) + '" r="' + (r * 0.3) + '" fill="#fff" opacity=".35" filter="url(#mglow)"/>';
    if (p.ring) h += '<path d="M' + (x - r * 1.9) + ',' + y + ' A' + (r * 1.9) + ',' + (r * 0.5) + ' 0 0 0 ' + (x + r * 1.9) + ',' + y + '" fill="none" stroke="' + UI.shade(col, 0.6) + '" stroke-width="1.4" opacity=".9"/>';
    if (here || sel) { var c = here ? '#6fe3ff' : '#ffc24a', d = r + 4, e = 3; h += '<g class="' + (sel ? 'lock' : 'herebox') + '" stroke="' + c + '" stroke-width=".9" fill="none"><path d="M' + (x - d) + ',' + (y - d + e) + ' v-' + e + ' h' + e + ' M' + (x + d - e) + ',' + (y - d) + ' h' + e + ' v' + e + ' M' + (x + d) + ',' + (y + d - e) + ' v' + e + ' h-' + e + ' M' + (x - d + e) + ',' + (y + d) + ' h-' + e + ' v-' + e + '"/></g>'; }
    var nm = p.name.toUpperCase(), ty = y + r + (here || sel ? 11 : 8.5), tx = Math.max(nm.length * 2.1 + 2, Math.min(W - nm.length * 2.1 - 2, x)); if (ty > H - 5) ty = y - r - (here || sel ? 7 : 4);
    h += '<text x="' + tx + '" y="' + ty + '" text-anchor="middle" font-family="Orbitron, sans-serif" font-weight="700" font-size="5.4" letter-spacing=".4" fill="' + (here ? '#6fe3ff' : sel ? '#ffc24a' : '#c8d6ee') + '" stroke="#03050c" stroke-width="1.6" paint-order="stroke">' + GT.esc(nm) + '</text>';
    s.comps.forEach(function (cp, ci) { if (cp.loc === i) { var dx = x + r + 3 + ci * 5.5, dy = y - r - 2; h += '<path d="M' + dx + ',' + (dy - 2.6) + ' l2.6,2.6 l-2.6,2.6 l-2.6,-2.6z" fill="#ff5a4a" stroke="#03050c" stroke-width=".5"/>'; } });
    if (s.game && s.game.multi) s.game.players.forEach(function (pl) { if (pl !== s && pl.loc === i && !(pl.over && !pl.over.won)) { var dx = x - r - 6 - pl.seat * 5, dy = y - r - 4; h += '<rect x="' + dx + '" y="' + dy + '" width="4" height="4" fill="' + (PX.PAL[ui.SEATCOL[pl.seat]] || '#fff') + '" stroke="#03050c" stroke-width=".5"/>'; } });
    hit += '<g class="pl" data-i="' + i + '" tabindex="0" role="button" aria-label="' + GT.esc(p.name) + (here ? ', current location' : sel ? ', selected destination' : '') + '" data-label="' + GT.esc(p.name + ': ' + p.type) + '"><circle cx="' + x + '" cy="' + y + '" r="14" fill="transparent"/></g>';
  });
  h += '<text x="4" y="8" font-family="Orbitron, sans-serif" font-size="4.2" font-weight="700" fill="#6fe3ff" opacity=".8" letter-spacing=".5">NAV · SECTOR 7</text><text x="' + (W - 4) + '" y="' + (H - 4) + '" text-anchor="end" font-family="Orbitron, sans-serif" font-size="3.6" fill="#6fe3ff" opacity=".6">RANGE RINGS 10 PC</text>';
  return '<svg class="mapimg navmap" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' + defs + '</defs>' + h + '</svg><svg class="ov" viewBox="0 0 ' + W + ' ' + H + '" role="group" aria-label="Star map">' + hit + '</svg>';
};

/* ---------- mini-games and the warp: full colour, no palette step ---------- */
PX.snap = function () {};
MG.ega = function () {};   /* the games draw straight to the screen at full resolution; no 320 x 200 step */

/* ---------- the theme tune: "Deep Lanes". A late-90s tracker-style piece: filtered saw pads and lead, an octave bass, an arpeggio through an echo, and a drum machine. All synthesised. ---------- */
(function () {
  var N = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, Bb: 10, B: 11 };
  function hz(n) { var m = /^([A-G](?:#|b)?)(\d)$/.exec(n); return 440 * Math.pow(2, (N[m[1]] + (+m[2] - 4) * 12 - 9) / 12); }
  var A = [
    'D5 . . . F5 . . A5 . . . . G5 . F5 .', 'E5 . . . D5 . . . . . . . A4 . D5 .', 'F5 . . . G5 . . A5 . . . . Bb5 . A5 .', 'G5 . . . F5 . . . . . . . D5 . F5 .',
    'E5 . . . G5 . . C6 . . . . A5 . G5 .', 'E5 . . . . . G5 . E5 . . . C5 . E5 .', 'A5 . . . G5 . . E5 . . . . C5 . E5 .', 'A4 . . . . . . . C5 . E5 . A5 . . .'
  ], Bm = [
    'D6 . . A5 . . F5 . D6 . . A5 . . F5 .', 'E6 . . D6 . . A5 . F5 . . . A5 . D6 .', 'D6 . . Bb5 . . F5 . D6 . . Bb5 . . F5 .', 'F6 . . D6 . . Bb5 . G5 . . . Bb5 . D6 .',
    'E6 . . C6 . . G5 . E6 . . C6 . . G5 .', 'G6 . . E6 . . C6 . G5 . . . C6 . E6 .', 'E6 . . C6 . . A5 . E6 . . C6 . . A5 .', 'A5 . C6 . E6 . A6 . . . . . . . . .'
  ], sp = function (b) { return b.split(' '); };
  A = A.map(sp); Bm = Bm.map(sp);
  var CH = [['D2', 'D4', 'F4', 'A4'], ['Bb1', 'D4', 'F4', 'Bb4'], ['C2', 'E4', 'G4', 'C5'], ['A1', 'E4', 'A4', 'C5']];
  /* 40 bars: 4 of pad and arpeggio, 4 adding bass and drums, tune A twice over 16, tune B over 8... then a short break of 8 back to pad, bass and arpeggio */
  var BARS = 40, BPM = 124, st = 60 / BPM / 4;
  function env(g, t, a, d, v) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.setValueAtTime(v, t + Math.max(a, d * 0.6)); g.gain.exponentialRampToValueAtTime(0.0001, t + d); }
  function saw(c, out, f, t, d, v, cut, a, type) {
    var g = c.createGain(), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 3; lp.frequency.setValueAtTime(cut * 2.2, t); lp.frequency.exponentialRampToValueAtTime(cut, t + Math.min(d, 0.25));
    [-7, 7].forEach(function (dt) { var o = c.createOscillator(); o.type = type || 'sawtooth'; o.frequency.setValueAtTime(f, t); o.detune.value = dt; o.connect(lp); o.start(t); o.stop(t + d + 0.05); });
    env(g, t, a || 0.01, d, v); lp.connect(g); g.connect(out);
  }
  function noise(c, out, t, d, v, type, fq) {
    if (!MUSIC.noise) { var b = c.createBuffer(1, c.sampleRate * 0.4, c.sampleRate), ch = b.getChannelData(0); for (var i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; MUSIC.noise = b; }
    var s = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter(); s.buffer = MUSIC.noise; f.type = type; f.frequency.value = fq; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); s.connect(f); f.connect(g); g.connect(out); s.start(t); s.stop(t + d + 0.02);
  }
  function kick(c, out, t) { var o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(44, t + 0.12); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.25); }
  function sched() {
    var c = SFX.ctx; if (!c || !MUSIC.on) return; var dry = MUSIC.gain, wet = MUSIC.send;
    while (MUSIC.next < c.currentTime + 0.3) {
      var k = MUSIC.step % (BARS * 16), bar = Math.floor(k / 16), i = k % 16, t = MUSIC.next, ch = CH[Math.floor(bar / 2) % 4], full = bar >= 4 && bar < 32, tuneA = bar >= 8 && bar < 24, tuneB = bar >= 24 && bar < 32, brk = bar >= 32;
      if (i === 0 && bar % 2 === 0) [1, 2, 3].forEach(function (q) { saw(c, dry, hz(ch[q]), t, st * 33, 0.016, 700 + (full ? 500 : 0), 0.35); });
      var an = ch[1 + [0, 1, 2, 1][i % 4]]; if (i % 2 === 0 || full) saw(c, wet, hz(an) * (i % 8 >= 4 ? 2 : 1), t, st * 0.9, full ? 0.012 : 0.02, 2400, 0.004, 'square');
      if (bar >= 4) { if (i % 2 === 0) saw(c, dry, hz(ch[0]) * (i % 4 === 2 ? 2 : 1), t, st * 1.7, 0.085, 420, 0.005); }
      if (full) { if (i % 4 === 0) kick(c, dry, t); if (i % 8 === 4) { noise(c, dry, t, 0.14, 0.12, 'bandpass', 1900); } noise(c, dry, t, i % 4 === 2 ? 0.1 : 0.03, i % 4 === 2 ? 0.035 : 0.018, 'highpass', 7500); if (bar % 8 === 7 && i >= 12) noise(c, dry, t, 0.08, 0.1, 'bandpass', 1400 + i * 120); }
      else if (brk && i % 4 === 0 && bar >= 36) kick(c, dry, t);
      var row = tuneA ? A[(bar - 8) % 8] : tuneB ? Bm[bar - 24] : null;
      if (row) { var n = row[i]; if (n !== '.' && n !== '-') { var len = 1; while (i + len < 16 && row[i + len] === '.') len++; saw(c, wet, hz(n), t, st * len * 0.96 + 0.05, tuneB ? 0.05 : 0.044, tuneB ? 3200 : 2300, 0.012); if (bar >= 16) saw(c, dry, hz(n) / 2, t, st * len * 0.9, 0.018, 1500, 0.012, 'square'); } }
      MUSIC.next += st; MUSIC.step++;
    }
  }
  MUSIC.start = function () {
    if (MUSIC.on || !SFX.on) return; try {
      if (!SFX.ctx) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; SFX.ctx = new AC(); }
      var c = SFX.ctx; if (c.state === 'suspended') c.resume();
      var master = c.createGain(); master.gain.value = 0.9; var comp = c.createDynamicsCompressor(); master.connect(comp); comp.connect(c.destination);
      var send = c.createGain(), dl = c.createDelay(1), fb = c.createGain(), wetg = c.createGain(); dl.delayTime.value = st * 3; fb.gain.value = 0.36; wetg.gain.value = 0.3; send.connect(master); send.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wetg); wetg.connect(master);
      MUSIC.gain = master; MUSIC.send = send; MUSIC.on = true; MUSIC.step = 0; MUSIC.next = c.currentTime + 0.1; MUSIC.timer = setInterval(sched, 70); sched();
    } catch (e) { MUSIC.on = false; }
    MUSIC.label();
  };
  MUSIC.TITLE = 'Deep Lanes';
})();
