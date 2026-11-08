// Contact sheet of every street, day and night, straight from the running game.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await p.goto('file://' + __dirname + '/gtd-test.html'); await p.waitForTimeout(500);
  await p.fill('#in-name', 'Gus'); await p.click('[data-act="launch"]'); await p.waitForTimeout(500);
  const ids = ['meridoa', 'karthosu', 'ferrox', 'kryndor', 'nihil', 'quellin', 'halcyra'];
  for (const night of [false, true]) for (let i = 0; i < 7; i++) {
    await p.evaluate(([i, night]) => { S.loc = i; S.visit.night = night; ui.px = null; ui.page = 'hub'; render(); }, [i, night]); await p.waitForTimeout(450);
    const el = await p.$('.scenebox'); await el.screenshot({ path: 'shots/80-' + ids[i] + (night ? '-n' : '-d') + '.png' });
  }
  console.log('errors:', errs.length ? errs : 'none'); await b.close();
})();
