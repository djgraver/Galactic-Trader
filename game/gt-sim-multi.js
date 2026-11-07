// Multiplayer balance simulator. Usage: node gt-sim-multi.js [games] [players] [target] ; env SHIPS="wayfarer,barge,..." SOLO=1 for the single-captain comparison
const fs = require('fs'), path = require('path'), makeBot = require('./gt-bot.js');
const files = ['gt-1-data.js', 'gt-2-market.js', 'gt-3-world.js', 'gt-3b-hooks.js', 'gt-4-social.js', 'gt-5-travel.js', 'gt-6-explore.js', 'gt-7a-encounter.js', 'gt-7b-encounter.js', 'gt-10-extras.js'];
const src = files.map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
const GAMES = +process.argv[2] || 20, NP = +process.argv[3] || 4, TARGET = +process.argv[4] || 150000;
const SHIPS = (process.env.SHIPS || 'wayfarer,barge,stargazer,cutlass').split(',');
const rounds = [], winners = [], nws = [];
const bySeat = {}; let wins = 0, bust = 0;
for (let g = 1; g <= GAMES; g++) {
  const GT = new Function(src + '\nreturn GT;')(), bot = makeBot(GT);
  GT.setRng(GT.seeded(g * 7919));
  const list = []; for (let k = 0; k < NP; k++) list.push({ shipId: SHIPS[(k + g) % SHIPS.length], name: 'P' + k });
  const G = GT.newGame(list, { target: TARGET, depth: process.env.DEPTH === undefined ? undefined : +process.env.DEPTH });
  let guard = 0;
  while (!G.over && guard++ < 6000) {
    const s = GT.active(G);
    if (!s) break;
    if (!s.over) { const ok = (process.env.BOT === 'smart' ? bot.turn(s) : bot.turnHuman(s)); if (!ok && !s.over) { s.over = { won: false, why: 'stuck' }; } }
    GT.checkEnd(s); // jump already did; keeps behaviour explicit
    GT.endTurn(G);
  }
  rounds.push(G.round);
  if (G.over && G.over.winner >= 0) { const w = G.players[G.over.winner]; winners.push(w.shipId); wins++; bySeat[G.over.winner] = (bySeat[G.over.winner] || 0) + 1; }
  G.players.forEach(p => { if (p.over && !p.over.won) bust++; nws.push(Math.round(GT.networth(p))); });
}
rounds.sort((a, b) => a - b);
const q = p => rounds[Math.min(rounds.length - 1, Math.floor(p * rounds.length))];
const wc = {}; winners.forEach(s => wc[s] = (wc[s] || 0) + 1);
console.log(`players ${NP} target ${TARGET}: games won ${wins}/${GAMES}; rounds p25 ${q(.25)} med ${q(.5)} p75 ${q(.75)} max ${q(1)}; busts ${bust}; wins by ship`, JSON.stringify(wc), 'by seat', JSON.stringify(bySeat));
