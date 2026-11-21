const L = require('./gtd-lib.js');
(async () => {
  const t = await L.open({ width: 1800, height: 1000 }); const p = t.p;
  await p.waitForTimeout(500);
  await p.evaluate(() => {
    const names = ['Mabel', 'Gus', 'Odile', 'Zara Vex', 'Brakka', 'Hesper', 'Ama', 'Toby', 'Quinn', 'Rook', 'Sol', 'Vera'];
    let h = '<div style="display:grid;grid-template-columns:repeat(12,140px);gap:6px;background:#123;padding:8px">';
    names.forEach(n => { const c = CH.fromName(n, 0); c.yaw = 0; h += '<div>' + CH.portrait(c) + '</div>'; });
    names.forEach(n => { const c = CH.fromName(n, 0); h += '<div>' + CH.portrait(c) + '</div>'; });
    names.forEach(n => { const c = CH.fromName(n, 0); c.yaw = -c.yaw || 0.45; h += '<div>' + CH.portrait(c) + '</div>'; });
    h += '</div>';
    document.body.innerHTML = h; document.querySelectorAll('svg').forEach(s => { s.style.width = '140px'; s.style.height = 'auto'; });
  });
  await p.waitForTimeout(500); await t.shot('faces');
  console.log(t.errs.join('\n') || 'no errors'); await t.close();
})();
