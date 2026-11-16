const L = require('./gtd-lib.js');
(async () => {
  const t = await L.open({ width: 1920, height: 1080 });
  const p = t.p;
  await t.boot('Mabel', 'wayfarer', 1);
  for (const [name, pids] of [['npcs1', ['meridoa', 'karthosu', 'ferrox', 'kryndor']], ['npcs2', ['nihil', 'quellin', 'halcyra']]]) {
    await p.evaluate((pids) => {
      let d = document.getElementById('sheet'); if (d) d.remove();
      d = document.createElement('div'); d.id = 'sheet'; d.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#223;display:flex;flex-wrap:wrap;gap:6px;padding:6px;align-content:flex-start';
      let h = '';
      pids.forEach(pid => { ['market', 'bank', 'yard', 'fuel', 'office', 'exchange', 'parlour'].forEach(role => { if (NP.row(pid, role)) h += '<div style="width:150px">' + UI.portrait(NP.char(pid, role)) + '</div>'; }); h += '<div style="width:150px">' + UI.portrait(NP.who2(pid)) + '</div>'; });
      if (pids[0] === 'nihil') { for (let i = 0; i < 4; i++) h += '<div style="width:150px">' + UI.portrait(NP.rival(i)) + '</div>'; ['Mabel', 'Gus', 'Zed', 'Ada', 'Bix'].forEach(n => h += '<div style="width:150px">' + UI.portrait(CH.fromName(n, 0)) + '</div>'); }
      d.innerHTML = h; document.body.appendChild(d); d.querySelectorAll('img,canvas').forEach(e => { e.style.width = '150px'; e.style.height = '244px'; }); PX.hydrate(d);
    }, pids);
    await p.waitForTimeout(2500);
    await p.evaluate(() => document.querySelectorAll('#sheet img, #sheet canvas').forEach(e => { e.style.width = '150px'; e.style.height = '244px'; }));
    await t.shot(name);
  }
  console.log(t.errs.join('\n') || 'no errors'); await t.close();
})();
