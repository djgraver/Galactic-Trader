/* Galactic Trader. Part 3: effects, jumping, bank, upgrades, win and loss. */
(function () {
  var clamp = GT.clamp, R = GT.R, fmt = GT.fmt;

  GT.luck = function (s) { return clamp(s.rep, -50, 100) / 100 * 0.5; };
  GT.addRep = function (s, d) { s.rep = clamp(s.rep + d, -100, 100); s.stats.repPeak = Math.max(s.stats.repPeak, s.rep); s.stats.repLow = Math.min(s.stats.repLow, s.rep); };

  /* Entries carry g: 1 good, -1 bad, 0 neutral. Reputation tilts the odds of good ones. */
  GT.pickEntry = function (list, s) {
    var luck = GT.luck(s), tot = 0, w = list.map(function (e) { var x = e.g > 0 ? 1 + luck : e.g < 0 ? 1 - luck : 1; tot += x; return x; });
    var r = GT.rand() * tot;
    for (var k = 0; k < list.length; k++) { r -= w[k]; if (r <= 0) return list[k]; }
    return list[list.length - 1];
  };

  /* Applies cr (money, signed multiples of the scale), fuel, lose, gain, dmg and rep. Returns {money, kind, detail}. */
  GT.applyEffect = function (s, e) {
    var S = GT.scale(s), money = 0, parts = [], k;
    if (e.cr) {
      var lo = Math.min(e.cr[0], e.cr[1]), hi = Math.max(e.cr[0], e.cr[1]);
      money = Math.round(S * R(lo, hi) / 5) * 5;
      s.credits += money;
      if (money >= 0) s.stats.eventGain += money; else s.stats.eventLoss -= money;
      parts.push('<b>' + (money >= 0 ? '+' : '-') + fmt(Math.abs(money)) + 'c</b>');
    }
    if (e.fuel) {
      var df = GT.RI(Math.min(e.fuel[0], e.fuel[1]), Math.max(e.fuel[0], e.fuel[1])), before = s.ship.fuel;
      s.ship.fuel = clamp(s.ship.fuel + df, 0, s.ship.fuelMax);
      parts.push((s.ship.fuel - before >= 0 ? '+' : '') + (s.ship.fuel - before) + ' PC fuel');
    }
    if (e.lose) {
      var used = GT.cargoUsed(s), n = used ? Math.max(1, Math.ceil(used * R(e.lose[0], e.lose[1]))) : 0, gone = {};
      for (k = 0; k < n; k++) {
        var pool = s.cargo.map(function (c, i) { return c.qty > 0 ? i : -1; }).filter(function (i) { return i >= 0; });
        if (!pool.length) break;
        var pi = 0, r = GT.rand() * s.cargo.reduce(function (a, c) { return a + c.qty; }, 0);
        for (var z = 0; z < s.cargo.length; z++) { r -= s.cargo[z].qty; if (r <= 0) { pi = z; break; } }
        s.cargo[pi].qty--; if (!s.cargo[pi].qty) s.cargo[pi].avg = 0;
        gone[pi] = (gone[pi] || 0) + 1;
      }
      var txt = Object.keys(gone).map(function (i) { return gone[i] + ' ' + GT.ITEMS[i].name; }).join(', ');
      parts.push(txt ? 'lost cargo: ' + txt : 'your hold was empty, so nothing was lost');
    }
    if (e.gain) {
      var ii = e.gain.item === 'any' ? GT.RI(0, 4) : GT.ITEMS.map(function (x) { return x.id; }).indexOf(e.gain.item);
      if (ii < 0) ii = 0;
      var want = Math.max(1, Math.round(S * R(e.gain.v[0], e.gain.v[1]) / GT.ITEMS[ii].base)), got = Math.min(want, GT.cargoFree(s));
      if (got > 0) { var c = s.cargo[ii]; c.avg = c.avg * c.qty / (c.qty + got); c.qty += got; parts.push('gained ' + got + ' ' + GT.ITEMS[ii].name + (got < want ? ' (your hold was too full for the rest)' : '')); }
      else parts.push('your hold was too full to take the ' + GT.ITEMS[ii].name);
    }
    if (e.dmg) { s.ship.damage.push({ amt: e.dmg[0], turns: e.dmg[1] }); parts.push('engine damaged: -' + e.dmg[0].toFixed(1) + ' warp for ' + e.dmg[1] + ' jumps'); }
    if (e.rep) { GT.addRep(s, e.rep); parts.push((e.rep > 0 ? '+' : '') + e.rep + ' reputation'); }
    return { money: money, kind: money > 0 ? 'gain' : money < 0 ? 'loss' : 'event', detail: parts.length ? ' <span class="fx">(' + parts.join('; ') + ')</span>' : '' };
  };

  /* ---------- travel ---------- */
  GT.dist = function (a, b) { var A = GT.PLANETS[a], B = GT.PLANETS[b]; return Math.hypot(A.x - B.x, A.y - B.y); };
  GT.jumpCost = function (s, to) { return Math.ceil(GT.dist(s.loc, to) * GT.CFG.FUEL_K / Math.sqrt(GT.effSpeed(s))); };
  GT.minJump = function (s) { var m = 1e9; GT.PLANETS.forEach(function (p, i) { if (i !== s.loc) m = Math.min(m, GT.jumpCost(s, i)); }); return m; };
  GT.stranded = function (s) { return s.ship.fuel < GT.minJump(s); };

  GT.canJump = function (s, to) { return !s.over && !s.pending && to !== s.loc && to >= 0 && s.ship.fuel >= GT.jumpCost(s, to); };

  GT.jump = function (s, to, towed, opts) {
    if (s.over || s.pending || to === s.loc) return false;
    var from = s.loc, cost = towed ? 0 : GT.jumpCost(s, to);
    if (!towed && s.ship.fuel < cost) return false;
    var A = GT.PLANETS[from], B = GT.PLANETS[to];
    s.ship.fuel -= cost; s.stats.jumps++;
    GT.log(s, (towed ? 'A tanker tug hooks onto you and drags you out of <b>' + A.name + '</b>. ' : 'Departed <b>' + A.name + '</b>, bound for ' + B.name + '. ') + (cost ? 'Burned ' + cost + ' PC of fuel.' : ''), 'info');
    if (towed) { s.credits -= GT.CFG.TOW_COST; s.stats.tows++; s.stats.eventLoss += GT.CFG.TOW_COST; GT.log(s, 'The tug crew bills you for the rescue: <b>-' + GT.CFG.TOW_COST + 'c</b>.', 'loss', -GT.CFG.TOW_COST); }
    var ev = (opts && Object.prototype.hasOwnProperty.call(opts, 'event')) ? opts.event : ((GT.rand() < GT.CFG.TRAVEL_EVENT && GT.TRAVEL) ? GT.pickEntry(GT.TRAVEL, s) : null);
    if (ev) { var fx = GT.applyEffect(s, ev); s.stats.events++; GT.log(s, (opts && opts.note ? opts.note + ' ' : '') + ev.t + fx.detail, fx.kind, fx.money); }
    s.turn++;
    s.ship.damage.forEach(function (d) { d.turns--; });
    s.ship.damage = s.ship.damage.filter(function (d) { return d.turns > 0; });
    GT.tickMarkets(s); GT.tickComps(s);
    if (s.stats.jumps % GT.CFG.INTEREST_EVERY === 0) GT.interest(s);
    s.loc = to; s.dest = null; GT.rollTrends(s);
    s.visit = { explored: false, encountered: false, offer: null, flags: {} };
    GT.log(s, 'Arrived at <b>' + B.name + '</b> (' + B.type + ').', 'info');
    s.mods.forEach(function (m) { if (m.p === to) GT.log(s, m.text, 'info'); });
    if (s.owned[to]) GT.collectFees(s, to);
    if (!s.owned[to] && GT.rand() < GT.CFG.FACILITY_OFFER) GT.makeOffer(s, to);
    var here = s.comps.filter(function (c) { return c.loc === to; });
    if (here.length && GT.rand() < GT.CFG.COMP_EVENT) { var c = GT.pick(here); s.pending = { type: 'comp', ci: s.comps.indexOf(c), mood: GT.pick(GT.MOODS) }; }
    s.stats.peak = Math.max(s.stats.peak, GT.networth(s));
    GT.checkEnd(s);
    return true;
  };

  /* Emergency tow to the nearest fuel dock. It costs a jump and a fee, so it can sink a broke player. */
  GT.towTarget = function (s) {
    var best = -1, bd = 1e9;
    GT.PLANETS.forEach(function (p, i) { if (i !== s.loc && p.fuelSold) { var d = GT.dist(s.loc, i); if (d < bd) { bd = d; best = i; } } });
    return best;
  };
  GT.tow = function (s) { if (!GT.stranded(s) || s.over || s.pending) return false; return GT.jump(s, GT.towTarget(s), true); };

  GT.interest = function (s) {
    if (s.bank > 0) { var g = Math.round(s.bank * GT.CFG.DEPOSIT_RATE); s.bank += g; s.stats.interestEarned += g; GT.log(s, 'The bank pays <b>' + (GT.CFG.DEPOSIT_RATE * 100) + '%</b> interest on your deposit: <b>+' + fmt(g) + 'c</b> added to your account.', 'gain', g); }
    if (s.loan > 0) { var l = Math.round(s.loan * GT.CFG.LOAN_RATE); s.loan += l; s.stats.interestPaid += l; GT.log(s, 'Your loan accrues <b>' + (GT.CFG.LOAN_RATE * 100) + '%</b> interest: <b>-' + fmt(l) + 'c</b> added to the debt.', 'loss', -l); }
  };

  GT.checkEnd = function (s) {
    var nw = GT.networth(s);
    if (nw >= GT.CFG.WIN) s.over = { won: true, turn: s.turn, why: 'Your fortune has reached ' + fmt(nw) + ' credits.' };
    else if (s.credits <= 0 && GT.cargoUsed(s) === 0) s.over = { won: false, turn: s.turn, why: 'You have ' + fmt(s.credits) + ' credits and an empty hold. There is nothing left to trade with.' };
    return s.over;
  };

  /* ---------- bank ---------- */
  GT.deposit = function (s, n) { n = Math.floor(n); if (n <= 0 || n > s.credits) return false; s.credits -= n; s.bank += n; GT.log(s, 'Deposited <b>' + fmt(n) + 'c</b> in the bank.', 'info'); return true; };
  GT.withdraw = function (s, n) { n = Math.floor(n); if (n <= 0 || n > s.bank) return false; s.bank -= n; s.credits += n; GT.log(s, 'Withdrew <b>' + fmt(n) + 'c</b> from the bank.', 'info'); return true; };
  GT.canLoan = function (s) { return s.loan + GT.CFG.LOAN_STEP <= GT.CFG.LOAN_CAP; };
  GT.takeLoan = function (s) { if (!GT.canLoan(s)) return false; s.loan += GT.CFG.LOAN_STEP; s.credits += GT.CFG.LOAN_STEP; GT.log(s, 'Took out a loan of <b>' + fmt(GT.CFG.LOAN_STEP) + 'c</b> at ' + (GT.CFG.LOAN_RATE * 100) + '% interest. You now owe ' + fmt(s.loan) + 'c.', 'info'); return true; };
  GT.repay = function (s, n) { n = Math.floor(Math.min(n, s.loan, s.credits)); if (n <= 0) return false; s.credits -= n; s.loan -= n; GT.log(s, 'Repaid <b>' + fmt(n) + 'c</b> of your loan. You now owe ' + fmt(s.loan) + 'c.', 'info'); return true; };

  /* ---------- upgrades ---------- */
  GT.upgradeAvail = function (s, key) { return GT.PLANETS[s.loc].upgrades.indexOf(key) >= 0 && s.ship.lv[key] < GT.CFG.UPGRADE_MAX; };
  GT.upgradeCost = function (s, key) { var u = GT.UPGRADES[key]; return Math.round(u.base * Math.pow(u.grow, s.ship.lv[key]) / 10) * 10; };
  GT.upgrade = function (s, key) {
    if (!GT.upgradeAvail(s, key)) return false;
    var cost = GT.upgradeCost(s, key), u = GT.UPGRADES[key];
    if (cost > s.credits) return false;
    s.credits -= cost; s.stats.upgradesSpent += cost; s.ship.lv[key]++;
    if (key === 'cargo') s.ship.cargoMax += u.step; else if (key === 'speed') s.ship.speed = Math.round((s.ship.speed + u.step) * 10) / 10; else s.ship.fuelMax += u.step;
    GT.log(s, 'Upgraded your <b>' + u.name + '</b> (' + u.label + ') to level ' + s.ship.lv[key] + '. <b>-' + fmt(cost) + 'c</b>.', 'loss', -cost);
    return true;
  };
})();
