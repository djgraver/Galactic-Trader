const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 780 } }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('file://' + __dirname + '/gtd-test.html'); await p.waitForTimeout(300);
  await p.evaluate(() => { SFX.on = false; });
  const pages = ['hub', 'market', 'bank', 'yard', 'fuel', 'cantina', 'alley', 'office', 'jobs', 'pad', 'ship'];
  let games = 0, jumps = 0, ends = 0;
  for (let round = 0; round < 4; round++) {
    await p.fill('#in-name', ['Gus', 'Zelda Q', 'Xx_Dragon_xX', 'a'][round]); await p.click('[data-act="launch"]'); await p.waitForTimeout(250);
    for (let i = 0; i < 160; i++) {
      const st = await p.evaluate(() => ({ fl: !$('flight').hidden, mg: !$('mg').hidden, modal: !$('modal').hidden, over: !!(S && S.over), pend: !!(S && S.pending) }));
      if (st.fl) { await p.mouse.click(640, 300); await p.waitForTimeout(80); const nx = await p.$('[data-act="fl-next"]'); if (nx) await nx.click(); const dk = await p.$('[data-act="fl-dock"]'); if (dk) await dk.click(); await p.waitForTimeout(80); continue; }
      if (st.mg) { await p.evaluate(() => { if (MG.state === 'intro') MG.begin(); else MG.quit(); }); await p.waitForTimeout(60); continue; }
      if (st.over) { ends++; break; }
      if (st.modal) { const c = await p.$$('#modal [data-act]'); if (c.length) { const el = c[Math.floor(Math.random() * c.length)]; const a = await el.getAttribute('data-act'); if (a !== 'new') await el.click(); else await c[0].click(); } else await p.evaluate(() => closeModal()); continue; }
      if (Math.random() < 0.15) { await p.evaluate(pg => go(pg), pages[Math.floor(Math.random() * pages.length)]); }
      const btns = await p.$$('#stage [data-act]:not([disabled])');
      if (!btns.length) { await p.evaluate(() => go('hub')); continue; }
      const el = btns[Math.floor(Math.random() * btns.length)]; const a = await el.getAttribute('data-act');
      if (a === 'job-start') games++; if (a === 'jump') jumps++;
      if (a === 'new') continue;
      try { await el.click({ timeout: 800 }); } catch (e) {}
      if (Math.random() < 0.3) { await p.evaluate(() => { const i = Math.floor(Math.random() * GT.PLANETS.length); if (S && !S.over) { ui.dest = i === S.loc ? null : i; if (ui.page === 'pad') render(); } }); }
    }
    await p.evaluate(() => { document.querySelectorAll('[data-act="close"]').forEach(b => b.click()); });
    await p.evaluate(() => { S = null; closeModal(); $('flight').hidden = true; $('mg').hidden = true; renderStart(); }); await p.waitForTimeout(100);
  }
  console.log('games started', games, 'jump clicks', jumps, 'endings', ends);
  console.log('errors:', errs.length ? errs.slice(0, 8) : 'none');
  await b.close();
})();
