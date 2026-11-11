// usage: node street-lab.js [sheet|one] ... ; writes shots/lab-*.png
const { chromium } = require('playwright');
const ids = ['meridoa', 'karthosu', 'ferrox', 'kryndor', 'nihil', 'quellin', 'halcyra'];
(async () => {
  const mode = process.argv[2] || 'sheet', which = (process.argv[3] || '0,1,2,3,4,5,6').split(',').map(Number), nightArg = process.argv[4] || 'd,n';
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1000, height: 600 }, deviceScaleFactor: 1 }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await p.goto('file://' + __dirname + '/street-lab.html'); await p.waitForTimeout(300);
  const fn = mode === 'port' ? 'showPort' : 'show';
  for (const i of which) for (const nt of nightArg.split(',')) {
    const t0 = Date.now();
    await p.evaluate(([f, i, n]) => window[f](i, n === 'n'), [fn, i, nt]); const dt = Date.now() - t0;
    await p.waitForTimeout(500);
    const el = await p.$('#sb'); await el.screenshot({ path: 'shots/lab-' + mode + '-' + ids[i] + '-' + nt + '.png' });
    console.log(ids[i], nt, 'build ms', dt);
  }
  console.log('errors:', errs.length ? errs : 'none'); await b.close();
})();
