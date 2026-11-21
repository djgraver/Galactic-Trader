const L = require('./gtd-lib.js');
(async () => {
  const t = await L.open({ width: 1920, height: 1080 }); const p = t.p;
  await p.waitForTimeout(800); await t.boot('Mabel', 'wayfarer', 1);
  const trips = [[0, 6, 'shield'], [6, 0, 'none'], [3, 2, 'bad'], [2, 4, 'good']];
  for (const [a, b, kind] of trips) {
    await p.evaluate(([a, b, kind]) => {
      S.loc = a; S.ship.fuel = S.ship.fuelMax; S.pending = null; S.questPrompt = null; ui.page = 'pad'; ui.dest = b; render();
      var pe = GT.pickEntry; if (kind === 'shield') { S.ship.lv.shield = 3; GT.rand = () => 0.01; GT.pickEntry = (l) => l === GT.TRAVEL ? GT.TRAVEL.filter(x => x.g < 0)[0] : pe(l); }
      const top = S.log[0];
      const ev = kind === 'bad' ? GT.TRAVEL.filter(x => x.g < 0)[0] : kind === 'good' ? GT.TRAVEL.filter(x => x.g > 0)[0] : kind === 'none' ? null : undefined;
      const opts = ev === undefined ? undefined : { event: ev, noEvade: true };
      GT.jump(S, b, false, opts); GT.pickEntry = pe; delete GT.rand; GT.rand = function () { return Math.random(); };
      FL.run(a, b, newLogs(top), function () {});
    }, [a, b, kind]);
    await p.waitForTimeout(3300); await t.shot('warp-' + a + '-' + b + '-' + kind);
    console.log(kind, await p.evaluate(() => document.getElementById('fl-tick') && document.getElementById('fl-tick').textContent));
    await p.evaluate(() => { const el = $('flight'); el.click(); }); await p.waitForTimeout(400); await t.shot('warp-' + a + '-' + b + '-' + kind + '-card');
    await p.evaluate(() => { const b = document.querySelector('#flight [data-act]'); if (b) b.click(); const c = document.querySelector('#flight [data-act]'); if (c) c.click(); });
    await p.waitForTimeout(300);
  }
  console.log(t.errs.join('\n') || 'no errors'); await t.close();
})();
