/* Galactic Trader 7. Part 37: v7 interface parts. Ending a turn in port, the crew and their wages, the hold on the Spaceport page, "Borrow All", and the theme tune. */

/* ---------- the hold and the crew, for the Spaceport page ---------- */
var V7 = {};
V7.holdPanel = function () {
  var used = GT.cargoUsed(S), worth = Math.round(S.cargo.reduce(function (t, c) { return t + c.qty * c.avg; }, 0));
  var h = '<div class="panel holdmini"><div class="row"><h3 class="hd">Cargo hold</h3><span class="dim"><b class="num">' + used + ' / ' + S.ship.cargoMax + '</b> crates' + (used ? ' &middot; paid about ' + fmt(worth) + 'c' : ' &middot; empty') + '</span></div><div class="pocket">';
  S.cargo.forEach(function (c, i) { h += '<div class="slot ' + (c.qty ? '' : 'empty') + '" data-label="' + esc(GT.ITEMS[i].name) + (c.qty ? ': ' + c.qty + ', avg paid ' + c.avg.toFixed(1) + 'c' : ': none') + '">' + UI.itemIcon(i) + '<b class="num">' + c.qty + '</b></div>'; });
  return h + '</div></div>';
};
V7.crewLine = function () {
  var w = S.wage; if (!w) return '';
  var due = GT.wageDue(S), strike = GT.onStrike(S), left = due ? GT.wageDeadline(S) - S.turn : 0, h = '<div class="panel crew ' + (strike ? 'strike' : due ? 'due' : '') + '"><div class="row"><h3 class="hd">Crew</h3>';
  if (strike) h += '<span class="bad"><b>ON STRIKE.</b> The ship cannot leave until they are paid ' + fmt(due) + 'c.</span>';
  else if (due) h += '<span class="amber">Wages due: <b class="num">' + fmt(due) + 'c</b>. ' + (left > 0 ? 'Pay within ' + left + ' turn' + (left > 1 ? 's' : '') + ' or they strike.' : 'Last chance: they strike after this turn.') + '</span>';
  else h += '<span class="dim">The crew are ' + esc(w.mood) + '. They ask for wages every ' + GT.WAGE.MIN + ' to ' + GT.WAGE.MAX + ' turns.</span>';
  h += '</div>';
  if (due) h += '<div class="row crewacts">' + btn('Pay the crew ' + fmt(due) + 'c', 'pay-wages', GT.canPayWages(S), 'green') + (GT.canPlead(S) ? btn('Plead poverty (-5 reputation)', 'plead', true, 'gold') : strike && !GT.canPayWages(S) ? '<span class="dim">Not enough in your pocket: visit the bank or sell something.</span>' : '') + (S.turn === w.asked && !strike ? '<span class="dim">Pay today and they will be delighted (+2 reputation).</span>' : '') + '</div>';
  return h + '</div>';
};
V7.waitBtn = function () { return btn(G.multi ? 'End turn (stay here)' : 'End turn (stay in port)', 'wait', GT.canWait(S), 'blue', ' data-label="Let a day pass without flying: markets move, interest is paid, rivals trade on"'); };

function doWait() {
  var top = S.log[0], p = S; if (!GT.wait(S)) return;
  var entries = newLogs(top).filter(function (e) { return !/let a day go by|strike drags on/.test(e.text); }), body = '';
  entries.forEach(function (e) { body += '<div class="le ' + e.kind + '" style="font-size:19px;margin-top:4px">' + e.text + '</div>'; });
  SFX.play('door');
  var done = function () { afterJump(p); if (!G.multi && S && !S.over) { ui.page = 'pad'; render(); settle(); } };
  if (body) notice('<h2>A day passes on ' + esc(GT.PLANETS[p.loc].name) + '</h2>' + body, done); else { done(); if (!G.multi) toast('A day passes. Prices have moved.'); }
}
ACTX.push(function (a) {
  if (a === 'wait') { doWait(); return true; }
  if (a === 'pay-wages') { if (GT.payWages(S)) { SFX.play('coin'); toast('The crew are paid. Morale: ' + S.wage.mood + '.'); } else SFX.play('bad'); return true; }
  if (a === 'plead') { if (GT.pleadWages(S)) { SFX.play('bad'); toast('The crew go back to work, unimpressed.'); } return true; }
  if (a === 'loan-all') { var n = GT.takeLoanAll(S); if (n) { speak('bank', NP.say('bank', 'loan')); SFX.play('coin'); } return true; }
  return false;
});

