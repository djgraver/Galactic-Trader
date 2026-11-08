const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  p.on('pageerror', e => console.log('PAGEERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  await p.goto('file://' + __dirname + '/gtd-test.html'); await p.waitForTimeout(500);
  const r = await p.evaluate(async () => {
    const t = CH.fromName('Gus', 0), svg = CH.portrait(t);
    const doc = new DOMParser().parseFromString(svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'), 'image/svg+xml'), err = doc.querySelector('parsererror');
    const out = { len: svg.length, head: svg.slice(0, 160), parseErr: err ? err.textContent.slice(0, 300) : null, pk: Object.keys(PX.cache).filter(k => k[0] === 's').length, pend: Object.keys(PX.pend).length };
    const imgs = [...document.querySelectorAll('img[data-pk]')].map(i => ({ cls: i.className, pk: i.dataset.pk, loaded: i.src.slice(0, 20), cached: !!PX.cache['s' + i.dataset.pk] && PX.cache['s' + i.dataset.pk].slice(0, 30) }));
    out.imgs = imgs.slice(0, 8); return out;
  });
  console.log(JSON.stringify(r, null, 1));
  await b.close();
})();
