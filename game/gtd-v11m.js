const L = require('./gtd-lib.js');
(async () => {
  const t = await L.open({ width: 400, height: 860 }); const p = t.p;
  await p.waitForTimeout(500); await t.boot('Mabel', 'wayfarer', 1); await p.waitForTimeout(400); await t.shot('v11m-hub');
  const over = await p.evaluate(() => { const b = document.querySelector('#bar'); return [b.scrollWidth, b.clientWidth, [...document.querySelectorAll('#bar .ib')].map(x => Math.round(x.getBoundingClientRect().right)).join(',')]; });
  console.log('bar', over);
  await p.click('[data-act="planets"]'); await p.waitForTimeout(300); await t.shot('v11m-planets');
  await p.keyboard.press('Escape'); await p.click('[data-act="ship"]'); await p.waitForTimeout(300); await t.shot('v11m-ship');
  console.log(t.errs.join('\n') || 'no errors'); await t.close();
})();
