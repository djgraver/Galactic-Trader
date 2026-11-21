// Mini-game balance: plays each odd job with bots of different skill and prints score percentiles against the Bronze/Silver/Gold goals.
// node gt-mgsim.js [runs] [file...]   (default: the v10 games in gt-51-mg10.js)
const fs = require('fs'), path = require('path');
const RUNS = +process.argv[2] || 40, files = process.argv.slice(3);
const stub = `var window={matchMedia(){return {matches:false}}};var document={addEventListener(){},removeEventListener(){},getElementById(){return null},createElement(){return {getContext(){return null}}}};var $=function(){return null};var SFX={play(){}};var PX={};var UI={};var G3={draw(){}};var esc=s=>s;var S={};
var GT={seeded:function(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};},RATINGS:['Flop','Bronze','Silver','Gold'],JOB_PAY:[0,1,2,3],scale(){return 1}};`;
const list = files.length ? files : ['gt-18-mg.js', 'gt-19-mg2.js', 'gt-51-mg10.js', 'gt-53-v11mg.js'];
const src = stub + list.map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n') + '\nreturn MG;';
const MG = new Function(src)();
// a bot sees the game state with a reaction delay and makes mistakes now and then. skill: {react: seconds, err: chance of a wrong move, speed: hand speed}
const SK = { great: { react: 0.2, err: 0.03, aim: 6 }, good: { react: 0.28, err: 0.07, aim: 12 }, casual: { react: 0.4, err: 0.14, aim: 22 } };
const BOTS = require('./gt-mgbots.js');
function play(id, sk, seed) {
  let s = seed; Math.random = function () { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const g = MG.games[id], G = { t: 0, score: 0, fx: [], shake: 0 }; if (g.init) g.init(G);
  const inp = { x: 320, y: 200, down: false, keys: {}, hits: {}, taps: [], mouse: true }, dt = 1 / 60, bot = BOTS[id](sk), hist = [];
  while (G.t < g.dur && !G.over) {
    hist.push(JSON.parse(JSON.stringify(G, (k, v) => k === 'fx' || k === 'parts' ? undefined : v)));
    const lag = Math.max(0, hist.length - 1 - Math.round(sk.react / dt)), seen = hist[lag];
    if (hist.length > 200) hist.shift();
    bot(G, seen, inp, dt);
    G.t += dt; g.update(G, dt, inp); inp.hits = {}; inp.taps = [];
  }
  return g.perf ? Math.round(g.perf(G) * 100) : Math.max(0, Math.round(G.score));
}
const pct = (a, p) => { a = a.slice().sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(p * a.length))]; };
for (const id of Object.keys(BOTS)) {
  const g = MG.games[id]; if (!g) continue; const row = [];
  for (const k of ['casual', 'good', 'great']) { const sc = []; for (let r = 0; r < RUNS; r++) sc.push(play(id, SK[k], 1000 + r * 77)); row.push(k + ' ' + pct(sc, 0.25) + '/' + pct(sc, 0.5) + '/' + pct(sc, 0.75)); }
  console.log(id.padEnd(8), ('goals ' + g.goals.join('/')).padEnd(20), row.join('  |  '));
}
