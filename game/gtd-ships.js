const L = require('./gtd-lib.js');
(async () => {
  const t = await L.open({ width: 1920, height: 1080 });
  const p = t.p;
  await p.evaluate(() => {
    const d = document.createElement('div'); d.id = 'sheet'; d.style.cssText = 'position:fixed;inset:0;z-index:99999;background:radial-gradient(ellipse at 60% 40%,#1c2c64,#04060f 70%);display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:10px';
    d.innerHTML = GT.SHIPS.map(sh => '<div style="display:flex;align-items:center;justify-content:center">' + PX.svg(UI.shipSVG(sh.id, sh.hue), 224, 130, 'bs', 4, 40) + '</div>').join('');
    document.body.appendChild(d); PX.hydrate(d);
  });
  await p.waitForTimeout(1500); await t.shot('ships');
  console.log(t.errs.join('\n') || 'no errors'); await t.close();
})();
