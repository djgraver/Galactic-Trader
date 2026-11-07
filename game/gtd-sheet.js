const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 600 } });
  await p.goto('file://' + __dirname + '/gtd-street-test.html');
  const sets = JSON.parse(process.argv[2]); // [["ferrox","d"],...]
  const urls = await p.evaluate((sets) => sets.map(([pid, nn]) => { const i = GT.PLANETS.findIndex(x => x.id === pid); const s = { loc: i, visit: { night: nn === 'n' }, shipId: 'wayfarer' }; const r = SC.build(s); return PX.render(r.buf, nn === 'n', 3).toDataURL(); }), sets);
  await p.setViewportSize({ width: 960, height: 540 });
  await p.setContent('<body style="margin:0;background:#222;display:grid;grid-template-columns:480px 480px">' + urls.map(u => '<img src="' + u + '" style="width:480px;height:270px;image-rendering:pixelated">').join(''));
  await p.screenshot({ path: process.argv[3] }); await b.close();
})();
