const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 860 }, deviceScaleFactor: 1 }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('file://' + __dirname + '/gtd-test.html'); await p.waitForTimeout(300);
  await p.fill('#in-name', 'Gus'); await p.click('[data-act="launch"]'); await p.waitForTimeout(300);
  // real click on the market, wait for walk
  await p.click('[data-hs="market"]'); await p.waitForTimeout(1500); await p.screenshot({ path: 'shots/10-market.png' });
  await p.click('[data-act="max"] >> nth=0'); await p.waitForTimeout(200); await p.screenshot({ path: 'shots/11-market-bought.png' });
  const pages = ['bank', 'yard', 'fuel', 'cantina', 'alley', 'office', 'jobs', 'pad', 'ship'];
  for (const pg of pages) { await p.evaluate(pg => { go(pg); }, pg); await p.waitForTimeout(150); await p.screenshot({ path: 'shots/12-' + pg + '.png' }); }
  // bank actions
  await p.evaluate(() => { go('bank'); ui.dep = 500; render(); }); await p.click('[data-act="deposit"]'); await p.click('[data-act="loan"]'); await p.waitForTimeout(100); await p.screenshot({ path: 'shots/13-bank-after.png' });
  // cantina and alley
  await p.evaluate(() => go('cantina')); await p.click('[data-act="encounter"]'); await p.waitForTimeout(150); await p.screenshot({ path: 'shots/14-cantina-after.png' });
  await p.evaluate(() => go('alley')); await p.click('[data-act="explore"]'); await p.waitForTimeout(150); await p.screenshot({ path: 'shots/15-alley-after.png' });
  // nihil parlour, karthosu closed
  await p.evaluate(() => { S.loc = 4; S.visit = { explored: false, encountered: false, offer: null, flags: {} }; ui.page = 'hub'; render(); }); await p.screenshot({ path: 'shots/16-nihil-hub.png' });
  await p.evaluate(() => go('parlour')); await p.screenshot({ path: 'shots/17-parlour.png' }); await p.click('[data-act="sit"]'); await p.waitForTimeout(150); await p.screenshot({ path: 'shots/18-gamble.png' }); await p.click('[data-act="close"]');
  await p.evaluate(() => { S.loc = 1; ui.page = 'hub'; render(); }); await p.screenshot({ path: 'shots/19-karthosu-hub.png' });
  await p.evaluate(() => { S.loc = 0; ui.page = 'hub'; render(); }); await p.screenshot({ path: 'shots/20-meridoa-hub.png' });
  await p.evaluate(() => { S.loc = 5; ui.page = 'hub'; render(); }); await p.screenshot({ path: 'shots/21-quellin-hub.png' });
  await p.evaluate(() => { S.loc = 6; ui.page = 'hub'; render(); }); await p.screenshot({ path: 'shots/22-halcyra-hub.png' });
  await p.evaluate(() => { S.loc = 2; ui.page = 'hub'; render(); }); await p.screenshot({ path: 'shots/23-ferrox-hub.png' });
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})();
