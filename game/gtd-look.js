const L = require('./gtd-lib.js');
const tag = process.argv[2] || 'look', views = (process.argv[3] || 'market,cantina,enc,exchange,office,jobs').split(',');
(async () => {
  const t = await L.open({ width: 1920, height: 1080 }); const p = t.p;
  await p.waitForTimeout(800); await t.boot('Mabel', 'wayfarer', 1);
  const V = {
    market: () => { GT.buy(S, 0, 20); ui.page = 'market'; render(); },
    cantina: () => { ui.page = 'cantina'; render(); },
    enc: () => { ui.page = 'cantina'; render(); document.querySelector('[data-act=encounter]') && document.querySelector('[data-act=encounter]').click(); },
    exchange: () => { ui.page = 'exchange'; render(); },
    office: () => { ui.page = 'office'; render(); },
    jobs: () => { ui.page = 'jobs'; render(); },
    pad: () => { ui.page = 'pad'; render(); },
    ship: () => { ui.page = 'ship'; render(); },
    yard: () => { ui.page = 'yard'; render(); },
    quests: () => { ui.page = 'quests'; render(); },
    hub: () => { ui.page = 'hub'; render(); },
    alley: () => { ui.page = 'alley'; render(); },
    alleyx: () => { ui.page = 'alley'; render(); const b = document.querySelector('[data-act=explore]'); if (b) b.click(); },
    alleys: () => { S.visit.explored = true; S.visit.smuggle = GT.smuggleMake(S); ui.page = 'alley'; render(); },
    sneak: () => { ui.page = 'alley'; render(); },
  };
  for (const v of views) { if (!V[v]) continue; await p.evaluate(V[v]); await p.waitForTimeout(900); await t.shot(tag + '-' + v); }
  console.log(t.errs.join('\n') || 'no errors'); await t.close();
})();
