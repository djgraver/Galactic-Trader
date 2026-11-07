const { chromium } = require('playwright'); const fs = require('fs');
const parts = ['gt-1-data.js','gt-2-market.js','gt-3-world.js','gt-4-social.js','gt-8-art.js','gt-11-chars.js','gt-12-cast.js','gt-21-px.js','gt-22-street.js'];
const src = parts.map(f => fs.readFileSync(f, 'utf8')).join('\n');
const html = '<!doctype html><meta charset=utf-8><body style="margin:0;background:#333"><div id=out></div><script>' + src + '\nvar ui={px:null};window.GT=GT;<\/script>';
fs.writeFileSync('gtd-street-test.html', html);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 600 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + __dirname + '/gtd-street-test.html');
  const which = (process.argv[2] || 'meridoa,karthosu,ferrox,kryndor,nihil,quellin,halcyra').split(',');
  const night = (process.argv[3] || 'd,n').split(',');
  for (const pid of which) for (const nn of night) {
    const url = await p.evaluate(([pid, nn]) => { const i = GT.PLANETS.findIndex(x => x.id === pid); const s = { loc: i, visit: { night: nn === 'n' }, shipId: 'wayfarer' }; const r = SC.build(s); return PX.render(r.buf, nn === 'n', 3).toDataURL(); }, [pid, nn]);
    await p.setContent('<body style="margin:0;background:#222"><img src="' + url + '" style="image-rendering:pixelated">');
    await p.screenshot({ path: 'shots/street-' + pid + '-' + nn + '.png', clip: { x: 0, y: 0, width: 960, height: 540 } });
  }
  console.log('errors', errs.length ? errs.slice(0, 5) : 'none'); await b.close();
})();
