// Street contact sheet: node gtd-bsheet.js '[["meridoa","d"],["ferrox","n"]]' out.png [cols]
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 600 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route(/fonts\./, r => r.abort());
  await p.goto('file://' + __dirname + '/gtd-test.html'); await p.waitForTimeout(300);
  const sets = JSON.parse(process.argv[2]), cols = +(process.argv[4] || 2), W = Math.floor(1920 / cols), Hh = Math.floor(W * 0.625);
  const urls = await p.evaluate((sets) => sets.map(([pid, nn]) => { const i = GT.PLANETS.findIndex(x => x.id === pid); const s = { loc: i, visit: { night: nn === 'n' }, shipId: 'wayfarer' }; const r = SC.build(s); return PX.render(r.buf, nn === 'n', 3).toDataURL(); }), sets);
  await p.setViewportSize({ width: cols * W, height: Math.ceil(sets.length / cols) * Hh });
  await p.setContent('<body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(' + cols + ',' + W + 'px)">' + urls.map(u => '<img src="' + u + '" style="width:' + W + 'px;height:' + Hh + 'px;image-rendering:pixelated">').join(''));
  await p.waitForTimeout(300); await p.screenshot({ path: process.argv[3] }); console.log(errs.join('\n') || 'ok'); await b.close();
})();
