// Multiplayer hot-seat flow: 3 captains, setup, pass screens, jumps, flights, end of round, win.
const { chromium } = require('playwright');
const FONTS = "@font-face{font-family:'VT323';src:local('DejaVu Sans Mono');size-adjust:66%} @font-face{font-family:'Press Start 2P';src:local('DejaVu Sans Mono');size-adjust:150%;font-weight:400}";
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('file://' + __dirname + '/gtd-test.html'); await p.addStyleTag({ content: FONTS }); await p.waitForTimeout(700);
  await p.click('[data-act="players-3"]'); await p.waitForTimeout(300);
  const names = ['Ada', 'Bix', 'Cato'], ships = ['pick-barge', 'pick-cutlass', 'pick-stargazer'];
  for (let k = 0; k < 3; k++) { await p.click('[data-act="cap-' + k + '"]'); await p.fill('#in-name', names[k]); await p.click('[data-act="' + ships[k] + '"]'); await p.waitForTimeout(150); }
  await p.screenshot({ path: 'shots/70-setup3.png' });
  await p.click('[data-act="launch"]'); await p.waitForTimeout(1000);
  await p.screenshot({ path: 'shots/71-pass1.png' });
  const info = () => p.evaluate(() => ({ round: G.round, cur: G.cur, order: G.order.map(k => G.players[k].name), active: S.name, speeds: G.order.map(k => GT.effSpeed(G.players[k])), pass: !$('pass').hidden, flight: !$('flight').hidden, modal: !$('modal').hidden, over: G.over }));
  console.log('start', JSON.stringify(await info()));
  async function takeTurn(i) {
    if (await p.evaluate(() => !$('pass').hidden)) { await p.click('[data-act="pass-ok"]'); await p.waitForTimeout(400); }
    // dismiss any pending rival modal
    for (let t = 0; t < 3; t++) { const ig = await p.$('[data-act="comp-ignore"]'); if (ig) { await ig.click(); await p.waitForTimeout(300); } }
    const closeb = await p.$('#modal [data-act="close"]'); if (closeb) { await closeb.click(); await p.waitForTimeout(200); }
    await p.evaluate(() => { go('pad'); const i = GT.PLANETS.findIndex((x, k) => k !== S.loc && GT.canJump(S, k)); ui.dest = i; render(); });
    await p.waitForTimeout(250);
    if (i === 0) await p.screenshot({ path: 'shots/72-pad-multi.png' });
    await p.click('[data-act="jump"]'); await p.waitForTimeout(600);
    await p.mouse.click(640, 300); await p.waitForTimeout(500); // skip warp
    for (let t = 0; t < 4; t++) { const nx = await p.$('[data-act="fl-next"]'); if (nx) { await nx.click(); await p.waitForTimeout(300); } }
    if (i === 0) await p.screenshot({ path: 'shots/73-arrive.png' });
    const dk = await p.$('[data-act="fl-dock"]'); if (dk) await dk.click(); await p.waitForTimeout(500);
    const ok = await p.$('[data-act="notice-ok"]'); if (ok) { await ok.click(); await p.waitForTimeout(400); }
  }
  for (let t = 0; t < 7; t++) { await takeTurn(t); const s = await info(); console.log('after turn', t, JSON.stringify({ round: s.round, cur: s.cur, active: s.active, pass: s.pass })); if (t === 0) await p.screenshot({ path: 'shots/74-pass2.png' }); }
  // force a win for whoever is active to test end of round + end screen
  await p.evaluate(() => { S.credits = 400000; });
  for (let t = 0; t < 4; t++) { const s = await info(); if (s.over) break; await takeTurn(7 + t); }
  await p.waitForTimeout(600); console.log('end', JSON.stringify(await info()));
  await p.screenshot({ path: 'shots/75-end.png' });
  console.log('errors:', errs.length ? errs : 'none'); await b.close();
})();
