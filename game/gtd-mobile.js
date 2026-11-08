const { chromium } = require('playwright');
const FONTS = "@font-face{font-family:'VT323';src:local('DejaVu Sans Mono');size-adjust:66%} @font-face{font-family:'Press Start 2P';src:local('DejaVu Sans Mono');size-adjust:150%;font-weight:400}";
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('file://' + __dirname + '/gtd-test.html'); await p.addStyleTag({ content: FONTS }); await p.waitForTimeout(400);
  await p.screenshot({ path: 'shots/60-m-title.png' });
  await p.fill('#in-name', 'Gus'); await p.tap('[data-act="launch"]'); await p.waitForTimeout(500); await p.screenshot({ path: 'shots/61-m-hub.png' });
  for (const pg of ['market', 'bank', 'pad', 'jobs', 'ship']) { await p.evaluate(pg => go(pg), pg); await p.waitForTimeout(200); await p.screenshot({ path: 'shots/62-m-' + pg + '.png' }); }
  const over = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  console.log('overflow', JSON.stringify(over));
  await p.evaluate(() => { S.loc = 0; S.visit.flags = {}; ui.page = 'jobs'; render(); MG.run('pests', () => {}, {}); }); await p.waitForTimeout(300); await p.screenshot({ path: 'shots/63-m-mg-intro.png' });
  await p.tap('[data-mg="start"]'); await p.waitForTimeout(3600); await p.screenshot({ path: 'shots/64-m-mg-play.png' });
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})();
