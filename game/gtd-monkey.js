// Random-click monkey for solo and multiplayer games. Looks for script errors and stuck states.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 780 } }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('file://' + __dirname + '/gtd-test.html'); await p.waitForTimeout(300);
  await p.evaluate(() => { SFX.on = false; });
  const pages = ['hub', 'market', 'bank', 'yard', 'fuel', 'cantina', 'alley', 'office', 'jobs', 'pad', 'ship'];
  let games = 0, jumps = 0, ends = 0, passes = 0, stuck = 0;
  const PLAYERS = [1, 2, 4, 3, 1, 2];
  for (let round = 0; round < PLAYERS.length; round++) {
    await p.click('[data-act="players-' + PLAYERS[round] + '"]');
    for (let k = 0; k < PLAYERS[round]; k++) { if (PLAYERS[round] > 1) await p.click('[data-act="cap-' + k + '"]'); await p.fill('#in-name', ['Gus', 'Zelda Q', 'Xx_Dragon_xX', 'a'][k]); if (Math.random() < .5) await p.click('[data-act="pick-' + ['wayfarer', 'barge', 'stargazer', 'cutlass'][k] + '"]'); }
    await p.click('[data-act="launch"]'); await p.waitForTimeout(250);
    let lastKey = '', same = 0;
    for (let i = 0; i < 220; i++) {
      const st = await p.evaluate(() => ({ fl: !$('flight').hidden, mg: !$('mg').hidden, modal: !$('modal').hidden, pass: !$('pass').hidden, over: !!(G && G.over), pend: !!(S && S.pending), key: S ? S.name + S.turn + S.loc + ui.page + (G ? G.round : 0) : '' }));
      same = st.key === lastKey ? same + 1 : 0; lastKey = st.key; if (same > 120) { stuck++; break; }
      if (st.pass) { await p.click('[data-act="pass-ok"]'); passes++; await p.waitForTimeout(40); continue; }
      if (st.fl) { await p.mouse.click(640, 300); await p.waitForTimeout(80); const nx = await p.$('[data-act="fl-next"]'); if (nx) await nx.click(); const dk = await p.$('[data-act="fl-dock"]'); if (dk) await dk.click(); await p.waitForTimeout(60); continue; }
      if (st.mg) { await p.evaluate(() => { if (MG.state === 'intro') MG.begin(); else MG.quit(); }); await p.waitForTimeout(60); continue; }
      if (st.over) { ends++; break; }
      if (st.modal) { const c = await p.$$('#modal [data-act]'); if (c.length) { const el = c[Math.floor(Math.random() * c.length)]; const a = await el.getAttribute('data-act'); if (a !== 'new') await el.click(); else await c[0].click(); } await p.waitForTimeout(40); continue; }
      if (Math.random() < 0.35) { await p.evaluate(pg => go(pg), pages[Math.floor(Math.random() * pages.length)]); }
      const onPad = await p.evaluate(() => ui.page === 'pad');
      if (onPad && Math.random() < 0.5) {
        await p.evaluate(() => { const ix = GT.PLANETS.map((x, k) => k).filter(k => k !== S.loc && GT.canJump(S, k)); ui.dest = ix.length ? ix[Math.floor(Math.random() * ix.length)] : null; render(); });
        const jb = await p.$('[data-act="jump"]:not([disabled])'); if (jb) { jumps++; await jb.click(); await p.waitForTimeout(60); continue; }
      }
      const btns = await p.$$('#stage [data-act]:not([disabled])');
      if (!btns.length) { await p.evaluate(() => go('hub')); continue; }
      const el = btns[Math.floor(Math.random() * btns.length)]; const a = await el.getAttribute('data-act');
      if (a === 'job-start') games++; if (a === 'new') continue;
      try { await el.click({ timeout: 800 }); } catch (e) {}
    }
    await p.evaluate(() => { document.querySelectorAll('[data-act="close"]').forEach(b => b.click()); });
    await p.evaluate(() => { S = null; G = null; closeModal(); $('flight').hidden = true; $('mg').hidden = true; $('pass').hidden = true; renderStart(); }); await p.waitForTimeout(100);
  }
  console.log('games started', games, 'jumps', jumps, 'endings', ends, 'pass screens', passes, 'stuck', stuck);
  console.log('errors:', errs.length ? errs.slice(0, 8) : 'none');
  await b.close();
})();
