const L = require('./gtd-lib.js');
const tag = process.argv[2] || 'v6', night = process.argv[3] === 'n';
(async () => {
  const t = await L.open({ width: 1600, height: 900 });
  const p = t.p;
  await t.boot('Mabel', 'wayfarer', 1);
  const view = async (name, js) => { await p.evaluate(js); await p.waitForTimeout(1500); await t.shot(tag + '-' + name); };
  await view('hub', () => { S.visit = S.visit || {}; S.visit.night = false; ui.page = 'hub'; render(); });
  await view('bank', () => { ui.page = 'bank'; render(); });
  await view('cantina', () => { ui.page = 'cantina'; render(); });
  await view('ship', () => { ui.page = 'ship'; render(); });
  await view('pad', () => { ui.page = 'pad'; ui.dest = (S.loc + 2) % GT.PLANETS.length; render(); });
  console.log(t.errs.join('\n') || 'no errors'); await t.close();
})();
