const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 780 }, deviceScaleFactor: 1 }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('file://' + __dirname + '/gtd-test.html'); await p.waitForTimeout(300);
  await p.fill('#in-name', 'Gus'); await p.click('[data-act="launch"]'); await p.waitForTimeout(300);
  // open the pad, choose a destination, jump with forced event + facility + rival
  await p.evaluate(() => { go('pad'); }); await p.waitForTimeout(150); await p.screenshot({ path: 'shots/30-pad.png' });
  await p.evaluate(() => { const i = GT.PLANETS.findIndex((x, k) => k !== S.loc && GT.canJump(S, k)); ui.dest = i; render(); });
  await p.screenshot({ path: 'shots/31-pad-dest.png' });
  await p.evaluate(() => { window.__r = GT.rand; GT.rand = () => 0.05; });
  await p.click('[data-act="jump"]'); await p.waitForTimeout(700); await p.screenshot({ path: 'shots/32-flight-a.png' });
  await p.waitForTimeout(1800); await p.screenshot({ path: 'shots/33-flight-b.png' });
  await p.waitForTimeout(2200); await p.screenshot({ path: 'shots/34-flight-c.png' });
  await p.waitForTimeout(1500); await p.screenshot({ path: 'shots/35-flight-d.png' });
  const state1 = await p.evaluate(() => ({ cards: document.querySelectorAll('#fl-card .fcard').length, txt: (document.querySelector('#fl-card') || {}).textContent }));
  console.log('card after warp:', JSON.stringify(state1).slice(0, 300));
  // click through event card then dock
  const nx = await p.$('[data-act="fl-next"]'); if (nx) { await nx.click(); await p.waitForTimeout(400); await p.screenshot({ path: 'shots/36-flight-arrive.png' }); }
  await p.click('[data-act="fl-dock"]'); await p.waitForTimeout(500); await p.screenshot({ path: 'shots/37-docked.png' });
  const modal = await p.evaluate(() => ({ hidden: $('modal').hidden, pending: !!S.pending, offer: !!S.visit.offer, over: !!S.over, loc: S.loc }));
  console.log('after dock:', JSON.stringify(modal));
  if (modal.pending) { await p.screenshot({ path: 'shots/38-comp-modal.png' }); await p.click('[data-act="comp-ignore"]'); await p.waitForTimeout(400); await p.screenshot({ path: 'shots/39-comp-ignore.png' }); }
  await p.evaluate(() => { GT.rand = window.__r; });
  // skip path: click anywhere during warp
  await p.evaluate(() => { const i = GT.PLANETS.findIndex((x, k) => k !== S.loc && GT.canJump(S, k)); if (i >= 0) { ui.dest = i; doJump(i, false); } });
  await p.waitForTimeout(500); await p.mouse.click(640, 300); await p.waitForTimeout(500); await p.screenshot({ path: 'shots/40-skip.png' });
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})();
