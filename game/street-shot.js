const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1320, height: 1500 } });
const errs=[]; p.on('pageerror', e => errs.push(e.stack.split('\n').slice(0,4).join(' | '))); p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
await p.goto('file://' + __dirname + '/street-test.html'); await p.waitForTimeout(500);
const night = process.argv[2] === 'night'; if (night) await p.evaluate(() => run(true)); await p.waitForTimeout(300);
const only = process.argv[3]; 
await p.screenshot({ path: 'shots/street-' + (night ? 'night' : 'day') + '.png', fullPage: true }); console.log(errs.length ? errs : 'ok'); await b.close(); })();
