const L = require('./gtd-lib.js');
const tag = process.argv[2] || 'v6';
(async () => {
  const t = await L.open({ width: 1600, height: 900 });
  const p = t.p;
  await p.waitForTimeout(1500); await t.shot(tag + '-setup');
  await t.boot('Mabel', 'wayfarer', 1);
  await p.waitForTimeout(1200); await t.shot(tag + '-hub');
  await p.evaluate(() => { ui.page = 'pad'; ui.dest = (S.loc + 2) % GT.PLANETS.length; render(); }); await p.waitForTimeout(1200); await t.shot(tag + '-pad');
  await p.evaluate(() => { ui.page = 'market'; render(); }); await p.waitForTimeout(1200); await t.shot(tag + '-market');
  await p.evaluate(() => { ui.page = 'jobs'; render(); }); await p.waitForTimeout(1200); await t.shot(tag + '-jobs');
  console.log(t.errs.join('\n') || 'no errors'); await t.close();
})();
