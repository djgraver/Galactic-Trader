const fs=require('fs');
const src=['gt-1-data.js','gt-2-market.js','gt-3-world.js','gt-4-social.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
const GT=new Function(src+'\nreturn GT;')();
GT.setRng(GT.seeded(5));
const s=GT.newState('wayfarer','x');
// equilibrium price table and best single-hop margins after tax
const P=GT.PLANETS,I=GT.ITEMS;
console.log('Equilibrium price table (credits)');
console.log('item'.padEnd(12)+P.map(p=>p.name.slice(0,8).padStart(9)).join(''));
I.forEach((it,i)=>console.log(it.name.padEnd(12)+P.map((p,k)=>String(Math.round(it.base*p.mult[i])).padStart(9)).join('')));
console.log('\nDistances / fuel (speed 1.4)');
P.forEach((a,x)=>console.log(a.name.padEnd(14)+P.map((b,y)=>x===y?'    -':String(GT.jumpCost(s,y)).padStart(5)).join('')));
// best margin per item (producer to consumer) and depth units
console.log('\nBest single-trip margin per item (cheapest -> dearest), units sellable at ~85% of dest price');
I.forEach((it,i)=>{const pr=P.map(p=>it.base*p.mult[i]);const lo=Math.min(...pr),hi=Math.max(...pr);const dest=P[pr.indexOf(hi)];const tgt=it.depth*Math.min(3.5,Math.max(.4,Math.pow(1/dest.mult[i],2.5)));
  console.log(it.name.padEnd(12),'buy',Math.round(lo),'sell',Math.round(hi),'margin',Math.round(hi-lo),'tgt stock at dest',Math.round(tgt),'-> per-visit profit ~',Math.round((hi-lo)*0.5*tgt*0.6));});
