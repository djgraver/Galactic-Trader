const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const mode of ['dark', 'light']) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 780 }, colorScheme: mode }); const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
    await p.goto('file://' + __dirname + '/gtd-test.html'); await p.waitForTimeout(300);
    await p.fill('#in-name', 'Gus'); await p.click('[data-act="launch"]'); await p.waitForTimeout(400); await p.screenshot({ path: 'shots/80-' + mode + '-hub.png' });
    // simulate the host forcing the opposite theme
    await p.evaluate(m => document.documentElement.setAttribute('data-theme', m === 'dark' ? 'light' : 'dark'), mode); await p.waitForTimeout(300); await p.screenshot({ path: 'shots/81-' + mode + '-forced.png' });
    await p.evaluate(() => go('market')); await p.waitForTimeout(200); await p.screenshot({ path: 'shots/82-' + mode + '-forced-market.png' });
    console.log(mode, 'errors:', errs.length ? errs : 'none'); await ctx.close();
  }
  await b.close();
})();
