const L = require('./gtd-lib.js');
(async () => {
  const t = await L.open({ width: 1920, height: 1080 });
  const p = t.p;
  await t.boot('Mabel', 'cutlass', 1);
  await p.evaluate(() => { S.loc = 2; S.visit.night = false; ui.page = 'hub'; render(); }); await p.waitForTimeout(1500); await t.shot('g-ferrox');
  await p.evaluate(() => { S.loc = 6; S.visit.night = false; ui.page = 'hub'; render(); }); await p.waitForTimeout(1500); await t.shot('g-halcyra');
  await p.evaluate(() => { S.loc = 0; S.visit.night = true; ui.page = 'pad'; ui.dest = 3; render(); }); await p.waitForTimeout(1500); await t.shot('g-padnight');
  await p.evaluate(() => { ui.page = 'ship'; render(); }); await p.waitForTimeout(1500); await t.shot('g-ship');
  await p.evaluate(() => { ui.page = 'exchange'; render(); }); await p.waitForTimeout(1500); await t.shot('g-exchange');
  await p.evaluate(() => { S.ship.fuel = S.ship.fuelMax; ui.page = 'pad'; ui.dest = 3; render(); }); await p.waitForTimeout(300);
  await p.click('[data-act="jump"]'); await p.waitForTimeout(2600); await t.shot('g-flight');
  console.log(t.errs.join('\n') || 'no errors'); await t.close();
})();
