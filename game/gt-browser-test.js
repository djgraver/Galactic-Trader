const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const dir = __dirname, url = 'file://' + path.join(dir, 'galactic-trader.html');
  const browser = await chromium.launch();
  const errs = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: 'dark' });
  const page = await ctx.newPage();
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_|Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await page.goto(url); await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(dir, 'shot-start.png') });
  await page.fill('#in-name', 'Nova');
  await page.click('[data-act="pick-gnat"]');
  await page.click('[data-act="launch"]'); await page.waitForTimeout(300);
  // column widths
  const widths = await page.$$eval('.col', els => els.map(e => Math.round(e.getBoundingClientRect().width)));
  console.log('column widths', widths, 'window 1440');
  // trade a bit: buy max of first affordable item, then plan a jump
  await page.click('.mrow[data-i="0"] [data-act="max"]');
  await page.click('.mrow[data-i="1"] [data-act="buy"]').catch(() => {});
  await page.click('.pl[data-i="2"]');
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(dir, 'shot-game-dark.png') });
  const before = await page.evaluate(() => ({ turn: S.turn, loc: S.loc, credits: Math.round(S.credits) }));
  await page.click('[data-act="jump"]'); await page.waitForTimeout(200);
  if (await page.$('#modal:not([hidden]) [data-act="comp-ignore"]')) await page.click('[data-act="comp-ignore"]');
  const after = await page.evaluate(() => ({ turn: S.turn, loc: S.loc, credits: Math.round(S.credits), log: S.log.length }));
  console.log('before', before, 'after', after);
  await page.click('[data-act="explore"]'); await page.click('[data-act="encounter"]');
  // deposit flow: type value, check button enabled, click, field resets
  await page.fill('#in-dep', '100'); const depEnabled = await page.$eval('[data-act="deposit"]', b => !b.disabled);
  await page.click('[data-act="deposit"]'); const depVal = await page.$eval('#in-dep', i => i.value);
  console.log('deposit button enabled when valid:', depEnabled, '| field reset to', depVal, '| bank', await page.evaluate(() => S.bank));
  await page.click('[data-act="loan"]'); console.log('loan after take:', await page.evaluate(() => S.loan));
  // gambling popup
  await page.evaluate(() => { S.loc = 4; S.visit = { explored: false, encountered: false, offer: null, flags: {} }; S.credits = 3000; render(); });
  await page.click('[data-act="gamble"]'); await page.click('[data-act="gamble-2-50"]'); await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(dir, 'shot-gamble.png') });
  await page.click('[data-act="close"]');
  // competitor popup
  await page.evaluate(() => { S.pending = { type: 'comp', ci: 0, mood: GT.MOODS[0] }; compModal(); });
  await page.screenshot({ path: path.join(dir, 'shot-comp.png') });
  await page.click('[data-act="comp-assist"]'); await page.waitForTimeout(100);
  // info popup
  await page.click('.topbtns [data-act="info"]'); await page.screenshot({ path: path.join(dir, 'shot-info.png') }); await page.click('[data-act="close"]');
  // many random jumps through the real UI with random trades
  for (let k = 0; k < 120 && !(await page.evaluate(() => S.over)); k++) {
    await page.evaluate(() => {
      if (S.pending) { GT.compAction(S, ['sabotage', 'assist', 'ignore'][S.turn % 3]); closeModal(); }
      for (let i = 0; i < 7; i++) { if (S.cargo[i].qty) GT.sell(S, i, S.cargo[i].qty); }
      const i = S.turn % 7, n = GT.maxBuy(S, i); if (n) GT.buy(S, i, Math.min(n, 5));
      if (GT.canRefuel(S)) GT.refuel(S, 20);
      render();
    });
    const d = await page.evaluate(() => { for (let k = 0; k < 7; k++) { const c = (S.loc + 1 + k) % 7; if (GT.canJump(S, c)) return c; } return -1; });
    if (d >= 0) { await page.click('.pl[data-i="' + d + '"]'); await page.click('[data-act="jump"]'); }
    else if (await page.$('[data-act="tow"]')) await page.click('[data-act="tow"]');
    else break;
    if (await page.$('#modal:not([hidden]) [data-act="comp-ignore"]')) await page.click('[data-act="comp-ignore"]');
    if (await page.$('#modal:not([hidden]) [data-act="new"]')) break;
  }
  console.log('after many jumps:', await page.evaluate(() => ({ turn: S.turn, credits: Math.round(S.credits), over: S.over && S.over.won, log: S.log.length })));
  // force a win and a loss
  await page.evaluate(() => { closeModal(); S.over = null; S.pending = null; S.bank = 160000; render(); });
  const d2 = await page.evaluate(() => { for (let c = 0; c < 7; c++) if (GT.canJump(S, c)) return c; S.ship.fuel = 99; return 0; });
  await page.evaluate(() => { S.ship.fuel = S.ship.fuelMax; render(); });
  const dd = await page.evaluate(() => { for (let c = 0; c < 7; c++) if (c !== S.loc) return c; });
  await page.click('.pl[data-i="' + dd + '"]'); await page.click('[data-act="jump"]'); await page.waitForTimeout(150);
  if (await page.$('#modal:not([hidden]) [data-act="comp-ignore"]')) { await page.click('[data-act="comp-ignore"]'); }
  console.log('win state:', await page.evaluate(() => S.over));
  await page.screenshot({ path: path.join(dir, 'shot-end.png') });
  // light theme + phone
  await page.evaluate(() => { closeModal(); setTheme('light'); });
  await page.screenshot({ path: path.join(dir, 'shot-game-light.png') });
  const ph = await browser.newContext({ viewport: { width: 400, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: 'dark' });
  const p2 = await ph.newPage();
  p2.on('pageerror', e => errs.push('PHONE PAGEERROR ' + e.message));
  await p2.goto('file://' + path.join(dir, 'galactic-trader-test.html')); await p2.waitForTimeout(300);
  await p2.screenshot({ path: path.join(dir, 'shot-phone-start.png') });
  await p2.click('[data-act="launch"]'); await p2.waitForTimeout(200);
  await p2.click('.tab[data-tab="c2"]'); await p2.waitForTimeout(100);
  await p2.screenshot({ path: path.join(dir, 'shot-phone-planet.png') });
  const ov = await p2.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  console.log('phone overflow check', ov);
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'NO PAGE ERRORS');
  await browser.close();
})().catch(e => { console.error('TEST CRASH', e); process.exit(1); });
