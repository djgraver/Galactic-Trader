const L = require('./gtd-lib.js');
(async () => {
  const t = await L.open({ width: 1920, height: 1080 }); const p = t.p, errs = t.errs;
  await p.waitForTimeout(600); await t.boot('Mabel', 'wayfarer', 1); await p.waitForTimeout(600); await t.shot('v11-hub');
  await p.click('[data-act="ship"]'); await p.waitForTimeout(700); await t.shot('v11-ship');
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  await p.evaluate(() => { ui.page = 'market'; render(); });
  await p.click('[data-act="planets"]'); await p.waitForTimeout(400); await t.shot('v11-planets');
  await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(300); await t.shot('v11-planets2');
  console.log('page after planets', await p.evaluate(() => ui.page), 'sel', await p.evaluate(() => V11.ppSel));
  await p.evaluate(() => { closeModal(); ui.page = 'cantina'; render(); }); await p.waitForTimeout(800); await t.shot('v11-cantina');
  console.log(errs.join('\n') || 'no errors');
  await t.close();
})();
