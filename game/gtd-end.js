const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 780 } }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('file://' + __dirname + '/gtd-test.html'); await p.waitForTimeout(300);
  await p.fill('#in-name', 'Zed'); await p.click('[data-act="launch"]'); await p.waitForTimeout(300);
  // play one real job through startJob to check the payout path
  await p.evaluate(() => { S.loc = 3; ui.page = 'jobs'; render(); }); await p.waitForTimeout(100);
  await p.click('[data-act="job-start"]'); await p.waitForTimeout(300); await p.click('[data-mg="start"]'); await p.waitForTimeout(3200);
  await p.evaluate(() => { MG.G.score = MG.g.goals[2] + 1; MG.G.t = MG.g.dur - 0.02; }); await p.waitForTimeout(500);
  await p.click('[data-mg="collect"]'); await p.waitForTimeout(400);
  console.log('after job:', JSON.stringify(await p.evaluate(() => ({ credits: S.credits, jobs: S.stats.jobs, gain: S.stats.jobGain, rep: S.rep, avail: GT.jobAvailable(S) }))));
  await p.screenshot({ path: 'shots/70-after-job.png' });
  // win
  await p.evaluate(() => { S.credits = 400000; ui.page = 'pad'; ui.dest = GT.PLANETS.findIndex((x, k) => k !== S.loc && GT.canJump(S, k)); render(); });
  await p.click('[data-act="jump"]'); await p.waitForTimeout(800); await p.mouse.click(640, 300); await p.waitForTimeout(600);
  const nx = await p.$('[data-act="fl-next"]'); if (nx) await nx.click(); await p.waitForTimeout(300); await p.click('[data-act="fl-dock"]'); await p.waitForTimeout(600);
  await p.screenshot({ path: 'shots/71-win.png' });
  console.log('over:', JSON.stringify(await p.evaluate(() => S.over)));
  await p.evaluate(() => { const m = document.querySelector('#modal .sheet'); m.scrollTop = 99999; }); await p.waitForTimeout(150); await p.screenshot({ path: 'shots/72-win-bottom.png' });
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})();
