// Renders a contact sheet of generated captains (portraits as they appear in the game) and a street cast sheet.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: +(process.env.DPR || 1) });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route(/fonts\./, r => r.abort());
  await p.goto('file://' + path.resolve(__dirname, 'gtd-test.html'));
  const names = (process.argv[2] || 'Gus,Zara,Mabel,Orion,Bex,Nyx,Tobias,Lyra,Quill,Marlowe,Pip,Dante,Ines,Kaz,Odette,Rufus,Sol,Willa,Yuri,Hector,Fern,Jax,Cleo,Boris').split(',');
  const out = process.argv[3] || 'shots/faces.png';
  await p.evaluate(([names]) => { document.body.innerHTML = '<div id="sheet" style="position:fixed;inset:0;z-index:99999;background:#2a2a40;display:flex;flex-wrap:wrap;gap:6px;padding:8px;overflow:auto"></div>';
    document.getElementById('sheet').innerHTML = names.map(n => { const c = CH.fromName(n, 0); return '<div style="width:130px;text-align:center;font:12px monospace;color:#fff">' + UI.portrait(c) + '<br>' + n + '<br>' + CH.SPECIES[c.sp].id + ' ' + c.gen + '</div>'; }).join(''); }, [names]);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: out }); console.log(errs.join('\n') || 'no errors'); await b.close();
})();
