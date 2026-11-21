const L = require('./gtd-lib.js');
const only = process.argv[2];
(async () => {
  const t = await L.open({ width: 1920, height: 1080 }); const p = t.p;
  await p.waitForTimeout(800); await t.boot('Mabel', 'wayfarer', 1);
  for (let i = 0; i < 7; i++) {
    const id = await p.evaluate(i => { S.loc = i; S.visit.night = i % 2 === 1; ui.page = 'cantina'; render(); return GT.PLANETS[i].id; }, i);
    if (only && only.split(',').indexOf(id) < 0) continue;
    await p.waitForTimeout(700); await t.shot('bar-' + id);
  }
  console.log(t.errs.join('\n') || 'no errors'); await t.close();
})();
