// v7 feature test: end turn, crew wages and strike, borrow all, theme tune, multiplayer end turn, spaceport fit.
const L = require('./gtd-lib.js');
(async () => {
  const t = await L.open({ width: 1920, height: 1080 });
  const p = t.p, out = {};
  out.frame = await p.evaluate(() => { const r = document.getElementById('frame').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
  out.music = await p.evaluate(() => { MUSIC.start(); const on = MUSIC.on; return { on, label: document.getElementById('btnTheme').textContent }; });
  await p.waitForTimeout(600);
  out.musicSteps = await p.evaluate(() => MUSIC.step);
  await t.boot('Mabel', 'wayfarer', 1);
  out.musicAfterLaunch = await p.evaluate(() => MUSIC.on);
  // end turn
  await p.evaluate(() => { go('pad'); }); await p.waitForTimeout(200);
  out.t0 = await p.evaluate(() => S.turn);
  await p.click('[data-act="wait"]'); await p.waitForTimeout(300);
  if (await p.$('[data-act="notice-ok"]')) { await p.click('[data-act="notice-ok"]'); await p.waitForTimeout(200); }
  out.afterWait = await p.evaluate(() => ({ turn: S.turn, page: ui.page, waits: S.stats.waits, loc: S.loc }));
  // loan all
  await p.evaluate(() => { go('bank'); }); await p.waitForTimeout(200); await p.click('[data-act="loan-all"]'); await p.waitForTimeout(200);
  out.loan = await p.evaluate(() => ({ loan: S.loan, room: GT.loanRoom(S), cap: GT.CFG.LOAN_CAP }));
  // wages: force a demand, check pay on the spot
  out.wage1 = await p.evaluate(() => { S.wage.next = S.turn; GT.wageTick(S); go('pad'); return { due: GT.wageDue(S), rep: S.rep }; });
  await p.waitForTimeout(200); await p.click('[data-act="pay-wages"]'); await p.waitForTimeout(200);
  out.paid = await p.evaluate(() => ({ due: GT.wageDue(S), rep: S.rep, mood: S.wage.mood }));
  // strike: demand, ignore for 3 turns, jump must fail, then plead with empty pockets
  out.strike = await p.evaluate(() => {
    S.wage.next = S.turn; GT.wageTick(S); const due = GT.wageDue(S); GT.wait(S); GT.wait(S); const before = GT.onStrike(S); GT.wait(S);
    const strike = GT.onStrike(S), can = GT.canJump(S, (S.loc + 1) % 7), jumped = GT.jump(S, (S.loc + 1) % 7);
    S.credits = 10; S.bank = 0; S.cargo[0].qty = 3; const canPay = GT.canPayWages(S), canPlead = GT.canPlead(S); ui.dest = (S.loc + 1) % 7; render();
    return { due, before, strike, can, jumped, canPay, canPlead };
  });
  await p.waitForTimeout(300); await t.shot('v7t-strike');
  out.jumpBtnDisabled = await p.evaluate(() => document.querySelector('[data-act="jump"]').disabled);
  await p.click('[data-act="plead"]'); await p.waitForTimeout(200);
  out.plead = await p.evaluate(() => ({ strike: GT.onStrike(S), credits: S.credits, rep: S.rep, over: !!S.over, canJump: GT.canJump(S, (S.loc + 1) % 7) }));
  // spaceport fit: nothing may poke out of the stage
  out.fit = await p.evaluate(() => { S.credits = 5000; ui.dest = (S.loc + 2) % 7; go('pad'); const st = document.getElementById('stage').getBoundingClientRect(); let worst = 0; document.querySelectorAll('#stage .panel, #stage .padview, #stage .mapwrap').forEach(e => { const r = e.getBoundingClientRect(); worst = Math.max(worst, r.bottom - st.bottom); }); return Math.round(worst); });
  await p.waitForTimeout(600); await t.shot('v7t-pad');
  // alley boost and cantina rate
  out.rates = await p.evaluate(() => {
    let enc = 0, n = 400; const s = GT.newState('wayfarer', 'T'); for (let i = 0; i < n; i++) { s.visit.encountered = false; const l = s.log.length; GT.encounter(s); if (!/nowhere|never shows|busy, or hiding/.test(s.log[0].text)) enc++; }
    const g = GT.alleyBoost({ g: 1, cr: [1, 2] });
    return { encounterRate: enc / n, alley: g.cr, jobGold: GT.JOB_PAY[3], div: GT.STK.DIV };
  });
  // flight caption timing: three lines
  await p.evaluate(() => { GT.payWages(S); ui.dest = (S.loc + 2) % 7; S.ship.fuel = S.ship.fuelMax; go('pad'); }); await p.waitForTimeout(200);
  out.pre = await p.evaluate(() => ({ over: S.over, pending: S.pending, strike: GT.onStrike(S), due: GT.wageDue(S), fuel: S.ship.fuel, cost: GT.jumpCost(S, ui.dest), dest: ui.dest, loc: S.loc }));
  if (out.pre.over || out.pre.pending) { console.log(JSON.stringify(out, null, 1)); }
  await p.click('[data-act="jump"]'); await p.waitForTimeout(1200); out.cap1 = await p.evaluate(() => document.getElementById('fl-tick').textContent); await t.shot('v7t-flight');
  await p.waitForTimeout(2200); out.cap2 = await p.evaluate(() => document.getElementById('fl-tick').textContent);
  await p.waitForTimeout(3600); const nx = await p.$('[data-act="fl-next"]'); if (nx) { await nx.click(); await p.waitForTimeout(300); } await p.click('[data-act="fl-dock"]'); await p.waitForTimeout(400);
  if (await p.$('[data-act="comp-ignore"]')) { await p.click('[data-act="comp-ignore"]'); await p.waitForTimeout(300); if (await p.$('[data-act="close"]')) await p.click('[data-act="close"]'); }
  // multiplayer: end turn passes the seat
  await p.evaluate(() => { S = null; G = null; renderStart(); ui.setup.n = 2; ui.setup.p[0].name = 'Ada'; ui.setup.p[1].name = 'Bix'; startGame(); });
  await p.waitForTimeout(300); await p.click('[data-act="pass-ok"]'); await p.waitForTimeout(200);
  out.m0 = await p.evaluate(() => ({ cur: G.cur, who: S.name, round: G.round }));
  await p.evaluate(() => go('pad')); await p.waitForTimeout(200); await p.click('[data-act="wait"]'); await p.waitForTimeout(300);
  if (await p.$('[data-act="notice-ok"]')) { await p.click('[data-act="notice-ok"]'); await p.waitForTimeout(300); }
  out.m1 = await p.evaluate(() => ({ cur: G.cur, who: S.name, round: G.round, pass: !document.getElementById('pass').hidden }));
  console.log(JSON.stringify(out, null, 1)); console.log('errors:', t.errs.join('\n') || 'none'); await t.close();
})();
