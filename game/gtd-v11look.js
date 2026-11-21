const L = require('./gtd-lib.js');
(async () => {
  const t = await L.open({ width: 1920, height: 1080 }); const p = t.p;
  await p.waitForTimeout(500); await t.boot('Mabel', 'wayfarer', 1); await p.waitForTimeout(300);
  await p.evaluate(() => { S.loc = GT.PLANETS.findIndex(x => x.id === 'ferrox'); ui.page = 'hub'; render(); }); await p.waitForTimeout(1500); await t.shot('v11-ferrox');
  await p.evaluate(() => { S.visit.explored = true; S.visit.smuggle = GT.smuggleMake(S); ui.page = 'alley'; render(); }); await p.waitForTimeout(500); await t.shot('v11-alley');
  await p.evaluate(() => { S.visit.smuggle = null; S.visit.explored = false; ui.page = 'alley'; render(); document.querySelector('[data-act=explore]').click(); }); await p.waitForTimeout(500); await t.shot('v11-alleyx');
  console.log(t.errs.join('\n') || 'no errors'); await t.close();
})();
