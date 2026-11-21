// Engine test for v10 quests and economy. node gtq-test.js
const fs = require('fs'), path = require('path');
const ENGINE = ['gt-1-data.js', 'gt-2-market.js', 'gt-3-world.js', 'gt-3b-hooks.js', 'gt-4-social.js', 'gt-5-travel.js', 'gt-6-explore.js', 'gt-7a-encounter.js', 'gt-7b-encounter.js', 'gt-10-extras.js', 'gt-31-smuggle.js', 'gt-32-stocks.js', 'gt-33-pax.js', 'gt-36-v7.js', 'gt-45-v10.js', 'gt-46-quests.js'].concat((process.env.EXTRA || '').split(',').filter(Boolean));
const src = ENGINE.filter(f => fs.existsSync(path.join(__dirname, f))).map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
const GT = new Function(src + '\nreturn GT;')();
GT.setRng(GT.seeded(42)); GT.rivalAtTarget = () => null; GT.CFG.WIN = 1e12;
const s = GT.newState('wayfarer', 'Tess');
const strip = t => t.replace(/<[^>]+>/g, '');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };
const P = id => GT.PLANETS.findIndex(p => p.id === id), I = id => GT.ITEMS.findIndex(i => i.id === id);
const hop = to => { if (s.loc === to) { const o = (to + 1) % 7; s.ship.fuel = s.ship.fuelMax; GT.jump(s, o, false, { event: null }); } s.ship.fuel = s.ship.fuelMax; const r = GT.jump(s, to, false, { event: null }); if (s.pending) s.pending = null; return r; };
// shares: buying does not move the price, no buy fee
const k = 3, px0 = s.stockMkt.px[k]; s.credits = 50000; const q = GT.buyStock(s, k, 100);
ok(q && s.stockMkt.px[k] === px0, 'buying 100 shares leaves price at ' + px0 + ' (now ' + s.stockMkt.px[k] + ')');
ok(Math.abs(GT.stockValue(s) - q.total) < 1, 'holding value equals what was paid');
// main quest: turn 1 -> nothing; go to turn 4
for (let t = 0; t < 4; t++) hop((s.loc + 1) % 7);
ok(s.questPrompt && s.questPrompt.kind === 'main' && s.questPrompt.ch === 0, 'chapter 1 opens at turn ' + s.turn);
let r = GT.mainChoose(s, 'oath'); ok(r && s.quests.main.ch === 1, 'chose oath: ' + strip(r.text).slice(0, 80));
hop(P('karthosu')); ok(s.questPrompt && s.questPrompt.ch === 1, 'chapter 2 prompt at Karth-Osu');
ok(GT.choiceReq(s, GT.MAIN[1].choices[0]) !== true, 'meds choice locked without medical: ' + GT.choiceReq(s, GT.MAIN[1].choices[0]));
s.cargo[I('medical')].qty = 8; r = GT.mainChoose(s, 'meds'); ok(r && s.cargo[I('medical')].qty === 0, 'handed over medical');
hop(P('nihil')); s.credits = 20000; r = GT.mainChoose(s, 'buy'); ok(r, 'vault bought');
hop(P('quellin')); s.cargo[I('darkmatter')].qty = 4; const sp0 = s.ship.speed; r = GT.mainChoose(s, 'share'); ok(r && s.ship.speed > sp0, 'Lane Sense warp ' + sp0 + ' -> ' + s.ship.speed);
hop(P('ferrox')); s.cargo[I('rations')].qty = 10; r = GT.mainChoose(s, 'science'); ok(r && s.ship.lv.shield === 1, 'anchor gives shield 1: ' + s.ship.lv.shield);
hop(P('halcyra')); s.ship.fuel = s.ship.fuelMax; r = GT.mainChoose(s, 'split'); ok(r && s.questPrompt && s.questPrompt.ch === 6, 'race chains to the Ark');
r = GT.mainChoose(s, 'hold'); ok(r && r.done && s.quests.main.state === 'done', 'finale: ' + strip(r.text).slice(0, 120));
// contracts
s.credits = 30000; s.visit.contracts = null;
for (let t = 0; t < 6; t++) { const offers = GT.contractOffers(s); offers.forEach(c => { if (GT.canAccept(s, c) === true) GT.acceptContract(s, c); }); hop((s.loc + 3) % 7); }
console.log('active', s.quests.active.map(c => c.kind + '->' + c.to + ' due ' + c.due).join(', '));
console.log('done', s.quests.done.map(c => (c.ok ? 'OK ' : 'FAIL ') + c.title).join(' | '));
// a haul delivered
const h = GT.makeContract(s, 'haul'); s.quests.active = []; s.quests.parcels = 0; GT.acceptContract(s, h); s.cargo[h.item].qty = h.qty; const c0 = s.credits; hop(h.to);
ok(s.credits - c0 >= h.pay * 0.9 && s.quests.active.length === 0, 'haul delivered for ' + h.pay + 'c');
// rep quest
s.rep = 30; ok(GT.repQuestState(s, GT.REPQ[0]) === 'open', 'guild open at rep 30'); GT.acceptRepQuest(s, 'guild'); s.cargo[I('rations')].qty = 15; hop(P('ferrox'));
ok(s.perks.guild === 1, 'guild card perk granted; tax ' + GT.taxInfo(s, s.loc).rate.toFixed(4));
// shield
s.ship.lv.shield = 3; let shielded = 0; s.credits = 1e6; for (let t = 0; t < 60; t++) { s.ship.fuel = s.ship.fuelMax; if (GT.wageDue(s)) GT.payWages(s); GT.jump(s, (s.loc + 1) % 7); if (s.pending) s.pending = null; }
ok(s.stats.shielded > 3, 'shield stopped ' + s.stats.shielded + ' bad events in 60 jumps');
// share drift over 60 turns
console.log('share prices', s.stockMkt.px.join(' '), 'from', GT.STOCKS.map(c => c.p0).join(' '));
console.log(fails ? fails + ' FAILED' : 'all passed');
