// Shared Playwright helper for the v4 browser tests.
// There are no web fonts in the sandbox, so Press Start 2P (about 1em per glyph) and VT323 (about 0.4em) are imitated with a local mono face and size-adjust.
// That keeps text widths close to the real game, which is what the fit checks care about.
const { chromium } = require('playwright');
const path = require('path');
const FONTS = "@font-face{font-family:'Press Start 2P';src:local('DejaVu Sans Mono');size-adjust:166%}@font-face{font-family:'VT323';src:local('DejaVu Sans Mono');size-adjust:66%}";
// open({ file, width, height, dpr }) -> { b, p, errs, boot(name, shipId), shot(name) }
async function open(o = {}) {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: o.width || 1280, height: o.height || 800 }, deviceScaleFactor: o.dpr || 1 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load|403/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.goto('file://' + path.resolve(o.file || path.join(__dirname, 'gtd-test.html')));
  await p.addStyleTag({ content: FONTS });
  await p.waitForTimeout(250);
  const shotDir = o.shots || path.join(__dirname, 'shots');
  return {
    b, p, errs,
    // start a game through the real UI: name, ship, launch
    async boot(name = 'Gus', ship = 'wayfarer', n = 1) {
      await p.evaluate(([nm, sh, n]) => { ui.setup.n = n; ui.setup.p[0].name = nm; ui.setup.p[0].ship = sh; startGame(); }, [name, ship, n]);
      await p.waitForTimeout(250);
    },
    async shot(name, sel) { const f = path.join(shotDir, name + '.png'); if (sel) { const el = await p.$(sel); await el.screenshot({ path: f }); } else await p.screenshot({ path: f }); return f; },
    async close() { await b.close(); }
  };
}
module.exports = { open, FONTS };
