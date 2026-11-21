// v11 engine checks: lower quest and job pay, separate guild slot, play on after the race.
const fs = require('fs'), path = require('path');
const ENGINE = ['gt-1-data.js', 'gt-2-market.js', 'gt-3-world.js', 'gt-3b-hooks.js', 'gt-4-social.js', 'gt-5-travel.js', 'gt-6-explore.js', 'gt-7a-encounter.js', 'gt-7b-encounter.js', 'gt-10-extras.js', 'gt-31-smuggle.js', 'gt-32-stocks.js', 'gt-33-pax.js', 'gt-36-v7.js', 'gt-45-v10.js', 'gt-46-quests.js', 'gt-52-v11.js'];
const src = ENGINE.filter(f => fs.existsSync(path.join(__dirname, f))).map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
const GT = new Function(src + '\nreturn GT;')();
GT.setRng(GT.seeded(7));
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };
// pay
ok(GT.JOB_PAY[3] === 1.2 && GT.QUEST_PAY < 1, 'job gold pays 1.2x scale, quests pay x' + GT.QUEST_PAY);
// play on, solo
GT.CFG.WIN = 50000;
let G = GT.newGame([{ name: 'Ann', shipId: 'wayfarer' }], { target: 50000 }), s = GT.active(G);
s.credits = 60000; s.ship.fuel = s.ship.fuelMax; GT.jump(s, (s.loc + 1) % 7, false, { event: null });
ok(s.over && s.over.won, 'crossing the target on a jump wins');
ok(GT.endTurn(G) && G.over && G.over.won, 'the race ends at the end of the turn');
ok(GT.canPlayOn(G) && GT.playOn(G) && !G.over && !s.over && G.result && G.result.winner === 0, 'play on clears the end and keeps the result');
ok(/You won the race/.test(s.log[0].text), 'the win is logged: ' + s.log[0].text.replace(/<[^>]+>/g, ''));
s.comps[0].wealth = 1e9; s.credits = 1e7; s.ship.fuel = s.ship.fuelMax;
ok(GT.jump(s, (s.loc + 1) % 7, false, { event: null }) && !s.over, 'more money and a rich rival do not end it again');
ok(!GT.endTurn(G) && !G.over, 'the next turn goes on');
s.credits = 0; s.bank = 0; s.cargo.forEach(c => { c.qty = 0; }); s.quests.parcels = 0; s.quests.active = []; s.pax = []; s.ship.fuel = s.ship.fuelMax;
GT.jump(s, (s.loc + 1) % 7, false, { event: null }); GT.checkEnd(s);
ok(s.over && s.over.ruined, 'ruin still ends a captain after the race');
ok(GT.endTurn(G) && G.over && !GT.canPlayOn(G), 'and with nobody left there is no playing on');
// play on, rival win
G = GT.newGame([{ name: 'Bo', shipId: 'wayfarer' }], { target: 50000 }); s = GT.active(G); s.comps[1].wealth = 1e6; s.ship.fuel = s.ship.fuelMax;
GT.jump(s, (s.loc + 1) % 7, false, { event: null });
ok(s.over && s.over.rival && GT.endTurn(G) && G.over.rival, 'a rival can win the race');
ok(GT.playOn(G) && !s.over && G.result.rival, 'you can play on after losing to a rival');
// hot-seat
G = GT.newGame([{ name: 'A', shipId: 'wayfarer' }, { name: 'B', shipId: 'wayfarer' }], { target: 50000 });
let a = GT.active(G); a.credits = 60000; a.ship.fuel = a.ship.fuelMax; GT.jump(a, (a.loc + 1) % 7, false, { event: null });
ok(a.over && a.over.won && !GT.endTurn(G), 'hot-seat: the round carries on after a captain reaches the target');
let b = GT.active(G); b.ship.fuel = b.ship.fuelMax; GT.jump(b, (b.loc + 1) % 7, false, { event: null });
ok(GT.endTurn(G) && G.over && G.over.winner === a.seat, 'hot-seat: the race ends with the round');
const r0 = G.round; ok(GT.playOn(G) && G.round === r0 + 1 && G.order.length === 2, 'hot-seat: both captains play on into round ' + G.round);
// separate guild slot
s = GT.newState('wayfarer', 'Q'); s.rep = 40; let n = 0;
for (let k = 0; k < 20 && GT.contractsActive(s).length < 3; k++) { const c = GT.makeContract(s, 'parcel'); if (c && GT.acceptContract(s, c)) n++; }
const q = GT.REPQ.filter(x => GT.repQuestState(s, x) === 'open')[0];
ok(n === 3 && q && GT.acceptRepQuest(s, q.id) && GT.guildActive(s), 'three contracts plus a guild quest');
console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
