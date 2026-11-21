// Bots for the mini-game balance check (gt-mgsim.js). Each takes a skill { react, err, aim } and returns a per-frame function (G now, G as seen after the reaction delay, input, dt).
const KEYS9 = ['q', 'w', 'e', 'a', 's', 'd', 'z', 'x', 'c'];
const R = () => Math.random();
module.exports = {
  pests: sk => { let cool = 0; return (G, V, inp, dt) => {
    cool -= dt; if (cool > 0) return;
    const live = V.cells.map((c, i) => ({ c, i })).filter(o => o.c.kind && o.c.kind !== 3 && !o.c.hit);
    if (!live.length) return;
    live.sort((a, b) => (b.c.t / b.c.life) - (a.c.t / a.c.life));
    let i = live[0].i; if (R() < sk.err) { const cat = V.cells.findIndex(c => c.kind === 3); if (cat >= 0) i = cat; }
    inp.hits[KEYS9[i]] = true; cool = 0.1 + sk.aim / 100;
  }; },
  tomb: sk => { let cool = 0; return (G, V, inp, dt) => {
    cool -= dt; if (cool > 0) return;
    const sp = 230 + V.t * 7, minEta = [9, 9, 9], gems = [0, 0, 0];
    (V.obs || []).forEach(o => { const eta = (320 - o.y) / sp; if (eta < -0.18 || eta > 1.2) return; for (let l = 0; l < 3; l++) { if (Math.abs(o.lane - l) > 0.62) continue; if (o.kind === 'gem') { if (eta > 0.15) gems[l] += 1; } else minEta[l] = Math.min(minEta[l], eta); } });
    const cur = G.lane, need = 0.12 + sk.react * 0.5;
    const ok = l => { const lo = Math.min(l, cur), hi = Math.max(l, cur); for (let k = lo; k <= hi; k++) if (minEta[k] < (k === l ? 0.42 : need) && minEta[k] > -0.2) return false; return true; };
    let best = cur, bs = -1e9;
    for (let l = 0; l < 3; l++) { if (!ok(l) && l !== cur) continue; const sc = (ok(l) ? 0 : -100) + gems[l] * 2 - Math.abs(l - cur) * 0.5 + Math.min(1.5, minEta[l]); if (sc > bs) { bs = sc; best = l; } }
    if (R() < sk.err * 0.4) best = Math.floor(R() * 3);
    if (best < G.lane) { inp.hits.left = true; cool = 0.06 + sk.aim / 200; } else if (best > G.lane) { inp.hits.right = true; cool = 0.06 + sk.aim / 200; }
  }; },
  ore: sk => { let cool = 0; return (G, V, inp, dt) => {
    cool -= dt; if (cool > 0) return;
    let f = null; (V.q || []).forEach(o => { if (o.x > 20 && (!f || o.x > f.x)) f = o; }); if (!f) return;
    /* the item must still be at the front of the real belt */
    let g = null; (G.q || []).forEach(o => { if (o.x > 20 && (!g || o.x > g.x)) g = o; }); if (!g) return;
    let ore = f.ore; if (R() < sk.err) ore = !ore;
    if (ore) inp.hits.left = true; else inp.hits.right = true; cool = 0.12 + sk.aim / 120;
  }; },
  traffic: sk => { let cool = 0; return (G, V, inp, dt) => {
    cool -= dt; if (cool > 0 || G.stun > 0) return;
    const k = 1 + V.t * 0.012, lag = sk.react, step = 0.1 + sk.aim / 150;
    /* is the cell (row, col) clear of cars from t0 to t1 seconds from now? */
    const clear = (row, col, t0, t1) => { if (row <= 0 || row >= 9) return true; const l = V.lanes[row - 1], x0 = col * 40 + 8, x1 = col * 40 + 32; return !l.cars.some(c => { for (let t = t0; t <= t1; t += 0.04) { let cx = c.x + l.dir * l.sp * k * (t + lag); if (l.dir > 0 && cx > 660) cx -= 670 + c.w; if (l.dir < 0 && cx < -c.w - 20) cx += 670 + c.w; if (x1 > cx + 2 && x0 < cx + c.w - 2) return true; } return false; }); };
    const hold = step + 0.35;
    if (clear(G.py - 1, G.px, 0, hold)) { inp.hits.up = true; cool = step; return; }
    if (!clear(G.py, G.px, 0, 0.3)) { for (const d of [1, -1]) if (G.px + d >= 0 && G.px + d <= 15 && clear(G.py, G.px + d, 0, 0.4)) { inp.hits[d > 0 ? 'right' : 'left'] = true; cool = step; return; } if (clear(G.py + 1, G.px, 0, 0.5)) { inp.hits.down = true; cool = step; return; } }
    /* slide toward a column where the next lane opens sooner */
    for (const d of [1, -1]) if (G.px + d >= 0 && G.px + d <= 15 && clear(G.py, G.px + d, 0, hold) && clear(G.py - 1, G.px + d, step, step + hold)) { inp.hits[d > 0 ? 'right' : 'left'] = true; cool = step; return; }
  }; },
  debris: sk => { let tx = 320, jit = 0; return (G, V, inp, dt) => {
    let tgt = null; (V.junk || []).forEach(j => { if (j.y < 330 && (!tgt || j.y > tgt.y)) tgt = j; });
    let danger = (V.junk || []).filter(j => j.y > 250 && j.y < 380 && Math.abs(j.x - G.x) < j.r + 30);
    if (danger.length && R() > sk.err) { const d = danger[0]; tx = d.x > G.x ? d.x - d.r - 50 : d.x + d.r + 50; }
    else if (tgt) { tx = tgt.x + tgt.vx * ((365 - tgt.y) / 620); }
    jit += (R() - 0.5) * sk.aim * 0.6; jit *= 0.9;
    const T = Math.max(28, Math.min(612, tx + jit)); inp.mouse = false; inp.keys.left = T < G.x - 6; inp.keys.right = T > G.x + 6;
  }; },
  catch: sk => { let jit = 0; return (G, V, inp, dt) => {
    const spd = 460 * 1.7; let best = null, bs = -1e9;
    (V.ps || []).forEach(p => { if (p.dead) return; const eta = (350 - p.y) / p.vy; if (eta < 0 || eta > 1.6) return; const val = p.k === 'bad' ? -1 : p.k === 'gold' ? 3 : p.k === 'flick' ? 1.5 : 1; if (val < 0) return; const reach = Math.abs(p.x - G.x) / spd; if (reach > eta + 0.05) return; const sc = val * 2 - eta; if (sc > bs) { bs = sc; best = p; } });
    let tx = best ? best.x : G.x;
    (V.ps || []).forEach(p => { if (p.k !== 'bad') return; const eta = (350 - p.y) / p.vy; if (eta > 0 && eta < 0.35 && Math.abs(p.x - tx) < 58 && R() > sk.err) tx = p.x + (tx >= p.x ? 70 : -70); });
    jit += (R() - 0.5) * sk.aim * 0.5; jit *= 0.9; const T = Math.max(46, Math.min(594, tx + jit)); inp.mouse = false; inp.keys.left = T < G.x - 6; inp.keys.right = T > G.x + 6;
  }; },
  cloud: sk => { let jit = 0; return (G, V, inp, dt) => {
    const sp = 220 + V.t * 4; let ring = null;
    (V.obj || []).forEach(o => { if (o.k !== 'ring' || o.dead || o.x < 112) return; const tt = (o.x - 120) / sp; if (Math.abs(o.y - G.y) > 60 + 330 * tt) return; if (!ring || o.x < ring.x) ring = o; });
    let ty = ring ? ring.y : 200;
    (V.obj || []).forEach(o => { if (o.k === 'storm' && o.x > 70 && o.x < 300 && Math.abs(o.y - ty) < 55) ty = o.y + (ty >= o.y ? 64 : -64); });
    jit += (R() - 0.5) * sk.aim; jit *= 0.9;
    const err = (G.y - (ty + jit)) + G.vy * 0.2; inp.keys.space = err > 0;
  }; },
  sneak: sk => { let cool = 0; return (G, V, inp, dt) => {
    cool -= dt; if (cool > 0) return;
    if (!V.face && !V.warn || (R() < sk.err * 0.2)) { inp.hits.space = true; cool = 0.11 + sk.aim / 300; }
  }; },
  hack: sk => { let cool = 0.3; return (G, V, inp, dt) => {
    cool -= dt; if (cool > 0 || !G.code) return;
    let k = G.code[G.pos]; if (R() < sk.err * 0.5) k = ['up', 'down', 'left', 'right'][Math.floor(R() * 4)];
    inp.hits[k] = true; cool = 0.13 + sk.react * 0.35 + sk.aim / 200 + (G.pos === 0 ? sk.react : 0);
  }; },
  vent: sk => (G, V, inp, dt) => {
    const spd = 140 + G.runs * 15, fast = 1 + G.runs * 0.25; let go = true;
    for (const b of V.beams) {
      const d = b.x - G.x;
      if (Math.abs(d) <= 40) { go = true; break; }            /* never stop under a light */
      if (d < 0 || d > 75) continue;                           /* only the next light matters */
      const need = (d + 42) / spd + 0.12 + sk.react * 0.4;     /* time to get clear past it */
      const left = b.st === 'off' ? b.t / fast : b.st === 'warn' ? 0 : -1;
      go = left >= need; break;
    }
    if (R() < sk.err * 0.02) go = !go;
    inp.keys.right = go; inp.keys.left = false;
  }
};
