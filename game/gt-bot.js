/* Heuristic trading bot used by the balance simulators. makeBot(GT) returns turn(s): one visit's worth of selling, buying and jumping. */
module.exports = function makeBot(GT) {
  const P = GT.PLANETS, I = GT.ITEMS;
  function sellSmart(s, force) {
    for (let i = 0; i < I.length; i++) {
      const c = s.cargo[i]; if (!c.qty) continue;
      let lo = 0, hi = c.qty;
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2), q = GT.quoteSell(s, i, mid);
        const last = mid > 1 ? GT.quoteSell(s, i, mid).sub - GT.quoteSell(s, i, mid - 1).sub : q.sub;
        if (last * (1 - q.t.rate) > c.avg * (force ? 0.85 : 1.12)) lo = mid; else hi = mid - 1;
      }
      if (lo > 0) GT.sell(s, i, lo);
    }
  }
  function plan(s) {
    let best = null;
    for (let d = 0; d < P.length; d++) {
      if (d === s.loc) continue;
      const fc = GT.jumpCost(s, d); if (fc > s.ship.fuelMax) continue;
      const opts = [];
      for (let i = 0; i < I.length; i++) {
        const here = GT.price(s, s.loc, i), exp = I[i].base * P[d].mult[i] * 0.95, mk = s.markets[s.loc][i];
        const cap = Math.max(1, Math.ceil(0.35 * (s.markets[d][i].target)));
        const per = exp - here * 1.08;
        if (per > here * 0.06 && mk.stock > 0) opts.push({ i, per, cap: Math.min(cap, Math.floor(mk.stock)) });
      }
      opts.sort((a, b) => b.per - a.per);
      let space = s.ship.cargoMax, money = s.credits, profit = 0; const buys = [];
      for (const o of opts) {
        const unit = GT.price(s, s.loc, o.i) * 1.05;
        const n = Math.min(o.cap, space, Math.floor(money / unit)); if (n <= 0) continue;
        buys.push([o.i, n]); space -= n; money -= n * unit; profit += n * o.per;
      }
      const score = profit - fc * (P[s.loc].fuelSold ? GT.fuelPrice(s, s.loc) : 10);
      if (!best || score > best.score) best = { d, buys, score, fc };
    }
    return best;
  }
  function upgrades(s) {
    for (const k of ['cargo', 'fuel', 'speed']) while (GT.upgradeAvail(s, k) && s.credits > GT.upgradeCost(s, k) * 3 && s.credits > 7000) GT.upgrade(s, k);
  }
  /* Returns false if the bot cannot do anything. */
  function turn(s) {
    if (s.pending) GT.compAction(s, 'ignore');
    if (s.visit.offer && s.credits > s.visit.offer.price * 1.5 && GT.rand() < 0.5) GT.buyFacility(s);
    sellSmart(s, false);
    if (s.stats.jumps > 6) upgrades(s);
    let p0 = plan(s);
    if (GT.canRefuel(s)) { const need = Math.min(s.ship.fuelMax, (p0 ? p0.fc : 20) * 2 + 15) - s.ship.fuel; if (need > 0) GT.refuel(s, need); }
    p0 = plan(s);
    if (!p0 || p0.score <= 0) {
      sellSmart(s, true);
      let d = -1, bf = 1e9; for (let k = 0; k < P.length; k++) if (k !== s.loc && GT.canJump(s, k) && GT.jumpCost(s, k) < bf) { bf = GT.jumpCost(s, k); d = k; }
      if (d < 0) return GT.tow(s); return GT.jump(s, d);
    }
    p0.buys.forEach(([i, n]) => { const m = Math.min(n, GT.maxBuy(s, i)); if (m > 0) GT.buy(s, i, m); });
    return GT.jump(s, p0.dest === undefined ? p0.d : p0.d) || GT.tow(s);
  }
  /* A competent human: sells everything, upgrades, refuels, then picks the best next stop by expected profit per jump (mode 'human' of gt-sim.js). */
  function turnHuman(s) {
    if (s.pending) GT.compAction(s, 'ignore');
    if (s.visit.offer && s.credits > s.visit.offer.price * 1.8 && GT.rand() < 0.5) GT.buyFacility(s);
    sellSmart(s, true);
    if (s.stats.jumps > 4) upgrades(s);
    if (GT.canRefuel(s) && s.credits > 400) GT.refuel(s, s.ship.fuelMax - s.ship.fuel);
    let best = null;
    for (let d = 0; d < P.length; d++) {
      if (d === s.loc) continue; const fc = GT.jumpCost(s, d); if (fc > s.ship.fuel) continue;
      const rH = GT.taxInfo(s, s.loc).rate, edge = GT.brokerEdge(s); let rD = P[d].tax * 0.9;
      const bi = I.map(() => 0); let space = GT.cargoFree(s), money = s.credits, profit = 0;
      while (space > 0) {
        let bm = -1e9, bk = -1, bc = 0;
        for (let i = 0; i < I.length; i++) {
          const mk = s.markets[s.loc][i]; if (bi[i] >= Math.floor(mk.stock)) continue;
          const buyM = GT.priceAt(s, s.loc, i, mk.stock - bi[i]) * (1 + rH) * (1 - edge);
          const tg = s.markets[d][i].target, sellM = I[i].base * P[d].mult[i] * Math.max(0.5, Math.pow((tg + bi[i]) / tg, -GT.CFG.ELASTICITY)) * 0.96 * (1 - rD);
          if (sellM - buyM > bm && buyM <= money) { bm = sellM - buyM; bk = i; bc = buyM; }
        }
        if (bk < 0 || bm <= 0.07 * bc) break;
        bi[bk]++; space--; money -= bc; profit += bm;
      }
      const score = profit - fc * (P[s.loc].fuelSold ? GT.fuelPrice(s, s.loc) : 10);
      if (!best || score > best.score) best = { d, bi, score };
    }
    if (!best || best.score <= 0) { let d = -1; for (let k = 0; k < P.length; k++) if (k !== s.loc && GT.canJump(s, k)) { d = k; break; } return d < 0 ? GT.tow(s) : GT.jump(s, d); }
    best.bi.forEach((n, i) => { if (n > 0) GT.buy(s, i, Math.min(n, GT.maxBuy(s, i))); });
    return GT.jump(s, best.d) || GT.tow(s);
  }
  return { turn, turnHuman, sellSmart, plan };
};
