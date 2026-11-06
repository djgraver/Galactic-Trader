const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 860 }, deviceScaleFactor: 1 }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('file://' + __dirname + '/gtd-test.html'); await p.waitForTimeout(500);
  await p.screenshot({ path: 'shots/01-start.png' });
  await p.fill('#in-name', 'Gus'); await p.waitForTimeout(100); await p.screenshot({ path: 'shots/02-start-gus.png' });
  await p.click('[data-act="launch"]'); await p.waitForTimeout(600); await p.screenshot({ path: 'shots/03-hub.png' });
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})();
