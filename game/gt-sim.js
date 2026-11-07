// Balance simulator. Usage: node gt-sim.js [seeds] [maxTurns] [parts...]
const fs = require('fs'), path = require('path');
const dir = __dirname;
const extra = process.argv.slice(5);
const files = ['gt-1-data.js', 'gt-2-market.js', 'gt-3-world.js', 'gt-3b-hooks.js', 'gt-4-social.js'].concat(extra);
const src = files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
const SEEDS = +process.argv[2] || 30, MAXT = +process.argv[3] || 220, MODE = process.argv[4] || 'smart';

function runOne(shipId, seed, mode) {
  const GT = new Function(src + '\nreturn GT;')();
  const T = process.env.TUNE ? JSON.parse(process.env.TUNE) : {};
  if (T.depth) GT.ITEMS.forEach(i => i.depth *= T.depth);
  if (T.elast) GT.CFG.ELASTICITY = T.elast;
  if (T.revert) GT.CFG.REVERT = T.revert;
  if (T.tax) GT.PLANETS.forEach(p => p.tax *= T.tax);
  if (T.cargoStep) GT.UPGRADES.cargo.step = T.cargoStep;
  if (T.upBase) Object.keys(GT.UPGRADES).forEach(k => GT.UPGRADES[k].base *= T.upBase);
  if (T.spread) GT.PLANETS.forEach(p => p.mult = p.mult.map(m => 1 + (m - 1) * T.spread));
  if (T.fuelK) GT.CFG.FUEL_K = T.fuelK;
  if (T.start) GT.CFG.START_CREDITS = T.start;
  GT.setRng(GT.seeded(seed));
  const s = GT.newState(shipId, 'Bot');
  const P = GT.PLANETS, I = GT.ITEMS;

  function sellSmart(force) {
    for (let i = 0; i < I.length; i++) {
      const c = s.cargo[i]; if (!c.qty) continue;
      let lo = 0, hi = c.qty;
      while (lo < hi) { // largest qty whose marginal unit still beats cost
        const mid = Math.ceil((lo + hi) / 2), q = GT.quoteSell(s, i, mid);
        const last = mid > 1 ? GT.quoteSell(s, i, mid).sub - GT.quoteSell(s, i, mid - 1).sub : q.sub;
        if (last * (1 - q.t.rate) > c.avg * (force ? 0.85 : 1.12)) lo = mid; else hi = mid - 1;
      }
      if (lo > 0) GT.sell(s, i, lo);
    }
  }
  function plan() {
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
  function upgrades() {
    for (const k of ['cargo', 'fuel', 'speed']) {
      while (GT.upgradeAvail(s, k) && s.credits > GT.upgradeCost(s, k) * 3 && s.credits > 7000) GT.upgrade(s, k);
    }
  }
  let turns = 0; const hist = [];
  while (!s.over && turns < MAXT) {
    turns++; hist.push(Math.round(GT.networth(s)));
    if (s.pending) GT.compAction(s, 'ignore');
    if (process.env.JOBS && GT.jobFinish && GT.jobAvailable(s)) { const w = process.env.JOBS.split(',').map(Number); let r = GT.rand() * w.reduce((x, y) => x + y, 0), k = 0; while (k < 3 && r >= w[k]) { r -= w[k]; k++; } GT.jobFinish(s, k, 100); }
    if (mode === 'idle') { GT.jump(s, (s.loc + 1) % P.length, false) || GT.tow(s); continue; }
    if (mode === 'random') {
      sellSmart(true);
      const i = GT.RI(0, I.length - 1), n = GT.maxBuy(s, i); if (n > 0) GT.buy(s, i, n);
      const d = GT.RI(0, P.length - 1);
      if (!GT.canJump(s, d)) { if (GT.canRefuel(s)) GT.refuel(s, 999); if (!GT.jump(s, d)) GT.tow(s); } else GT.jump(s, d);
      continue;
    }

    if (mode === 'oracle' || mode === 'human') {
      sellSmart(true);
      if (s.stats.jumps > 4) upgrades();
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
            const tg = s.markets[d][i].target, sellM = (mode === 'human' ? I[i].base * P[d].mult[i] * Math.max(0.5, Math.pow((tg + bi[i]) / tg, -GT.CFG.ELASTICITY)) * 0.96 : GT.priceAt(s, d, i, s.markets[d][i].stock + bi[i])) * (1 - rD);
            if (sellM - buyM > bm && buyM <= money) { bm = sellM - buyM; bk = i; bc = buyM; }
          }
          if (bk < 0 || bm <= (mode === 'human' ? 0.07 : 0.03) * bc) break;
          bi[bk]++; space--; money -= bc; profit += bm;
        }
        const score = profit - fc * (P[s.loc].fuelSold ? GT.fuelPrice(s, s.loc) : 10);
        if (!best || score > best.score) best = { d, bi, score };
      }
      if (!best || best.score <= 0) { let d = -1; for (let k = 0; k < P.length; k++) if (k !== s.loc && GT.canJump(s, k)) { d = k; break; } if (d < 0 ? !GT.tow(s) : !GT.jump(s, d)) break; continue; }
      best.bi.forEach((n, i) => { if (n > 0) GT.buy(s, i, Math.min(n, GT.maxBuy(s, i))); });
      if (!GT.jump(s, best.d)) { if (!GT.tow(s)) break; }
      continue;
    }
    sellSmart(false);
    if (s.stats.jumps > 6) upgrades();
    let plan0 = plan();
    if (GT.canRefuel(s)) { const need = Math.min(s.ship.fuelMax, (plan0 ? plan0.fc : 20) * 2 + 15) - s.ship.fuel; if (need > 0) GT.refuel(s, need); }
    plan0 = plan();
    if (!plan0 || plan0.score <= 0) { // dump everything, go somewhere
      sellSmart(true);
      let d = -1, bf = 1e9; for (let k = 0; k < P.length; k++) if (k !== s.loc && GT.canJump(s, k) && GT.jumpCost(s, k) < bf) { bf = GT.jumpCost(s, k); d = k; }
      if (d < 0) { if (!GT.tow(s)) break; } else GT.jump(s, d);
      continue;
    }
    plan0.buys.forEach(([i, n]) => { const m = Math.min(n, GT.maxBuy(s, i)); if (m > 0) GT.buy(s, i, m); });
    if (!GT.jump(s, plan0.d)) { if (!GT.tow(s)) break; }
  }
  if (process.env.TRACE) { s.log.slice().reverse().slice(0, +process.env.TRACE).forEach(l => console.log('[T' + l.turn + '] ' + l.text.replace(/<[^>]+>/g, ''))); console.log('END', s.turn, GT.networth(s), JSON.stringify(s.ship)); }
  if (process.env.NW) console.log('NW every 10 turns:', hist.filter((_, i) => i % 10 === 0).join(' '));
  return { won: !!(s.over && s.over.won), lost: !!(s.over && !s.over.won), turn: s.turn, nw: GT.networth(s), s };
}

function stats(arr) { arr.sort((a, b) => a - b); const q = p => arr[Math.min(arr.length - 1, Math.floor(p * arr.length))]; return { min: q(0), p25: q(.25), med: q(.5), p75: q(.75), max: q(1) }; }
const ships = ['wayfarer', 'barge', 'stargazer', 'cutlass'];
for (const sh of (process.env.SHIP ? [process.env.SHIP] : ships)) {
  const rs = []; for (let k = 1; k <= SEEDS; k++) rs.push(runOne(sh, k * 7919, MODE));
  const w = rs.filter(r => r.won), l = rs.filter(r => r.lost);
  const wt = stats(w.map(r => r.turn)), nw = stats(rs.map(r => Math.round(r.nw)));
  console.log(sh.padEnd(10), 'win', (w.length / rs.length * 100).toFixed(0) + '%', 'lose', (l.length / rs.length * 100).toFixed(0) + '%',
    'turnToWin med', w.length ? wt.med : '-', 'p25', w.length ? wt.p25 : '-', 'p75', w.length ? wt.p75 : '-', '| networth med', nw.med, 'p25', nw.p25, 'p75', nw.p75);
}
