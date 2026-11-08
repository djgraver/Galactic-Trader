// Quick look: screenshots of title, hub and pages. Adds stand-in pixel fonts (this box has no internet fonts), sized to match VT323 and Press Start 2P widths.
const { chromium } = require('playwright');
const FONTS = "@font-face{font-family:'VT323';src:local('DejaVu Sans Mono');size-adjust:66%} @font-face{font-family:'Press Start 2P';src:local('DejaVu Sans Mono');size-adjust:150%;font-weight:400}";
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: +(process.env.W || 1280), height: +(process.env.H || 800) }, deviceScaleFactor: 1 }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('file://' + __dirname + '/gtd-test.html'); await p.addStyleTag({ content: FONTS }); await p.waitForTimeout(900);
  await p.screenshot({ path: 'shots/60-title.png' });
  await p.fill('#in-name', 'Gus'); await p.click('[data-act="launch"]'); await p.waitForTimeout(1200);
  await p.screenshot({ path: 'shots/61-hub.png' });
  for (const pg of (process.env.PAGES || 'market,bank,yard,cantina,pad,ship').split(',')) { await p.evaluate(g => { go(g); }, pg); await p.waitForTimeout(700); await p.screenshot({ path: 'shots/62-' + pg + '.png' }); }
  console.log('errors:', errs.length ? errs : 'none'); await b.close();
})();
