/* Galactic Trader. Part 3b: hooks the adventure UI uses (mini-game scaled events, haggling, engine repair). */
(function () {
  var clamp = GT.clamp;
  GT.rollTravelEvent = function (s) { return (GT.rand() < GT.CFG.TRAVEL_EVENT && GT.TRAVEL) ? GT.pickEntry(GT.TRAVEL, s) : null; };
  /* k scales an event's effects. Below 0.18 the bad parts vanish entirely ("you dodged it"). */
  GT.scaleEntry = function (e, k) {
    var c = {}, key; for (key in e) c[key] = e[key];
    var tiny = k < 0.18;
    if (e.cr) c.cr = [e.cr[0] * k, e.cr[1] * k];
    if (e.fuel) c.fuel = tiny && e.fuel[1] < 0 ? null : [Math.round(e.fuel[0] * k), Math.round(e.fuel[1] * k)];
    if (e.lose) c.lose = tiny ? null : [e.lose[0] * k, e.lose[1] * k];
    if (e.gain) c.gain = { item: e.gain.item, v: [e.gain.v[0] * k, e.gain.v[1] * k] };
    if (e.dmg) { var a = Math.round(e.dmg[0] * k * 10) / 10; if (a >= 0.1 && !tiny) c.dmg = [a, e.dmg[1]]; else c.dmg = null; }
    ['fuel', 'lose', 'dmg'].forEach(function (q) { if (c[q] === null) delete c[q]; });
    return c;
  };
  /* Performance 0..1 to an effect multiplier. Bad events shrink with skill, good ones grow. */
  GT.perfScale = function (e, perf) { return e.g < 0 ? clamp(1.3 - 1.15 * perf, 0.12, 1.3) : clamp(0.35 + perf, 0.35, 1.35); };
  GT.HAGGLE_MAX = 0.02;
  GT.setHaggle = function (s, perf) { s.visit.haggle = Math.round(GT.HAGGLE_MAX * clamp(perf, 0, 1) * 1000) / 1000; return s.visit.haggle; };
  GT.repairEngine = function (s, frac) {
    frac = clamp(frac, 0, 1); var before = s.ship.damage.reduce(function (a, d) { return a + d.amt; }, 0);
    s.ship.damage.forEach(function (d) { d.amt *= (1 - frac); });
    s.ship.damage = s.ship.damage.filter(function (d) { return d.amt >= 0.05; });
    var after = s.ship.damage.reduce(function (a, d) { return a + d.amt; }, 0);
    GT.log(s, 'Engine repairs: ' + (after < 0.05 ? 'the warp drive is <b>fully repaired</b>.' : 'damage cut from -' + before.toFixed(1) + ' to -' + after.toFixed(1) + ' warp.'), 'event');
    return before - after;
  };
})();
