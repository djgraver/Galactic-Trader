// Finds text whose colour is too close to what is behind it. Reports the worst offenders per page.
const L = require('./gtd-lib.js');
(async () => {
  const t = await L.open({ width: 1920, height: 1080 });
  const p = t.p;
  const audit = () => p.evaluate(() => {
    const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
    const parse = s => { const m = /rgba?\(([^)]+)\)/.exec(s); if (!m) return null; const a = m[1].split(',').map(parseFloat); return [a[0], a[1], a[2], a.length > 3 ? a[3] : 1]; };
    const bgOf = el => { for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); const im = cs.backgroundImage; if (im && im !== 'none') { const all = im.match(/rgba?\([^)]+\)|#[0-9a-f]{3,8}/gi) || []; const cols = all.map(parse).filter(c => c && c[3] > 0.5); if (cols.length) { return cols.reduce((a, c) => [a[0] + c[0] / cols.length, a[1] + c[1] / cols.length, a[2] + c[2] / cols.length], [0, 0, 0]); } } const c = parse(cs.backgroundColor); if (c && c[3] > 0.5) return c; } return [5, 7, 13]; };
    const out = {}; const w = document.createTreeWalker(document.getElementById('frame'), NodeFilter.SHOW_TEXT);
    while (w.nextNode()) { const n = w.currentNode; if (!n.nodeValue.trim()) continue; const el = n.parentElement; const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue; const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity < 0.3) continue; const fg = parse(cs.color); if (!fg || fg[3] < 0.3) continue; const bg = bgOf(el); const a = lum(fg) + 0.05, b = lum(bg) + 0.05, ratio = Math.max(a, b) / Math.min(a, b);
      if (ratio < 3.2) { const key = (el.className && typeof el.className === 'string' ? el.tagName + '.' + el.className.split(' ').join('.') : el.tagName) + ' < ' + (el.parentElement.className || el.parentElement.tagName); if (!out[key]) out[key] = ratio.toFixed(1) + ' "' + n.nodeValue.trim().slice(0, 24) + '" fg ' + fg.slice(0, 3).map(Math.round) + ' bg ' + bg.slice(0, 3).map(Math.round); } }
    return out;
  });
  const show = async (name) => { await p.waitForTimeout(250); const r = await audit(); const k = Object.keys(r); if (k.length) { console.log('== ' + name); k.slice(0, 40).forEach(x => console.log('  ' + x + ' : ' + r[x])); } };
  await show('start');
  await t.boot('Mabel', 'wayfarer', 1);
  await p.evaluate(() => { GT.buy(S, 0, 10); S.wage.next = S.turn; GT.wageTick(S); });
  for (const pg of ['hub', 'market', 'bank', 'cantina', 'jobs', 'ship', 'pad', 'exchange', 'yard', 'fuel', 'office', 'alley', 'parlour', 'log']) { await p.evaluate((pg) => { ui.page = pg; ui.dest = (S.loc + 2) % 7; try { render(); } catch (e) { console.log('render fail ' + pg); } }, pg); await show(pg); }
  await p.evaluate(() => { showInfo && showInfo(); }).catch(() => {}); await show('info');
  console.log(t.errs.join('\n') || 'no errors'); await t.close();
})();
