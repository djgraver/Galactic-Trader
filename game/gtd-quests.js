const L = require('./gtd-lib.js');
(async () => {
  const t = await L.open({ width: 1920, height: 1080 }); const p = t.p;
  await p.waitForTimeout(800); await t.boot('Mabel', 'wayfarer', 1);
  const log = m => console.log(m);
  // jump until the story starts (turn 4)
  for (let k = 0; k < 4; k++) await p.evaluate(() => { S.ship.fuel = S.ship.fuelMax; GT.jump(S, (S.loc + 1) % 7, false, { event: null }); S.pending = null; ui.page = 'hub'; render(); settle(); });
  await p.waitForTimeout(600);
  log('prompt ' + JSON.stringify(await p.evaluate(() => ({ q: S.questPrompt, modal: !$('modal').hidden, turn: S.turn }))));
  await t.shot('q-ch1');
  await p.click('[data-act="qpick-oath"]'); await p.waitForTimeout(400); await t.shot('q-ch1-result');
  await p.click('[data-act="notice-ok"]'); await p.waitForTimeout(300);
  // to Karth-Osu
  await p.evaluate(() => { S.ship.fuel = S.ship.fuelMax; S.loc = 0; GT.jump(S, 1, false, { event: null }); S.pending = null; ui.page = 'hub'; render(); settle(); });
  await p.waitForTimeout(500); await t.shot('q-ch2');
  await p.click('[data-act="qlater"]'); await p.waitForTimeout(300); await t.shot('q-hub');
  await p.click('#bar [data-act="quests"]'); await p.waitForTimeout(300); await t.shot('q-log');
  await p.click('[data-act="qtab-guild"]'); await p.waitForTimeout(200); await t.shot('q-log-guild');
  await p.evaluate(() => { closeModal(); ui.page = 'jobs'; render(); }); await p.waitForTimeout(400);
  const n = await p.$$eval('[data-act^="qtake-"]', b => b.length); log('offers ' + n);
  if (n) await p.click('[data-act^="qtake-"]'); await p.waitForTimeout(300); await t.shot('q-jobs');
  await p.evaluate(() => { ui.page = 'ship'; render(); }); await p.waitForTimeout(500); await t.shot('q-ship');
  // abandon
  await p.click('#bar [data-act="new"]'); await p.waitForTimeout(200); await p.click('[data-act="new"][data-sure]'); await p.waitForTimeout(500); await t.shot('q-abandon');
  log('abandoned ' + JSON.stringify(await p.evaluate(() => ({ over: G.over, modal: !$('modal').hidden }))));
  await p.click('[data-act="unabandon"]'); await p.waitForTimeout(300);
  log('unabandoned ' + JSON.stringify(await p.evaluate(() => ({ over: G.over, modal: !$('modal').hidden }))));
  await p.click('#bar [data-act="new"]'); await p.waitForTimeout(200); await p.click('[data-act="new"][data-sure]'); await p.waitForTimeout(300); await p.click('.sheet [data-act="new"]'); await p.waitForTimeout(400);
  log('start screen ' + await p.evaluate(() => !$('start').hidden));
  console.log(t.errs.join('\n') || 'no errors'); await t.close();
})();