/* ---------- the theme tune: "Trade Winds", an original 8-bit march. Two square voices, a triangle bass and a noise drum, all synthesised. ---------- */
var MUSIC = { on: false, timer: 0, step: 0, next: 0, gain: null, noise: null, BPM: 132 };
(function () {
  var N = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
  function hz(n) { if (!n || n === '-') return 0; var m = /^([A-G]#?)(\d)$/.exec(n); return 440 * Math.pow(2, (N[m[1]] + (+m[2] - 4) * 12 - 9) / 12); }
  /* 16 steps to the bar; '-' rests, '.' holds the note before it. Am F C G, then Am F G E. */
  var lead = [
    'A4 . C5 . E5 . A5 . G5 . E5 . C5 . E5 .', 'F4 . A4 . C5 . F5 . E5 . C5 . A4 . C5 .', 'E5 . . D5 C5 . E5 . G5 . . E5 C5 . G4 .', 'D5 . . B4 G4 . B4 . D5 . G5 . F5 . D5 .',
    'A4 . C5 . E5 . A5 . C6 . A5 . E5 . A5 .', 'F5 . . A5 C6 . A5 . F5 . . C5 A4 . C5 .', 'G5 . . B5 D6 . B5 . G5 . D5 . G5 . B5 .', 'E5 . G#5 . B5 . E6 . . . D6 . B5 . G#5 .',
    'A5 . . . E5 . . . C6 . B5 . A5 . E5 .', 'F5 . . . C5 . . . A5 . G5 . F5 . C5 .', 'G5 . . . E5 . C5 . G5 . A5 . G5 . E5 .', 'D5 . G5 . B5 . D6 . B5 . G5 . D5 . B4 .',
    'A5 . . . E5 . . . C6 . B5 . A5 . E5 .', 'F5 . . . C5 . . . A5 . C6 . A5 . F5 .', 'G5 . B5 . D6 . G6 . F6 . D6 . B5 . G5 .', 'E6 . . . . . B5 . G#5 . B5 . E6 . . .'
  ].map(function (b) { return b.split(' '); });
  var chords = [['A2', 'A3', 'C4', 'E4'], ['F2', 'F3', 'A3', 'C4'], ['C3', 'G3', 'C4', 'E4'], ['G2', 'G3', 'B3', 'D4'], ['A2', 'A3', 'C4', 'E4'], ['F2', 'F3', 'A3', 'C4'], ['G2', 'G3', 'B3', 'D4'], ['E2', 'E3', 'G#3', 'B3']];
  function voice(c, type, f, t, d, v) {
    var o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.008); g.gain.setValueAtTime(v, t + d * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(MUSIC.gain); o.start(t); o.stop(t + d + 0.02);
  }
  function drum(c, t, d, v, hp) {
    if (!MUSIC.noise) { var b = c.createBuffer(1, c.sampleRate * 0.3, c.sampleRate), ch = b.getChannelData(0); for (var i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; MUSIC.noise = b; }
    var s = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter(); s.buffer = MUSIC.noise; f.type = 'highpass'; f.frequency.value = hp;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); s.connect(f); f.connect(g); g.connect(MUSIC.gain); s.start(t); s.stop(t + d + 0.02);
  }
  function sched() {
    var c = SFX.ctx; if (!c || !MUSIC.on) return; var st = 60 / MUSIC.BPM / 4;
    while (MUSIC.next < c.currentTime + 0.25) {
      var k = MUSIC.step % 256, bar = Math.floor(k / 16), i = k % 16, t = MUSIC.next, n = lead[bar][i], ch = chords[bar % 8];
      if (n !== '.' && n !== '-') { var len = 1; while (i + len < 16 && lead[bar][i + len] === '.') len++; voice(c, 'square', hz(n), t, st * len * 0.95, 0.055); }
      if (i % 2 === 0) voice(c, 'square', hz(ch[1 + (i / 2) % 3]) * (bar >= 8 ? 2 : 1), t, st * 0.9, 0.022);       /* arpeggio */
      if (i % 4 === 0 || i === 6 || i === 14) voice(c, 'triangle', hz(ch[0]) * (i === 6 || i === 14 ? 2 : 1), t, st * (i % 4 === 0 ? 1.8 : 0.9), 0.11);   /* bass */
      if (i % 8 === 0) drum(c, t, 0.09, 0.05, 200); else if (i % 8 === 4) drum(c, t, 0.12, 0.06, 1800); else if (i % 2 === 0) drum(c, t, 0.03, 0.02, 6000);
      MUSIC.next += st; MUSIC.step++;
    }
  }
  MUSIC.start = function () {
    if (MUSIC.on || !SFX.on) return; try {
      if (!SFX.ctx) { var A = window.AudioContext || window.webkitAudioContext; if (!A) return; SFX.ctx = new A(); }
      var c = SFX.ctx; if (c.state === 'suspended') c.resume();
      MUSIC.gain = c.createGain(); MUSIC.gain.gain.value = 0.9; MUSIC.gain.connect(c.destination);
      MUSIC.on = true; MUSIC.step = 0; MUSIC.next = c.currentTime + 0.08; MUSIC.timer = setInterval(sched, 60); sched();
    } catch (e) { MUSIC.on = false; }
    MUSIC.label();
  };
  MUSIC.stop = function () {
    if (!MUSIC.on) return; MUSIC.on = false; clearInterval(MUSIC.timer);
    try { var g = MUSIC.gain, c = SFX.ctx; g.gain.setValueAtTime(g.gain.value, c.currentTime); g.gain.linearRampToValueAtTime(0.0001, c.currentTime + 0.5); setTimeout(function () { try { g.disconnect(); } catch (e) {} }, 700); } catch (e) {}
    MUSIC.label();
  };
  MUSIC.label = function () { var b = $('btnTheme'); if (b) b.textContent = MUSIC.on ? '♪ Theme: on' : '♪ Theme: off'; };
  MUSIC.onStart = function () { return !$('start').hidden; };
  /* browsers only let sound start after a click or a key, so the tune begins with the first touch of the title screen */
  ['pointerdown', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      if (MUSIC.muted || MUSIC.on || !MUSIC.onStart()) return;
      if (e.target && e.target.closest && e.target.closest('#btnTheme, [data-act="launch"]')) return;
      MUSIC.start();
    }, true);
  });
})();
