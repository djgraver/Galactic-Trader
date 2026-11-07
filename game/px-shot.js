const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 980, height: 620 } });
const errs=[]; p.on('pageerror', e => errs.push(e.message)); await p.goto('file://' + __dirname + '/px-test.html'); await p.waitForTimeout(300);
await p.screenshot({ path: 'shots/px-test.png' }); console.log(errs.length ? errs : 'ok'); await b.close(); })();
