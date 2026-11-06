const { chromium } = require('playwright');
const GAMES = [['pests', 0], ['tomb', 1], ['ore', 2], ['traffic', 3], ['debris', 4], ['catch', 5], ['cloud', 6], ['sneak', 3]];
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1100, height: 720 }, deviceScaleFactor: 1 }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('file://' + __dirname + '/gtd-test.html'); await p.waitForTimeout(300);
  await p.fill('#in-name', 'Gus'); await p.click('[data-act="launch"]'); await p.waitForTimeout(300);
  for (const [id, loc] of GAMES) {
    await p.evaluate(([id, loc]) => { S.loc = loc; S.visit = { explored: false, encountered: false, offer: null, flags: {} }; ui.page = 'jobs'; render(); window.__res = null; MG.run(id, r => { window.__res = r; }, {}); }, [id, loc]);
    await p.waitForTimeout(250); await p.screenshot({ path: 'shots/50-' + id + '-intro.png' });
    await p.click('[data-mg="start"]'); await p.waitForTimeout(3000);
    // wiggle the pointer and tap around like a player, plus some keys
    for (let i = 0; i < 24; i++) {
      const x = 260 + Math.random() * 600, y = 200 + Math.random() * 300;
      await p.mouse.move(x, y); await p.mouse.down(); await p.waitForTimeout(40); await p.mouse.up();
      if (i % 3 === 0) { const k = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'a', 's', 'd', 'q', 'w'][i % 10]; await p.keyboard.press(k); }
      await p.waitForTimeout(60);
      if (i === 12) await p.screenshot({ path: 'shots/51-' + id + '-play.png' });
    }
    const mid = await p.evaluate(() => MG.g ? ({ t: +MG.G.t.toFixed(1), score: MG.G.score, state: MG.state }) : ({ closedEarly: true }));
    // jump to the end of the clock
    await p.evaluate(() => { if (MG.g) MG.G.t = MG.g.dur - 0.05; }); await p.waitForTimeout(400);
    await p.screenshot({ path: 'shots/52-' + id + '-result.png' });
    const cl = await p.$('[data-mg="collect"]'); if (cl) await cl.click(); await p.waitForTimeout(250);
    const res = await p.evaluate(() => ({ res: window.__res, credits: S.credits, jobs: S.stats.jobs }));
    console.log(id, 'mid', JSON.stringify(mid), 'result', JSON.stringify(res));
  }
  // quit path
  await p.evaluate(() => { S.loc = 0; S.visit.flags = {}; ui.page = 'jobs'; render(); MG.run('pests', () => {}, {}); }); await p.waitForTimeout(200); await p.click('[data-mg="quit"]'); await p.waitForTimeout(200);
  console.log('after quit mg hidden:', await p.evaluate(() => $('mg').hidden));
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})();
