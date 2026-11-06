const fs=require('fs');
const files=['gt-1-data.js','gt-2-market.js','gt-3-world.js','gt-3b-hooks.js','gt-4-social.js','gt-5-travel.js','gt-6-explore.js','gt-7a-encounter.js','gt-7b-encounter.js'];
const GT=new Function(files.map(f=>fs.readFileSync(f,'utf8')).join('\n')+'\nreturn GT;')();
console.log('travel events', GT.TRAVEL.length);
const ids=GT.PLANETS.map(p=>p.id);
ids.forEach(id=>{const x=GT.EXPLORE[id], e=GT.ENCOUNTER[id]; console.log(id.padEnd(9),'explore',x&&x.length,'encounter',e&&e.list.length,'who',e&&e.who);});
// expected value of one event of each pool, in multiples of the scale, ignoring items/fuel
function ev(list){let m=0;list.forEach(e=>{if(e.cr)m+=(e.cr[0]+e.cr[1])/2;});return m/list.length;}
console.log('mean money per travel event (x scale):',ev(GT.TRAVEL).toFixed(2));
ids.forEach(id=>console.log(id.padEnd(9),'explore mean',ev(GT.EXPLORE[id]).toFixed(2),'encounter mean',ev(GT.ENCOUNTER[id].list).toFixed(2)));
// every explore or encounter pool must hold both good and bad
ids.forEach(id=>{[GT.EXPLORE[id],GT.ENCOUNTER[id].list].forEach(l=>{const g=l.filter(e=>e.g>0).length,b=l.filter(e=>e.g<0).length;if(!g||!b||l.length<10)console.log('POOL PROBLEM',id,l.length,g,b);});});
// smoke test: drive the engine through a few hundred random actions
GT.setRng(GT.seeded(3)); const s=GT.newState('wayfarer','Tester');
for(let k=0;k<400&&!s.over;k++){ if(s.pending)GT.compAction(s,['sabotage','assist','ignore'][k%3]); GT.explore(s);GT.encounter(s); if(s.visit.offer)GT.buyFacility(s);
  const i=k%7,n=GT.maxBuy(s,i); if(n>0)GT.buy(s,i,Math.min(n,3)); GT.sell(s,i,s.cargo[i].qty); if(GT.canRefuel(s))GT.refuel(s,30);
  if(GT.canGamble(s))GT.gamble(s,k%4,50); const d=(s.loc+1+(k%6))%7; if(!GT.jump(s,d))GT.tow(s); }
console.log('smoke ok; turn',s.turn,'credits',Math.round(s.credits),'log',s.log.length,'over',s.over&&s.over.won);
console.log(s.log.slice(0,3).map(l=>l.text.replace(/<[^>]+>/g,'')).join('\n'));
