const L = require('./gtd-lib.js');
(async () => {
  const t = await L.open({ width: 1600, height: 900 });
  const p = t.p;
  await p.evaluate(() => { ui.setup.n = 3; ui.setup.p[0].name = 'Mabel'; ui.setup.p[1].name = 'Orion'; ui.setup.p[2].name = 'Bartholomew'; render(); });
  await p.waitForTimeout(1500); await t.shot('v5-setup');
  await t.boot('Mabel', 'wayfarer', 1);
  await p.evaluate(() => { ui.page = 'pad'; ui.dest = (S.loc + 2) % GT.PLANETS.length; render(); }); await p.waitForTimeout(1200); await t.shot('v5-pad');
  const fit = await p.evaluate(() => { const r = document.querySelector('.portR'); const f = document.querySelector('.pad-pages'); return { portR: r && [r.scrollHeight, r.clientHeight], pad: f && [f.scrollHeight, f.clientHeight], desc: (document.querySelector('.tdesc') || {}).textContent }; });
  console.log(JSON.stringify(fit));
  await p.evaluate(() => { ui.page = 'jobs'; render(); }); await p.waitForTimeout(1200); await t.shot('v5-jobs');
  await p.evaluate(() => { ui.page = 'hub'; render(); }); await p.waitForTimeout(1200); await t.shot('v5-hub');
  console.log(t.errs.join('\n') || 'no errors'); await t.close();
})();
