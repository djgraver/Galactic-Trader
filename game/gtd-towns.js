const L = require('./gtd-lib.js');
const only = process.argv[2];
(async () => {
  const t = await L.open({ width: 1920, height: 1080 });
  const p = t.p; await p.waitForTimeout(1200);
  await t.boot('Mabel', 'wayfarer', 1);
  const n = await p.evaluate(() => GT.PLANETS.length);
  for (let i = 0; i < n; i++) for (const night of [false, true]) {
    const id = await p.evaluate(([i, night]) => { S.loc = i; S.visit.night = night; ui.px = null; ui.page = 'hub'; render(); return GT.PLANETS[i].id; }, [i, night]);
    if (only && only.split(',').indexOf(id + (night ? 'n' : '')) < 0) continue;
    await p.waitForTimeout(900); await t.shot('town-' + id + (night ? '-n' : ''));
  }
  console.log(t.errs.join('\n') || 'no errors'); await t.close();
})();
