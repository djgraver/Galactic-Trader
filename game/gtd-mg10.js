const L = require('./gtd-lib.js');
const GAMES = ['pests', 'tomb', 'ore', 'traffic', 'debris', 'catch', 'cloud', 'sneak'];
(async () => {
  const t = await L.open({ width: 1920, height: 1080 }); const p = t.p;
  await p.waitForTimeout(800); await t.boot('Mabel', 'cutlass', 1);
  for (const id of GAMES) {
    await p.evaluate(id => { window.__res = null; MG.run(id, r => { window.__res = r; }, {}); }, id);
    await p.waitForTimeout(200); await p.click('[data-mg="start"]'); await p.waitForTimeout(2900);
    for (let i = 0; i < 30; i++) { await p.keyboard.press(['ArrowLeft', 'ArrowRight', 'ArrowUp', ' ', 'a', 's', 'q', 'e'][i % 8]); await p.mouse.move(700 + (i % 5) * 120, 400 + (i % 3) * 100); if (id === 'cloud') { await p.mouse.down(); await p.waitForTimeout(90); await p.mouse.up(); } await p.waitForTimeout(80); }
    await t.shot('mg10-' + id);
    await p.evaluate(() => { if (MG.g) MG.G.t = MG.g.dur - 0.02; }); await p.waitForTimeout(400);
    const cl = await p.$('[data-mg="collect"]'); if (cl) await cl.click(); await p.waitForTimeout(200);
    console.log(id, JSON.stringify(await p.evaluate(() => window.__res)));
  }
  console.log(t.errs.join('\n') || 'no errors'); await t.close();
})();
